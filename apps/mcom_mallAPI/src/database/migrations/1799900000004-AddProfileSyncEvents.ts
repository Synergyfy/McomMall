import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Durable inbox for MCOM Central `profile.updated` deliveries.
 *
 * Central delivers at-least-once. `eventId` is the idempotency key, so a
 * repeated delivery is acknowledged without re-running the canonical pull.
 * Rows are kept so failed pulls can be inspected and replayed.
 */
export class AddProfileSyncEvents1799900000004 implements MigrationInterface {
  name = 'AddProfileSyncEvents1799900000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "mcom_profile_sync_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "eventId" character varying NOT NULL,
        "eventType" character varying NOT NULL,
        "centralUserId" character varying,
        "status" character varying NOT NULL DEFAULT 'processing',
        "attempts" integer NOT NULL DEFAULT 0,
        "occurredAt" TIMESTAMP WITH TIME ZONE,
        "lastError" text,
        "payload" jsonb,
        "processedAt" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_mcom_profile_sync_events" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_mcom_profile_sync_events_eventId" UNIQUE ("eventId")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mcom_profile_sync_events_status"
         ON "mcom_profile_sync_events" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mcom_profile_sync_events_centralUserId"
         ON "mcom_profile_sync_events" ("centralUserId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_mcom_profile_sync_events_centralUserId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_mcom_profile_sync_events_status"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "mcom_profile_sync_events"`);
  }
}
