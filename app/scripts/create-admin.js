/**
 * Create Admin User Script
 * Run this once to create an initial admin user for the HAOS.fm platform
 * 
 * Usage: node scripts/create-admin.js
 */

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://haos@localhost:5432/haos_dev?sslmode=disable',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function createAdminUser() {
  const adminEmail = 'admin@haos.fm';
  const adminPassword = 'haos2025!Admin'; // Change this after first login!
  const adminName = 'HAOS Admin';

  try {
    // Check if admin already exists
    const existingUser = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ Admin user already exists:');
      console.log('   Email:', adminEmail);
      console.log('   Password: (use existing password or reset manually)');
      console.log('\nIf you forgot the password, delete this user and run the script again.');
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    console.log('👤 Creating admin user...');
    const result = await pool.query(
      `INSERT INTO users (email, password, name, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, email, name`,
      [adminEmail, hashedPassword, adminName]
    );

    const user = result.rows[0];

    console.log('\n✅ Admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ', adminEmail);
    console.log('🔑 Password: ', adminPassword);
    console.log('👤 Name:     ', adminName);
    console.log('🆔 User ID:  ', user.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    console.log('\n🔗 Login at: http://localhost:3000/login.html');
    console.log('   or:       https://your-domain.vercel.app/login.html\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === '42P01') {
      console.log('\n💡 Tip: Run the database migration first:');
      console.log('   psql -d haos_dev -f migrations/001_init_auth.sql');
    }
  } finally {
    await pool.end();
  }
}

// Run the script
createAdminUser().catch(console.error);
