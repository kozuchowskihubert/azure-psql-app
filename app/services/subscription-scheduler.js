/**
 * Subscription Scheduler Service
 * Handles automated subscription tasks:
 * - Expiry reminders (3 days before)
 * - Expired subscription notifications
 * - Subscription validity checks
 */

const { Pool } = require('pg');
const emailService = require('./email-service');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

class SubscriptionScheduler {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.checkIntervalMs = 60 * 60 * 1000; // Check every hour
  }

  /**
   * Start the subscription scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Subscription scheduler already running');
      return;
    }

    console.log('🔄 Starting subscription scheduler...');
    this.isRunning = true;

    // Run immediately on start
    this.runChecks();

    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.runChecks();
    }, this.checkIntervalMs);

    console.log(`✓ Subscription scheduler started (checking every ${this.checkIntervalMs / 1000 / 60} minutes)`);
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️  Subscription scheduler stopped');
  }

  /**
   * Run all subscription checks
   */
  async runChecks() {
    console.log(`\n🔍 [${new Date().toISOString()}] Running subscription checks...`);
    
    try {
      await this.sendExpiryReminders();
      await this.processExpiredSubscriptions();
      console.log('✓ Subscription checks completed\n');
    } catch (error) {
      console.error('❌ Subscription check error:', error.message);
    }
  }

  /**
   * Send reminder emails for subscriptions expiring in 3 days
   */
  async sendExpiryReminders() {
    try {
      // Find subscriptions expiring in 2-4 days (to catch the 3-day window)
      const result = await pool.query(`
        SELECT 
          us.id,
          us.user_id,
          us.current_period_end,
          us.reminder_sent_at,
          u.email,
          COALESCE(u.display_name, 'User') as username,
          sp.name as plan_name,
          sp.plan_code as plan_code
        FROM user_subscriptions us
        JOIN users u ON us.user_id = u.id
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.status = 'active'
          AND us.current_period_end BETWEEN NOW() + INTERVAL '2 days' AND NOW() + INTERVAL '4 days'
          AND (us.reminder_sent_at IS NULL OR us.reminder_sent_at < NOW() - INTERVAL '7 days')
          AND sp.plan_code != 'free'
      `);

      if (result.rows.length === 0) {
        console.log('   No expiry reminders to send');
        return;
      }

      console.log(`   Found ${result.rows.length} subscriptions expiring soon`);

      for (const sub of result.rows) {
        try {
          const renewUrl = `${process.env.APP_URL || 'https://haos.fm'}/subscription/renew`;
          
          await emailService.sendSubscriptionExpiryReminder(
            sub.email,
            sub.username,
            sub.plan_name,
            sub.current_period_end,
            renewUrl
          );

          // Mark reminder as sent
          await pool.query(`
            UPDATE user_subscriptions 
            SET reminder_sent_at = NOW() 
            WHERE id = $1
          `, [sub.id]);

          console.log(`   ✉️  Sent expiry reminder to ${sub.email} (expires: ${sub.current_period_end})`);
        } catch (emailError) {
          console.error(`   ❌ Failed to send reminder to ${sub.email}:`, emailError.message);
        }
      }
    } catch (error) {
      console.error('   ❌ Error checking expiry reminders:', error.message);
    }
  }

  /**
   * Process expired subscriptions - downgrade to free and notify
   */
  async processExpiredSubscriptions() {
    try {
      // Find expired subscriptions that haven't been processed
      const result = await pool.query(`
        SELECT 
          us.id,
          us.user_id,
          us.current_period_end,
          u.email,
          COALESCE(u.display_name, 'User') as username,
          sp.name as plan_name,
          sp.plan_code as plan_code
        FROM user_subscriptions us
        JOIN users u ON us.user_id = u.id
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.status = 'active'
          AND us.current_period_end < NOW()
          AND sp.plan_code != 'free'
      `);

      if (result.rows.length === 0) {
        console.log('   No expired subscriptions to process');
        return;
      }

      console.log(`   Found ${result.rows.length} expired subscriptions`);

      // Get free plan ID
      const freePlanResult = await pool.query(`
        SELECT id FROM subscription_plans WHERE plan_code = 'free' LIMIT 1
      `);
      const freePlanId = freePlanResult.rows[0]?.id;

      if (!freePlanId) {
        console.error('   ❌ Free plan not found in database');
        return;
      }

      for (const sub of result.rows) {
        try {
          // Downgrade to free plan
          await pool.query(`
            UPDATE user_subscriptions 
            SET status = 'expired',
                expired_at = NOW()
            WHERE id = $1
          `, [sub.id]);

          // Create new free subscription
          await pool.query(`
            INSERT INTO user_subscriptions (
              user_id, plan_id, status, billing_cycle,
              current_period_start, current_period_end
            ) VALUES ($1, $2, 'active', 'monthly', NOW(), NOW() + INTERVAL '100 years')
            ON CONFLICT (user_id) WHERE status = 'active' DO NOTHING
          `, [sub.user_id, freePlanId]);

          // Send expired notification
          const renewUrl = `${process.env.APP_URL || 'https://haos.fm'}/subscription`;
          await emailService.sendSubscriptionExpired(
            sub.email,
            sub.username,
            sub.plan_name,
            renewUrl
          );

          console.log(`   📭 Expired: ${sub.email} (${sub.plan_name} -> Free)`);
        } catch (processError) {
          console.error(`   ❌ Failed to process expired sub for ${sub.email}:`, processError.message);
        }
      }
    } catch (error) {
      console.error('   ❌ Error processing expired subscriptions:', error.message);
    }
  }

  /**
   * Get subscription statistics
   */
  async getStats() {
    try {
      const result = await pool.query(`
        SELECT 
          sp.name as plan_name,
          us.status,
          COUNT(*) as count
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        GROUP BY sp.name, us.status
        ORDER BY sp.name, us.status
      `);

      const expiringResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.status = 'active'
          AND us.current_period_end BETWEEN NOW() AND NOW() + INTERVAL '7 days'
          AND sp.code != 'free'
      `);

      return {
        subscriptions: result.rows,
        expiringSoon: parseInt(expiringResult.rows[0]?.count || 0)
      };
    } catch (error) {
      console.error('Error getting subscription stats:', error.message);
      return { subscriptions: [], expiringSoon: 0 };
    }
  }

  /**
   * Manually trigger a check (for testing)
   */
  async triggerCheck() {
    console.log('🔧 Manual subscription check triggered');
    await this.runChecks();
  }
}

// Export singleton instance
const subscriptionScheduler = new SubscriptionScheduler();
module.exports = subscriptionScheduler;
