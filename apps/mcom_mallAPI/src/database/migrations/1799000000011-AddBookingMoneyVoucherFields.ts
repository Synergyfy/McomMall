import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 2 of COUPON_VOUCHER_ALIGNMENT_PLAN.md: money-engine wallets can pay
 * service bookings. Persisted separately from the native voucher columns.
 *
 * Additive and nullable so the previous application version keeps working.
 */
export class AddBookingMoneyVoucherFields1799000000011
  implements MigrationInterface
{
  name = 'AddBookingMoneyVoucherFields1799000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "service_bookings"
        ADD COLUMN IF NOT EXISTS "moneyVoucherCode" character varying,
        ADD COLUMN IF NOT EXISTS "moneyVoucherAmountApplied" bigint NOT NULL DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "service_bookings"
        DROP COLUMN IF EXISTS "moneyVoucherAmountApplied",
        DROP COLUMN IF EXISTS "moneyVoucherCode";
    `);
  }
}
