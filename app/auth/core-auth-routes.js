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
// Google OAuth
// ============================================================================

router.get('/google', passport.authenticate('google', {
  scope: ['openid', 'profile', 'email'],
}));

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login?error=google_failed',
    failureMessage: true,
  }),
  (req, res) => {
    // Successful authentication
    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(returnTo);
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
