import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCampaignAudienceTargeting1772528091725 implements MigrationInterface {
    name = 'UpdateCampaignAudienceTargeting1772528091725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "skills"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "serviceArea"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "portfolio"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "UQ_81d38487c29d69bf340eead614c"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "bookingUrl"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "fixedPriceFrom"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "hourlyRateFrom"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "quoteOnly"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "hasPublicLiabilityInsurance"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "insuranceProvider"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "insuranceExpiryDate"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "UQ_f143f396ea55404f8ed5a5421a3"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "businessId"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "bookingUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "fixedPriceFrom" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "hourlyRateFrom" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "quoteOnly" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "hasPublicLiabilityInsurance" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "insuranceProvider" character varying`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "insuranceExpiryDate" date`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "businessId" uuid`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "UQ_f143f396ea55404f8ed5a5421a3" UNIQUE ("businessId")`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "skills" text`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "serviceArea" character varying`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "portfolio" text`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "UQ_81d38487c29d69bf340eead614c" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TYPE "public"."campaign_cashbacks_targettype_enum" RENAME TO "campaign_cashbacks_targettype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."campaign_cashbacks_targettype_enum" AS ENUM('CUSTOMER', 'BUSINESS', 'ALL', 'SPECIFIC_USERS')`);
        await queryRunner.query(`ALTER TABLE "campaign_cashbacks" ALTER COLUMN "targetType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "campaign_cashbacks" ALTER COLUMN "targetType" TYPE "public"."campaign_cashbacks_targettype_enum" USING "targetType"::"text"::"public"."campaign_cashbacks_targettype_enum"`);
        await queryRunner.query(`ALTER TABLE "campaign_cashbacks" ALTER COLUMN "targetType" SET DEFAULT 'CUSTOMER'`);
        await queryRunner.query(`DROP TYPE "public"."campaign_cashbacks_targettype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`);
        await queryRunner.query(`CREATE TYPE "public"."campaign_cashbacks_targettype_enum_old" AS ENUM('CONSUMERS', 'BUSINESS')`);
        await queryRunner.query(`ALTER TABLE "campaign_cashbacks" ALTER COLUMN "targetType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "campaign_cashbacks" ALTER COLUMN "targetType" TYPE "public"."campaign_cashbacks_targettype_enum_old" USING "targetType"::"text"::"public"."campaign_cashbacks_targettype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "campaign_cashbacks" ALTER COLUMN "targetType" SET DEFAULT 'CONSUMERS'`);
        await queryRunner.query(`DROP TYPE "public"."campaign_cashbacks_targettype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."campaign_cashbacks_targettype_enum_old" RENAME TO "campaign_cashbacks_targettype_enum"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "UQ_81d38487c29d69bf340eead614c"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "portfolio"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "serviceArea"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "skills"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "UQ_f143f396ea55404f8ed5a5421a3"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "businessId"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "insuranceExpiryDate"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "insuranceProvider"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "hasPublicLiabilityInsurance"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "quoteOnly"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "hourlyRateFrom"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "fixedPriceFrom"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" DROP COLUMN "bookingUrl"`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "businessId" uuid`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "UQ_f143f396ea55404f8ed5a5421a3" UNIQUE ("businessId")`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "insuranceExpiryDate" date`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "insuranceProvider" character varying`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "hasPublicLiabilityInsurance" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "quoteOnly" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "hourlyRateFrom" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "fixedPriceFrom" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "bookingUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "UQ_81d38487c29d69bf340eead614c" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "portfolio" text`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "serviceArea" character varying`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD "skills" text`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
