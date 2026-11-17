import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Time bonuses are offers with isTimeBonus = true and per-customer activation
 * records in time_bonus_enrollments.
 */
export class AddTimeBonusActivation1799000000007 implements MigrationInterface {
  name = 'AddTimeBonusActivation1799000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "offers"
      ADD COLUMN IF NOT EXISTS "isTimeBonus" boolean NOT NULL DEFAULT false;
    `);
    // Backfill existing bonus-point offers created via the Time Bonus flow.
    await queryRunner.query(`
      UPDATE "offers"
      SET "isTimeBonus" = true
      WHERE "rewardCouponType" = 'BONUS_POINTS' AND "points" = 0;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "time_bonus_enrollments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "offerId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "claims" integer NOT NULL DEFAULT 0,
        "lastClaimedAt" TIMESTAMP,
        CONSTRAINT "PK_time_bonus_enrollments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_time_bonus_enrollments_offer" FOREIGN KEY ("offerId")
          REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_time_bonus_enrollments_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_time_bonus_enrollments_offer_user"
      ON "time_bonus_enrollments" ("offerId", "userId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_time_bonus_enrollments_offer_user";
    `);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "time_bonus_enrollments" CASCADE;`,
    );
    await queryRunner.query(`
      ALTER TABLE "offers" DROP COLUMN IF EXISTS "isTimeBonus";
    `);
  }
}
