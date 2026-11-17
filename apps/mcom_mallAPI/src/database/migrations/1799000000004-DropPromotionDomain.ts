import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes the promotions domain entirely. Loyalty now consists of reward
 * offers (redeemed with points) and the time-bonus offer flow.
 */
export class DropPromotionDomain1799000000004 implements MigrationInterface {
  name = 'DropPromotionDomain1799000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "point_transactions"
      DROP COLUMN IF EXISTS "promotionId";
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "promotion";
    `);

    // Child tables first so FK constraints never block the drop order.
    await queryRunner.query(`DROP TABLE IF EXISTS "saved_promotions" CASCADE;`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "promotion_activities" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "promotion_participants" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "promotion_businesses" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "promotion_included_products" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "promotion_excluded_products" CASCADE;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "promotions" CASCADE;`);

    await queryRunner.query(`DROP TYPE IF EXISTS "promotions_promotionscope_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "promotions_promotiontype_enum";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        CREATE TYPE "promotions_promotionscope_enum" AS ENUM (
          'ALL_LISTINGS',
          'SPECIFIC_LISTINGS',
          'ALL_PRODUCTS',
          'SPECIFIC_PRODUCTS'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        CREATE TYPE "promotions_promotiontype_enum" AS ENUM (
          'MULTIPLIER',
          'BONUS_POINTS'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "promotions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying NOT NULL,
        "description" text,
        "termsAndConditions" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "beginDate" TIMESTAMP,
        "endDate" TIMESTAMP,
        "promotionType" "promotions_promotiontype_enum" NOT NULL,
        "promotionScope" "promotions_promotionscope_enum",
        "multiplier" numeric(5,2),
        "bonusPoints" integer,
        "limitPerCustomer" integer,
        "minimumSpend" bigint NOT NULL DEFAULT 0,
        "points" integer NOT NULL DEFAULT 0,
        "userId" uuid,
        "promoType" character varying(40),
        "targetSegment" character varying(40),
        "boroughVisibility" boolean NOT NULL DEFAULT false,
        "highStreetVisibility" boolean NOT NULL DEFAULT false,
        "featuredPlacement" boolean NOT NULL DEFAULT false,
        "addExtraGift" boolean NOT NULL DEFAULT false,
        "settings" jsonb,
        CONSTRAINT "PK_promotions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_promotions_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "promotion_businesses" (
        "promotion_id" uuid NOT NULL,
        "business_id" uuid NOT NULL,
        CONSTRAINT "PK_promotion_businesses" PRIMARY KEY ("promotion_id", "business_id"),
        CONSTRAINT "FK_promotion_businesses_promotion" FOREIGN KEY ("promotion_id")
          REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_promotion_businesses_business" FOREIGN KEY ("business_id")
          REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "promotion_included_products" (
        "promotion_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        CONSTRAINT "PK_promotion_included_products" PRIMARY KEY ("promotion_id", "product_id"),
        CONSTRAINT "FK_promotion_included_products_promotion" FOREIGN KEY ("promotion_id")
          REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_promotion_included_products_product" FOREIGN KEY ("product_id")
          REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "promotion_excluded_products" (
        "promotion_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        CONSTRAINT "PK_promotion_excluded_products" PRIMARY KEY ("promotion_id", "product_id"),
        CONSTRAINT "FK_promotion_excluded_products_promotion" FOREIGN KEY ("promotion_id")
          REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_promotion_excluded_products_product" FOREIGN KEY ("product_id")
          REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "promotion_participants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "pointsEarned" integer NOT NULL DEFAULT 0,
        "userId" uuid,
        "promotionId" uuid,
        CONSTRAINT "PK_promotion_participants" PRIMARY KEY ("id"),
        CONSTRAINT "FK_promotion_participants_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_promotion_participants_promotion" FOREIGN KEY ("promotionId")
          REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "promotion_activities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "pointsEarned" integer NOT NULL,
        "userId" uuid,
        "promotionId" uuid,
        "participantId" uuid,
        CONSTRAINT "PK_promotion_activities" PRIMARY KEY ("id"),
        CONSTRAINT "FK_promotion_activities_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_promotion_activities_promotion" FOREIGN KEY ("promotionId")
          REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_promotion_activities_participant" FOREIGN KEY ("participantId")
          REFERENCES "promotion_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "saved_promotions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "userId" uuid NOT NULL,
        "promotionId" uuid NOT NULL,
        CONSTRAINT "PK_saved_promotions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_saved_promotions_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_saved_promotions_promotion" FOREIGN KEY ("promotionId")
          REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_saved_promotions_user_promotion"
      ON "saved_promotions" ("userId", "promotionId");
    `);

    await queryRunner.query(`
      ALTER TABLE "point_transactions"
      ADD COLUMN IF NOT EXISTS "promotionId" uuid;
    `);
    await queryRunner.query(`
      ALTER TABLE "point_transactions"
      ADD CONSTRAINT "FK_point_transactions_promotion"
      FOREIGN KEY ("promotionId") REFERENCES "promotions"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "promotion" boolean NOT NULL DEFAULT true;
    `);
  }
}
