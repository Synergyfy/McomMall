import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { ServiceMeshService } from '../service-mesh/services/service-mesh.service';
import { SERVICE_SCOPE_REWARDS_ISSUE } from '../service-mesh/constants';
import {
  PartnerInstrumentOperation,
  PartnerOutboxStatus,
  PARTNER_INSTRUMENT_CONSUMED_EVENT,
} from './enums';
import { PartnerRedemptionOutbox } from './entities/partner-redemption-outbox.entity';

export interface InstrumentConsumedEvent {
  issuanceId?: string | null;
  code?: string | null;
  instrumentType: string;
  instrumentId: string;
  amount?: number;
  note?: string;
}

const MAX_ATTEMPTS = 8;
const BASE_BACKOFF_MS = 30_000;
const MAX_BACKOFF_MS = 60 * 60 * 1000;

/**
 * Delivers instrument lifecycle callbacks to MCOM Rewards.
 *
 * Delivery is never allowed to block a checkout: the caller only writes an
 * outbox row (unique per `operation + issuanceId + code`) and processing is
 * asynchronous with exponential backoff and a dead-letter state.
 */
@Injectable()
export class PartnerCallbackService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PartnerCallbackService.name);
  private timer: NodeJS.Timeout | null = null;
  private processing = false;

  constructor(
    @InjectRepository(PartnerRedemptionOutbox)
    private readonly outboxRepository: Repository<PartnerRedemptionOutbox>,
    private readonly mesh: ServiceMeshService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    if (this.configService.get<string>('NODE_ENV') === 'test') return;
    if (!this.mesh.isEnabled()) return;
    this.timer = setInterval(() => {
      this.processDue().catch((err) => {
        this.logger.warn(
          `Partner outbox sweep failed: ${err?.message ?? err}`,
        );
      });
    }, 30_000);
    this.timer.unref?.();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** Queue a `redeem` callback. Safe to call multiple times. */
  async enqueueRedeem(event: InstrumentConsumedEvent): Promise<void> {
    await this.enqueue(PartnerInstrumentOperation.REDEEM, event);
  }

  /** Queue a `revoke` callback. Safe to call multiple times. */
  async enqueueRevoke(event: InstrumentConsumedEvent): Promise<void> {
    await this.enqueue(PartnerInstrumentOperation.REVOKE, event);
  }

  private async enqueue(
    operation: PartnerInstrumentOperation,
    event: InstrumentConsumedEvent,
  ): Promise<PartnerRedemptionOutbox | null> {
    if (!event.issuanceId) return null;

    const idempotencyKey = `${operation}:${event.issuanceId}:${event.code ?? ''}`;

    try {
      const existing = await this.outboxRepository.findOne({
        where: { idempotencyKey },
      });
      if (existing) return existing;

      const row = this.outboxRepository.create({
        issuanceId: event.issuanceId,
        instrumentType: event.instrumentType,
        instrumentId: event.instrumentId,
        operation,
        code: event.code ?? null,
        idempotencyKey,
        payload: {
          amount: event.amount ?? null,
          note: event.note ?? null,
        },
        status: PartnerOutboxStatus.PENDING,
        nextAttemptAt: new Date(),
        attempts: 0,
      });

      const saved = await this.outboxRepository.save(row);
      // Deliver soon, but out of the request's critical path.
      setTimeout(() => {
        this.processOne(saved.id).catch((err) => {
          this.logger.warn(
            `Partner outbox delivery failed for ${saved.id}: ${err?.message ?? err}`,
          );
        });
      }, 1000).unref?.();
      return saved;
    } catch (err: any) {
      // Unique violation from a concurrent enqueue — treat as success.
      if (err?.code === '23505') {
        try {
          return await this.outboxRepository.findOne({
            where: { idempotencyKey },
          });
        } catch {
          return null;
        }
      }
      this.logger.error(
        `Failed to enqueue ${operation} for issuance ${event.issuanceId}: ${err?.message}`,
      );
      return null;
    }
  }

  @OnEvent(PARTNER_INSTRUMENT_CONSUMED_EVENT)
  async handleConsumed(event: InstrumentConsumedEvent): Promise<void> {
    await this.enqueueRedeem(event);
  }

  /** Process all rows that are due. Public for the reconcile/cron hook. */
  async processDue(limit = 25): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    try {
      const rows = await this.outboxRepository.find({
        where: {
          status: PartnerOutboxStatus.PENDING,
          nextAttemptAt: LessThanOrEqual(new Date()),
        },
        order: { nextAttemptAt: 'ASC' },
        take: limit,
      });
      const failed = await this.outboxRepository.find({
        where: {
          status: PartnerOutboxStatus.FAILED,
          nextAttemptAt: LessThanOrEqual(new Date()),
        },
        order: { nextAttemptAt: 'ASC' },
        take: limit,
      });
      for (const row of [...rows, ...failed]) {
        await this.processOne(row.id);
      }
    } catch (err: any) {
      // A missing table means the migration has not been applied yet; keep
      // the process alive and warn instead of crashing the application.
      if (err?.code === '42P01') {
        this.logger.warn(
          'Partner outbox table is missing — run the AddPartnerScopedInstruments migration.',
        );
        return;
      }
      throw err;
    } finally {
      this.processing = false;
    }
  }

  async processOne(id: string): Promise<void> {
    const row = await this.outboxRepository.findOne({ where: { id } });
    if (!row || row.status === PartnerOutboxStatus.SENT) return;
    if (row.attempts >= MAX_ATTEMPTS) {
      row.status = PartnerOutboxStatus.DEAD;
      await this.outboxRepository.save(row);
      return;
    }

    if (!this.mesh.isEnabled()) {
      // Keep it queued: the integration is disabled, not broken.
      row.lastError = 'MCOM_REWARDS_MESH_ENABLED=false';
      await this.outboxRepository.save(row);
      return;
    }

    try {
      const suffix =
        row.operation === PartnerInstrumentOperation.REVOKE
          ? 'revoke'
          : 'redeem';
      await this.mesh.callPeerByClientId(
        this.mesh.getRewardsClientId(),
        `/api/v1/partner/issuances/${encodeURIComponent(
          row.issuanceId as string,
        )}/${suffix}`,
        {
          method: 'POST',
          timeout: 10_000,
          data: {
            code: row.code,
            note: row.payload?.note ?? undefined,
            instrumentType: row.instrumentType,
          },
        },
        SERVICE_SCOPE_REWARDS_ISSUE,
      );

      row.status = PartnerOutboxStatus.SENT;
      row.sentAt = new Date();
      row.lastError = null;
      await this.outboxRepository.save(row);

      // Secondary, best-effort event channel (existing `/partner/events`).
      void this.emitSecondaryEvent(row);

      this.logger.log(
        `Partner callback ${row.operation} delivered for issuance ${row.issuanceId} (instrument ${row.instrumentId}).`,
      );
    } catch (err: any) {
      const attempts = row.attempts + 1;
      row.attempts = attempts;
      const responseDetail = err?.response?.data
        ? ` — ${JSON.stringify(err.response.data)}`
        : '';
      row.lastError = `${String(err?.message ?? err)}${responseDetail}`.slice(
        0,
        1000,
      );
      row.status =
        attempts >= MAX_ATTEMPTS
          ? PartnerOutboxStatus.DEAD
          : PartnerOutboxStatus.FAILED;
      const backoff = Math.min(
        MAX_BACKOFF_MS,
        BASE_BACKOFF_MS * Math.pow(2, attempts - 1),
      );
      row.nextAttemptAt = new Date(Date.now() + backoff);
      await this.outboxRepository.save(row);

      this.logger.warn(
        `Partner callback ${row.operation} failed for issuance ${row.issuanceId} ` +
          `(attempt ${attempts}/${MAX_ATTEMPTS}): ${row.lastError}`,
      );
    }
  }

  private async emitSecondaryEvent(
    row: PartnerRedemptionOutbox,
  ): Promise<void> {
    try {
      await this.mesh.callPeerByClientId(
        this.mesh.getRewardsClientId(),
        '/api/v1/partner/events',
        {
          method: 'POST',
          timeout: 5000,
          data: {
            type: row.operation === PartnerInstrumentOperation.REVOKE
              ? 'reward.revoked'
              : 'reward.redeemed',
            issuanceId: row.issuanceId,
            code: row.code,
            instrumentType: row.instrumentType,
            instrumentId: row.instrumentId,
            occurredAt: new Date().toISOString(),
          },
        },
        SERVICE_SCOPE_REWARDS_ISSUE,
      );
    } catch (err: any) {
      this.logger.debug(
        `Secondary reward event for ${row.issuanceId} not delivered: ${err?.message}`,
      );
    }
  }
}
