import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Security-fix batch: wallet refund outbox + missing FK indexes.
 *
 * Purely ADDITIVE — no columns altered, nothing dropped, no data touched:
 *  - creates `failed_wallet_refunds` table (compensating-refund retry outbox)
 *  - adds non-unique indexes on hot FK/status columns
 * Safe to run on a live database; re-runnable via IF NOT EXISTS guards.
 */
export class AddWalletRefundOutboxAndSecurityIndexes1790083000000
  implements MigrationInterface
{
  name = 'AddWalletRefundOutboxAndSecurityIndexes1790083000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enum for outbox status
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."failed_wallet_refunds_status_enum" AS ENUM('pending', 'completed', 'failed'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    // 2. Outbox table
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "failed_wallet_refunds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "mallUserId" character varying NOT NULL, "centralUserId" character varying, "amount" numeric(10,2) NOT NULL, "idempotencyKey" character varying NOT NULL, "walletTransactionId" character varying, "failureReason" text, "attempts" integer NOT NULL DEFAULT '0', "status" "public"."failed_wallet_refunds_status_enum" NOT NULL DEFAULT 'pending', CONSTRAINT "PK_failed_wallet_refunds" PRIMARY KEY ("id"))`,
    );
    // 3. Outbox indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_failed_refund_status" ON "failed_wallet_refunds" ("status")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_failed_refund_idempotency" ON "failed_wallet_refunds" ("idempotencyKey")`,
    );
    // 4. Missing FK/status indexes (read-heavy join + filter columns)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_order_user" ON "orders" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_order_business" ON "orders" ("businessId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_order_status" ON "orders" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_order_item_order" ON "order_items" ("orderId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_order_item_product" ON "order_items" ("productId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_service_booking_user" ON "service_bookings" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_service_booking_service" ON "service_bookings" ("serviceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_service_booking_status" ON "service_bookings" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_booking_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_booking_service"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_booking_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_item_product"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_item_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_business"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_failed_refund_idempotency"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_failed_refund_status"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "failed_wallet_refunds"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."failed_wallet_refunds_status_enum"`,
    );
  }
}
