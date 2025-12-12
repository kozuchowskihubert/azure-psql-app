/**
 * Core Authentication Routes
 * Handles social login, session management, and user authentication
 */

const express = require('express');
const passport = require('passport');
const { getAvailableProviders } = require('./social-auth');
const Subscription = require('../models/subscription');
const {
  PLAN_HIERARCHY,
  FEATURE_REQUIREMENTS,
} = require('../middleware/access-control');

const router = express.Router();

// ============================================================================
// Authentication Status & Info
// ============================================================================

/**
 * GET /auth/status
 * Check current authentication status
 */
router.get('/status', async (req, res) => {
  if (!req.user) {
    return res.json({
      authenticated: false,
      user: null,
      subscription: null,
      features: getGuestFeatures(),
      providers: getAvailableProviders(),
    });
  }

  try {
    // Get user's subscription
    const subscription = await Subscription.getUserSubscription(req.user.id);
    const userPlan = subscription?.plan_code || 'free';
    const userPlanLevel = PLAN_HIERARCHY[userPlan] || 1;

    // Calculate accessible features
    const features = calculateUserFeatures(userPlanLevel);

    return res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        displayName: req.user.display_name,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        avatarUrl: req.user.avatar_url,
        roles: req.user.roles || ['user'],
        provider: req.user.sso_provider,
      },
      subscription: {
        plan: userPlan,
        planLevel: userPlanLevel,
        status: subscription?.status || 'none',
        expiresAt: subscription?.current_period_end,
        isTrial: subscription?.status === 'trialing',
      },
      features,
      providers: getAvailableProviders(),
    });
  } catch (error) {
    console.error('Error getting auth status:', error);
    return res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        displayName: req.user.display_name,
        roles: req.user.roles || ['user'],
      },
      subscription: { plan: 'free', planLevel: 1, status: 'none' },
      features: getGuestFeatures(),
      providers: getAvailableProviders(),
    });
  }
});

/**
 * GET /auth/providers
 * Get available authentication providers
 */
router.get('/providers', (req, res) => {
  res.json({
    success: true,
    providers: getAvailableProviders(),
  });
});

// ============================================================================
// TEST & DEBUG Routes
// ============================================================================

/**
 * GET /auth/test
 * Test endpoint to verify auth routes are accessible
 */
router.get('/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Auth routes are working!',
    env: {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      appUrl: process.env.APP_URL || 'not set'
    }
  });
});

// ============================================================================
// Google OAuth
// ============================================================================

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  accessType: 'offline',
  prompt: 'consent select_account'
}));

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('[OAuth] Passport error:', err);
      return res.redirect('/login.html?error=passport_error&details=' + encodeURIComponent(err.message));
    }
    if (!user) {
      console.error('[OAuth] No user returned, info:', info);
      return res.redirect('/login.html?error=no_user&details=' + encodeURIComponent(JSON.stringify(info)));
    }
    req.user = user;
    next();
  })(req, res, next);
}, async (req, res) => {
    // Create session and redirect with tokens
    const authService = require('../services/auth-service');
    const jwt = require('jsonwebtoken');
    
    try {
      console.log('[OAuth Callback] User authenticated:', req.user?.email);
      const user = req.user;
      
      if (!user) {
        console.error('[OAuth Callback] No user in request');
        return res.redirect('/login.html?error=no_user');
      }
      
      console.log('[OAuth Callback] Creating session for user:', user.id);
      const sessionData = await authService.createUserSession(user);
      console.log('[OAuth Callback] Session created:', sessionData.sessionId);
      
      // Set session cookie
      res.cookie('haos_session', sessionData.sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/'
      });
      
      // Generate JWT tokens for client storage
      const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'haos-fm-secret';
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, name: user.display_name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      // Redirect with tokens
      const referer = req.get('referer') || '';
      const redirectUrl = referer.includes('oauth-test.html') ? '/oauth-test.html' : '/account.html';
      const tokenData = JSON.stringify({ accessToken, refreshToken, user: { email: user.email, name: user.display_name } });
      
      console.log('[OAuth Callback] Redirecting to:', redirectUrl);
      console.log('[OAuth Callback] Token data prepared, access token length:', accessToken?.length);
      
      res.redirect(`${redirectUrl}?login=success&tokens=${encodeURIComponent(tokenData)}`);
    } catch (error) {
      console.error('[OAuth Callback] ❌ Error:', error.message);
      console.error('[OAuth Callback] Stack:', error.stack);
      res.redirect('/login.html?error=session_failed&details=' + encodeURIComponent(error.message));
    }
  });

// ============================================================================
// Facebook OAuth
// ============================================================================

router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email', 'public_profile'],
}));

router.get('/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login?error=facebook_failed',
    failureMessage: true,
  }),
  (req, res) => {
    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(returnTo);
  });

// ============================================================================
// Apple Sign-In
// ============================================================================

router.get('/apple', passport.authenticate('apple'));

router.post('/apple/callback',
  passport.authenticate('apple', {
    failureRedirect: '/login?error=apple_failed',
    failureMessage: true,
  }),
  (req, res) => {
    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(returnTo);
  });

// ============================================================================
// Logout
// ============================================================================

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error('Session destroy error:', sessionErr);
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        return res.status(500).json({ error: 'Session destroy failed' });
      }
      res.clearCookie('connect.sid');
      return res.json({ success: true, message: 'Logged out successfully' });
    });
    return null;
  });
});

// ============================================================================
// Feature Access API
// ============================================================================

/**
 * GET /auth/features
 * Get user's accessible features based on their plan
 */
router.get('/features', async (req, res) => {
  if (!req.user) {
    return res.json({
      plan: 'guest',
      planLevel: 0,
      features: getGuestFeatures(),
    });
  }

  try {
    const subscription = await Subscription.getUserSubscription(req.user.id);
    const userPlan = subscription?.plan_code || 'free';
    const userPlanLevel = PLAN_HIERARCHY[userPlan] || 1;

    // Get feature overrides
    const overrides = await Subscription.getUserFeatureOverrides(req.user.id);

    const features = calculateUserFeatures(userPlanLevel, overrides);

    return res.json({
      plan: userPlan,
      planLevel: userPlanLevel,
      subscription: {
        status: subscription?.status || 'none',
        expiresAt: subscription?.current_period_end,
      },
      features,
    });
  } catch (error) {
    console.error('Error getting features:', error);
    return res.status(500).json({ error: 'Failed to get features' });
  }
});

/**
 * GET /auth/can-access/:feature
 * Check if user can access a specific feature
 */
router.get('/can-access/:feature', async (req, res) => {
  const { feature } = req.params;

  if (!req.user) {
    // Guest users can only access free features
    const requiredPlan = FEATURE_REQUIREMENTS[feature] || 'free';
    const canAccess = requiredPlan === 'free';

    return res.json({
      feature,
      canAccess,
      requiredPlan,
      currentPlan: 'guest',
      upgradeUrl: canAccess ? null : '/pricing.html',
    });
  }

  try {
    const subscription = await Subscription.getUserSubscription(req.user.id);
    const userPlan = subscription?.plan_code || 'free';
    const userPlanLevel = PLAN_HIERARCHY[userPlan] || 1;

    const requiredPlan = FEATURE_REQUIREMENTS[feature] || 'free';
    const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 1;

    // Check for override
    const hasOverride = await Subscription.checkFeatureOverride(req.user.id, feature);

    let canAccess = userPlanLevel >= requiredLevel;
    if (hasOverride === true) canAccess = true;
    if (hasOverride === false) canAccess = false;

    return res.json({
      feature,
      canAccess,
      requiredPlan,
      currentPlan: userPlan,
      hasOverride: hasOverride !== null,
      upgradeUrl: canAccess ? null : '/pricing.html',
    });
  } catch (error) {
    console.error('Error checking feature access:', error);
    return res.status(500).json({ error: 'Failed to check feature access' });
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate user features based on plan level and overrides
 */
function calculateUserFeatures(planLevel, overrides = []) {
  const features = {};

  Object.entries(FEATURE_REQUIREMENTS).forEach(([feature, requiredPlan]) => {
    const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 1;
    let canAccess = planLevel >= requiredLevel;

    // Check for override
    const override = overrides.find((o) => o.feature_code === feature);
    if (override) {
      canAccess = override.access_type === 'grant';
    }

    features[feature] = {
      available: canAccess,
      requiredPlan,
      locked: !canAccess,
    };
  });

  return features;
}

/**
 * Get features available to guest users (not logged in)
 */
function getGuestFeatures() {
  const features = {};

  Object.entries(FEATURE_REQUIREMENTS).forEach(([feature, requiredPlan]) => {
    // Guests can only access free features, but with limited functionality
    features[feature] = {
      available: requiredPlan === 'free',
      requiredPlan,
      locked: requiredPlan !== 'free',
      guestMode: true,
    };
  });

  return features;
}

module.exports = router;
