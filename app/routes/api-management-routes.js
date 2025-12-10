/**
 * API Management Routes
 * Admin endpoints for managing API endpoint features
 */

const express = require('express');

const router = express.Router();
const { apiFeatureService } = require('../services/api-feature-service');

// JWT Auth middleware (imported from admin-auth-routes)
let jwtAuth;
try {
  jwtAuth = require('../auth/jwt-admin-auth');
} catch (err) {
  console.warn('[APIManagement] JWT auth not available, using basic auth');
  jwtAuth = null;
}

// Middleware to require admin authentication
const requireAdminAuth = (req, res, next) => {
  if (jwtAuth && jwtAuth.tokenRequired) {
    return jwtAuth.tokenRequired(req, res, next);
  }
  // Fallback: check for basic auth header or skip in development
  if (process.env.NODE_ENV === 'development') {
    req.currentAdmin = { username: 'dev-admin' };
    return next();
  }
  return res.status(401).json({ success: false, error: 'Authentication required' });
};

// ============================================================================
// API Endpoint Management
// ============================================================================

/**
 * GET /api/admin/api-management
 * Get all API endpoints with their status
 */
router.get('/', requireAdminAuth, async (req, res) => {
  try {
    await apiFeatureService.init();
    
    const endpoints = apiFeatureService.getAllEndpoints();
    const summary = apiFeatureService.getSummary();

    res.json({
      success: true,
      endpoints,
      summary,
    });
  } catch (error) {
    console.error('[APIManagement] Error fetching endpoints:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch API endpoints' });
  }
});

/**
 * GET /api/admin/api-management/summary
 * Get summary statistics
 */
router.get('/summary', requireAdminAuth, async (req, res) => {
  try {
    await apiFeatureService.init();
    const summary = apiFeatureService.getSummary();

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('[APIManagement] Error fetching summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch summary' });
  }
});

/**
 * GET /api/admin/api-management/category/:category
 * Get endpoints by category
 */
router.get('/category/:category', requireAdminAuth, async (req, res) => {
  try {
    await apiFeatureService.init();
    
    const { category } = req.params;
    const endpoints = apiFeatureService.getEndpointsByCategory(category);

    res.json({
      success: true,
      category,
      endpoints,
      count: endpoints.length,
    });
  } catch (error) {
    console.error('[APIManagement] Error fetching category:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch category' });
  }
});

/**
 * GET /api/admin/api-management/:id
 * Get single endpoint configuration
 */
router.get('/:id', requireAdminAuth, async (req, res) => {
  try {
    await apiFeatureService.init();
    
    const endpoint = apiFeatureService.getEndpoint(req.params.id);
    
    if (!endpoint) {
      return res.status(404).json({ success: false, error: 'Endpoint not found' });
    }

    res.json({
      success: true,
      endpoint,
    });
  } catch (error) {
    console.error('[APIManagement] Error fetching endpoint:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch endpoint' });
  }
});

/**
 * POST /api/admin/api-management/:id/enable
 * Enable an API endpoint
 */
router.post('/:id/enable', requireAdminAuth, async (req, res) => {
  try {
    await apiFeatureService.init();
    
    const updatedBy = req.currentAdmin?.username || 'unknown';
    const endpoint = await apiFeatureService.enableEndpoint(req.params.id, updatedBy);

    console.log(`[APIManagement] Endpoint ${req.params.id} enabled by ${updatedBy}`);

    res.json({
      success: true,
      message: `API endpoint ${endpoint.name} enabled`,
      endpoint,
    });
  } catch (error) {
    console.error('[APIManagement] Error enabling endpoint:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/api-management/:id/disable
 * Disable an API endpoint
 */
router.post('/:id/disable', requireAdminAuth, async (req, res) => {
  try {
    await apiFeatureService.init();
    
    const updatedBy = req.currentAdmin?.username || 'unknown';
    const endpoint = await apiFeatureService.disableEndpoint(req.params.id, updatedBy);

    console.log(`[APIManagement] Endpoint ${req.params.id} disabled by ${updatedBy}`);

    res.json({
      success: true,
      message: `API endpoint ${endpoint.name} disabled`,
      endpoint,
    });
  } catch (error) {
    console.error('[APIManagement] Error disabling endpoint:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/api-management/:id/toggle
 * Toggle an API endpoint
 */
router.post('/:id/toggle', requireAdminAuth, async (req, res) => {
  try {
    await apiFeatureService.init();
    
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ success: false, error: 'enabled field is required (boolean)' });
    }

    const updatedBy = req.currentAdmin?.username || 'unknown';
    const endpoint = await apiFeatureService.toggleEndpoint(req.params.id, enabled, updatedBy);

    console.log(`[APIManagement] Endpoint ${req.params.id} ${enabled ? 'enabled' : 'disabled'} by ${updatedBy}`);

    res.json({
      success: true,
      message: `API endpoint ${endpoint.name} ${enabled ? 'enabled' : 'disabled'}`,
      endpoint,
    });
  } catch (error) {
    console.error('[APIManagement] Error toggling endpoint:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/admin/api-management/:id/rate-limit
 * Update rate limit for an endpoint
 */
router.put('/:id/rate-limit', requireAdminAuth, async (req, res) => {
  try {
    await apiFeatureService.init();
    
    const { rateLimit } = req.body;
    const updatedBy = req.currentAdmin?.username || 'unknown';
    
    const endpoint = await apiFeatureService.updateRateLimit(req.params.id, rateLimit, updatedBy);

    console.log(`[APIManagement] Rate limit updated for ${req.params.id} by ${updatedBy}`);

    res.json({
      success: true,
      message: `Rate limit updated for ${endpoint.name}`,
      endpoint,
    });
  } catch (error) {
    console.error('[APIManagement] Error updating rate limit:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/api-management/bulk-toggle
 * Bulk toggle multiple endpoints
 */
router.post('/bulk-toggle', requireAdminAuth, async (req, res) => {
  try {
    await apiFeatureService.init();
    
    const { operations } = req.body;
    
    if (!Array.isArray(operations)) {
      return res.status(400).json({ success: false, error: 'operations array is required' });
    }

    const updatedBy = req.currentAdmin?.username || 'unknown';
    const result = await apiFeatureService.bulkToggle(operations, updatedBy);

    console.log(`[APIManagement] Bulk toggle by ${updatedBy}: ${result.results.length} success, ${result.errors.length} errors`);

    res.json({
      success: true,
      message: `${result.results.length} endpoints updated, ${result.errors.length} errors`,
      results: result.results,
      errors: result.errors,
    });
  } catch (error) {
    console.error('[APIManagement] Error in bulk toggle:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/api-management/reset
 * Reset all endpoints to defaults
 */
router.post('/reset', requireAdminAuth, async (req, res) => {
  try {
    await apiFeatureService.init();
    
    const { confirm } = req.body;
    
    if (confirm !== 'RESET_ALL_ENDPOINTS') {
      return res.status(400).json({ 
        success: false, 
        error: 'Please confirm reset by sending { confirm: "RESET_ALL_ENDPOINTS" }' 
      });
    }

    const updatedBy = req.currentAdmin?.username || 'unknown';
    const endpoints = await apiFeatureService.resetToDefaults(updatedBy);

    console.log(`[APIManagement] All endpoints reset to defaults by ${updatedBy}`);

    res.json({
      success: true,
      message: 'All API endpoints reset to defaults',
      endpoints,
    });
  } catch (error) {
    console.error('[APIManagement] Error resetting endpoints:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/api-management/check/:route
 * Check if a specific route is enabled (utility endpoint)
 */
router.get('/check/:route(*)', requireAdminAuth, async (req, res) => {
  try {
    await apiFeatureService.init();
    
    const routePath = `/${req.params.route}`;
    const endpoint = apiFeatureService.matchRoute(routePath);

    if (!endpoint) {
      return res.json({
        success: true,
        route: routePath,
        matched: false,
        enabled: true, // Allow unmanaged routes by default
      });
    }

    res.json({
      success: true,
      route: routePath,
      matched: true,
      endpoint: endpoint.id,
      name: endpoint.name,
      enabled: endpoint.enabled,
    });
  } catch (error) {
    console.error('[APIManagement] Error checking route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
