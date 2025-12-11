/**
 * HAOS Core Authentication Routes
 * OAuth callback routes for social authentication
 */

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'haos-fm-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';
const JWT_REFRESH_EXPIRES_IN = '30d';

/**
 * Generate JWT tokens for user
 */
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

/**
 * Handle successful OAuth login
 */
function handleOAuthSuccess(req, res) {
  if (!req.user) {
    return res.redirect('/login.html?error=oauth_failed');
  }

  const tokens = generateTokens(req.user);
  
  // Return HTML that posts message to opener and closes
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Login Successful</title></head>
    <body>
      <script>
        // Store tokens
        localStorage.setItem('haos_token', '${tokens.accessToken}');
        localStorage.setItem('haos_refresh_token', '${tokens.refreshToken}');
        localStorage.setItem('haos_user', JSON.stringify({
          id: ${req.user.id},
          email: '${req.user.email}',
          name: '${req.user.display_name || req.user.name || ''}'
        }));
        
        // Notify parent window
        if (window.opener) {
          window.opener.postMessage({ type: 'oauth-success', tokens: ${JSON.stringify(tokens)} }, '*');
          window.close();
        } else {
          // Redirect to account page
          window.location.href = '/account.html?login=success';
        }
      </script>
      <p>Login successful! Redirecting...</p>
    </body>
    </html>
  `);
}

// ============================================================================
// GOOGLE OAuth Routes
// ============================================================================

/**
 * GET /auth/google
 * Initiate Google OAuth flow
 */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

/**
 * GET /auth/google/callback
 * Google OAuth callback
 */
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login.html?error=google_failed',
    session: false
  }),
  handleOAuthSuccess
);

// ============================================================================
// FACEBOOK OAuth Routes
// ============================================================================

/**
 * GET /auth/facebook
 * Initiate Facebook OAuth flow
 */
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email', 'public_profile']
}));

/**
 * GET /auth/facebook/callback
 * Facebook OAuth callback
 */
router.get('/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login.html?error=facebook_failed',
    session: false
  }),
  handleOAuthSuccess
);

// ============================================================================
// APPLE OAuth Routes
// ============================================================================

/**
 * GET /auth/apple
 * Initiate Apple OAuth flow
 */
router.get('/apple', passport.authenticate('apple', {
  scope: ['name', 'email']
}));

/**
 * POST /auth/apple/callback
 * Apple OAuth callback (Apple uses POST)
 */
router.post('/apple/callback',
  passport.authenticate('apple', {
    failureRedirect: '/login.html?error=apple_failed',
    session: false
  }),
  handleOAuthSuccess
);

// ============================================================================
// AUTH STATUS
// ============================================================================

/**
 * GET /auth/status
 * Check authentication status
 */
router.get('/status', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.json({ authenticated: false, user: null });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return res.json({ authenticated: true, user });
  } catch (error) {
    return res.json({ authenticated: false, user: null, error: 'Invalid token' });
  }
});

/**
 * POST /auth/logout
 * Clear tokens (client-side responsibility)
 */
router.post('/logout', (req, res) => {
  // Server-side logout mainly involves invalidating refresh tokens
  // For now, just confirm logout - client should clear localStorage
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
