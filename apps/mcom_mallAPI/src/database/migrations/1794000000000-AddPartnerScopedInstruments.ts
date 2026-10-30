import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Partner-issued reward instruments: issuance linkage + scope model.
 *
 * Additive and nullable so rolling back to the previous application version
 * keeps working (old code simply ignores the new columns/tables). All
 * `down()` steps reverse `up()`.
 */
export class AddPartnerScopedInstruments1794000000000
  implements MigrationInterface
{
  name = 'AddPartnerScopedInstruments1794000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Instrument scope (polymorphic) ────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "instrument_scopes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "instrument_type" character varying(32) NOT NULL,
        "instrument_id" uuid NOT NULL,
        "business_id" uuid,
        "scope_mode" character varying(16) NOT NULL DEFAULT 'NO_SCOPE',
        "listing_ids" uuid[] NOT NULL DEFAULT '{}',
        "product_ids" uuid[] NOT NULL DEFAULT '{}',
        "service_ids" uuid[] NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_instrument_scopes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_instrument_scopes_business"
          FOREIGN KEY ("business_id") REFERENCES "businesses"("id")
          ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_instrument_scopes_instrument"
        ON "instrument_scopes" ("instrument_type", "instrument_id");
      CREATE INDEX IF NOT EXISTS "IDX_instrument_scopes_business"
        ON "instrument_scopes" ("business_id");
    `);

    // ── Callback outbox ───────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "partner_redemption_outbox" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "issuance_id" character varying,
        "instrument_type" character varying(32) NOT NULL,
        "instrument_id" uuid NOT NULL,
        "operation" character varying(16) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'PENDING',
        "code" character varying(64),
        "idempotency_key" character varying(255) NOT NULL,
        "payload" jsonb,
        "attempts" integer NOT NULL DEFAULT 0,
        "next_attempt_at" TIMESTAMP NOT NULL DEFAULT now(),
        "last_error" text,
        "sent_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_partner_redemption_outbox" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_partner_outbox_idempotency"
        ON "partner_redemption_outbox" ("idempotency_key");
      CREATE INDEX IF NOT EXISTS "IDX_partner_outbox_status_due"
        ON "partner_redemption_outbox" ("status", "next_attempt_at");
    `);

    // ── Gift cards ────────────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "gift_cards"
        ADD COLUMN IF NOT EXISTS "issuance_id" character varying,
        ADD COLUMN IF NOT EXISTS "source_app" character varying,
        ADD COLUMN IF NOT EXISTS "metadata" jsonb;
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_gift_cards_source_issuance"
        ON "gift_cards" ("source_app", "issuance_id");
    `);

    // ── Vouchers ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "vouchers"
        ADD COLUMN IF NOT EXISTS "issuance_id" character varying,
        ADD COLUMN IF NOT EXISTS "source_app" character varying,
        ADD COLUMN IF NOT EXISTS "business_id" uuid,
        ADD COLUMN IF NOT EXISTS "metadata" jsonb;
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_vouchers_source_issuance"
        ON "vouchers" ("source_app", "issuance_id");
      CREATE INDEX IF NOT EXISTS "IDX_vouchers_business"
        ON "vouchers" ("business_id");
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_vouchers_business'
        ) THEN
          ALTER TABLE "vouchers"
            ADD CONSTRAINT "FK_vouchers_business"
            FOREIGN KEY ("business_id") REFERENCES "businesses"("id")
            ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // ── Coupons ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "coupons"
        ADD COLUMN IF NOT EXISTS "issuance_id" character varying,
        ADD COLUMN IF NOT EXISTS "source_app" character varying,
        ADD COLUMN IF NOT EXISTS "metadata" jsonb,
        ADD COLUMN IF NOT EXISTS "scope_config" jsonb;
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_coupons_source_issuance"
        ON "coupons" ("source_app", "issuance_id");
    `);

    // ── Template restrictions ─────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "gift_card_templates"
        ADD COLUMN IF NOT EXISTS "scope_config" jsonb;
      ALTER TABLE "voucher_products"
        ADD COLUMN IF NOT EXISTS "scope_config" jsonb;
    `);

    // ── Redemption logs (applied/eligible amounts) ────────────────────────
    await queryRunner.query(`
      ALTER TABLE "redemption_logs"
        ADD COLUMN IF NOT EXISTS "issuance_id" character varying,
        ADD COLUMN IF NOT EXISTS "eligible_subtotal" numeric(10,2),
        ADD COLUMN IF NOT EXISTS "applied_amount" numeric(10,2),
        ADD COLUMN IF NOT EXISTS "metadata" jsonb;
    `);
    await queryRunner.query(`
      ALTER TABLE "service_bookings"
        ADD COLUMN IF NOT EXISTS "couponDiscountApplied" double precision NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "couponCode" character varying,
        ADD COLUMN IF NOT EXISTS "giftCardAmountApplied" double precision NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "giftCardCode" character varying,
        ADD COLUMN IF NOT EXISTS "voucherAmountApplied" double precision NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "voucherCode" character varying;
    `);

    // ── Catalogue pagination/filter indexes ───────────────────────────────
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_businesses_status_created"
        ON "businesses" ("status", "created_at");
      CREATE INDEX IF NOT EXISTS "IDX_products_status_created"
        ON "Products" ("productStatus", "created_at");
      CREATE INDEX IF NOT EXISTS "IDX_services_status_created"
        ON "services" ("status", "created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_services_status_created";
      DROP INDEX IF EXISTS "IDX_products_status_created";
      DROP INDEX IF EXISTS "IDX_businesses_status_created";
    `);
    await queryRunner.query(`
      ALTER TABLE "service_bookings"
        DROP COLUMN IF EXISTS "voucherCode",
        DROP COLUMN IF EXISTS "voucherAmountApplied",
        DROP COLUMN IF EXISTS "giftCardCode",
        DROP COLUMN IF EXISTS "giftCardAmountApplied",
        DROP COLUMN IF EXISTS "couponCode",
        DROP COLUMN IF EXISTS "couponDiscountApplied";
    `);
    await queryRunner.query(`
      ALTER TABLE "redemption_logs"
        DROP COLUMN IF EXISTS "metadata",
        DROP COLUMN IF EXISTS "applied_amount",
        DROP COLUMN IF EXISTS "eligible_subtotal",
        DROP COLUMN IF EXISTS "issuance_id";
      ALTER TABLE "voucher_products" DROP COLUMN IF EXISTS "scope_config";
      ALTER TABLE "gift_card_templates" DROP COLUMN IF EXISTS "scope_config";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_coupons_source_issuance";
      ALTER TABLE "coupons"
        DROP COLUMN IF EXISTS "scope_config",
        DROP COLUMN IF EXISTS "metadata",
        DROP COLUMN IF EXISTS "source_app",
        DROP COLUMN IF EXISTS "issuance_id";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_vouchers_source_issuance";
      DROP INDEX IF EXISTS "IDX_vouchers_business";
      ALTER TABLE "vouchers" DROP CONSTRAINT IF EXISTS "FK_vouchers_business";
      ALTER TABLE "vouchers"
        DROP COLUMN IF EXISTS "metadata",
        DROP COLUMN IF EXISTS "business_id",
        DROP COLUMN IF EXISTS "source_app",
        DROP COLUMN IF EXISTS "issuance_id";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_gift_cards_source_issuance";
      ALTER TABLE "gift_cards"
        DROP COLUMN IF EXISTS "metadata",
        DROP COLUMN IF EXISTS "source_app",
        DROP COLUMN IF EXISTS "issuance_id";
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "partner_redemption_outbox"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "instrument_scopes"`);
  }
}
