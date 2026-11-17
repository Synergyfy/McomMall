import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Offers are always scoped to the merchant's single listing, so the
 * offer scope setting and the offer <-> business join table are no longer
 * needed. Ownership is already tracked through `offers."userId"`.
 */
export class RemoveOfferScopeAndListingLinks1799000000003
  implements MigrationInterface
{
  name = 'RemoveOfferScopeAndListingLinks1799000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "offers" DROP COLUMN IF EXISTS "offerScope";
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "offer_businesses" CASCADE;`);
    await queryRunner.query(`
      DO $$
      DECLARE
        enum_name text;
      BEGIN
        FOR enum_name IN
          SELECT t.typname
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE t.typtype = 'e'
            AND lower(t.typname) LIKE '%offerscope%'
        LOOP
          EXECUTE format('DROP TYPE IF EXISTS %I', enum_name);
        END LOOP;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        CREATE TYPE "offers_offerscope_enum" AS ENUM (
          'ALL_LISTINGS',
          'SPECIFIC_LISTINGS',
          'SPECIFIC_PRODUCTS'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      ALTER TABLE "offers"
      ADD COLUMN IF NOT EXISTS "offerScope" "offers_offerscope_enum"
      NOT NULL DEFAULT 'ALL_LISTINGS';
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "offer_businesses" (
        "offer_id" uuid NOT NULL,
        "business_id" uuid NOT NULL,
        CONSTRAINT "PK_offer_businesses" PRIMARY KEY ("offer_id", "business_id"),
        CONSTRAINT "FK_offer_businesses_offer" FOREIGN KEY ("offer_id")
          REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_offer_businesses_business" FOREIGN KEY ("business_id")
          REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_offer_businesses_offer"
      ON "offer_businesses" ("offer_id");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_offer_businesses_business"
      ON "offer_businesses" ("business_id");
    `);
  }
}
