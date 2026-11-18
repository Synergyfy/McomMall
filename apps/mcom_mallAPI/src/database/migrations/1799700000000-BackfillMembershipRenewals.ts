import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Backfill the renewal schedule for memberships purchased before recurring
 * billing existed. Only users with a linked central MCOM Wallet are opted in;
 * everyone else stays manual until they enable it.
 */
export class BackfillMembershipRenewals1799700000000
  implements MigrationInterface
{
  name = 'BackfillMembershipRenewals1799700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "memberships" m
      SET
        "autoRenew" = true,
        "renewalStatus" = 'active',
        "nextChargeAt" = m."expiresAt",
        "renewalAmount" = mp."amount",
        "renewalCurrency" = 'GBP',
        "renewalMethod" = 'mcom_wallet',
        "renewalAttempts" = 0
      FROM "membership_payments" mp, "users" u
      WHERE m."paymentId" = mp."id"
        AND m."userId" = u."id"
        AND u."centralUserId" IS NOT NULL
        AND m."nextChargeAt" IS NULL
        AND m."expiresAt" > now();
    `);
  }

  public async down(): Promise<void> {
    // Non-destructive: the schedule is valid for future renewals.
  }
}
