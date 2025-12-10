/**
 * Premium Routes - HAOS.fm
 * API endpoints for premium plan features, status, and upgrades
 */

const express = require('express');
const router = express.Router();
const { PremiumService, PLANS, FEATURE_CODES } = require('../services/premium-service');

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Extract user ID from session (compatible with various auth methods)
 */
const getUserId = (req) => {
  return req.user?.id || req.session?.userId || null;
};

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * GET /api/premium/plans
 * Get all available subscription plans
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = PremiumService.getPlans();
    
    // Format prices for display
    const formattedPlans = plans.map(plan => ({
      code: plan.code,
      name: plan.name,
      description: plan.description,
      badge: plan.badge,
      featured: plan.featured || false,
      price: {
        monthly: {
          cents: plan.price.monthly,
          display: PremiumService.formatPrice(plan.price.monthly, plan.currency),
        },
        yearly: {
          cents: plan.price.yearly,
          display: PremiumService.formatPrice(plan.price.yearly, plan.currency),
          savings: plan.price.monthly > 0 
            ? Math.round((1 - plan.price.yearly / (plan.price.monthly * 12)) * 100) 
            : 0,
        },
      },
      currency: plan.currency,
      features: {
        downloads: plan.features.presetDownloads.label,
        workspaces: plan.features.workspaceAccess.length,
        storage: plan.features.cloudStorage.label,
        collaboration: plan.features.collaborationSessions.label,
        exclusivePresets: plan.features.exclusivePresets,
        audioQuality: plan.features.audioExport.quality,
        support: plan.features.supportLevel,
      },
    }));

    res.json({
      success: true,
      plans: formattedPlans,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch plans' });
  }
});

/**
 * GET /api/premium/state
 * Get current user's premium state (for frontend)
 */
router.get('/state', async (req, res) => {
  try {
    const userId = getUserId(req);
    const state = await PremiumService.getClientState(userId);
    res.json(state);
  } catch (error) {
    console.error('Error fetching premium state:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch state' });
  }
});

/**
 * GET /api/premium/features
 * Get all features and user's access status
 */
router.get('/features', async (req, res) => {
  try {
    const userId = getUserId(req);
    const plan = await PremiumService.getUserPlan(userId);
    
    const features = Object.entries(FEATURE_CODES).map(([key, code]) => ({
      code,
      name: key.replace(/_/g, ' ').toLowerCase(),
      hasAccess: plan.features ? true : false, // Simplified for demo
    }));

    res.json({
      success: true,
      plan: plan.code,
      features,
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch features' });
  }
});

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================

/**
 * GET /api/premium/downloads
 * Get user's download status
 */
router.get('/downloads', async (req, res) => {
  try {
    const userId = getUserId(req);
    const status = await PremiumService.getDownloadStatus(userId);
    res.json({ success: true, ...status });
  } catch (error) {
    console.error('Error fetching download status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch download status' });
  }
});

/**
 * POST /api/premium/track-download
 * Track a preset download
 */
router.post('/track-download', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { presetId } = req.body;

    if (!presetId) {
      return res.status(400).json({ success: false, error: 'Preset ID required' });
    }

    const result = await PremiumService.trackDownload(userId, presetId);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({ success: false, error: 'Failed to track download' });
  }
});

/**
 * GET /api/premium/check-access
 * Check if user has access to a specific feature or workspace
 */
router.get('/check-access', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { feature, workspace } = req.query;

    if (workspace) {
      const hasAccess = await PremiumService.canAccessWorkspace(userId, workspace);
      return res.json({
        success: true,
        workspace,
        hasAccess,
        requiredPlan: hasAccess ? null : 'premium',
      });
    }

    if (feature) {
      const hasAccess = await PremiumService.hasFeature(userId, feature);
      return res.json({
        success: true,
        feature,
        hasAccess,
        requiredPlan: hasAccess ? null : 'premium',
      });
    }

    res.status(400).json({ success: false, error: 'Feature or workspace parameter required' });
  } catch (error) {
    console.error('Error checking access:', error);
    res.status(500).json({ success: false, error: 'Failed to check access' });
  }
});

/**
 * GET /api/premium/upgrade-info
 * Get upgrade comparison information
 */
router.get('/upgrade-info', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { target } = req.query;
    const targetPlan = target || 'premium';

    const currentPlan = await PremiumService.getUserPlan(userId);
    const comparison = PremiumService.getUpgradeComparison(currentPlan.code, targetPlan);

    res.json({
      success: true,
      ...comparison,
    });
  } catch (error) {
    console.error('Error fetching upgrade info:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch upgrade info' });
  }
});

/**
 * POST /api/premium/can-download-preset
 * Check if user can download a specific preset (considering category restrictions)
 */
router.post('/can-download-preset', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { presetId, category } = req.body;

    // Check category access
    if (category) {
      const canAccessCategory = await PremiumService.canAccessPresetCategory(userId, category);
      if (!canAccessCategory) {
        return res.json({
          success: true,
          allowed: false,
          reason: 'premium_category',
          message: 'This preset requires a premium subscription',
        });
      }
    }

    // Check download limit
    const downloadResult = await PremiumService.trackDownload(userId, presetId);
    res.json({
      success: true,
      ...downloadResult,
    });
  } catch (error) {
    console.error('Error checking preset download:', error);
    res.status(500).json({ success: false, error: 'Failed to check download permission' });
  }
});

// ============================================================================
// PREMIUM PAGE DATA
// ============================================================================

/**
 * GET /api/premium/page-data
 * Get all data needed for the premium upgrade page
 */
router.get('/page-data', async (req, res) => {
  try {
    const userId = getUserId(req);
    const currentPlan = await PremiumService.getUserPlan(userId);
    const plans = PremiumService.getPlans();
    const downloadStatus = await PremiumService.getDownloadStatus(userId);

    // Feature comparison matrix
    const featureMatrix = [
      {
        category: 'Preset Library',
        features: [
          { name: 'Daily Downloads', free: '5', basic: '25', premium: '∞', pro: '∞' },
          { name: 'Exclusive Presets', free: '✗', basic: '✗', premium: '✓', pro: '✓' },
          { name: 'Pro Presets', free: '✗', basic: '✗', premium: '✗', pro: '✓' },
        ],
      },
      {
        category: 'Workspaces',
        features: [
          { name: 'SOUNDS Page', free: '✓', basic: '✓', premium: '✓', pro: '✓' },
          { name: 'TECHNO Workspace', free: '✗', basic: '✓', premium: '✓', pro: '✓' },
          { name: 'MODULAR Workspace', free: '✗', basic: '✗', premium: '✓', pro: '✓' },
          { name: 'BUILDER Workspace', free: '✗', basic: '✗', premium: '✓', pro: '✓' },
          { name: 'Saved Patches', free: '3', basic: '25', premium: '∞', pro: '∞' },
        ],
      },
      {
        category: 'Audio & Export',
        features: [
          { name: 'Sample Rate', free: '44.1kHz', basic: '48kHz', premium: '96kHz', pro: '192kHz' },
          { name: 'Export Formats', free: 'WAV', basic: 'WAV, MP3', premium: 'WAV, MP3, FLAC', pro: 'All + Stems' },
          { name: 'Audio Quality', free: 'Standard', basic: 'High', premium: 'Studio', pro: 'Mastering' },
        ],
      },
      {
        category: 'Collaboration & Storage',
        features: [
          { name: 'Cloud Storage', free: '0 MB', basic: '100 MB', premium: '1 GB', pro: '10 GB' },
          { name: 'Collaboration Sessions', free: '✗', basic: '2/month', premium: '10/month', pro: '∞' },
          { name: 'API Access', free: '✗', basic: '✗', premium: '✓', pro: '✓' },
        ],
      },
      {
        category: 'Support',
        features: [
          { name: 'Community Support', free: '✓', basic: '✓', premium: '✓', pro: '✓' },
          { name: 'Email Support', free: '✗', basic: '✓', premium: '✓', pro: '✓' },
          { name: 'Priority Support', free: '✗', basic: '✗', premium: '✓', pro: '✓' },
          { name: 'Dedicated Support', free: '✗', basic: '✗', premium: '✗', pro: '✓' },
        ],
      },
    ];

    res.json({
      success: true,
      currentPlan: {
        code: currentPlan.code,
        name: currentPlan.name,
        badge: currentPlan.badge,
      },
      plans: plans.map(p => ({
        code: p.code,
        name: p.name,
        description: p.description,
        badge: p.badge,
        featured: p.featured || false,
        price: {
          monthly: PremiumService.formatPrice(p.price.monthly, p.currency),
          yearly: PremiumService.formatPrice(p.price.yearly, p.currency),
          monthlyCents: p.price.monthly,
          yearlyCents: p.price.yearly,
        },
        currency: p.currency,
      })),
      downloadStatus,
      featureMatrix,
      isAuthenticated: !!userId,
    });
  } catch (error) {
    console.error('Error fetching page data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch page data' });
  }
});

module.exports = router;
