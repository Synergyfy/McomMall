import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorPartnershipToUserLevel1770670818154 implements MigrationInterface {
  name = 'RefactorPartnershipToUserLevel1770670818154';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP CONSTRAINT "FK_274147f96f6061357900f785d25"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP CONSTRAINT "FK_727e6d8ac8d55eb3e3cc8fff0f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_partnership_requests_status_enum" AS ENUM('pending', 'accepted', 'declined')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_partnership_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "status" "public"."user_partnership_requests_status_enum" NOT NULL DEFAULT 'pending', "rejectionMessage" character varying, "sentAt" TIMESTAMP NOT NULL DEFAULT now(), "acceptedAt" TIMESTAMP, "rejectedAt" TIMESTAMP, "senderId" uuid, "receiverId" uuid, CONSTRAINT "PK_aaf5a952d2554db636d970ae071" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_partnerships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "user1Id" uuid, "user2Id" uuid, "requestId" uuid, CONSTRAINT "REL_5dc85ee7f4fe437401be082eb5" UNIQUE ("requestId"), CONSTRAINT "PK_3980c5139088ef13b8b1d306e8d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."item_partnership_requests_status_enum" AS ENUM('pending', 'accepted', 'declined')`,
    );
    await queryRunner.query(
      `CREATE TABLE "item_partnership_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "status" "public"."item_partnership_requests_status_enum" NOT NULL DEFAULT 'pending', "rejectionMessage" character varying, "sentAt" TIMESTAMP NOT NULL DEFAULT now(), "acceptedAt" TIMESTAMP, "rejectedAt" TIMESTAMP, "partnershipId" uuid, "proposerId" uuid, "baseProductId" uuid, "baseServiceId" uuid, "plusProductId" uuid, "plusServiceId" uuid, CONSTRAINT "PK_2d06a37dc636c30de611ab1c56b" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "partnerships" DROP COLUMN "productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP COLUMN "serviceId"`,
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
      `ALTER TABLE "partnerships" ADD "baseProductId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" ADD "baseServiceId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" ADD "plusProductId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" ADD "plusServiceId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" ADD "itemPartnershipRequestId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" ADD CONSTRAINT "UQ_012f949f6863004b1e3d2cd1e30" UNIQUE ("itemPartnershipRequestId")`,
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
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnership_requests" ADD CONSTRAINT "FK_b24fd69a2f575e30b336876d511" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnership_requests" ADD CONSTRAINT "FK_8c9aaa5832a037992683a436164" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnerships" ADD CONSTRAINT "FK_82eccd860a0f47679f9fa7ca236" FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnerships" ADD CONSTRAINT "FK_9c1582cf7be176c9c88042d21bc" FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnerships" ADD CONSTRAINT "FK_5dc85ee7f4fe437401be082eb5c" FOREIGN KEY ("requestId") REFERENCES "user_partnership_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" ADD CONSTRAINT "FK_49f6f9794eb5aa6f105cc4b3e31" FOREIGN KEY ("partnershipId") REFERENCES "user_partnerships"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" ADD CONSTRAINT "FK_9d8b25d1bb145e91660690e849d" FOREIGN KEY ("proposerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" ADD CONSTRAINT "FK_868fae9d5405cd854ca62959f25" FOREIGN KEY ("baseProductId") REFERENCES "Products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" ADD CONSTRAINT "FK_cf30a24ef42d699fa7701fde86a" FOREIGN KEY ("baseServiceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" ADD CONSTRAINT "FK_1c4c2b00537d94b2c9cf02cd729" FOREIGN KEY ("plusProductId") REFERENCES "Products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" ADD CONSTRAINT "FK_e44b4082cfe443ad09d1e17d70a" FOREIGN KEY ("plusServiceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" ADD CONSTRAINT "FK_6d9ebf578785965281d454e29bc" FOREIGN KEY ("baseProductId") REFERENCES "Products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" ADD CONSTRAINT "FK_3ab5a24f7a2d0fa564124589bc0" FOREIGN KEY ("baseServiceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" ADD CONSTRAINT "FK_58bcb030eb4f859c48a3a32b514" FOREIGN KEY ("plusProductId") REFERENCES "Products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" ADD CONSTRAINT "FK_85c4034978b917cabe3df52ba26" FOREIGN KEY ("plusServiceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" ADD CONSTRAINT "FK_012f949f6863004b1e3d2cd1e30" FOREIGN KEY ("itemPartnershipRequestId") REFERENCES "item_partnership_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "partnerships" DROP CONSTRAINT "FK_012f949f6863004b1e3d2cd1e30"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP CONSTRAINT "FK_85c4034978b917cabe3df52ba26"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP CONSTRAINT "FK_58bcb030eb4f859c48a3a32b514"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP CONSTRAINT "FK_3ab5a24f7a2d0fa564124589bc0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP CONSTRAINT "FK_6d9ebf578785965281d454e29bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" DROP CONSTRAINT "FK_e44b4082cfe443ad09d1e17d70a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" DROP CONSTRAINT "FK_1c4c2b00537d94b2c9cf02cd729"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" DROP CONSTRAINT "FK_cf30a24ef42d699fa7701fde86a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" DROP CONSTRAINT "FK_868fae9d5405cd854ca62959f25"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" DROP CONSTRAINT "FK_9d8b25d1bb145e91660690e849d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" DROP CONSTRAINT "FK_49f6f9794eb5aa6f105cc4b3e31"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnerships" DROP CONSTRAINT "FK_5dc85ee7f4fe437401be082eb5c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnerships" DROP CONSTRAINT "FK_9c1582cf7be176c9c88042d21bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnerships" DROP CONSTRAINT "FK_82eccd860a0f47679f9fa7ca236"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnership_requests" DROP CONSTRAINT "FK_8c9aaa5832a037992683a436164"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnership_requests" DROP CONSTRAINT "FK_b24fd69a2f575e30b336876d511"`,
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
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "portfolio"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "serviceArea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP COLUMN "skills"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP CONSTRAINT "UQ_012f949f6863004b1e3d2cd1e30"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP COLUMN "itemPartnershipRequestId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP COLUMN "plusServiceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP COLUMN "plusProductId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP COLUMN "baseServiceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP COLUMN "baseProductId"`,
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
    await queryRunner.query(`ALTER TABLE "partnerships" ADD "serviceId" uuid`);
    await queryRunner.query(`ALTER TABLE "partnerships" ADD "productId" uuid`);
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
    await queryRunner.query(`DROP TABLE "item_partnership_requests"`);
    await queryRunner.query(
      `DROP TYPE "public"."item_partnership_requests_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "user_partnerships"`);
    await queryRunner.query(`DROP TABLE "user_partnership_requests"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_partnership_requests_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" ADD CONSTRAINT "FK_727e6d8ac8d55eb3e3cc8fff0f2" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" ADD CONSTRAINT "FK_274147f96f6061357900f785d25" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
