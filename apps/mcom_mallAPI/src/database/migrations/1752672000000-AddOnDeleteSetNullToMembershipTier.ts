import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnDeleteSetNullToMembershipTier1752672000000 implements MigrationInterface {
  name = 'AddOnDeleteSetNullToMembershipTier1752672000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "memberships"
      DROP CONSTRAINT "FK_37fe23a8905d80cdc77ece23fda"
    `);
    await queryRunner.query(`
      ALTER TABLE "memberships"
      ADD CONSTRAINT "FK_37fe23a8905d80cdc77ece23fda"
      FOREIGN KEY ("tier_id") REFERENCES "tiers"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "memberships"
      DROP CONSTRAINT "FK_37fe23a8905d80cdc77ece23fda"
    `);
    await queryRunner.query(`
      ALTER TABLE "memberships"
      ADD CONSTRAINT "FK_37fe23a8905d80cdc77ece23fda"
      FOREIGN KEY ("tier_id") REFERENCES "tiers"("id") ON DELETE RESTRICT
    `);
  }
}
