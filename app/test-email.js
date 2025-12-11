/**
 * Test Email Service
 * Send a real test email to verify SMTP configuration
 */

require('dotenv').config();

async function testEmail() {
  console.log('🧪 Testing Email Service\n');
  
  // Show configuration
  console.log('📋 SMTP Configuration:');
  console.log('   Host:', process.env.SMTP_HOST);
  console.log('   Port:', process.env.SMTP_PORT);
  console.log('   User:', process.env.SMTP_USER);
  console.log('   From:', process.env.EMAIL_FROM);
  console.log('');
  
  // Force fresh initialization by requiring email service
  delete require.cache[require.resolve('./services/email-service')];
  const emailService = require('./services/email-service');
  
  // Initialize
  console.log('🔄 Initializing email service...');
  await emailService.initialize();
  
  if (!emailService.transporter) {
    console.error('❌ Email service not initialized - check SMTP configuration');
    process.exit(1);
  }
  
  console.log('✅ Email service initialized\n');
  
  // Send test email
  const testRecipient = process.env.TEST_EMAIL || 'hubertkozuchowski@gmail.com';
  
  console.log('📤 Sending test email to:', testRecipient);
  
  const result = await emailService.sendSubscriptionConfirmation(
    testRecipient,
    'Test User',
    'premium',
    49.00,
    'PLN'
  );
  
  if (result.success) {
    console.log('\n✅ SUCCESS! Email sent successfully');
    console.log('   Message ID:', result.messageId);
    console.log('\n📬 Check your inbox:', testRecipient);
  } else {
    console.error('\n❌ FAILED to send email');
    console.error('   Error:', result.error);
  }
}

testEmail().catch(err => {
  console.error('❌ Test failed:', err.message);
  console.error(err.stack);
});
