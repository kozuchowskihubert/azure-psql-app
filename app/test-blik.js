require('dotenv').config();

delete require.cache[require.resolve('./services/payu-service')];
const payuService = require('./services/payu-service');

async function createBlikOrder() {
  console.log('🔍 PayU BLIK Payment Test (1 PLN)\n');
  
  await payuService.authenticate();
  console.log('✅ Authenticated\n');
  
  // Use real userId from database for testing subscription activation
  // Change this to your actual user ID!
  const TEST_USER_ID = '3'; // hubertkozuchowski@gmail.com
  
  const testOrder = {
    userId: TEST_USER_ID,
    planCode: 'premium',
    amount: 1.00,
    email: 'hubertkozuchowski@gmail.com',
    firstName: 'Hubert',
    lastName: 'Kozuchowski',
    customerIp: '127.0.0.1',
    description: 'HAOS.fm premium Subscription Test'
  };
  
  console.log(`Creating order for USER ID: ${TEST_USER_ID}`);
  console.log('Creating BLIK order for 1.00 PLN...');
  console.log('⚠️  This will activate PREMIUM subscription on payment!\n');
  
  try {
    const result = await payuService.createOrder(testOrder);
    console.log('✅ ORDER CREATED SUCCESSFULLY!');
    console.log('📋 Order ID:', result.orderId);
    console.log('📋 Ext Order ID:', result.extOrderId);
    console.log('📋 Status:', result.status);
    console.log('\n🔗 BLIK Payment URL:');
    console.log(result.redirectUri);
    console.log('\n👉 Open this URL in your browser');
    console.log('👉 Select BLIK and enter your 6-digit code from banking app');
    console.log('👉 Confirm payment in your banking app');
  } catch (error) {
    console.log('\n❌ Failed:', error.message);
  }
}

createBlikOrder().catch(console.error);
