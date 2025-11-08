require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

// ensure table exists
async function ensureTable() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS notes (id SERIAL PRIMARY KEY, text TEXT NOT NULL)`);
  } finally {
    client.release();
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      res.json({ 
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/notes', async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT id, text FROM notes ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.post('/notes', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  const client = await pool.connect();
  try {
    const { rows } = await client.query('INSERT INTO notes (text) VALUES ($1) RETURNING id, text', [text]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

const port = process.env.PORT || 3000;
ensureTable().then(() => {
  app.listen(port, () => console.log(`Server listening on ${port}`));
}).catch(err => { console.error('Failed to ensure table:', err); process.exit(1); });

module.exports = app;
