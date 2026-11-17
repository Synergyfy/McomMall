import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Completes the Coupon-Voucher / Voucher-Coupon engine:
 *
 * - item-level scope + expiry on definitions
 * - contribution target, expiry, issuer and idempotency on issued wallets
 * - typed transaction attribution (business + reference + contributor type)
 * - per-order / per-booking real-vs-reward and Voucher Coupon settlement data
 *
 * Every change is additive and nullable/defaulted so the previous application
 * version keeps working during a rolling deploy.
 */
export class CouponVoucherCompleteness1799000000015
  implements MigrationInterface
{
  name = 'CouponVoucherCompleteness1799000000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reward_definitions"
        ADD COLUMN IF NOT EXISTS "valid_product_ids" text,
        ADD COLUMN IF NOT EXISTS "valid_service_ids" text,
        ADD COLUMN IF NOT EXISTS "expires_at" timestamptz;
    `);

    await queryRunner.query(`
      ALTER TABLE "user_money_vouchers"
        ADD COLUMN IF NOT EXISTS "real_contribution_target" bigint,
        ADD COLUMN IF NOT EXISTS "expires_at" timestamptz,
        ADD COLUMN IF NOT EXISTS "issued_by_user_id" uuid,
        ADD COLUMN IF NOT EXISTS "issuer_business_id" uuid,
        ADD COLUMN IF NOT EXISTS "issuance_id" character varying;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_user_money_vouchers_issuance"
      ON "user_money_vouchers" ("issuance_id")
      WHERE "issuance_id" IS NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "money_voucher_transactions"
        ADD COLUMN IF NOT EXISTS "contributor_type" character varying,
        ADD COLUMN IF NOT EXISTS "business_id" uuid,
        ADD COLUMN IF NOT EXISTS "reference_id" character varying;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_money_voucher_tx_business"
      ON "money_voucher_transactions" ("business_id");
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
        ADD COLUMN IF NOT EXISTS "money_voucher_real_amount_applied" bigint NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "money_voucher_reward_amount_applied" bigint NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "price_reducer_code" character varying,
        ADD COLUMN IF NOT EXISTS "price_reducer_amount_applied" bigint NOT NULL DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE "service_bookings"
        ADD COLUMN IF NOT EXISTS "money_voucher_real_amount_applied" bigint NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "money_voucher_reward_amount_applied" bigint NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "price_reducer_code" character varying,
        ADD COLUMN IF NOT EXISTS "price_reducer_amount_applied" bigint NOT NULL DEFAULT 0;
    `);

    // Backfill existing purchased wallets with a contribution target equal to
    // the real money already paid, so they cannot be "refilled" by strangers.
    await queryRunner.query(`
      UPDATE "user_money_vouchers"
      SET "real_contribution_target" = "realBalance"
      WHERE "real_contribution_target" IS NULL
        AND COALESCE("functionalType", '') <> 'price_reducer';
    `);

    // Existing transactions: classify the contributor so reports keep working.
    await queryRunner.query(`
      UPDATE "money_voucher_transactions"
      SET "contributor_type" = CASE
        WHEN "sourceType" = 'business_cashback' THEN 'business'
        WHEN "sourceType" = 'system_reward' THEN 'system'
        ELSE 'user'
      END
      WHERE "contributor_type" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_money_voucher_tx_business";
    `);

    await queryRunner.query(`
      ALTER TABLE "service_bookings"
        DROP COLUMN IF EXISTS "money_voucher_real_amount_applied",
        DROP COLUMN IF EXISTS "money_voucher_reward_amount_applied",
        DROP COLUMN IF EXISTS "price_reducer_code",
        DROP COLUMN IF EXISTS "price_reducer_amount_applied";
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
        DROP COLUMN IF EXISTS "money_voucher_real_amount_applied",
        DROP COLUMN IF EXISTS "money_voucher_reward_amount_applied",
        DROP COLUMN IF EXISTS "price_reducer_code",
        DROP COLUMN IF EXISTS "price_reducer_amount_applied";
    `);

    await queryRunner.query(`
      ALTER TABLE "money_voucher_transactions"
        DROP COLUMN IF EXISTS "contributor_type",
        DROP COLUMN IF EXISTS "business_id",
        DROP COLUMN IF EXISTS "reference_id";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_user_money_vouchers_issuance";
    `);

    await queryRunner.query(`
      ALTER TABLE "user_money_vouchers"
        DROP COLUMN IF EXISTS "real_contribution_target",
        DROP COLUMN IF EXISTS "expires_at",
        DROP COLUMN IF EXISTS "issued_by_user_id",
        DROP COLUMN IF EXISTS "issuer_business_id",
        DROP COLUMN IF EXISTS "issuance_id";
    `);

    await queryRunner.query(`
      ALTER TABLE "reward_definitions"
        DROP COLUMN IF EXISTS "valid_product_ids",
        DROP COLUMN IF EXISTS "valid_service_ids",
        DROP COLUMN IF EXISTS "expires_at";
    `);
  }
}
