import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 3 follow-up: backfill historical attributed sales for wallets issued
 * before `salesAttributed` existed.
 *
 * `salesAttributed` is the sum of prior spend transactions for the wallet.
 * The `down` is intentionally a no-op: resetting live attribution would
 * destroy data that has since been accumulated.
 */
export class BackfillSalesAttributed1799000000014
  implements MigrationInterface
{
  name = 'BackfillSalesAttributed1799000000014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "user_money_vouchers" uv
      SET "salesAttributed" = COALESCE((
        SELECT SUM(ABS(tx."amount"))
        FROM "money_voucher_transactions" tx
        WHERE tx."voucherId" = uv."id"
          AND tx."sourceType" = 'spend'
      ), 0)
      WHERE uv."salesAttributed" = 0;
    `);
  }

  public async down(): Promise<void> {
    // No-op: attribution is historical data, not a reversible schema change.
  }
}
