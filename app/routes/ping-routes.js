/**
 * Minimal test endpoint - no dependencies
 */

const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasDatabase: !!process.env.DATABASE_URL,
      hasPayU: !!process.env.PAYU_POS_ID
    }
  });
});

module.exports = router;
