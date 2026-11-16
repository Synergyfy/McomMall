import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviewOwnerReply1798000000001 implements MigrationInterface {
  name = 'AddReviewOwnerReply1798000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "owner_reply" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "owner_replied_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN IF EXISTS "owner_replied_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN IF EXISTS "owner_reply"`,
    );
  }
}
