const pool = require('../config/database');

async function ensureTable() {
  try {
    const client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout after 5s')), 5000),
      ),
    ]);

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          category VARCHAR(100),
          important BOOLEAN DEFAULT FALSE,
          note_type VARCHAR(50) DEFAULT 'text',
          mermaid_code TEXT,
          diagram_data JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Database schema initialized successfully');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('⚠️  Database initialization failed:', err.message);
    console.warn('   App will run without database features');
    // Don't throw - let the app start anyway
  }
}

module.exports = ensureTable;
