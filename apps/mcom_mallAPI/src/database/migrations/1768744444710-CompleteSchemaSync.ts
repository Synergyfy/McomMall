import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompleteSchemaSync1768744444710 implements MigrationInterface {
  name = 'CompleteSchemaSync1768744444710';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reward_definitions_visualtype_enum" AS ENUM('coupon', 'voucher')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reward_definitions_functionaltype_enum" AS ENUM('price_reducer', 'spending_power')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reward_definitions_burnstrategy_enum" AS ENUM('real_first', 'reward_first', 'proportional')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reward_definitions_scopetype_enum" AS ENUM('any_shop', 'specific_shops', 'expo_only', 'campaign_only')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reward_definitions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" text, "visualType" "public"."reward_definitions_visualtype_enum" NOT NULL DEFAULT 'voucher', "functionalType" "public"."reward_definitions_functionaltype_enum" NOT NULL DEFAULT 'spending_power', "splitRatio" jsonb NOT NULL, "burnStrategy" "public"."reward_definitions_burnstrategy_enum" NOT NULL DEFAULT 'real_first', "scopeType" "public"."reward_definitions_scopetype_enum" NOT NULL DEFAULT 'any_shop', "seasonalLabels" text, CONSTRAINT "PK_f6cff946a9e819e7f8d2ac6da94" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_money_vouchers_state_enum" AS ENUM('active', 'depleted', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_money_vouchers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "realBalance" numeric(12,2) NOT NULL DEFAULT '0', "rewardBalance" numeric(12,2) NOT NULL DEFAULT '0', "state" "public"."user_money_vouchers_state_enum" NOT NULL DEFAULT 'active', "ownerId" uuid, "definitionId" uuid, CONSTRAINT "PK_63bb8fdf27b3c69a71bc6e14496" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."money_voucher_transactions_sourcetype_enum" AS ENUM('user_deposit', 'peer_transfer', 'system_reward', 'business_cashback', 'spend')`,
    );
    await queryRunner.query(
      `CREATE TABLE "money_voucher_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "sourceType" "public"."money_voucher_transactions_sourcetype_enum" NOT NULL, "contributorId" character varying, "amount" numeric(12,2) NOT NULL, "realAmountDelta" numeric(12,2) NOT NULL DEFAULT '0', "rewardAmountDelta" numeric(12,2) NOT NULL DEFAULT '0', "salesImpactBefore" numeric(12,2), "salesImpactAfter" numeric(12,2), "voucherId" uuid, CONSTRAINT "PK_12b48714d75260539bfca0714e4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reward_definition_shops" ("rewardDefinitionId" uuid NOT NULL, "businessId" uuid NOT NULL, CONSTRAINT "PK_63f2a080fd961ddb3ce2014c0b5" PRIMARY KEY ("rewardDefinitionId", "businessId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bad8b6d41aa31932a4eca10523" ON "reward_definition_shops" ("rewardDefinitionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_95bdd8bcbd365983f30be11c79" ON "reward_definition_shops" ("businessId") `,
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
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "bookingUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "insuranceProvider"`,
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
      `ALTER TABLE "tiers" ADD "quarterlyPrice" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "tiers" ADD "features" text`);
    await queryRunner.query(
      `ALTER TABLE "tiers" ADD "stripeQuarterlyPriceId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "tiers" ADD "paypalQuarterlyPlanId" character varying`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."memberships_plantype_enum" RENAME TO "memberships_plantype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."memberships_plantype_enum" AS ENUM('monthly', 'quarterly', 'annual')`,
    );
    await queryRunner.query(
      `ALTER TABLE "memberships" ALTER COLUMN "planType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "memberships" ALTER COLUMN "planType" TYPE "public"."memberships_plantype_enum" USING "planType"::"text"::"public"."memberships_plantype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "memberships" ALTER COLUMN "planType" SET DEFAULT 'monthly'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."memberships_plantype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_money_vouchers" ADD CONSTRAINT "FK_4cc7258d0d84a293e04a1424571" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_money_vouchers" ADD CONSTRAINT "FK_5169cc855c9ffa56efbeeab5600" FOREIGN KEY ("definitionId") REFERENCES "reward_definitions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "money_voucher_transactions" ADD CONSTRAINT "FK_749d122c14fd14cd16faa67955d" FOREIGN KEY ("voucherId") REFERENCES "user_money_vouchers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_definition_shops" ADD CONSTRAINT "FK_bad8b6d41aa31932a4eca105237" FOREIGN KEY ("rewardDefinitionId") REFERENCES "reward_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_definition_shops" ADD CONSTRAINT "FK_95bdd8bcbd365983f30be11c79d" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reward_definition_shops" DROP CONSTRAINT "FK_95bdd8bcbd365983f30be11c79d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_definition_shops" DROP CONSTRAINT "FK_bad8b6d41aa31932a4eca105237"`,
    );
    await queryRunner.query(
      `ALTER TABLE "money_voucher_transactions" DROP CONSTRAINT "FK_749d122c14fd14cd16faa67955d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_money_vouchers" DROP CONSTRAINT "FK_5169cc855c9ffa56efbeeab5600"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_money_vouchers" DROP CONSTRAINT "FK_4cc7258d0d84a293e04a1424571"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."memberships_plantype_enum_old" AS ENUM('annual', 'monthly')`,
    );
    await queryRunner.query(
      `ALTER TABLE "memberships" ALTER COLUMN "planType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "memberships" ALTER COLUMN "planType" TYPE "public"."memberships_plantype_enum_old" USING "planType"::"text"::"public"."memberships_plantype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "memberships" ALTER COLUMN "planType" SET DEFAULT 'monthly'`,
    );
    await queryRunner.query(`DROP TYPE "public"."memberships_plantype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."memberships_plantype_enum_old" RENAME TO "memberships_plantype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tiers" DROP COLUMN "paypalQuarterlyPlanId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tiers" DROP COLUMN "stripeQuarterlyPriceId"`,
    );
    await queryRunner.query(`ALTER TABLE "tiers" DROP COLUMN "features"`);
    await queryRunner.query(`ALTER TABLE "tiers" DROP COLUMN "quarterlyPrice"`);
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
      `ALTER TABLE "service_provider_profiles" ADD "insuranceProvider" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD "bookingUrl" character varying`,
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
    await queryRunner.query(
      `DROP INDEX "public"."IDX_95bdd8bcbd365983f30be11c79"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bad8b6d41aa31932a4eca10523"`,
    );
    await queryRunner.query(`DROP TABLE "reward_definition_shops"`);
    await queryRunner.query(`DROP TABLE "money_voucher_transactions"`);
    await queryRunner.query(
      `DROP TYPE "public"."money_voucher_transactions_sourcetype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "user_money_vouchers"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_money_vouchers_state_enum"`,
    );
    await queryRunner.query(`DROP TABLE "reward_definitions"`);
    await queryRunner.query(
      `DROP TYPE "public"."reward_definitions_scopetype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."reward_definitions_burnstrategy_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."reward_definitions_functionaltype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."reward_definitions_visualtype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
