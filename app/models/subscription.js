/**
 * Subscription Model
 * Handles subscription plans, user subscriptions, and feature access
 */
const pool = require('../config/database');

class Subscription {
  /**
   * Get all available subscription plans
   */
  static async getPlans() {
    const result = await pool.query(`
      SELECT 
        id,
        plan_code,
        name,
        description,
        price_monthly,
        price_yearly,
        currency,
        features,
        is_active,
        is_featured,
        trial_days,
        sort_order
      FROM subscription_plans
      WHERE is_active = TRUE
      ORDER BY sort_order ASC
    `);
    return result.rows;
  }

  /**
   * Get a specific plan by code
   */
  static async getPlanByCode(planCode) {
    const result = await pool.query(
      'SELECT * FROM subscription_plans WHERE plan_code = $1',
      [planCode],
    );
    return result.rows[0];
  }

  /**
   * Get user's current subscription
   */
  static async getUserSubscription(userId) {
    const result = await pool.query(`
      SELECT 
        us.*,
        sp.plan_code,
        sp.name as plan_name,
        sp.features,
        sp.price_monthly,
        sp.price_yearly,
        sp.currency,
        sp.description
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1
      AND us.status IN ('active', 'trialing', 'past_due')
      ORDER BY us.created_at DESC
      LIMIT 1
    `, [userId]);
    return result.rows[0];
  }

  /**
   * Create a new subscription for a user
   */
  static async createSubscription(userId, planCode, billingCycle = 'monthly', options = {}) {
    const plan = await this.getPlanByCode(planCode);
    if (!plan) {
      throw new Error(`Plan ${planCode} not found`);
    }

    // Cancel any existing subscription
    await pool.query(`
      UPDATE user_subscriptions 
      SET status = 'cancelled', cancelled_at = NOW()
      WHERE user_id = $1 AND status IN ('active', 'trialing')
    `, [userId]);

    // Calculate period end
    const periodEnd = billingCycle === 'yearly'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Calculate trial end if applicable
    const trialEnd = plan.trial_days > 0
      ? new Date(Date.now() + plan.trial_days * 24 * 60 * 60 * 1000)
      : null;

    await pool.query(`
      INSERT INTO user_subscriptions (
        user_id, plan_id, status, billing_cycle,
        current_period_start, current_period_end, trial_ends_at,
        stripe_subscription_id, paypal_subscription_id
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8)
    `, [
      userId,
      plan.id,
      trialEnd ? 'trialing' : 'active',
      billingCycle,
      periodEnd,
      trialEnd,
      options.stripeSubscriptionId || null,
      options.paypalSubscriptionId || null,
    ]);

    // Fetch and return the newly created subscription with full plan details
    return this.getUserSubscription(userId);
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(userId, immediate = false, reason = null) {
    if (immediate) {
      const result = await pool.query(`
        UPDATE user_subscriptions 
        SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = $2
        WHERE user_id = $1 AND status IN ('active', 'trialing')
        RETURNING *
      `, [userId, reason]);
      return result.rows[0];
    }
    // Cancel at end of period
    const result = await pool.query(`
      UPDATE user_subscriptions 
      SET cancel_at_period_end = TRUE, cancellation_reason = $2
      WHERE user_id = $1 AND status IN ('active', 'trialing')
      RETURNING *
    `, [userId, reason]);
    return result.rows[0];
  }

  /**
   * Resume a cancelled subscription
   */
  static async resumeSubscription(userId) {
    const result = await pool.query(`
      UPDATE user_subscriptions 
      SET cancel_at_period_end = FALSE, cancellation_reason = NULL
      WHERE user_id = $1 AND status = 'active' AND cancel_at_period_end = TRUE
      RETURNING *
    `, [userId]);
    return result.rows[0];
  }

  /**
   * Change subscription plan
   */
  static async changePlan(userId, newPlanCode, immediate = true) {
    const newPlan = await this.getPlanByCode(newPlanCode);
    if (!newPlan) {
      throw new Error(`Plan ${newPlanCode} not found`);
    }

    const currentSub = await this.getUserSubscription(userId);
    if (!currentSub) {
      // No current subscription, create new one
      return this.createSubscription(userId, newPlanCode);
    }

    if (immediate) {
      await pool.query(`
        UPDATE user_subscriptions 
        SET plan_id = $2, updated_at = NOW()
        WHERE id = $1
      `, [currentSub.id, newPlan.id]);
      
      // Fetch and return the updated subscription with full plan details
      return this.getUserSubscription(userId);
    }

    return currentSub;
  }

  /**
   * Check if user has access to a feature
   */
  static async hasFeature(userId, featureCode) {
    const result = await pool.query(
      'SELECT user_has_feature($1, $2) as has_access',
      [userId, featureCode],
    );
    return result.rows[0]?.has_access || false;
  }

  /**
   * Get all features available to a user
   */
  static async getUserFeatures(userId) {
    const subscription = await this.getUserSubscription(userId);
    const features = subscription?.features || {};

    // Get all feature flags
    const flagsResult = await pool.query(`
      SELECT ff.*, 
        (SELECT override_type FROM user_feature_overrides ufo 
         WHERE ufo.user_id = $1 AND ufo.feature_id = ff.id 
         AND (ufo.expires_at IS NULL OR ufo.expires_at > NOW())
        ) as user_override
      FROM feature_flags ff
      WHERE ff.is_enabled = TRUE
    `, [userId]);

    const planCode = subscription?.plan_code || 'free';
    const planOrder = {
      free: 1, basic: 2, premium: 3, pro: 4,
    };
    const userPlanOrder = planOrder[planCode] || 1;

    return flagsResult.rows.map((flag) => {
      const minPlanOrder = planOrder[flag.minimum_plan_code] || 1;
      let hasAccess = userPlanOrder >= minPlanOrder;

      // Apply overrides
      if (flag.user_override === 'grant') hasAccess = true;
      if (flag.user_override === 'deny') hasAccess = false;

      return {
        code: flag.feature_code,
        name: flag.name,
        description: flag.description,
        hasAccess,
        isBeta: flag.is_beta,
        minimumPlan: flag.minimum_plan_code,
      };
    });
  }

  /**
   * Process expired subscriptions
   */
  static async processExpiredSubscriptions() {
    // Mark expired subscriptions
    await pool.query(`
      UPDATE user_subscriptions 
      SET status = 'expired'
      WHERE status = 'active' 
      AND current_period_end < NOW()
    `);

    // Cancel subscriptions marked for cancellation at period end
    await pool.query(`
      UPDATE user_subscriptions 
      SET status = 'cancelled', cancelled_at = NOW()
      WHERE status = 'active' 
      AND cancel_at_period_end = TRUE 
      AND current_period_end < NOW()
    `);

    // End trials
    await pool.query(`
      UPDATE user_subscriptions 
      SET status = 'expired'
      WHERE status = 'trialing' 
      AND trial_ends_at < NOW()
    `);
  }

  /**
   * Check if user has a feature override
   */
  static async checkFeatureOverride(userId, featureCode) {
    const result = await pool.query(`
      SELECT access_type 
      FROM user_feature_overrides
      WHERE user_id = $1 
      AND feature_code = $2
      AND (expires_at IS NULL OR expires_at > NOW())
    `, [userId, featureCode]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].access_type === 'grant';
  }

  /**
   * Get all feature overrides for a user
   */
  static async getUserFeatureOverrides(userId) {
    const result = await pool.query(`
      SELECT feature_code, access_type, expires_at, reason
      FROM user_feature_overrides
      WHERE user_id = $1
      AND (expires_at IS NULL OR expires_at > NOW())
    `, [userId]);

    return result.rows;
  }

  /**
   * Update subscription status
   */
  static async updateStatus(userId, status) {
    const result = await pool.query(`
      UPDATE user_subscriptions 
      SET status = $2, updated_at = NOW()
      WHERE user_id = $1 AND status IN ('active', 'trialing', 'past_due')
      RETURNING *
    `, [userId, status]);
    return result.rows[0];
  }
}

module.exports = Subscription;
