import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the admin approval workflow to every merchant-authored catalog item
 * that shoppers can buy or book.
 *
 * Rows created before this migration are backfilled to `approved` so the live
 * catalogue keeps working. Rows created after it start as `pending` and stay
 * hidden from shoppers until an admin approves them.
 *
 * `adminDisabled` is the separate "delisted by admin" switch; republishing
 * only clears that flag and never bypasses approval.
 */
export class AddCatalogApprovalWorkflow1799900000001 implements MigrationInterface {
  name = 'AddCatalogApprovalWorkflow1799900000001';

  private readonly tables = [
    'Products',
    'services',
    'gift_card_templates',
    'voucher_products',
    'coupon_products',
    'coupons',
    'offers',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of this.tables) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "approvalStatus" character varying NOT NULL DEFAULT 'pending'`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "adminDisabled" boolean NOT NULL DEFAULT false`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "reviewNote" text`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "reviewedBy" uuid`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP`,
      );

      // Everything that already existed was live before approval was
      // introduced, so it must not disappear from the storefront.
      await queryRunner.query(
        `UPDATE "${table}" SET "approvalStatus" = 'approved' WHERE "approvalStatus" = 'pending'`,
      );

      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "IDX_${table}_approval_status" ON "${table}" ("approvalStatus")`,
      );
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "IDX_${table}_admin_disabled" ON "${table}" ("adminDisabled")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of this.tables) {
      await queryRunner.query(
        `DROP INDEX IF EXISTS "IDX_${table}_approval_status"`,
      );
      await queryRunner.query(
        `DROP INDEX IF EXISTS "IDX_${table}_admin_disabled"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "reviewedAt"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "reviewedBy"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "reviewNote"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "approvalStatus"`,
      );
    }

    // `adminDisabled` pre-dates this migration on products and services; only
    // the newly moderated tables should lose it when rolling back.
    for (const table of [
      'gift_card_templates',
      'voucher_products',
      'coupon_products',
      'coupons',
      'offers',
    ]) {
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "adminDisabled"`,
      );
    }
  }
}
