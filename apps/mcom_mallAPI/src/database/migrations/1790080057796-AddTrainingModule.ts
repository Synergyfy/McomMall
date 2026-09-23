import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrainingModule1790080057796 implements MigrationInterface {
    name = 'AddTrainingModule1790080057796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."training_modules_kind_enum" AS ENUM('course', 'webinar', 'doc')`);
        await queryRunner.query(`CREATE TABLE "training_modules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "kind" "public"."training_modules_kind_enum" NOT NULL DEFAULT 'course', "description" text, "contentUrl" character varying, "durationMinutes" integer, "isPublished" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_eb8283e63be7f65abc59c5d96a3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f3b1c8e51b779b76a14110de75" ON "training_modules" ("title") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_f3b1c8e51b779b76a14110de75"`);
        await queryRunner.query(`DROP TABLE "training_modules"`);
        await queryRunner.query(`DROP TYPE "public"."training_modules_kind_enum"`);
    }

}
