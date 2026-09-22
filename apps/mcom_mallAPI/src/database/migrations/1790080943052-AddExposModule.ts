import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExposModule1790080943052 implements MigrationInterface {
    name = 'AddExposModule1790080943052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."expos_status_enum" AS ENUM('planning', 'upcoming', 'active', 'ended', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "expos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" text, "venue" character varying, "status" "public"."expos_status_enum" NOT NULL DEFAULT 'planning', "startDate" TIMESTAMP, "endDate" TIMESTAMP, "boroughId" uuid, CONSTRAINT "PK_expos" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_expos_name" ON "expos" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_expos_status" ON "expos" ("status") `);
        await queryRunner.query(`ALTER TABLE "expos" ADD CONSTRAINT "FK_expos_borough" FOREIGN KEY ("boroughId") REFERENCES "boroughs"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expos" DROP CONSTRAINT "FK_expos_borough"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_expos_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_expos_name"`);
        await queryRunner.query(`DROP TABLE "expos"`);
        await queryRunner.query(`DROP TYPE "public"."expos_status_enum"`);
    }

}
