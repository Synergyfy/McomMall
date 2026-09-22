import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLoyaltyTables1785000000002 implements MigrationInterface {
  name = 'CreateLoyaltyTables1785000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loyalty_rules_ruletype_enum') THEN
          CREATE TYPE "public"."loyalty_rules_ruletype_enum" AS ENUM('percentage_of_spend', 'fixed_per_booking', 'bonus_multiplier', 'welcome_bonus');
        END IF;
      END $$;`,
    );

    const hasRules = await queryRunner.hasTable('loyalty_rules');
    if (!hasRules) {
      await queryRunner.query(
        `CREATE TABLE "loyalty_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" text, "ruleType" "public"."loyalty_rules_ruletype_enum" NOT NULL, "pointsPerCurrency" integer, "fixedPoints" integer, "multiplier" integer, "appliesTo" character varying, "isActive" boolean NOT NULL DEFAULT true, "businessId" uuid NOT NULL, CONSTRAINT "PK_loyalty_rules" PRIMARY KEY ("id"))`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_loyalty_rules_businessId" ON "loyalty_rules" ("businessId")`,
      );
      await queryRunner.query(
        `ALTER TABLE "loyalty_rules" ADD CONSTRAINT "FK_loyalty_rules_businessId" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }

    const hasSettings = await queryRunner.hasTable('loyalty_settings');
    if (!hasSettings) {
      await queryRunner.query(
        `CREATE TABLE "loyalty_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "isEnabled" boolean NOT NULL DEFAULT true, "pointsPerCurrency" integer, "pointsMultiplier" integer, "signupBonusPoints" integer, "redemptionApproval" character varying NOT NULL DEFAULT 'auto', "terms" text, "businessId" uuid NOT NULL, CONSTRAINT "PK_loyalty_settings" PRIMARY KEY ("id"))`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_loyalty_settings_businessId" ON "loyalty_settings" ("businessId")`,
      );
      await queryRunner.query(
        `ALTER TABLE "loyalty_settings" ADD CONSTRAINT "FK_loyalty_settings_businessId" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('loyalty_settings')) {
      await queryRunner.query(
        `ALTER TABLE "loyalty_settings" DROP CONSTRAINT IF EXISTS "FK_loyalty_settings_businessId"`,
      );
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_loyalty_settings_businessId"`);
      await queryRunner.query(`DROP TABLE IF EXISTS "loyalty_settings"`);
    }
    if (await queryRunner.hasTable('loyalty_rules')) {
      await queryRunner.query(
        `ALTER TABLE "loyalty_rules" DROP CONSTRAINT IF EXISTS "FK_loyalty_rules_businessId"`,
      );
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_loyalty_rules_businessId"`);
      await queryRunner.query(`DROP TABLE IF EXISTS "loyalty_rules"`);
    }
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."loyalty_rules_ruletype_enum"`);
  }
}
