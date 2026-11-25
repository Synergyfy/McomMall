import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Track which partnerships / partnership requests were suspended solely because
 * a Central account was deleted. A later Central admin restore can then put the
 * exact same rows back without guessing (or disturbing rows that were already
 * inactive/declined before the deletion).
 */
export class AddCentralAccountRestoreMarkers1800000000021
  implements MigrationInterface
{
  name = 'AddCentralAccountRestoreMarkers1800000000021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "partnerships" ADD COLUMN IF NOT EXISTS "centralSuspendedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" ADD COLUMN IF NOT EXISTS "centralSuspendedForUserId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnerships" ADD COLUMN IF NOT EXISTS "centralSuspendedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnerships" ADD COLUMN IF NOT EXISTS "centralSuspendedForUserId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" ADD COLUMN IF NOT EXISTS "centralDeclinedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" ADD COLUMN IF NOT EXISTS "centralDeclinedForUserId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnership_requests" ADD COLUMN IF NOT EXISTS "centralDeclinedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnership_requests" ADD COLUMN IF NOT EXISTS "centralDeclinedForUserId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_partnership_requests" DROP COLUMN IF EXISTS "centralDeclinedForUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnership_requests" DROP COLUMN IF EXISTS "centralDeclinedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" DROP COLUMN IF EXISTS "centralDeclinedForUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_partnership_requests" DROP COLUMN IF EXISTS "centralDeclinedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnerships" DROP COLUMN IF EXISTS "centralSuspendedForUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_partnerships" DROP COLUMN IF EXISTS "centralSuspendedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP COLUMN IF EXISTS "centralSuspendedForUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partnerships" DROP COLUMN IF EXISTS "centralSuspendedAt"`,
    );
  }
}
