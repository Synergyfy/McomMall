import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductVariants1769505188343 implements MigrationInterface {
  name = 'AddProductVariants1769505188343';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Products" ADD "attributes" jsonb`);
    await queryRunner.query(`ALTER TABLE "Products" ADD "variations" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Products" DROP COLUMN "variations"`);
    await queryRunner.query(`ALTER TABLE "Products" DROP COLUMN "attributes"`);
  }
}
