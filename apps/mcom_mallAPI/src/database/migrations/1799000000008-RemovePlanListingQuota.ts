import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * A business gets exactly one listing from MCOM Central Hub, so the
 * per-plan listing quota is no longer configurable or enforced.
 */
export class RemovePlanListingQuota1799000000008 implements MigrationInterface {
  name = 'RemovePlanListingQuota1799000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "plan_variants"
      SET "configuration" = jsonb_set(
        "configuration",
        '{quotas}',
        ("configuration"->'quotas') - 'maxListings',
        false
      )
      WHERE "configuration" ? 'quotas';
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.tiers') IS NOT NULL THEN
          UPDATE "tiers"
          SET "configuration" = jsonb_set(
            "configuration",
            '{quotas}',
            ("configuration"->'quotas') - 'maxListings',
            false
          )
          WHERE "configuration" ? 'quotas';
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "plan_variants"
      SET "configuration" = jsonb_set(
        "configuration",
        '{quotas}',
        ("configuration"->'quotas') || '{"maxListings": -1}'::jsonb,
        false
      )
      WHERE "configuration" ? 'quotas';
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.tiers') IS NOT NULL THEN
          UPDATE "tiers"
          SET "configuration" = jsonb_set(
            "configuration",
            '{quotas}',
            ("configuration"->'quotas') || '{"maxListings": -1}'::jsonb,
            false
          )
          WHERE "configuration" ? 'quotas';
        END IF;
      END $$;
    `);
  }
}
