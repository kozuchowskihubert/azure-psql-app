/**
 * PayU Subscription Simulation Test
 * 
 * This script simulates the complete payment flow:
 * 1. Creates a PayU order for user ID 3
 * 2. Opens the payment page
 * 3. After payment, webhook triggers subscription activation
 * 4. Email confirmation is sent
 * 
 * Run: node test-subscription-flow.js
 */

require('dotenv').config();

const payuService = require('./services/payu-service');
const emailService = require('./services/email-service');
const emailTemplateService = require('./services/email-template-service');

async function simulateSubscriptionFlow() {
  console.log('🧪 PayU Subscription Flow Simulation\n');
  console.log('=' .repeat(50));
  
  // Test user data (your account)
  const testUser = {
    id: '3',
    email: 'hubertkozuchowski@gmail.com',
    name: 'Hubert'
  };
  
  const planCode = 'premium';
  const planName = 'Premium';
  const amount = 1.00; // 1 PLN for testing
  const currency = 'PLN';
  
  console.log('\n📋 Test Configuration:');
  console.log(`   User ID: ${testUser.id}`);
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Plan: ${planName}`);
  console.log(`   Amount: ${amount} ${currency}`);
  
  // Step 1: Authenticate with PayU
  console.log('\n📡 Step 1: PayU Authentication...');
  try {
    await payuService.authenticate();
    console.log('   ✅ Authenticated with PayU');
  } catch (error) {
    console.error('   ❌ Auth failed:', error.message);
    return;
  }
  
  // Step 2: Create PayU Order
  console.log('\n💳 Step 2: Creating PayU Order...');
  try {
    const orderData = {
      userId: testUser.id,
      planCode: planCode,
      amount: amount,
      email: testUser.email,
      firstName: testUser.name,
      lastName: 'Kozuchowski',
      customerIp: '127.0.0.1',
      description: `HAOS.fm ${planName} Subscription - Test`
    };
    
    const order = await payuService.createOrder(orderData);
    
    console.log('   ✅ Order Created!');
    console.log(`   📋 Order ID: ${order.orderId}`);
    console.log(`   📋 ExtOrderId: ${order.extOrderId}`);
    console.log(`   📋 Status: ${order.status}`);
    console.log('\n   🔗 Payment URL:');
    console.log(`   ${order.redirectUri}`);
    
    // Step 3: Test Email Service
    console.log('\n📧 Step 3: Testing Email Service...');
    await emailService.initialize();
    
    // Test with template service
    console.log('   Testing template service...');
    const { subject, html } = emailTemplateService.buildEmail('subscriptionConfirmation', {
      name: testUser.name,
      planName: planName,
      amount: amount.toFixed(2),
      currency: currency,
      activationDate: new Date().toLocaleDateString('pl-PL', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      accountUrl: 'https://haos.fm/account'
    }, 'en');
    
    console.log(`   📋 Email Subject: ${subject}`);
    console.log('   ✅ Template rendered successfully');
    
    // Actually send the email
    console.log('\n📤 Step 4: Sending Test Email...');
    const emailResult = await emailService.sendEmail({
      to: testUser.email,
      subject: `🧪 TEST: ${subject}`,
      html: html
    });
    
    if (emailResult.success) {
      console.log(`   ✅ Email sent to ${testUser.email}`);
      if (emailResult.devMode) {
        console.log('   ⚠️  (DEV MODE - email not actually sent)');
      }
    } else {
      console.log(`   ❌ Email failed: ${emailResult.error}`);
    }
    
    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 SIMULATION COMPLETE');
    console.log('=' .repeat(50));
    console.log('\n🎯 Next Steps:');
    console.log('   1. Open the payment URL above in your browser');
    console.log('   2. Complete the payment (test card: 4444 3333 2222 1111)');
    console.log('   3. PayU will send webhook to https://haos.fm/api/payments/webhooks/payu');
    console.log('   4. Subscription will be activated');
    console.log('   5. Confirmation email will be sent');
    console.log('\n✨ Check your email for the test confirmation!');
    
  } catch (error) {
    console.error('   ❌ Order creation failed:', error.message);
  }
}

// Run simulation
simulateSubscriptionFlow().catch(console.error);
