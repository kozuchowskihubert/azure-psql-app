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
    console.log('🔄 Migrating subscription schema to production...');

    // Execute schema (inline to avoid file system issues on Vercel)
    // Create subscription_plans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        plan_code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price_monthly INTEGER NOT NULL DEFAULT 0,
        price_yearly INTEGER NOT NULL DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'PLN',
        features JSONB DEFAULT '{}'::JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        trial_days INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Insert default plans
    await pool.query(`
      INSERT INTO subscription_plans (plan_code, name, description, price_monthly, price_yearly, currency, features, is_featured, trial_days, sort_order) 
      VALUES 
        ('free', 'Free', 'Perfect for getting started with HAOS.fm', 0, 0, 'PLN', 
         '{"max_tracks": 3, "max_presets": 10, "export_formats": ["mp3"], "cloud_storage_mb": 100}'::JSONB,
         false, 0, 1),
        ('basic', 'Basic', 'For hobbyist producers and musicians', 1999, 19990, 'PLN',
         '{"max_tracks": 25, "max_presets": 100, "export_formats": ["mp3", "wav"], "cloud_storage_mb": 2000}'::JSONB,
         false, 7, 2),
        ('premium', 'Premium', 'For serious producers who need more power', 4999, 49990, 'PLN',
         '{"max_tracks": -1, "max_presets": -1, "export_formats": ["mp3", "wav", "flac", "ogg"], "cloud_storage_mb": 10000}'::JSONB,
         true, 14, 3),
        ('pro', 'Pro Studio', 'For professional studios and labels', 9999, 99990, 'PLN',
         '{"max_tracks": -1, "max_presets": -1, "export_formats": ["mp3", "wav", "flac", "ogg", "aiff", "stems"], "cloud_storage_mb": -1}'::JSONB,
         false, 30, 4)
      ON CONFLICT (plan_code) DO NOTHING
    `);

    // Create user_subscriptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
        status VARCHAR(50) DEFAULT 'active',
        billing_cycle VARCHAR(20) DEFAULT 'monthly',
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        current_period_end TIMESTAMP WITH TIME ZONE,
        trial_ends_at TIMESTAMP WITH TIME ZONE,
        cancelled_at TIMESTAMP WITH TIME ZONE,
        cancel_at_period_end BOOLEAN DEFAULT FALSE,
        cancellation_reason TEXT,
        stripe_subscription_id VARCHAR(255),
        paypal_subscription_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_active_subscription UNIQUE (user_id)
      )
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end)`);

    // Create payment_methods table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        provider_payment_method_id VARCHAR(255),
        card_brand VARCHAR(50),
        card_last_four VARCHAR(4),
        card_exp_month INTEGER,
        card_exp_year INTEGER,
        paypal_email VARCHAR(255),
        blik_phone_last_four VARCHAR(4),
        is_default BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        billing_name VARCHAR(255),
        billing_address JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id)`);

    // Create transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subscription_id INTEGER REFERENCES user_subscriptions(id) ON DELETE SET NULL,
        payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        amount INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'PLN',
        tax_amount INTEGER DEFAULT 0,
        tax_rate DECIMAL(5,2) DEFAULT 23.00,
        provider VARCHAR(50),
        provider_transaction_id VARCHAR(255),
        provider_response JSONB,
        description TEXT,
        metadata JSONB DEFAULT '{}'::JSONB,
        failure_code VARCHAR(100),
        failure_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_provider ON transactions(provider, provider_transaction_id)`);

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

// Fix transactions table - add missing columns
router.post('/fix-transactions', async (req, res) => {
  const { secret } = req.body;
  
  if (secret !== 'haos-migrate-2025') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🔄 Adding missing columns to transactions table...');

    // Add missing columns if they don't exist
    await pool.query(`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS subscription_id INTEGER REFERENCES user_subscriptions(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS tax_amount INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 23.00,
      ADD COLUMN IF NOT EXISTS provider_response JSONB
    `);

    console.log('✅ Transactions table updated!');

    res.json({
      success: true,
      message: 'Transactions table structure updated successfully'
    });
  } catch (error) {
    console.error('❌ Fix failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test PayU configuration
router.get('/test-payu', async (req, res) => {
  try {
    const PaymentService = require('../services/payment-service');
    
    const payuAvailable = PaymentService.isProviderAvailable('payu');
    const availableProviders = PaymentService.getAvailableProviders();
    
    res.json({
      success: true,
      payuAvailable: payuAvailable,
      availableProviders: availableProviders,
      envVars: {
        PAYU_POS_ID: !!process.env.PAYU_POS_ID,
        PAYU_CLIENT_ID: !!process.env.PAYU_CLIENT_ID,
        PAYU_CLIENT_SECRET: !!process.env.PAYU_CLIENT_SECRET,
        PAYU_MD5_KEY: !!process.env.PAYU_MD5_KEY,
        PAYU_MODE: process.env.PAYU_MODE || 'not set'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Test PayU order creation
router.post('/test-payu-order', async (req, res) => {
  const { secret } = req.body;
  
  if (secret !== 'haos-migrate-2025') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const PaymentService = require('../services/payment-service');
    
    console.log('🧪 Testing PayU order creation...');
    
    const testOrder = await PaymentService.createPayUOrder({
      userId: 1, // Test user ID
      planCode: 'basic',
      amount: 19.99,
      email: 'test@haos.fm',
      firstName: 'Test',
      lastName: 'User',
      customerIp: '127.0.0.1',
      description: 'Test HAOS.fm Basic Subscription'
    });
    
    console.log('✅ PayU order created:', testOrder);
    
    res.json({
      success: true,
      order: testOrder
    });
  } catch (error) {
    console.error('❌ PayU order creation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Check database subscriptions and transactions
router.post('/check-subscriptions', async (req, res) => {
  const { secret } = req.body;
  
  if (secret !== 'haos-migrate-2025') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🔍 Checking database subscriptions...');
    
    // Check user subscriptions
    const subs = await pool.query(`
      SELECT 
        us.id, us.user_id, us.status, us.billing_cycle,
        us.started_at, us.current_period_end,
        sp.plan_code, sp.name as plan_name, sp.price_monthly, sp.price_yearly,
        u.email, u.name as user_name
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      JOIN users u ON us.user_id = u.id
      ORDER BY us.started_at DESC
      LIMIT 10
    `);
    
    // Check transactions
    const trans = await pool.query(`
      SELECT 
        t.id, t.user_id, t.type, t.status, 
        t.amount, t.currency, t.provider,
        t.provider_transaction_id, t.created_at,
        u.email
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      subscriptions: subs.rows.map(sub => ({
        user: `${sub.user_name} (${sub.email})`,
        plan: `${sub.plan_name} (${sub.plan_code})`,
        status: sub.status,
        billing_cycle: sub.billing_cycle,
        started_at: sub.started_at,
        period_end: sub.current_period_end
      })),
      transactions: trans.rows.map(t => ({
        user: t.email,
        type: t.type,
        amount: `${(t.amount / 100).toFixed(2)} ${t.currency}`,
        provider: t.provider,
        status: t.status,
        payu_order_id: t.provider_transaction_id,
        created_at: t.created_at
      })),
      total_subscriptions: subs.rows.length,
      total_transactions: trans.rows.length
    });
  } catch (error) {
    console.error('❌ Database check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
