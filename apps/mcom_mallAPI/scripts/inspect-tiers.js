const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '.env.prod');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const client = new Client({
  host: envConfig.POSTGRES_HOST,
  port: parseInt(envConfig.POSTGRES_PORT || '6543'),
  user: envConfig.POSTGRES_USERNAME,
  password: envConfig.POSTGRES_PASSWORD,
  database: envConfig.POSTGRES_NAME || 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'tiers'
  `);
  console.log(res.rows);
  await client.end();
}

main().catch(console.error);
