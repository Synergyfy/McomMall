import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Denormalises MCOM Central's City → Borough → High Street → Local Mall
 * hierarchy onto each business.
 *
 * Marketplace discovery filters on these columns directly. Keeping the
 * hierarchy local means a marketplace request never has to call Central or
 * walk a deep join chain; each filter is an index-only predicate on
 * `businesses`, and the same predicate can be applied to products, services,
 * vouchers, gift cards and coupon products through their seller.
 */
export class AddBusinessGeoHierarchy1799900000003
  implements MigrationInterface
{
  name = 'AddBusinessGeoHierarchy1799900000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns: Array<[string, string]> = [
      ['geoCityId', 'character varying'],
      ['geoCityName', 'character varying'],
      ['geoBoroughId', 'character varying'],
      ['geoBoroughName', 'character varying'],
      ['geoHighStreetId', 'character varying'],
      ['geoHighStreetName', 'character varying'],
      ['geoLocalMallId', 'character varying'],
      ['geoLocalMallName', 'character varying'],
      ['geoLatitude', 'double precision'],
      ['geoLongitude', 'double precision'],
      ['geoResolvedAt', 'timestamp with time zone'],
    ];

    for (const [column, type] of columns) {
      await queryRunner.query(
        `ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "${column}" ${type}`,
      );
    }

    // Composite indexes keep the hot path (`status = 'published' AND <level>
    // = :id`) index-only even on a large catalogue.
    const indexes: Array<[string, string]> = [
      ['IDX_businesses_geo_city', '"geoCityId", "status"'],
      ['IDX_businesses_geo_borough', '"geoBoroughId", "status"'],
      ['IDX_businesses_geo_high_street', '"geoHighStreetId", "status"'],
      ['IDX_businesses_geo_local_mall', '"geoLocalMallId", "status"'],
    ];
    for (const [name, columnsClause] of indexes) {
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "${name}" ON "businesses" (${columnsClause})`,
      );
    }

    // Case-insensitive name fallback for rows whose Central id was not
    // available (e.g. an older assignment that only stored a name).
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_businesses_geo_city_name" ON "businesses" (LOWER("geoCityName"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_businesses_geo_borough_name" ON "businesses" (LOWER("geoBoroughName"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_businesses_geo_high_street_name" ON "businesses" (LOWER("geoHighStreetName"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_businesses_geo_local_mall_name" ON "businesses" (LOWER("geoLocalMallName"))`,
    );

    // Resolution cache for the backfill worker. One row per UK outward code
    // means existing businesses can be backfilled with one Central lookup per
    // outcode rather than one per business.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "geo_postcode_resolutions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "outcode" character varying NOT NULL,
        "postcode" character varying,
        "city_id" character varying,
        "city_name" character varying,
        "borough_id" character varying,
        "borough_name" character varying,
        "high_street_id" character varying,
        "high_street_name" character varying,
        "local_mall_id" character varying,
        "local_mall_name" character varying,
        "latitude" double precision,
        "longitude" double precision,
        "resolved_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_geo_postcode_resolutions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_geo_postcode_resolutions_outcode" ON "geo_postcode_resolutions" ("outcode")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_geo_postcode_resolutions_outcode"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "geo_postcode_resolutions"`);

    for (const name of [
      'IDX_businesses_geo_local_mall_name',
      'IDX_businesses_geo_high_street_name',
      'IDX_businesses_geo_borough_name',
      'IDX_businesses_geo_city_name',
      'IDX_businesses_geo_local_mall',
      'IDX_businesses_geo_high_street',
      'IDX_businesses_geo_borough',
      'IDX_businesses_geo_city',
    ]) {
      await queryRunner.query(`DROP INDEX IF EXISTS "${name}"`);
    }

    for (const [column] of [
      ['geoResolvedAt'],
      ['geoLongitude'],
      ['geoLatitude'],
      ['geoLocalMallName'],
      ['geoLocalMallId'],
      ['geoHighStreetName'],
      ['geoHighStreetId'],
      ['geoBoroughName'],
      ['geoBoroughId'],
      ['geoCityName'],
      ['geoCityId'],
    ]) {
      await queryRunner.query(
        `ALTER TABLE "businesses" DROP COLUMN IF EXISTS "${column}"`,
      );
    }
  }
}
