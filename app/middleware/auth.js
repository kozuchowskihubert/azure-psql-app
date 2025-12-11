/**
 * HAOS Authentication Middleware
 * Flexible auth layer supporting anonymous, basic, and premium access
 */

const authService = require('../services/auth-service');

/**
 * Allow anonymous access - creates session if none exists
 * Use this for public endpoints that should track usage
 */
const allowAnonymous = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.haos_session;
    
    if (sessionId) {
      // Try to get existing session
      req.session = await authService.getSession(sessionId);
    }
    
    if (!req.session) {
      // Create new anonymous session
      req.session = await authService.createAnonymousSession();
      
      // Set HTTPOnly cookie
      res.cookie('haos_session', req.session.sessionId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
    }
    
    // Set user if authenticated
    if (req.session.userId) {
      req.user = await authService.getUserById(req.session.userId);
    }
    
    next();
  } catch (error) {
    console.error('[Auth Middleware] allowAnonymous error:', error);
    // Still allow access even if session creation fails
    req.session = { type: 'anonymous', tier: 'free' };
    next();
  }
};

/**
 * Require authentication - rejects anonymous users
 * Use this for features that need a logged-in user
 */
const requireAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.haos_session;
    
    if (!sessionId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please sign in to access this feature',
        tier: 'anonymous',
        authenticated: false,
        redirectTo: '/login.html'
      });
    }

    const session = await authService.getSession(sessionId);
    
    if (!session || session.type === 'anonymous') {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please sign in to access this feature',
        tier: session?.tier || 'anonymous',
        authenticated: false,
        redirectTo: '/login.html'
      });
    }

    // Set session and user
    req.session = session;
    req.user = session.user || await authService.getUserById(session.userId);
    
    if (!req.user) {
      return res.status(401).json({
        error: 'User not found',
        authenticated: false,
        redirectTo: '/login.html'
      });
    }
    
    next();
  } catch (error) {
    console.error('[Auth Middleware] requireAuth error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred while verifying your session'
    });
  }
};

/**
 * Require premium subscription
 * Use this for premium-only features
 */
const requirePremium = async (req, res, next) => {
  // First check authentication
  await requireAuth(req, res, async () => {
    try {
      const tier = req.session?.tier || 'free';
      
      if (tier !== 'premium' && tier !== 'pro') {
        return res.status(403).json({
          error: 'Premium subscription required',
          message: 'This feature is only available to premium subscribers',
          tier: tier,
          authenticated: true,
          upgradeUrl: '/premium.html'
        });
      }
      
      next();
    } catch (error) {
      console.error('[Auth Middleware] requirePremium error:', error);
      return res.status(500).json({
        error: 'Authorization error',
        message: 'An error occurred while checking your subscription'
      });
    }
  });
};

/**
 * Require specific feature access
 * Use this for granular feature control
 */
const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      // First ensure we have a session
      const sessionId = req.cookies?.haos_session;
      if (!sessionId) {
        req.session = await authService.createAnonymousSession();
        res.cookie('haos_session', req.session.sessionId, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/'
        });
      } else {
        req.session = req.session || await authService.getSession(sessionId);
      }

      // Check feature access
      const hasAccess = authService.canAccess(req.session, featureName);
      
      if (!hasAccess) {
        const tier = req.session?.tier || 'free';
        const needsAuth = tier === 'free' || tier === 'anonymous';
        
        return res.status(needsAuth ? 401 : 403).json({
          error: needsAuth ? 'Authentication required' : 'Upgrade required',
          message: needsAuth 
            ? `Please sign in to access ${featureName}`
            : `This feature requires a premium subscription`,
          feature: featureName,
          tier: tier,
          authenticated: !needsAuth,
          redirectTo: needsAuth ? '/login.html' : '/premium.html'
        });
      }
      
      next();
    } catch (error) {
      console.error(`[Auth Middleware] requireFeature(${featureName}) error:`, error);
      return res.status(500).json({
        error: 'Authorization error',
        message: 'An error occurred while checking feature access'
      });
    }
  };
};

/**
 * Optional authentication - doesn't reject but populates user if present
 * Use this for endpoints that work differently based on auth status
 */
const optionalAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.haos_session;
    
    if (sessionId) {
      req.session = await authService.getSession(sessionId);
      
      if (req.session?.userId) {
        req.user = await authService.getUserById(req.session.userId);
      }
    }
    
    // Always proceed, even without auth
    next();
  } catch (error) {
    console.error('[Auth Middleware] optionalAuth error:', error);
    // Continue without auth on error
    next();
  }
};

/**
 * Verify JWT token from Authorization header
 * Use this for API endpoints that expect Bearer tokens
 */
const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
        message: 'Please provide a valid Bearer token'
      });
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token, 'access');
    
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        message: 'Please refresh your access token'
      });
    }

    // Get user from token
    req.user = await authService.getUserById(decoded.sub);
    req.tokenData = decoded;
    
    if (!req.user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'The user associated with this token no longer exists'
      });
    }
    
    next();
  } catch (error) {
    console.error('[Auth Middleware] verifyJWT error:', error);
    return res.status(401).json({
      error: 'Token verification failed',
      message: 'Could not verify your access token'
    });
  }
};

/**
 * Rate limiting for authentication attempts
 * Prevents brute force attacks
 */
const rateLimitAuth = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!attempts.has(identifier)) {
      attempts.set(identifier, []);
    }

    const userAttempts = attempts.get(identifier);
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return res.status(429).json({
        error: 'Too many attempts',
        message: 'Please wait a few minutes before trying again',
        retryAfter: Math.ceil((recentAttempts[0] + windowMs - now) / 1000)
      });
    }

    // Add current attempt
    recentAttempts.push(now);
    attempts.set(identifier, recentAttempts);
    
    next();
  };
};

module.exports = {
  allowAnonymous,
  requireAuth,
  requirePremium,
  requireFeature,
  optionalAuth,
  verifyJWT,
  rateLimitAuth
};
