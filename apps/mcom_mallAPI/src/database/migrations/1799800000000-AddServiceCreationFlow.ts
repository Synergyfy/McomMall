import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rebuilds the service profile around the Create Service storyline:
 * customer-facing pricing types, delivery/customer-action choices, booking
 * instructions and optional additional information.
 *
 * The legacy pricingModel/fixedPrice/pricePerHour/deliveryConfig columns are
 * kept in sync by the API for bookings and older clients. This migration
 * backfills the new columns from those values so existing services keep
 * rendering correctly in the new experience.
 */
export class AddServiceCreationFlow1799800000000 implements MigrationInterface {
  name = 'AddServiceCreationFlow1799800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "pricingType" character varying NOT NULL DEFAULT 'fixed'`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "price" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "priceMax" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "deliveryOptions" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "customerAction" character varying NOT NULL DEFAULT 'bookNow'`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "bookingInstructions" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "appointmentArrangements" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "availabilityNotes" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "serviceConditions" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "faqs" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "serviceLocation" jsonb`,
    );

    // Backfill the new pricing shape from the legacy columns.
    await queryRunner.query(`
      UPDATE "services"
      SET "pricingType" = CASE
        WHEN "isQuoteModel" = true THEN 'quote'
        WHEN "pricingModel"::text = 'perHour' THEN 'hourly'
        ELSE 'fixed'
      END
    `);

    await queryRunner.query(`
      UPDATE "services"
      SET "price" = COALESCE(
        "fixedPrice",
        "pricePerHour",
        "pricePerUnit",
        "basePrice"
      )
      WHERE "price" IS NULL
    `);

    // Quote-only services do not need a stored price.
    await queryRunner.query(`
      UPDATE "services"
      SET "price" = NULL
      WHERE "pricingType" = 'quote'
    `);

    // Backfill delivery options from the legacy deliveryConfig.mode.
    await queryRunner.query(`
      UPDATE "services"
      SET "deliveryOptions" = jsonb_build_array(
        CASE COALESCE("deliveryConfig"->>'mode', 'onsite')
          WHEN 'atShop' THEN 'atBusiness'
          WHEN 'remote' THEN 'online'
          ELSE 'atCustomer'
        END
      )
      WHERE "deliveryOptions" IS NULL
    `);

    await queryRunner.query(
      `UPDATE "services" SET "deliveryOptions" = '[]'::jsonb WHERE "deliveryOptions" IS NULL`,
    );

    // Quote-model services should ask for a quote, everything else books now.
    await queryRunner.query(`
      UPDATE "services"
      SET "customerAction" = CASE
        WHEN "isQuoteModel" = true THEN 'requestQuote'
        ELSE 'bookNow'
      END
    `);

    await queryRunner.query(
      `UPDATE "services" SET "faqs" = '[]'::jsonb WHERE "faqs" IS NULL`,
    );

    // Snapshot the business location so the service preview and storefront can
    // render the CHS-provided location without an extra lookup.
    await queryRunner.query(`
      UPDATE "services" AS sv
      SET "serviceLocation" = jsonb_build_object(
        'addressLine1', l."addressLine1",
        'addressLine2', l."addressLine2",
        'city', l."city",
        'state', l."state",
        'postcode', l."postcode",
        'latitude', l."latitude",
        'longitude', l."longitude"
      )
      FROM "businesses" AS b
      INNER JOIN "locations" AS l ON l."businessId" = b."id"
      WHERE sv."businessId" = b."id"
        AND sv."serviceLocation" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN IF EXISTS "serviceLocation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN IF EXISTS "faqs"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN IF EXISTS "serviceConditions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN IF EXISTS "availabilityNotes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN IF EXISTS "appointmentArrangements"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN IF EXISTS "bookingInstructions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN IF EXISTS "customerAction"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN IF EXISTS "deliveryOptions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN IF EXISTS "priceMax"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN IF EXISTS "price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN IF EXISTS "pricingType"`,
    );
  }
}
