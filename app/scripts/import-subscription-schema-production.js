#!/usr/bin/env node
/**
 * Import subscription schema to production database
 * Uses DATABASE_URL from Vercel environment
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function importSchema() {
  // Get DATABASE_URL from Vercel
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not set. Run: vercel env pull');
    process.exit(1);
  }

  console.log('🔗 Connecting to production database...');
  console.log(`   ${DATABASE_URL.replace(/:[^:@]+@/, ':***@')}\n`);

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read schema file
    const schemaPath = path.join(__dirname, '../../infra/schema-subscriptions.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📥 Importing schema-subscriptions.sql...\n');

    // Execute schema
    await client.query(schema);

    console.log('✅ Schema imported successfully\n');

    // Verify tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE '%subscription%'
        OR table_name IN ('payment_methods', 'transactions')
      ORDER BY table_name
    `);

    console.log('📋 Created tables:');
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Show plans
    const plans = await client.query(`
      SELECT plan_code, name, price_monthly, price_yearly
      FROM subscription_plans
      ORDER BY sort_order
    `);

    console.log('\n💰 Subscription plans:');
    plans.rows.forEach(plan => {
      const monthly = (plan.price_monthly / 100).toFixed(2);
      const yearly = (plan.price_yearly / 100).toFixed(2);
      console.log(`   - ${plan.plan_code}: ${plan.name} (${monthly} PLN/mo, ${yearly} PLN/yr)`);
    });

    console.log('\n🎉 Production database ready for subscriptions!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

importSchema();
