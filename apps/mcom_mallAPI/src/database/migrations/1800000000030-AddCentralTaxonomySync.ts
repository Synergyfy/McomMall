import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCentralTaxonomySync1800000000030 implements MigrationInterface {
  name = 'AddCentralTaxonomySync1800000000030';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sectors" ADD COLUMN IF NOT EXISTS "centralId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "sectors" ADD COLUMN IF NOT EXISTS "centralSlug" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "sectors" ADD COLUMN IF NOT EXISTS "centralSyncedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_sectors_centralId" ON "sectors" ("centralId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "taxonomy_categories" ADD COLUMN IF NOT EXISTS "centralId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "taxonomy_categories" ADD COLUMN IF NOT EXISTS "centralSlug" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "taxonomy_categories" ADD COLUMN IF NOT EXISTS "centralSyncedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_taxonomy_categories_centralId" ON "taxonomy_categories" ("centralId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "taxonomy_subcategories" ADD COLUMN IF NOT EXISTS "centralId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "taxonomy_subcategories" ADD COLUMN IF NOT EXISTS "centralSlug" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "taxonomy_subcategories" ADD COLUMN IF NOT EXISTS "centralSyncedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_taxonomy_subcategories_centralId" ON "taxonomy_subcategories" ("centralId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_taxonomy_subcategories_centralId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "taxonomy_subcategories" DROP COLUMN IF EXISTS "centralSyncedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "taxonomy_subcategories" DROP COLUMN IF EXISTS "centralSlug"`,
    );
    await queryRunner.query(
      `ALTER TABLE "taxonomy_subcategories" DROP COLUMN IF EXISTS "centralId"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_taxonomy_categories_centralId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "taxonomy_categories" DROP COLUMN IF EXISTS "centralSyncedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "taxonomy_categories" DROP COLUMN IF EXISTS "centralSlug"`,
    );
    await queryRunner.query(
      `ALTER TABLE "taxonomy_categories" DROP COLUMN IF EXISTS "centralId"`,
    );

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sectors_centralId"`);
    await queryRunner.query(
      `ALTER TABLE "sectors" DROP COLUMN IF EXISTS "centralSyncedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sectors" DROP COLUMN IF EXISTS "centralSlug"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sectors" DROP COLUMN IF EXISTS "centralId"`,
    );
  }
}
