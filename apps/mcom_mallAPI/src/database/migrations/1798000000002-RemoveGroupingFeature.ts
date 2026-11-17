import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The group / circle-money feature has been removed from the product.
 * These tables are no longer referenced by any module.
 */
export class RemoveGroupingFeature1798000000002 implements MigrationInterface {
  name = 'RemoveGroupingFeature1798000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "group_circle_messages" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "group_transactions" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "group_wallets" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "group_members" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "groups" CASCADE`);

    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."group_circle_messages_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."group_members_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."group_members_role_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."groups_payoutfrequency_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."groups_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."groups_type_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the legacy tables so the migration remains reversible.
    await queryRunner.query(
      `CREATE TYPE "public"."groups_type_enum" AS ENUM('MARKETING', 'ADVERTISING', 'NEARBY', 'HYPERLOCAL', 'NATIONAL', 'GLOBAL', 'SMART_MONEY')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."groups_payoutfrequency_enum" AS ENUM('WEEKLY', 'MONTHLY')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."groups_status_enum" AS ENUM('RECRUITING', 'ACTIVE', 'INACTIVE', 'COMPLETED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."group_members_status_enum" AS ENUM('PENDING_PAYMENT', 'ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."group_members_role_enum" AS ENUM('OWNER', 'ADMIN', 'MEMBER', 'BANKER', 'GUEST', 'PERIPHERAL', 'CORE', 'PARTNER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."group_circle_messages_type_enum" AS ENUM('GROUP', 'DIRECT')`,
    );

    await queryRunner.query(`
      CREATE TABLE "groups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying NOT NULL,
        "type" "public"."groups_type_enum" NOT NULL DEFAULT 'MARKETING',
        "duration" character varying,
        "contributionAmount" numeric(10,2) NOT NULL DEFAULT '0',
        "payoutFrequency" "public"."groups_payoutfrequency_enum" NOT NULL DEFAULT 'MONTHLY',
        "currentRound" integer NOT NULL DEFAULT 1,
        "startDate" TIMESTAMP,
        "localArea" character varying,
        "size" integer NOT NULL DEFAULT 6,
        "recruitmentDeadline" TIMESTAMP,
        "pitchUrl" character varying,
        "status" "public"."groups_status_enum" NOT NULL DEFAULT 'RECRUITING',
        "founderId" uuid NOT NULL,
        CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "group_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "userId" uuid NOT NULL,
        "groupId" uuid NOT NULL,
        "status" "public"."group_members_status_enum" NOT NULL DEFAULT 'PENDING_PAYMENT',
        "role" "public"."group_members_role_enum" NOT NULL DEFAULT 'MEMBER',
        "drawDate" TIMESTAMP,
        CONSTRAINT "PK_86446139b2c96bfd0f3b8638852" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "group_wallets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "balance" numeric(10,2) NOT NULL DEFAULT '0',
        "groupId" uuid,
        CONSTRAINT "PK_ca0cdcf96579c32997696a07c09" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "group_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "amount" numeric(10,2) NOT NULL,
        "userId" uuid NOT NULL,
        "groupId" uuid NOT NULL,
        "groupWalletId" uuid NOT NULL,
        CONSTRAINT "PK_11870298f3bf7ba26a70618ca8c" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "group_circle_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "content" text NOT NULL,
        "type" "public"."group_circle_messages_type_enum" NOT NULL DEFAULT 'GROUP',
        "senderId" uuid NOT NULL,
        "recipientId" uuid,
        "groupId" uuid NOT NULL,
        CONSTRAINT "PK_893f7c48be7556bb1238db13c9c" PRIMARY KEY ("id")
      )
    `);
  }
}
