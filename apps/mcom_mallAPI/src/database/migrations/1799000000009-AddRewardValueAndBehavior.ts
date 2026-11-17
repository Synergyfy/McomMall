import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 1 of COUPON_VOUCHER_ALIGNMENT_PLAN.md: make the reward model honest.
 *
 * - `reward_definitions.faceValue` is the canonical worth (pence in DB).
 * - `reward_definitions.maxCashbackPercent` bounds cumulative cashback.
 * - `user_money_vouchers` snapshots `faceValue`, `functionalType` and the
 *   cumulative `cashbackCredited` so behaviour is known without a join.
 *
 * Additive and nullable so the previous application version keeps working.
 */
export class AddRewardValueAndBehavior1799000000009
  implements MigrationInterface
{
  name = 'AddRewardValueAndBehavior1799000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reward_definitions"
        ADD COLUMN IF NOT EXISTS "faceValue" bigint,
        ADD COLUMN IF NOT EXISTS "maxCashbackPercent" integer NOT NULL DEFAULT 50;
    `);

    await queryRunner.query(`
      ALTER TABLE "user_money_vouchers"
        ADD COLUMN IF NOT EXISTS "faceValue" bigint,
        ADD COLUMN IF NOT EXISTS "cashbackCredited" bigint NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "functionalType" character varying(32);
    `);

    // The admin form used to embed the amount in the name ("Spring £100").
    // Recover it where possible; unparseable names stay null for manual review.
    await queryRunner.query(`
      UPDATE "reward_definitions"
      SET "faceValue" = ROUND(
        (regexp_match("name", '£\\s*([0-9]+(?:\\.[0-9]{1,2})?)'))[1]::numeric * 100
      )::bigint
      WHERE "faceValue" IS NULL
        AND "name" ~ '£\\s*[0-9]';
    `);

    // Snapshot the behaviour and face value onto already-issued wallets.
    await queryRunner.query(`
      UPDATE "user_money_vouchers" uv
      SET "functionalType" = COALESCE(uv."functionalType", rd."functionalType"::text),
          "faceValue" = COALESCE(uv."faceValue", rd."faceValue")
      FROM "reward_definitions" rd
      WHERE uv."definitionId" = rd."id"
        AND (uv."functionalType" IS NULL OR uv."faceValue" IS NULL);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_money_vouchers"
        DROP COLUMN IF EXISTS "functionalType",
        DROP COLUMN IF EXISTS "cashbackCredited",
        DROP COLUMN IF EXISTS "faceValue";
    `);
    await queryRunner.query(`
      ALTER TABLE "reward_definitions"
        DROP COLUMN IF EXISTS "maxCashbackPercent",
        DROP COLUMN IF EXISTS "faceValue";
    `);
  }
}
