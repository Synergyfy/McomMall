import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSettingsTables1785000000003 implements MigrationInterface {
  name = 'CreateSettingsTables1785000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasIntegrationSettings = await queryRunner.hasTable('integration_settings');
    if (!hasIntegrationSettings) {
      await queryRunner.query(
        `CREATE TABLE "integration_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "businessId" uuid NOT NULL, "googleConnected" boolean NOT NULL DEFAULT false, "stripeConnected" boolean NOT NULL DEFAULT false, "bookingsConnected" boolean NOT NULL DEFAULT false, "googleProfileId" text, "stripeAccountId" text, CONSTRAINT "PK_integration_settings" PRIMARY KEY ("id"))`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_integration_settings_businessId" ON "integration_settings" ("businessId")`,
      );
      await queryRunner.query(
        `ALTER TABLE "integration_settings" ADD CONSTRAINT "FK_integration_settings_businessId" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }

    await queryRunner.query(
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_methods_provider_enum') THEN
          CREATE TYPE "public"."payment_methods_provider_enum" AS ENUM('stripe', 'paypal');
        END IF;
      END $$;`,
    );

    const hasPaymentMethods = await queryRunner.hasTable('payment_methods');
    if (!hasPaymentMethods) {
      await queryRunner.query(
        `CREATE TABLE "payment_methods" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" uuid NOT NULL, "provider" "public"."payment_methods_provider_enum" NOT NULL, "tokenReference" text NOT NULL, "brand" character varying, "last4" character varying, "expMonth" integer, "expYear" integer, "isDefault" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_payment_methods" PRIMARY KEY ("id"))`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_payment_methods_userId" ON "payment_methods" ("userId")`,
      );
      await queryRunner.query(
        `ALTER TABLE "payment_methods" ADD CONSTRAINT "FK_payment_methods_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('payment_methods')) {
      await queryRunner.query(
        `ALTER TABLE "payment_methods" DROP CONSTRAINT IF EXISTS "FK_payment_methods_userId"`,
      );
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_methods_userId"`);
      await queryRunner.query(`DROP TABLE IF EXISTS "payment_methods"`);
    }
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."payment_methods_provider_enum"`,
    );
    if (await queryRunner.hasTable('integration_settings')) {
      await queryRunner.query(
        `ALTER TABLE "integration_settings" DROP CONSTRAINT IF EXISTS "FK_integration_settings_businessId"`,
      );
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_integration_settings_businessId"`);
      await queryRunner.query(`DROP TABLE IF EXISTS "integration_settings"`);
    }
  }
}
