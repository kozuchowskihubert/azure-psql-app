#!/usr/bin/env node
/**
 * Import subscription schema to production
 * Connects directly using hardcoded Neon connection string
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function importSchema() {
  // Neon production database
  const connectionString = 'postgresql://neondb_owner:npg_JKFCDvSwJRqo@ep-falling-sky-a987wh02-pooler.gwc.azure.neon.tech/neondb?sslmode=require';
  
  console.log('🔗 Connecting to production database...');
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected!\n');

    // Read schema
    const schemaPath = path.join(__dirname, '../../infra/schema-subscriptions.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📥 Importing schema-subscriptions.sql...\n');

    // Execute schema
    await client.query(schema);

    console.log('✅ Schema imported!\n');

    // Verify tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND (table_name LIKE '%subscription%' OR table_name IN ('payment_methods', 'transactions'))
      ORDER BY table_name
    `);

    console.log('📋 Created tables:');
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Show plans
    const plans = await client.query(`
      SELECT plan_code, name, price_monthly, price_yearly, is_active
      FROM subscription_plans
      ORDER BY sort_order
    `);

    console.log('\n💰 Subscription plans:');
    plans.rows.forEach(plan => {
      const monthly = (plan.price_monthly / 100).toFixed(2);
      const yearly = (plan.price_yearly / 100).toFixed(2);
      const status = plan.is_active ? '✅' : '❌';
      console.log(`   ${status} ${plan.plan_code}: ${plan.name} (${monthly} PLN/mo, ${yearly} PLN/yr)`);
    });

    // Count subscriptions
    const subsCount = await client.query('SELECT COUNT(*) as count FROM user_subscriptions');
    console.log(`\n📊 Active subscriptions: ${subsCount.rows[0].count}`);

    console.log('\n🎉 Production database ready for subscriptions!');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Tables already exist. Checking current state...\n');
      
      try {
        const plans = await client.query(`
          SELECT plan_code, name, price_monthly, price_yearly
          FROM subscription_plans
          ORDER BY sort_order
        `);
        
        console.log('💰 Existing plans:');
        plans.rows.forEach(plan => {
          const monthly = (plan.price_monthly / 100).toFixed(2);
          const yearly = (plan.price_yearly / 100).toFixed(2);
          console.log(`   ✓ ${plan.plan_code}: ${plan.name} (${monthly} PLN/mo, ${yearly} PLN/yr)`);
        });
        
        console.log('\n✅ Database already configured!');
      } catch (checkError) {
        console.error('❌ Error checking tables:', checkError.message);
      }
    } else {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

importSchema();
