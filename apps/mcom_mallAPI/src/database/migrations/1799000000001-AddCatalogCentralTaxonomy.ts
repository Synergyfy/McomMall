import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Products and services inherit sector/category/sub-category from the MCOM
 * Central business profile. The catalog rows already stored category labels;
 * this adds the missing sector column and backfills every existing row from the
 * Central mirror on the owning business.
 */
export class AddCatalogCentralTaxonomy1799000000001
  implements MigrationInterface
{
  name = 'AddCatalogCentralTaxonomy1799000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS "sector" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "sector" character varying`,
    );

    await queryRunner.query(`
      UPDATE "Products" AS p
      SET
        "sector" = COALESCE(s."name", b."industry", p."sector"),
        "category" = COALESCE(
          NULLIF(b."centralCategory", ''),
          c."name",
          p."category"
        ),
        "subCategory" = COALESCE(
          NULLIF(b."centralSubCategory", ''),
          sc."name",
          p."subCategory"
        )
      FROM "businesses" AS b
      LEFT JOIN "sectors" AS s ON s."id" = b."sectorId"
      LEFT JOIN "taxonomy_categories" AS c ON c."id" = b."categoryId"
      LEFT JOIN "taxonomy_subcategories" AS sc ON sc."id" = b."subCategoryId"
      WHERE p."businessId" = b."id"
    `);

    await queryRunner.query(`
      UPDATE "services" AS sv
      SET
        "sector" = COALESCE(s."name", b."industry", sv."sector"),
        "category" = COALESCE(
          NULLIF(b."centralCategory", ''),
          c."name",
          sv."category"
        ),
        "subcategory" = COALESCE(
          NULLIF(b."centralSubCategory", ''),
          sc."name",
          sv."subcategory"
        )
      FROM "businesses" AS b
      LEFT JOIN "sectors" AS s ON s."id" = b."sectorId"
      LEFT JOIN "taxonomy_categories" AS c ON c."id" = b."categoryId"
      LEFT JOIN "taxonomy_subcategories" AS sc ON sc."id" = b."subCategoryId"
      WHERE sv."businessId" = b."id"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN IF EXISTS "sector"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Products" DROP COLUMN IF EXISTS "sector"`,
    );
  }
}
