/**
 * Manual Subscription Activation Script
 * Use this to manually activate a subscription for a user
 * 
 * Usage: node activate-subscription.js <userId> <planCode>
 * Example: node activate-subscription.js 123 premium
 */
require('dotenv').config();

const pool = require('./config/database');
const Subscription = require('./models/subscription');

async function activateSubscription(userId, planCode = 'premium') {
  console.log('🔍 Manual Subscription Activation\n');
  console.log(`User ID: ${userId}`);
  console.log(`Plan: ${planCode}`);
  
  try {
    // Check current subscription status
    const current = await Subscription.getUserSubscription(userId);
    if (current) {
      console.log(`\n⚠️  User already has an active subscription:`);
      console.log(`   Plan: ${current.plan_name} (${current.plan_code})`);
      console.log(`   Status: ${current.status}`);
      console.log(`   Expires: ${current.current_period_end}`);
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      return new Promise((resolve) => {
        rl.question('\nDo you want to replace it? (y/n): ', async (answer) => {
          rl.close();
          if (answer.toLowerCase() === 'y') {
            await createSub(userId, planCode);
          }
          resolve();
        });
      });
    } else {
      await createSub(userId, planCode);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

async function createSub(userId, planCode) {
  console.log(`\n📝 Creating ${planCode} subscription...`);
  
  const subscription = await Subscription.createSubscription(userId, planCode, 'monthly');
  
  console.log('\n✅ Subscription activated successfully!');
  console.log(`   ID: ${subscription.id}`);
  console.log(`   Status: ${subscription.status}`);
  console.log(`   Expires: ${subscription.current_period_end}`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const userId = args[0];
const planCode = args[1] || 'premium';

if (!userId) {
  console.log('Usage: node activate-subscription.js <userId> [planCode]');
  console.log('');
  console.log('Arguments:');
  console.log('  userId   - The user ID to activate subscription for');
  console.log('  planCode - Plan code (default: premium). Options: free, basic, premium');
  console.log('');
  console.log('Examples:');
  console.log('  node activate-subscription.js 123');
  console.log('  node activate-subscription.js 123 premium');
  console.log('  node activate-subscription.js abc-uuid-123 basic');
  process.exit(1);
}

activateSubscription(userId, planCode);
