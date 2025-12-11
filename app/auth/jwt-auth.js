/**
 * JWT Authentication System for HAOS.fm
 * Complete authentication with JWT tokens, Google OAuth, Facebook OAuth, and local auth
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const pool = require('../config/database');

const router = express.Router();

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'haos-fm-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';
const JWT_REFRESH_EXPIRES_IN = '30d';

// Generate JWT tokens
function generateTokens(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.display_name || user.name,
    roles: user.roles || ['user'],
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'haos.fm',
    audience: 'haos.fm-users',
  });

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

// Verify JWT token middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Optional authentication middleware
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
}

// Google OAuth Configuration
const GOOGLE_CONFIG = {
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://haos.fm/api/auth/google/callback',
};

// Configure Google OAuth if credentials provided
if (GOOGLE_CONFIG.clientID && GOOGLE_CONFIG.clientSecret) {
  passport.use(
    new GoogleStrategy(
      GOOGLE_CONFIG,
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const googleId = profile.id;
          const displayName = profile.displayName;
          const avatarUrl = profile.photos[0]?.value;

          let result = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);

          if (result.rows.length > 0) {
            result = await pool.query(
              'UPDATE users SET display_name = $1, avatar_url = $2, last_login_at = NOW(), updated_at = NOW() WHERE google_id = $3 RETURNING *',
              [displayName, avatarUrl, googleId]
            );
            return done(null, result.rows[0]);
          }

          result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

          if (result.rows.length > 0) {
            result = await pool.query(
              'UPDATE users SET google_id = $1, display_name = COALESCE(display_name, $2), avatar_url = COALESCE(avatar_url, $3), email_verified = TRUE, last_login_at = NOW(), updated_at = NOW() WHERE email = $4 RETURNING *',
              [googleId, displayName, avatarUrl, email]
            );
            return done(null, result.rows[0]);
          }

          result = await pool.query(
            'INSERT INTO users (email, google_id, display_name, avatar_url, email_verified, created_at, updated_at, last_login_at) VALUES ($1, $2, $3, $4, TRUE, NOW(), NOW(), NOW()) RETURNING *',
            [email, googleId, displayName, avatarUrl]
          );

          done(null, result.rows[0]);
        } catch (error) {
          console.error('Google OAuth error:', error);
          done(error, null);
        }
      }
    )
  );
  console.log('✓ Google OAuth configured');
} else {
  console.log('⚠️  Google OAuth not configured (missing credentials)');
}

// Facebook OAuth Configuration
const FACEBOOK_CONFIG = {
  clientID: process.env.FACEBOOK_APP_ID || '',
  clientSecret: process.env.FACEBOOK_APP_SECRET || '',
  callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'https://haos.fm/api/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
};

// Configure Facebook OAuth if credentials provided
if (FACEBOOK_CONFIG.clientID && FACEBOOK_CONFIG.clientSecret) {
  passport.use(
    new FacebookStrategy(
      FACEBOOK_CONFIG,
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const facebookId = profile.id;
          const displayName = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
          const avatarUrl = profile.photos?.[0]?.value;

          // Try to find user by Facebook ID
          let result = await pool.query('SELECT * FROM users WHERE facebook_id = $1', [facebookId]);

          if (result.rows.length > 0) {
            // Update existing user
            result = await pool.query(
              'UPDATE users SET display_name = $1, avatar_url = $2, last_login_at = NOW(), updated_at = NOW() WHERE facebook_id = $3 RETURNING *',
              [displayName, avatarUrl, facebookId]
            );
            return done(null, result.rows[0]);
          }

          // Try to find by email if provided
          if (email) {
            result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            if (result.rows.length > 0) {
              // Link Facebook to existing email account
              result = await pool.query(
                'UPDATE users SET facebook_id = $1, display_name = COALESCE(display_name, $2), avatar_url = COALESCE(avatar_url, $3), email_verified = TRUE, last_login_at = NOW(), updated_at = NOW() WHERE email = $4 RETURNING *',
                [facebookId, displayName, avatarUrl, email]
              );
              return done(null, result.rows[0]);
            }

            // Create new user with email
            result = await pool.query(
              'INSERT INTO users (email, facebook_id, display_name, avatar_url, email_verified, created_at, updated_at, last_login_at) VALUES ($1, $2, $3, $4, TRUE, NOW(), NOW(), NOW()) RETURNING *',
              [email, facebookId, displayName, avatarUrl]
            );
          } else {
            // Create new user without email (Facebook doesn't always provide email)
            result = await pool.query(
              'INSERT INTO users (facebook_id, display_name, avatar_url, email_verified, created_at, updated_at, last_login_at) VALUES ($1, $2, $3, FALSE, NOW(), NOW(), NOW()) RETURNING *',
              [facebookId, displayName, avatarUrl]
            );
          }

          done(null, result.rows[0]);
        } catch (error) {
          console.error('Facebook OAuth error:', error);
          done(error, null);
        }
      }
    )
  );
  console.log('✓ Facebook OAuth configured');
} else {
  console.log('⚠️  Facebook OAuth not configured (missing credentials)');
}

// Passport serialization
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

// Validation helpers
const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  password: (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password),
  name: (name) => name && name.trim().length >= 2 && name.trim().length <= 100,
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name, acceptTerms } = req.body;
  const errors = [];

  if (!email || !validators.email(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }
  if (!password || !validators.password(password)) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters with uppercase, lowercase, and number' });
  }
  if (!name || !validators.name(name)) {
    errors.push({ field: 'name', message: 'Name must be between 2 and 100 characters' });
  }
  if (!acceptTerms) {
    errors.push({ field: 'acceptTerms', message: 'You must accept the Terms of Service' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, errors: [{ field: 'email', message: 'An account with this email already exists' }] });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, display_name, verification_token, verification_token_expires, email_verified, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, TRUE, NOW(), NOW()) RETURNING id, email, display_name',
      [email.toLowerCase(), passwordHash, name.trim(), verificationToken, tokenExpiry]
    );

    const newUser = result.rows[0];
    const tokens = generateTokens(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: { id: newUser.id, email: newUser.email, name: newUser.display_name },
      ...tokens,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, errors: [{ field: 'general', message: 'Registration failed. Please try again.' }] });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, display_name, email_verified, avatar_url, roles FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return res.status(401).json({ success: false, error: 'This account uses social login. Please sign in with Google.', socialLogin: true });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const tokens = generateTokens(user);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name,
        avatar: user.avatar_url,
        roles: user.roles || ['user'],
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(403).json({ success: false, error: 'Invalid refresh token' });
    }

    const result = await pool.query('SELECT id, email, display_name, roles FROM users WHERE id = $1', [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = result.rows[0];
    const tokens = generateTokens(user);

    res.json({ success: true, ...tokens });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(403).json({ success: false, error: 'Invalid or expired refresh token' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, display_name, avatar_url, roles, created_at, last_login_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name,
        avatar: user.avatar_url,
        roles: user.roles || ['user'],
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user information' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/google
router.get(
  '/google',
  (req, res, next) => {
    if (!GOOGLE_CONFIG.clientID) {
      return res.status(503).json({ success: false, error: 'Google OAuth not configured. Please contact support.' });
    }
    next();
  },
  passport.authenticate('google', { scope: ['openid', 'profile', 'email'], session: false })
);

// GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login.html?error=google_auth_failed' }),
  async (req, res) => {
    try {
      const user = req.user;
      const tokens = generateTokens(user);
      res.redirect(`/account.html#access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}&login=success`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect('/login.html?error=auth_callback_failed');
    }
  }
);

// GET /api/auth/google/status
router.get('/google/status', (req, res) => {
  res.json({
    success: true,
    configured: !!(GOOGLE_CONFIG.clientID && GOOGLE_CONFIG.clientSecret),
    callbackURL: GOOGLE_CONFIG.callbackURL,
  });
});

// GET /api/auth/facebook
router.get(
  '/facebook',
  (req, res, next) => {
    if (!FACEBOOK_CONFIG.clientID) {
      return res.status(503).json({ success: false, error: 'Facebook OAuth not configured. Please contact support.' });
    }
    next();
  },
  passport.authenticate('facebook', { scope: ['email', 'public_profile'], session: false })
);

// GET /api/auth/facebook/callback
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login.html?error=facebook_auth_failed' }),
  async (req, res) => {
    try {
      const user = req.user;
      const tokens = generateTokens(user);
      res.redirect(`/account.html#access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}&login=success`);
    } catch (error) {
      console.error('Facebook callback error:', error);
      res.redirect('/login.html?error=auth_callback_failed');
    }
  }
);

// GET /api/auth/facebook/status
router.get('/facebook/status', (req, res) => {
  res.json({
    success: true,
    configured: !!(FACEBOOK_CONFIG.clientID && FACEBOOK_CONFIG.clientSecret),
    callbackURL: FACEBOOK_CONFIG.callbackURL,
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email || !validators.email(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
  }

  try {
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.json({ success: true, message: 'If that email exists, a password reset link has been sent.' });
    }

    const userId = result.rows[0].id;
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
      [resetToken, tokenExpiry, userId]
    );

    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({ success: true, message: 'If that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ success: false, error: 'Failed to process request' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, error: 'Token and new password are required' });
  }

  if (!validators.password(newPassword)) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters with uppercase, lowercase, and number' });
  }

  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    const userId = result.rows[0].id;
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await pool.query(
      'UPDATE users SET password_hash = $1, verification_token = NULL, verification_token_expires = NULL, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
});

module.exports = {
  router,
  authenticateToken,
  optionalAuth,
  generateTokens,
};
