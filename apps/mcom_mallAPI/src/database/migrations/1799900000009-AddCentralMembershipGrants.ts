import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Keeps a Central Hub Solution (CHS) membership grant separate from the plan
 * the business bought directly from the Mall.
 *
 * A CHS membership may bundle a Mall plan, but it must never replace a direct
 * Mall purchase: the direct plan stays authoritative while it is active, and
 * the CHS grant takes over only when it expires. `memberships.userId` is
 * unique (one direct/trial row per user), so the CHS entitlement needs its own
 * one-row-per-user table.
 */
export class AddCentralMembershipGrants1799900000009 implements MigrationInterface {
  name = 'AddCentralMembershipGrants1799900000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "mcom_central_membership_grants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "central_user_id" character varying NOT NULL,
        "plan_variant_id" uuid,
        "isActive" boolean NOT NULL DEFAULT false,
        "status" character varying NOT NULL DEFAULT 'active',
        "starts_at" TIMESTAMP WITH TIME ZONE,
        "expires_at" TIMESTAMP WITH TIME ZONE,
        "plan_type" character varying NOT NULL DEFAULT 'monthly',
        "membership_plan_name" character varying,
        "package_name" character varying,
        "external_plan_id" character varying,
        "last_event_id" character varying,
        "last_synced_at" TIMESTAMP WITH TIME ZONE,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_mcom_central_membership_grants" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_mcom_central_membership_grants_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_mcom_central_membership_grants_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_mcom_central_membership_grants_variant"
          FOREIGN KEY ("plan_variant_id") REFERENCES "plan_variants"("id")
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mcom_central_membership_grants_active"
         ON "mcom_central_membership_grants" ("isActive", "expires_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mcom_central_membership_grants_central_user"
         ON "mcom_central_membership_grants" ("central_user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mcom_central_membership_grants_variant"
         ON "mcom_central_membership_grants" ("plan_variant_id")`,
    );

    // Preserve Central grants applied before this table existed so a later
    // direct purchase can fall back to them instead of losing the CHS plan.
    await queryRunner.query(`
      INSERT INTO "mcom_central_membership_grants" (
        "id", "user_id", "central_user_id", "plan_variant_id", "isActive",
        "status", "starts_at", "expires_at", "plan_type", "last_synced_at",
        "metadata"
      )
      SELECT
        uuid_generate_v4(),
        m."userId",
        u."centralUserId",
        m."plan_variant_id",
        m."isActive",
        m."renewalStatus",
        m."startDate",
        m."expiresAt",
        m."planType"::text,
        now(),
        jsonb_build_object('backfilledFromMembership', m."id")
      FROM "memberships" m
      JOIN "users" u ON u."id" = m."userId"
      WHERE m."renewalMethod" = 'central_membership'
        AND u."centralUserId" IS NOT NULL
      ON CONFLICT ("user_id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_mcom_central_membership_grants_variant"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_mcom_central_membership_grants_central_user"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_mcom_central_membership_grants_active"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "mcom_central_membership_grants"`,
    );
  }
}
