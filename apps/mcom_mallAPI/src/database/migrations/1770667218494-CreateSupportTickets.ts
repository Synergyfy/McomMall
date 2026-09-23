import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupportTickets1770667218494 implements MigrationInterface {
  name = 'CreateSupportTickets1770667218494';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_81d38487c29d69bf340eead614c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" DROP CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3"`,
    );
    await queryRunner.query(
      `CREATE TABLE "support_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "content" text NOT NULL, "senderId" uuid NOT NULL, "ticketId" uuid NOT NULL, "isAdminMessage" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_2aa37479e71ef29cbf4dba2b1a2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."support_tickets_status_enum" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "support_tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "subject" character varying NOT NULL, "description" text NOT NULL, "status" "public"."support_tickets_status_enum" NOT NULL DEFAULT 'OPEN', "userId" uuid NOT NULL, "lastMessageAt" TIMESTAMP, CONSTRAINT "PK_942e8d8f5df86100471d2324643" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_messages" ADD CONSTRAINT "FK_a6d023327205aee297257d4f0fe" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_messages" ADD CONSTRAINT "FK_219aab1e47674b144d2094cfa1f" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_tickets" ADD CONSTRAINT "FK_8679e2ff150ff0e253189ca0253" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "support_tickets" DROP CONSTRAINT "FK_8679e2ff150ff0e253189ca0253"`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_messages" DROP CONSTRAINT "FK_219aab1e47674b144d2094cfa1f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_messages" DROP CONSTRAINT "FK_a6d023327205aee297257d4f0fe"`,
    );
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
    await queryRunner.query(`DROP TABLE "support_tickets"`);
    await queryRunner.query(`DROP TYPE "public"."support_tickets_status_enum"`);
    await queryRunner.query(`DROP TABLE "support_messages"`);
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_f143f396ea55404f8ed5a5421a3" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "FK_81d38487c29d69bf340eead614c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
