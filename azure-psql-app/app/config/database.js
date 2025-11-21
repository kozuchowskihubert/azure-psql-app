const { Pool } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
}

const pool = new Pool({ 
  connectionString: databaseUrl, 
  ssl: { rejectUnauthorized: false } 
});

module.exports = pool;
