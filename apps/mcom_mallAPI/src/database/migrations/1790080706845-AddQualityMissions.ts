import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQualityMissions1790080706845 implements MigrationInterface {
    name = 'AddQualityMissions1790080706845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."quality_missions_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "quality_missions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "businessId" uuid NOT NULL, "shopperName" character varying NOT NULL, "status" "public"."quality_missions_status_enum" NOT NULL DEFAULT 'pending', "score" double precision, "notes" text, "scheduledFor" TIMESTAMP, CONSTRAINT "PK_quality_missions" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_quality_missions_businessId" ON "quality_missions" ("businessId") `);
        await queryRunner.query(`CREATE INDEX "IDX_quality_missions_status" ON "quality_missions" ("status") `);
        await queryRunner.query(`ALTER TABLE "quality_missions" ADD CONSTRAINT "FK_quality_missions_business" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quality_missions" DROP CONSTRAINT "FK_quality_missions_business"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_quality_missions_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_quality_missions_businessId"`);
        await queryRunner.query(`DROP TABLE "quality_missions"`);
        await queryRunner.query(`DROP TYPE "public"."quality_missions_status_enum"`);
    }

}
