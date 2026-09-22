import { MigrationInterface, QueryRunner } from "typeorm";

export class AddServiceTemplatesModule1790078907042 implements MigrationInterface {
    name = 'AddServiceTemplatesModule1790078907042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "service_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "category" character varying, "description" text, "packages" jsonb NOT NULL DEFAULT '[]', "requirements" text, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_97bdd13baebd4bd3723aa0d3076" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9aec52686a7a08b14b9b00179a" ON "service_templates" ("name") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9aec52686a7a08b14b9b00179a"`);
        await queryRunner.query(`DROP TABLE "service_templates"`);
    }

}
