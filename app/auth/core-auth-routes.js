/**
 * HAOS Core Authentication Routes
 * OAuth callback routes for social authentication
 */

const express = require('express');
const passport = require('passport');
c/**
 * GET /auth/apple/callback
 * Apple OAuth callback
 */
router.post('/apple/callback',
  passport.authenticate('apple', {
    failureRedirect: '/login.html?error=apple_failed',
    session: false
  }),
  async (req, res) => {
    await handleOAuthSuccess(req, res);
  }
);require('jsonwebtoken');
const authService = require('../services/auth-service');

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
async function handleOAuthSuccess(req, res) {
  console.log('[OAuth] handleOAuthSuccess called');
  console.log('[OAuth] req.user exists:', !!req.user);
  console.log('[OAuth] req.user:', req.user ? { id: req.user.id, email: req.user.email } : 'undefined');
  
  if (!req.user) {
    console.error('[OAuth] ❌ No user in request, redirecting to login');
    return res.redirect('/login.html?error=oauth_failed');
  }

  try {
    // Create authenticated session in database
    console.log('[OAuth] Creating session for user:', req.user.id);
    const session = await authService.createUserSession(req.user);
    console.log('[OAuth] ✅ Session created:', session.sessionId);
    
    // Set session cookie in MAIN WINDOW (not popup)
    // Use 'none' for sameSite to allow cross-site cookies during OAuth redirect
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Always use secure for production (HTTPS required)
      sameSite: 'none', // Required for OAuth redirect flow
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/' // Available across entire domain
    };
    
    console.log('[OAuth] Setting cookie with options:', cookieOptions);
    res.cookie('haos_session', session.sessionId, cookieOptions);
    console.log('[OAuth] ✅ Cookie set: haos_session =', session.sessionId);

    // Generate JWT tokens for compatibility
    const tokens = generateTokens(req.user);
    
    // Check if this is a popup or redirect flow
    const isPopup = req.query.mode === 'popup';
    
    if (isPopup) {
      // Popup mode: notify parent and close
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Login Successful</title></head>
        <body>
          <script>
            // Store tokens for backwards compatibility
            localStorage.setItem('haos_token', '${tokens.accessToken}');
            localStorage.setItem('haos_refresh_token', '${tokens.refreshToken}');
            localStorage.setItem('haos_user', JSON.stringify({
              id: ${req.user.id},
              email: '${req.user.email}',
              name: '${req.user.display_name || req.user.name || ''}'
            }));
            
            // Cookie is now set in parent window too!
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'oauth-success', 
                sessionId: '${session.sessionId}',
                tokens: ${JSON.stringify(tokens)} 
              }, '*');
              setTimeout(() => window.close(), 100);
            } else {
              window.location.href = '/account.html?login=success';
            }
          </script>
          <p>✅ Login successful! Closing popup...</p>
        </body>
        </html>
      `);
    } else {
      // Redirect mode: simple redirect (cookie already set)
      // Store tokens in a temporary URL parameter for client-side storage
      // Check if referrer was oauth-test page
      const referer = req.get('Referer') || '';
      const isTestPage = referer.includes('oauth-test.html');
      const redirectUrl = isTestPage ? '/oauth-test.html' : (req.session?.returnTo || '/account.html');
      
      const tokenData = encodeURIComponent(JSON.stringify({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.display_name || req.user.name || ''
        }
      }));
      
      console.log('[OAuth] 🔀 Redirecting to:', `${redirectUrl}?login=success`);
      console.log('[OAuth] 🔀 Referer was:', referer);
      res.redirect(`${redirectUrl}?login=success&tokens=${tokenData}`);
    }
  } catch (error) {
    console.error('[OAuth] ❌ Failed to create session:', error);
    console.error('[OAuth] Error details:', error.message, error.stack);
    return res.redirect('/login.html?error=session_failed');
  }
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
  accessType: 'offline',
  prompt: 'consent select_account' // Force consent screen and account selection
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
  async (req, res) => {
    console.log('[OAuth] Google callback received');
    console.log('[OAuth] Query params:', req.query);
    await handleOAuthSuccess(req, res);
  }
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
  async (req, res) => {
    await handleOAuthSuccess(req, res);
  }
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
 * GET /auth/magic
 * Handle magic link verification (redirect from email)
 */
router.get('/magic', async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.redirect('/login.html?error=missing_token');
  }
  
  // Redirect to API verification endpoint
  res.redirect(`/api/auth/magic/verify?token=${token}`);
});

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
