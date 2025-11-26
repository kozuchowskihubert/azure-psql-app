/**
 * Express Application Configuration
 *
 * This module configures and exports the Express application with all middleware,
 * security settings, routes, and session management.
 *
 * Features:
 * - Security middleware (Helmet, CORS, Rate Limiting)
 * - Session management (in-memory for dev, PostgreSQL for production)
 * - SSO authentication (Passport.js with Azure AD and Google OAuth)
 * - Optional features (Calendar sync, Meeting rooms)
 * - Static file serving and SPA routing
 *
 * @module app
 */

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

// ============================================================================
// Security Middleware
// ============================================================================

/**
 * Helmet: Sets various HTTP headers for security
 * - X-DNS-Prefetch-Control
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Referrer-Policy
 * Note: CSP disabled to allow external resources (Tailwind CDN, etc.)
 */
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now to allow external resources
}));

/**
 * CORS: Enable Cross-Origin Resource Sharing
 * Allows frontend to make requests from different origins
 */
app.use(cors());

/**
 * Rate Limiting: Prevent abuse by limiting requests per IP
 * - 100 requests per 15 minutes per IP
 * - Applied only to /api/ routes
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// ============================================================================
// Request Parsing Middleware
// ============================================================================

/**
 * Body parser for JSON payloads
 * Parses incoming request bodies in JSON format
 */
app.use(express.json());

/**
 * Body parser for URL-encoded payloads
 * Parses incoming request bodies in URL-encoded format (form data)
 */
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// Static Files
// ============================================================================

/**
 * Serve static files from the public directory
 * Includes: HTML, CSS, JS, images, PWA files
 */
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// Database Connection
// ============================================================================

/**
 * Make database pool available to all routes via app.locals
 * Routes can access it using req.app.locals.db
 */
app.locals.db = pool;

// ============================================================================
// Session Management
// ============================================================================

/**
 * Session configuration
 * - Development: In-memory sessions (lost on restart)
 * - Production: PostgreSQL sessions (persistent across restarts)
 * - Cookie settings: Secure in production, HTTP-only, 7-day expiry
 */
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax', // CSRF protection
  },
  name: 'notes.sid', // Custom session cookie name
};

/**
 * Use PostgreSQL for session storage in production
 * This ensures sessions persist across server restarts
 */
if (process.env.NODE_ENV === 'production') {
  const pgSession = require('connect-pg-simple')(session);
  sessionConfig.store = new pgSession({
    pool,
    tableName: 'session',
  });
  console.log('✓ Using PostgreSQL session store');
}

app.use(session(sessionConfig));

// ============================================================================
// Authentication (SSO)
// ============================================================================

/**
 * Initialize Passport.js for SSO authentication (optional feature)
 * Supports Azure AD and Google OAuth
 * Enabled via ENABLE_SSO=true environment variable
 */
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

// ============================================================================
// Optional Feature Routes
// ============================================================================

/**
 * Calendar Sync Feature (optional)
 * Enabled via ENABLE_CALENDAR_SYNC=true environment variable
 */
if (process.env.ENABLE_CALENDAR_SYNC === 'true') {
  try {
    const calendarRoutes = require('./routes/calendar-routes');
    app.use('/api/calendar', calendarRoutes);
    console.log('✓ Calendar API enabled');
  } catch (error) {
    console.log('⚠ Calendar routes not available:', error.message);
  }
}

/**
 * Meeting Room Booking Feature (optional)
 * Enabled via ENABLE_MEETING_ROOMS=true environment variable
 */
if (process.env.ENABLE_MEETING_ROOMS === 'true') {
  try {
    const meetingRoutes = require('./routes/meeting-routes');
    app.use('/api/meetings', meetingRoutes);
    console.log('✓ Meeting API enabled');
  } catch (error) {
    console.log('⚠ Meeting routes not available:', error.message);
  }
}

// ============================================================================
// Core Routes
// ============================================================================

/**
 * PWA Routes (manifest.json, service-worker.js)
 * Mounted at root level for proper PWA functionality
 */
app.use('/', pwaRouter);

/**
 * API Routes (/api/notes, /api/health, /api/music, etc.)
 * All core API endpoints
 */
app.use('/api', apiRouter); // /api/notes, /api/health

/**
 * Code Statistics API
 * Real-time code metrics for development dashboard
 */
const { getCodeStatsHandler } = require('./utils/code-stats');
app.get('/api/code-stats', getCodeStatsHandler);

// ============================================================================
// SPA Fallback
// ============================================================================

/**
 * Serve index.html for all other routes (SPA support)
 * This enables client-side routing for the Single Page Application
 * Skips files with extensions (except .html) to avoid breaking static assets
 */
app.get('*', (req, res) => {
  // Skip if request is for a file with an extension (except .html routes)
  const ext = path.extname(req.path);
  if (ext && ext !== '.html') {
    return res.status(404).send('File not found');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
