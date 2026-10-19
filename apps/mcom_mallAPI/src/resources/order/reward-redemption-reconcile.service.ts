import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import {
  OrderItemReward,
  RewardRedemptionStatus,
} from './entities/order-item-reward.entity';
import {
  RewardOutboxOperation,
  RewardOutboxStatus,
  RewardRedemptionOutbox,
} from './entities/reward-redemption-outbox.entity';
import { RewardsClientService } from '../rewards-integration/rewards-client.service';
import {
  BookingReward,
  BookingRewardStatus,
} from '../booking/entities/booking-reward.entity';

const MAX_ATTEMPTS = 10;
/** Reservations older than this with no successful commit are released. */
const STALE_RESERVATION_MS = 30 * 60 * 1000;

/**
 * Reconciles reward-issuance lifecycle calls against MCOM Rewards.
 *
 *  - retries failed commits/releases from a durable outbox;
 *  - releases reservations whose checkout never completed (stale).
 */
@Injectable()
export class RewardRedemptionReconcileService implements OnModuleInit {
  private readonly logger = new Logger(RewardRedemptionReconcileService.name);

  constructor(
    @InjectRepository(OrderItemReward)
    private readonly itemRewardRepository: Repository<OrderItemReward>,
    @InjectRepository(RewardRedemptionOutbox)
    private readonly outboxRepository: Repository<RewardRedemptionOutbox>,
    @InjectRepository(BookingReward)
    private readonly bookingRewardRepository: Repository<BookingReward>,
    private readonly rewardsClient: RewardsClientService,
  ) {}

  onModuleInit() {
    const intervalMs = 5 * 60 * 1000;
    setInterval(() => {
      this.reconcilePending().catch((err) => {
        this.logger.error('[reward-reconcile] periodic reconciliation failed', err);
      });
    }, intervalMs);
  }

  async enqueue(entry: {
    rewardIssuanceId: string;
    orderId?: string;
    reservationRef?: string;
    operation: RewardOutboxOperation;
    failureReason: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const idempotencyKey = `${entry.operation}:${entry.orderId || 'na'}:${entry.rewardIssuanceId}`;
      const existing = await this.outboxRepository.findOne({
        where: { idempotencyKey },
      });
      if (existing) return;
      const record = this.outboxRepository.create({
        rewardIssuanceId: entry.rewardIssuanceId,
        orderId: entry.orderId,
        reservationRef: entry.reservationRef,
        operation: entry.operation,
        idempotencyKey,
        failureReason: entry.failureReason?.slice(0, 2000),
        attempts: 0,
        status: RewardOutboxStatus.PENDING,
        metadata: entry.metadata,
      });
      await this.outboxRepository.save(record);
    } catch (err) {
      this.logger.error(
        `[reward-reconcile] failed to persist outbox for ${entry.rewardIssuanceId}`,
        err,
      );
    }
  }

  async reconcilePending(): Promise<void> {
    const pending = await this.outboxRepository.find({
      where: { status: RewardOutboxStatus.PENDING },
      take: 50,
      order: { createdAt: 'ASC' },
    });

    for (const record of pending) {
      try {
        if (record.operation === RewardOutboxOperation.COMMIT) {
          await this.rewardsClient.commitIssuance(record.rewardIssuanceId, {
            orderRef: record.reservationRef || record.orderId || '',
          });
        } else {
          await this.rewardsClient.releaseIssuance(record.rewardIssuanceId, {
            orderRef: record.reservationRef || record.orderId || '',
          });
        }
        record.status = RewardOutboxStatus.COMPLETED;
        await this.outboxRepository.save(record);
        this.logger.log(
          `[reward-reconcile] completed ${record.operation} for ${record.rewardIssuanceId}`,
        );
      } catch (err: any) {
        record.attempts += 1;
        record.failureReason = String(err?.message || err).slice(0, 2000);
        if (record.attempts >= MAX_ATTEMPTS) {
          record.status = RewardOutboxStatus.FAILED;
        }
        await this.outboxRepository.save(record);
        this.logger.error(
          `[reward-reconcile] retry ${record.attempts} failed for ${record.id}`,
          err,
        );
      }
    }

    await this.releaseStaleReservations();
  }

  /**
   * Release reservations that never reached COMMITTED and have no pending
   * commit outbox entry (i.e. abandoned checkouts / failed payments).
   */
  async releaseStaleReservations(): Promise<number> {
    if (!this.rewardsClient.isEnabled()) return 0;

    const cutoff = new Date(Date.now() - STALE_RESERVATION_MS);
    const stale = await this.itemRewardRepository.find({
      where: {
        status: RewardRedemptionStatus.RESERVED,
        created_at: LessThan(cutoff),
      },
      take: 50,
      order: { created_at: 'ASC' },
    });

    let released = 0;
    for (const row of stale) {
      // Never release a reward that has a commit attempt recorded — the order
      // was paid and the discount was already granted.
      const commitAttempt = await this.outboxRepository.findOne({
        where: {
          rewardIssuanceId: row.rewardIssuanceId,
          operation: RewardOutboxOperation.COMMIT,
        },
      });
      if (commitAttempt) continue;

      // Also skip anything already committed locally.
      if (row.status === RewardRedemptionStatus.COMMITTED) continue;

      try {
        await this.rewardsClient.releaseIssuance(row.rewardIssuanceId, {
          orderRef: row.reservationRef || row.orderId,
          reason: 'stale_checkout_reservation',
        });
        row.status = RewardRedemptionStatus.RELEASED;
        row.releasedAt = new Date();
        await this.itemRewardRepository.save(row);
        released += 1;
      } catch (err: any) {
        this.logger.warn(
          `[reward-reconcile] failed to release stale reservation ${row.id}: ${err?.message || err}`,
        );
      }
    }

    // Same sweep for service-booking reservations.
    const staleBookings = await this.bookingRewardRepository.find({
      where: {
        status: BookingRewardStatus.RESERVED,
        created_at: LessThan(cutoff),
      },
      take: 50,
      order: { created_at: 'ASC' },
    });

    for (const row of staleBookings) {
      const commitAttempt = await this.outboxRepository.findOne({
        where: {
          rewardIssuanceId: row.rewardIssuanceId,
          operation: RewardOutboxOperation.COMMIT,
        },
      });
      if (commitAttempt) continue;

      try {
        await this.rewardsClient.releaseIssuance(row.rewardIssuanceId, {
          orderRef: row.reservationRef || `booking:${row.bookingId}`,
          reason: 'stale_booking_reservation',
        });
        row.status = BookingRewardStatus.RELEASED;
        row.releasedAt = new Date();
        await this.bookingRewardRepository.save(row);
        released += 1;
      } catch (err: any) {
        this.logger.warn(
          `[reward-reconcile] failed to release stale booking reservation ${row.id}: ${err?.message || err}`,
        );
      }
    }

    return released;
  }
}
