import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropOtpsTable1791000000003 implements MigrationInterface {
  name = 'DropOtpsTable1791000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "otps" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "otps_type_enum";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "otps_type_enum" AS ENUM('VERIFICATION', 'PASSWORD_RESET');`,
    );
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "otps" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "otp" character varying NOT NULL,
        "type" "otps_type_enum" NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "email" character varying,
        "user_id" uuid,
        CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"),
        CONSTRAINT "FK_3938bb24b38ad395af30230bded" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }
}
