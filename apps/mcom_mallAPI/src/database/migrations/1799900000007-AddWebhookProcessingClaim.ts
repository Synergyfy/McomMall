import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Concurrent deliveries of the same webhook (for example Central's automatic
 * delivery plus a retry) must not run business handlers at the same time: the
 * loser can hit a duplicate and trigger a compensating refund.
 *
 * `processingAt` is an atomic claim with a 5-minute stale timeout.
 */
export class AddWebhookProcessingClaim1799900000007
  implements MigrationInterface
{
  name = 'AddWebhookProcessingClaim1799900000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "mcom_pay_webhook_events"
        ADD COLUMN IF NOT EXISTS "processingAt" timestamptz;
      CREATE INDEX IF NOT EXISTS "IDX_mcom_webhook_processing"
        ON "mcom_pay_webhook_events" ("processingAt");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_mcom_webhook_processing";
      ALTER TABLE "mcom_pay_webhook_events"
        DROP COLUMN IF EXISTS "processingAt";
    `);
  }
}
