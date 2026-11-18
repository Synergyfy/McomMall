import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Recurring billing for MCOM Mall-owned plans.
 *
 * MCOM Pay charges are one-time and Central stores no partner mandate, so
 * recurring renewals debit the central MCOM Wallet. These columns/table hold
 * the schedule, attempt/dunning state and the renewal audit trail.
 */
export class AddMembershipRenewals1799600000000
  implements MigrationInterface
{
  name = 'AddMembershipRenewals1799600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "memberships"
        ADD COLUMN IF NOT EXISTS "autoRenew" boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS "renewalStatus" varchar NOT NULL DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS "nextChargeAt" timestamptz,
        ADD COLUMN IF NOT EXISTS "renewalAttempts" integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "lastRenewalAt" timestamptz,
        ADD COLUMN IF NOT EXISTS "renewalAmount" bigint,
        ADD COLUMN IF NOT EXISTS "renewalCurrency" varchar(3) NOT NULL DEFAULT 'GBP',
        ADD COLUMN IF NOT EXISTS "renewalMethod" varchar NOT NULL DEFAULT 'mcom_wallet';
      CREATE INDEX IF NOT EXISTS "IDX_memberships_next_charge"
        ON "memberships" ("nextChargeAt");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "membership_renewals" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "membershipId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "amount" bigint NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'GBP',
        "status" character varying NOT NULL DEFAULT 'paid',
        "provider" character varying NOT NULL DEFAULT 'mcom_wallet',
        "transactionId" character varying,
        "periodStart" timestamptz NOT NULL,
        "periodEnd" timestamptz,
        "attempt" integer NOT NULL DEFAULT 1,
        "failureReason" text,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_membership_renewals" PRIMARY KEY ("id"),
        CONSTRAINT "FK_membership_renewals_membership"
          FOREIGN KEY ("membershipId") REFERENCES "memberships"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_membership_renewals_user"
          FOREIGN KEY ("userId") REFERENCES "users"("id")
          ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "IDX_membership_renewal_membership"
        ON "membership_renewals" ("membershipId");
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_membership_renewal_period"
        ON "membership_renewals" ("membershipId", "periodStart");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "membership_renewals"`);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_memberships_next_charge";
      ALTER TABLE "memberships"
        DROP COLUMN IF EXISTS "renewalMethod",
        DROP COLUMN IF EXISTS "renewalCurrency",
        DROP COLUMN IF EXISTS "renewalAmount",
        DROP COLUMN IF EXISTS "lastRenewalAt",
        DROP COLUMN IF EXISTS "renewalAttempts",
        DROP COLUMN IF EXISTS "nextChargeAt",
        DROP COLUMN IF EXISTS "renewalStatus",
        DROP COLUMN IF EXISTS "autoRenew";
    `);
  }
}
