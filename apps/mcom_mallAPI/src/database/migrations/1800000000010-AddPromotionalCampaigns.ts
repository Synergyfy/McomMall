import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPromotionalCampaigns1800000000010
  implements MigrationInterface
{
  name = 'AddPromotionalCampaigns1800000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "promotional_campaigns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying(200) NOT NULL,
        "description" text,
        "termsAndConditions" text,
        "status" character varying(20) NOT NULL DEFAULT 'draft',
        "startDate" TIMESTAMP WITH TIME ZONE,
        "endDate" TIMESTAMP WITH TIME ZONE,
        "rewardType" character varying(20) NOT NULL DEFAULT 'other',
        "rewardTitle" character varying,
        "rewardDescription" text,
        "rewardValue" bigint,
        "availableToAll" boolean NOT NULL DEFAULT false,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "promotionalMaterials" jsonb,
        "metadata" jsonb,
        "createdById" uuid,
        CONSTRAINT "PK_promotional_campaigns" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_promotional_campaigns_status" ON "promotional_campaigns" ("status")`,
    );

    await queryRunner.query(
      `CREATE TABLE "promotional_campaign_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "campaignId" uuid NOT NULL,
        "itemType" character varying(24) NOT NULL,
        "productId" uuid,
        "serviceId" uuid,
        "offerId" uuid,
        "ownerBusinessId" uuid,
        "advertiserBusinessId" uuid,
        "title" character varying(240) NOT NULL,
        "imageUrl" character varying(2048),
        "price" bigint,
        "destinationUrl" character varying(2048),
        "displayOrder" integer NOT NULL DEFAULT '0',
        "metadata" jsonb,
        CONSTRAINT "PK_promotional_campaign_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_promotional_campaign_items_campaign" FOREIGN KEY ("campaignId") REFERENCES "promotional_campaigns"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_promotional_campaign_items_campaign" ON "promotional_campaign_items" ("campaignId")`,
    );

    await queryRunner.query(
      `CREATE TABLE "promotional_campaign_businesses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "campaignId" uuid NOT NULL,
        "businessId" uuid NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'invited',
        "invitedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "respondedAt" TIMESTAMP WITH TIME ZONE,
        "note" text,
        CONSTRAINT "PK_promotional_campaign_businesses" PRIMARY KEY ("id"),
        CONSTRAINT "FK_promotional_campaign_businesses_campaign" FOREIGN KEY ("campaignId") REFERENCES "promotional_campaigns"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_promotional_campaign_businesses_business" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_promotional_campaign_business" ON "promotional_campaign_businesses" ("campaignId", "businessId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_promotional_campaign_businesses_campaign" ON "promotional_campaign_businesses" ("campaignId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_promotional_campaign_businesses_business" ON "promotional_campaign_businesses" ("businessId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "affiliate_clicks" ADD "campaignId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_affiliate_clicks_campaign" ON "affiliate_clicks" ("campaignId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "FK_affiliate_clicks_campaign" FOREIGN KEY ("campaignId") REFERENCES "promotional_campaigns"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "affiliate_clicks" DROP CONSTRAINT "FK_affiliate_clicks_campaign"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_affiliate_clicks_campaign"`,
    );
    await queryRunner.query(
      `ALTER TABLE "affiliate_clicks" DROP COLUMN "campaignId"`,
    );
    await queryRunner.query(`DROP TABLE "promotional_campaign_businesses"`);
    await queryRunner.query(`DROP TABLE "promotional_campaign_items"`);
    await queryRunner.query(`DROP TABLE "promotional_campaigns"`);
  }
}
