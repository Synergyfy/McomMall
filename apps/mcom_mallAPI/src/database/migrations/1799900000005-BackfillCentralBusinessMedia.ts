import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Before this change the Central sync copied `logoUrl` but never `bannerUrl`
 * (and never the gallery), even though the canonical payload stored in
 * `centralProfile` already contained both. Business rows synced before the fix
 * therefore render the fallback cover.
 *
 * Backfill the media fields from the mirror we already have. Safe to re-run:
 * only fills empty columns and only from a non-empty central value.
 */
export class BackfillCentralBusinessMedia1799900000005
  implements MigrationInterface
{
  name = 'BackfillCentralBusinessMedia1799900000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "businesses"
      SET "bannerUrl" = NULLIF("centralProfile"->>'bannerUrl', '')
      WHERE "bannerUrl" IS NULL
        AND "centralProfile" IS NOT NULL
        AND NULLIF("centralProfile"->>'bannerUrl', '') IS NOT NULL
    `);

    await queryRunner.query(`
      UPDATE "businesses"
      SET "logoUrl" = NULLIF("centralProfile"->>'logoUrl', '')
      WHERE ("logoUrl" IS NULL OR "logoUrl" = '')
        AND "centralProfile" IS NOT NULL
        AND NULLIF("centralProfile"->>'logoUrl', '') IS NOT NULL
    `);
  }

  public async down(): Promise<void> {
    // Not reversible: backfilled values are indistinguishable from values that
    // were already present. Leaving them in place is harmless.
  }
}
