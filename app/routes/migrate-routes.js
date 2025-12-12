/**
 * Migration endpoint - import subscription schema to production
 * SECURITY: Should be protected or removed after use!
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

router.post('/migrate-subscriptions', async (req, res) => {
  const { secret } = req.body;
  
  // Simple security - require secret in body
  if (secret !== 'haos-migrate-2025') {
    return res.status(401).json({
      error: 'Unauthorized',
      hint: 'Provide correct secret in body'
    });
  }

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, '../../infra/schema-subscriptions.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 Migrating subscription schema to production...');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Schema migrated!');

    // Verify tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND (table_name LIKE '%subscription%' OR table_name IN ('payment_methods', 'transactions'))
      ORDER BY table_name
    `);

    // Get plans
    const plans = await pool.query(`
      SELECT plan_code, name, price_monthly, price_yearly, is_active
      FROM subscription_plans
      ORDER BY sort_order
    `);

    res.json({
      success: true,
      message: 'Subscription schema migrated successfully!',
      tables: tables.rows.map(r => r.table_name),
      plans: plans.rows.map(p => ({
        code: p.plan_code,
        name: p.name,
        monthly: p.price_monthly / 100,
        yearly: p.price_yearly / 100,
        active: p.is_active
      })),
      note: 'You can now use /api/subscriptions/* endpoints'
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    // Check if tables already exist
    if (error.message.includes('already exists')) {
      return res.json({
        success: true,
        message: 'Tables already exist - no migration needed',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
      hint: 'Check logs for details'
    });
  }
});

module.exports = router;
