import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVerificationsModule1790079776166 implements MigrationInterface {
    name = 'AddVerificationsModule1790079776166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verifications_subjecttype_enum') THEN CREATE TYPE "public"."verifications_subjecttype_enum" AS ENUM('identity', 'business'); END IF; END $$;`
        );
        await queryRunner.query(
            `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verifications_status_enum') THEN CREATE TYPE "public"."verifications_status_enum" AS ENUM('pending', 'approved', 'rejected'); END IF; END $$;`
        );
        await queryRunner.query(`CREATE TABLE "verifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "subjectType" "public"."verifications_subjecttype_enum" NOT NULL, "subjectId" uuid, "subjectName" character varying NOT NULL, "documentType" character varying NOT NULL, "documentUrl" character varying, "status" "public"."verifications_status_enum" NOT NULL DEFAULT 'pending', "reviewNote" text, "reviewedBy" uuid, CONSTRAINT "PK_2127ad1b143cf012280390b01d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_75dd48892a82f02c99364a8ce1" ON "verifications" ("subjectType") `);
        await queryRunner.query(`CREATE INDEX "IDX_2af0d22d4ed9267c926f3b98f4" ON "verifications" ("status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_2af0d22d4ed9267c926f3b98f4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_75dd48892a82f02c99364a8ce1"`);
        await queryRunner.query(`DROP TABLE "verifications"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."verifications_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."verifications_subjecttype_enum"`);
    }

}
