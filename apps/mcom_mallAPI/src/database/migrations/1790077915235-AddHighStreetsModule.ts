import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHighStreetsModule1790077915235 implements MigrationInterface {
    name = 'AddHighStreetsModule1790077915235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."high_streets_status_enum" AS ENUM('active', 'pending', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "high_streets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" text, "status" "public"."high_streets_status_enum" NOT NULL DEFAULT 'pending', "latitude" double precision, "longitude" double precision, "hasPhysicalHub" boolean NOT NULL DEFAULT false, "hasVirtualHub" boolean NOT NULL DEFAULT false, "boroughId" uuid, CONSTRAINT "PK_23548e77351dc68568163807ea6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9bca69075201d80c360d6f7d2f" ON "high_streets" ("status") `);
        await queryRunner.query(`ALTER TABLE "high_streets" ADD CONSTRAINT "FK_4e718cbf7da8d7f0e37a7c8d16a" FOREIGN KEY ("boroughId") REFERENCES "boroughs"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "high_streets" DROP CONSTRAINT "FK_4e718cbf7da8d7f0e37a7c8d16a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9bca69075201d80c360d6f7d2f"`);
        await queryRunner.query(`DROP TABLE "high_streets"`);
        await queryRunner.query(`DROP TYPE "public"."high_streets_status_enum"`);
    }

}
