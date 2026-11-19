import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Offers redeemed with loyalty points used to only be attached to an order and
 * deduct points; the monetary discount was computed on the storefront but never
 * persisted or subtracted on the server. This column makes the applied offer
 * discount part of the order ledger.
 */
export class AddOrderOfferDiscount1799900000002 implements MigrationInterface {
  name = 'AddOrderOfferDiscount1799900000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [column] = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'orders'
         AND column_name = 'offer_discount_applied'`,
    );
    if (column) return;

    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "offer_discount_applied" bigint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN IF EXISTS "offer_discount_applied"`,
    );
  }
}
