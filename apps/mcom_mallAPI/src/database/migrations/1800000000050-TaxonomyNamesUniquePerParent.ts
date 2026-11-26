import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * A category/subcategory name is only unique within its parent. Legacy Mall
 * rows can share a name with a Central Hub row that sits under a different
 * parent, so the global name constraint blocks mirroring those rows.
 */
export class TaxonomyNamesUniquePerParent1800000000050
  implements MigrationInterface
{
  name = 'TaxonomyNamesUniquePerParent1800000000050';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "taxonomy_categories" DROP CONSTRAINT IF EXISTS "UQ_52af5969dc4b46a59d531a40a99"`,
    );
    await queryRunner.query(
      `ALTER TABLE "taxonomy_subcategories" DROP CONSTRAINT IF EXISTS "UQ_3f891eca12f85ed9589b047c3ce"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_taxonomy_categories_parent_name" ON "taxonomy_categories" ("sectorId", "name")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_taxonomy_subcategories_parent_name" ON "taxonomy_subcategories" ("categoryId", "name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_taxonomy_subcategories_parent_name"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_taxonomy_categories_parent_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "taxonomy_subcategories" ADD CONSTRAINT "UQ_3f891eca12f85ed9589b047c3ce" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "taxonomy_categories" ADD CONSTRAINT "UQ_52af5969dc4b46a59d531a40a99" UNIQUE ("name")`,
    );
  }
}
