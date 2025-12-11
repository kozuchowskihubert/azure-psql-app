/**
 * Grant Admin Role Script
 * Usage: DATABASE_URL=<production_url> node scripts/grant-admin-role.js admin@haos.fm
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://haos@localhost:5432/haos_dev?sslmode=disable',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function grantAdminRole(email) {
  try {
    // Find user
    const userResult = await pool.query(
      'SELECT id, email, display_name FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    const user = userResult.rows[0];
    console.log(`👤 Found user: ${user.display_name || user.email} - ID: ${user.id}`);

    // Get admin role ID
    const roleResult = await pool.query(
      "SELECT id FROM user_roles WHERE role_name = 'admin'"
    );

    if (roleResult.rows.length === 0) {
      // Create admin role if it doesn't exist
      console.log('📝 Creating admin role...');
      await pool.query(`
        INSERT INTO user_roles (role_name, description)
        VALUES ('admin', 'Platform administrator with full access')
        ON CONFLICT (role_name) DO NOTHING
      `);
      const newRole = await pool.query("SELECT id FROM user_roles WHERE role_name = 'admin'");
      roleResult.rows[0] = newRole.rows[0];
    }

    const roleId = roleResult.rows[0].id;

    // Assign admin role
    await pool.query(`
      INSERT INTO user_role_assignments (user_id, role_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, role_id) DO NOTHING
    `, [user.id, roleId]);

    console.log('✅ Admin role granted successfully!');

    // Verify roles
    const rolesResult = await pool.query(`
      SELECT ur.role_name 
      FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = $1
    `, [user.id]);

    console.log('📋 Current roles:', rolesResult.rows.map(r => r.role_name).join(', '));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

const email = process.argv[2] || 'admin@haos.fm';
grantAdminRole(email);
