import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds MCOM_WALLET / mcom_wallet to the payment enums so centralized
 * MCOM Solutions wallet payments can be recorded in:
 * - payment_histories.paymentGateway (MCOM_WALLET)
 * - order_payments.paymentMethod (mcom_wallet)
 * - membership_payments.paymentMethod (mcom_wallet)
 *
 * Guarded DO blocks: safe to run whether or not the enum types exist yet
 * (dev databases bootstrapped via synchronize may not have them).
 */
export class AddMcomWalletToPaymentEnums1789500000000 implements MigrationInterface {
  name = 'AddMcomWalletToPaymentEnums1789500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_histories_paymentgateway_enum') THEN
          ALTER TYPE "public"."payment_histories_paymentgateway_enum" ADD VALUE IF NOT EXISTS 'MCOM_WALLET';
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_payments_paymentmethod_enum') THEN
          ALTER TYPE "public"."order_payments_paymentmethod_enum" ADD VALUE IF NOT EXISTS 'mcom_wallet';
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_payments_paymentmethod_enum') THEN
          ALTER TYPE "public"."membership_payments_paymentmethod_enum" ADD VALUE IF NOT EXISTS 'mcom_wallet';
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Postgres cannot DROP an enum value directly; recreate each type only
    // when it exists AND no rows still use the wallet value.
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_histories_paymentgateway_enum')
           AND NOT EXISTS (SELECT 1 FROM "payment_histories" WHERE "paymentGateway" = 'MCOM_WALLET') THEN
          ALTER TYPE "public"."payment_histories_paymentgateway_enum" RENAME TO "payment_histories_paymentgateway_enum_old";
          CREATE TYPE "public"."payment_histories_paymentgateway_enum" AS ENUM('STRIPE', 'PAYPAL');
          ALTER TABLE "payment_histories" ALTER COLUMN "paymentGateway" TYPE "public"."payment_histories_paymentgateway_enum" USING "paymentGateway"::"text"::"public"."payment_histories_paymentgateway_enum";
          DROP TYPE "public"."payment_histories_paymentgateway_enum_old";
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_payments_paymentmethod_enum')
           AND NOT EXISTS (SELECT 1 FROM "order_payments" WHERE "paymentMethod" = 'mcom_wallet') THEN
          ALTER TYPE "public"."order_payments_paymentmethod_enum" RENAME TO "order_payments_paymentmethod_enum_old";
          CREATE TYPE "public"."order_payments_paymentmethod_enum" AS ENUM('stripe', 'paypal');
          ALTER TABLE "order_payments" ALTER COLUMN "paymentMethod" TYPE "public"."order_payments_paymentmethod_enum" USING "paymentMethod"::"text"::"public"."order_payments_paymentmethod_enum";
          DROP TYPE "public"."order_payments_paymentmethod_enum_old";
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_payments_paymentmethod_enum')
           AND NOT EXISTS (SELECT 1 FROM "membership_payments" WHERE "paymentMethod" = 'mcom_wallet') THEN
          ALTER TYPE "public"."membership_payments_paymentmethod_enum" RENAME TO "membership_payments_paymentmethod_enum_old";
          CREATE TYPE "public"."membership_payments_paymentmethod_enum" AS ENUM('stripe', 'paypal');
          ALTER TABLE "membership_payments" ALTER COLUMN "paymentMethod" TYPE "public"."membership_payments_paymentmethod_enum" USING "paymentMethod"::"text"::"public"."membership_payments_paymentmethod_enum";
          DROP TYPE "public"."membership_payments_paymentmethod_enum_old";
        END IF;
      END $$;
    `);
  }
}
