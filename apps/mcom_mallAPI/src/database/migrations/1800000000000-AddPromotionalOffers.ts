import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPromotionalOffers1800000000000 implements MigrationInterface {
  name = 'AddPromotionalOffers1800000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "promotional_offers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying(200) NOT NULL,
        "offeringType" character varying(20) NOT NULL DEFAULT 'product',
        "sector" character varying,
        "category" character varying,
        "subCategory" character varying,
        "brand" character varying,
        "tags" text,
        "shortDescription" text,
        "description" text,
        "images" text,
        "price" bigint,
        "salePrice" bigint,
        "currency" character varying(8) NOT NULL DEFAULT 'GBP',
        "destinationUrl" character varying(2048) NOT NULL,
        "affiliateTrackingUrl" character varying(2048),
        "affiliateNetwork" character varying(40) NOT NULL DEFAULT 'awin',
        "advertiserId" character varying,
        "advertiserName" character varying,
        "advertiserProgramme" character varying,
        "awinProductId" character varying,
        "commissionRate" numeric(8,2) NOT NULL DEFAULT '0',
        "businessCommissionRate" numeric(8,2) NOT NULL DEFAULT '0',
        "availability" character varying(20) NOT NULL DEFAULT 'all',
        "status" character varying(20) NOT NULL DEFAULT 'draft',
        "startDate" TIMESTAMP WITH TIME ZONE,
        "endDate" TIMESTAMP WITH TIME ZONE,
        "termsAndConditions" text,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "displayOrder" integer NOT NULL DEFAULT '0',
        "metadata" jsonb,
        "createdById" uuid,
        CONSTRAINT "PK_promotional_offers" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_promotional_offers_type" ON "promotional_offers" ("offeringType")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_promotional_offers_availability" ON "promotional_offers" ("availability")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_promotional_offers_status" ON "promotional_offers" ("status")`,
    );

    await queryRunner.query(
      `CREATE TABLE "promotional_offer_businesses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "offerId" uuid NOT NULL,
        "businessId" uuid NOT NULL,
        CONSTRAINT "PK_promotional_offer_businesses" PRIMARY KEY ("id"),
        CONSTRAINT "FK_promotional_offer_businesses_offer" FOREIGN KEY ("offerId") REFERENCES "promotional_offers"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_promotional_offer_businesses_business" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_promotional_offer_business" ON "promotional_offer_businesses" ("offerId", "businessId")`,
    );

    await queryRunner.query(
      `CREATE TABLE "business_promotional_offers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "businessId" uuid NOT NULL,
        "offerId" uuid NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "importedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "removedAt" TIMESTAMP WITH TIME ZONE,
        "importedByUserId" uuid,
        CONSTRAINT "PK_business_promotional_offers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_business_promotional_offers_business" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_business_promotional_offers_offer" FOREIGN KEY ("offerId") REFERENCES "promotional_offers"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_business_promotional_offer" ON "business_promotional_offers" ("businessId", "offerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_business_promotional_offers_active" ON "business_promotional_offers" ("businessId", "isActive")`,
    );

    await queryRunner.query(
      `CREATE TABLE "affiliate_clicks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "offerId" uuid,
        "businessId" uuid,
        "clickRef" character varying(160) NOT NULL,
        "source" character varying,
        "destinationUrl" character varying(2048) NOT NULL,
        "trackingUrl" character varying(2048),
        "referrer" character varying(2048),
        "userAgent" character varying(512),
        "ipHash" character varying(64),
        "attributed" boolean NOT NULL DEFAULT false,
        "transactionId" uuid,
        CONSTRAINT "PK_affiliate_clicks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_affiliate_clicks_offer" FOREIGN KEY ("offerId") REFERENCES "promotional_offers"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_affiliate_clicks_business" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE SET NULL
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_affiliate_clicks_clickref" ON "affiliate_clicks" ("clickRef")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_affiliate_clicks_offer" ON "affiliate_clicks" ("offerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_affiliate_clicks_business" ON "affiliate_clicks" ("businessId")`,
    );

    await queryRunner.query(
      `CREATE TABLE "affiliate_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "externalTransactionId" character varying(160) NOT NULL,
        "offerId" uuid,
        "businessId" uuid,
        "clickId" uuid,
        "clickRef" character varying(160),
        "advertiserId" character varying,
        "advertiserName" character varying,
        "status" character varying(24) NOT NULL DEFAULT 'unknown',
        "rawStatus" character varying,
        "saleAmount" bigint,
        "commissionAmount" bigint,
        "currency" character varying(8) NOT NULL DEFAULT 'GBP',
        "transactionDate" TIMESTAMP WITH TIME ZONE,
        "rawPayload" jsonb,
        CONSTRAINT "PK_affiliate_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_affiliate_transactions_offer" FOREIGN KEY ("offerId") REFERENCES "promotional_offers"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_affiliate_transactions_business" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_affiliate_transactions_click" FOREIGN KEY ("clickId") REFERENCES "affiliate_clicks"("id") ON DELETE SET NULL
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_affiliate_transactions_external" ON "affiliate_transactions" ("externalTransactionId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_affiliate_transactions_offer" ON "affiliate_transactions" ("offerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_affiliate_transactions_business" ON "affiliate_transactions" ("businessId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_affiliate_transactions_clickref" ON "affiliate_transactions" ("clickRef")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "affiliate_transactions"`);
    await queryRunner.query(`DROP TABLE "affiliate_clicks"`);
    await queryRunner.query(`DROP TABLE "business_promotional_offers"`);
    await queryRunner.query(`DROP TABLE "promotional_offer_businesses"`);
    await queryRunner.query(`DROP TABLE "promotional_offers"`);
  }
}
