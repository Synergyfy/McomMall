import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * TakeAds prices are entered in GBP pounds by admins but stored as integer
 * pence. Existing rows were written as numeric pounds by migration ...061, so
 * they are converted here before the column type changes.
 */
export class AddTakeadsOfferAudienceAndPence1800000000062
  implements MigrationInterface
{
  name = 'AddTakeadsOfferAudienceAndPence1800000000062';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "takeads_offers"
        ALTER COLUMN "price" TYPE integer
        USING (CASE WHEN "price" IS NULL THEN NULL ELSE ROUND("price" * 100)::integer END)`,
    );

    await queryRunner.query(
      `ALTER TABLE "takeads_offers"
        ADD "visibility" character varying(20) NOT NULL DEFAULT 'public'`,
    );
    await queryRunner.query(
      `ALTER TABLE "takeads_offers"
        ADD "allowedPlanVariantIds" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_offers_visibility" ON "takeads_offers" ("visibility")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_takeads_offers_visibility"`,
    );
    await queryRunner.query(
      `ALTER TABLE "takeads_offers" DROP COLUMN "allowedPlanVariantIds"`,
    );
    await queryRunner.query(
      `ALTER TABLE "takeads_offers" DROP COLUMN "visibility"`,
    );
    await queryRunner.query(
      `ALTER TABLE "takeads_offers"
        ALTER COLUMN "price" TYPE numeric(12,2)
        USING ("price"::numeric / 100)`,
    );
  }
}
