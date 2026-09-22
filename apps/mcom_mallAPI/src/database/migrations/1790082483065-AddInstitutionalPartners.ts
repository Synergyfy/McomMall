import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInstitutionalPartners1790082483065 implements MigrationInterface {
    name = 'AddInstitutionalPartners1790082483065'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."institutional_partners_status_enum" AS ENUM('active', 'pending', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "institutional_partners" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "status" "public"."institutional_partners_status_enum" NOT NULL DEFAULT 'pending', "type" character varying, "contactPerson" character varying, "email" character varying, "phone" character varying, "plaqueCount" integer NOT NULL DEFAULT '0', "businessCount" integer NOT NULL DEFAULT '0', "startDate" date, CONSTRAINT "PK_institutional_partners" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_institutional_partners_name" ON "institutional_partners" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_institutional_partners_status" ON "institutional_partners" ("status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_institutional_partners_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_institutional_partners_name"`);
        await queryRunner.query(`DROP TABLE "institutional_partners"`);
        await queryRunner.query(`DROP TYPE "public"."institutional_partners_status_enum"`);
    }

}
