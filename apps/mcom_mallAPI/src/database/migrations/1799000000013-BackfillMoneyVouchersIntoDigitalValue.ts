import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 4c of COUPON_VOUCHER_ALIGNMENT_PLAN.md: mirror existing money-engine
 * wallets into `digital_value_master` so the digital-value ledger is the
 * canonical balance view.
 *
 * The domain table stays the write source of truth; this backfill only fills
 * the gap for wallets issued before mirroring existed.
 */
export class BackfillMoneyVouchersIntoDigitalValue1799000000013
  implements MigrationInterface
{
  name = 'BackfillMoneyVouchersIntoDigitalValue1799000000013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "digital_value_master" (
        "type", "code", "owner_id", "initial_value", "current_balance",
        "status", "metadata"
      )
      SELECT
        'voucher'::digital_value_master_type_enum,
        uv."code",
        uv."ownerId",
        (uv."realBalance" + uv."rewardBalance"),
        (uv."realBalance" + uv."rewardBalance"),
        CASE
          WHEN uv."state" = 'active' THEN 'active'::digital_value_master_status_enum
          WHEN uv."state" = 'depleted' THEN 'fully_redeemed'::digital_value_master_status_enum
          ELSE 'expired'::digital_value_master_status_enum
        END,
        jsonb_build_object(
          'source', 'money_engine',
          'userVoucherId', uv."id"
        )
      FROM "user_money_vouchers" uv
      WHERE uv."ownerId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM "digital_value_master" dv
          WHERE dv."code" = uv."code"
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "digital_value_master"
      WHERE "metadata" ->> 'source' = 'money_engine';
    `);
  }
}
