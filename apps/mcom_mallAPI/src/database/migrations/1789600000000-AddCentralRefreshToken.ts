import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Stores the MCOM Solutions SSO refresh token (AES-256-GCM encrypted by the
 * API at rest) so the mall can proxy user-scoped Solutions calls — currently
 * embedded wallet card top-ups — without ever holding the user's card data.
 */
export class AddCentralRefreshToken1789600000000 implements MigrationInterface {
  name = 'AddCentralRefreshToken1789600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "centralRefreshToken" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "centralRefreshToken"`,
    );
  }
}
