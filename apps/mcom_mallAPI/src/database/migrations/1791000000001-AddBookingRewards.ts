import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * MCOM Rewards support for service bookings.
 *
 * - `service_bookings.rewardDiscountApplied` — total reward discount on the
 *   booking (customer pays totalAmount - rewardDiscountApplied).
 * - `booking_rewards` — one row per applied reward-issuance, reserved while the
 *   payment session is open and committed once payment verifies.
 *
 * Additive and re-runnable.
 */
export class AddBookingRewards1791000000001 implements MigrationInterface {
  name = "AddBookingRewards1791000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ADD COLUMN IF NOT EXISTS "rewardDiscountApplied" double precision NOT NULL DEFAULT 0`,
    );

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_rewards_status_enum') THEN
          CREATE TYPE "public"."booking_rewards_status_enum" AS ENUM('RESERVED', 'COMMITTED', 'RELEASED');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "booking_rewards" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "bookingId" uuid NOT NULL,
        "rewardIssuanceId" character varying NOT NULL,
        "issuerClientId" character varying,
        "rewardType" character varying,
        "discountAmount" numeric(10,2) NOT NULL,
        "status" "public"."booking_rewards_status_enum" NOT NULL DEFAULT 'RESERVED',
        "reservationRef" character varying,
        "committedAt" TIMESTAMP,
        "releasedAt" TIMESTAMP,
        "metadata" jsonb,
        CONSTRAINT "PK_booking_rewards" PRIMARY KEY ("id"),
        CONSTRAINT "FK_booking_rewards_booking" FOREIGN KEY ("bookingId")
          REFERENCES "service_bookings"("id") ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "IDX_booking_reward_booking" ON "booking_rewards" ("bookingId");
      CREATE INDEX IF NOT EXISTS "IDX_booking_reward_issuance" ON "booking_rewards" ("rewardIssuanceId");
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_booking_reward_booking_issuance"
        ON "booking_rewards" ("bookingId", "rewardIssuanceId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_rewards"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."booking_rewards_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" DROP COLUMN IF EXISTS "rewardDiscountApplied"`,
    );
  }
}
