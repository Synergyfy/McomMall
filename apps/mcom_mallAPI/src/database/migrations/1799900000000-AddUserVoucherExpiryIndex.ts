import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Backs the scheduled voucher-expiry sweep.
 *
 * The sweep filters `state = 'active'` and `expires_at <= now()`, ordered by
 * `expires_at`, so a composite index lets it find due rows without scanning
 * the whole wallet table.
 */
export class AddUserVoucherExpiryIndex1799900000000 implements MigrationInterface {
  name = 'AddUserVoucherExpiryIndex1799900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_money_vouchers_state_expires_at"
      ON "user_money_vouchers" ("state", "expires_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_user_money_vouchers_state_expires_at";
    `);
  }
}
