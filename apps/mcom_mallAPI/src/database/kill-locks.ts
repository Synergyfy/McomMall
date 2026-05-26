import { Client } from 'pg';

const client = new Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.wqqtcbustmiwvrjxtsnp',
  password: 'Mcomgbs100%',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to database!');
  
  const res = await client.query(`
    SELECT pid, age(clock_timestamp(), query_start), usename, state, query
    FROM pg_stat_activity
    WHERE query != '<insufficient privilege>'
      AND query NOT LIKE '%pg_stat_activity%'
      AND state != 'idle';
  `);
  
  console.log('Active queries:', res.rows);
  
  for (const row of res.rows) {
    console.log(`Killing process ${row.pid} running query: ${row.query}`);
    try {
      await client.query(`SELECT pg_terminate_backend(${row.pid});`);
      console.log(`Successfully killed ${row.pid}`);
    } catch (err: any) {
      console.error(`Failed to kill ${row.pid}:`, err.message);
    }
  }
  
  await client.end();
}

main().catch(console.error);
