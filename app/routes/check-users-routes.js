/**
 * Check users table structure
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/check-users', async (req, res) => {
  try {
    // Check users table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `);

    // Count users
    const count = await pool.query('SELECT COUNT(*) as count FROM users');

    // Sample user ID
    const sample = await pool.query('SELECT id FROM users LIMIT 1');

    res.json({
      success: true,
      columns: columns.rows,
      userCount: count.rows[0].count,
      sampleUserId: sample.rows[0]?.id,
      sampleIdType: typeof sample.rows[0]?.id
    });

  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
