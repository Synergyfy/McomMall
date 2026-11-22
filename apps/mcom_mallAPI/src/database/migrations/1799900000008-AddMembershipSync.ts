import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MCOM Central `membership.updated` support.
 *
 * 1. `plan_variants.external_plan_id` lets a Central membership package
 *    (`package.externalPlanId`) map onto the local sellable variant.
 * 2. `mcom_membership_sync_events` is a durable inbox. Central delivers
 *    at-least-once, so `eventId` is the idempotency key; rows are retained so
 *    failed deliveries can be inspected and replayed.
 */
export class AddMembershipSync1799900000008 implements MigrationInterface {
  name = 'AddMembershipSync1799900000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plan_variants"
         ADD COLUMN IF NOT EXISTS "external_plan_id" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_plan_variants_external_plan_id"
         ON "plan_variants" ("external_plan_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "mcom_membership_sync_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "eventId" character varying NOT NULL,
        "eventType" character varying NOT NULL,
        "centralUserId" character varying,
        "businessId" character varying,
        "externalPlanId" character varying,
        "status" character varying NOT NULL DEFAULT 'processing',
        "attempts" integer NOT NULL DEFAULT 0,
        "occurredAt" TIMESTAMP WITH TIME ZONE,
        "lastError" text,
        "payload" jsonb,
        "processedAt" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_mcom_membership_sync_events" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_mcom_membership_sync_events_eventId" UNIQUE ("eventId")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mcom_membership_sync_events_status"
         ON "mcom_membership_sync_events" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mcom_membership_sync_events_centralUserId"
         ON "mcom_membership_sync_events" ("centralUserId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mcom_membership_sync_events_businessId"
         ON "mcom_membership_sync_events" ("businessId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_mcom_membership_sync_events_businessId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_mcom_membership_sync_events_centralUserId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_mcom_membership_sync_events_status"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "mcom_membership_sync_events"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_plan_variants_external_plan_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_variants" DROP COLUMN IF EXISTS "external_plan_id"`,
    );
  }
}
