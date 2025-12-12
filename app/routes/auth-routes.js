/**
 * HAOS Modern Authentication Routes
 * Supports: OAuth, Magic Links, Email/Password, Anonymous Sessions
 */

const express = require('express');
const authService = require('../services/auth-service');
const { rateLimitAuth } = require('../middleware/auth');

const router = express.Router();

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * GET /api/auth/me
 * Get current user/session info
 */
router.get('/me', async (req, res) => {
  try {
    const sessionId = req.cookies?.haos_session;
    
    console.log('[Auth /me] Request received');
    console.log('[Auth /me] Cookies:', req.cookies);
    console.log('[Auth /me] Session ID from cookie:', sessionId);
    
    if (!sessionId) {
      console.log('[Auth /me] ❌ No session cookie found');
      return res.json({
        authenticated: false,
        tier: 'anonymous',
        session: null,
        user: null
      });
    }

    const session = await authService.getSession(sessionId);
    
    console.log('[Auth /me] Session from DB:', session ? 'FOUND' : 'NOT FOUND');
    
    if (!session) {
      console.log('[Auth /me] ❌ Session not found in database for ID:', sessionId);
      return res.json({
        authenticated: false,
        tier: 'anonymous',
        session: null,
        user: null
      });
    }
    
    console.log('[Auth /me] ✅ User authenticated:', session.user?.email);

    res.json({
      authenticated: session.type === 'authenticated',
      tier: session.tier,
      session: {
        id: session.id,
        type: session.type,
        expiresAt: session.expiresAt
      },
      user: session.user
    });
  } catch (error) {
    console.error('[Auth] /me error:', error);
    res.status(500).json({ error: 'Failed to get session info' });
  }
});

/**
 * POST /api/auth/logout
 * Logout and destroy session
 */
router.post('/logout', async (req, res) => {
  try {
    const sessionId = req.cookies?.haos_session;
    
    if (sessionId) {
      await authService.destroySession(sessionId);
    }

    res.clearCookie('haos_session', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ============================================================================
// MAGIC LINK AUTHENTICATION (Passwordless)
// ============================================================================

/**
 * POST /api/auth/magic
 * Request magic link to email
 */
router.post('/magic', rateLimitAuth(3, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'Invalid email address'
      });
    }

    await authService.sendMagicLink(email);

    res.json({
      success: true,
      message: 'Check your email for the magic link!',
      email: email
    });
  } catch (error) {
    console.error('[Auth] Magic link request failed:', error);
    // Don't reveal if email exists or not
    res.json({
      success: true,
      message: 'If this email is registered, you will receive a magic link'
    });
  }
});

/**
 * GET /api/auth/magic/verify
 * Verify magic link and create session
 */
router.get('/magic/verify', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.redirect('/login.html?error=missing_token');
    }

    const session = await authService.verifyMagicLink(token);

    // Set HTTPOnly cookie
    res.cookie('haos_session', session.sessionId, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // Redirect to dashboard or return URL
    const redirect = req.query.redirect || '/account.html';
    res.redirect(`${redirect}?login=success`);
  } catch (error) {
    console.error('[Auth] Magic link verification failed:', error);
    res.redirect('/login.html?error=invalid_link');
  }
});

// ============================================================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================================================

/**
 * POST /api/auth/register
 * Register with email/password
 */
router.post('/register', rateLimitAuth(5, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'Invalid email address'
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        error: 'Name must be at least 2 characters'
      });
    }

    const user = await authService.registerWithEmail(email, password, name);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Check your email for verification link.',
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name
      }
    });
  } catch (error) {
    console.error('[Auth] Registration failed:', error);
    
    if (error.message === 'Email already registered') {
      return res.status(409).json({
        error: 'Email already registered',
        suggestion: 'Try logging in or use "Forgot password"'
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email/password
 */
router.post('/login', rateLimitAuth(5, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const session = await authService.loginWithEmail(email, password);

    // Set HTTPOnly cookie
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    res.cookie('haos_session', session.sessionId, {
      maxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: session.user,
      tier: session.tier
    });
  } catch (error) {
    console.error('[Auth] Login failed:', error);
    res.status(401).json({
      error: 'Invalid email or password'
    });
  }
});

// ============================================================================
// OAUTH AUTHENTICATION
// ============================================================================

/**
 * GET /api/auth/oauth/:provider
 * Initiate OAuth flow (Google, Apple, Facebook)
 */
router.get('/oauth/:provider', (req, res) => {
  const { provider } = req.params;
  
  // Validate provider
  const validProviders = ['google', 'apple', 'facebook'];
  if (!validProviders.includes(provider)) {
    return res.status(400).json({
      error: 'Invalid OAuth provider',
      validProviders
    });
  }

  // OAuth configuration
  const configs = {
    google: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      clientId: process.env.GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      redirectUri: `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/oauth/google/callback`
    },
    apple: {
      authUrl: 'https://appleid.apple.com/auth/authorize',
      clientId: process.env.APPLE_CLIENT_ID,
      scope: 'name email',
      redirectUri: `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/oauth/apple/callback`
    },
    facebook: {
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      clientId: process.env.FACEBOOK_APP_ID,
      scope: 'email,public_profile',
      redirectUri: `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/oauth/facebook/callback`
    }
  };

  const config = configs[provider];
  
  if (!config.clientId) {
    return res.status(503).json({
      error: `${provider} OAuth not configured`,
      message: 'This login method is currently unavailable'
    });
  }

  // Generate state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state: state
  });

  const authUrl = `${config.authUrl}?${params.toString()}`;
  res.redirect(authUrl);
});

/**
 * GET /api/auth/oauth/:provider/callback
 * OAuth callback handler
 */
router.get('/oauth/:provider/callback', async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`/login.html?error=oauth_${error}`);
    }

    if (!code) {
      return res.redirect('/login.html?error=oauth_no_code');
    }

    // Verify state (CSRF protection)
    if (state !== req.session?.oauthState) {
      return res.redirect('/login.html?error=oauth_invalid_state');
    }

    // Exchange code for tokens and get user profile
    // This is a simplified version - full implementation needs provider-specific logic
    const profile = await exchangeOAuthCode(provider, code);
    
    // Login or create user
    const session = await authService.loginWithOAuth(provider, profile);

    // Set HTTPOnly cookie
    res.cookie('haos_session', session.sessionId, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // Redirect to dashboard
    res.redirect('/account.html?login=success');
  } catch (error) {
    console.error('[Auth] OAuth callback failed:', error);
    res.redirect('/login.html?error=oauth_failed');
  }
});

// Helper function for OAuth token exchange
async function exchangeOAuthCode(provider, code) {
  // This is a placeholder - needs actual implementation per provider
  // Using passport.js or manual fetch to provider's token endpoint
  throw new Error('OAuth token exchange not yet implemented');
}

// ============================================================================
// TOKEN REFRESH
// ============================================================================

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required'
      });
    }

    const newAccessToken = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error('[Auth] Token refresh failed:', error);
    res.status(401).json({
      error: 'Invalid refresh token'
    });
  }
});

// ============================================================================
// ANONYMOUS SESSION
// ============================================================================

/**
 * POST /api/auth/anonymous
 * Create anonymous session
 */
router.post('/anonymous', async (req, res) => {
  try {
    const session = await authService.createAnonymousSession();

    res.cookie('haos_session', session.sessionId, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.json({
      success: true,
      session: {
        id: session.sessionId,
        type: session.type,
        tier: session.tier,
        features: session.features
      }
    });
  } catch (error) {
    console.error('[Auth] Anonymous session creation failed:', error);
    res.status(500).json({
      error: 'Failed to create session'
    });
  }
});

module.exports = router;
