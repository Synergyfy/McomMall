import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 2 of COUPON_VOUCHER_ALIGNMENT_PLAN.md: money-engine wallets can pay
 * online orders. The code and applied amount are persisted separately from
 * the native `voucherCode` so the two ledgers are never conflated.
 *
 * Additive and nullable so the previous application version keeps working.
 */
export class AddOrderMoneyVoucherFields1799000000010
  implements MigrationInterface
{
  name = 'AddOrderMoneyVoucherFields1799000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
        ADD COLUMN IF NOT EXISTS "moneyVoucherCode" character varying,
        ADD COLUMN IF NOT EXISTS "moneyVoucherAmountApplied" bigint NOT NULL DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
        DROP COLUMN IF EXISTS "moneyVoucherAmountApplied",
        DROP COLUMN IF EXISTS "moneyVoucherCode";
    `);
  }
}
