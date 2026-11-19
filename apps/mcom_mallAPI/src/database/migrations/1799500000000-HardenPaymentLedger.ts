import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Hardens the local MCOM Pay ledger:
 *  - expands the charge mirror with fee/net/status metadata,
 *  - adds a one-charge-per-business-event allocation table,
 *  - adds a durable webhook inbox,
 *  - links business payment rows back to the Central charge.
 *
 * Additive and re-runnable.
 */
export class HardenPaymentLedger1799500000000 implements MigrationInterface {
  name = 'HardenPaymentLedger1799500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Expand the Central charge mirror.
    await queryRunner.query(`
      ALTER TABLE "mcom_pay_charges"
        ADD COLUMN IF NOT EXISTS "appClientId" varchar,
        ADD COLUMN IF NOT EXISTS "feeMinor" bigint,
        ADD COLUMN IF NOT EXISTS "netMinor" bigint,
        ADD COLUMN IF NOT EXISTS "refundedMinor" bigint NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "description" text,
        ADD COLUMN IF NOT EXISTS "mcomUserId" varchar,
        ADD COLUMN IF NOT EXISTS "externalCustomerId" varchar,
        ADD COLUMN IF NOT EXISTS "provider" varchar,
        ADD COLUMN IF NOT EXISTS "walletDebitAmount" bigint,
        ADD COLUMN IF NOT EXISTS "paidAt" timestamptz;
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_mcom_pay_charge_reference"
        ON "mcom_pay_charges" ("reference");
      CREATE INDEX IF NOT EXISTS "IDX_mcom_pay_charge_user"
        ON "mcom_pay_charges" ("mcomUserId");
    `);

    // 2. Allocation: one charge -> exactly one business event.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_allocations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "mcomChargeId" character varying NOT NULL,
        "purpose" character varying NOT NULL,
        "entityType" character varying NOT NULL,
        "entityId" character varying NOT NULL,
        "userId" character varying NOT NULL,
        "amountMinor" bigint NOT NULL,
        "currency" character varying(3) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_payment_allocations" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_payment_allocations_charge" UNIQUE ("mcomChargeId")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_payment_allocation_entity"
        ON "payment_allocations" ("purpose", "entityType", "entityId");
      CREATE INDEX IF NOT EXISTS "IDX_payment_allocation_user"
        ON "payment_allocations" ("userId");
    `);

    // 3. Durable webhook inbox.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "mcom_pay_webhook_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "event" character varying NOT NULL,
        "chargeId" character varying,
        "payload" jsonb NOT NULL,
        "rawHash" character varying NOT NULL,
        "signatureVerified" boolean NOT NULL DEFAULT true,
        "processedAt" timestamptz,
        "attempts" integer NOT NULL DEFAULT 0,
        "lastError" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_mcom_pay_webhook_events" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_mcom_pay_webhook_events_hash" UNIQUE ("rawHash")
      );
      CREATE INDEX IF NOT EXISTS "IDX_mcom_pay_webhook_charge"
        ON "mcom_pay_webhook_events" ("chargeId");
    `);

    // 4. Link business payment rows to the Central charge.
    await queryRunner.query(`
      ALTER TABLE "order_payments"
        ADD COLUMN IF NOT EXISTS "mcomChargeId" varchar,
        ADD COLUMN IF NOT EXISTS "providerRef" varchar,
        ADD COLUMN IF NOT EXISTS "feeMinor" bigint,
        ADD COLUMN IF NOT EXISTS "netMinor" bigint,
        ADD COLUMN IF NOT EXISTS "status" varchar;
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_order_payments_mcom_charge"
        ON "order_payments" ("mcomChargeId");

      ALTER TABLE "membership_payments"
        ADD COLUMN IF NOT EXISTS "mcomChargeId" varchar,
        ADD COLUMN IF NOT EXISTS "providerRef" varchar,
        ADD COLUMN IF NOT EXISTS "feeMinor" bigint,
        ADD COLUMN IF NOT EXISTS "netMinor" bigint,
        ADD COLUMN IF NOT EXISTS "status" varchar;
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_membership_payments_mcom_charge"
        ON "membership_payments" ("mcomChargeId");

      ALTER TABLE "payment_histories"
        ADD COLUMN IF NOT EXISTS "mcomChargeId" varchar,
        ADD COLUMN IF NOT EXISTS "providerRef" varchar,
        ADD COLUMN IF NOT EXISTS "feeMinor" bigint,
        ADD COLUMN IF NOT EXISTS "netMinor" bigint,
        ADD COLUMN IF NOT EXISTS "status" varchar;
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_payment_histories_mcom_charge"
        ON "payment_histories" ("mcomChargeId");

      ALTER TABLE "service_payments"
        ADD COLUMN IF NOT EXISTS "mcomChargeId" varchar,
        ADD COLUMN IF NOT EXISTS "providerRef" varchar,
        ADD COLUMN IF NOT EXISTS "feeMinor" bigint,
        ADD COLUMN IF NOT EXISTS "netMinor" bigint,
        ADD COLUMN IF NOT EXISTS "status" varchar;
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_service_payments_mcom_charge"
        ON "service_payments" ("mcomChargeId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_service_payments_mcom_charge";
      DROP INDEX IF EXISTS "UQ_payment_histories_mcom_charge";
      DROP INDEX IF EXISTS "UQ_membership_payments_mcom_charge";
      DROP INDEX IF EXISTS "UQ_order_payments_mcom_charge";
      ALTER TABLE "service_payments"
        DROP COLUMN IF EXISTS "status",
        DROP COLUMN IF EXISTS "netMinor",
        DROP COLUMN IF EXISTS "feeMinor",
        DROP COLUMN IF EXISTS "providerRef",
        DROP COLUMN IF EXISTS "mcomChargeId";
      ALTER TABLE "payment_histories"
        DROP COLUMN IF EXISTS "status",
        DROP COLUMN IF EXISTS "netMinor",
        DROP COLUMN IF EXISTS "feeMinor",
        DROP COLUMN IF EXISTS "providerRef",
        DROP COLUMN IF EXISTS "mcomChargeId";
      ALTER TABLE "membership_payments"
        DROP COLUMN IF EXISTS "status",
        DROP COLUMN IF EXISTS "netMinor",
        DROP COLUMN IF EXISTS "feeMinor",
        DROP COLUMN IF EXISTS "providerRef",
        DROP COLUMN IF EXISTS "mcomChargeId";
      ALTER TABLE "order_payments"
        DROP COLUMN IF EXISTS "status",
        DROP COLUMN IF EXISTS "netMinor",
        DROP COLUMN IF EXISTS "feeMinor",
        DROP COLUMN IF EXISTS "providerRef",
        DROP COLUMN IF EXISTS "mcomChargeId";
      DROP TABLE IF EXISTS "mcom_pay_webhook_events";
      DROP TABLE IF EXISTS "payment_allocations";
      ALTER TABLE "mcom_pay_charges"
        DROP COLUMN IF EXISTS "paidAt",
        DROP COLUMN IF EXISTS "walletDebitAmount",
        DROP COLUMN IF EXISTS "provider",
        DROP COLUMN IF EXISTS "externalCustomerId",
        DROP COLUMN IF EXISTS "mcomUserId",
        DROP COLUMN IF EXISTS "description",
        DROP COLUMN IF EXISTS "refundedMinor",
        DROP COLUMN IF EXISTS "netMinor",
        DROP COLUMN IF EXISTS "feeMinor",
        DROP COLUMN IF EXISTS "appClientId";
    `);
  }
}
