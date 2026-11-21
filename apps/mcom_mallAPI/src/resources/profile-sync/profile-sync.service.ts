import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UserRole } from '../../common/role.enum';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ServiceMeshService } from '../service-mesh/services/service-mesh.service';
import { McomCentralService } from '../sso/mcom-central.service';
import {
  buildNewUserIdentity,
  syncCentralIdentity,
} from '../sso/central-profile-sync';
import { ProfileSyncEvent } from './entities/profile-sync-event.entity';

/** Signals that should trigger a canonical profile pull. */
const SUPPORTED_EVENTS = new Set(['profile.updated', 'profile.created']);

/** The pull request must not hang a Central retry slot. */
const PROFILE_PULL_TIMEOUT_MS = 10_000;

/**
 * A `processing` row older than this is assumed abandoned (crash, timeout) and
 * may be retried. Prevents two concurrent deliveries of the same event from
 * both performing the pull.
 */
const PROCESSING_STALE_MS = 2 * 60_000;

/**
 * Failure that will never succeed on retry (role not served, profile missing).
 * Central is acknowledged with 200 so it stops retrying.
 */
class PermanentProfileSyncError extends Error {
  constructor(
    readonly reason: string,
    message: string,
  ) {
    super(message);
    this.name = 'PermanentProfileSyncError';
  }
}

interface ProfileEnvelope {
  event: string;
  userId: string;
  eventId: string;
  occurredAt: Date | null;
  raw: Record<string, unknown>;
}

interface EventClaim {
  record: ProfileSyncEvent;
  duplicate: boolean;
  inProgress: boolean;
}

export interface ProfileSyncOutcome {
  event: string;
  userId: string;
  duplicate: boolean;
  ignored?: boolean;
  reason?: string;
  synced?: {
    localUserId: string;
    localBusinessId: string | null;
    role: string;
  };
}

function unwrapProfile(body: any): Record<string, any> | null {
  if (!body || typeof body !== 'object') return null;
  const candidate =
    body.user ?? body.data?.user ?? body.data ?? body.profile ?? body;
  return candidate && typeof candidate === 'object' && !Array.isArray(candidate)
    ? candidate
    : null;
}

function isUniqueViolation(err: any): boolean {
  return err?.code === '23505' || err?.driverError?.code === '23505';
}

/**
 * Receives Central's `profile.updated` signal and mirrors the canonical
 * profile onto this app.
 *
 * Central is the source of truth and never ships profile data in the webhook:
 * it sends a signed signal containing only the immutable `userId`, and this
 * service pulls the canonical record over the RS256 service mesh
 * (`GET /api/v1/ecosystem/profiles/{userId}`, audience `mcom-central`,
 * scope `central:read`) before diffing it into the local user + storefront.
 */
@Injectable()
export class ProfileSyncService {
  private readonly logger = new Logger(ProfileSyncService.name);

  constructor(
    @InjectRepository(ProfileSyncEvent)
    private readonly events: Repository<ProfileSyncEvent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly serviceMesh: ServiceMeshService,
    private readonly mcomCentralService: McomCentralService,
    private readonly configService: ConfigService,
  ) {}

  /** Secret Central used to sign the delivery. Prefer a dedicated secret. */
  getWebhookSecret(): string {
    return (
      this.configService.get<string>('MCOM_PROFILE_WEBHOOK_SECRET') ||
      this.configService.get<string>('MCOM_WEBHOOK_SECRET') ||
      this.configService.get<string>('SSO_WEBHOOK_SECRET') ||
      ''
    );
  }

  async handleIncomingEvent(payload: any): Promise<ProfileSyncOutcome> {
    const envelope = this.parseEnvelope(payload);

    if (!SUPPORTED_EVENTS.has(envelope.event)) {
      this.logger.log(
        `Ignoring unsupported profile sync event "${envelope.event}" for ${envelope.userId}`,
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
        `Duplicate profile sync event ${envelope.eventId} for ${envelope.userId} ` +
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
      const synced = await this.syncProfileFromCentral(envelope.userId);
      await this.finaliseEvent(claim.record.id, 'completed');
      this.logger.log(
        `Synced Central profile ${envelope.userId} -> local user ${synced.localUserId}` +
          (synced.localBusinessId
            ? `, business ${synced.localBusinessId}`
            : ''),
      );
      return {
        event: envelope.event,
        userId: envelope.userId,
        duplicate: false,
        synced,
      };
    } catch (error) {
      if (error instanceof PermanentProfileSyncError) {
        await this.finaliseEvent(claim.record.id, 'skipped', error.message);
        this.logger.warn(
          `Skipped Central profile ${envelope.userId}: ${error.message}`,
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
        `Profile sync failed for ${envelope.userId}; asking Central to retry: ${message}`,
      );
      throw new ServiceUnavailableException(
        'Profile sync temporarily failed; Central should retry',
      );
    }
  }

  /**
   * Pull the canonical profile and mirror it onto the local user account and
   * storefront. Idempotent: safe to run on every delivery.
   */
  async syncProfileFromCentral(userId: string): Promise<{
    localUserId: string;
    localBusinessId: string | null;
    role: string;
  }> {
    const centralUser = await this.pullCentralProfile(userId);

    const email =
      typeof centralUser.email === 'string' ? centralUser.email.trim() : '';
    if (!email) {
      throw new PermanentProfileSyncError(
        'missing_email',
        `Central profile ${userId} does not include an email address`,
      );
    }

    const identity = buildNewUserIdentity(centralUser);
    const localUser = await this.usersService.findOrCreateFromCentralIdentity({
      email,
      centralUserId: String(centralUser.sub ?? centralUser.id ?? userId),
      firstName: identity.firstName,
      lastName: identity.lastName,
      phoneNumber: identity.phoneNumber,
      role: identity.role,
    });

    const { user, business } = await syncCentralIdentity({
      userRepository: this.userRepository,
      dataSource: this.dataSource,
      localUser,
      centralUser,
      logger: this.logger,
    });

    if (!business && user.role === UserRole.OWNER) {
      this.logger.warn(
        `Profile ${userId} is an OWNER but Central returned no business profile`,
      );
    }

    return {
      localUserId: user.id,
      localBusinessId: business?.id ?? null,
      role: user.role,
    };
  }

  // ---------------------------------------------------------------------------
  // Canonical profile pull
  // ---------------------------------------------------------------------------

  private async pullCentralProfile(
    userId: string,
  ): Promise<Record<string, any>> {
    const path = `/api/v1/ecosystem/profiles/${encodeURIComponent(userId)}`;

    if (this.hasMeshCredentials()) {
      try {
        const body = await this.serviceMesh.callPeer<any>(
          this.serviceMesh.getSolutionsUrl(),
          'mcom-central',
          path,
          {
            method: 'GET',
            timeout: PROFILE_PULL_TIMEOUT_MS,
            headers: { Accept: 'application/json' },
          },
          'central:read',
        );

        const profile = unwrapProfile(body);
        if (profile) return profile;

        throw new PermanentProfileSyncError(
          'empty_profile',
          `Central returned an empty profile for ${userId}`,
        );
      } catch (error) {
        if (error instanceof PermanentProfileSyncError) throw error;

        const status = (error as any)?.response?.status as number | undefined;
        const detail = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Central profile pull failed for ${userId}` +
            (status ? ` (HTTP ${status})` : '') +
            `: ${detail}`,
        );

        // 403 = this app does not serve the profile's role, 404 = no such user.
        // Neither will succeed on retry.
        const permanent = status === 403 || status === 404;

        if (this.isFallbackEnabled()) {
          const fallback = await this.pullViaLegacyHmac(userId);
          if (fallback) {
            this.logger.warn(
              `Used legacy HMAC data API fallback for profile ${userId}`,
            );
            return fallback;
          }
        }

        if (permanent) {
          throw new PermanentProfileSyncError(
            'not_served',
            `Central returned HTTP ${status} for profile ${userId}`,
          );
        }

        throw error;
      }
    }

    if (this.isFallbackEnabled()) {
      const fallback = await this.pullViaLegacyHmac(userId);
      if (fallback) {
        this.logger.warn(
          `Used legacy HMAC data API fallback for profile ${userId}`,
        );
        return fallback;
      }
    }

    throw new Error(
      'MCOM mesh credentials are not configured (MCOM_CLIENT_ID / MCOM_CLIENT_SECRET)',
    );
  }

  /**
   * Optional bridge for environments where the B2B profile endpoint has not
   * been provisioned yet. Off unless `MCOM_PROFILE_SYNC_HMAC_FALLBACK=true`.
   */
  private async pullViaLegacyHmac(
    userId: string,
  ): Promise<Record<string, any> | null> {
    try {
      const data = await this.mcomCentralService.getUserContext(userId);
      return unwrapProfile(data);
    } catch (error) {
      this.logger.warn(
        `Legacy HMAC profile fallback failed for ${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private hasMeshCredentials(): boolean {
    return Boolean(this.configService.get<string>('MCOM_CLIENT_SECRET'));
  }

  private isFallbackEnabled(): boolean {
    const raw = this.configService.get<string>(
      'MCOM_PROFILE_SYNC_HMAC_FALLBACK',
    );
    return String(raw ?? '').toLowerCase() === 'true';
  }

  // ---------------------------------------------------------------------------
  // Envelope + idempotency
  // ---------------------------------------------------------------------------

  private parseEnvelope(payload: any): ProfileEnvelope {
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
    const parsedDate = occurredAtRaw ? new Date(occurredAtRaw) : null;
    const occurredAt =
      parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;

    const providedId = String(
      data?.eventId ?? payload.eventId ?? payload.id ?? '',
    ).trim();

    // Deterministic id when Central omits one, so retries still dedupe.
    const eventId =
      providedId ||
      crypto
        .createHash('sha256')
        .update(`${event}:${userId}:${occurredAt?.toISOString() ?? ''}`)
        .digest('hex');

    return { event, userId, eventId, occurredAt, raw: payload };
  }

  private async claimEvent(envelope: ProfileEnvelope): Promise<EventClaim> {
    const existing = await this.events.findOne({
      where: { eventId: envelope.eventId },
    });

    if (existing) {
      return this.reclaimEvent(existing);
    }

    const created = this.events.create({
      eventId: envelope.eventId,
      eventType: envelope.event,
      centralUserId: envelope.userId,
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

  private async reclaimEvent(existing: ProfileSyncEvent): Promise<EventClaim> {
    if (existing.status === 'completed' || existing.status === 'skipped') {
      return { record: existing, duplicate: true, inProgress: false };
    }

    const stale =
      Date.now() - new Date(existing.updated_at).getTime() >
      PROCESSING_STALE_MS;

    if (existing.status === 'processing' && !stale) {
      return { record: existing, duplicate: true, inProgress: true };
    }

    // Failed attempt (or an abandoned `processing` row): retry in place.
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
