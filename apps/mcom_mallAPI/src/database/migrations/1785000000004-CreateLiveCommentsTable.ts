import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLiveCommentsTable1785000000004 implements MigrationInterface {
  name = 'CreateLiveCommentsTable1785000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasLiveComments = await queryRunner.hasTable('live_comments');
    if (!hasLiveComments) {
      await queryRunner.query(
        `CREATE TABLE "live_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "eventId" uuid NOT NULL, "authorName" character varying, "userId" uuid, "text" text NOT NULL, "likes" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_live_comments" PRIMARY KEY ("id"))`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_live_comments_eventId" ON "live_comments" ("eventId")`,
      );
      await queryRunner.query(
        `ALTER TABLE "live_comments" ADD CONSTRAINT "FK_live_comments_eventId" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
      await queryRunner.query(
        `ALTER TABLE "live_comments" ADD CONSTRAINT "FK_live_comments_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('live_comments')) {
      await queryRunner.query(
        `ALTER TABLE "live_comments" DROP CONSTRAINT IF EXISTS "FK_live_comments_userId"`,
      );
      await queryRunner.query(
        `ALTER TABLE "live_comments" DROP CONSTRAINT IF EXISTS "FK_live_comments_eventId"`,
      );
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_live_comments_eventId"`);
      await queryRunner.query(`DROP TABLE IF EXISTS "live_comments"`);
    }
  }
}
