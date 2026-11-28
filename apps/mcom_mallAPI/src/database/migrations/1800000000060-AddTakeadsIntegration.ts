import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTakeadsIntegration1800000000060
  implements MigrationInterface
{
  name = 'AddTakeadsIntegration1800000000060';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "takeads_merchants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "externalMerchantId" character varying(160) NOT NULL,
        "name" character varying(200) NOT NULL,
        "imageUrl" character varying(2048),
        "defaultDomain" character varying(255),
        "domains" text,
        "description" text,
        "upstreamCategoryId" character varying,
        "currencyCode" character varying(8),
        "countryCodes" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "deeplinkAllowed" boolean NOT NULL DEFAULT false,
        "commissionMetadata" jsonb,
        "trackingLink" character varying(2048),
        "rawPayload" jsonb,
        "lastSyncedAt" TIMESTAMP WITH TIME ZONE,
        "mcomStatus" character varying(20) NOT NULL DEFAULT 'not_reviewed',
        "mcomSectorId" character varying,
        "mcomCategoryId" character varying,
        "mcomSubCategoryId" character varying,
        "reviewNote" text,
        "reviewedBy" uuid,
        "reviewedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_takeads_merchants" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_takeads_merchants_external" ON "takeads_merchants" ("externalMerchantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_merchants_status" ON "takeads_merchants" ("mcomStatus")`,
    );

    await queryRunner.query(
      `CREATE TABLE "takeads_coupons" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "externalCouponId" character varying(160) NOT NULL,
        "merchantId" uuid,
        "externalMerchantId" character varying(160),
        "name" character varying(300) NOT NULL,
        "code" character varying(120),
        "description" text,
        "imageUrl" character varying(2048),
        "trackingLink" character varying(2048),
        "startDate" TIMESTAMP WITH TIME ZONE,
        "endDate" TIMESTAMP WITH TIME ZONE,
        "isActive" boolean NOT NULL DEFAULT true,
        "languageCodes" text,
        "countryCodes" text,
        "upstreamCategoryIds" text,
        "rawPayload" jsonb,
        "lastSyncedAt" TIMESTAMP WITH TIME ZONE,
        "approvalStatus" character varying(20) NOT NULL DEFAULT 'pending',
        "publicationStatus" character varying(20) NOT NULL DEFAULT 'unpublished',
        "adminDisabled" boolean NOT NULL DEFAULT false,
        "reviewNote" text,
        "reviewedBy" uuid,
        "reviewedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_takeads_coupons" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_takeads_coupons_external" ON "takeads_coupons" ("externalCouponId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_coupons_merchant" ON "takeads_coupons" ("merchantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_coupons_approval" ON "takeads_coupons" ("approvalStatus")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_coupons_publication" ON "takeads_coupons" ("publicationStatus")`,
    );

    await queryRunner.query(
      `CREATE TABLE "takeads_offers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "sourceType" character varying(20) NOT NULL DEFAULT 'product_url',
        "externalMerchantId" character varying(160),
        "externalCouponId" character varying(160),
        "externalProgramId" character varying(160),
        "merchantName" character varying(200),
        "destinationUrl" character varying(2048) NOT NULL,
        "resolvedTrackingUrl" character varying(2048),
        "linkResolvedAt" TIMESTAMP WITH TIME ZONE,
        "subId" character varying(30),
        "title" character varying(200) NOT NULL,
        "shortDescription" text,
        "description" text,
        "images" text,
        "imageSource" character varying(500),
        "mcomSectorId" character varying,
        "mcomCategoryId" character varying,
        "mcomSubCategoryId" character varying,
        "countryCode" character varying(2) NOT NULL DEFAULT 'GB',
        "currency" character varying(8) NOT NULL DEFAULT 'GBP',
        "offerType" character varying(20) NOT NULL DEFAULT 'product',
        "campaignLabel" character varying(120),
        "placement" character varying(40) NOT NULL DEFAULT 'marketplace',
        "termsAndConditions" text,
        "startDate" TIMESTAMP WITH TIME ZONE,
        "endDate" TIMESTAMP WITH TIME ZONE,
        "approvalStatus" character varying(20) NOT NULL DEFAULT 'pending',
        "publicationStatus" character varying(20) NOT NULL DEFAULT 'unpublished',
        "upstreamActive" boolean NOT NULL DEFAULT true,
        "adminDisabled" boolean NOT NULL DEFAULT false,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "displayOrder" integer NOT NULL DEFAULT 0,
        "reviewNote" text,
        "reviewedBy" uuid,
        "reviewedAt" TIMESTAMP WITH TIME ZONE,
        "createdById" uuid,
        "lastSyncedAt" TIMESTAMP WITH TIME ZONE,
        "rawPayload" jsonb,
        CONSTRAINT "PK_takeads_offers" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_offers_source_type" ON "takeads_offers" ("sourceType")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_offers_merchant" ON "takeads_offers" ("externalMerchantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_offers_coupon" ON "takeads_offers" ("externalCouponId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_takeads_offers_subid" ON "takeads_offers" ("subId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_offers_type" ON "takeads_offers" ("offerType")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_offers_approval" ON "takeads_offers" ("approvalStatus")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_offers_publication" ON "takeads_offers" ("publicationStatus")`,
    );

    await queryRunner.query(
      `CREATE TABLE "takeads_clicks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "offerId" uuid,
        "merchantId" character varying(160),
        "couponId" character varying(160),
        "clickRef" character varying(160) NOT NULL,
        "subId" character varying(30),
        "source" character varying(40),
        "placement" character varying(40),
        "destinationUrl" character varying(2048) NOT NULL,
        "trackingUrl" character varying(2048),
        "referrer" character varying(2048),
        "userAgent" character varying(512),
        "ipHash" character varying(64),
        CONSTRAINT "PK_takeads_clicks" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_takeads_clicks_ref" ON "takeads_clicks" ("clickRef")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_clicks_offer" ON "takeads_clicks" ("offerId")`,
    );

    await queryRunner.query(
      `CREATE TABLE "takeads_sync_runs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "type" character varying(20) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'running',
        "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "finishedAt" TIMESTAMP WITH TIME ZONE,
        "itemsReceived" integer NOT NULL DEFAULT 0,
        "itemsCreated" integer NOT NULL DEFAULT 0,
        "itemsUpdated" integer NOT NULL DEFAULT 0,
        "itemsFailed" integer NOT NULL DEFAULT 0,
        "errorMessage" text,
        "watermark" character varying(255),
        CONSTRAINT "PK_takeads_sync_runs" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_sync_runs_type" ON "takeads_sync_runs" ("type")`,
    );

    await queryRunner.query(
      `CREATE TABLE "takeads_click_reports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "reportKey" character varying(400) NOT NULL,
        "date" date NOT NULL,
        "adspaceId" character varying(160),
        "merchantId" character varying(160),
        "merchantName" character varying(200),
        "couponId" character varying(160),
        "subId" character varying(30),
        "count" integer NOT NULL DEFAULT 0,
        "sourceUpdatedAt" TIMESTAMP WITH TIME ZONE,
        "rawPayload" jsonb,
        CONSTRAINT "PK_takeads_click_reports" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_takeads_click_reports_key" ON "takeads_click_reports" ("reportKey")`,
    );

    await queryRunner.query(
      `CREATE TABLE "takeads_actions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "actionId" character varying(160) NOT NULL,
        "actionNumericId" character varying(160),
        "status" character varying(20) NOT NULL,
        "type" character varying(20),
        "merchantId" character varying(160),
        "adspaceId" character varying(160),
        "programId" character varying(160),
        "couponId" character varying(160),
        "subId" character varying(30),
        "orderAmount" numeric(14,2),
        "publisherRevenue" numeric(14,2),
        "currencyCode" character varying(8),
        "advertiserPaid" boolean,
        "orderDate" TIMESTAMP WITH TIME ZONE,
        "clickId" character varying(160),
        "sourceCreatedAt" TIMESTAMP WITH TIME ZONE,
        "sourceUpdatedAt" TIMESTAMP WITH TIME ZONE,
        "rawPayload" jsonb,
        CONSTRAINT "PK_takeads_actions" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_takeads_actions_action" ON "takeads_actions" ("actionId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_actions_status" ON "takeads_actions" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_actions_merchant" ON "takeads_actions" ("merchantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_takeads_actions_subid" ON "takeads_actions" ("subId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "takeads_actions"`);
    await queryRunner.query(`DROP TABLE "takeads_click_reports"`);
    await queryRunner.query(`DROP TABLE "takeads_sync_runs"`);
    await queryRunner.query(`DROP TABLE "takeads_clicks"`);
    await queryRunner.query(`DROP TABLE "takeads_offers"`);
    await queryRunner.query(`DROP TABLE "takeads_coupons"`);
    await queryRunner.query(`DROP TABLE "takeads_merchants"`);
  }
}
