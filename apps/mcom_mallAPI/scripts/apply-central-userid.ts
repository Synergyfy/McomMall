import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  const ds = new DataSource({
    type: 'postgres',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USERNAME || 'user',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_NAME || 'dbname',
    host: process.env.POSTGRES_HOST || 'localhost',
  });

  await ds.initialize();
  const qr = ds.createQueryRunner();

  const check = await qr.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='centralUserId'`,
  );

  if (check.length > 0) {
    console.log('Column centralUserId already exists.');
  } else {
    await qr.query(`ALTER TABLE "users" ADD COLUMN "centralUserId" varchar`);
    console.log('Column centralUserId added.');
  }

  const migrationExists = await qr.query(
    `SELECT * FROM migrations WHERE name = 'AddCentralUserIdToUser1784417379662'`,
  );
  if (migrationExists.length === 0) {
    await qr.query(
      `INSERT INTO migrations(timestamp, name) VALUES(1784417379662, 'AddCentralUserIdToUser1784417379662')`,
    );
    console.log('Migration record inserted.');
  }

  await ds.destroy();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
