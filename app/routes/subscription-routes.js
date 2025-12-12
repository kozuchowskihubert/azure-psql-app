/**
 * Subscription Routes
 * API endpoints for subscription management
 */
const express = require('express');

const router = express.Router();
const Subscription = require('../models/subscription');
const PaymentService = require('../services/payment-service');
const authService = require('../services/auth-service');

// Helper to parse cookies from Cookie header
function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) cookies[name] = decodeURIComponent(value);
    return cookies;
  }, {});
}

// Middleware to load user from session cookie OR Bearer token (fallback)
const loadUserFromSession = async (req, res, next) => {
  try {
    // Parse cookies manually from Cookie header
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies.haos_session;
    console.log('[Subscription] loadUserFromSession - sessionId:', sessionId ? `${sessionId.substring(0, 8)}...` : 'NONE');
    
    if (sessionId) {
      const session = await authService.getSession(sessionId);
      console.log('[Subscription] Session found:', session ? { type: session.type, userId: session.user?.id } : 'NULL');
      
      if (session && session.type === 'authenticated' && session.user) {
        req.user = session.user;
        console.log('[Subscription] ✅ User loaded from cookie:', req.user.id, req.user.email);
        return next();
      } else {
        console.log('[Subscription] ❌ Session invalid or not authenticated');
      }
    } else {
      console.log('[Subscription] ❌ No haos_session cookie in request');
      console.log('[Subscription] Available cookies:', Object.keys(cookies));
    }
    
    // Fallback: Try Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    console.log('[Subscription] Authorization header:', authHeader ? 'EXISTS' : 'MISSING');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('[Subscription] 🔑 Trying Bearer token fallback:', token.substring(0, 20) + '...');
      
      try {
        const decoded = await authService.verifyToken(token);
        console.log('[Subscription] Token decoded:', decoded ? { id: decoded.id, email: decoded.email } : 'NULL');
        
        if (decoded && decoded.id) {
          // Load user from database using shared pool
          const pool = require('../config/database');
          const result = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [decoded.id]);
          
          if (result.rows.length > 0) {
            req.user = result.rows[0];
            console.log('[Subscription] ✅ User loaded from Bearer token:', req.user.id, req.user.email);
          } else {
            console.log('[Subscription] ❌ User not found for token id:', decoded.id);
          }
        } else {
          console.log('[Subscription] ❌ Invalid token payload - missing id field');
        }
      } catch (tokenError) {
        console.error('[Subscription] ❌ Bearer token verification failed:', tokenError.message);
      }
    } else {
      console.log('[Subscription] ❌ No Authorization header');
    }
  } catch (error) {
    console.error('[Subscription] ❌ Error loading user from session:', error.message);
  }
  
  next();
};

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  console.log('[Subscription] requireAuth check - req.user exists:', !!req.user);
  if (!req.user) {
    console.error('[Subscription] ❌ Authentication required but no req.user');
    return res.status(401).json({ error: 'Authentication required' });
  }
  console.log('[Subscription] ✅ User authenticated:', req.user.id);
  next();
};

// Apply session middleware to ALL routes (loads user if session cookie exists)
router.use(loadUserFromSession);

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

/**
 * GET /api/subscriptions/plans
 * Get all available subscription plans
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = await Subscription.getPlans();

    // Format prices for display
    const formattedPlans = plans.map((plan) => ({
      ...plan,
      priceMonthlyFormatted: formatPrice(plan.price_monthly, plan.currency),
      priceYearlyFormatted: formatPrice(plan.price_yearly, plan.currency),
      priceMonthlyFromYearly: formatPrice(Math.round(plan.price_yearly / 12), plan.currency),
      savingsPercent: plan.price_monthly > 0
        ? Math.round((1 - (plan.price_yearly / 12) / plan.price_monthly) * 100)
        : 0,
    }));

    res.json({
      success: true,
      plans: formattedPlans,
      providers: PaymentService.getAvailableProviders(),
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

/**
 * GET /api/subscriptions/providers
 * Get available payment providers
 */
router.get('/providers', (req, res) => {
  res.json({
    success: true,
    providers: PaymentService.getAvailableProviders(),
  });
});

// ============================================================================
// AUTHENTICATED ENDPOINTS
// ============================================================================

/**
 * GET /api/subscriptions/current
 * Get current user's subscription
 */
router.get('/current', requireAuth, async (req, res) => {
  try {
    let subscription = await Subscription.getUserSubscription(req.user.id);
    
    // If no subscription exists, create a free one or return default free plan details
    if (!subscription) {
      const freePlan = await Subscription.getPlanByCode('free');
      
      if (freePlan) {
        // Try to create a free subscription record for the user
        try {
          subscription = await Subscription.createSubscription(req.user.id, 'free');
        } catch (err) {
          console.error('Error creating free subscription:', err);
          // Fallback to free plan details without DB record
          subscription = {
            plan_code: 'free',
            plan_name: freePlan.name || 'Free',
            status: 'active',
            features: freePlan.features || {},
            price_monthly: freePlan.price_monthly || 0,
            price_yearly: freePlan.price_yearly || 0,
            billing_cycle: 'monthly',
          };
        }
      } else {
        // No free plan in DB, use hardcoded defaults
        subscription = {
          plan_code: 'free',
          plan_name: 'Free',
          status: 'active',
          features: {},
          price_monthly: 0,
          price_yearly: 0,
          billing_cycle: 'monthly',
        };
      }
    }

    const features = await Subscription.getUserFeatures(req.user.id);

    res.json({
      success: true,
      subscription,
      features,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

/**
 * POST /api/subscriptions/subscribe
 * Subscribe to a plan
 */
router.post('/subscribe', loadUserFromSession, requireAuth, async (req, res) => {
  try {
    const {
      planCode, billingCycle, provider, couponCode,
    } = req.body;

    if (!planCode) {
      return res.status(400).json({ error: 'Plan code is required' });
    }

    const plan = await Subscription.getPlanByCode(planCode);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Free plan - just create subscription
    if (planCode === 'free') {
      const subscription = await Subscription.createSubscription(req.user.id, planCode);
      return res.json({
        success: true,
        subscription,
        message: 'Subscribed to free plan',
      });
    }

    // Paid plan - need payment provider
    const paymentProvider = provider || 'stripe';

    if (!PaymentService.isProviderAvailable(paymentProvider)) {
      return res.status(400).json({
        error: `Payment provider ${paymentProvider} is not available`,
        availableProviders: PaymentService.getAvailableProviders(),
      });
    }

    let paymentResult;
    let price;

    switch (paymentProvider) {
      case 'stripe':
        paymentResult = await PaymentService.createStripeCheckoutSession(
          req.user.id,
          planCode,
          {
            billingCycle: billingCycle || 'monthly',
            successUrl: `${req.protocol}://${req.get('host')}/subscription/success`,
            cancelUrl: `${req.protocol}://${req.get('host')}/subscription/cancel`,
          },
        );
        break;

      case 'paypal':
        paymentResult = await PaymentService.createPayPalSubscription(
          req.user.id,
          planCode,
          { billingCycle: billingCycle || 'monthly' },
        );
        break;

      case 'blik':
        price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
        paymentResult = await PaymentService.createBLIKPayment(
          req.user.id,
          price,
          `${plan.name} - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} Subscription`,
          { type: 'subscription' },
        );
        break;

      case 'payu':
        price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
        paymentResult = await PaymentService.createPayUOrder({
          userId: req.user.id,
          planCode: planCode,
          amount: price / 100, // Convert from cents to PLN
          email: req.user.email,
          firstName: req.user.name?.split(' ')[0] || 'User',
          lastName: req.user.name?.split(' ').slice(1).join(' ') || '',
          customerIp: req.ip || '127.0.0.1',
          description: `HAOS.fm ${plan.name} - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} Subscription`,
        });
        break;

      default:
        return res.status(400).json({ error: `Unknown payment provider: ${paymentProvider}` });
    }

    res.json({
      success: true,
      provider: paymentProvider,
      ...paymentResult,
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

/**
 * POST /api/subscriptions/cancel
 * Cancel subscription
 */
router.post('/cancel', requireAuth, async (req, res) => {
  try {
    const { immediate, reason } = req.body;

    const subscription = await Subscription.cancelSubscription(
      req.user.id,
      immediate === true,
      reason,
    );

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    res.json({
      success: true,
      subscription,
      message: immediate
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled at the end of the billing period',
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * POST /api/subscriptions/resume
 * Resume a cancelled subscription
 */
router.post('/resume', requireAuth, async (req, res) => {
  try {
    const subscription = await Subscription.resumeSubscription(req.user.id);

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription to resume' });
    }

    res.json({
      success: true,
      subscription,
      message: 'Subscription resumed',
    });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({ error: 'Failed to resume subscription' });
  }
});

/**
 * POST /api/subscriptions/change-plan
 * Change subscription plan
 */
router.post('/change-plan', requireAuth, async (req, res) => {
  try {
    const { planCode, immediate } = req.body;

    if (!planCode) {
      return res.status(400).json({ error: 'Plan code is required' });
    }

    const subscription = await Subscription.changePlan(
      req.user.id,
      planCode,
      immediate !== false,
    );

    res.json({
      success: true,
      subscription,
      message: `Plan changed to ${planCode}`,
    });
  } catch (error) {
    console.error('Error changing plan:', error);
    res.status(500).json({ error: 'Failed to change plan' });
  }
});

/**
 * GET /api/subscriptions/features
 * Get user's available features
 */
router.get('/features', requireAuth, async (req, res) => {
  try {
    const features = await Subscription.getUserFeatures(req.user.id);
    res.json({
      success: true,
      features,
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

/**
 * GET /api/subscriptions/features/:featureCode
 * Check if user has access to a specific feature
 */
router.get('/features/:featureCode', requireAuth, async (req, res) => {
  try {
    const hasAccess = await Subscription.hasFeature(req.user.id, req.params.featureCode);
    res.json({
      success: true,
      featureCode: req.params.featureCode,
      hasAccess,
    });
  } catch (error) {
    console.error('Error checking feature:', error);
    res.status(500).json({ error: 'Failed to check feature access' });
  }
});

/**
 * POST /api/subscriptions/apply-coupon
 * Apply a coupon code
 */
router.post('/apply-coupon', requireAuth, async (req, res) => {
  try {
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const Payment = require('../models/payment');
    const coupon = await Payment.applyCoupon(req.user.id, couponCode);

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        duration: coupon.duration,
      },
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(400).json({ error: error.message || 'Invalid coupon code' });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatPrice(amountInCents, currency = 'PLN') {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  }).format(amount);
}

module.exports = router;
