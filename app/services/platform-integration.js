/**
 * HAOS Platform Integration Service
 * 
 * Central orchestration layer that connects all platform components:
 * - Authentication (Social OAuth, Session Management)
 * - User Management (Profile, Preferences, Roles)
 * - Subscription (Plans, Billing, Trials)
 * - Feature Gating (Access Control, Plan-based features)
 * - Virtual Lab (Instruments, Tutorials)
 * 
 * Architecture Overview:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                        HAOS Platform                                │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
 * │  │  Frontend    │  │  Frontend    │  │  Frontend    │              │
 * │  │  Login Page  │  │  Dashboard   │  │  Virtual Lab │              │
 * │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
 * │         │                 │                 │                       │
 * │         └─────────────────┼─────────────────┘                       │
 * │                           ▼                                         │
 * │  ┌────────────────────────────────────────────────────────────────┐ │
 * │  │              haos-platform.js (Frontend Integration)           │ │
 * │  │  - Auth State Management                                       │ │
 * │  │  - Feature Access UI                                           │ │
 * │  │  - Navigation Control                                          │ │
 * │  └────────────────────────────────────────────────────────────────┘ │
 * │                           │                                         │
 * │                           ▼  HTTP/REST                              │
 * │  ┌────────────────────────────────────────────────────────────────┐ │
 * │  │              Platform Integration Service (This file)          │ │
 * │  │  - Unified API Endpoints                                       │ │
 * │  │  - Cross-component Orchestration                               │ │
 * │  │  - Event Dispatching                                           │ │
 * │  └────────────────────────────────────────────────────────────────┘ │
 * │                           │                                         │
 * │         ┌─────────────────┼─────────────────┐                       │
 * │         ▼                 ▼                 ▼                       │
 * │  ┌────────────┐   ┌────────────┐   ┌────────────┐                  │
 * │  │   User     │   │Subscription│   │  Feature   │                  │
 * │  │   Model    │   │   Model    │   │  Flags     │                  │
 * │  └────────────┘   └────────────┘   └────────────┘                  │
 * │         │                 │                 │                       │
 * │         └─────────────────┴─────────────────┘                       │
 * │                           │                                         │
 * │                           ▼                                         │
 * │  ┌────────────────────────────────────────────────────────────────┐ │
 * │  │                     PostgreSQL Database                        │ │
 * │  │  - users, user_roles, user_sessions                            │ │
 * │  │  - subscription_plans, user_subscriptions                      │ │
 * │  │  - feature_flags, user_feature_overrides                       │ │
 * │  └────────────────────────────────────────────────────────────────┘ │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 */

const express = require('express');
const User = require('../models/user');
const Subscription = require('../models/subscription');
const { PLAN_HIERARCHY, FEATURE_REQUIREMENTS, requireAuth } = require('../middleware/access-control');

const router = express.Router();

// ============================================================================
// VIRTUAL LAB INSTRUMENTS CONFIGURATION
// ============================================================================

/**
 * Virtual Lab instruments with their feature requirements
 * This defines what instruments exist and what plan is needed to access them
 */
const VIRTUAL_LAB_INSTRUMENTS = {
  // Free Tier Instruments
  piano: {
    id: 'virtual-piano',
    name: 'Virtual Piano',
    description: 'Grand piano with realistic key response and pedal simulation',
    icon: '🎹',
    category: 'keyboards',
    requiredPlan: 'free',
    features: ['88 Keys', 'Velocity Sensing', 'Sustain Pedal', 'MIDI Support'],
    tutorialAvailable: true,
    href: '/virtual-lab.html?instrument=piano',
  },
  drums: {
    id: 'virtual-drums',
    name: 'Virtual Drums',
    description: 'Complete drum kit with pattern sequencer',
    icon: '🥁',
    category: 'percussion',
    requiredPlan: 'free',
    features: ['Drum Pads', 'Pattern Grid', 'Kit Selection', 'Velocity'],
    tutorialAvailable: true,
    href: '/virtual-lab.html?instrument=drums',
  },

  // Basic Tier Instruments
  guitar: {
    id: 'virtual-guitar',
    name: 'Virtual Guitar',
    description: 'Acoustic and electric guitar with strumming and picking modes',
    icon: '🎸',
    category: 'strings',
    requiredPlan: 'basic',
    features: ['Strumming', 'Fingerpicking', 'Chord Mode', 'Effects Pedals'],
    tutorialAvailable: true,
    href: '/virtual-lab.html?instrument=guitar',
  },
  synth2600: {
    id: 'synth-2600',
    name: 'Synth 2600',
    description: 'Classic analog synthesizer with modular patching',
    icon: '🎛️',
    category: 'synthesizers',
    requiredPlan: 'basic',
    features: ['3 Oscillators', 'Filter', 'Ring Mod', 'S&H'],
    tutorialAvailable: true,
    href: '/synth2600.html',
  },
  bass: {
    id: 'virtual-bass',
    name: 'Virtual Bass',
    description: 'Electric bass guitar with slap and fingerstyle',
    icon: '🎸',
    category: 'strings',
    requiredPlan: 'basic',
    features: ['Fingerstyle', 'Slap Bass', 'Pick Mode', 'Amp Simulation'],
    tutorialAvailable: false,
    href: '/virtual-lab.html?instrument=bass',
  },

  // Premium Tier Instruments
  violin: {
    id: 'virtual-violin',
    name: 'Virtual Violin',
    description: 'Expressive string instrument with realistic bowing physics',
    icon: '🎻',
    category: 'strings',
    requiredPlan: 'premium',
    features: ['Bow Physics', 'Vibrato', 'Pizzicato', 'Double Stops'],
    tutorialAvailable: true,
    href: '/virtual-lab.html?instrument=violin',
  },
  strings: {
    id: 'virtual-strings',
    name: 'String Ensemble',
    description: 'Full orchestral string section with section control',
    icon: '🎼',
    category: 'orchestral',
    requiredPlan: 'premium',
    features: ['Violins', 'Violas', 'Cellos', 'Basses', 'Ensemble Mix'],
    tutorialAvailable: true,
    href: '/virtual-lab.html?instrument=strings',
  },
  orchestral: {
    id: 'virtual-orchestra',
    name: 'Full Orchestra',
    description: 'Complete orchestral suite with all sections',
    icon: '🎶',
    category: 'orchestral',
    requiredPlan: 'premium',
    features: ['Strings', 'Brass', 'Woodwinds', 'Percussion', 'Conductor Mode'],
    tutorialAvailable: false,
    href: '/virtual-lab.html?instrument=orchestra',
  },

  // Pro Tier Instruments
  modular: {
    id: 'modular-synth',
    name: 'Modular Synthesizer',
    description: 'Fully patchable modular synthesis environment',
    icon: '🔌',
    category: 'synthesizers',
    requiredPlan: 'pro',
    features: ['Unlimited Modules', 'CV/Gate', 'Custom Patches', 'Export'],
    tutorialAvailable: true,
    href: '/modular-demo.html',
  },
};

// ============================================================================
// UNIFIED PLATFORM STATE ENDPOINT
// ============================================================================

/**
 * GET /api/platform/state
 * Returns complete platform state for the current user
 * This is the main endpoint for frontend initialization
 */
router.get('/state', async (req, res) => {
  try {
    const isAuthenticated = !!req.user;
    
    // Build user state
    let userState = null;
    let subscriptionState = null;
    let features = {};
    let instruments = {};

    if (isAuthenticated) {
      // Get full user profile
      const user = await User.findById(req.user.id);
      userState = {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        roles: user.roles || ['user'],
        provider: user.sso_provider,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      };

      // Get subscription
      const subscription = await Subscription.getUserSubscription(req.user.id);
      subscriptionState = subscription ? {
        plan: subscription.plan_code,
        planName: subscription.plan_name,
        status: subscription.status,
        billingCycle: subscription.billing_cycle,
        currentPeriodEnd: subscription.current_period_end,
        isTrial: subscription.status === 'trialing',
        trialEndsAt: subscription.trial_ends_at,
      } : {
        plan: 'free',
        planName: 'Free',
        status: 'none',
      };

      // Calculate features
      features = calculateUserFeatures(subscriptionState.plan);
      
      // Calculate instrument access
      instruments = calculateInstrumentAccess(subscriptionState.plan);
    } else {
      // Guest user
      subscriptionState = { plan: 'guest', planName: 'Guest', status: 'none' };
      features = calculateUserFeatures('guest');
      instruments = calculateInstrumentAccess('guest');
    }

    return res.json({
      success: true,
      authenticated: isAuthenticated,
      user: userState,
      subscription: subscriptionState,
      features,
      instruments,
      navigation: getNavigationConfig(isAuthenticated, subscriptionState?.plan),
    });
  } catch (error) {
    console.error('Platform state error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get platform state',
    });
  }
});

// ============================================================================
// VIRTUAL LAB ENDPOINTS
// ============================================================================

/**
 * GET /api/platform/instruments
 * Returns all virtual lab instruments with access status
 */
router.get('/instruments', async (req, res) => {
  try {
    let userPlan = 'guest';
    
    if (req.user) {
      const subscription = await Subscription.getUserSubscription(req.user.id);
      userPlan = subscription?.plan_code || 'free';
    }

    const instruments = calculateInstrumentAccess(userPlan);
    
    return res.json({
      success: true,
      currentPlan: userPlan,
      instruments,
      categories: getInstrumentCategories(),
    });
  } catch (error) {
    console.error('Instruments error:', error);
    return res.status(500).json({ error: 'Failed to get instruments' });
  }
});

/**
 * GET /api/platform/instruments/:instrumentId
 * Get single instrument details with access check
 */
router.get('/instruments/:instrumentId', async (req, res) => {
  try {
    const { instrumentId } = req.params;
    const instrument = Object.values(VIRTUAL_LAB_INSTRUMENTS)
      .find(i => i.id === instrumentId || Object.keys(VIRTUAL_LAB_INSTRUMENTS).includes(instrumentId));

    if (!instrument) {
      return res.status(404).json({ error: 'Instrument not found' });
    }

    let userPlan = 'guest';
    if (req.user) {
      const subscription = await Subscription.getUserSubscription(req.user.id);
      userPlan = subscription?.plan_code || 'free';
    }

    const userPlanLevel = PLAN_HIERARCHY[userPlan] || 0;
    const requiredLevel = PLAN_HIERARCHY[instrument.requiredPlan] || 1;
    const hasAccess = userPlanLevel >= requiredLevel;

    return res.json({
      success: true,
      instrument: {
        ...instrument,
        hasAccess,
        currentPlan: userPlan,
        upgradeUrl: hasAccess ? null : '/pricing.html',
      },
    });
  } catch (error) {
    console.error('Instrument detail error:', error);
    return res.status(500).json({ error: 'Failed to get instrument' });
  }
});

/**
 * GET /api/platform/instruments/:instrumentId/tutorial
 * Get tutorial content for an instrument (requires access)
 */
router.get('/instruments/:instrumentId/tutorial', async (req, res) => {
  try {
    const { instrumentId } = req.params;
    const instrumentKey = Object.keys(VIRTUAL_LAB_INSTRUMENTS)
      .find(k => VIRTUAL_LAB_INSTRUMENTS[k].id === instrumentId || k === instrumentId);
    
    const instrument = VIRTUAL_LAB_INSTRUMENTS[instrumentKey];

    if (!instrument) {
      return res.status(404).json({ error: 'Instrument not found' });
    }

    if (!instrument.tutorialAvailable) {
      return res.status(404).json({ error: 'Tutorial not available for this instrument' });
    }

    // Check access
    let userPlan = 'guest';
    if (req.user) {
      const subscription = await Subscription.getUserSubscription(req.user.id);
      userPlan = subscription?.plan_code || 'free';
    }

    const userPlanLevel = PLAN_HIERARCHY[userPlan] || 0;
    const requiredLevel = PLAN_HIERARCHY[instrument.requiredPlan] || 1;
    
    if (userPlanLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Upgrade required',
        requiredPlan: instrument.requiredPlan,
        upgradeUrl: '/pricing.html',
      });
    }

    // Return tutorial content
    const tutorials = getTutorialContent(instrumentKey);
    
    return res.json({
      success: true,
      instrument: instrument.name,
      tutorials,
    });
  } catch (error) {
    console.error('Tutorial error:', error);
    return res.status(500).json({ error: 'Failed to get tutorial' });
  }
});

// ============================================================================
// FEATURE CHECK ENDPOINTS
// ============================================================================

/**
 * POST /api/platform/check-access
 * Batch check access to multiple features/instruments
 */
router.post('/check-access', async (req, res) => {
  try {
    const { features: featureCodes = [], instruments: instrumentIds = [] } = req.body;

    let userPlan = 'guest';
    if (req.user) {
      const subscription = await Subscription.getUserSubscription(req.user.id);
      userPlan = subscription?.plan_code || 'free';
    }

    const userPlanLevel = PLAN_HIERARCHY[userPlan] || 0;

    // Check features
    const featureResults = {};
    featureCodes.forEach(code => {
      const requiredPlan = FEATURE_REQUIREMENTS[code] || 'free';
      const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 1;
      featureResults[code] = {
        hasAccess: userPlanLevel >= requiredLevel,
        requiredPlan,
      };
    });

    // Check instruments
    const instrumentResults = {};
    instrumentIds.forEach(id => {
      const instrument = Object.values(VIRTUAL_LAB_INSTRUMENTS)
        .find(i => i.id === id);
      if (instrument) {
        const requiredLevel = PLAN_HIERARCHY[instrument.requiredPlan] || 1;
        instrumentResults[id] = {
          hasAccess: userPlanLevel >= requiredLevel,
          requiredPlan: instrument.requiredPlan,
        };
      }
    });

    return res.json({
      success: true,
      currentPlan: userPlan,
      features: featureResults,
      instruments: instrumentResults,
    });
  } catch (error) {
    console.error('Check access error:', error);
    return res.status(500).json({ error: 'Failed to check access' });
  }
});

// ============================================================================
// USER ACTIVITY & PREFERENCES
// ============================================================================

/**
 * POST /api/platform/activity
 * Log user activity (for analytics and personalization)
 */
router.post('/activity', requireAuth, async (req, res) => {
  try {
    const { action, resource, metadata = {} } = req.body;
    
    // Log activity (could store in database for analytics)
    console.log(`[Activity] User ${req.user.id}: ${action} on ${resource}`, metadata);

    return res.json({ success: true });
  } catch (error) {
    console.error('Activity log error:', error);
    return res.status(500).json({ error: 'Failed to log activity' });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate which features a user has access to based on their plan
 */
function calculateUserFeatures(userPlan) {
  const userPlanLevel = PLAN_HIERARCHY[userPlan] || 0;
  const features = {};

  Object.entries(FEATURE_REQUIREMENTS).forEach(([feature, requiredPlan]) => {
    const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 1;
    features[feature] = {
      available: userPlanLevel >= requiredLevel,
      locked: userPlanLevel < requiredLevel,
      requiredPlan,
    };
  });

  return features;
}

/**
 * Calculate which instruments a user has access to
 */
function calculateInstrumentAccess(userPlan) {
  const userPlanLevel = PLAN_HIERARCHY[userPlan] || 0;
  const instruments = {};

  Object.entries(VIRTUAL_LAB_INSTRUMENTS).forEach(([key, instrument]) => {
    const requiredLevel = PLAN_HIERARCHY[instrument.requiredPlan] || 1;
    const hasAccess = userPlanLevel >= requiredLevel;

    instruments[key] = {
      ...instrument,
      hasAccess,
      locked: !hasAccess,
      upgradeUrl: hasAccess ? null : '/pricing.html',
    };
  });

  return instruments;
}

/**
 * Get instrument categories for filtering
 */
function getInstrumentCategories() {
  const categories = {};
  
  Object.values(VIRTUAL_LAB_INSTRUMENTS).forEach(instrument => {
    if (!categories[instrument.category]) {
      categories[instrument.category] = {
        name: instrument.category.charAt(0).toUpperCase() + instrument.category.slice(1),
        count: 0,
      };
    }
    categories[instrument.category].count++;
  });

  return categories;
}

/**
 * Get navigation configuration based on auth state and plan
 */
function getNavigationConfig(isAuthenticated, userPlan) {
  const nav = {
    main: [
      { label: 'Home', href: '/', icon: 'fa-home', access: 'all' },
      { label: 'Radio', href: '/radio.html', icon: 'fa-broadcast-tower', access: 'all' },
      { label: 'Virtual Lab', href: '/virtual-lab.html', icon: 'fa-flask', access: 'all' },
      { label: 'Studio', href: '/studio.html', icon: 'fa-sliders-h', access: 'authenticated' },
      { label: 'Presets', href: '/preset-browser.html', icon: 'fa-database', access: 'all' },
    ],
    user: isAuthenticated ? [
      { label: 'Dashboard', href: '/user-dashboard.html', icon: 'fa-tachometer-alt' },
      { label: 'Settings', href: '/user-dashboard.html#settings', icon: 'fa-cog' },
      { label: 'Logout', href: '/auth/logout', icon: 'fa-sign-out-alt' },
    ] : [
      { label: 'Sign In', href: '/login.html', icon: 'fa-sign-in-alt' },
    ],
    upgrade: userPlan === 'free' || userPlan === 'guest' ? {
      show: true,
      label: 'Upgrade',
      href: '/pricing.html',
      highlight: true,
    } : null,
  };

  return nav;
}

/**
 * Get tutorial content for an instrument
 */
function getTutorialContent(instrumentKey) {
  const tutorials = {
    piano: [
      { title: 'Getting Started', duration: '5 min', level: 'beginner' },
      { title: 'Playing Chords', duration: '10 min', level: 'beginner' },
      { title: 'Using the Pedal', duration: '8 min', level: 'intermediate' },
    ],
    guitar: [
      { title: 'Guitar Basics', duration: '7 min', level: 'beginner' },
      { title: 'Strumming Patterns', duration: '12 min', level: 'beginner' },
      { title: 'Fingerpicking Intro', duration: '15 min', level: 'intermediate' },
    ],
    violin: [
      { title: 'Violin Introduction', duration: '8 min', level: 'beginner' },
      { title: 'Bowing Techniques', duration: '15 min', level: 'intermediate' },
      { title: 'Vibrato Mastery', duration: '20 min', level: 'advanced' },
    ],
    strings: [
      { title: 'String Ensemble Basics', duration: '10 min', level: 'beginner' },
      { title: 'Section Balancing', duration: '12 min', level: 'intermediate' },
      { title: 'Orchestral Writing', duration: '25 min', level: 'advanced' },
    ],
    drums: [
      { title: 'Drum Kit Overview', duration: '5 min', level: 'beginner' },
      { title: 'Basic Beats', duration: '10 min', level: 'beginner' },
      { title: 'Fill Patterns', duration: '15 min', level: 'intermediate' },
    ],
    synth2600: [
      { title: 'Synth Fundamentals', duration: '10 min', level: 'beginner' },
      { title: 'Sound Design Basics', duration: '20 min', level: 'intermediate' },
      { title: 'Modular Patching', duration: '30 min', level: 'advanced' },
    ],
    modular: [
      { title: 'Modular Concepts', duration: '15 min', level: 'intermediate' },
      { title: 'CV/Gate Explained', duration: '20 min', level: 'intermediate' },
      { title: 'Complex Patches', duration: '45 min', level: 'advanced' },
    ],
  };

  return tutorials[instrumentKey] || [];
}

module.exports = router;

// Export configuration for use by other modules
module.exports.VIRTUAL_LAB_INSTRUMENTS = VIRTUAL_LAB_INSTRUMENTS;
module.exports.calculateUserFeatures = calculateUserFeatures;
module.exports.calculateInstrumentAccess = calculateInstrumentAccess;
