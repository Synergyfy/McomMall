import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTierAndUpdateMembership1768222848227 implements MigrationInterface {
  name = 'CreateTierAndUpdateMembership1768222848227';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tiers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" text, "monthlyPrice" numeric(10,2) NOT NULL DEFAULT '0', "annualPrice" numeric(10,2) NOT NULL DEFAULT '0', "stripeMonthlyPriceId" character varying, "stripeAnnualPriceId" character varying, "paypalMonthlyPlanId" character varying, "paypalAnnualPlanId" character varying, "configuration" jsonb NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_55943419515985012351235" UNIQUE ("name"), CONSTRAINT "PK_55943419515985012351236" PRIMARY KEY ("id"))`,
    );

    // Add new columns to memberships
    await queryRunner.query(`ALTER TABLE "memberships" ADD "tier_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "memberships" ADD "isTrial" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "memberships" ADD "planType" character varying NOT NULL DEFAULT 'monthly'`,
    );

    // Add foreign key
    await queryRunner.query(
      `ALTER TABLE "memberships" ADD CONSTRAINT "FK_tier_membership" FOREIGN KEY ("tier_id") REFERENCES "tiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Seed default tiers
    const tiers = [
      {
        name: 'Basic',
        monthlyPrice: 10,
        annualPrice: 100,
        configuration: JSON.stringify({
          quotas: {
            maxListings: 5,
            allowProductListing: true,
            allowServiceListing: true,
            maxProducts: 10,
            maxServices: 5,
            maxGiftCardTemplates: 1,
            maxCouponTemplates: 1,
            maxLoyaltyPrograms: 0,
            maxImagesPerListing: 3,
            featuredListingAllowance: 0,
          },
          featureFlags: {
            priorityInSearch: false,
            advancedAnalytics: false,
            dedicatedSupport: false,
            allowCustomBranding: false,
            allowGroupCreation: false,
          },
        }),
      },
      {
        name: 'Extended',
        monthlyPrice: 50,
        annualPrice: 500,
        configuration: JSON.stringify({
          quotas: {
            maxListings: 20,
            allowProductListing: true,
            allowServiceListing: true,
            maxProducts: 50,
            maxServices: 20,
            maxGiftCardTemplates: 5,
            maxCouponTemplates: 5,
            maxLoyaltyPrograms: 1,
            maxImagesPerListing: 5,
            featuredListingAllowance: 2,
          },
          featureFlags: {
            priorityInSearch: true,
            advancedAnalytics: false,
            dedicatedSupport: true,
            allowCustomBranding: false,
            allowGroupCreation: false,
          },
        }),
      },
      {
        name: 'Professional',
        monthlyPrice: 100,
        annualPrice: 1000,
        configuration: JSON.stringify({
          quotas: {
            maxListings: -1,
            allowProductListing: true,
            allowServiceListing: true,
            maxProducts: -1,
            maxServices: -1,
            maxGiftCardTemplates: -1,
            maxCouponTemplates: -1,
            maxLoyaltyPrograms: -1,
            maxImagesPerListing: 10,
            featuredListingAllowance: 10,
          },
          featureFlags: {
            priorityInSearch: true,
            advancedAnalytics: true,
            dedicatedSupport: true,
            allowCustomBranding: true,
            allowGroupCreation: true,
          },
        }),
      },
    ];

    for (const tier of tiers) {
      await queryRunner.query(
        `INSERT INTO "tiers" ("name", "monthlyPrice", "annualPrice", "configuration") VALUES ('${tier.name}', ${tier.monthlyPrice}, ${tier.annualPrice}, '${tier.configuration}') ON CONFLICT ("name") DO NOTHING`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "memberships" DROP CONSTRAINT "FK_tier_membership"`,
    );
    await queryRunner.query(`ALTER TABLE "memberships" DROP COLUMN "planType"`);
    await queryRunner.query(`ALTER TABLE "memberships" DROP COLUMN "isTrial"`);
    await queryRunner.query(`ALTER TABLE "memberships" DROP COLUMN "tier_id"`);
    await queryRunner.query(`DROP TABLE "tiers"`);
  }
}
