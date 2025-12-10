/**
 * HAOS Platform Frontend Integration
 * 
 * Unified JavaScript module for managing platform state across all frontend pages.
 * Connects to the backend platform-integration service and provides:
 * - Authentication state management
 * - Feature access control (UI)
 * - Virtual Lab instrument access
 * - Navigation rendering
 * - Upgrade prompts
 * 
 * Usage:
 *   <script src="/js/haos-platform.js"></script>
 *   <script>
 *     HaosPlatform.init().then(state => {
 *       console.log('Platform ready:', state);
 *     });
 *   </script>
 * 
 * HTML Data Attributes:
 *   data-feature="feature-code"     - Show/hide based on feature access
 *   data-instrument="instrument-id" - Show/hide based on instrument access
 *   data-auth="required"            - Show only when authenticated
 *   data-auth="guest"               - Show only when NOT authenticated
 *   data-plan="premium"             - Show only for specific plan or higher
 */

(function(window) {
  'use strict';

  // ============================================================================
  // HAOS Platform Module
  // ============================================================================

  const HaosPlatform = {
    // State
    state: {
      authenticated: false,
      user: null,
      subscription: null,
      features: {},
      instruments: {},
      navigation: null,
    },
    
    initialized: false,
    listeners: [],

    // Configuration
    config: {
      stateEndpoint: '/api/platform/state',
      instrumentsEndpoint: '/api/platform/instruments',
      checkAccessEndpoint: '/api/platform/check-access',
      loginUrl: '/login.html',
      pricingUrl: '/pricing.html',
      dashboardUrl: '/user-dashboard.html',
      refreshInterval: 5 * 60 * 1000, // 5 minutes
    },

    // Plan hierarchy for client-side checks
    planHierarchy: {
      guest: 0,
      free: 1,
      basic: 2,
      starter: 2,
      premium: 3,
      pro: 4,
      enterprise: 5,
    },

    // ========================================================================
    // Initialization
    // ========================================================================

    /**
     * Initialize the platform module
     * @param {object} options - Configuration options
     * @returns {Promise<object>} Platform state
     */
    async init(options = {}) {
      Object.assign(this.config, options);

      try {
        // Fetch platform state
        await this.fetchState();
        
        // Apply UI updates
        this.applyAuthVisibility();
        this.applyFeatureVisibility();
        this.applyInstrumentVisibility();
        this.applyPlanVisibility();
        
        // Render navigation if container exists
        this.renderNavigation();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start refresh timer
        this.startRefreshTimer();
        
        this.initialized = true;

        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('haosPlatformReady', {
          detail: this.state
        }));

        // Notify listeners
        this.notifyListeners('ready', this.state);

        return this.state;
      } catch (error) {
        console.error('HaosPlatform initialization error:', error);
        
        // Set guest state on error
        this.state = {
          authenticated: false,
          user: null,
          subscription: { plan: 'guest', status: 'none' },
          features: {},
          instruments: {},
          navigation: null,
        };
        
        this.applyAuthVisibility();
        throw error;
      }
    },

    /**
     * Fetch platform state from server
     */
    async fetchState() {
      const response = await fetch(this.config.stateEndpoint, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch platform state');
      }

      const data = await response.json();
      
      if (data.success) {
        this.state = {
          authenticated: data.authenticated,
          user: data.user,
          subscription: data.subscription,
          features: data.features,
          instruments: data.instruments,
          navigation: data.navigation,
        };
      }

      return this.state;
    },

    // ========================================================================
    // State Accessors
    // ========================================================================

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
      return this.state.authenticated;
    },

    /**
     * Get current user
     */
    getUser() {
      return this.state.user;
    },

    /**
     * Get current subscription
     */
    getSubscription() {
      return this.state.subscription;
    },

    /**
     * Get current plan code
     */
    getCurrentPlan() {
      return this.state.subscription?.plan || 'guest';
    },

    /**
     * Get current plan level
     */
    getPlanLevel() {
      return this.planHierarchy[this.getCurrentPlan()] || 0;
    },

    // ========================================================================
    // Feature Access
    // ========================================================================

    /**
     * Check if user has access to a feature
     */
    hasFeature(featureCode) {
      const feature = this.state.features[featureCode];
      return feature?.available === true;
    },

    /**
     * Check if a feature is locked
     */
    isFeatureLocked(featureCode) {
      const feature = this.state.features[featureCode];
      return feature?.locked === true;
    },

    /**
     * Get required plan for a feature
     */
    getFeatureRequiredPlan(featureCode) {
      const feature = this.state.features[featureCode];
      return feature?.requiredPlan || 'free';
    },

    /**
     * Get all accessible features
     */
    getAccessibleFeatures() {
      return Object.entries(this.state.features)
        .filter(([_, f]) => f.available)
        .map(([code]) => code);
    },

    // ========================================================================
    // Instrument Access
    // ========================================================================

    /**
     * Check if user has access to an instrument
     */
    hasInstrument(instrumentId) {
      const instrument = this.state.instruments[instrumentId];
      return instrument?.hasAccess === true;
    },

    /**
     * Get instrument by ID
     */
    getInstrument(instrumentId) {
      return this.state.instruments[instrumentId] || null;
    },

    /**
     * Get all instruments
     */
    getAllInstruments() {
      return Object.values(this.state.instruments);
    },

    /**
     * Get accessible instruments
     */
    getAccessibleInstruments() {
      return Object.values(this.state.instruments)
        .filter(i => i.hasAccess);
    },

    /**
     * Get instruments by category
     */
    getInstrumentsByCategory(category) {
      return Object.values(this.state.instruments)
        .filter(i => i.category === category);
    },

    // ========================================================================
    // Plan Checks
    // ========================================================================

    /**
     * Check if user's plan meets minimum requirement
     */
    hasPlan(requiredPlan) {
      const userLevel = this.getPlanLevel();
      const requiredLevel = this.planHierarchy[requiredPlan] || 0;
      return userLevel >= requiredLevel;
    },

    /**
     * Check if user is on free plan
     */
    isFreePlan() {
      return this.getCurrentPlan() === 'free' || this.getCurrentPlan() === 'guest';
    },

    /**
     * Check if user is a guest (not logged in)
     */
    isGuest() {
      return !this.state.authenticated;
    },

    // ========================================================================
    // UI Visibility Control
    // ========================================================================

    /**
     * Apply visibility based on auth state
     */
    applyAuthVisibility() {
      // Elements that require authentication
      document.querySelectorAll('[data-auth="required"]').forEach(el => {
        el.style.display = this.state.authenticated ? '' : 'none';
      });

      // Elements for guests only
      document.querySelectorAll('[data-auth="guest"]').forEach(el => {
        el.style.display = this.state.authenticated ? 'none' : '';
      });
    },

    /**
     * Apply visibility based on feature access
     */
    applyFeatureVisibility() {
      document.querySelectorAll('[data-feature]').forEach(el => {
        const featureCode = el.dataset.feature;
        const hasAccess = this.hasFeature(featureCode);
        const action = el.dataset.featureAction || 'hide';

        switch (action) {
          case 'hide':
            el.style.display = hasAccess ? '' : 'none';
            break;
          case 'disable':
            el.disabled = !hasAccess;
            el.classList.toggle('disabled', !hasAccess);
            break;
          case 'blur':
            el.classList.toggle('feature-locked', !hasAccess);
            break;
          case 'lock':
            if (!hasAccess) {
              el.classList.add('locked');
              el.dataset.lockedFeature = featureCode;
            }
            break;
        }
      });
    },

    /**
     * Apply visibility based on instrument access
     */
    applyInstrumentVisibility() {
      document.querySelectorAll('[data-instrument]').forEach(el => {
        const instrumentId = el.dataset.instrument;
        const hasAccess = this.hasInstrument(instrumentId);
        const action = el.dataset.instrumentAction || 'lock';

        if (action === 'hide') {
          el.style.display = hasAccess ? '' : 'none';
        } else if (action === 'lock') {
          el.classList.toggle('instrument-locked', !hasAccess);
          if (!hasAccess) {
            el.dataset.lockedInstrument = instrumentId;
          }
        }
      });
    },

    /**
     * Apply visibility based on plan
     */
    applyPlanVisibility() {
      document.querySelectorAll('[data-plan]').forEach(el => {
        const requiredPlan = el.dataset.plan;
        const hasPlan = this.hasPlan(requiredPlan);
        el.style.display = hasPlan ? '' : 'none';
      });
    },

    // ========================================================================
    // Navigation
    // ========================================================================

    /**
     * Render navigation into container
     */
    renderNavigation() {
      const container = document.getElementById('haos-nav');
      if (!container || !this.state.navigation) return;

      const nav = this.state.navigation;
      
      let html = '<nav class="haos-nav">';
      
      // Main nav items
      html += '<div class="haos-nav-main">';
      nav.main.forEach(item => {
        if (item.access === 'all' || (item.access === 'authenticated' && this.state.authenticated)) {
          html += `<a href="${item.href}" class="haos-nav-item">
            <i class="fas ${item.icon}"></i>
            <span>${item.label}</span>
          </a>`;
        }
      });
      html += '</div>';

      // User nav items
      html += '<div class="haos-nav-user">';
      
      // Upgrade button
      if (nav.upgrade?.show) {
        html += `<a href="${nav.upgrade.href}" class="haos-nav-upgrade">
          <i class="fas fa-rocket"></i>
          <span>${nav.upgrade.label}</span>
        </a>`;
      }
      
      // User menu
      if (this.state.authenticated && this.state.user) {
        html += `<div class="haos-nav-profile">
          <img src="${this.state.user.avatarUrl || ''}" alt="" class="haos-nav-avatar" onerror="this.style.display='none'">
          <span class="haos-nav-username">${this.state.user.displayName || this.state.user.email}</span>
          <div class="haos-nav-dropdown">`;
        nav.user.forEach(item => {
          html += `<a href="${item.href}" class="haos-nav-dropdown-item">
            <i class="fas ${item.icon}"></i> ${item.label}
          </a>`;
        });
        html += '</div></div>';
      } else {
        nav.user.forEach(item => {
          html += `<a href="${item.href}" class="haos-nav-item haos-nav-signin">
            <i class="fas ${item.icon}"></i>
            <span>${item.label}</span>
          </a>`;
        });
      }
      html += '</div>';
      
      html += '</nav>';
      
      container.innerHTML = html;
    },

    // ========================================================================
    // Upgrade Prompts
    // ========================================================================

    /**
     * Show upgrade prompt for a feature
     */
    showUpgradePrompt(featureCode, options = {}) {
      const requiredPlan = this.getFeatureRequiredPlan(featureCode);
      const modal = this.createUpgradeModal({
        title: options.title || 'Upgrade Required',
        message: options.message || `This feature requires the ${requiredPlan.toUpperCase()} plan.`,
        featureCode,
        requiredPlan,
      });
      
      document.body.appendChild(modal);
      modal.classList.add('show');
    },

    /**
     * Show upgrade prompt for an instrument
     */
    showInstrumentUpgradePrompt(instrumentId, options = {}) {
      const instrument = this.getInstrument(instrumentId);
      if (!instrument) return;

      const modal = this.createUpgradeModal({
        title: options.title || `Unlock ${instrument.name}`,
        message: options.message || `${instrument.name} requires the ${instrument.requiredPlan.toUpperCase()} plan.`,
        instrumentId,
        requiredPlan: instrument.requiredPlan,
        icon: instrument.icon,
      });
      
      document.body.appendChild(modal);
      modal.classList.add('show');
    },

    /**
     * Create upgrade modal element
     */
    createUpgradeModal(options) {
      const modal = document.createElement('div');
      modal.className = 'haos-upgrade-modal';
      modal.innerHTML = `
        <div class="haos-upgrade-modal-backdrop" onclick="HaosPlatform.closeUpgradeModal(this.parentElement)"></div>
        <div class="haos-upgrade-modal-content">
          ${options.icon ? `<div class="haos-upgrade-icon">${options.icon}</div>` : ''}
          <h3>${options.title}</h3>
          <p>${options.message}</p>
          <div class="haos-upgrade-actions">
            <button class="haos-btn-secondary" onclick="HaosPlatform.closeUpgradeModal(this.closest('.haos-upgrade-modal'))">
              Maybe Later
            </button>
            <a href="${this.config.pricingUrl}" class="haos-btn-primary">
              <i class="fas fa-rocket"></i> View Plans
            </a>
          </div>
        </div>
      `;
      return modal;
    },

    /**
     * Close upgrade modal
     */
    closeUpgradeModal(modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    },

    // ========================================================================
    // Event Handling
    // ========================================================================

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
      // Handle clicks on locked elements
      document.addEventListener('click', (e) => {
        const lockedFeature = e.target.closest('[data-locked-feature]');
        if (lockedFeature) {
          e.preventDefault();
          this.showUpgradePrompt(lockedFeature.dataset.lockedFeature);
          return;
        }

        const lockedInstrument = e.target.closest('[data-locked-instrument]');
        if (lockedInstrument) {
          e.preventDefault();
          this.showInstrumentUpgradePrompt(lockedInstrument.dataset.lockedInstrument);
        }
      });
    },

    /**
     * Start state refresh timer
     */
    startRefreshTimer() {
      if (this.refreshTimer) clearInterval(this.refreshTimer);
      
      this.refreshTimer = setInterval(async () => {
        try {
          await this.fetchState();
          this.applyAuthVisibility();
          this.applyFeatureVisibility();
          this.applyInstrumentVisibility();
          this.notifyListeners('refresh', this.state);
        } catch (error) {
          console.error('State refresh failed:', error);
        }
      }, this.config.refreshInterval);
    },

    // ========================================================================
    // Listener Management
    // ========================================================================

    /**
     * Subscribe to state changes
     */
    on(event, callback) {
      this.listeners.push({ event, callback });
      return () => this.off(event, callback);
    },

    /**
     * Unsubscribe from state changes
     */
    off(event, callback) {
      this.listeners = this.listeners.filter(
        l => l.event !== event || l.callback !== callback
      );
    },

    /**
     * Notify listeners of events
     */
    notifyListeners(event, data) {
      this.listeners
        .filter(l => l.event === event)
        .forEach(l => l.callback(data));
    },

    // ========================================================================
    // Utility Methods
    // ========================================================================

    /**
     * Redirect to login
     */
    redirectToLogin(returnTo) {
      if (returnTo) {
        sessionStorage.setItem('loginReturnTo', returnTo);
      }
      window.location.href = this.config.loginUrl;
    },

    /**
     * Redirect to pricing
     */
    redirectToPricing() {
      window.location.href = this.config.pricingUrl;
    },

    /**
     * Log user activity
     */
    async logActivity(action, resource, metadata = {}) {
      if (!this.state.authenticated) return;

      try {
        await fetch('/api/platform/activity', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, resource, metadata }),
        });
      } catch (error) {
        console.error('Activity log failed:', error);
      }
    },

    /**
     * Check access and redirect if needed
     */
    requireAuth(returnTo) {
      if (!this.state.authenticated) {
        this.redirectToLogin(returnTo || window.location.pathname);
        return false;
      }
      return true;
    },

    /**
     * Check plan and show upgrade if needed
     */
    requirePlan(plan, featureName) {
      if (!this.hasPlan(plan)) {
        this.showUpgradePrompt(featureName || 'feature', {
          message: `This requires the ${plan.toUpperCase()} plan.`,
        });
        return false;
      }
      return true;
    },
  };

  // ============================================================================
  // Global Styles for Platform Components
  // ============================================================================

  const styles = `
    /* Upgrade Modal */
    .haos-upgrade-modal {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    
    .haos-upgrade-modal.show {
      opacity: 1;
      pointer-events: auto;
    }
    
    .haos-upgrade-modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
    }
    
    .haos-upgrade-modal-content {
      position: relative;
      background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
      border: 1px solid rgba(102, 126, 234, 0.3);
      border-radius: 16px;
      padding: 2rem;
      max-width: 400px;
      text-align: center;
      transform: translateY(20px);
      transition: transform 0.3s ease;
    }
    
    .haos-upgrade-modal.show .haos-upgrade-modal-content {
      transform: translateY(0);
    }
    
    .haos-upgrade-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .haos-upgrade-modal h3 {
      color: #fff;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    
    .haos-upgrade-modal p {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 1.5rem;
    }
    
    .haos-upgrade-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    
    .haos-btn-primary, .haos-btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
    }
    
    .haos-btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: #fff;
    }
    
    .haos-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }
    
    .haos-btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
    }
    
    .haos-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }
    
    /* Locked Elements */
    .feature-locked, .instrument-locked {
      position: relative;
      filter: blur(3px);
      pointer-events: none;
    }
    
    .feature-locked::after, .instrument-locked::after {
      content: '🔒';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      filter: none;
      pointer-events: auto;
      cursor: pointer;
    }
    
    .locked {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .disabled {
      opacity: 0.5;
      pointer-events: none;
    }
    
    /* Navigation Styles */
    .haos-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: rgba(0, 0, 0, 0.3);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .haos-nav-main, .haos-nav-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .haos-nav-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .haos-nav-item:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }
    
    .haos-nav-upgrade {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: #fff;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .haos-nav-upgrade:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    
    .haos-nav-profile {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      cursor: pointer;
    }
    
    .haos-nav-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .haos-nav-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: #1a1a2e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 0.5rem;
      min-width: 150px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
    }
    
    .haos-nav-profile:hover .haos-nav-dropdown {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    .haos-nav-dropdown-item {
      display: block;
      padding: 0.5rem 1rem;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      border-radius: 4px;
    }
    
    .haos-nav-dropdown-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Export to global
  window.HaosPlatform = HaosPlatform;

})(window);
