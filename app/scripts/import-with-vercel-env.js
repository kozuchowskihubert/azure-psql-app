/**
 * Test production database connection and import schema
 * Uses Vercel's DATABASE_URL
 */

const { spawn } = require('child_process');
const path = require('path');

async function importToProduction() {
  console.log('📥 Fetching DATABASE_URL from Vercel...\n');
  
  // Pull env vars from Vercel
  const pullEnv = spawn('vercel', ['env', 'pull', '--yes', '.env.vercel.prod'], {
    cwd: path.join(__dirname, '../..'),
    env: { ...process.env, VERCEL_ORG_ID: '', VERCEL_PROJECT_ID: '' }
  });

  pullEnv.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  pullEnv.on('close', async (code) => {
    if (code !== 0) {
      console.error('❌ Failed to pull env vars');
      process.exit(1);
    }

    // Now run the import with the pulled env
    require('dotenv').config({ path: path.join(__dirname, '../..', '.env.vercel.prod') });
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in pulled env');
      process.exit(1);
    }

    console.log('✅ Got DATABASE_URL\n');
    
    // Import schema
    const { Client } = require('pg');
    const fs = require('fs');
    
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    try {
      console.log('🔗 Connecting to production database...');
      await client.connect();
      console.log('✅ Connected!\n');

      // Read and execute schema
      const schemaPath = path.join(__dirname, '../../infra/schema-subscriptions.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');

      console.log('📥 Importing schema...\n');
      await client.query(schema);

      console.log('✅ Schema imported!\n');

      // Verify
      const plans = await client.query(`
        SELECT plan_code, name, price_monthly, price_yearly
        FROM subscription_plans
        ORDER BY sort_order
      `);

      console.log('💰 Plans in database:');
      plans.rows.forEach(plan => {
        console.log(`   ✓ ${plan.plan_code}: ${plan.name} (${(plan.price_monthly/100).toFixed(2)} PLN/mo)`);
      });

      console.log('\n🎉 Done!');
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Tables already exist!\n');
        
        const plans = await client.query(`
          SELECT plan_code, name FROM subscription_plans ORDER BY sort_order
        `);
        
        console.log('Existing plans:');
        plans.rows.forEach(p => console.log(`   ✓ ${p.plan_code}: ${p.name}`));
      } else {
        console.error('❌ Error:', error.message);
        process.exit(1);
      }
    } finally {
      await client.end();
    }
  });
}

importToProduction();
