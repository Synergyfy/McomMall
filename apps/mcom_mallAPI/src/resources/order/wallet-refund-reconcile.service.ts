import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FailedWalletRefund,
  FailedRefundStatus,
} from './entities/failed-wallet-refund.entity';
import { McomWalletService } from '../payments/services/mcom-wallet.service';

const MAX_ATTEMPTS = 10;

@Injectable()
export class WalletRefundReconcileService implements OnModuleInit {
  private readonly logger = new Logger(WalletRefundReconcileService.name);

  constructor(
    @InjectRepository(FailedWalletRefund)
    private readonly failedRefundRepository: Repository<FailedWalletRefund>,
    private readonly mcomWalletService: McomWalletService,
  ) {}

  onModuleInit() {
    // Schedule periodic wallet refund reconciliation every 5 minutes
    const intervalMs = 5 * 60 * 1000;
    setInterval(() => {
      this.reconcilePending().catch((err) => {
        this.logger.error('[wallet-reconcile] periodic reconciliation failed', err);
      });
    }, intervalMs);
  }

  async enqueue(entry: {
    mallUserId: string;
    centralUserId?: string;
    amount: number;
    idempotencyKey: string;
    walletTransactionId?: string | null;
    failureReason: string;
  }): Promise<void> {
    try {
      const existing = await this.failedRefundRepository.findOne({
        where: { idempotencyKey: entry.idempotencyKey },
      });
      if (existing) return;
      const record = this.failedRefundRepository.create({
        mallUserId: entry.mallUserId,
        centralUserId: entry.centralUserId,
        amount: Number(Number(entry.amount).toFixed(2)),
        idempotencyKey: entry.idempotencyKey,
        walletTransactionId: entry.walletTransactionId || undefined,
        failureReason: entry.failureReason?.slice(0, 2000),
        attempts: 0,
        status: FailedRefundStatus.PENDING,
      });
      await this.failedRefundRepository.save(record);
    } catch (err) {
      this.logger.error(
        `[wallet-reconcile] failed to persist outbox entry ${entry.idempotencyKey}`,
        err,
      );
    }
  }

  // Called by an external scheduler (cron / admin endpoint) every 5 minutes.
  // Follows the existing processScheduledDeliveries() pattern — no extra
  // queue infra required.
  async reconcilePending(): Promise<void> {
    const pending = await this.failedRefundRepository.find({
      where: { status: FailedRefundStatus.PENDING },
      take: 50,
      order: { createdAt: 'ASC' },
    });
    for (const record of pending) {
      try {
        if (!record.centralUserId) {
          record.attempts += 1;
          record.failureReason = 'Missing centralUserId — cannot refund';
          if (record.attempts >= MAX_ATTEMPTS)
            record.status = FailedRefundStatus.FAILED;
          await this.failedRefundRepository.save(record);
          continue;
        }
        await this.mcomWalletService.credit({
          userId: record.centralUserId,
          amount: Number(record.amount),
          category: 'REFUND',
          description: 'MCOM Mall order failed — auto refund (retry)',
          reference: `mall-order-failed-${record.mallUserId}`,
          metadata: {
            platform: 'mcom-mall',
            mallUserId: record.mallUserId,
            outboxId: record.id,
          },
          idempotencyKey: record.idempotencyKey,
        });
        record.status = FailedRefundStatus.COMPLETED;
        await this.failedRefundRepository.save(record);
        this.logger.log(
          `[wallet-reconcile] completed refund ${record.id} (${record.idempotencyKey})`,
        );
      } catch (err: any) {
        record.attempts += 1;
        record.failureReason = String(err?.message || err).slice(0, 2000);
        if (record.attempts >= MAX_ATTEMPTS)
          record.status = FailedRefundStatus.FAILED;
        await this.failedRefundRepository.save(record);
        this.logger.error(
          `[wallet-reconcile] retry ${record.attempts} failed for ${record.id}`,
          err,
        );
      }
    }
  }
}
