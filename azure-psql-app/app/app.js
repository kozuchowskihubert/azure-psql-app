require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pool = require('./config/database');
const { apiRouter, pwaRouter } = require('./routes');

const app = express();

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

// Mount PWA routes (root level)
app.use('/', pwaRouter);

// Mount API routes
app.use('/api', apiRouter); // /api/notes, /api/health

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  // Skip if request is for a file with an extension (except .html routes)
  const ext = path.extname(req.path);
  if (ext && ext !== '.html') {
    return res.status(404).send('File not found');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
