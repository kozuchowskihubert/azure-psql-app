require('dotenv').config();
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(2);
}

const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

(async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT now() as now');
    console.log('Connected to DB, now=', res.rows[0].now);
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('DB connection test failed:', err.message);
    process.exit(1);
  }
})();
