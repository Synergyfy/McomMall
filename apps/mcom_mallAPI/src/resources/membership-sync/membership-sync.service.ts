import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { Membership } from '../membership/entities/membership.entity';
import { CentralMembershipGrant } from '../membership/entities/central-membership-grant.entity';
import { PlanType } from '../membership/dto/initiate-membership-payment.dto';
import { Plan } from '../plans/entities/plan.entity';
import { PlanVariant } from '../plans/entities/plan-variant.entity';
import { PlanTier } from '../plans/enums/plan-tier.enum';
import { PlanExpiryService } from '../plans/services/plan-expiry.service';
import { ProfileSyncService } from '../profile-sync/profile-sync.service';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { MembershipSyncEvent } from './entities/membership-sync-event.entity';

/** Signals that should be applied to the local membership state. */
const SUPPORTED_EVENTS = new Set(['membership.updated']);

/** A `processing` row older than this is assumed abandoned and may be retried. */
const PROCESSING_STALE_MS = 2 * 60_000;

/**
 * Statuses that revoke access. Anything else that is not explicitly revoked is
 * treated as active so a cosmetic Central status rename cannot lock businesses
 * out of a membership they have paid for.
 */
const REVOKE_STATUSES = new Set([
  'expired',
  'cancelled',
  'canceled',
  'inactive',
  'revoked',
  'suspended',
  'declined',
  'failed',
  'terminated',
]);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Failure that will never succeed on retry. Central is acknowledged with 200
 * so it stops retrying (e.g. the event carries no user id at all).
 */
class PermanentMembershipSyncError extends Error {
  constructor(
    readonly reason: string,
    message: string,
  ) {
    super(message);
    this.name = 'PermanentMembershipSyncError';
  }
}

/**
 * The event is valid but the bundled Central plan is not mapped to a local
 * plan variant. This is a configuration error: fail the delivery so it shows
 * up in Central's dead-letter queue where an operator can replay it after the
 * mapping is fixed, instead of silently granting nothing.
 */
class UnmappedPlanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnmappedPlanError';
  }
}

interface MembershipEnvelope {
  event: string;
  userId: string;
  eventId: string;
  occurredAt: Date | null;
  businessId: string | null;
  membership: Record<string, any>;
  pkg: Record<string, any>;
  raw: Record<string, unknown>;
}

interface EventClaim {
  record: MembershipSyncEvent;
  duplicate: boolean;
  inProgress: boolean;
}

export interface MembershipSyncOutcome {
  event: string;
  userId: string;
  duplicate: boolean;
  ignored?: boolean;
  reason?: string;
  applied?: {
    action: 'activated' | 'revoked' | 'unchanged';
    localUserId: string;
    planVariantId: string | null;
    expiresAt: string | null;
  };
}

function isUniqueViolation(err: any): boolean {
  return err?.code === '23505' || err?.driverError?.code === '23505';
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalise(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/**
 * Receives Central's `membership.updated` event and applies the bundled plan
 * to the local account.
 *
 * When a business buys a Central membership that includes this app, Central
 * provisions the matching platform package and POSTs the event here. The
 * payload names the package (`externalPlanId` / `packageName`) and its expiry;
 * this service maps it onto a local `plan_variants` row and stores the CHS
 * grant until that expiry. `expired` / `cancelled` / `inactive` events revoke
 * the grant.
 *
 * The grant is stored in `mcom_central_membership_grants`, separate from the
 * single `memberships` row, so it can never overwrite a plan the business
 * bought directly from the Mall. `MembershipService.resolveEffectiveMembership`
 * uses the direct plan first, then this grant, then an active trial.
 *
 * No charge is created here: Central owns the billing relationship. A mirrored
 * membership row (for Central-only users) is a grant only (`autoRenew = false`,
 * `renewalMethod = central_membership`) so the mall's renewal cron can never
 * double-debit the customer.
 */
@Injectable()
export class MembershipSyncService {
  private readonly logger = new Logger(MembershipSyncService.name);

  constructor(
    @InjectRepository(MembershipSyncEvent)
    private readonly events: Repository<MembershipSyncEvent>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Membership)
    private readonly memberships: Repository<Membership>,
    @InjectRepository(CentralMembershipGrant)
    private readonly grants: Repository<CentralMembershipGrant>,
    @InjectRepository(PlanVariant)
    private readonly variants: Repository<PlanVariant>,
    @InjectRepository(Plan)
    private readonly plans: Repository<Plan>,
    private readonly profileSync: ProfileSyncService,
    private readonly planExpiry: PlanExpiryService,
    private readonly configService: ConfigService,
  ) {}

  /** Secret Central used to sign the delivery. Prefer a dedicated secret. */
  getWebhookSecret(): string {
    return (
      this.configService.get<string>('MCOM_MEMBERSHIP_WEBHOOK_SECRET') ||
      this.configService.get<string>('MCOM_WEBHOOK_SECRET') ||
      this.configService.get<string>('MCOM_HMAC_SECRET') ||
      this.configService.get<string>('SSO_WEBHOOK_SECRET') ||
      ''
    );
  }

  async handleIncomingEvent(payload: any): Promise<MembershipSyncOutcome> {
    const envelope = this.parseEnvelope(payload);

    if (!SUPPORTED_EVENTS.has(envelope.event)) {
      this.logger.log(
        `Ignoring unsupported membership sync event "${envelope.event}" for ${envelope.userId}`,
      );
      return {
        event: envelope.event,
        userId: envelope.userId,
        duplicate: false,
        ignored: true,
        reason: 'unsupported_event',
      };
    }

    const claim = await this.claimEvent(envelope);

    if (claim.duplicate) {
      this.logger.log(
        `Duplicate membership sync event ${envelope.eventId} for ${envelope.userId} ` +
          `(status=${claim.record.status})`,
      );
      return {
        event: envelope.event,
        userId: envelope.userId,
        duplicate: true,
        ignored: claim.inProgress,
        reason: claim.inProgress ? 'in_progress' : 'already_processed',
      };
    }

    try {
      const applied = await this.applyMembership(envelope);
      await this.finaliseEvent(claim.record.id, 'completed');
      this.logger.log(
        `Applied Central membership ${envelope.eventId} for ${envelope.userId}: ` +
          `${applied.action}` +
          (applied.planVariantId ? ` (variant ${applied.planVariantId})` : '') +
          (applied.expiresAt ? ` until ${applied.expiresAt}` : ''),
      );
      return {
        event: envelope.event,
        userId: envelope.userId,
        duplicate: false,
        applied,
      };
    } catch (error) {
      if (error instanceof PermanentMembershipSyncError) {
        await this.finaliseEvent(claim.record.id, 'skipped', error.message);
        this.logger.warn(
          `Skipped Central membership ${envelope.userId}: ${error.message}`,
        );
        return {
          event: envelope.event,
          userId: envelope.userId,
          duplicate: false,
          ignored: true,
          reason: error.reason,
        };
      }

      const message = error instanceof Error ? error.message : String(error);
      await this.finaliseEvent(claim.record.id, 'failed', message);
      this.logger.error(
        `Membership sync failed for ${envelope.userId}; asking Central to retry: ${message}`,
      );
      throw new ServiceUnavailableException(
        'Membership sync temporarily failed; Central should retry',
      );
    }
  }

  /**
   * Apply one envelope to the local membership row. Idempotent: safe to run
   * for every delivery.
   */
  async applyMembership(
    envelope: MembershipEnvelope,
  ): Promise<NonNullable<MembershipSyncOutcome['applied']>> {
    const user = await this.resolveLocalUser(envelope.userId);

    const status = this.resolveStatus(envelope);
    const revoke = REVOKE_STATUSES.has(status);

    if (revoke) {
      const revoked = await this.revokeMembership(user, envelope, status);
      return {
        action: revoked ? 'revoked' : 'unchanged',
        localUserId: user.id,
        planVariantId: revoked?.planVariantId ?? null,
        expiresAt: revoked?.expiresAt ? revoked.expiresAt.toISOString() : null,
      };
    }

    const variant = await this.resolvePlanVariant(envelope);
    if (!variant) {
      throw new UnmappedPlanError(
        `Central package "${this.describePackage(envelope)}" is not mapped to a local plan variant. ` +
          'Set plan_variants.external_plan_id (or MCOM_MEMBERSHIP_PLAN_MAP) and replay the event.',
      );
    }

    const membershipData = envelope.membership;
    const startDate = parseDate(membershipData.startsAt) ?? new Date();
    const expiresAt =
      parseDate(membershipData.expiresAt) ??
      parseDate(envelope.pkg.expiresAt) ??
      this.computeExpiry(startDate, variant, membershipData);

    const saved = await this.upsertMembership({
      user,
      variant,
      startDate,
      expiresAt,
      status,
      membershipData,
      envelope,
    });

    SubscriptionGuard.clearCache(envelope.userId);
    SubscriptionGuard.clearCache(user.id);

    return {
      action: 'activated',
      localUserId: user.id,
      planVariantId: saved.planVariantId,
      expiresAt: saved.expiresAt ? saved.expiresAt.toISOString() : null,
    };
  }

  // ---------------------------------------------------------------------------
  // Central entitlement write
  // ---------------------------------------------------------------------------

  private async upsertMembership(input: {
    user: User;
    variant: PlanVariant;
    startDate: Date;
    expiresAt: Date;
    status: string;
    membershipData: Record<string, any>;
    envelope: MembershipEnvelope;
  }): Promise<{
    planVariantId: string;
    expiresAt: Date;
    membershipRowUpdated: boolean;
  }> {
    const { user, variant, startDate, expiresAt, status, membershipData } =
      input;

    const grant = await this.upsertGrant(input);

    // Mirror the grant into `memberships` only when that row is Central-owned
    // or absent. A plan the business bought directly from the Mall (or an
    // active trial) must never be replaced by a CHS grant: the grant waits in
    // its own row and takes over when the Mall plan expires.
    const membershipRowUpdated = await this.syncCentralMembershipRow({
      user,
      variant,
      startDate,
      expiresAt,
      status,
      membershipData,
    });

    return {
      planVariantId: grant.planVariantId,
      expiresAt: grant.expiresAt,
      membershipRowUpdated,
    };
  }

  private async upsertGrant(input: {
    user: User;
    variant: PlanVariant;
    startDate: Date;
    expiresAt: Date;
    status: string;
    membershipData: Record<string, any>;
    envelope: MembershipEnvelope;
  }): Promise<CentralMembershipGrant> {
    const {
      user,
      variant,
      startDate,
      expiresAt,
      status,
      membershipData,
      envelope,
    } = input;

    // One CHS membership per user. A Central update refreshes it in place.
    const prior = await this.grants.findOne({ where: { userId: user.id } });
    const grant = prior ?? this.grants.create();

    grant.userId = user.id;
    grant.user = { id: user.id } as User;
    grant.centralUserId = envelope.userId;
    grant.planVariant = variant;
    grant.planVariantId = variant.id;
    grant.isActive = true;
    grant.status = status || 'active';
    grant.startsAt = startDate;
    grant.expiresAt = expiresAt;
    grant.planType = this.resolvePlanType(membershipData);
    grant.membershipPlanName =
      (membershipData.planName as string) ??
      (membershipData.planId as string) ??
      null;
    grant.packageName =
      (envelope.pkg.packageName as string) ??
      (envelope.pkg.name as string) ??
      null;
    grant.externalPlanId =
      (envelope.pkg.externalPlanId as string) ??
      (membershipData.planId as string) ??
      null;
    grant.lastEventId = envelope.eventId;
    grant.lastSyncedAt = new Date();
    grant.metadata = {
      businessId: envelope.businessId,
      membership: membershipData,
      package: envelope.pkg,
    };

    return this.grants.save(grant);
  }

  /**
   * Keep the legacy single membership row in step with Central *only* while
   * Central owns it. Central-only users still need a row for the existing
   * billing/UI reads; a Mall purchase overwrites it on purpose and from then
   * on the grant above is the fallback.
   */
  private async syncCentralMembershipRow(input: {
    user: User;
    variant: PlanVariant;
    startDate: Date;
    expiresAt: Date;
    status: string;
    membershipData: Record<string, any>;
  }): Promise<boolean> {
    const { user, variant, startDate, expiresAt, status, membershipData } =
      input;

    const prior = await this.memberships.findOne({
      where: { user: { id: user.id } },
      order: { created_at: 'DESC' },
    });

    if (prior && prior.renewalMethod !== 'central_membership') {
      this.logger.log(
        `Preserving Mall-owned plan for user ${user.id}; CHS grant stored separately`,
      );
      return false;
    }

    const membership = prior ?? this.memberships.create();

    membership.user = { id: user.id } as User;
    membership.planVariant = variant;
    membership.planVariantId = variant.id;
    // Central prices the package; this app must not hold a local price snapshot.
    membership.priceId = null;
    membership.startDate = startDate;
    membership.expiresAt = expiresAt;
    membership.endDate = expiresAt;
    membership.isActive = true;
    membership.isTrial = false;
    membership.trialDuration = 0;
    membership.planType = this.resolvePlanType(membershipData);

    // Central owns billing for bundled memberships. Never auto-renew locally.
    membership.autoRenew = false;
    membership.renewalStatus = status || 'active';
    membership.nextChargeAt = null;
    membership.renewalAttempts = 0;
    membership.renewalMethod = 'central_membership';
    membership.renewalAmount =
      typeof membershipData.amount === 'number'
        ? membershipData.amount
        : membershipData.amount != null
          ? Number(membershipData.amount)
          : null;
    membership.renewalCurrency = String(
      membershipData.currency || 'GBP',
    ).toUpperCase();

    await this.memberships.save(membership);
    return true;
  }

  private async revokeMembership(
    user: User,
    envelope: MembershipEnvelope,
    status: string,
  ): Promise<{ planVariantId: string | null; expiresAt: Date | null } | null> {
    let changed = false;
    let planVariantId: string | null = null;
    let expiresAt: Date | null = null;

    // Revoke the CHS grant whether or not a legacy membership row exists.
    const grant = await this.grants.findOne({ where: { userId: user.id } });
    if (grant) {
      planVariantId = grant.planVariantId;
      expiresAt = grant.expiresAt;
      if (grant.isActive || grant.status !== status) {
        grant.isActive = false;
        grant.status = status;
        grant.lastEventId = envelope.eventId;
        grant.lastSyncedAt = new Date();
        await this.grants.save(grant);
        changed = true;
      }
    }

    const membership = await this.memberships.findOne({
      where: { user: { id: user.id } },
      order: { created_at: 'DESC' },
    });

    // Never let a Central expiry remove a membership the Mall sold itself.
    // A Central membership activation stamps this marker, so this also
    // prevents out-of-order expiry deliveries from cancelling a local purchase.
    if (membership && membership.renewalMethod !== 'central_membership') {
      this.logger.warn(
        `Ignoring Central revocation for user ${envelope.userId}: local membership ` +
          `was not granted by Central (renewalMethod=${membership.renewalMethod ?? 'n/a'})`,
      );
    } else if (membership) {
      const endDate =
        parseDate(envelope.membership.expiresAt) ??
        parseDate(envelope.pkg.expiresAt) ??
        new Date();

      if (
        membership.isActive ||
        membership.renewalStatus !== status ||
        !membership.expiresAt ||
        membership.expiresAt > endDate
      ) {
        membership.isActive = false;
        membership.renewalStatus = status;
        membership.autoRenew = false;
        membership.nextChargeAt = null;
        // Keep the Central expiry when it already passed; otherwise mark the
        // access end at the moment we were told it was revoked.
        membership.endDate = endDate;
        if (!membership.expiresAt || membership.expiresAt > endDate) {
          membership.expiresAt = endDate;
        }
        membership.renewalMethod = 'central_membership';
        await this.memberships.save(membership);
        planVariantId = planVariantId ?? membership.planVariantId;
        expiresAt = expiresAt ?? membership.expiresAt;
        changed = true;
      }
    }

    SubscriptionGuard.clearCache(envelope.userId);
    SubscriptionGuard.clearCache(user.id);

    if (!changed) {
      // Revoking something that was never granted locally is a no-op, not a
      // failure: the user may have used another app included in the plan.
      return null;
    }

    this.logger.log(
      `Revoked CHS entitlement for Central user ${envelope.userId} (${status})`,
    );
    return { planVariantId, expiresAt };
  }

  private resolveStatus(envelope: MembershipEnvelope): string {
    const raw =
      envelope.membership.status ??
      envelope.pkg.status ??
      envelope.membership.state ??
      '';
    const status = normalise(raw);
    if (status) return status;
    if (envelope.pkg.isActive === false) return 'inactive';
    return 'active';
  }

  private resolvePlanType(membershipData: Record<string, any>): PlanType {
    const cycle = normalise(
      membershipData.billingCycle ?? membershipData.planType ?? '',
    );
    if (cycle.includes('annual') || cycle.includes('year')) {
      return PlanType.ANNUAL;
    }
    return PlanType.MONTHLY;
  }

  private computeExpiry(
    start: Date,
    variant: PlanVariant,
    membershipData: Record<string, any>,
  ): Date {
    const tier = variant.tierLevel?.name;

    if (tier === PlanTier.PRO_PLUS || variant.tierLevel?.isCalendarYear) {
      return this.planExpiry.proPlusExpiry(start);
    }
    if (tier === PlanTier.PRO) {
      return this.planExpiry.proExpiry(start);
    }
    if (variant.tierLevel?.durationDays) {
      return this.planExpiry.addDays(start, variant.tierLevel.durationDays);
    }

    // No tier metadata on the mapped variant: fall back to the billing cycle
    // Central sent, then to 30 days.
    if (this.resolvePlanType(membershipData) === PlanType.ANNUAL) {
      return this.planExpiry.addCalendarYear(start);
    }
    return this.planExpiry.addDays(start, 30);
  }

  // ---------------------------------------------------------------------------
  // Plan mapping
  // ---------------------------------------------------------------------------

  /**
   * Resolve Central's package to a local sellable variant.
   *
   * Resolution order (first match wins):
   *   1. `MCOM_MEMBERSHIP_PLAN_MAP` env override (JSON object)
   *   2. `plan_variants.external_plan_id`
   *   3. the package id is a local variant UUID
   *   4. the package id is a local plan id / slug
   *   5. the packageName matches a plan family name
   *   6. composite text such as `mall-gold-pro-plus` → plan `gold`, tier Pro+
   *
   * When the match lands on a plan family (not a specific variant) the tier is
   * inferred from `packageName` / `externalPlanId`, defaulting to the lowest
   * active tier (Standard).
   */
  async resolvePlanVariant(
    envelope: MembershipEnvelope,
  ): Promise<PlanVariant | null> {
    const externalPlanId =
      typeof envelope.pkg.externalPlanId === 'string'
        ? envelope.pkg.externalPlanId.trim()
        : typeof envelope.pkg.planId === 'string'
          ? envelope.pkg.planId.trim()
          : '';
    const packageName =
      typeof envelope.pkg.packageName === 'string'
        ? envelope.pkg.packageName.trim()
        : typeof envelope.pkg.name === 'string'
          ? envelope.pkg.name.trim()
          : '';
    const desiredTier = this.inferTier(
      packageName,
      externalPlanId,
      envelope.membership.planName,
      envelope.membership.tier,
      envelope.membership.level,
    );

    const override = this.resolveEnvOverride(externalPlanId, packageName);
    if (override) {
      const variant = await this.resolveOverriddenVariant(
        override,
        desiredTier,
      );
      if (variant) return variant;
      this.logger.warn(
        `MCOM_MEMBERSHIP_PLAN_MAP points at "${override}" but it could not be resolved`,
      );
    }

    if (externalPlanId) {
      const byExternalId = await this.variants.findOne({
        where: { externalPlanId: ILike(externalPlanId), isActive: true },
        relations: ['plan', 'tierLevel'],
      });
      if (byExternalId) return byExternalId;

      if (UUID_RE.test(externalPlanId)) {
        const byVariantId = await this.variants.findOne({
          where: { id: externalPlanId },
          relations: ['plan', 'tierLevel'],
        });
        if (byVariantId) return byVariantId;

        const byPlanId = await this.plans.findOne({
          where: { id: externalPlanId },
          relations: ['variants', 'variants.tierLevel'],
        });
        if (byPlanId) return this.pickVariant(byPlanId, desiredTier);
      }

      const bySlug = await this.plans.findOne({
        where: { slug: ILike(externalPlanId), isActive: true },
        relations: ['variants', 'variants.tierLevel'],
      });
      if (bySlug) return this.pickVariant(bySlug, desiredTier);
    }

    if (packageName) {
      const byName = await this.plans.findOne({
        where: { name: ILike(packageName), isActive: true },
        relations: ['variants', 'variants.tierLevel'],
      });
      if (byName) return this.pickVariant(byName, desiredTier);
    }

    return this.resolveByCompositeText(
      [externalPlanId, packageName].filter(Boolean),
      desiredTier,
    );
  }

  private async resolveOverriddenVariant(
    value: string,
    tier: PlanTier | null,
  ): Promise<PlanVariant | null> {
    const override = value.trim();
    if (!override) return null;

    if (UUID_RE.test(override)) {
      return this.variants.findOne({
        where: { id: override },
        relations: ['plan', 'tierLevel'],
      });
    }

    const [slugPart, tierPart] = override.split(':');
    if (tierPart) {
      const plan = await this.plans.findOne({
        where: { slug: ILike(slugPart.trim()), isActive: true },
        relations: ['variants', 'variants.tierLevel'],
      });
      return plan
        ? this.pickVariant(plan, (tierPart.trim() as PlanTier) ?? tier)
        : null;
    }

    const plan = await this.plans.findOne({
      where: { slug: ILike(override), isActive: true },
      relations: ['variants', 'variants.tierLevel'],
    });
    return plan ? this.pickVariant(plan, tier) : null;
  }

  private async resolveByCompositeText(
    sources: string[],
    tier: PlanTier | null,
  ): Promise<PlanVariant | null> {
    const haystacks = sources
      .map((source) => source.toLowerCase())
      .filter(Boolean);
    if (haystacks.length === 0) return null;

    const plans = await this.plans.find({
      where: { isActive: true },
      relations: ['variants', 'variants.tierLevel'],
    });

    for (const plan of plans) {
      const slug = normalise(plan.slug);
      const name = normalise(plan.name);
      const slugMatch = slug
        ? haystacks.some((text) =>
            new RegExp(
              `(^|[^a-z0-9])${this.escapeRegex(slug)}($|[^a-z0-9])`,
            ).test(text),
          )
        : false;
      const nameMatch = name
        ? haystacks.some((text) => text.includes(name))
        : false;

      if (slugMatch || nameMatch) {
        return this.pickVariant(plan, tier);
      }
    }

    return null;
  }

  private pickVariant(plan: Plan, tier: PlanTier | null): PlanVariant | null {
    const active = (plan.variants ?? []).filter((variant) => variant.isActive);
    if (active.length === 0) return null;

    if (tier) {
      const match = active.find((variant) => variant.tierLevel?.name === tier);
      if (match) return match;
    }

    return active.sort(
      (a, b) =>
        (a.tierLevel?.sortOrder ?? Number.MAX_SAFE_INTEGER) -
        (b.tierLevel?.sortOrder ?? Number.MAX_SAFE_INTEGER),
    )[0];
  }

  private inferTier(
    ...sources: Array<string | null | undefined>
  ): PlanTier | null {
    const text = sources
      .filter((source): source is string => Boolean(source))
      .join(' ')
      .toLowerCase();

    if (/(pro\s*\+)|proplus|pro-plus|pro_plus/.test(text)) {
      return PlanTier.PRO_PLUS;
    }
    if (/\bpro\b/.test(text)) {
      return PlanTier.PRO;
    }
    if (/standard|starter|\bbasic\b|\bbronze\b/.test(text)) {
      return PlanTier.STANDARD;
    }
    return null;
  }

  private resolveEnvOverride(
    externalPlanId: string,
    packageName: string,
  ): string | null {
    const raw = this.configService.get<string>('MCOM_MEMBERSHIP_PLAN_MAP');
    if (!raw) return null;

    let map: Record<string, unknown>;
    try {
      map = JSON.parse(raw);
    } catch {
      this.logger.warn(
        'MCOM_MEMBERSHIP_PLAN_MAP is not valid JSON; ignoring the override',
      );
      return null;
    }
    if (!map || typeof map !== 'object' || Array.isArray(map)) return null;

    const candidates = [externalPlanId, packageName]
      .map((candidate) => candidate.toLowerCase())
      .filter(Boolean);

    for (const [key, value] of Object.entries(map)) {
      if (
        candidates.includes(key.trim().toLowerCase()) &&
        typeof value === 'string' &&
        value.trim()
      ) {
        return value.trim();
      }
    }
    return null;
  }

  private describePackage(envelope: MembershipEnvelope): string {
    return (
      envelope.pkg.externalPlanId ||
      envelope.pkg.packageName ||
      envelope.pkg.name ||
      envelope.membership.planId ||
      envelope.membership.planName ||
      'unknown'
    );
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ---------------------------------------------------------------------------
  // Local user resolution
  // ---------------------------------------------------------------------------

  private async resolveLocalUser(userId: string): Promise<User> {
    const existing = await this.users.findOne({
      where: { centralUserId: userId },
    });
    if (existing) return existing;

    // The business may not have logged into the mall yet. Pull the canonical
    // profile over the service mesh so the grant has a local account to land
    // on. ProfileSyncService is idempotent and keyed on Central's user id.
    this.logger.log(
      `No local user for Central user ${userId}; provisioning from Central profile`,
    );
    await this.profileSync.syncProfileFromCentral(userId);

    const created = await this.users.findOne({
      where: { centralUserId: userId },
    });
    if (!created) {
      throw new PermanentMembershipSyncError(
        'user_not_found',
        `Central membership is for user ${userId}, but no local account was provisioned`,
      );
    }
    return created;
  }

  // ---------------------------------------------------------------------------
  // Envelope + idempotency
  // ---------------------------------------------------------------------------

  private parseEnvelope(payload: any): MembershipEnvelope {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Webhook payload must be a JSON object');
    }

    const event = String(payload.event ?? payload.type ?? '').trim();
    if (!event) {
      throw new BadRequestException('Webhook payload is missing "event"');
    }

    const data = (payload.data ?? payload) as Record<string, any>;
    const userId = String(
      data?.userId ?? data?.centralUserId ?? payload.userId ?? '',
    ).trim();
    if (!userId) {
      throw new BadRequestException('Webhook payload is missing "data.userId"');
    }

    const occurredAtRaw = data?.occurredAt ?? payload.timestamp ?? null;
    const occurredAt = parseDate(occurredAtRaw);

    const providedId = String(
      data?.eventId ?? payload.eventId ?? payload.id ?? '',
    ).trim();
    const eventId =
      providedId ||
      crypto
        .createHash('sha256')
        .update(`${event}:${userId}:${occurredAt?.toISOString() ?? ''}`)
        .digest('hex');

    const businessIdRaw =
      data?.businessId ??
      data?.membership?.businessId ??
      data?.package?.businessId ??
      null;

    return {
      event,
      userId,
      eventId,
      occurredAt,
      businessId: businessIdRaw ? String(businessIdRaw) : null,
      membership:
        data?.membership && typeof data.membership === 'object'
          ? data.membership
          : {},
      pkg:
        data?.package && typeof data.package === 'object'
          ? data.package
          : data?.packageData && typeof data.packageData === 'object'
            ? data.packageData
            : {},
      raw: payload,
    };
  }

  private async claimEvent(envelope: MembershipEnvelope): Promise<EventClaim> {
    const existing = await this.events.findOne({
      where: { eventId: envelope.eventId },
    });
    if (existing) return this.reclaimEvent(existing);

    const created = this.events.create({
      eventId: envelope.eventId,
      eventType: envelope.event,
      centralUserId: envelope.userId,
      businessId: envelope.businessId,
      externalPlanId:
        (envelope.pkg.externalPlanId as string | undefined) ??
        (envelope.membership.planId as string | undefined) ??
        null,
      status: 'processing',
      attempts: 1,
      occurredAt: envelope.occurredAt,
      payload: envelope.raw,
      processedAt: null,
    });

    try {
      const record = await this.events.save(created);
      return { record, duplicate: false, inProgress: false };
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;

      // A concurrent delivery won the insert. Treat it as a duplicate.
      const raced = await this.events.findOne({
        where: { eventId: envelope.eventId },
      });
      if (!raced) throw error;
      return this.reclaimEvent(raced);
    }
  }

  private async reclaimEvent(
    existing: MembershipSyncEvent,
  ): Promise<EventClaim> {
    if (existing.status === 'completed' || existing.status === 'skipped') {
      return { record: existing, duplicate: true, inProgress: false };
    }

    const stale =
      Date.now() - new Date(existing.updated_at).getTime() >
      PROCESSING_STALE_MS;

    if (existing.status === 'processing' && !stale) {
      return { record: existing, duplicate: true, inProgress: true };
    }

    existing.status = 'processing';
    existing.attempts = (existing.attempts ?? 0) + 1;
    existing.lastError = null;
    existing.processedAt = null;

    const record = await this.events.save(existing);
    return { record, duplicate: false, inProgress: false };
  }

  private async finaliseEvent(
    id: string,
    status: 'completed' | 'failed' | 'skipped',
    lastError?: string,
  ): Promise<void> {
    await this.events.update(id, {
      status,
      lastError: lastError ?? null,
      processedAt: status === 'failed' ? null : new Date(),
    });
  }
}
