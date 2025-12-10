/**
 * API Feature Management Service
 * Manages enabling/disabling of API endpoints with file-based persistence
 */

const fs = require('fs');
const path = require('path');

// Default API endpoint configurations
const DEFAULT_API_ENDPOINTS = {
  // Core APIs
  'api.notes': {
    name: 'Notes API',
    description: 'CRUD operations for notes and tasks',
    route: '/api/notes',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    category: 'core',
    enabled: true,
    critical: true,
    rateLimit: { requests: 100, window: '1m' },
  },
  'api.health': {
    name: 'Health Check API',
    description: 'System health and status endpoints',
    route: '/api/health',
    methods: ['GET'],
    category: 'core',
    enabled: true,
    critical: true,
    rateLimit: null,
  },

  // Music & Synthesis APIs
  'api.music': {
    name: 'Music API',
    description: 'Music production and synthesis endpoints',
    route: '/api/music',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    category: 'music',
    enabled: true,
    critical: false,
    rateLimit: { requests: 50, window: '1m' },
  },
  'api.music.presets': {
    name: 'Presets API',
    description: 'Synthesizer preset management',
    route: '/api/music/presets',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    category: 'music',
    enabled: true,
    critical: false,
    rateLimit: { requests: 60, window: '1m' },
  },
  'api.patches': {
    name: 'Patches API',
    description: 'Synth patch storage and retrieval',
    route: '/api/patches',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    category: 'music',
    enabled: true,
    critical: false,
    rateLimit: { requests: 50, window: '1m' },
  },
  'api.tracks': {
    name: 'Tracks API',
    description: 'Audio track management and streaming',
    route: '/api/tracks',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    category: 'music',
    enabled: true,
    critical: false,
    rateLimit: { requests: 30, window: '1m' },
  },
  'api.studio': {
    name: 'Studio API',
    description: 'Studio session management',
    route: '/api/studio',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    category: 'music',
    enabled: true,
    critical: false,
    rateLimit: { requests: 40, window: '1m' },
  },

  // User & Auth APIs
  'api.users': {
    name: 'Users API',
    description: 'User management endpoints',
    route: '/api/users',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    category: 'auth',
    enabled: true,
    critical: true,
    rateLimit: { requests: 30, window: '1m' },
  },
  'api.registration': {
    name: 'Registration API',
    description: 'User registration and onboarding',
    route: '/api/registration',
    methods: ['POST'],
    category: 'auth',
    enabled: true,
    critical: true,
    rateLimit: { requests: 10, window: '1m' },
  },

  // Admin APIs
  'api.admin': {
    name: 'Admin API',
    description: 'Administrative operations',
    route: '/api/admin',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    category: 'admin',
    enabled: true,
    critical: true,
    rateLimit: { requests: 100, window: '1m' },
  },
  'api.admin.auth': {
    name: 'Admin Auth API',
    description: 'Admin authentication (JWT)',
    route: '/api/admin/auth',
    methods: ['POST', 'GET', 'DELETE'],
    category: 'admin',
    enabled: true,
    critical: true,
    rateLimit: { requests: 20, window: '1m' },
  },

  // Feature APIs
  'api.features': {
    name: 'Features API',
    description: 'Feature flag management',
    route: '/api/features',
    methods: ['GET'],
    category: 'core',
    enabled: true,
    critical: false,
    rateLimit: { requests: 50, window: '1m' },
  },

  // Payment & Subscription APIs
  'api.payments': {
    name: 'Payments API',
    description: 'Payment processing endpoints',
    route: '/api/payments',
    methods: ['GET', 'POST'],
    category: 'billing',
    enabled: true,
    critical: false,
    rateLimit: { requests: 20, window: '1m' },
  },
  'api.subscriptions': {
    name: 'Subscriptions API',
    description: 'Subscription management',
    route: '/api/subscriptions',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    category: 'billing',
    enabled: true,
    critical: false,
    rateLimit: { requests: 30, window: '1m' },
  },

  // Calendar & Meetings APIs
  'api.calendar': {
    name: 'Calendar API',
    description: 'Calendar sync and events',
    route: '/api/calendar',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    category: 'collaboration',
    enabled: true,
    critical: false,
    rateLimit: { requests: 40, window: '1m' },
  },
  'api.meetings': {
    name: 'Meetings API',
    description: 'Meeting room management',
    route: '/api/meetings',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    category: 'collaboration',
    enabled: true,
    critical: false,
    rateLimit: { requests: 30, window: '1m' },
  },

  // Share & Collaboration APIs
  'api.share': {
    name: 'Share API',
    description: 'Content sharing and collaboration',
    route: '/api/share',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    category: 'collaboration',
    enabled: true,
    critical: false,
    rateLimit: { requests: 25, window: '1m' },
  },

  // PWA APIs
  'api.pwa': {
    name: 'PWA API',
    description: 'Progressive Web App endpoints',
    route: '/api/pwa',
    methods: ['GET', 'POST'],
    category: 'core',
    enabled: true,
    critical: false,
    rateLimit: { requests: 50, window: '1m' },
  },
};

class APIFeatureService {
  constructor() {
    this.configPath = path.join(__dirname, '../data/api-features.json');
    this.endpoints = {};
    this.listeners = [];
    this.initialized = false;
  }

  /**
   * Initialize the service by loading saved state
   */
  async init() {
    if (this.initialized) return;

    try {
      await this.loadState();
      this.initialized = true;
      console.log('[APIFeatureService] Initialized with', Object.keys(this.endpoints).length, 'endpoints');
    } catch (error) {
      console.error('[APIFeatureService] Init error:', error.message);
      // Use defaults on error
      this.endpoints = { ...DEFAULT_API_ENDPOINTS };
      this.initialized = true;
    }
  }

  /**
   * Load state from file or use defaults
   */
  async loadState() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.configPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        const saved = JSON.parse(data);

        // Merge saved state with defaults (in case new endpoints were added)
        this.endpoints = { ...DEFAULT_API_ENDPOINTS };
        Object.keys(saved.endpoints || {}).forEach((key) => {
          if (this.endpoints[key]) {
            this.endpoints[key] = {
              ...this.endpoints[key],
              ...saved.endpoints[key],
            };
          }
        });

        console.log('[APIFeatureService] Loaded state from file');
      } else {
        // Use defaults and save initial state
        this.endpoints = { ...DEFAULT_API_ENDPOINTS };
        await this.saveState();
        console.log('[APIFeatureService] Created initial state file');
      }
    } catch (error) {
      console.error('[APIFeatureService] Load error:', error.message);
      this.endpoints = { ...DEFAULT_API_ENDPOINTS };
    }
  }

  /**
   * Save current state to file
   */
  async saveState() {
    try {
      const data = {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        endpoints: this.endpoints,
      };

      const dataDir = path.dirname(this.configPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2), 'utf8');
      console.log('[APIFeatureService] State saved');
      return true;
    } catch (error) {
      console.error('[APIFeatureService] Save error:', error.message);
      throw error;
    }
  }

  /**
   * Get all API endpoints with their status
   */
  getAllEndpoints() {
    return Object.entries(this.endpoints).map(([id, config]) => ({
      id,
      ...config,
    }));
  }

  /**
   * Get endpoints by category
   */
  getEndpointsByCategory(category) {
    return this.getAllEndpoints().filter((ep) => ep.category === category);
  }

  /**
   * Get a single endpoint configuration
   */
  getEndpoint(id) {
    return this.endpoints[id] ? { id, ...this.endpoints[id] } : null;
  }

  /**
   * Check if an endpoint is enabled
   */
  isEnabled(id) {
    return this.endpoints[id]?.enabled ?? false;
  }

  /**
   * Check if a route matches an endpoint
   */
  matchRoute(requestPath) {
    for (const [id, config] of Object.entries(this.endpoints)) {
      if (requestPath.startsWith(config.route)) {
        return { id, ...config };
      }
    }
    return null;
  }

  /**
   * Enable an API endpoint
   */
  async enableEndpoint(id, updatedBy = 'system') {
    if (!this.endpoints[id]) {
      throw new Error(`Endpoint ${id} not found`);
    }

    this.endpoints[id].enabled = true;
    this.endpoints[id].lastModified = new Date().toISOString();
    this.endpoints[id].modifiedBy = updatedBy;

    await this.saveState();
    this.notifyListeners('enable', { id, endpoint: this.endpoints[id] });

    return this.getEndpoint(id);
  }

  /**
   * Disable an API endpoint
   */
  async disableEndpoint(id, updatedBy = 'system') {
    if (!this.endpoints[id]) {
      throw new Error(`Endpoint ${id} not found`);
    }

    if (this.endpoints[id].critical) {
      throw new Error(`Cannot disable critical endpoint: ${this.endpoints[id].name}`);
    }

    this.endpoints[id].enabled = false;
    this.endpoints[id].lastModified = new Date().toISOString();
    this.endpoints[id].modifiedBy = updatedBy;

    await this.saveState();
    this.notifyListeners('disable', { id, endpoint: this.endpoints[id] });

    return this.getEndpoint(id);
  }

  /**
   * Toggle an API endpoint
   */
  async toggleEndpoint(id, enabled, updatedBy = 'system') {
    if (enabled) {
      return this.enableEndpoint(id, updatedBy);
    }
    return this.disableEndpoint(id, updatedBy);
  }

  /**
   * Update endpoint rate limit
   */
  async updateRateLimit(id, rateLimit, updatedBy = 'system') {
    if (!this.endpoints[id]) {
      throw new Error(`Endpoint ${id} not found`);
    }

    this.endpoints[id].rateLimit = rateLimit;
    this.endpoints[id].lastModified = new Date().toISOString();
    this.endpoints[id].modifiedBy = updatedBy;

    await this.saveState();
    this.notifyListeners('rateLimit', { id, endpoint: this.endpoints[id] });

    return this.getEndpoint(id);
  }

  /**
   * Bulk toggle endpoints
   */
  async bulkToggle(operations, updatedBy = 'system') {
    const results = [];
    const errors = [];

    for (const op of operations) {
      try {
        const result = await this.toggleEndpoint(op.id, op.enabled, updatedBy);
        results.push(result);
      } catch (error) {
        errors.push({ id: op.id, error: error.message });
      }
    }

    return { results, errors };
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const all = this.getAllEndpoints();
    const byCategory = {};

    all.forEach((ep) => {
      if (!byCategory[ep.category]) {
        byCategory[ep.category] = { total: 0, enabled: 0, disabled: 0 };
      }
      byCategory[ep.category].total++;
      if (ep.enabled) {
        byCategory[ep.category].enabled++;
      } else {
        byCategory[ep.category].disabled++;
      }
    });

    return {
      total: all.length,
      enabled: all.filter((ep) => ep.enabled).length,
      disabled: all.filter((ep) => !ep.enabled).length,
      critical: all.filter((ep) => ep.critical).length,
      byCategory,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Add event listener
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove event listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter((l) => l !== callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach((callback) => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('[APIFeatureService] Listener error:', error.message);
      }
    });
  }

  /**
   * Reset to defaults
   */
  async resetToDefaults(updatedBy = 'system') {
    this.endpoints = { ...DEFAULT_API_ENDPOINTS };
    await this.saveState();
    this.notifyListeners('reset', { updatedBy });
    return this.getAllEndpoints();
  }
}

// Singleton instance
const apiFeatureService = new APIFeatureService();

module.exports = {
  apiFeatureService,
  APIFeatureService,
  DEFAULT_API_ENDPOINTS,
};
