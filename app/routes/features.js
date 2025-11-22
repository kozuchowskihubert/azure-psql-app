const express = require('express');
const router = express.Router();
const { getFeaturesSummary, getEnabledFeatures, isFeatureEnabled } = require('../config/features');

/**
 * GET /api/features
 * Get all enabled features with details
 */
router.get('/', (req, res) => {
  try {
    const summary = getFeaturesSummary();
    res.json({
      success: true,
      ...summary,
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch features',
    });
  }
});

/**
 * GET /api/features/:featureKey
 * Check if a specific feature is enabled
 */
router.get('/:featureKey', (req, res) => {
  try {
    const { featureKey } = req.params;
    const enabled = isFeatureEnabled(featureKey);
    
    res.json({
      success: true,
      feature: featureKey,
      enabled,
    });
  } catch (error) {
    console.error('Error checking feature:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check feature',
    });
  }
});

module.exports = router;
