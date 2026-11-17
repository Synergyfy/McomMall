import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSavedPromotions1798000000003 implements MigrationInterface {
  name = 'CreateSavedPromotions1798000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "saved_promotions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "userId" uuid NOT NULL,
        "promotionId" uuid NOT NULL,
        CONSTRAINT "PK_saved_promotions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_saved_promotions_user_promotion" ON "saved_promotions" ("userId", "promotionId")`,
    );
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_saved_promotions_user') THEN
          ALTER TABLE "saved_promotions"
            ADD CONSTRAINT "FK_saved_promotions_user"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_saved_promotions_promotion') THEN
          ALTER TABLE "saved_promotions"
            ADD CONSTRAINT "FK_saved_promotions_promotion"
            FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "saved_promotions"`);
  }
}
