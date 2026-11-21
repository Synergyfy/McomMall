import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Quote-bound MCOM Pay checkout intents + local split context.
 *
 * `mcom_payment_intents` is written before the buyer pays, which lets the
 * payment.succeeded webhook complete an order after a closed tab. The
 * `mcom_pay_charges.intent` / `splits` columns mirror the ledger label and
 * payee allocation used for each charge so local seller earnings can be
 * reconciled without relying on Central returning `metadata`.
 */
export class AddMcomPaymentIntents1799900000006 implements MigrationInterface {
  name = 'AddMcomPaymentIntents1799900000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "mcom_pay_charges"
        ADD COLUMN IF NOT EXISTS "intent" varchar,
        ADD COLUMN IF NOT EXISTS "splits" jsonb;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "mcom_payment_intents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "status" varchar NOT NULL DEFAULT 'pending',
        "provider" varchar NOT NULL,
        "amountMinor" bigint NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'GBP',
        "chargeId" varchar,
        "providerRef" varchar,
        "idempotencyKey" varchar NOT NULL,
        "reference" varchar,
        "quote" jsonb NOT NULL,
        "splits" jsonb,
        "metadata" jsonb,
        "completedOrderId" uuid,
        "failureReason" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_mcom_payment_intents" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_mcom_payment_intent_idempotency"
        ON "mcom_payment_intents" ("idempotencyKey");
      CREATE INDEX IF NOT EXISTS "IDX_mcom_payment_intent_charge"
        ON "mcom_payment_intents" ("chargeId");
      CREATE INDEX IF NOT EXISTS "IDX_mcom_payment_intent_status"
        ON "mcom_payment_intents" ("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "mcom_payment_intents"`);
    await queryRunner.query(`
      ALTER TABLE "mcom_pay_charges"
        DROP COLUMN IF EXISTS "splits",
        DROP COLUMN IF EXISTS "intent";
    `);
  }
}
