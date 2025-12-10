/**
 * Access Control Middleware
 * Handles authentication, authorization, role-based access, and plan-based feature gating
 */

const Subscription = require('../models/subscription');
const User = require('../models/user');

// Plan hierarchy (higher number = more access)
const PLAN_HIERARCHY = {
  free: 1,
  basic: 2,
  starter: 2,
  premium: 3,
  pro: 4,
  enterprise: 5,
};

// Feature requirements by plan
const FEATURE_REQUIREMENTS = {
  // Core features (all plans)
  notes: 'free',
  'preset-browser': 'free',
  pwa: 'free',

  // Basic features
  synth2600: 'basic',
  'midi-generator': 'basic',
  'music-production': 'basic',
  'offline-mode': 'basic',

  // Premium features
  collaboration: 'premium',
  'priority-support': 'premium',
  'advanced-export': 'premium',
  'unlimited-tracks': 'premium',
  'unlimited-presets': 'premium',

  // Pro features
  'api-access': 'pro',
  'custom-branding': 'pro',
  'white-label': 'pro',
  'team-management': 'pro',

  // Enterprise features
  'dedicated-support': 'enterprise',
  sla: 'enterprise',
  'custom-integrations': 'enterprise',
};

// Role permissions
const ROLE_PERMISSIONS = {
  user: [
    'view:own-profile',
    'edit:own-profile',
    'view:own-subscription',
    'manage:own-content',
  ],
  creator: [
    'view:own-profile',
    'edit:own-profile',
    'view:own-subscription',
    'manage:own-content',
    'create:presets',
    'publish:presets',
    'view:analytics',
  ],
  moderator: [
    'view:own-profile',
    'edit:own-profile',
    'view:own-subscription',
    'manage:own-content',
    'view:all-users',
    'moderate:content',
    'view:reports',
  ],
  admin: [
    'view:own-profile',
    'edit:own-profile',
    'view:own-subscription',
    'manage:own-content',
    'view:all-users',
    'edit:all-users',
    'manage:subscriptions',
    'view:admin-panel',
    'view:analytics',
    'manage:content',
  ],
  super_admin: [
    '*', // All permissions
  ],
};

/**
 * Check if user is authenticated
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }
  return next();
};

/**
 * Check if user has a specific role
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  const userRoles = req.user.roles || ['user'];
  const hasRole = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasRole) {
    return res.status(403).json({
      error: 'Insufficient permissions',
      code: 'FORBIDDEN',
      required: allowedRoles,
      current: userRoles,
    });
  }

  return next();
};

/**
 * Check if user has a specific permission
 */
const requirePermission = (...requiredPermissions) => async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  try {
    const userRoles = req.user.roles || ['user'];

    // Super admin has all permissions
    if (userRoles.includes('super_admin')) {
      return next();
    }

    // Collect all permissions from user's roles
    const userPermissions = new Set();
    userRoles.forEach((role) => {
      const rolePerms = ROLE_PERMISSIONS[role] || [];
      rolePerms.forEach((perm) => userPermissions.add(perm));
    });

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(
      (perm) => userPermissions.has(perm) || userPermissions.has('*'),
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        required: requiredPermissions,
      });
    }

    return next();
  } catch (error) {
    console.error('Permission check error:', error);
    return res.status(500).json({ error: 'Permission check failed' });
  }
};

/**
 * Check if user's plan allows access to a feature
 */
const requirePlan = (...allowedPlans) => async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  try {
    // Get user's current subscription
    const subscription = await Subscription.getUserSubscription(req.user.id);
    const userPlan = subscription?.plan_code || 'free';
    const userPlanLevel = PLAN_HIERARCHY[userPlan] || 1;

    // Check if user's plan is in allowed plans or higher
    const hasAccess = allowedPlans.some((plan) => {
      const requiredLevel = PLAN_HIERARCHY[plan] || 1;
      return userPlanLevel >= requiredLevel;
    });

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Upgrade required',
        code: 'UPGRADE_REQUIRED',
        currentPlan: userPlan,
        requiredPlans: allowedPlans,
        upgradeUrl: '/pricing.html',
      });
    }

    // Attach subscription info to request
    req.subscription = subscription;
    req.userPlan = userPlan;
    req.userPlanLevel = userPlanLevel;

    return next();
  } catch (error) {
    console.error('Plan check error:', error);
    return res.status(500).json({ error: 'Plan check failed' });
  }
};

/**
 * Check if user has access to a specific feature
 */
const requireFeature = (featureCode) => async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  try {
    const requiredPlan = FEATURE_REQUIREMENTS[featureCode] || 'free';
    const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 1;

    // Get user's current subscription
    const subscription = await Subscription.getUserSubscription(req.user.id);
    const userPlan = subscription?.plan_code || 'free';
    const userPlanLevel = PLAN_HIERARCHY[userPlan] || 1;

    // Check plan-based access
    if (userPlanLevel < requiredLevel) {
      // Check for feature override
      const hasOverride = await Subscription.checkFeatureOverride(req.user.id, featureCode);

      if (!hasOverride) {
        return res.status(403).json({
          error: 'Feature not available in your plan',
          code: 'FEATURE_LOCKED',
          feature: featureCode,
          currentPlan: userPlan,
          requiredPlan,
          upgradeUrl: '/pricing.html',
        });
      }
    }

    return next();
  } catch (error) {
    console.error('Feature check error:', error);
    return res.status(500).json({ error: 'Feature check failed' });
  }
};

/**
 * Get user's accessible features based on plan
 */
const getUserFeatures = async (userId) => {
  try {
    const subscription = await Subscription.getUserSubscription(userId);
    const userPlan = subscription?.plan_code || 'free';
    const userPlanLevel = PLAN_HIERARCHY[userPlan] || 1;

    const accessibleFeatures = {};
    const lockedFeatures = {};

    Object.entries(FEATURE_REQUIREMENTS).forEach(([feature, requiredPlan]) => {
      const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 1;
      if (userPlanLevel >= requiredLevel) {
        accessibleFeatures[feature] = {
          available: true,
          plan: requiredPlan,
        };
      } else {
        lockedFeatures[feature] = {
          available: false,
          requiredPlan,
          upgradeUrl: '/pricing.html',
        };
      }
    });

    return {
      plan: userPlan,
      planLevel: userPlanLevel,
      accessible: accessibleFeatures,
      locked: lockedFeatures,
    };
  } catch (error) {
    console.error('Get user features error:', error);
    return {
      plan: 'free',
      planLevel: 1,
      accessible: {},
      locked: FEATURE_REQUIREMENTS,
    };
  }
};

/**
 * Admin-only middleware
 */
const requireAdmin = requireRole('admin', 'super_admin');

/**
 * Super admin-only middleware
 */
const requireSuperAdmin = requireRole('super_admin');

/**
 * Attach user features to request for use in templates/responses
 */
const attachUserFeatures = async (req, res, next) => {
  if (req.user) {
    try {
      req.userFeatures = await getUserFeatures(req.user.id);
    } catch (error) {
      console.error('Attach features error:', error);
      req.userFeatures = {
        plan: 'free', planLevel: 1, accessible: {}, locked: {},
      };
    }
  }
  next();
};

module.exports = {
  requireAuth,
  requireRole,
  requirePermission,
  requirePlan,
  requireFeature,
  requireAdmin,
  requireSuperAdmin,
  getUserFeatures,
  attachUserFeatures,
  PLAN_HIERARCHY,
  FEATURE_REQUIREMENTS,
  ROLE_PERMISSIONS,
};
