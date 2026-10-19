import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Local read-model of MCOM Rewards issuances, fed by `reward.*` lifecycle
 * events. Additive and re-runnable.
 */
export class AddRewardIssuanceMirror1791000000002
  implements MigrationInterface
{
  name = 'AddRewardIssuanceMirror1791000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reward_issuance_mirror" (
        "id" character varying NOT NULL,
        "rewardId" character varying,
        "businessRewardId" character varying,
        "rewardTitle" character varying,
        "issuerClientId" character varying,
        "recipientMcomUserId" character varying,
        "recipientEmail" character varying,
        "rewardType" character varying,
        "code" character varying,
        "mallReference" character varying,
        "status" character varying NOT NULL DEFAULT 'ISSUED',
        "value" numeric(12,2) NOT NULL DEFAULT 0,
        "quantity" integer NOT NULL DEFAULT 1,
        "expiresAt" TIMESTAMP,
        "redeemedAt" TIMESTAMP,
        "revokedAt" TIMESTAMP,
        "metadata" jsonb,
        "lastEvent" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reward_issuance_mirror" PRIMARY KEY ("id")
      );
      CREATE INDEX IF NOT EXISTS "IDX_reward_mirror_recipient"
        ON "reward_issuance_mirror" ("recipientMcomUserId");
      CREATE INDEX IF NOT EXISTS "IDX_reward_mirror_status"
        ON "reward_issuance_mirror" ("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "reward_issuance_mirror"`);
  }
}
