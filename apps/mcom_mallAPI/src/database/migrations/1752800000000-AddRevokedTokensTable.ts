import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRevokedTokensTable1752800000000 implements MigrationInterface {
  name = 'AddRevokedTokensTable1752800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "revoked_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "jti" character varying NOT NULL,
        "tokenType" character varying NOT NULL DEFAULT 'access',
        "expiresAt" TIMESTAMP NOT NULL,
        CONSTRAINT "PK_revoked_tokens" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_revoked_tokens_jti" ON "revoked_tokens" ("jti")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "revoked_tokens"`);
  }
}
