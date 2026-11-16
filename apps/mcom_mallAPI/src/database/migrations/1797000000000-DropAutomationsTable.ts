import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropAutomationsTable1797000000000 implements MigrationInterface {
  name = 'DropAutomationsTable1797000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "automations" CASCADE;`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "automations_triggertype_enum";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "automations_triggertype_enum" AS ENUM('weekly', 'monthly', 'seasonal', 'borough');`,
    );
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "automations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "businessId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "triggerType" "automations_triggertype_enum" NOT NULL DEFAULT 'weekly',
        "targetRadius" integer NOT NULL DEFAULT '5',
        "customerTiers" jsonb NOT NULL DEFAULT '[]',
        "isActive" boolean NOT NULL DEFAULT true,
        "flowConfig" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_automations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_automations_businessId" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);
  }
}
