/**
 * Check if subscription tables exist in production database
 */

require('dotenv').config();
const pool = require('../config/database');

async function checkTables() {
  try {
    console.log('🔍 Checking subscription tables...\n');

    // Check subscription_plans
    const plans = await pool.query(`
      SELECT COUNT(*) as count FROM subscription_plans
    `);
    console.log(`✅ subscription_plans: ${plans.rows[0].count} plans`);

    // Check user_subscriptions
    const subs = await pool.query(`
      SELECT COUNT(*) as count FROM user_subscriptions
    `);
    console.log(`✅ user_subscriptions: ${subs.rows[0].count} subscriptions`);

    // Check payment_methods
    const payments = await pool.query(`
      SELECT COUNT(*) as count FROM payment_methods
    `);
    console.log(`✅ payment_methods: ${payments.rows[0].count} methods`);

    // Check transactions
    const trans = await pool.query(`
      SELECT COUNT(*) as count FROM transactions
    `);
    console.log(`✅ transactions: ${trans.rows[0].count} transactions`);

    // Show plans
    const plansList = await pool.query(`
      SELECT plan_code, name, price_monthly, price_yearly, is_active 
      FROM subscription_plans 
      ORDER BY sort_order
    `);
    console.log('\n📋 Available plans:');
    plansList.rows.forEach(plan => {
      const monthly = (plan.price_monthly / 100).toFixed(2);
      const yearly = (plan.price_yearly / 100).toFixed(2);
      console.log(`  - ${plan.plan_code}: ${plan.name} (${monthly} PLN/mo, ${yearly} PLN/yr) ${plan.is_active ? '✅' : '❌'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('\n⚠️  Tables do not exist. Run schema-subscriptions.sql to create them.');
    }
    
    process.exit(1);
  }
}

checkTables();
