import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBookingEscrowAndTransactions1772290082493 implements MigrationInterface {
  name = 'AddBookingEscrowAndTransactions1772290082493';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."booking_transactions_type_enum" AS ENUM('PAYMENT', 'COMMISSION', 'PAYOUT', 'REFUND')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."booking_transactions_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "booking_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "type" "public"."booking_transactions_type_enum" NOT NULL, "amount" double precision NOT NULL, "referenceId" character varying, "status" "public"."booking_transactions_status_enum" NOT NULL DEFAULT 'PENDING', "bookingId" uuid, CONSTRAINT "PK_b9068e557ec82c00ad01e3d55f7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "saved_coupons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "savedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "couponId" uuid, CONSTRAINT "PK_7e5ff7aee5de67c398d4747451b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e4bb5bc7cd2e70c189cba3e344" ON "saved_coupons" ("userId", "couponId") `,
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
      `ALTER TABLE "service_bookings" ADD "totalAmount" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ADD "commissionAmount" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ADD "providerAmount" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ADD "paymentIntentId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ADD "transferId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ADD "refundId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ADD "payoutProcessed" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ADD "refundProcessed" boolean NOT NULL DEFAULT false`,
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
      `ALTER TYPE "public"."service_bookings_status_enum" RENAME TO "service_bookings_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_bookings_status_enum" AS ENUM('pending', 'approved', 'confirmed', 'declined', 'cancelled', 'completed', 'refunded')`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ALTER COLUMN "status" TYPE "public"."service_bookings_status_enum" USING "status"::"text"::"public"."service_bookings_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."service_bookings_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."rental_bookings_status_enum" RENAME TO "rental_bookings_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rental_bookings_status_enum" AS ENUM('pending', 'approved', 'confirmed', 'declined', 'cancelled', 'completed', 'refunded')`,
    );
    await queryRunner.query(
      `ALTER TABLE "rental_bookings" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "rental_bookings" ALTER COLUMN "status" TYPE "public"."rental_bookings_status_enum" USING "status"::"text"::"public"."rental_bookings_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rental_bookings" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."rental_bookings_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_transactions" ADD CONSTRAINT "FK_0c582dc4e6f9e0e6d379fb5173a" FOREIGN KEY ("bookingId") REFERENCES "service_bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_coupons" ADD CONSTRAINT "FK_ec554d4e20fc2154b18c6f16a0c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_coupons" ADD CONSTRAINT "FK_de326b7515863c01db188d905c8" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "saved_coupons" DROP CONSTRAINT "FK_de326b7515863c01db188d905c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_coupons" DROP CONSTRAINT "FK_ec554d4e20fc2154b18c6f16a0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_transactions" DROP CONSTRAINT "FK_0c582dc4e6f9e0e6d379fb5173a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rental_bookings_status_enum_old" AS ENUM('pending', 'approved', 'confirmed', 'declined', 'cancelled', 'completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "rental_bookings" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "rental_bookings" ALTER COLUMN "status" TYPE "public"."rental_bookings_status_enum_old" USING "status"::"text"::"public"."rental_bookings_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rental_bookings" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."rental_bookings_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."rental_bookings_status_enum_old" RENAME TO "rental_bookings_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_bookings_status_enum_old" AS ENUM('pending', 'approved', 'confirmed', 'declined', 'cancelled', 'completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ALTER COLUMN "status" TYPE "public"."service_bookings_status_enum_old" USING "status"::"text"::"public"."service_bookings_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."service_bookings_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."service_bookings_status_enum_old" RENAME TO "service_bookings_status_enum"`,
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
      `ALTER TABLE "service_bookings" DROP COLUMN "refundProcessed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" DROP COLUMN "payoutProcessed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" DROP COLUMN "refundId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" DROP COLUMN "transferId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" DROP COLUMN "paymentIntentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" DROP COLUMN "providerAmount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" DROP COLUMN "commissionAmount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" DROP COLUMN "totalAmount"`,
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
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e4bb5bc7cd2e70c189cba3e344"`,
    );
    await queryRunner.query(`DROP TABLE "saved_coupons"`);
    await queryRunner.query(`DROP TABLE "booking_transactions"`);
    await queryRunner.query(
      `DROP TYPE "public"."booking_transactions_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."booking_transactions_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
