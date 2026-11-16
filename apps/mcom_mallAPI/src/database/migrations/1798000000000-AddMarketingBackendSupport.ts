import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Marketing section backend support:
 *  - tenant-scoped point transactions
 *  - loyalty branding / tiers and richer rules
 *  - first-class promotion marketing metadata + decimal multipliers
 *  - gift card template logo/spending locations
 *  - notification content columns
 *  - coupon product catalogue + coupon artwork/limits
 */
export class AddMarketingBackendSupport1798000000000
  implements MigrationInterface
{
  name = 'AddMarketingBackendSupport1798000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- point_transactions ---
    await queryRunner.query(
      `ALTER TABLE "point_transactions" ADD COLUMN IF NOT EXISTS "business_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "point_transactions" ADD COLUMN IF NOT EXISTS "reason" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "point_transactions" ADD COLUMN IF NOT EXISTS "source" character varying(32) NOT NULL DEFAULT 'manual'`,
    );
    await queryRunner.query(
      `ALTER TABLE "point_transactions" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_point_transactions_business" ON "point_transactions" ("business_id")`,
    );
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_point_transactions_business'
        ) THEN
          ALTER TABLE "point_transactions"
            ADD CONSTRAINT "FK_point_transactions_business"
            FOREIGN KEY ("business_id") REFERENCES "businesses"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    // --- loyalty_settings ---
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" ADD COLUMN IF NOT EXISTS "programName" character varying(120)`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" ADD COLUMN IF NOT EXISTS "brandColor" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" ADD COLUMN IF NOT EXISTS "accentColor" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" ADD COLUMN IF NOT EXISTS "logoUrl" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" ADD COLUMN IF NOT EXISTS "heroImageUrl" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" ADD COLUMN IF NOT EXISTS "tierConfig" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" ADD COLUMN IF NOT EXISTS "redemptionMode" character varying(32)`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" ADD COLUMN IF NOT EXISTS "redemptionValue" numeric(10,2)`,
    );

    // --- loyalty_rules ---
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loyalty_rules_trigger_enum') THEN
          CREATE TYPE "public"."loyalty_rules_trigger_enum" AS ENUM(
            'visit', 'purchase', 'booking', 'review', 'referral', 'share', 'signup', 'all'
          );
        END IF;
      END $$;
    `);
    await queryRunner.query(
      `ALTER TABLE "loyalty_rules" ADD COLUMN IF NOT EXISTS "trigger" "public"."loyalty_rules_trigger_enum" NOT NULL DEFAULT 'all'`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_rules" ADD COLUMN IF NOT EXISTS "targetSegment" character varying(64)`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_rules" ADD COLUMN IF NOT EXISTS "frequencyLimit" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_rules" ADD COLUMN IF NOT EXISTS "minSpend" numeric(10,2)`,
    );

    // --- promotions ---
    await queryRunner.query(
      `ALTER TABLE "promotions" ALTER COLUMN "multiplier" TYPE numeric(5,2) USING "multiplier"::numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD COLUMN IF NOT EXISTS "promoType" character varying(40)`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD COLUMN IF NOT EXISTS "targetSegment" character varying(40)`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD COLUMN IF NOT EXISTS "boroughVisibility" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD COLUMN IF NOT EXISTS "highStreetVisibility" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD COLUMN IF NOT EXISTS "featuredPlacement" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD COLUMN IF NOT EXISTS "addExtraGift" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD COLUMN IF NOT EXISTS "settings" jsonb`,
    );

    // --- gift_card_templates ---
    await queryRunner.query(
      `ALTER TABLE "gift_card_templates" ADD COLUMN IF NOT EXISTS "logo_url" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "gift_card_templates" ADD COLUMN IF NOT EXISTS "spending_locations" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "gift_card_templates" ADD COLUMN IF NOT EXISTS "preview_svg" text`,
    );

    // --- notifications ---
    await queryRunner.query(
      `ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "title" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "message" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "channel" character varying(32) NOT NULL DEFAULT 'in_app'`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "entityId" DROP NOT NULL`,
    );

    // --- coupons ---
    await queryRunner.query(
      `ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "background_image_url" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "individual_use_only" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "min_spend" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "max_spend" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "allowed_emails" jsonb`,
    );

    // --- coupon_products ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "coupon_products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "description" text,
        "fixedAmounts" numeric array,
        "allowCustomAmount" boolean NOT NULL DEFAULT false,
        "minCustomAmount" numeric(10,2),
        "maxCustomAmount" numeric(10,2),
        "isEnabled" boolean NOT NULL DEFAULT true,
        "expiryDays" integer,
        "backgroundImage" character varying(255),
        "textColor" character varying(50),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "userId" uuid,
        "allowReloading" boolean NOT NULL DEFAULT false,
        "bonusThreshold" numeric(10,2),
        "bonusAmount" numeric(10,2),
        CONSTRAINT "PK_coupon_products" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_coupon_products_user'
        ) THEN
          ALTER TABLE "coupon_products"
            ADD CONSTRAINT "FK_coupon_products_user"
            FOREIGN KEY ("userId") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_coupon_products_user" ON "coupon_products" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "coupon_products"`);

    await queryRunner.query(
      `ALTER TABLE "coupons" DROP COLUMN IF EXISTS "allowed_emails"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupons" DROP COLUMN IF EXISTS "max_spend"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupons" DROP COLUMN IF EXISTS "min_spend"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupons" DROP COLUMN IF EXISTS "individual_use_only"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupons" DROP COLUMN IF EXISTS "background_image_url"`,
    );

    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN IF EXISTS "channel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN IF EXISTS "message"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN IF EXISTS "title"`,
    );

    await queryRunner.query(
      `ALTER TABLE "gift_card_templates" DROP COLUMN IF EXISTS "preview_svg"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gift_card_templates" DROP COLUMN IF EXISTS "spending_locations"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gift_card_templates" DROP COLUMN IF EXISTS "logo_url"`,
    );

    await queryRunner.query(
      `ALTER TABLE "promotions" DROP COLUMN IF EXISTS "settings"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP COLUMN IF EXISTS "addExtraGift"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP COLUMN IF EXISTS "featuredPlacement"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP COLUMN IF EXISTS "highStreetVisibility"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP COLUMN IF EXISTS "boroughVisibility"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP COLUMN IF EXISTS "targetSegment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP COLUMN IF EXISTS "promoType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" ALTER COLUMN "multiplier" TYPE integer USING "multiplier"::integer`,
    );

    await queryRunner.query(
      `ALTER TABLE "loyalty_rules" DROP COLUMN IF EXISTS "minSpend"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_rules" DROP COLUMN IF EXISTS "frequencyLimit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_rules" DROP COLUMN IF EXISTS "targetSegment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_rules" DROP COLUMN IF EXISTS "trigger"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."loyalty_rules_trigger_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" DROP COLUMN IF EXISTS "redemptionValue"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" DROP COLUMN IF EXISTS "redemptionMode"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" DROP COLUMN IF EXISTS "tierConfig"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" DROP COLUMN IF EXISTS "heroImageUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" DROP COLUMN IF EXISTS "logoUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" DROP COLUMN IF EXISTS "accentColor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" DROP COLUMN IF EXISTS "brandColor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_settings" DROP COLUMN IF EXISTS "programName"`,
    );

    await queryRunner.query(
      `ALTER TABLE "point_transactions" DROP CONSTRAINT IF EXISTS "FK_point_transactions_business"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_point_transactions_business"`,
    );
    await queryRunner.query(
      `ALTER TABLE "point_transactions" DROP COLUMN IF EXISTS "expires_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "point_transactions" DROP COLUMN IF EXISTS "source"`,
    );
    await queryRunner.query(
      `ALTER TABLE "point_transactions" DROP COLUMN IF EXISTS "reason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "point_transactions" DROP COLUMN IF EXISTS "business_id"`,
    );
  }
}
