require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

// Ensure table exists with enhanced schema
async function ensureTable() {
  const client = await pool.connect();
  try {
    // Drop old table and create new one with enhanced schema
    await client.query(`DROP TABLE IF EXISTS notes CASCADE`);
    await client.query(`
      CREATE TABLE notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100),
        important BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database schema initialized successfully');
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

// Get all notes
app.get('/notes', async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, title, content, category, important, created_at, updated_at 
      FROM notes 
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Get single note by ID
app.get('/notes/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      'SELECT id, title, content, category, important, created_at, updated_at FROM notes WHERE id = $1',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching note:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Create new note
app.post('/notes', async (req, res) => {
  const { title, content, category, important } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }
  
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `INSERT INTO notes (title, content, category, important) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, title, content, category, important, created_at, updated_at`,
      [title, content, category || null, important || false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Update note
app.put('/notes/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, category, important } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }
  
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `UPDATE notes 
       SET title = $1, content = $2, category = $3, important = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING id, title, content, category, important, created_at, updated_at`,
      [title, content, category || null, important || false, id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Delete note
app.delete('/notes/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const { rowCount } = await client.query('DELETE FROM notes WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
ensureTable().then(() => {
  app.listen(port, () => console.log(`Server listening on ${port}`));
}).catch(err => { console.error('Failed to ensure table:', err); process.exit(1); });

module.exports = app;
