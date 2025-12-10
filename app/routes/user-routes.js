/**
 * User Profile API Routes
 * Handles user profile management, preferences, and account settings
 */

const express = require('express');
const User = require('../models/user');
const Subscription = require('../models/subscription');
const { requireAuth } = require('../middleware/access-control');

const router = express.Router();

// ============================================================================
// Profile Management
// ============================================================================

/**
 * GET /api/user/profile
 * Get current user's profile
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscription = await Subscription.getUserSubscription(req.user.id);

    return res.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        timezone: user.timezone,
        language: user.language,
        dateFormat: user.date_format,
        timeFormat: user.time_format,
        isActive: user.is_active,
        roles: user.roles || ['user'],
        provider: user.sso_provider,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      },
      subscription: subscription ? {
        plan: subscription.plan_code,
        planName: subscription.plan_name,
        status: subscription.status,
        billingCycle: subscription.billing_cycle,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        isTrial: subscription.status === 'trialing',
        trialEndsAt: subscription.trial_ends_at,
      } : {
        plan: 'free',
        planName: 'Free',
        status: 'none',
      },
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * PUT /api/user/profile
 * Update current user's profile
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const allowedFields = [
      'displayName', 'firstName', 'lastName', 'avatarUrl',
      'timezone', 'language', 'dateFormat', 'timeFormat',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const user = await User.updateProfile(req.user.id, updateData);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        timezone: user.timezone,
        language: user.language,
        dateFormat: user.date_format,
        timeFormat: user.time_format,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ============================================================================
// User Preferences
// ============================================================================

/**
 * GET /api/user/preferences
 * Get user's preferences
 */
router.get('/preferences', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    return res.json({
      success: true,
      preferences: {
        timezone: user.timezone || 'UTC',
        language: user.language || 'en',
        dateFormat: user.date_format || 'YYYY-MM-DD',
        timeFormat: user.time_format || '24h',
        theme: user.theme || 'dark',
        notifications: {
          email: user.email_notifications !== false,
          push: user.push_notifications !== false,
          marketing: user.marketing_notifications === true,
        },
        audio: {
          defaultVolume: user.default_volume || 0.8,
          autoplay: user.audio_autoplay !== false,
          visualizer: user.audio_visualizer !== false,
        },
        studio: {
          defaultBpm: user.default_bpm || 120,
          defaultKey: user.default_key || 'C',
          autoSave: user.studio_auto_save !== false,
          gridSnap: user.grid_snap !== false,
        },
      },
    });
  } catch (error) {
    console.error('Error getting preferences:', error);
    return res.status(500).json({ error: 'Failed to get preferences' });
  }
});

/**
 * PUT /api/user/preferences
 * Update user's preferences
 */
router.put('/preferences', requireAuth, async (req, res) => {
  try {
    const { timezone, language, dateFormat, timeFormat, theme, notifications, audio, studio } = req.body;

    const updateData = {};

    if (timezone) updateData.timezone = timezone;
    if (language) updateData.language = language;
    if (dateFormat) updateData.dateFormat = dateFormat;
    if (timeFormat) updateData.timeFormat = timeFormat;
    if (theme) updateData.theme = theme;

    // Handle nested notification preferences
    if (notifications) {
      if (typeof notifications.email === 'boolean') {
        updateData.email_notifications = notifications.email;
      }
      if (typeof notifications.push === 'boolean') {
        updateData.push_notifications = notifications.push;
      }
      if (typeof notifications.marketing === 'boolean') {
        updateData.marketing_notifications = notifications.marketing;
      }
    }

    // Handle nested audio preferences
    if (audio) {
      if (typeof audio.defaultVolume === 'number') {
        updateData.default_volume = audio.defaultVolume;
      }
      if (typeof audio.autoplay === 'boolean') {
        updateData.audio_autoplay = audio.autoplay;
      }
      if (typeof audio.visualizer === 'boolean') {
        updateData.audio_visualizer = audio.visualizer;
      }
    }

    // Handle nested studio preferences
    if (studio) {
      if (typeof studio.defaultBpm === 'number') {
        updateData.default_bpm = studio.defaultBpm;
      }
      if (studio.defaultKey) {
        updateData.default_key = studio.defaultKey;
      }
      if (typeof studio.autoSave === 'boolean') {
        updateData.studio_auto_save = studio.autoSave;
      }
      if (typeof studio.gridSnap === 'boolean') {
        updateData.grid_snap = studio.gridSnap;
      }
    }

    await User.updateProfile(req.user.id, updateData);

    return res.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// ============================================================================
// Subscription & Features
// ============================================================================

/**
 * GET /api/user/subscription
 * Get user's subscription details
 */
router.get('/subscription', requireAuth, async (req, res) => {
  try {
    const subscription = await Subscription.getUserSubscription(req.user.id);

    if (!subscription) {
      return res.json({
        success: true,
        subscription: {
          plan: 'free',
          planName: 'Free',
          status: 'none',
          features: await Subscription.getUserFeatures(req.user.id),
        },
      });
    }

    return res.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: subscription.plan_code,
        planName: subscription.plan_name,
        status: subscription.status,
        billingCycle: subscription.billing_cycle,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        isTrial: subscription.status === 'trialing',
        trialEndsAt: subscription.trial_ends_at,
        features: await Subscription.getUserFeatures(req.user.id),
      },
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    return res.status(500).json({ error: 'Failed to get subscription' });
  }
});

/**
 * GET /api/user/features
 * Get user's accessible features
 */
router.get('/features', requireAuth, async (req, res) => {
  try {
    const subscription = await Subscription.getUserSubscription(req.user.id);
    const features = await Subscription.getUserFeatures(req.user.id);

    return res.json({
      success: true,
      plan: subscription?.plan_code || 'free',
      features,
    });
  } catch (error) {
    console.error('Error getting features:', error);
    return res.status(500).json({ error: 'Failed to get features' });
  }
});

/**
 * GET /api/user/can-access/:feature
 * Check if user can access a specific feature
 */
router.get('/can-access/:feature', requireAuth, async (req, res) => {
  try {
    const { feature } = req.params;
    const hasAccess = await Subscription.hasFeature(req.user.id, feature);
    const subscription = await Subscription.getUserSubscription(req.user.id);

    return res.json({
      success: true,
      feature,
      hasAccess,
      currentPlan: subscription?.plan_code || 'free',
      upgradeUrl: hasAccess ? null : '/pricing.html',
    });
  } catch (error) {
    console.error('Error checking feature access:', error);
    return res.status(500).json({ error: 'Failed to check feature access' });
  }
});

// ============================================================================
// Account Management
// ============================================================================

/**
 * GET /api/user/sessions
 * Get user's active sessions
 */
router.get('/sessions', requireAuth, async (req, res) => {
  try {
    // This would require a method in User model to get all sessions
    // For now, return current session info
    return res.json({
      success: true,
      sessions: [{
        current: true,
        createdAt: req.session?.createdAt || new Date(),
        userAgent: req.get('user-agent'),
        ipAddress: req.ip,
      }],
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    return res.status(500).json({ error: 'Failed to get sessions' });
  }
});

/**
 * DELETE /api/user/sessions
 * Logout from all sessions
 */
router.delete('/sessions', requireAuth, async (req, res) => {
  try {
    await User.invalidateAllSessions(req.user.id);

    return res.json({
      success: true,
      message: 'All sessions have been terminated',
    });
  } catch (error) {
    console.error('Error invalidating sessions:', error);
    return res.status(500).json({ error: 'Failed to terminate sessions' });
  }
});

/**
 * POST /api/user/deactivate
 * Deactivate user account
 */
router.post('/deactivate', requireAuth, async (req, res) => {
  try {
    const { confirmation } = req.body;

    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return res.status(400).json({
        error: 'Please confirm by sending confirmation: "DELETE_MY_ACCOUNT"',
      });
    }

    await User.deactivate(req.user.id);
    await User.invalidateAllSessions(req.user.id);

    req.logout((err) => {
      if (err) {
        console.error('Logout error during deactivation:', err);
      }
    });

    return res.json({
      success: true,
      message: 'Account has been deactivated',
    });
  } catch (error) {
    console.error('Error deactivating account:', error);
    return res.status(500).json({ error: 'Failed to deactivate account' });
  }
});

// ============================================================================
// Activity & Usage
// ============================================================================

/**
 * GET /api/user/activity
 * Get user's recent activity
 */
router.get('/activity', requireAuth, async (req, res) => {
  try {
    // This would pull from activity logs
    // For now, return placeholder
    return res.json({
      success: true,
      activity: [],
      message: 'Activity tracking coming soon',
    });
  } catch (error) {
    console.error('Error getting activity:', error);
    return res.status(500).json({ error: 'Failed to get activity' });
  }
});

/**
 * GET /api/user/stats
 * Get user's usage statistics
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const subscription = await Subscription.getUserSubscription(req.user.id);

    // Calculate days since signup
    const signupDate = new Date(user.created_at);
    const today = new Date();
    const daysSinceSignup = Math.floor((today - signupDate) / (1000 * 60 * 60 * 24));

    return res.json({
      success: true,
      stats: {
        memberSince: user.created_at,
        daysSinceSignup,
        lastLogin: user.last_login_at,
        currentPlan: subscription?.plan_code || 'free',
        subscriptionAge: subscription?.created_at
          ? Math.floor((today - new Date(subscription.created_at)) / (1000 * 60 * 60 * 24))
          : 0,
      },
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;
