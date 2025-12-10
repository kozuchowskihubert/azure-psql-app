/**
 * Admin Routes
 * API endpoints for admin panel and user management
 */
const express = require('express');

const router = express.Router();
const User = require('../models/user');
const Subscription = require('../models/subscription');
const Payment = require('../models/payment');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Middleware to check admin role
const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const isAdmin = await User.hasRole(req.user.id, 'admin');
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// ============================================================================
// DASHBOARD
// ============================================================================

/**
 * GET /api/admin/dashboard
 * Get admin dashboard statistics
 */
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const pool = require('../config/database');

    // Get various statistics
    const [
      usersResult,
      activeUsersResult,
      subscriptionsResult,
      revenueResult,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query("SELECT COUNT(*) as count FROM users WHERE last_login_at > NOW() - INTERVAL '30 days'"),
      pool.query(`
        SELECT sp.plan_code, COUNT(*) as count 
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.status IN ('active', 'trialing')
        GROUP BY sp.plan_code
      `),
      pool.query(`
        SELECT 
          SUM(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN amount ELSE 0 END) as month_revenue,
          SUM(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN amount ELSE 0 END) as week_revenue,
          SUM(amount) as total_revenue
        FROM transactions
        WHERE status = 'completed' AND type = 'subscription'
      `),
    ]);

    // Format subscription breakdown
    const subscriptionBreakdown = {};
    subscriptionsResult.rows.forEach((row) => {
      subscriptionBreakdown[row.plan_code] = parseInt(row.count, 10);
    });

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(usersResult.rows[0].count, 10),
        activeUsers: parseInt(activeUsersResult.rows[0].count, 10),
        subscriptions: subscriptionBreakdown,
        revenue: {
          total: (revenueResult.rows[0].total_revenue || 0) / 100,
          thisMonth: (revenueResult.rows[0].month_revenue || 0) / 100,
          thisWeek: (revenueResult.rows[0].week_revenue || 0) / 100,
          currency: 'PLN',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * GET /api/admin/users
 * Get all users with pagination and search
 */
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const { search } = req.query;
    const isActive = req.query.active !== undefined ? req.query.active === 'true' : undefined;

    const [users, count] = await Promise.all([
      User.findAll({
        limit, offset, search, isActive,
      }),
      User.count({ search, isActive }),
    ]);

    res.json({
      success: true,
      users: users.map(formatUserForAdmin),
      pagination: {
        total: count,
        limit,
        offset,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/users/:id
 * Get user details
 */
router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscription = await Subscription.getUserSubscription(req.params.id);
    const transactions = await Payment.getUserTransactions(req.params.id, { limit: 10 });
    const permissions = await User.getPermissions(req.params.id);

    res.json({
      success: true,
      user: formatUserForAdmin(user),
      subscription,
      recentTransactions: transactions,
      permissions,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update user
 */
router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.updateProfile(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: formatUserForAdmin(user),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * POST /api/admin/users/:id/deactivate
 * Deactivate user
 */
router.post('/users/:id/deactivate', requireAdmin, async (req, res) => {
  try {
    const user = await User.deactivate(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Invalidate all sessions
    await User.invalidateAllSessions(req.params.id);

    res.json({
      success: true,
      user: formatUserForAdmin(user),
      message: 'User deactivated',
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

/**
 * POST /api/admin/users/:id/reactivate
 * Reactivate user
 */
router.post('/users/:id/reactivate', requireAdmin, async (req, res) => {
  try {
    const user = await User.reactivate(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: formatUserForAdmin(user),
      message: 'User reactivated',
    });
  } catch (error) {
    console.error('Error reactivating user:', error);
    res.status(500).json({ error: 'Failed to reactivate user' });
  }
});

// ============================================================================
// ROLE MANAGEMENT
// ============================================================================

/**
 * GET /api/admin/roles
 * Get all roles
 */
router.get('/roles', requireAdmin, async (req, res) => {
  try {
    const roles = await User.getRoles();
    res.json({
      success: true,
      roles,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

/**
 * POST /api/admin/users/:id/roles
 * Assign role to user
 */
router.post('/users/:id/roles', requireAdmin, async (req, res) => {
  try {
    const { roleName } = req.body;
    if (!roleName) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    const user = await User.assignRole(req.params.id, roleName, req.user.id);
    res.json({
      success: true,
      user: formatUserForAdmin(user),
      message: `Role ${roleName} assigned`,
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({ error: error.message || 'Failed to assign role' });
  }
});

/**
 * DELETE /api/admin/users/:id/roles/:roleName
 * Remove role from user
 */
router.delete('/users/:id/roles/:roleName', requireAdmin, async (req, res) => {
  try {
    const user = await User.removeRole(req.params.id, req.params.roleName);
    res.json({
      success: true,
      user: formatUserForAdmin(user),
      message: `Role ${req.params.roleName} removed`,
    });
  } catch (error) {
    console.error('Error removing role:', error);
    res.status(500).json({ error: error.message || 'Failed to remove role' });
  }
});

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * GET /api/admin/subscriptions
 * Get all subscriptions
 */
router.get('/subscriptions', requireAdmin, async (req, res) => {
  try {
    const pool = require('../config/database');
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const { status } = req.query;

    let query = `
      SELECT us.*, 
        sp.plan_code, sp.name as plan_name, sp.price_monthly,
        u.email, u.display_name
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      JOIN users u ON us.user_id = u.id
    `;

    const values = [];
    let paramIndex = 1;

    if (status) {
      query += ` WHERE us.status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    query += ` ORDER BY us.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    res.json({
      success: true,
      subscriptions: result.rows,
      pagination: {
        limit,
        offset,
        hasMore: result.rows.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

/**
 * POST /api/admin/users/:id/subscription
 * Manually set user subscription
 */
router.post('/users/:id/subscription', requireAdmin, async (req, res) => {
  try {
    const { planCode, billingCycle } = req.body;
    if (!planCode) {
      return res.status(400).json({ error: 'Plan code is required' });
    }

    const subscription = await Subscription.createSubscription(
      req.params.id,
      planCode,
      billingCycle || 'monthly',
    );

    res.json({
      success: true,
      subscription,
      message: `Subscription set to ${planCode}`,
    });
  } catch (error) {
    console.error('Error setting subscription:', error);
    res.status(500).json({ error: error.message || 'Failed to set subscription' });
  }
});

/**
 * POST /api/admin/users/:id/subscription/cancel
 * Cancel user subscription
 */
router.post('/users/:id/subscription/cancel', requireAdmin, async (req, res) => {
  try {
    const { immediate, reason } = req.body;
    const subscription = await Subscription.cancelSubscription(
      req.params.id,
      immediate === true,
      reason || 'Cancelled by admin',
    );

    res.json({
      success: true,
      subscription,
      message: 'Subscription cancelled',
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// ============================================================================
// FEATURE FLAG MANAGEMENT
// ============================================================================

/**
 * GET /api/admin/features
 * Get all feature flags
 */
router.get('/features', requireAdmin, async (req, res) => {
  try {
    const pool = require('../config/database');
    const result = await pool.query(`
      SELECT ff.*, sp.name as minimum_plan_name
      FROM feature_flags ff
      LEFT JOIN subscription_plans sp ON ff.minimum_plan_code = sp.plan_code
      ORDER BY ff.id
    `);

    res.json({
      success: true,
      features: result.rows,
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

/**
 * PUT /api/admin/features/:id
 * Update feature flag
 */
router.put('/features/:id', requireAdmin, async (req, res) => {
  try {
    const pool = require('../config/database');
    const {
      isEnabled, minimumPlanCode, rolloutPercentage, isBeta,
    } = req.body;

    const result = await pool.query(`
      UPDATE feature_flags SET
        is_enabled = COALESCE($2, is_enabled),
        minimum_plan_code = COALESCE($3, minimum_plan_code),
        rollout_percentage = COALESCE($4, rollout_percentage),
        is_beta = COALESCE($5, is_beta),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [req.params.id, isEnabled, minimumPlanCode, rolloutPercentage, isBeta]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    res.json({
      success: true,
      feature: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating feature:', error);
    res.status(500).json({ error: 'Failed to update feature' });
  }
});

/**
 * POST /api/admin/users/:id/feature-override
 * Grant/deny feature access for a user
 */
router.post('/users/:id/feature-override', requireAdmin, async (req, res) => {
  try {
    const pool = require('../config/database');
    const {
      featureCode, overrideType, expiresAt, reason,
    } = req.body;

    if (!featureCode || !overrideType) {
      return res.status(400).json({ error: 'Feature code and override type are required' });
    }

    if (!['grant', 'deny'].includes(overrideType)) {
      return res.status(400).json({ error: 'Override type must be "grant" or "deny"' });
    }

    // Get feature ID
    const featureResult = await pool.query(
      'SELECT id FROM feature_flags WHERE feature_code = $1',
      [featureCode],
    );

    if (featureResult.rows.length === 0) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    const featureId = featureResult.rows[0].id;

    // Upsert override
    const result = await pool.query(`
      INSERT INTO user_feature_overrides (user_id, feature_id, override_type, expires_at, reason, granted_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, feature_id) DO UPDATE SET
        override_type = $3,
        expires_at = $4,
        reason = $5,
        granted_by = $6,
        created_at = NOW()
      RETURNING *
    `, [req.params.id, featureId, overrideType, expiresAt, reason, req.user.id]);

    res.json({
      success: true,
      override: result.rows[0],
      message: `Feature ${featureCode} ${overrideType}ed for user`,
    });
  } catch (error) {
    console.error('Error setting feature override:', error);
    res.status(500).json({ error: 'Failed to set feature override' });
  }
});

// ============================================================================
// TRANSACTION & REVENUE
// ============================================================================

/**
 * GET /api/admin/transactions
 * Get all transactions
 */
router.get('/transactions', requireAdmin, async (req, res) => {
  try {
    const pool = require('../config/database');
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const { status } = req.query;
    const { provider } = req.query;

    let query = `
      SELECT t.*, u.email, u.display_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;

    const values = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    if (provider) {
      query += ` AND t.provider = $${paramIndex}`;
      values.push(provider);
      paramIndex++;
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    res.json({
      success: true,
      transactions: result.rows.map((t) => ({
        ...t,
        amountFormatted: formatPrice(t.amount, t.currency),
      })),
      pagination: {
        limit,
        offset,
        hasMore: result.rows.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * POST /api/admin/transactions/:id/refund
 * Refund a transaction
 */
router.post('/transactions/:id/refund', requireAdmin, async (req, res) => {
  try {
    const PaymentService = require('../services/payment-service');
    const { amount, reason } = req.body;

    const refund = await PaymentService.processRefund(
      req.params.id,
      amount,
      reason,
    );

    res.json({
      success: true,
      refund,
      message: 'Refund processed',
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: error.message || 'Failed to process refund' });
  }
});

// ============================================================================
// COUPON MANAGEMENT
// ============================================================================

/**
 * GET /api/admin/coupons
 * Get all coupons
 */
router.get('/coupons', requireAdmin, async (req, res) => {
  try {
    const pool = require('../config/database');
    const result = await pool.query(`
      SELECT * FROM coupons ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      coupons: result.rows,
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

/**
 * POST /api/admin/coupons
 * Create a coupon
 */
router.post('/coupons', requireAdmin, async (req, res) => {
  try {
    const pool = require('../config/database');
    const {
      code, name, description, discountType, discountValue, currency,
      appliesToPlans, maxRedemptions, validFrom, validUntil, duration, durationMonths,
    } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ error: 'Code, discount type, and discount value are required' });
    }

    const result = await pool.query(`
      INSERT INTO coupons (
        code, name, description, discount_type, discount_value, currency,
        applies_to_plans, max_redemptions, valid_from, valid_until, duration, duration_months
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      code.toUpperCase(),
      name,
      description,
      discountType,
      discountValue,
      currency || 'PLN',
      appliesToPlans,
      maxRedemptions,
      validFrom,
      validUntil,
      duration || 'once',
      durationMonths,
    ]);

    res.json({
      success: true,
      coupon: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

/**
 * PUT /api/admin/coupons/:id
 * Update a coupon
 */
router.put('/coupons/:id', requireAdmin, async (req, res) => {
  try {
    const pool = require('../config/database');
    const { isActive, maxRedemptions, validUntil } = req.body;

    const result = await pool.query(`
      UPDATE coupons SET
        is_active = COALESCE($2, is_active),
        max_redemptions = COALESCE($3, max_redemptions),
        valid_until = COALESCE($4, valid_until),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [req.params.id, isActive, maxRedemptions, validUntil]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json({
      success: true,
      coupon: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

// ============================================================================
// USER PERMISSIONS & ROLES
// ============================================================================

/**
 * GET /api/admin/users/:id/permissions
 * Get user's permissions and feature access
 */
router.get('/users/:id/permissions', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = require('../config/database');

    // Get user with roles
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's subscription
    const subscription = await Subscription.getUserSubscription(id);

    // Get feature overrides
    const overridesResult = await pool.query(`
      SELECT feature_code, access_type, expires_at, reason
      FROM user_feature_overrides
      WHERE user_id = $1
    `, [id]);

    // Define plan hierarchy
    const planHierarchy = {
      free: 1, basic: 2, starter: 2, premium: 3, pro: 4, enterprise: 5,
    };

    // Define feature requirements
    const featureRequirements = {
      notes: 'free',
      'preset-browser': 'free',
      pwa: 'free',
      synth2600: 'basic',
      'midi-generator': 'basic',
      'music-production': 'basic',
      'offline-mode': 'basic',
      collaboration: 'premium',
      'priority-support': 'premium',
      'advanced-export': 'premium',
      'unlimited-tracks': 'premium',
      'unlimited-presets': 'premium',
      'api-access': 'pro',
      'custom-branding': 'pro',
      'white-label': 'pro',
      'team-management': 'pro',
      'dedicated-support': 'enterprise',
      sla: 'enterprise',
      'custom-integrations': 'enterprise',
    };

    const userPlan = subscription?.plan_code || 'free';
    const userPlanLevel = planHierarchy[userPlan] || 1;

    // Calculate feature access
    const features = {};
    Object.entries(featureRequirements).forEach(([feature, requiredPlan]) => {
      const requiredLevel = planHierarchy[requiredPlan] || 1;
      const override = overridesResult.rows.find((o) => o.feature_code === feature);

      let hasAccess = userPlanLevel >= requiredLevel;
      let accessSource = 'plan';

      if (override) {
        if (override.access_type === 'grant') {
          hasAccess = true;
          accessSource = 'override';
        } else if (override.access_type === 'deny') {
          hasAccess = false;
          accessSource = 'override';
        }
      }

      features[feature] = {
        hasAccess,
        requiredPlan,
        accessSource,
        override: override || null,
      };
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        roles: user.roles || [],
      },
      subscription: {
        plan: userPlan,
        planLevel: userPlanLevel,
        status: subscription?.status || 'none',
        expiresAt: subscription?.current_period_end,
      },
      features,
      overrides: overridesResult.rows,
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: 'Failed to fetch user permissions' });
  }
});

/**
 * POST /api/admin/users/:id/roles
 * Update user roles
 */
router.post('/users/:id/roles', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { roles } = req.body;

    if (!Array.isArray(roles)) {
      return res.status(400).json({ error: 'Roles must be an array' });
    }

    const pool = require('../config/database');

    // Validate roles
    const validRoles = ['user', 'creator', 'moderator', 'admin', 'super_admin'];
    const invalidRoles = roles.filter((r) => !validRoles.includes(r));
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        error: 'Invalid roles',
        invalidRoles,
        validRoles,
      });
    }

    // Check if trying to assign super_admin (only super_admin can do this)
    if (roles.includes('super_admin')) {
      const isCurrentUserSuperAdmin = await User.hasRole(req.user.id, 'super_admin');
      if (!isCurrentUserSuperAdmin) {
        return res.status(403).json({
          error: 'Only super admins can assign super admin role',
        });
      }
    }

    // Remove existing roles and add new ones
    await pool.query('DELETE FROM user_roles WHERE user_id = $1', [id]);

    for (const role of roles) {
      await pool.query(
        'INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, role],
      );
    }

    // Fetch updated user
    const user = await User.findById(id);

    res.json({
      success: true,
      message: 'Roles updated successfully',
      user: formatUserForAdmin(user),
    });
  } catch (error) {
    console.error('Error updating user roles:', error);
    res.status(500).json({ error: 'Failed to update user roles' });
  }
});

/**
 * POST /api/admin/users/:id/feature-override
 * Grant or deny a specific feature to a user
 */
router.post('/users/:id/feature-override', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      featureCode, accessType, expiresAt, reason,
    } = req.body;

    if (!featureCode || !accessType) {
      return res.status(400).json({
        error: 'featureCode and accessType are required',
      });
    }

    if (!['grant', 'deny', 'remove'].includes(accessType)) {
      return res.status(400).json({
        error: 'accessType must be "grant", "deny", or "remove"',
      });
    }

    const pool = require('../config/database');

    if (accessType === 'remove') {
      // Remove the override
      await pool.query(
        'DELETE FROM user_feature_overrides WHERE user_id = $1 AND feature_code = $2',
        [id, featureCode],
      );

      return res.json({
        success: true,
        message: 'Feature override removed',
      });
    }

    // Insert or update override
    const result = await pool.query(`
      INSERT INTO user_feature_overrides (user_id, feature_code, access_type, expires_at, reason, granted_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, feature_code) 
      DO UPDATE SET 
        access_type = EXCLUDED.access_type,
        expires_at = EXCLUDED.expires_at,
        reason = EXCLUDED.reason,
        granted_by = EXCLUDED.granted_by,
        updated_at = NOW()
      RETURNING *
    `, [id, featureCode, accessType, expiresAt || null, reason || null, req.user.id]);

    res.json({
      success: true,
      message: `Feature ${accessType === 'grant' ? 'granted' : 'denied'}`,
      override: result.rows[0],
    });
  } catch (error) {
    console.error('Error setting feature override:', error);
    res.status(500).json({ error: 'Failed to set feature override' });
  }
});

/**
 * GET /api/admin/roles
 * Get all available roles and their permissions
 */
router.get('/roles', requireAdmin, async (req, res) => {
  const rolePermissions = {
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
    super_admin: ['* (all permissions)'],
  };

  res.json({
    success: true,
    roles: rolePermissions,
  });
});

/**
 * GET /api/admin/features
 * Get all features and their plan requirements
 */
router.get('/features', requireAdmin, async (req, res) => {
  const featureRequirements = {
    // Core features (all plans)
    notes: { plan: 'free', description: 'Notes & Tasks management' },
    'preset-browser': { plan: 'free', description: 'Browse synthesizer presets' },
    pwa: { plan: 'free', description: 'Progressive Web App support' },

    // Basic features
    synth2600: { plan: 'basic', description: 'Behringer 2600 Studio' },
    'midi-generator': { plan: 'basic', description: 'MIDI pattern generator' },
    'music-production': { plan: 'basic', description: 'Music production tools' },
    'offline-mode': { plan: 'basic', description: 'Offline functionality' },

    // Premium features
    collaboration: { plan: 'premium', description: 'Real-time collaboration' },
    'priority-support': { plan: 'premium', description: 'Priority customer support' },
    'advanced-export': { plan: 'premium', description: 'Export to FLAC, AIFF, stems' },
    'unlimited-tracks': { plan: 'premium', description: 'Unlimited track storage' },
    'unlimited-presets': { plan: 'premium', description: 'Unlimited preset storage' },

    // Pro features
    'api-access': { plan: 'pro', description: 'REST API access' },
    'custom-branding': { plan: 'pro', description: 'Custom branding options' },
    'white-label': { plan: 'pro', description: 'White-label deployment' },
    'team-management': { plan: 'pro', description: 'Team and user management' },

    // Enterprise features
    'dedicated-support': { plan: 'enterprise', description: '24/7 dedicated support' },
    sla: { plan: 'enterprise', description: 'Service Level Agreement' },
    'custom-integrations': { plan: 'enterprise', description: 'Custom API integrations' },
  };

  res.json({
    success: true,
    features: featureRequirements,
    planHierarchy: {
      free: 1,
      basic: 2,
      starter: 2,
      premium: 3,
      pro: 4,
      enterprise: 5,
    },
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatUserForAdmin(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    firstName: user.first_name,
    lastName: user.last_name,
    avatarUrl: user.avatar_url,
    ssoProvider: user.sso_provider,
    timezone: user.timezone,
    language: user.language,
    isActive: user.is_active,
    roles: user.roles || [],
    subscriptionPlan: user.subscription_plan || 'free',
    lastLoginAt: user.last_login_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

function formatPrice(amountInCents, currency = 'PLN') {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  }).format(amount);
}

module.exports = router;
