const { Pool } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('⚠️  DATABASE_URL is not set - database features will be disabled');
  // Export a dummy pool that won't cause errors
  module.exports = {
    connect: async () => {
      throw new Error('Database not configured');
    },
    query: async () => {
      throw new Error('Database not configured');
    },
    end: async () => {},
    on: () => {},
  };
} else {
  // Determine SSL settings based on environment
  const isLocalDev = process.env.NODE_ENV === 'development' || 
                     process.env.DATABASE_SSL === 'false' ||
                     databaseUrl.includes('localhost') ||
                     databaseUrl.includes('127.0.0.1');
  
  const sslConfig = isLocalDev ? false : { rejectUnauthorized: false };

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: sslConfig,
    // Add connection timeouts to prevent hanging
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 10,
    // Allow graceful degradation
    allowExitOnIdle: true,
  });

  // Handle pool errors gracefully (check if on exists for test compatibility)
  if (typeof pool.on === 'function') {
    pool.on('error', (err) => {
      console.error('Unexpected database error:', err.message);
      // Don't crash the app on database errors
    });
  }

  module.exports = pool;
}
