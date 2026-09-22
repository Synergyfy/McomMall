import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShippingRates1785000000005 implements MigrationInterface {
  name = 'CreateShippingRates1785000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasShippingRates = await queryRunner.hasTable('shipping_rates');
    if (!hasShippingRates) {
      await queryRunner.query(
        `CREATE TABLE "shipping_rates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "carrierCode" character varying NOT NULL, "serviceCode" character varying, "minWeightKg" double precision NOT NULL DEFAULT 0, "maxWeightKg" double precision NOT NULL DEFAULT 1000, "price" double precision NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_shipping_rates" PRIMARY KEY ("id"))`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_shipping_rates_carrierCode" ON "shipping_rates" ("carrierCode")`,
      );

      await queryRunner.query(
        `INSERT INTO "shipping_rates" ("carrierCode", "serviceCode", "minWeightKg", "maxWeightKg", "price", "isActive") VALUES ('royalmail', 'TRM48', 0, 2, 4.50, true)`,
      );
      await queryRunner.query(
        `INSERT INTO "shipping_rates" ("carrierCode", "serviceCode", "minWeightKg", "maxWeightKg", "price", "isActive") VALUES ('royalmail', 'TRM48', 2, 5, 6.75, true)`,
      );
      await queryRunner.query(
        `INSERT INTO "shipping_rates" ("carrierCode", "serviceCode", "minWeightKg", "maxWeightKg", "price", "isActive") VALUES ('royalmail', 'TRM24', 0, 2, 6.99, true)`,
      );
      await queryRunner.query(
        `INSERT INTO "shipping_rates" ("carrierCode", "serviceCode", "minWeightKg", "maxWeightKg", "price", "isActive") VALUES ('royalmail', 'TRM24', 2, 5, 9.49, true)`,
      );
      await queryRunner.query(
        `INSERT INTO "shipping_rates" ("carrierCode", "serviceCode", "minWeightKg", "maxWeightKg", "price", "isActive") VALUES ('dpd', 'DPD', 0, 2, 5.49, true)`,
      );
      await queryRunner.query(
        `INSERT INTO "shipping_rates" ("carrierCode", "serviceCode", "minWeightKg", "maxWeightKg", "price", "isActive") VALUES ('evri', 'EVRI', 0, 2, 5.49, true)`,
      );
      await queryRunner.query(
        `INSERT INTO "shipping_rates" ("carrierCode", "serviceCode", "minWeightKg", "maxWeightKg", "price", "isActive") VALUES ('standard', 'STD', 0, 2, 3.99, true)`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('shipping_rates')) {
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_shipping_rates_carrierCode"`);
      await queryRunner.query(`DROP TABLE IF EXISTS "shipping_rates"`);
    }
  }
}
