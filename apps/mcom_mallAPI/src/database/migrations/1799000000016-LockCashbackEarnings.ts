import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cashback is simulated spending power, not withdrawable cash. Terminal
 * cashback is tracked separately so `requestWithdrawal` can exclude it while
 * keeping the existing `earningsBalance` reporting intact.
 */
export class LockCashbackEarnings1799000000016
  implements MigrationInterface
{
  name = 'LockCashbackEarnings1799000000016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wallets"
        ADD COLUMN IF NOT EXISTS "locked_cashback_balance" bigint NOT NULL DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wallets"
        DROP COLUMN IF EXISTS "locked_cashback_balance";
    `);
  }
}
