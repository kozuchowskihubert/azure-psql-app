/**
 * API Feature Guard Middleware
 * Checks if an API endpoint is enabled before allowing requests
 */

const { apiFeatureService } = require('../services/api-feature-service');

/**
 * Middleware to check if API endpoint is enabled
 * Returns 503 Service Unavailable if endpoint is disabled
 */
const apiFeatureGuard = async (req, res, next) => {
  try {
    // Ensure service is initialized
    await apiFeatureService.init();

    // Get the matched endpoint for this route
    const endpoint = apiFeatureService.matchRoute(req.path);

    // If no endpoint matches, allow request (unmanaged routes)
    if (!endpoint) {
      return next();
    }

    // If endpoint is enabled, allow request
    if (endpoint.enabled) {
      // Attach endpoint info to request for potential logging/analytics
      req.apiEndpoint = endpoint;
      return next();
    }

    // Endpoint is disabled - return 503 Service Unavailable
    console.log(`[APIGuard] Blocked request to disabled endpoint: ${endpoint.id} (${req.path})`);
    
    return res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable',
      code: 'API_ENDPOINT_DISABLED',
      endpoint: endpoint.name,
      message: `The ${endpoint.name} is currently disabled. Please try again later or contact support.`,
    });
  } catch (error) {
    console.error('[APIGuard] Error checking endpoint status:', error.message);
    // On error, allow request to proceed (fail-open for availability)
    return next();
  }
};

/**
 * Create a guard for specific routes only
 * Use this for more granular control
 */
const createRouteGuard = (endpointId) => {
  return async (req, res, next) => {
    try {
      await apiFeatureService.init();
      const enabled = apiFeatureService.isEnabled(endpointId);

      if (enabled) {
        return next();
      }

      const endpoint = apiFeatureService.getEndpoint(endpointId);
      
      return res.status(503).json({
        success: false,
        error: 'Service temporarily unavailable',
        code: 'API_ENDPOINT_DISABLED',
        endpoint: endpoint?.name || endpointId,
        message: `This feature is currently disabled. Please try again later.`,
      });
    } catch (error) {
      console.error(`[RouteGuard] Error for ${endpointId}:`, error.message);
      return next();
    }
  };
};

/**
 * Logging middleware for API endpoint access
 */
const apiAccessLogger = async (req, res, next) => {
  const startTime = Date.now();

  // Log after response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const endpoint = req.apiEndpoint;

    if (endpoint) {
      console.log(`[API] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - Endpoint: ${endpoint.id}`);
    }
  });

  next();
};

/**
 * Rate limit helper (basic implementation)
 * For production, use express-rate-limit with Redis
 */
const rateLimitTracker = new Map();

const apiRateLimiter = async (req, res, next) => {
  try {
    await apiFeatureService.init();
    const endpoint = apiFeatureService.matchRoute(req.path);

    if (!endpoint || !endpoint.rateLimit) {
      return next();
    }

    const { requests, window } = endpoint.rateLimit;
    const windowMs = parseWindow(window);
    const key = `${req.ip || 'unknown'}-${endpoint.id}`;

    // Get or create tracker entry
    if (!rateLimitTracker.has(key)) {
      rateLimitTracker.set(key, { count: 0, resetAt: Date.now() + windowMs });
    }

    const tracker = rateLimitTracker.get(key);

    // Reset if window expired
    if (Date.now() > tracker.resetAt) {
      tracker.count = 0;
      tracker.resetAt = Date.now() + windowMs;
    }

    // Increment and check
    tracker.count++;

    if (tracker.count > requests) {
      console.log(`[RateLimit] Rate limit exceeded for ${key}: ${tracker.count}/${requests}`);
      
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((tracker.resetAt - Date.now()) / 1000),
        limit: requests,
        window,
      });
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', requests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, requests - tracker.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(tracker.resetAt / 1000));

    next();
  } catch (error) {
    console.error('[RateLimit] Error:', error.message);
    next();
  }
};

/**
 * Parse window string to milliseconds
 */
function parseWindow(window) {
  const match = window.match(/^(\d+)([smh])$/);
  if (!match) return 60000; // Default 1 minute

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    default: return 60000;
  }
}

/**
 * Clean up old rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, tracker] of rateLimitTracker.entries()) {
    if (now > tracker.resetAt + 60000) { // Clean entries 1 min after reset
      rateLimitTracker.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[RateLimit] Cleaned ${cleaned} expired entries`);
  }
}, 60000); // Run every minute

module.exports = {
  apiFeatureGuard,
  createRouteGuard,
  apiAccessLogger,
  apiRateLimiter,
};
