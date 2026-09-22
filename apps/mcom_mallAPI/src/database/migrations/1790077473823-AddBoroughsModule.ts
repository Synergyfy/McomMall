import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBoroughsModule1790077473823 implements MigrationInterface {
    name = 'AddBoroughsModule1790077473823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "boroughs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "activityLevel" character varying, "managerName" character varying, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_688fe0c68ffe1f424b98785de6b" UNIQUE ("name"), CONSTRAINT "PK_e408198b2e58e233ce12450f16d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_688fe0c68ffe1f424b98785de6" ON "boroughs" ("name") `);
        await queryRunner.query(`ALTER TABLE "borough_campaigns" ADD "boroughId" uuid`);
        await queryRunner.query(`ALTER TABLE "borough_campaigns" ADD CONSTRAINT "FK_1c943cbf2cc7997394ecb1fb8d2" FOREIGN KEY ("boroughId") REFERENCES "boroughs"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "borough_campaigns" DROP CONSTRAINT "FK_1c943cbf2cc7997394ecb1fb8d2"`);
        await queryRunner.query(`ALTER TABLE "borough_campaigns" DROP COLUMN "boroughId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_688fe0c68ffe1f424b98785de6"`);
        await queryRunner.query(`DROP TABLE "boroughs"`);
    }

}
