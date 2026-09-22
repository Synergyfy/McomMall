import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOnboardingQuestions1790080338042 implements MigrationInterface {
    name = 'AddOnboardingQuestions1790080338042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."onboarding_questions_inputtype_enum" AS ENUM('text', 'textarea', 'yesno', 'image')`);
        await queryRunner.query(`CREATE TABLE "onboarding_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "prompt" text NOT NULL, "inputType" "public"."onboarding_questions_inputtype_enum" NOT NULL DEFAULT 'text', "displayOrder" integer NOT NULL DEFAULT '0', "isRequired" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_7943027b3715df8b0932c611fe0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8f46154878abe386c353493e46" ON "onboarding_questions" ("displayOrder") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_8f46154878abe386c353493e46"`);
        await queryRunner.query(`DROP TABLE "onboarding_questions"`);
        await queryRunner.query(`DROP TYPE "public"."onboarding_questions_inputtype_enum"`);
    }

}
