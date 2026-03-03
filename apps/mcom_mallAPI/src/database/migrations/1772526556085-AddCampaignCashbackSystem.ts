import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCampaignCashbackSystem1772526556085 implements MigrationInterface {
  name = 'AddCampaignCashbackSystem1772526556085';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."campaign_cashbacks_type_enum" AS ENUM('REGULAR', 'SEASONAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."campaign_cashbacks_targettype_enum" AS ENUM('CONSUMERS', 'BUSINESS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."campaign_cashbacks_displaytype_enum" AS ENUM('VOUCHER', 'E_CARD')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."campaign_cashbacks_unlockmode_enum" AS ENUM('REQUIRE_FULL_UNLOCK', 'ALLOW_PRELOADED_USAGE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "campaign_cashbacks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "type" "public"."campaign_cashbacks_type_enum" NOT NULL DEFAULT 'REGULAR', "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "targetType" "public"."campaign_cashbacks_targettype_enum" NOT NULL DEFAULT 'CONSUMERS', "displayType" "public"."campaign_cashbacks_displaytype_enum" NOT NULL DEFAULT 'VOUCHER', "totalValue" numeric(10,2) NOT NULL, "levelValue" numeric(10,2) NOT NULL, "unlockMode" "public"."campaign_cashbacks_unlockmode_enum" NOT NULL DEFAULT 'REQUIRE_FULL_UNLOCK', "expiryDate" TIMESTAMP NOT NULL, "activationTimerDays" integer NOT NULL DEFAULT '0', "activationTasks" text, "externalCampaign" boolean NOT NULL DEFAULT false, "externalRedemptionUrl" character varying, "value1Title" character varying NOT NULL, "value1Description" text NOT NULL, "value1UsageText" character varying NOT NULL, "value1Channels" text, "value1UsageTypes" text, "value2Title" character varying NOT NULL, "value2Description" text NOT NULL, "value2UsageText" character varying NOT NULL, "value2Channels" text, "value2UsageTypes" text, "value3Title" character varying NOT NULL, "value3Description" text NOT NULL, "value3UsageText" character varying NOT NULL, "value3Channels" text, "value3UsageTypes" text, "selectAll" boolean NOT NULL DEFAULT true, "targetIds" text, "seasonId" uuid, CONSTRAINT "PK_9ea1400851096de3ae3e546235f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_campaign_cashbacks_status_enum" AS ENUM('NOT_ACTIVE', 'LOCKED', 'ACTIVE', 'PARTIALLY_USED', 'FULLY_USED', 'EXPIRED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_campaign_cashbacks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "status" "public"."user_campaign_cashbacks_status_enum" NOT NULL DEFAULT 'ACTIVE', "contributionPaid" boolean NOT NULL DEFAULT false, "activationTimerDate" TIMESTAMP, "userId" uuid, "campaignId" uuid, CONSTRAINT "PK_ef467e39a60125a173b92cfc507" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_campaign_wallets_channeltype_enum" AS ENUM('HYPERLOCAL', 'NEARBY', 'ONLINE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_campaign_wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "channelType" "public"."user_campaign_wallets_channeltype_enum" NOT NULL, "value1Balance" numeric(10,2) NOT NULL DEFAULT '0', "value2Balance" numeric(10,2) NOT NULL DEFAULT '0', "value3Balance" numeric(10,2) NOT NULL DEFAULT '0', "userCampaignId" uuid, CONSTRAINT "PK_e1f07f492b2e6989566a37a8d2b" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "UQ_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "bookingUrl"`,
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
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "insuranceProvider"`,
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
      `CREATE TYPE "public"."wallet_transactions_type_enum" AS ENUM('earning_order', 'earning_gift_card', 'earning_voucher', 'earning_coupon', 'earning_terminal_cashback', 'earning_booking', 'booking_payment_released', 'withdrawal', 'spend', 'funding', 'adjustment', 'campaign_cashback_contribution')`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ALTER COLUMN "type" TYPE "public"."wallet_transactions_type_enum" USING "type"::"text"::"public"."wallet_transactions_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."wallet_transactions_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_cashbacks" ADD CONSTRAINT "FK_a9450aef7215d4a4a846d45bc17" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_campaign_cashbacks" ADD CONSTRAINT "FK_a44db07fb5f879b18daf47b5814" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_campaign_cashbacks" ADD CONSTRAINT "FK_919d54488197c903bf28a1c72ab" FOREIGN KEY ("campaignId") REFERENCES "campaign_cashbacks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_campaign_wallets" ADD CONSTRAINT "FK_c0cb4a32da4f7d7b1519dbcd043" FOREIGN KEY ("userCampaignId") REFERENCES "user_campaign_cashbacks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_campaign_wallets" DROP CONSTRAINT "FK_c0cb4a32da4f7d7b1519dbcd043"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_campaign_cashbacks" DROP CONSTRAINT "FK_919d54488197c903bf28a1c72ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_campaign_cashbacks" DROP CONSTRAINT "FK_a44db07fb5f879b18daf47b5814"`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_cashbacks" DROP CONSTRAINT "FK_a9450aef7215d4a4a846d45bc17"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."wallet_transactions_type_enum_old" AS ENUM('earning_order', 'earning_gift_card', 'earning_voucher', 'earning_coupon', 'earning_terminal_cashback', 'earning_booking', 'booking_payment_released', 'withdrawal', 'spend', 'funding', 'adjustment')`,
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
      `ALTER TABLE "service_provider_profiles" ADD "businessId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "UQ_f143f396ea55404f8ed5a5421a3" UNIQUE ("businessId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "insuranceExpiryDate" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "insuranceProvider" character varying`,
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
      `ALTER TABLE "service_provider_profiles" ADD "bookingUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "userId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "UQ_81d38487c29d69bf340eead614c" UNIQUE ("userId")`,
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
    await queryRunner.query(`DROP TABLE "user_campaign_wallets"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_campaign_wallets_channeltype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "user_campaign_cashbacks"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_campaign_cashbacks_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "campaign_cashbacks"`);
    await queryRunner.query(
      `DROP TYPE "public"."campaign_cashbacks_unlockmode_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."campaign_cashbacks_displaytype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."campaign_cashbacks_targettype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."campaign_cashbacks_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
