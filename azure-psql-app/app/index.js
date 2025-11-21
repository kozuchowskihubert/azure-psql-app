const http = require('http');
const { WebSocketServer } = require('ws');
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);

// Initialize collaboration server
const collaborationServer = require('./collaboration');
collaborationServer(server);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now to allow external resources
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

// Make pool available to routes
app.locals.db = pool;

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax',
  },
  name: 'notes.sid',
};

// Use PostgreSQL for session storage in production
if (process.env.NODE_ENV === 'production') {
  const pgSession = require('connect-pg-simple')(session);
  sessionConfig.store = new pgSession({
    pool: pool,
    tableName: 'session'
  });
}

app.use(session(sessionConfig));

// Initialize Passport (only if SSO is enabled)
const enableSSO = process.env.ENABLE_SSO === 'true';
if (enableSSO) {
  try {
    const { initializePassport } = require('./auth/sso-config');
    app.use(passport.initialize());
    app.use(passport.session());
    initializePassport(pool);
    console.log('✓ SSO authentication enabled');
    
    // Auth routes
    const authRoutes = require('./auth/auth-routes');
    app.use('/api/auth', authRoutes);
  } catch (error) {
    console.log('⚠ SSO not configured:', error.message);
  }
}

// Calendar routes (if enabled)
if (process.env.ENABLE_CALENDAR_SYNC === 'true') {
  try {
    const calendarRoutes = require('./routes/calendar-routes');
    app.use('/api/calendar', calendarRoutes);
    console.log('✓ Calendar API enabled');
  } catch (error) {
    console.log('⚠ Calendar routes not available:', error.message);
  }
}

// Meeting routes (if enabled)
if (process.env.ENABLE_MEETING_ROOMS === 'true') {
  try {
    const meetingRoutes = require('./routes/meeting-routes');
    app.use('/api/meetings', meetingRoutes);
    console.log('✓ Meeting API enabled');
  } catch (error) {
    console.log('⚠ Meeting routes not available:', error.message);
  }
}

// Share routes
const shareRoutes = require('./routes/share-routes')(pool);
app.use('/api', shareRoutes);
console.log('✓ Share API enabled');

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
        note_type VARCHAR(50) DEFAULT 'text',
        mermaid_code TEXT,
        diagram_data JSONB,
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
      SELECT id, title, content, category, important, note_type, mermaid_code, diagram_data, created_at, updated_at 
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
      'SELECT id, title, content, category, important, note_type, mermaid_code, diagram_data, created_at, updated_at FROM notes WHERE id = $1',
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
  const { title, content, category, important, note_type, mermaid_code, diagram_data } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }
  
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `INSERT INTO notes (title, content, category, important, note_type, mermaid_code, diagram_data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, title, content, category, important, note_type, mermaid_code, diagram_data, created_at, updated_at`,
      [title, content, category || null, important || false, note_type || 'text', mermaid_code || null, diagram_data || null]
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
  const { title, content, category, important, note_type, mermaid_code, diagram_data } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }
  
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `UPDATE notes 
       SET title = $1, content = $2, category = $3, important = $4, note_type = $5, mermaid_code = $6, diagram_data = $7, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 
       RETURNING id, title, content, category, important, note_type, mermaid_code, diagram_data, created_at, updated_at`,
      [title, content, category || null, important || false, note_type || 'text', mermaid_code || null, diagram_data || null, id]
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

// Explicit routes for PWA files with correct MIME types
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

app.get('/service-worker.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(__dirname, 'public', 'service-worker.js'));
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
ensureTable().then(() => {
  server.listen(port, () => console.log(`Server with WebSocket listening on ${port}`));
}).catch(err => { console.error('Failed to ensure table:', err); process.exit(1); });

module.exports = { app, server };
