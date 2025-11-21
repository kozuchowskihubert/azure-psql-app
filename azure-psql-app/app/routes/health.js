const express = require('express');

const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    // Check database connection
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      res.json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
