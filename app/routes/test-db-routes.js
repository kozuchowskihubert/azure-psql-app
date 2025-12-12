/**
 * Test endpoint to check production database tables
 * Add this temporarily to test if subscription tables exist
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/test/db-check', async (req, res) => {
  try {
    // Check if subscription_plans table exists
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('subscription_plans', 'user_subscriptions', 'payment_methods', 'transactions')
      ORDER BY table_name
    `);

    const existingTables = tablesCheck.rows.map(r => r.table_name);

    let plans = [];
    if (existingTables.includes('subscription_plans')) {
      const plansResult = await pool.query(`
        SELECT plan_code, name, price_monthly, price_yearly, is_active
        FROM subscription_plans
        ORDER BY sort_order
      `);
      plans = plansResult.rows;
    }

    res.json({
      success: true,
      tables: existingTables,
      tablesExist: existingTables.length > 0,
      plans: plans.map(p => ({
        code: p.plan_code,
        name: p.name,
        monthly: p.price_monthly / 100,
        yearly: p.price_yearly / 100,
        active: p.is_active
      })),
      message: existingTables.length === 0 
        ? 'Subscription tables do not exist - need to import schema'
        : `Found ${existingTables.length} tables and ${plans.length} plans`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      hint: 'Database might not have subscription tables'
    });
  }
});

module.exports = router;
