/**
 * Premium Service - HAOS.fm
 * Handles premium plan features, limits, and access control
 * 
 * Plan Tiers:
 * - FREE: Basic access with limits
 * - BASIC: Extended access with higher limits
 * - PREMIUM: Full access with most features
 * - PRO: Unlimited access with all features
 */

const Subscription = require('../models/subscription');

// ============================================================================
// PLAN DEFINITIONS
// ============================================================================

const PLANS = {
  free: {
    code: 'free',
    name: 'Free',
    description: 'Get started with HAOS.fm',
    price: { monthly: 0, yearly: 0 },
    currency: 'USD',
    badge: { text: 'FREE', color: '#6B6B6B' },
    order: 1,
    features: {
      // Preset Library
      presetDownloads: { limit: 5, period: 'day', label: '5 presets/day' },
      presetCategories: ['basic'],
      exclusivePresets: false,
      
      // Workspaces
      workspaceAccess: ['sounds'],
      workspaceSaves: { limit: 3, label: '3 saved patches' },
      collaborationSessions: { limit: 0, label: 'No collaboration' },
      
      // Audio Features
      audioExport: { formats: ['wav'], quality: 'standard' },
      sampleRate: 44100,
      
      // Storage
      cloudStorage: { limit: 0, unit: 'MB', label: 'No cloud storage' },
      
      // Support
      supportLevel: 'community',
      
      // Extras
      customPresets: false,
      apiAccess: false,
      priorityRendering: false,
      noAds: false,
    },
  },
  
  basic: {
    code: 'basic',
    name: 'Basic',
    description: 'For hobbyist producers',
    price: { monthly: 499, yearly: 4990 }, // cents
    currency: 'USD',
    badge: { text: 'BASIC', color: '#00D9FF' },
    order: 2,
    features: {
      // Preset Library
      presetDownloads: { limit: 25, period: 'day', label: '25 presets/day' },
      presetCategories: ['basic', 'extended'],
      exclusivePresets: false,
      
      // Workspaces
      workspaceAccess: ['sounds', 'techno'],
      workspaceSaves: { limit: 25, label: '25 saved patches' },
      collaborationSessions: { limit: 2, label: '2 sessions/month' },
      
      // Audio Features
      audioExport: { formats: ['wav', 'mp3'], quality: 'high' },
      sampleRate: 48000,
      
      // Storage
      cloudStorage: { limit: 100, unit: 'MB', label: '100 MB storage' },
      
      // Support
      supportLevel: 'email',
      
      // Extras
      customPresets: true,
      apiAccess: false,
      priorityRendering: false,
      noAds: true,
    },
  },
  
  premium: {
    code: 'premium',
    name: 'Premium',
    description: 'For serious producers',
    price: { monthly: 999, yearly: 9990 }, // cents
    currency: 'USD',
    badge: { text: 'PREMIUM', color: '#D4AF37' },
    order: 3,
    featured: true,
    features: {
      // Preset Library
      presetDownloads: { limit: -1, period: 'unlimited', label: 'Unlimited downloads' },
      presetCategories: ['basic', 'extended', 'premium'],
      exclusivePresets: true,
      
      // Workspaces
      workspaceAccess: ['sounds', 'techno', 'modular', 'builder'],
      workspaceSaves: { limit: -1, label: 'Unlimited patches' },
      collaborationSessions: { limit: 10, label: '10 sessions/month' },
      
      // Audio Features
      audioExport: { formats: ['wav', 'mp3', 'flac', 'aiff'], quality: 'studio' },
      sampleRate: 96000,
      
      // Storage
      cloudStorage: { limit: 1024, unit: 'MB', label: '1 GB storage' },
      
      // Support
      supportLevel: 'priority',
      
      // Extras
      customPresets: true,
      apiAccess: true,
      priorityRendering: true,
      noAds: true,
    },
  },
  
  pro: {
    code: 'pro',
    name: 'Pro',
    description: 'For professional studios',
    price: { monthly: 2499, yearly: 24990 }, // cents
    currency: 'USD',
    badge: { text: 'PRO', color: '#FF6B35' },
    order: 4,
    features: {
      // Preset Library
      presetDownloads: { limit: -1, period: 'unlimited', label: 'Unlimited downloads' },
      presetCategories: ['basic', 'extended', 'premium', 'pro'],
      exclusivePresets: true,
      
      // Workspaces
      workspaceAccess: ['sounds', 'techno', 'modular', 'builder', 'studio'],
      workspaceSaves: { limit: -1, label: 'Unlimited patches' },
      collaborationSessions: { limit: -1, label: 'Unlimited sessions' },
      
      // Audio Features
      audioExport: { formats: ['wav', 'mp3', 'flac', 'aiff', 'stem'], quality: 'mastering' },
      sampleRate: 192000,
      
      // Storage
      cloudStorage: { limit: 10240, unit: 'MB', label: '10 GB storage' },
      
      // Support
      supportLevel: 'dedicated',
      
      // Extras
      customPresets: true,
      apiAccess: true,
      priorityRendering: true,
      noAds: true,
      commercialLicense: true,
      whiteLabel: true,
    },
  },
};

// Feature codes for gate checks
const FEATURE_CODES = {
  UNLIMITED_DOWNLOADS: 'unlimited_downloads',
  EXCLUSIVE_PRESETS: 'exclusive_presets',
  MODULAR_WORKSPACE: 'modular_workspace',
  BUILDER_WORKSPACE: 'builder_workspace',
  TECHNO_WORKSPACE: 'techno_workspace',
  STUDIO_WORKSPACE: 'studio_workspace',
  CLOUD_STORAGE: 'cloud_storage',
  COLLABORATION: 'collaboration',
  PRIORITY_RENDER: 'priority_render',
  API_ACCESS: 'api_access',
  HIGH_QUALITY_EXPORT: 'high_quality_export',
  CUSTOM_PRESETS: 'custom_presets',
  COMMERCIAL_LICENSE: 'commercial_license',
};

// ============================================================================
// PREMIUM SERVICE CLASS
// ============================================================================

class PremiumService {
  /**
   * Get all available plans
   */
  static getPlans() {
    return Object.values(PLANS).sort((a, b) => a.order - b.order);
  }

  /**
   * Get a specific plan by code
   */
  static getPlan(planCode) {
    return PLANS[planCode] || PLANS.free;
  }

  /**
   * Get user's current plan (with defaults for non-authenticated users)
   */
  static async getUserPlan(userId) {
    if (!userId) {
      return PLANS.free;
    }

    try {
      const subscription = await Subscription.getUserSubscription(userId);
      if (subscription && subscription.plan_code) {
        return PLANS[subscription.plan_code] || PLANS.free;
      }
    } catch (error) {
      console.error('Error fetching user plan:', error);
    }

    return PLANS.free;
  }

  /**
   * Check if user has access to a feature
   */
  static async hasFeature(userId, featureCode) {
    const plan = await this.getUserPlan(userId);
    
    switch (featureCode) {
      case FEATURE_CODES.UNLIMITED_DOWNLOADS:
        return plan.features.presetDownloads.limit === -1;
      
      case FEATURE_CODES.EXCLUSIVE_PRESETS:
        return plan.features.exclusivePresets;
      
      case FEATURE_CODES.MODULAR_WORKSPACE:
        return plan.features.workspaceAccess.includes('modular');
      
      case FEATURE_CODES.BUILDER_WORKSPACE:
        return plan.features.workspaceAccess.includes('builder');
      
      case FEATURE_CODES.TECHNO_WORKSPACE:
        return plan.features.workspaceAccess.includes('techno');
      
      case FEATURE_CODES.STUDIO_WORKSPACE:
        return plan.features.workspaceAccess.includes('studio');
      
      case FEATURE_CODES.CLOUD_STORAGE:
        return plan.features.cloudStorage.limit > 0;
      
      case FEATURE_CODES.COLLABORATION:
        return plan.features.collaborationSessions.limit !== 0;
      
      case FEATURE_CODES.PRIORITY_RENDER:
        return plan.features.priorityRendering;
      
      case FEATURE_CODES.API_ACCESS:
        return plan.features.apiAccess;
      
      case FEATURE_CODES.HIGH_QUALITY_EXPORT:
        return plan.features.sampleRate >= 96000;
      
      case FEATURE_CODES.CUSTOM_PRESETS:
        return plan.features.customPresets;
      
      case FEATURE_CODES.COMMERCIAL_LICENSE:
        return plan.features.commercialLicense || false;
      
      default:
        return false;
    }
  }

  /**
   * Check if user can access a workspace
   */
  static async canAccessWorkspace(userId, workspaceName) {
    const plan = await this.getUserPlan(userId);
    return plan.features.workspaceAccess.includes(workspaceName.toLowerCase());
  }

  /**
   * Get user's download limit status
   */
  static async getDownloadStatus(userId) {
    const plan = await this.getUserPlan(userId);
    const limit = plan.features.presetDownloads.limit;
    
    if (limit === -1) {
      return {
        unlimited: true,
        remaining: -1,
        limit: -1,
        used: 0,
        resetTime: null,
      };
    }

    // In production, track actual usage in database
    // For now, return simulated status
    const used = Math.floor(Math.random() * (limit / 2));
    
    return {
      unlimited: false,
      remaining: limit - used,
      limit,
      used,
      resetTime: this.getNextResetTime(plan.features.presetDownloads.period),
    };
  }

  /**
   * Track a download (returns true if allowed)
   */
  static async trackDownload(userId, presetId) {
    const plan = await this.getUserPlan(userId);
    const limit = plan.features.presetDownloads.limit;
    
    if (limit === -1) {
      return { allowed: true, remaining: -1 };
    }

    // In production, check and increment actual usage
    const status = await this.getDownloadStatus(userId);
    
    if (status.remaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        error: 'Daily download limit reached',
        upgradeRequired: true,
      };
    }

    return {
      allowed: true,
      remaining: status.remaining - 1,
    };
  }

  /**
   * Check if user can access a preset category
   */
  static async canAccessPresetCategory(userId, category) {
    const plan = await this.getUserPlan(userId);
    return plan.features.presetCategories.includes(category.toLowerCase());
  }

  /**
   * Get the next reset time for limits
   */
  static getNextResetTime(period) {
    const now = new Date();
    
    switch (period) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      case 'week':
        return new Date(now.getTime() + (7 - now.getDay()) * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
      default:
        return null;
    }
  }

  /**
   * Get comparison data for upgrade prompt
   */
  static getUpgradeComparison(currentPlan, targetPlan) {
    const current = PLANS[currentPlan] || PLANS.free;
    const target = PLANS[targetPlan] || PLANS.premium;

    const improvements = [];

    // Downloads
    if (target.features.presetDownloads.limit > current.features.presetDownloads.limit) {
      improvements.push({
        icon: '⬇️',
        title: 'More Downloads',
        current: current.features.presetDownloads.label,
        upgrade: target.features.presetDownloads.label,
      });
    }

    // Workspaces
    const newWorkspaces = target.features.workspaceAccess.filter(
      w => !current.features.workspaceAccess.includes(w)
    );
    if (newWorkspaces.length > 0) {
      improvements.push({
        icon: '🎛️',
        title: 'New Workspaces',
        current: `${current.features.workspaceAccess.length} workspaces`,
        upgrade: `+${newWorkspaces.length} workspaces (${newWorkspaces.join(', ')})`,
      });
    }

    // Exclusive Presets
    if (target.features.exclusivePresets && !current.features.exclusivePresets) {
      improvements.push({
        icon: '⭐',
        title: 'Exclusive Presets',
        current: 'No access',
        upgrade: 'Premium preset library',
      });
    }

    // Storage
    if (target.features.cloudStorage.limit > current.features.cloudStorage.limit) {
      improvements.push({
        icon: '☁️',
        title: 'Cloud Storage',
        current: current.features.cloudStorage.label,
        upgrade: target.features.cloudStorage.label,
      });
    }

    // Audio Quality
    if (target.features.sampleRate > current.features.sampleRate) {
      improvements.push({
        icon: '🎵',
        title: 'Audio Quality',
        current: `${current.features.sampleRate / 1000}kHz`,
        upgrade: `${target.features.sampleRate / 1000}kHz`,
      });
    }

    return {
      current: {
        code: current.code,
        name: current.name,
        badge: current.badge,
      },
      target: {
        code: target.code,
        name: target.name,
        badge: target.badge,
        price: target.price,
        currency: target.currency,
      },
      improvements,
      priceDifference: {
        monthly: target.price.monthly - current.price.monthly,
        yearly: target.price.yearly - current.price.yearly,
      },
    };
  }

  /**
   * Format price for display
   */
  static formatPrice(cents, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);
  }

  /**
   * Get client-side user state (safe to send to browser)
   */
  static async getClientState(userId) {
    const plan = await this.getUserPlan(userId);
    const downloadStatus = await this.getDownloadStatus(userId);

    return {
      isAuthenticated: !!userId,
      plan: {
        code: plan.code,
        name: plan.name,
        badge: plan.badge,
        features: plan.features,
      },
      downloads: downloadStatus,
      featureAccess: {
        unlimitedDownloads: plan.features.presetDownloads.limit === -1,
        exclusivePresets: plan.features.exclusivePresets,
        modularWorkspace: plan.features.workspaceAccess.includes('modular'),
        builderWorkspace: plan.features.workspaceAccess.includes('builder'),
        technoWorkspace: plan.features.workspaceAccess.includes('techno'),
        collaboration: plan.features.collaborationSessions.limit !== 0,
        cloudStorage: plan.features.cloudStorage.limit > 0,
        customPresets: plan.features.customPresets,
      },
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  PremiumService,
  PLANS,
  FEATURE_CODES,
};
