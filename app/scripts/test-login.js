/**
 * Test Admin Login
 * Quick script to verify admin credentials
 */

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://haos@localhost:5432/haos_dev?sslmode=disable',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function testLogin(email, password) {
  try {
    console.log(`\n🔐 Testing login for: ${email}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Get user from database
    const result = await pool.query(
      'SELECT id, email, password_hash, display_name, roles FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return false;
    }

    const user = result.rows[0];
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.display_name);
    console.log('   Roles:', user.roles);

    // Test password
    console.log('\n🔑 Testing password...');
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (passwordMatch) {
      console.log('✅ Password is CORRECT!');
      console.log('\n✨ You can login with:');
      console.log('   Email:', email);
      console.log('   Password:', password);
      console.log('\n🔗 Login at: http://localhost:3000/login.html');
      return true;
    } else {
      console.log('❌ Password is INCORRECT');
      console.log('\n💡 Try these common passwords:');
      console.log('   - haos2025!Admin');
      console.log('   - test123');
      console.log('   - admin');
      return false;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

// Test with provided credentials
const email = process.argv[2] || 'admin@haos.fm';
const password = process.argv[3] || 'haos2025!Admin';

testLogin(email, password);
