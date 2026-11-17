import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCatalogAdminDisabled1798000000004
  implements MigrationInterface
{
  name = 'AddCatalogAdminDisabled1798000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS "adminDisabled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "adminDisabled" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Products" DROP COLUMN IF EXISTS "adminDisabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN IF EXISTS "adminDisabled"`,
    );
  }
}
