import { MigrationInterface, QueryRunner } from 'typeorm';

export class TerminalCashbackSetup1769896573008 implements MigrationInterface {
  name = 'TerminalCashbackSetup1769896573008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."help_requests_type_enum" AS ENUM('PRODUCT_CREATION', 'PRODUCT_EDIT', 'PRODUCT_VARIATION_SETUP', 'INVENTORY_MANAGEMENT', 'ORDER_PROCESSING', 'STORE_DESIGN', 'PROMOTION_SETUP', 'CUSTOMER_SERVICE_HELP', 'GENERAL_SUPPORT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "help_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "requesterId" character varying NOT NULL, "type" "public"."help_requests_type_enum" NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "status" character varying NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2990700cfcb0ce6fbdd7b3d532f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "terminal_global_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "ruleKey" character varying NOT NULL, "value" text NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_846bb2de21b819432419237e539" PRIMARY KEY ("id", "ruleKey"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."terminal_configs_level_enum" AS ENUM('1', '2', '3')`,
    );
    await queryRunner.query(
      `CREATE TABLE "terminal_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "businessId" character varying NOT NULL, "businessName" character varying NOT NULL, "level" "public"."terminal_configs_level_enum" NOT NULL DEFAULT '1', "isEnabled" boolean NOT NULL DEFAULT true, "autoApprovalHours" integer NOT NULL DEFAULT '48', "ranges" jsonb, "fixedRewardValue" numeric(10,2), "apiEndpoint" character varying, "limits" jsonb NOT NULL DEFAULT '{}', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2be7ff8664fe267c9dbc78ab38c" PRIMARY KEY ("id", "businessId"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."terminal_cashback_claims_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'AUTO_APPROVED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "terminal_cashback_claims" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" uuid NOT NULL, "businessId" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "spendAmount" numeric(10,2), "proofUrl" character varying, "status" "public"."terminal_cashback_claims_status_enum" NOT NULL DEFAULT 'PENDING', "submittedAt" TIMESTAMP NOT NULL DEFAULT now(), "reviewedAt" TIMESTAMP, "meta" jsonb, "riskScore" integer NOT NULL DEFAULT '0', "flaggedReason" character varying, CONSTRAINT "PK_45c0c9e203002edfb21aa53405d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "UQ_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "skills"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "serviceArea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "portfolio"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "fixedPriceFrom"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "hourlyRateFrom"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "quoteOnly"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "hasPublicLiabilityInsurance"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "insuranceExpiryDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "UQ_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "businessId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "insuranceProvider"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "bookingUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "bookingUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "fixedPriceFrom" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "hourlyRateFrom" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "quoteOnly" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "hasPublicLiabilityInsurance" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "insuranceProvider" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "insuranceExpiryDate" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "businessId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "UQ_f143f396ea55404f8ed5a5421a3" UNIQUE ("businessId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "earningsFromTerminalCashback" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "skills" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "serviceArea" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "portfolio" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "userId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "UQ_81d38487c29d69bf340eead614c" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."wallet_transactions_type_enum" RENAME TO "wallet_transactions_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."wallet_transactions_type_enum" AS ENUM('earning_order', 'earning_gift_card', 'earning_voucher', 'earning_coupon', 'earning_terminal_cashback', 'earning_booking', 'booking_payment_released', 'withdrawal', 'spend', 'funding', 'adjustment')`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ALTER COLUMN "type" TYPE "public"."wallet_transactions_type_enum" USING "type"::"text"::"public"."wallet_transactions_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."wallet_transactions_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."payment_histories_plantype_enum" RENAME TO "payment_histories_plantype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_histories_plantype_enum" AS ENUM('monthly', 'quarterly', 'annual', 'PAYG', 'CO_BRANDED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_histories" ALTER COLUMN "planType" TYPE "public"."payment_histories_plantype_enum" USING "planType"::"text"::"public"."payment_histories_plantype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."payment_histories_plantype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "terminal_cashback_claims" ADD CONSTRAINT "FK_47a74f7af744b23ae3312c66e6c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "terminal_cashback_claims" DROP CONSTRAINT "FK_47a74f7af744b23ae3312c66e6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_histories_plantype_enum_old" AS ENUM('CO_BRANDED', 'PAYG', 'annual', 'monthly', 'quarterly')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_histories" ALTER COLUMN "planType" TYPE "public"."payment_histories_plantype_enum_old" USING "planType"::"text"::"public"."payment_histories_plantype_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."payment_histories_plantype_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."payment_histories_plantype_enum_old" RENAME TO "payment_histories_plantype_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."wallet_transactions_type_enum_old" AS ENUM('adjustment', 'booking_payment_released', 'earning_booking', 'earning_coupon', 'earning_gift_card', 'earning_order', 'earning_voucher', 'funding', 'spend', 'withdrawal')`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ALTER COLUMN "type" TYPE "public"."wallet_transactions_type_enum_old" USING "type"::"text"::"public"."wallet_transactions_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."wallet_transactions_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."wallet_transactions_type_enum_old" RENAME TO "wallet_transactions_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "UQ_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "portfolio"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "serviceArea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "skills"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP COLUMN "earningsFromTerminalCashback"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "UQ_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "businessId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "insuranceExpiryDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "insuranceProvider"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "hasPublicLiabilityInsurance"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "quoteOnly"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "hourlyRateFrom"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "fixedPriceFrom"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "bookingUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "bookingUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "insuranceProvider" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "businessId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "UQ_f143f396ea55404f8ed5a5421a3" UNIQUE ("businessId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "insuranceExpiryDate" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "hasPublicLiabilityInsurance" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "quoteOnly" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "hourlyRateFrom" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "fixedPriceFrom" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "portfolio" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "serviceArea" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "skills" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "userId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "UQ_81d38487c29d69bf340eead614c" UNIQUE ("userId")`,
    );
    await queryRunner.query(`DROP TABLE "terminal_cashback_claims"`);
    await queryRunner.query(
      `DROP TYPE "public"."terminal_cashback_claims_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "terminal_configs"`);
    await queryRunner.query(`DROP TYPE "public"."terminal_configs_level_enum"`);
    await queryRunner.query(`DROP TABLE "terminal_global_rules"`);
    await queryRunner.query(`DROP TABLE "help_requests"`);
    await queryRunner.query(`DROP TYPE "public"."help_requests_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
