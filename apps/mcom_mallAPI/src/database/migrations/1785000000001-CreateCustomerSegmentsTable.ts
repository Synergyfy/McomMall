import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerSegmentsTable1785000000001 implements MigrationInterface {
  name = 'CreateCustomerSegmentsTable1785000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasSegments = await queryRunner.hasTable('customer_segments');
    if (!hasSegments) {
      await queryRunner.query(
        `CREATE TABLE "customer_segments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" text, "type" character varying NOT NULL DEFAULT 'custom', "businessId" uuid NOT NULL, CONSTRAINT "PK_customer_segments" PRIMARY KEY ("id"))`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_customer_segments_businessId" ON "customer_segments" ("businessId")`,
      );
      await queryRunner.query(
        `ALTER TABLE "customer_segments" ADD CONSTRAINT "FK_customer_segments_businessId" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('customer_segments')) {
      await queryRunner.query(
        `ALTER TABLE "customer_segments" DROP CONSTRAINT IF EXISTS "FK_customer_segments_businessId"`,
      );
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_segments_businessId"`);
      await queryRunner.query(`DROP TABLE IF EXISTS "customer_segments"`);
    }
  }
}
