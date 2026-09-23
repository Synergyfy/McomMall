import { MigrationInterface, QueryRunner } from 'typeorm';

export class Fix1770374546260 implements MigrationInterface {
  name = 'Fix1770374546260';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"; EXCEPTION WHEN undefined_object THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"; EXCEPTION WHEN undefined_object THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "UQ_81d38487c29d69bf340eead614c"; EXCEPTION WHEN undefined_object THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP COLUMN "userId"; EXCEPTION WHEN undefined_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP COLUMN "skills"; EXCEPTION WHEN undefined_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP COLUMN "serviceArea"; EXCEPTION WHEN undefined_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP COLUMN "portfolio"; EXCEPTION WHEN undefined_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP COLUMN "fixedPriceFrom"; EXCEPTION WHEN undefined_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP COLUMN "hourlyRateFrom"; EXCEPTION WHEN undefined_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP COLUMN "quoteOnly"; EXCEPTION WHEN undefined_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP COLUMN "hasPublicLiabilityInsurance"; EXCEPTION WHEN undefined_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP COLUMN "insuranceExpiryDate"; EXCEPTION WHEN undefined_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "UQ_f143f396ea55404f8ed5a5421a3"; EXCEPTION WHEN undefined_object THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP COLUMN "businessId"; EXCEPTION WHEN undefined_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP COLUMN "insuranceProvider"; EXCEPTION WHEN undefined_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" DROP COLUMN "bookingUrl"; EXCEPTION WHEN undefined_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "locations" ADD "state" character varying; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "locations" ADD "countryCode" character varying NOT NULL DEFAULT 'GB'; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD "bookingUrl" character varying; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD "fixedPriceFrom" numeric(10,2); EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD "hourlyRateFrom" numeric(10,2); EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD "quoteOnly" boolean NOT NULL DEFAULT false; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD "hasPublicLiabilityInsurance" boolean NOT NULL DEFAULT false; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD "insuranceProvider" character varying; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD "insuranceExpiryDate" date; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD "businessId" uuid; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "UQ_f143f396ea55404f8ed5a5421a3" UNIQUE ("businessId"); EXCEPTION WHEN duplicate_object THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."orders_shippingstatus_enum" AS ENUM('pending', 'label_generated', 'shipped', 'delivered', 'cancelled'); EXCEPTION WHEN duplicate_object THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "orders" ADD "shippingStatus" "public"."orders_shippingstatus_enum" NOT NULL DEFAULT 'pending'; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "orders" ADD "estimatedShippingFee" numeric(10,2) NOT NULL DEFAULT '0'; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "orders" ADD "actualShippingCost" numeric(10,2); EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "orders" ADD "carrierCode" character varying; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "orders" ADD "trackingNumber" character varying; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "orders" ADD "labelUrl" character varying; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "orders" ADD "businessId" uuid; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD "skills" text; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD "serviceArea" character varying; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD "portfolio" text; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD "userId" uuid; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "UQ_81d38487c29d69bf340eead614c" UNIQUE ("userId"); EXCEPTION WHEN duplicate_object THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "users" ADD "trustScore" integer NOT NULL DEFAULT '100'; EXCEPTION WHEN duplicate_column THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "orders" ADD CONSTRAINT "FK_778777c5d7d56ed1bbaa907b8e5" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN END $$`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_778777c5d7d56ed1bbaa907b8e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "trustScore"`);
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
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "businessId"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "labelUrl"`);
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "trackingNumber"`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "carrierCode"`);
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "actualShippingCost"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "estimatedShippingFee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "shippingStatus"`,
    );
    await queryRunner.query(`DROP TYPE "public"."orders_shippingstatus_enum"`);
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
      `ALTER TABLE "locations" DROP COLUMN "countryCode"`,
    );
    await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "state"`);
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
