import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Local index of centralized MCOM Pay charges. Additive and re-runnable.
 *
 * The charge itself lives in MCOM Central; this table only stores the mapping
 * from provider handles (Stripe PaymentIntent / PayPal order) to the MCOM
 * charge id so verification and webhook reconciliation survive restarts.
 */
export class CreateMcomPayCharges1792000000000
  implements MigrationInterface
{
  name = 'CreateMcomPayCharges1792000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "mcom_pay_charges" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "chargeId" character varying NOT NULL,
        "providerRef" character varying,
        "method" character varying NOT NULL,
        "amountMinor" bigint NOT NULL,
        "currency" character varying(3) NOT NULL,
        "reference" character varying,
        "status" character varying NOT NULL,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_mcom_pay_charges" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_mcom_pay_charges_chargeId" UNIQUE ("chargeId")
      );
      CREATE INDEX IF NOT EXISTS "IDX_mcom_pay_charge_provider_ref"
        ON "mcom_pay_charges" ("providerRef");
      CREATE INDEX IF NOT EXISTS "IDX_mcom_pay_charge_status"
        ON "mcom_pay_charges" ("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "mcom_pay_charges"`);
  }
}
