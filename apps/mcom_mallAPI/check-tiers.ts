
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Tier } from './src/resources/tier/entities/tier.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  port: +process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USERNAME || 'user',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_NAME || 'dbname',
  host: process.env.POSTGRES_HOST || 'localhost',
  entities: [path.resolve(__dirname, 'src') + '/**/*.entity{.ts,.js}'],
  synchronize: false,
});

async function run() {
  try {
    await dataSource.initialize();
    console.log('Database connected.');

    const tierRepo = dataSource.getRepository(Tier);
    const tiers = await tierRepo.find();

    console.log('Tiers found:', tiers.length);
    tiers.forEach(t => {
        console.log(`ID: ${t.id}, Name: "${t.name}"`);
    });

    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
