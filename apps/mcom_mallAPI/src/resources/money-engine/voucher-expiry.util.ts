import { VoucherState } from './entities/user-voucher.entity';

/** Anything with a `query` method: DataSource, EntityManager, or a test double. */
export interface VoucherExpiryRunner {
  query(sql: string, parameters?: any[]): Promise<any>;
}

export const VOUCHER_EXPIRY_BATCH_SIZE = 500;

/**
 * Flip every due `active` wallet to `expired`.
 *
 * The sweep is deliberately:
 * - **Batched**, so a backlog (e.g. after downtime) never holds one long lock.
 * - **Skip-locked**, so multiple API instances can sweep concurrently without
 *   stampeding each other or double-processing a row.
 * - **Indexed** on `(state, expires_at)` via
 *   `1799900000000-AddUserVoucherExpiryIndex`.
 *
 * Returns the number of wallets that transitioned.
 */
export async function expireDueVouchers(
  runner: VoucherExpiryRunner,
  now: Date = new Date(),
  batchSize: number = VOUCHER_EXPIRY_BATCH_SIZE,
): Promise<number> {
  let total = 0;

  for (;;) {
    // Enum literals are constants, not user input, so they can be inlined
    // safely. Parameterising them would require an explicit enum cast.
    const rows: Array<{ id: string }> = await runner.query(
      `
        UPDATE "user_money_vouchers" AS voucher
           SET "state" = '${VoucherState.EXPIRED}',
               "updated_at" = NOW()
         WHERE voucher."id" IN (
           SELECT "id"
             FROM "user_money_vouchers"
            WHERE "state" = '${VoucherState.ACTIVE}'
              AND "deleted_at" IS NULL
              AND "expires_at" IS NOT NULL
              AND "expires_at" <= $1
            ORDER BY "expires_at" ASC
            LIMIT $2::int
              FOR UPDATE SKIP LOCKED
         )
         RETURNING voucher."id"
      `,
      [now, batchSize],
    );

    const count = Array.isArray(rows) ? rows.length : 0;
    total += count;

    if (count < batchSize) {
      break;
    }
  }

  return total;
}
