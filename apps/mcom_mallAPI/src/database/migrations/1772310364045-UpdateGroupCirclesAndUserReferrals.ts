import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateGroupCirclesAndUserReferrals1772310364045 implements MigrationInterface {
  name = 'UpdateGroupCirclesAndUserReferrals1772310364045';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."group_circle_messages_type_enum" AS ENUM('GROUP', 'DIRECT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_circle_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "content" text NOT NULL, "type" "public"."group_circle_messages_type_enum" NOT NULL DEFAULT 'GROUP', "senderId" uuid NOT NULL, "recipientId" uuid, "groupId" uuid NOT NULL, CONSTRAINT "PK_893f7c48be7556bb1238db13c9c" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "users" ADD "referralCode" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_b7f8278f4e89249bb75c9a15899" UNIQUE ("referralCode")`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "referredById" uuid`);
    await queryRunner.query(
      `CREATE TYPE "public"."group_members_role_enum" AS ENUM('OWNER', 'ADMIN', 'MEMBER', 'BANKER', 'GUEST', 'PERIPHERAL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members" ADD "role" "public"."group_members_role_enum" NOT NULL DEFAULT 'MEMBER'`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members" ADD "drawDate" TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."groups_type_enum" AS ENUM('MARKETING', 'ADVERTISING', 'NEARBY', 'HYPERLOCAL', 'NATIONAL', 'GLOBAL', 'SMART_MONEY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD "type" "public"."groups_type_enum" NOT NULL DEFAULT 'MARKETING'`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD "duration" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD "contributionAmount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."groups_payoutfrequency_enum" AS ENUM('WEEKLY', 'MONTHLY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD "payoutFrequency" "public"."groups_payoutfrequency_enum" NOT NULL DEFAULT 'MONTHLY'`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD "currentRound" integer NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(`ALTER TABLE "groups" ADD "startDate" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TYPE "public"."group_members_status_enum" RENAME TO "group_members_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."group_members_status_enum" AS ENUM('PENDING_PAYMENT', 'ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members" ALTER COLUMN "status" TYPE "public"."group_members_status_enum" USING UPPER("status"::"text")::"public"."group_members_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."group_members_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ALTER COLUMN "localArea" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ALTER COLUMN "size" SET DEFAULT '6'`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ALTER COLUMN "recruitmentDeadline" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."groups_status_enum" RENAME TO "groups_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."groups_status_enum" AS ENUM('RECRUITING', 'ACTIVE', 'INACTIVE', 'COMPLETED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ALTER COLUMN "status" TYPE "public"."groups_status_enum" USING UPPER("status"::"text")::"public"."groups_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ALTER COLUMN "status" SET DEFAULT 'RECRUITING'`,
    );
    await queryRunner.query(`DROP TYPE "public"."groups_status_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_1142607b5a447cd5ce23ef7798f" FOREIGN KEY ("referredById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_circle_messages" ADD CONSTRAINT "FK_cdaa63afd19d22abc0f47ff3bf0" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_circle_messages" ADD CONSTRAINT "FK_6ee2a0c7fcf25f20616f7a1dafc" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_circle_messages" ADD CONSTRAINT "FK_a29577374001b03539cfbb0c2bd" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_circle_messages" DROP CONSTRAINT "FK_a29577374001b03539cfbb0c2bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_circle_messages" DROP CONSTRAINT "FK_6ee2a0c7fcf25f20616f7a1dafc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_circle_messages" DROP CONSTRAINT "FK_cdaa63afd19d22abc0f47ff3bf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_1142607b5a447cd5ce23ef7798f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."groups_status_enum_old" AS ENUM('recruiting', 'active', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ALTER COLUMN "status" TYPE "public"."groups_status_enum_old" USING LOWER("status"::"text")::"public"."groups_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ALTER COLUMN "status" SET DEFAULT 'recruiting'`,
    );
    await queryRunner.query(`DROP TYPE "public"."groups_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."groups_status_enum_old" RENAME TO "groups_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ALTER COLUMN "recruitmentDeadline" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ALTER COLUMN "size" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ALTER COLUMN "localArea" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."group_members_status_enum_old" AS ENUM('pending_payment', 'active')`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members" ALTER COLUMN "status" TYPE "public"."group_members_status_enum_old" USING LOWER("status"::"text")::"public"."group_members_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members" ALTER COLUMN "status" SET DEFAULT 'pending_payment'`,
    );
    await queryRunner.query(`DROP TYPE "public"."group_members_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."group_members_status_enum_old" RENAME TO "group_members_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "startDate"`);
    await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "currentRound"`);
    await queryRunner.query(
      `ALTER TABLE "groups" DROP COLUMN "payoutFrequency"`,
    );
    await queryRunner.query(`DROP TYPE "public"."groups_payoutfrequency_enum"`);
    await queryRunner.query(
      `ALTER TABLE "groups" DROP COLUMN "contributionAmount"`,
    );
    await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "duration"`);
    await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."groups_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "group_members" DROP COLUMN "drawDate"`,
    );
    await queryRunner.query(`ALTER TABLE "group_members" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "public"."group_members_role_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "referredById"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_b7f8278f4e89249bb75c9a15899"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "referralCode"`);
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
    await queryRunner.query(`DROP TABLE "group_circle_messages"`);
    await queryRunner.query(
      `DROP TYPE "public"."group_circle_messages_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
