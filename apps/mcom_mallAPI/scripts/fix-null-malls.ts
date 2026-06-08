import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ActivatedRegion } from '../src/resources/localmall/entities/activated-region.entity';
import { LocalMall } from '../src/resources/localmall/entities/localmall.entity';
import { Business } from '../src/resources/listings/entities/listing.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  port: +process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USERNAME || 'user',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_NAME || 'dbname',
  host: process.env.POSTGRES_HOST || 'localhost',
  entities: [path.resolve(__dirname, '..', 'src') + '/**/*.entity{.ts,.js}'],
  synchronize: false,
});

async function geocodePostcode(postcode: string) {
  const cleanPostcode = postcode.trim().toUpperCase();
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanPostcode)}&format=json&addressdetails=1&limit=1&countrycodes=gb`,
      {
        headers: {
          'User-Agent': 'McomMall-Repair/1.0 (contact@mcommall.com)',
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const addr = data[0].address || {};
        let borough = addr.suburb || addr.neighbourhood || addr.city_district || addr.town || addr.city || '';
        
        if (borough) {
          borough = borough
            .replace(/London Borough of /i, '')
            .replace(/Borough of /i, '')
            .replace(/City of /i, '')
            .trim();
          return { borough, lat, lon };
        }
      }
    }
  } catch (err) {
    console.error(`Error geocoding ${postcode}:`, err);
  }
  return null;
}

async function run() {
  try {
    await dataSource.initialize();
    console.log('Database connected.');

    const businesses = await dataSource.getRepository(Business).find({
      where: { localMallId: null as any },
      relations: ['location'],
    });

    console.log(`Found ${businesses.length} businesses with null localMallId.`);

    const localMallRepo = dataSource.getRepository(LocalMall);
    const activatedRegionRepo = dataSource.getRepository(ActivatedRegion);
    const businessRepo = dataSource.getRepository(Business);

    // Keep track of malls that received new businesses so we can update active status at the end
    const affectedMallIds = new Set<string>();
    const mallIdToBorough = new Map<string, string>();

    for (const b of businesses) {
      if (!b.location || !b.location.postcode) {
        console.log(`Business "${b.businessName}" (ID: ${b.id}) has no location or postcode. Skipping.`);
        continue;
      }

      console.log(`Geocoding postcode "${b.location.postcode}" for business "${b.businessName}"...`);
      const geo = await geocodePostcode(b.location.postcode);

      if (!geo) {
        console.log(`Could not resolve postcode for "${b.businessName}". Skipping.`);
        continue;
      }

      const { borough, lat, lon } = geo;
      const mallName = `${borough} Local Mall`;

      // Find or create local mall
      let mall = await localMallRepo.findOne({ where: { name: mallName } });
      if (!mall) {
        mall = localMallRepo.create({
          name: mallName,
          latitude: lat,
          longitude: lon,
        });
        mall = await localMallRepo.save(mall);
        console.log(`Created new LocalMall: "${mallName}"`);
      }

      // Link business
      b.localMallId = mall.id;
      // Also update location fields if empty
      if (b.location) {
        b.location.latitude = lat;
        b.location.longitude = lon;
        b.location.resolvedArea = borough;
        await dataSource.manager.save(b.location);
      }
      await businessRepo.save(b);
      console.log(`Linked "${b.businessName}" to "${mallName}"`);

      affectedMallIds.add(mall.id);
      mallIdToBorough.set(mall.id, borough);

      // Sleep a bit to respect Nominatim usage policy (1 request/sec)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Now recalculate region active status for all affected malls
    console.log('\nRecalculating activated regions status...');
    for (const mallId of affectedMallIds) {
      const borough = mallIdToBorough.get(mallId);
      if (!borough) continue;

      const count = await businessRepo.count({ where: { localMallId: mallId } });
      const shouldBeActive = count > 1;

      let region = await activatedRegionRepo.findOne({ where: { name: borough } });
      if (!region) {
        region = activatedRegionRepo.create({
          name: borough,
          isActive: shouldBeActive,
        });
        await activatedRegionRepo.save(region);
        console.log(`Created ActivatedRegion "${borough}" with isActive: ${shouldBeActive} (Count: ${count})`);
      } else {
        region.isActive = shouldBeActive;
        await activatedRegionRepo.save(region);
        console.log(`Updated ActivatedRegion "${borough}" to isActive: ${shouldBeActive} (Count: ${count})`);
      }
    }

    console.log('\nDatabase repair completed successfully.');
    await dataSource.destroy();
  } catch (error) {
    console.error('Error running repair script:', error);
  }
}

run();
