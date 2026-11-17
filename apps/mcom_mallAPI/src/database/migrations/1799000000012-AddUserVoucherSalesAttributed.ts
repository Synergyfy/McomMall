import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 3 of COUPON_VOUCHER_ALIGNMENT_PLAN.md: replace the hardcoded
 * `salesImpactBefore = 0` with a real cumulative baseline per wallet.
 *
 * `salesAttributed` is the total value this wallet has driven through the
 * network so far. Each spend snapshots it into the transaction's
 * `salesImpactBefore` / `salesImpactAfter` columns.
 */
export class AddUserVoucherSalesAttributed1799000000012
  implements MigrationInterface
{
  name = 'AddUserVoucherSalesAttributed1799000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_money_vouchers"
        ADD COLUMN IF NOT EXISTS "salesAttributed" bigint NOT NULL DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_money_vouchers"
        DROP COLUMN IF EXISTS "salesAttributed";
    `);
  }
}
