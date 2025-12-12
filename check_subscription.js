const { Pool } = require('./app/node_modules/pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSubscription() {
  try {
    console.log('🔍 Checking subscriptions in database...\n');
    
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
      LIMIT 5
    `);
    
    console.log('📋 User Subscriptions:');
    console.log('=====================');
    subs.rows.forEach(sub => {
      console.log(`\nUser: ${sub.user_name} (${sub.email})`);
      console.log(`Plan: ${sub.plan_name} (${sub.plan_code})`);
      console.log(`Status: ${sub.status}`);
      console.log(`Billing: ${sub.billing_cycle}`);
      console.log(`Started: ${sub.started_at}`);
      console.log(`Period ends: ${sub.current_period_end}`);
    });
    
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
      LIMIT 5
    `);
    
    console.log('\n\n💳 Recent Transactions:');
    console.log('=====================');
    trans.rows.forEach(t => {
      console.log(`\nUser: ${t.email}`);
      console.log(`Type: ${t.type}`);
      console.log(`Amount: ${(t.amount / 100).toFixed(2)} ${t.currency}`);
      console.log(`Provider: ${t.provider}`);
      console.log(`Status: ${t.status}`);
      console.log(`PayU Order ID: ${t.provider_transaction_id}`);
      console.log(`Created: ${t.created_at}`);
    });
    
    await pool.end();
    console.log('\n✅ Database check complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    await pool.end();
  }
}

checkSubscription();
