import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Persist voucher redemption on product orders, mirroring the existing
 * coupon/gift-card columns. Additive and nullable/defaulted so rolling back to
 * the previous application version keeps working.
 */
export class AddOrderVoucherFields1795000000000 implements MigrationInterface {
  name = 'AddOrderVoucherFields1795000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
        ADD COLUMN IF NOT EXISTS "voucherCode" character varying,
        ADD COLUMN IF NOT EXISTS "voucherAmountApplied" double precision NOT NULL DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
        DROP COLUMN IF EXISTS "voucherAmountApplied",
        DROP COLUMN IF EXISTS "voucherCode";
    `);
  }
}
