import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateServiceFields1770328706605 implements MigrationInterface {
  name = 'UpdateServiceFields1770328706605';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
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
      `ALTER TABLE "services" ADD "category" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD "subcategory" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "services" ADD "targetAudience" text`);
    await queryRunner.query(`ALTER TABLE "services" ADD "tags" text`);
    await queryRunner.query(
      `ALTER TABLE "services" ADD "deliveryConfig" jsonb`,
    );
    await queryRunner.query(`ALTER TABLE "services" ADD "pricingRules" jsonb`);
    await queryRunner.query(`ALTER TABLE "services" ADD "availability" jsonb`);
    await queryRunner.query(`ALTER TABLE "services" ADD "variants" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "services" ADD "enableTieredPackages" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "services" ADD "tiers" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "services" ADD "requireApproval" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD "bookingRequirements" jsonb`,
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
      `CREATE TYPE "public"."activity_timer_templates_type_enum" AS ENUM('TRIAL', 'GENERAL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_timer_templates" ADD "type" "public"."activity_timer_templates_type_enum" NOT NULL DEFAULT 'GENERAL'`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_timer_templates" ADD "startTime" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_timer_templates" ADD "endTime" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_timer_templates" ADD "includedTierIds" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_timer_templates" ADD "excludedTierIds" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_timer_templates" ADD "isForAllTiers" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."activity_timers_type_enum" AS ENUM('TRIAL', 'GENERAL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_timers" ADD "type" "public"."activity_timers_type_enum" NOT NULL DEFAULT 'GENERAL'`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_timers" ADD "completedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."services_pricingmodel_enum" RENAME TO "services_pricingmodel_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."services_pricingmodel_enum" AS ENUM('fixed', 'perHour', 'perUnit', 'perJob', 'perDistance', 'perSession', 'subscription')`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "pricingModel" TYPE "public"."services_pricingmodel_enum" USING "pricingModel"::"text"::"public"."services_pricingmodel_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."services_pricingmodel_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."services_pricingmodel_enum_old" AS ENUM('fixed', 'perHour', 'perUnit')`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "pricingModel" TYPE "public"."services_pricingmodel_enum_old" USING "pricingModel"::"text"::"public"."services_pricingmodel_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."services_pricingmodel_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."services_pricingmodel_enum_old" RENAME TO "services_pricingmodel_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_timers" DROP COLUMN "completedAt"`,
    );
    await queryRunner.query(`ALTER TABLE "activity_timers" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."activity_timers_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "activity_timer_templates" DROP COLUMN "isForAllTiers"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_timer_templates" DROP COLUMN "excludedTierIds"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_timer_templates" DROP COLUMN "includedTierIds"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_timer_templates" DROP COLUMN "endTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_timer_templates" DROP COLUMN "startTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_timer_templates" DROP COLUMN "type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."activity_timer_templates_type_enum"`,
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
      `ALTER TABLE "services" DROP COLUMN "bookingRequirements"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "requireApproval"`,
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "tiers"`);
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "enableTieredPackages"`,
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "variants"`);
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "availability"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "pricingRules"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "deliveryConfig"`,
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "tags"`);
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "targetAudience"`,
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "subcategory"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "category"`);
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
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
