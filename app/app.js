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
const registrationRoutes = require('./routes/registration-routes');

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
 * Increased limit to 350MB for large audio file uploads
 */
app.use(express.json({ limit: '350mb' }));

/**
 * Body parser for URL-encoded payloads
 * Parses incoming request bodies in URL-encoded format (form data)
 * Increased limit to 350MB for large audio file uploads
 */
app.use(express.urlencoded({ extended: true, limit: '350mb' }));

// Registration & Authentication API
app.use('/api/auth', registrationRoutes);

// ============================================================================
// Custom Routes - Must come BEFORE static files
// ============================================================================

/**
 * Platform alias - Redirect /platform to /haos-platform
 * Route: /platform (backward compatibility)
 * IMPORTANT: Must come before static middleware to override /platform/ directory
 */
app.get('/platform', (req, res) => {
  res.redirect(301, '/haos-platform');
});

/**
 * Workspace alias - Redirect /workspace to /techno-workspace
 * Route: /workspace (backward compatibility)
 */
app.get('/workspace', (req, res) => {
  res.redirect(301, '/techno-workspace');
});

/**
 * HAOS Platform - Main integrated studio
 * Route: /haos-platform (cleaner URL without .html)
 */
app.get('/haos-platform', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'haos-platform.html'));
});

/**
 * Techno Workspace - Modular synthesis environment
 * Route: /techno-workspace (cleaner URL without .html)
 */
app.get('/techno-workspace', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'techno-workspace.html'));
});

/**
 * Sounds Browser - Preset library explorer
 * Route: /sounds (300+ techno presets)
 */
app.get('/sounds', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sounds.html'));
});

/**
 * Preset Library - Alternative route
 * Route: /preset-library
 */
app.get('/preset-library', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'preset-library.html'));
});

/**
 * Preset Browser - Redirects to working sounds page
 * Route: /preset-browser
 */
app.get('/preset-browser', (req, res) => {
  res.redirect('/sounds');
});

/**
 * Trap Studio - 808 bass production
 * Route: /trap-studio (cleaner URL without .html)
 */
app.get('/trap-studio', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'trap-studio.html'));
});

/**
 * Admin Panel
 * Route: /admin (user management, subscriptions, analytics)
 */
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

/**
 * Pricing Page
 * Route: /pricing (subscription plans)
 */
app.get('/pricing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pricing.html'));
});

/**
 * Account/Subscription Management
 * Route: /account (user account settings)
 */
app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

/**
 * Subscription Success/Cancel Pages
 * Route: /subscription/success, /subscription/cancel
 */
app.get('/subscription/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'subscription-success.html'));
});

app.get('/subscription/cancel', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'subscription-cancel.html'));
});

/**
 * Registration & Authentication Pages
 * Route: /register, /verify-email, /forgot-password, /reset-password
 */
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/verify-email', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verify-email.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

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
// Authentication (SSO & Social Login)
// ============================================================================

/**
 * Initialize Passport.js for authentication
 * - SSO: Azure AD and Google OAuth (ENABLE_SSO=true)
 * - Social: Facebook, Apple (ENABLE_SOCIAL_AUTH=true)
 */
app.use(passport.initialize());
app.use(passport.session());

// Enterprise SSO (Azure AD, Google) - optional
const enableSSO = process.env.ENABLE_SSO === 'true';
if (enableSSO) {
  try {
    const { initializePassport } = require('./auth/sso-config');
    initializePassport(pool);
    console.log('✓ SSO authentication enabled');

    // Legacy auth routes
    const authRoutes = require('./auth/auth-routes');
    app.use('/api/auth', authRoutes);
  } catch (error) {
    console.log('⚠ SSO not configured:', error.message);
  }
}

// Social Authentication (Google, Facebook, Apple) - always enabled
try {
  const { initializeSocialAuth } = require('./auth/social-auth');
  const coreAuthRoutes = require('./auth/core-auth-routes');

  initializeSocialAuth(pool);
  app.use('/auth', coreAuthRoutes);
  console.log('✓ Social authentication enabled (Google, Facebook, Apple)');
} catch (error) {
  console.log('⚠ Social auth not configured:', error.message);
}

// Email/Password Registration & Authentication
try {
  const registrationRoutes = require('./routes/registration-routes');
  const emailService = require('./services/email-service');
  
  // Initialize email service
  emailService.initialize();
  
  app.use('/api/auth', registrationRoutes);
  console.log('✓ Email/Password registration enabled');
} catch (error) {
  console.log('⚠ Registration routes not available:', error.message);
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

/**
 * Subscription Management
 * Handles subscription plans, user subscriptions, and feature access
 */
try {
  const subscriptionRoutes = require('./routes/subscription-routes');
  app.use('/api/subscriptions', subscriptionRoutes);
  console.log('✓ Subscription API enabled');
} catch (error) {
  console.log('⚠ Subscription routes not available:', error.message);
}

/**
 * Payment Processing
 * Handles payments via Stripe, PayPal, and BLIK/Przelewy24
 */
try {
  const paymentRoutes = require('./routes/payment-routes');
  app.use('/api/payments', paymentRoutes);
  console.log('✓ Payment API enabled');
} catch (error) {
  console.log('⚠ Payment routes not available:', error.message);
}

/**
 * User Profile API
 * User profile, preferences, and account management
 */
try {
  const userRoutes = require('./routes/user-routes');
  app.use('/api/user', userRoutes);
  console.log('✓ User Profile API enabled');
} catch (error) {
  console.log('⚠ User routes not available:', error.message);
}

/**
 * Platform Integration API
 * Unified platform state, Virtual Lab instruments, feature gating
 */
try {
  const platformRoutes = require('./services/platform-integration');
  app.use('/api/platform', platformRoutes);
  console.log('✓ Platform Integration API enabled');
} catch (error) {
  console.log('⚠ Platform routes not available:', error.message);
}

/**
 * Preset Management API
 * HAOS Platform modular synthesis presets with tier-based access
 */
try {
  const presetRoutes = require('./routes/presets');
  app.use('/api', presetRoutes);
  console.log('✓ Preset API enabled (1000+ presets available)');
} catch (error) {
  console.log('⚠ Preset routes not available:', error.message);
}

/**
 * Admin Panel API
 * User management, subscriptions, transactions, and feature flags
 */
try {
  const adminRoutes = require('./routes/admin-routes');
  app.use('/api/admin', adminRoutes);
  console.log('✓ Admin API enabled');
} catch (error) {
  console.log('⚠ Admin routes not available:', error.message);
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
 * Root-level health endpoint for Azure App Service
 * Simplified - always returns 200 OK if server is running
 * Database check is optional and non-blocking
 */
app.get('/health', async (req, res) => {
  const response = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    app: 'HAOS.fm Music Platform',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  // Try database check with short timeout, but don't block
  try {
    const client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
    ]);

    if (client) {
      try {
        await client.query('SELECT 1');
        response.database = 'connected';
      } catch (dbErr) {
        response.database = 'error';
      } finally {
        client.release();
      }
    }
  } catch (err) {
    response.database = 'unavailable';
  }

  // Always return 200 OK - server is running
  res.status(200).json(response);
});

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
