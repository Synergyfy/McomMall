
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

async function createTestDb() {
  const dbName = process.env.POSTGRES_NAME;

  if (!dbName) {
    console.error('Error: POSTGRES_NAME is not defined in .env.test');
    process.exit(1);
  }

  // Connect to the default 'postgres' database to create the new database
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();

    const res = await client.query(
      `SELECT datname FROM pg_catalog.pg_database WHERE datname = '${dbName}'`
    );

    if (res.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error creating test database:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTestDb();
