/**
 * Set Password for Existing User
 * Use this to set/reset password for any user
 * 
 * Usage: node scripts/set-password.js email@example.com newpassword
 */

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://haos@localhost:5432/haos_dev?sslmode=disable',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function setPassword(email, password) {
  try {
    console.log(`\n🔐 Setting password for: ${email}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id, email, display_name, roles FROM users WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length === 0) {
      console.log('❌ User not found');
      return false;
    }

    const user = userCheck.rows[0];
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.display_name);
    console.log('   Roles:', user.roles);

    // Hash the new password
    console.log('\n🔑 Hashing new password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    console.log('💾 Updating password in database...');
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
      [hashedPassword, email]
    );

    console.log('\n✅ Password set successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ', email);
    console.log('🔑 Password: ', password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔗 Login at: http://localhost:3000/login.html\n');

    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

// Get email and password from command line
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('\nUsage: node scripts/set-password.js email@example.com newpassword\n');
  console.log('Example: node scripts/set-password.js admin@haos.fm myNewPassword123\n');
  process.exit(1);
}

setPassword(email, password);
