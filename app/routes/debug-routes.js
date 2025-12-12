/**
 * Debug subscription routes loading
 */

const express = require('express');
const router = express.Router();

router.get('/debug-subscription-routes', (req, res) => {
  const errors = [];
  const loaded = [];

  // Try loading each dependency
  try {
    require('../models/subscription');
    loaded.push('Subscription model');
  } catch (e) {
    errors.push({ module: 'Subscription model', error: e.message });
  }

  try {
    require('../services/payment-service');
    loaded.push('PaymentService');
  } catch (e) {
    errors.push({ module: 'PaymentService', error: e.message });
  }

  try {
    require('../routes/subscription-routes');
    loaded.push('subscription-routes');
  } catch (e) {
    errors.push({ module: 'subscription-routes', error: e.message, stack: e.stack });
  }

  res.json({
    success: errors.length === 0,
    loaded,
    errors,
    message: errors.length === 0 
      ? 'All modules loaded successfully' 
      : `Failed to load ${errors.length} modules`
  });
});

module.exports = router;
