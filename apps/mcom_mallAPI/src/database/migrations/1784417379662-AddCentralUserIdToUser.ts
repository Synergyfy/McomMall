import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCentralUserIdToUser1784417379662 implements MigrationInterface {
  name = 'AddCentralUserIdToUser1784417379662';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "centralUserId" varchar`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "centralUserId"`);
  }
}
