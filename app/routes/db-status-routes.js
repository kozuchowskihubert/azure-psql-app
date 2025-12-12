/**
 * Check production database for subscription tables
 * Returns JSON even if tables don't exist
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/db-status', async (req, res) => {
  try {
    // Try to query subscription tables
    let tables = [];
    let plans = [];
    let error = null;

    try {
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('subscription_plans', 'user_subscriptions')
        ORDER BY table_name
      `);
      tables = tablesResult.rows.map(r => r.table_name);

      if (tables.includes('subscription_plans')) {
        const plansResult = await pool.query(`
          SELECT plan_code, name, is_active
          FROM subscription_plans
          ORDER BY sort_order
          LIMIT 5
        `);
        plans = plansResult.rows;
      }
    } catch (dbError) {
      error = dbError.message;
    }

    res.json({
      success: true,
      database: 'connected',
      tables: tables,
      tablesCount: tables.length,
      plans: plans,
      plansCount: plans.length,
      error: error,
      needsImport: tables.length === 0,
      message: tables.length === 0 
        ? 'Database connected but subscription tables do not exist. Need to import schema.'
        : `Found ${tables.length} tables with ${plans.length} plans`
    });

  } catch (error) {
    res.json({
      success: false,
      database: 'error',
      error: error.message,
      message: 'Failed to connect to database'
    });
  }
});

module.exports = router;
