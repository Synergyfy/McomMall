import 'reflect-metadata';
import { initializeDataSource } from '../src/database/data-source';
import { Business } from '../src/resources/listings/entities/listing.entity';
import { Location } from '../src/resources/listings/entities/location.entity';
import { GeoPostcodeResolution } from '../src/resources/geography/entities/geo-postcode-resolution.entity';
import { BusinessGeographyService } from '../src/resources/geography/business-geography.service';
import { McomCentralService } from '../src/resources/sso/mcom-central.service';

/**
 * One-off / manual backfill of the marketplace geographic hierarchy.
 *
 *   npm run geo:backfill -- 50
 *
 * Resolves up to N UK outward codes (not N businesses), so a small batch can
 * cover a large catalogue. The same work runs automatically in production via
 * the scheduled worker.
 */
async function main() {
  const batch = Number(process.argv[2] || 20);
  const dataSource = await initializeDataSource();

  try {
    const service = new BusinessGeographyService(
      dataSource.getRepository(Business),
      dataSource.getRepository(Location),
      dataSource.getRepository(GeoPostcodeResolution),
      new McomCentralService(),
    );

    const result = await service.backfill(
      Number.isFinite(batch) && batch > 0 ? batch : 20,
    );
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
