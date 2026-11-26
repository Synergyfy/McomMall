import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds Central Hub taxonomy IDs to promotional offers and backfills them from
 * the existing name columns using the locally mirrored taxonomy rows. Name
 * columns are kept so legacy records and API clients continue to work.
 */
export class AddPromotionalOfferCentralTaxonomy1800000000040
  implements MigrationInterface
{
  name = 'AddPromotionalOfferCentralTaxonomy1800000000040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promotional_offers" ADD COLUMN IF NOT EXISTS "sectorId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotional_offers" ADD COLUMN IF NOT EXISTS "categoryId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotional_offers" ADD COLUMN IF NOT EXISTS "subCategoryId" character varying`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_promotional_offers_sector_id" ON "promotional_offers" ("sectorId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_promotional_offers_category_id" ON "promotional_offers" ("categoryId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_promotional_offers_subcategory_id" ON "promotional_offers" ("subCategoryId")`,
    );

    // Best-effort backfill: only offers whose stored name matches a mirrored
    // taxonomy row are linked. Unmatched names are left for the admin to fix.
    await queryRunner.query(`
      UPDATE "promotional_offers" AS offer
      SET "sectorId" = sector."centralId"
      FROM "sectors" AS sector
      WHERE offer."sectorId" IS NULL
        AND sector."centralId" IS NOT NULL
        AND lower(btrim(offer."sector")) = lower(btrim(sector."name"))
    `);
    await queryRunner.query(`
      UPDATE "promotional_offers" AS offer
      SET "categoryId" = category."centralId"
      FROM "taxonomy_categories" AS category
      WHERE offer."categoryId" IS NULL
        AND category."centralId" IS NOT NULL
        AND lower(btrim(offer."category")) = lower(btrim(category."name"))
    `);
    await queryRunner.query(`
      UPDATE "promotional_offers" AS offer
      SET "subCategoryId" = subcategory."centralId"
      FROM "taxonomy_subcategories" AS subcategory
      WHERE offer."subCategoryId" IS NULL
        AND subcategory."centralId" IS NOT NULL
        AND lower(btrim(offer."subCategory")) = lower(btrim(subcategory."name"))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_promotional_offers_subcategory_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_promotional_offers_category_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_promotional_offers_sector_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotional_offers" DROP COLUMN IF EXISTS "subCategoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotional_offers" DROP COLUMN IF EXISTS "categoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotional_offers" DROP COLUMN IF EXISTS "sectorId"`,
    );
  }
}
