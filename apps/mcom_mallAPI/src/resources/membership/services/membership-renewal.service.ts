import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import { Membership } from '../entities/membership.entity';
import { MembershipRenewal } from '../entities/membership-renewal.entity';
import { McomWalletService } from '../../payments/services/mcom-wallet.service';
import { PlanExpiryService } from '../../plans/services/plan-expiry.service';
import { PlanTier } from '../../plans/enums/plan-tier.enum';
import { PlanType } from '../dto/initiate-membership-payment.dto';

const DUNNING_DAYS = [1, 3, 7];
const MAX_ATTEMPTS = 4;

/**
 * Recurring billing for MCOM Mall-owned plans.
 *
 * Renewals debit the central MCOM Wallet with a deterministic per-period
 * idempotency key. MCOM Pay charges are one-time and Central stores no partner
 * mandate, so card/PayPal recurring requires the customer's own mandate and is
 * intentionally not attempted here.
 */
@Injectable()
export class MembershipRenewalService {
  private readonly logger = new Logger(MembershipRenewalService.name);

  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(MembershipRenewal)
    private readonly renewalRepository: Repository<MembershipRenewal>,
    private readonly mcomWalletService: McomWalletService,
    private readonly planExpiryService: PlanExpiryService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM, { timeZone: 'UTC' })
  async renewDueMemberships(): Promise<void> {
    const due = await this.membershipRepository.find({
      where: {
        autoRenew: true,
        renewalStatus: In(['active', 'past_due']),
        nextChargeAt: LessThanOrEqual(new Date()),
      },
      relations: [
        'user',
        'planVariant',
        'planVariant.plan',
        'planVariant.tierLevel',
      ],
      take: 200,
      order: { nextChargeAt: 'ASC' },
    });

    if (due.length === 0) return;
    this.logger.log(`Processing ${due.length} due membership renewal(s)`);

    for (const membership of due) {
      try {
        await this.renewOne(membership);
      } catch (err: any) {
        this.logger.error(
          `Renewal failed unexpectedly for membership ${membership.id}: ${err?.message || err}`,
        );
      }
    }
  }

  private async renewOne(membership: Membership): Promise<void> {
    const now = new Date();
    const centralUserId = membership.user?.centralUserId;
    const amount = Number(membership.renewalAmount ?? 0);
    const periodStart =
      membership.expiresAt && membership.expiresAt > now
        ? new Date(membership.expiresAt)
        : now;
    const periodKey = periodStart.toISOString().slice(0, 10);

    const existing = await this.renewalRepository.findOne({
      where: { membershipId: membership.id, periodStart },
    });
    if (existing?.status === 'paid') {
      // Already renewed for this period; make sure the schedule moved on.
      if (
        !membership.nextChargeAt ||
        membership.nextChargeAt.getTime() <= periodStart.getTime()
      ) {
        membership.nextChargeAt = existing.periodEnd ?? membership.expiresAt;
        await this.membershipRepository.save(membership);
      }
      return;
    }

    if (!centralUserId) {
      await this.recordFailure(
        membership,
        existing,
        amount,
        periodStart,
        'MCOM Wallet is not linked',
      );
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      await this.recordFailure(
        membership,
        existing,
        amount,
        periodStart,
        'Renewal amount is not configured',
      );
      return;
    }

    const planName =
      membership.planVariant?.plan?.name ??
      membership.planVariant?.tierLevel?.name ??
      'MCOM Mall plan';

    try {
      const debit = await this.mcomWalletService.debit({
        userId: centralUserId,
        amount,
        category: 'SUBSCRIPTION',
        description: `${planName} renewal`,
        reference: `sub_${membership.id}_${periodKey}`,
        metadata: {
          membershipId: membership.id,
          period: periodKey,
          planVariantId: membership.planVariantId,
        },
        idempotencyKey: this.mcomWalletService.buildKey(
          'sub',
          membership.id,
          periodKey,
        ),
      });

      const nextExpiry = this.computeNextExpiry(periodStart, membership);
      membership.startDate = periodStart;
      membership.expiresAt = nextExpiry;
      membership.endDate = nextExpiry;
      membership.nextChargeAt = nextExpiry;
      membership.lastRenewalAt = now;
      membership.renewalAttempts = 0;
      membership.renewalStatus = 'active';
      membership.autoRenew = true;
      membership.isActive = true;
      await this.membershipRepository.save(membership);

      await this.renewalRepository.save(
        this.renewalRepository.create({
          ...(existing ? { id: existing.id } : {}),
          membershipId: membership.id,
          userId: membership.user.id,
          user: membership.user,
          amount,
          currency: membership.renewalCurrency || 'GBP',
          status: 'paid',
          provider: 'mcom_wallet',
          transactionId: debit.transactionId,
          periodStart,
          periodEnd: nextExpiry,
          attempt: (existing?.attempt ?? 0) + 1,
          failureReason: null,
          metadata: {
            renewalKey: this.mcomWalletService.buildKey(
              'sub',
              membership.id,
              periodKey,
            ),
            centralTransactionId: debit.transactionId,
          },
        }),
      );

      this.logger.log(
        `Renewed membership ${membership.id} for ${periodKey} (wallet txn ${debit.transactionId})`,
      );
    } catch (err: any) {
      await this.recordFailure(
        membership,
        existing,
        amount,
        periodStart,
        err?.message || 'Wallet debit failed',
      );
    }
  }

  private async recordFailure(
    membership: Membership,
    existing: MembershipRenewal | null,
    amount: number,
    periodStart: Date,
    reason: string,
  ): Promise<void> {
    const attempts = Number(membership.renewalAttempts || 0) + 1;
    const now = new Date();
    const terminated = attempts >= MAX_ATTEMPTS;

    if (terminated) {
      membership.autoRenew = false;
      membership.renewalStatus = 'canceled';
      membership.nextChargeAt = null;
      if (membership.expiresAt && membership.expiresAt <= now) {
        membership.isActive = false;
      }
      this.logger.warn(
        `Membership ${membership.id} renewal canceled after ${attempts} attempts: ${reason}`,
      );
    } else {
      const delayDays = DUNNING_DAYS[attempts - 1] ?? 7;
      const nextAttempt = new Date(now);
      nextAttempt.setUTCDate(nextAttempt.getUTCDate() + delayDays);
      membership.renewalStatus = 'past_due';
      membership.nextChargeAt = nextAttempt;
      this.logger.warn(
        `Membership ${membership.id} renewal attempt ${attempts} failed (${reason}); retry ${nextAttempt.toISOString()}`,
      );
    }
    membership.renewalAttempts = attempts;
    await this.membershipRepository.save(membership);

    await this.renewalRepository.save(
      this.renewalRepository.create({
        ...(existing ? { id: existing.id } : {}),
        membershipId: membership.id,
        userId: membership.user.id,
        user: membership.user,
        amount: Number.isFinite(amount) ? amount : 0,
        currency: membership.renewalCurrency || 'GBP',
        status: terminated ? 'canceled' : 'failed',
        provider: 'mcom_wallet',
        transactionId: existing?.transactionId ?? null,
        periodStart,
        periodEnd: existing?.periodEnd ?? null,
        attempt: attempts,
        failureReason: reason,
        metadata: { membershipId: membership.id },
      }),
    );
  }

  private computeNextExpiry(start: Date, membership: Membership): Date {
    const level = membership.planVariant?.tierLevel?.name;
    if (level === PlanTier.PRO_PLUS) {
      return this.planExpiryService.proPlusExpiry(start);
    }
    if (level === PlanTier.PRO) {
      return this.planExpiryService.proExpiry(start);
    }
    if (level) {
      return this.planExpiryService.standardExpiry(start);
    }
    if (membership.planType === PlanType.ANNUAL) {
      return this.planExpiryService.addCalendarYear(start);
    }
    return this.planExpiryService.addDays(start, 30);
  }
}
