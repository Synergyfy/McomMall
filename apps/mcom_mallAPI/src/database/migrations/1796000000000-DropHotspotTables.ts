import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropHotspotTables1796000000000 implements MigrationInterface {
  name = 'DropHotspotTables1796000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "hotspots" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hotspot_campaigns" CASCADE;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "hotspot_campaigns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "imageUrl" character varying, "businessId" uuid NOT NULL, CONSTRAINT "PK_hotspot_campaigns" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_hotspot_campaigns_businessId" ON "hotspot_campaigns" ("businessId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "hotspot_campaigns" ADD CONSTRAINT "FK_hotspot_campaigns_businessId" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "hotspots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "x" double precision NOT NULL, "y" double precision NOT NULL, "link" character varying NOT NULL, "campaignId" uuid NOT NULL, CONSTRAINT "PK_hotspots" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_hotspots_campaignId" ON "hotspots" ("campaignId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "hotspots" ADD CONSTRAINT "FK_hotspots_campaignId" FOREIGN KEY ("campaignId") REFERENCES "hotspot_campaigns"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
