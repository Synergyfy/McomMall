import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Central can soft-delete a profile. We never delete local data: we mark the
 * account as deleted and archive its listings so marketplace/public queries
 * stop returning them. A later `profile.updated` (Central restore) clears the
 * marker and restores the previous listing status.
 */
export class AddCentralAccountDeletion1800000000020
  implements MigrationInterface
{
  name = 'AddCentralAccountDeletion1800000000020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "centralDeletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "centralDeletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "centralDeletedStatus" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_users_centralDeletedAt" ON "users" ("centralDeletedAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_businesses_centralDeletedAt" ON "businesses" ("centralDeletedAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_businesses_centralDeletedAt"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_users_centralDeletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" DROP COLUMN IF EXISTS "centralDeletedStatus"`,
    );
    await queryRunner.query(
      `ALTER TABLE "businesses" DROP COLUMN IF EXISTS "centralDeletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "centralDeletedAt"`,
    );
  }
}
