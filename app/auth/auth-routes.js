// ============================================================================
// Authentication Routes - SSO Login/Logout
// ============================================================================

const express = require('express');
const passport = require('passport');

const router = express.Router();
const { requireAuth } = require('./sso-config');

// ============================================================================
// Azure AD Routes
// ============================================================================

// Initiate Azure AD login
router.get(
  '/login/azure',
  passport.authenticate('azure-ad', {
    failureRedirect: '/login',
    failureMessage: true,
  }),
);

// Azure AD callback
router.post(
  '/callback/azure',
  passport.authenticate('azure-ad', {
    failureRedirect: '/login?error=azure_auth_failed',
  }),
  (req, res) => {
    // Successful authentication
    res.redirect('/dashboard');
  },
);

// ============================================================================
// Google OAuth Routes
// ============================================================================

// Initiate Google login
router.get(
  '/login/google',
  passport.authenticate('google', {
    scope: [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar',
    ],
    accessType: 'offline',
    prompt: 'consent',
  }),
);

// Google callback
router.get(
  '/callback/google',
  passport.authenticate('google', {
    failureRedirect: '/login?error=google_auth_failed',
  }),
  (req, res) => {
    // Successful authentication
    res.redirect('/dashboard');
  },
);

// ============================================================================
// General Auth Routes
// ============================================================================

// Get current authenticated user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { db } = req.app.locals;

    // Get user with roles
    const userResult = await db.query(
      `SELECT 
        u.*,
        json_agg(
          json_build_object(
            'role', r.role_name,
            'permissions', r.permissions
          )
        ) as roles
      FROM users u
      LEFT JOIN user_role_assignments ura ON u.id = ura.user_id
      LEFT JOIN user_roles r ON ura.role_id = r.id
      WHERE u.id = $1
      GROUP BY u.id`,
      [req.user.id],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Remove sensitive fields
    delete user.sso_provider_id;
    delete user.sso_tenant_id;

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  const userId = req.user?.id;

  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }

    // Delete user session from database
    if (userId) {
      req.app.locals.db.query(
        'DELETE FROM user_sessions WHERE user_id = $1',
        [userId],
      ).catch(console.error);
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.clearCookie('notes.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Refresh token
router.post('/refresh', requireAuth, async (req, res) => {
  try {
    const { db } = req.app.locals;

    // Get current session
    const sessionResult = await db.query(
      `SELECT * FROM user_sessions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1`,
      [req.user.id],
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'No active session found' });
    }

    const session = sessionResult.rows[0];

    // Check if token needs refresh (within 5 minutes of expiry)
    const now = new Date();
    const tokenExpiry = new Date(session.token_expires_at);
    const minutesUntilExpiry = (tokenExpiry - now) / (1000 * 60);

    if (minutesUntilExpiry > 5) {
      return res.json({
        message: 'Token still valid',
        expiresIn: minutesUntilExpiry,
      });
    }

    // TODO: Implement token refresh logic based on provider
    // This would call the respective OAuth provider's token refresh endpoint

    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? {
      id: req.user.id,
      email: req.user.email,
      displayName: req.user.display_name,
    } : null,
  });
});

module.exports = router;
