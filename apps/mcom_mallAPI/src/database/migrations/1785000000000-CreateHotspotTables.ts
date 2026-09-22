import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHotspotTables1785000000000 implements MigrationInterface {
  name = 'CreateHotspotTables1785000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasCampaigns = await queryRunner.hasTable('hotspot_campaigns');
    if (!hasCampaigns) {
      await queryRunner.query(
        `CREATE TABLE "hotspot_campaigns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "imageUrl" character varying, "businessId" uuid NOT NULL, CONSTRAINT "PK_hotspot_campaigns" PRIMARY KEY ("id"))`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_hotspot_campaigns_businessId" ON "hotspot_campaigns" ("businessId")`,
      );
      await queryRunner.query(
        `ALTER TABLE "hotspot_campaigns" ADD CONSTRAINT "FK_hotspot_campaigns_businessId" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }

    const hasHotspots = await queryRunner.hasTable('hotspots');
    if (!hasHotspots) {
      await queryRunner.query(
        `CREATE TABLE "hotspots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "x" double precision NOT NULL, "y" double precision NOT NULL, "link" character varying NOT NULL, "campaignId" uuid NOT NULL, CONSTRAINT "PK_hotspots" PRIMARY KEY ("id"))`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_hotspots_campaignId" ON "hotspots" ("campaignId")`,
      );
      await queryRunner.query(
        `ALTER TABLE "hotspots" ADD CONSTRAINT "FK_hotspots_campaignId" FOREIGN KEY ("campaignId") REFERENCES "hotspot_campaigns"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('hotspots')) {
      await queryRunner.query(
        `ALTER TABLE "hotspots" DROP CONSTRAINT IF EXISTS "FK_hotspots_campaignId"`,
      );
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_hotspots_campaignId"`);
      await queryRunner.query(`DROP TABLE IF EXISTS "hotspots"`);
    }
    if (await queryRunner.hasTable('hotspot_campaigns')) {
      await queryRunner.query(
        `ALTER TABLE "hotspot_campaigns" DROP CONSTRAINT IF EXISTS "FK_hotspot_campaigns_businessId"`,
      );
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_hotspot_campaigns_businessId"`);
      await queryRunner.query(`DROP TABLE IF EXISTS "hotspot_campaigns"`);
    }
  }
}
