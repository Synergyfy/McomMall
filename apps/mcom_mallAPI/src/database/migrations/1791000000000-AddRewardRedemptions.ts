import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MCOM Rewards redemption support at checkout.
 *
 * Purely additive:
 *  - `orders.rewardDiscountApplied` — total reward discount on the order.
 *  - `order_item_rewards` — one row per applied reward-issuance/line, with a
 *    RESERVED → COMMITTED | RELEASED lifecycle.
 *  - `reward_redemption_outbox` — durable retry queue for reward lifecycle
 *    calls that fail after the order committed.
 *
 * Re-runnable via IF NOT EXISTS / duplicate_object guards.
 */
export class AddRewardRedemptions1791000000000 implements MigrationInterface {
  name = 'AddRewardRedemptions1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Order total column
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "rewardDiscountApplied" numeric(10,2) NOT NULL DEFAULT '0'`,
    );

    // 2. order_item_rewards enums
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."order_item_rewards_status_enum" AS ENUM('RESERVED', 'COMMITTED', 'RELEASED'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."order_item_rewards_targettype_enum" AS ENUM('PRODUCT', 'SERVICE'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );

    // 3. order_item_rewards table
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "order_item_rewards" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "orderId" uuid NOT NULL,
        "orderItemId" uuid,
        "rewardIssuanceId" character varying NOT NULL,
        "issuerClientId" character varying,
        "rewardType" character varying,
        "targetType" "public"."order_item_rewards_targettype_enum" NOT NULL DEFAULT 'PRODUCT',
        "targetId" character varying NOT NULL,
        "discountAmount" numeric(10,2) NOT NULL,
        "status" "public"."order_item_rewards_status_enum" NOT NULL DEFAULT 'RESERVED',
        "reservationRef" character varying,
        "committedAt" TIMESTAMP,
        "releasedAt" TIMESTAMP,
        "metadata" jsonb,
        CONSTRAINT "PK_order_item_rewards" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_order_item_reward_order" ON "order_item_rewards" ("orderId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_order_item_reward_issuance" ON "order_item_rewards" ("rewardIssuanceId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_order_item_reward_order_issuance" ON "order_item_rewards" ("orderId", "rewardIssuanceId")`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "order_item_rewards" ADD CONSTRAINT "FK_order_item_reward_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "order_item_rewards" ADD CONSTRAINT "FK_order_item_reward_orderItem" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );

    // 4. reward_redemption_outbox enums
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."reward_redemption_outbox_operation_enum" AS ENUM('COMMIT', 'RELEASE'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."reward_redemption_outbox_status_enum" AS ENUM('pending', 'completed', 'failed'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );

    // 5. reward_redemption_outbox table
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "reward_redemption_outbox" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "rewardIssuanceId" character varying NOT NULL,
        "orderId" character varying,
        "reservationRef" character varying,
        "operation" "public"."reward_redemption_outbox_operation_enum" NOT NULL,
        "idempotencyKey" character varying NOT NULL,
        "failureReason" text,
        "attempts" integer NOT NULL DEFAULT '0',
        "status" "public"."reward_redemption_outbox_status_enum" NOT NULL DEFAULT 'pending',
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reward_redemption_outbox" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reward_outbox_status" ON "reward_redemption_outbox" ("status")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_reward_outbox_idempotency" ON "reward_redemption_outbox" ("idempotencyKey")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "reward_redemption_outbox"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."reward_redemption_outbox_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."reward_redemption_outbox_operation_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "order_item_rewards" DROP CONSTRAINT IF EXISTS "FK_order_item_reward_orderItem"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_rewards" DROP CONSTRAINT IF EXISTS "FK_order_item_reward_order"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "order_item_rewards"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."order_item_rewards_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."order_item_rewards_targettype_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN IF EXISTS "rewardDiscountApplied"`,
    );
  }
}
