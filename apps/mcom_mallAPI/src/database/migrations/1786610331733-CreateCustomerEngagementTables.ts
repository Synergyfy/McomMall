import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerEngagementTables1786610331733 implements MigrationInterface {
  name = 'CreateCustomerEngagementTables1786610331733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."withdrawals_status_enum" AS ENUM('pending', 'approved', 'rejected', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "withdrawals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "status" "public"."withdrawals_status_enum" NOT NULL DEFAULT 'pending', "paymentMethod" character varying(255) NOT NULL, "accountDetails" text, "processedAt" TIMESTAMP, "note" text, CONSTRAINT "PK_9871ec481baa7755f8bd8b7c7e9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_79a3949e02a4652fb2b2a0ccd4" ON "withdrawals" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "quiz_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "question" text NOT NULL, "options" text NOT NULL, "correctAnswerIndex" integer NOT NULL, "order" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_ec0447fd30d9f5c182e7653bfd3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_38abb6015a8a2da02044ed9bd4" ON "quiz_questions" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE TABLE "quiz_attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" uuid, "score" integer NOT NULL, "total" integer NOT NULL, "answers" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_a84a93fb092359516dc5b325b90" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff7b1d71fabdc7e1f4aff55285" ON "quiz_attempts" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."membership_credits_type_enum" AS ENUM('promotion', 'campaign', 'onboarding', 'referral', 'service')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."membership_credits_status_enum" AS ENUM('available', 'redeemed', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "membership_credits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" uuid NOT NULL, "businessId" character varying, "type" "public"."membership_credits_type_enum" NOT NULL, "amount" numeric(10,2) NOT NULL, "title" character varying(255) NOT NULL, "status" "public"."membership_credits_status_enum" NOT NULL DEFAULT 'available', "expiryDate" TIMESTAMP, "redeemedAt" TIMESTAMP, "note" text, CONSTRAINT "PK_a693bcf697783d79d704a95a3b7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b2601a2ec20f1dcd38438c793c" ON "membership_credits" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."flash_sale_items_status_enum" AS ENUM('draft', 'active', 'ended')`,
    );
    await queryRunner.query(
      `CREATE TABLE "flash_sale_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying(255) NOT NULL, "description" text, "category" character varying(255) NOT NULL, "image" character varying, "price" numeric(10,2) NOT NULL, "discountedPrice" numeric(10,2), "itemsLeft" integer NOT NULL DEFAULT '0', "endDate" TIMESTAMP NOT NULL, "startDate" TIMESTAMP, "status" "public"."flash_sale_items_status_enum" NOT NULL DEFAULT 'draft', "businessId" character varying, "productId" character varying, CONSTRAINT "PK_f7be2cbf28d0924336b0d91369a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_451fd84dd3d22bafda3730c3cd" ON "flash_sale_items" ("endDate") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."scratch_card_ledger_prizetype_enum" AS ENUM('points', 'voucher', 'reward', 'none')`,
    );
    await queryRunner.query(
      `CREATE TABLE "scratch_card_ledger" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" uuid NOT NULL, "scratchDate" date NOT NULL, "prizeType" "public"."scratch_card_ledger_prizetype_enum" NOT NULL, "prizeValue" integer, "prizeLabel" character varying, CONSTRAINT "UQ_c34f3385202811931ec3c7c74c7" UNIQUE ("userId", "scratchDate"), CONSTRAINT "PK_2b42a76d265b988fee08e0e523c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8ed43e00acefe8a869909f00f2" ON "scratch_card_ledger" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rewards_rewardtype_enum" AS ENUM('coupon', 'voucher', 'qr', 'event', 'gift', 'loyalty', 'gamification', 'code')`,
    );
    await queryRunner.query(
      `CREATE TABLE "rewards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying(255) NOT NULL, "brand" character varying(255) NOT NULL, "category" character varying(255) NOT NULL, "cost" integer NOT NULL, "description" text, "longDescription" text, "image" character varying, "badgeIcon" character varying(100), "rewardType" "public"."rewards_rewardtype_enum" NOT NULL DEFAULT 'coupon', "usageCondition" text, "code" character varying, "isHot" boolean NOT NULL DEFAULT false, "isLocked" boolean NOT NULL DEFAULT false, "pointsRequired" integer, "tier" character varying, "benefits" jsonb, "isOptedIn" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "expiresAt" TIMESTAMP, CONSTRAINT "PK_3d947441a48debeb9b7366f8b8c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f3e29b54afd648c4a506715308" ON "rewards" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reward_redemptions_status_enum" AS ENUM('claimed', 'redeemed', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reward_redemptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" uuid NOT NULL, "rewardId" uuid NOT NULL, "pointsSpent" integer NOT NULL, "status" "public"."reward_redemptions_status_enum" NOT NULL DEFAULT 'claimed', "redeemedAt" TIMESTAMP, "issuedCode" character varying, CONSTRAINT "UQ_5a8e1d938e9b2c2003ccb791dfc" UNIQUE ("userId", "rewardId"), CONSTRAINT "PK_e02d178fa8c54295d8edc8781b3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5490172918e20aa466c63c9ac1" ON "reward_redemptions" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."event_rsvps_status_enum" AS ENUM('confirmed', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "event_rsvps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" uuid NOT NULL, "eventId" uuid NOT NULL, "status" "public"."event_rsvps_status_enum" NOT NULL DEFAULT 'confirmed', "attendedAt" TIMESTAMP, CONSTRAINT "UQ_93c8aab65f7d87b348353ab0025" UNIQUE ("userId", "eventId"), CONSTRAINT "PK_9b36694202531f62919c0bf5b35" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1f58c8918444363c81f80da603" ON "event_rsvps" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."daily_spin_ledger_prizetype_enum" AS ENUM('points', 'voucher', 'surprise')`,
    );
    await queryRunner.query(
      `CREATE TABLE "daily_spin_ledger" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" uuid NOT NULL, "spinDate" date NOT NULL, "prizeType" "public"."daily_spin_ledger_prizetype_enum" NOT NULL, "prizeValue" integer, "pointsAwarded" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_72b160a8ac8cb8cb9c7457fb410" UNIQUE ("userId", "spinDate"), CONSTRAINT "PK_19c6d28ddaab0aeb916827a8f29" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f0f4e5848ce098287c08eaf0f" ON "daily_spin_ledger" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "challenge_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" uuid NOT NULL, "challengeId" uuid NOT NULL, "progress" numeric(10,2) NOT NULL DEFAULT '0', "isCompleted" boolean NOT NULL DEFAULT false, "completedAt" TIMESTAMP, CONSTRAINT "UQ_b1efd5c6ecdfd3bdb484d90622c" UNIQUE ("challengeId", "userId"), CONSTRAINT "PK_b71ebbd429aca97facc41c3ee9c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_70d396acc6329c8601d157ad96" ON "challenge_progress" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."challenges_challengetype_enum" AS ENUM('shop', 'visit', 'streak', 'custom')`,
    );
    await queryRunner.query(
      `CREATE TABLE "challenges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying(255) NOT NULL, "description" text, "challengeType" "public"."challenges_challengetype_enum" NOT NULL DEFAULT 'custom', "target" numeric(10,2) NOT NULL, "rewardPoints" integer NOT NULL DEFAULT '0', "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_1e664e93171e20fe4d6125466af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9753063480ffc8a79118025c8e" ON "challenges" ("startDate") `,
    );
    await queryRunner.query(
      `ALTER TABLE "withdrawals" ADD CONSTRAINT "FK_79a3949e02a4652fb2b2a0ccd4e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_ff7b1d71fabdc7e1f4aff552859" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership_credits" ADD CONSTRAINT "FK_b2601a2ec20f1dcd38438c793c4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scratch_card_ledger" ADD CONSTRAINT "FK_8ed43e00acefe8a869909f00f2e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_redemptions" ADD CONSTRAINT "FK_5490172918e20aa466c63c9ac12" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_redemptions" ADD CONSTRAINT "FK_7405900a3e5b2843630b0a83cbe" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvps" ADD CONSTRAINT "FK_1f58c8918444363c81f80da6035" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvps" ADD CONSTRAINT "FK_b064b8746996712f592833ca2be" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_spin_ledger" ADD CONSTRAINT "FK_5f0f4e5848ce098287c08eaf0f4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_progress" ADD CONSTRAINT "FK_70d396acc6329c8601d157ad96b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_progress" ADD CONSTRAINT "FK_c4c844c9ef5570982f8f6393c62" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "challenge_progress" DROP CONSTRAINT "FK_c4c844c9ef5570982f8f6393c62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_progress" DROP CONSTRAINT "FK_70d396acc6329c8601d157ad96b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_spin_ledger" DROP CONSTRAINT "FK_5f0f4e5848ce098287c08eaf0f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvps" DROP CONSTRAINT "FK_b064b8746996712f592833ca2be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvps" DROP CONSTRAINT "FK_1f58c8918444363c81f80da6035"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_redemptions" DROP CONSTRAINT "FK_7405900a3e5b2843630b0a83cbe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_redemptions" DROP CONSTRAINT "FK_5490172918e20aa466c63c9ac12"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scratch_card_ledger" DROP CONSTRAINT "FK_8ed43e00acefe8a869909f00f2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership_credits" DROP CONSTRAINT "FK_b2601a2ec20f1dcd38438c793c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_ff7b1d71fabdc7e1f4aff552859"`,
    );
    await queryRunner.query(
      `ALTER TABLE "withdrawals" DROP CONSTRAINT "FK_79a3949e02a4652fb2b2a0ccd4e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9753063480ffc8a79118025c8e"`,
    );
    await queryRunner.query(`DROP TABLE "challenges"`);
    await queryRunner.query(
      `DROP TYPE "public"."challenges_challengetype_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_70d396acc6329c8601d157ad96"`,
    );
    await queryRunner.query(`DROP TABLE "challenge_progress"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5f0f4e5848ce098287c08eaf0f"`,
    );
    await queryRunner.query(`DROP TABLE "daily_spin_ledger"`);
    await queryRunner.query(
      `DROP TYPE "public"."daily_spin_ledger_prizetype_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1f58c8918444363c81f80da603"`,
    );
    await queryRunner.query(`DROP TABLE "event_rsvps"`);
    await queryRunner.query(`DROP TYPE "public"."event_rsvps_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5490172918e20aa466c63c9ac1"`,
    );
    await queryRunner.query(`DROP TABLE "reward_redemptions"`);
    await queryRunner.query(
      `DROP TYPE "public"."reward_redemptions_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f3e29b54afd648c4a506715308"`,
    );
    await queryRunner.query(`DROP TABLE "rewards"`);
    await queryRunner.query(`DROP TYPE "public"."rewards_rewardtype_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8ed43e00acefe8a869909f00f2"`,
    );
    await queryRunner.query(`DROP TABLE "scratch_card_ledger"`);
    await queryRunner.query(
      `DROP TYPE "public"."scratch_card_ledger_prizetype_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_451fd84dd3d22bafda3730c3cd"`,
    );
    await queryRunner.query(`DROP TABLE "flash_sale_items"`);
    await queryRunner.query(
      `DROP TYPE "public"."flash_sale_items_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b2601a2ec20f1dcd38438c793c"`,
    );
    await queryRunner.query(`DROP TABLE "membership_credits"`);
    await queryRunner.query(
      `DROP TYPE "public"."membership_credits_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."membership_credits_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff7b1d71fabdc7e1f4aff55285"`,
    );
    await queryRunner.query(`DROP TABLE "quiz_attempts"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_38abb6015a8a2da02044ed9bd4"`,
    );
    await queryRunner.query(`DROP TABLE "quiz_questions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_79a3949e02a4652fb2b2a0ccd4"`,
    );
    await queryRunner.query(`DROP TABLE "withdrawals"`);
    await queryRunner.query(`DROP TYPE "public"."withdrawals_status_enum"`);
  }
}
