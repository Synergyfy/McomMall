import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Tracks whether a merchant has explicitly saved loyalty earning rules.
 * The public Loyalty & Rewards tab is only shown once rules are configured.
 */
export class AddLoyaltyEarningConfiguredFlag1799000000006
  implements MigrationInterface
{
  name = 'AddLoyaltyEarningConfiguredFlag1799000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "loyalty_earning_configs"
      ADD COLUMN IF NOT EXISTS "isConfigured" boolean NOT NULL DEFAULT false;
    `);
    // Treat existing non-default configurations as intentionally configured.
    await queryRunner.query(`
      UPDATE "loyalty_earning_configs"
      SET "isConfigured" = true
      WHERE "earnOnServices" = true
        OR "pointsPerCurrency" <> 1
        OR "fixedPointsPerOrder" <> 0
        OR "minSpend" IS NOT NULL
        OR jsonb_array_length("includedProductIds") > 0
        OR jsonb_array_length("excludedProductIds") > 0
        OR jsonb_array_length("includedServiceIds") > 0
        OR jsonb_array_length("excludedServiceIds") > 0
        OR "productPointOverrides" <> '{}'::jsonb
        OR "servicePointOverrides" <> '{}'::jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "loyalty_earning_configs"
      DROP COLUMN IF EXISTS "isConfigured";
    `);
  }
}
