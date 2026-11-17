import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the loyalty earning engine: per-business earning configuration,
 * opt-in memberships, and idempotency references on point transactions.
 */
export class AddLoyaltyEarningEngine1799000000005
  implements MigrationInterface
{
  name = 'AddLoyaltyEarningEngine1799000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "loyalty_earning_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "isActive" boolean NOT NULL DEFAULT true,
        "earnOnProducts" boolean NOT NULL DEFAULT true,
        "earnOnServices" boolean NOT NULL DEFAULT false,
        "pointsPerCurrency" integer NOT NULL DEFAULT 1,
        "fixedPointsPerOrder" integer NOT NULL DEFAULT 0,
        "minSpend" bigint,
        "includedProductIds" jsonb NOT NULL DEFAULT '[]',
        "excludedProductIds" jsonb NOT NULL DEFAULT '[]',
        "includedServiceIds" jsonb NOT NULL DEFAULT '[]',
        "excludedServiceIds" jsonb NOT NULL DEFAULT '[]',
        "productPointOverrides" jsonb NOT NULL DEFAULT '{}',
        "servicePointOverrides" jsonb NOT NULL DEFAULT '{}',
        "businessId" uuid NOT NULL,
        CONSTRAINT "PK_loyalty_earning_configs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_loyalty_earning_configs_business" FOREIGN KEY ("businessId")
          REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_loyalty_earning_configs_business"
      ON "loyalty_earning_configs" ("businessId");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "loyalty_memberships" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "businessId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_loyalty_memberships" PRIMARY KEY ("id"),
        CONSTRAINT "FK_loyalty_memberships_business" FOREIGN KEY ("businessId")
          REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_loyalty_memberships_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_loyalty_memberships_business_user"
      ON "loyalty_memberships" ("businessId", "userId");
    `);

    await queryRunner.query(`
      ALTER TABLE "point_transactions"
      ADD COLUMN IF NOT EXISTS "reference_type" character varying(32);
    `);
    await queryRunner.query(`
      ALTER TABLE "point_transactions"
      ADD COLUMN IF NOT EXISTS "reference_id" uuid;
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_point_transactions_reference"
      ON "point_transactions" ("reference_type", "reference_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_point_transactions_reference";
    `);
    await queryRunner.query(`
      ALTER TABLE "point_transactions"
      DROP COLUMN IF EXISTS "reference_id";
    `);
    await queryRunner.query(`
      ALTER TABLE "point_transactions"
      DROP COLUMN IF EXISTS "reference_type";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_loyalty_memberships_business_user";
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "loyalty_memberships" CASCADE;`);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_loyalty_earning_configs_business";
    `);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "loyalty_earning_configs" CASCADE;`,
    );
  }
}
