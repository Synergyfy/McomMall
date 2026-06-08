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

async function run() {
  try {
    await dataSource.initialize();
    console.log('Database connected.');

    const regions = await dataSource.getRepository(ActivatedRegion).find();
    console.log('\n--- ACTIVATED REGIONS ---');
    console.log(`Count: ${regions.length}`);
    regions.forEach(r => console.log(`ID: ${r.id}, Name: "${r.name}", isActive: ${r.isActive}`));

    const malls = await dataSource.getRepository(LocalMall).find();
    console.log('\n--- LOCAL MALLS ---');
    console.log(`Count: ${malls.length}`);
    malls.forEach(m => console.log(`ID: ${m.id}, Name: "${m.name}", Lat/Lon: ${m.latitude}/${m.longitude}`));

    const businesses = await dataSource.getRepository(Business).find({ relations: ['location'] });
    console.log('\n--- BUSINESSES ---');
    console.log(`Count: ${businesses.length}`);
    businesses.forEach(b => console.log(`ID: ${b.id}, Name: "${b.businessName}", localMallId: ${b.localMallId}, Postcode: ${b.location?.postcode}`));

    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
