import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { expireDueVouchers } from './voucher-expiry.util';

export const VOUCHER_EXPIRY_CRON_NAME = 'voucher-expiry-sweep';

/**
 * Primary expiry mechanism for issued wallets.
 *
 * `MoneyEngineService` still checks expiry on read/write as a safety net, but
 * this service is what actually moves rows to `expired` on time — including
 * any backlog that accrued while the API was down (boot-time catch-up).
 */
@Injectable()
export class VoucherExpiryService implements OnApplicationBootstrap {
  private readonly logger = new Logger(VoucherExpiryService.name);
  private sweeping = false;

  constructor(private readonly dataSource: DataSource) {}

  /** Catch up on anything that expired while this instance was offline. */
  onApplicationBootstrap(): void {
    void this.sweepExpiredVouchers();
  }

  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: VOUCHER_EXPIRY_CRON_NAME,
    timeZone: 'UTC',
  })
  async handleExpirySweep(): Promise<void> {
    await this.sweepExpiredVouchers();
  }

  /**
   * Expire every wallet whose `expiresAt` has passed.
   *
   * Safe to call from multiple instances: the query uses
   * `FOR UPDATE SKIP LOCKED`, so workers take disjoint batches. The local
   * `sweeping` flag prevents overlapping ticks inside one process.
   *
   * @returns number of wallets transitioned to `expired`.
   */
  async sweepExpiredVouchers(now: Date = new Date()): Promise<number> {
    if (this.sweeping) {
      this.logger.debug(
        'Voucher expiry sweep already in progress; skipping tick.',
      );
      return 0;
    }

    this.sweeping = true;
    try {
      const expired = await expireDueVouchers(this.dataSource, now);
      if (expired > 0) {
        this.logger.log(
          `Expired ${expired} voucher wallet(s) past their expiry.`,
        );
      }
      return expired;
    } catch (error: any) {
      this.logger.error(
        `Voucher expiry sweep failed: ${error?.message ?? error}`,
        error?.stack,
      );
      return 0;
    } finally {
      this.sweeping = false;
    }
  }
}
