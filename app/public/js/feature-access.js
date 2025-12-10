/**
 * HAOS.fm Feature Access Control
 * 
 * Frontend JavaScript module for managing feature access based on user subscription.
 * Handles authentication state, feature visibility, and upgrade prompts.
 * 
 * Usage:
 *   <script src="/js/feature-access.js"></script>
 *   <script>
 *     FeatureAccess.init().then(() => {
 *       console.log('Feature access initialized');
 *     });
 *   </script>
 * 
 * In HTML, use data attributes to control feature visibility:
 *   <div data-feature="advanced_synthesis">Premium feature content</div>
 *   <button data-feature="collaboration" data-feature-action="disable">Collaborate</button>
 */

(function(window) {
  'use strict';

  // ============================================================================
  // Feature Access Module
  // ============================================================================

  const FeatureAccess = {
    // State
    user: null,
    subscription: null,
    features: {},
    isAuthenticated: false,
    initialized: false,

    // Configuration
    config: {
      statusEndpoint: '/auth/status',
      featuresEndpoint: '/auth/features',
      loginUrl: '/login.html',
      pricingUrl: '/pricing.html',
      refreshInterval: 5 * 60 * 1000, // 5 minutes
    },

    // ========================================================================
    // Initialization
    // ========================================================================

    /**
     * Initialize the feature access system
     * @returns {Promise<object>} User data and features
     */
    async init(options = {}) {
      Object.assign(this.config, options);

      try {
        await this.checkAuthStatus();
        this.applyFeatureVisibility();
        this.setupEventListeners();
        this.startRefreshTimer();
        this.initialized = true;

        // Dispatch initialization event
        window.dispatchEvent(new CustomEvent('featureAccessReady', {
          detail: {
            user: this.user,
            subscription: this.subscription,
            features: this.features,
            isAuthenticated: this.isAuthenticated,
          }
        }));

        return {
          user: this.user,
          subscription: this.subscription,
          features: this.features,
        };
      } catch (error) {
        console.error('FeatureAccess initialization error:', error);
        throw error;
      }
    },

    // ========================================================================
    // Authentication Status
    // ========================================================================

    /**
     * Check authentication status from server
     * @returns {Promise<object>} Auth status data
     */
    async checkAuthStatus() {
      try {
        const response = await fetch(this.config.statusEndpoint, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to check auth status');
        }

        const data = await response.json();

        this.isAuthenticated = data.authenticated;
        this.user = data.user;
        this.subscription = data.subscription;
        this.features = data.features || {};

        return data;
      } catch (error) {
        console.error('Auth status check failed:', error);
        this.isAuthenticated = false;
        this.user = null;
        this.subscription = null;
        this.features = {};
        throw error;
      }
    },

    /**
     * Get current user info
     * @returns {object|null} User object or null
     */
    getUser() {
      return this.user;
    },

    /**
     * Get current subscription info
     * @returns {object|null} Subscription object or null
     */
    getSubscription() {
      return this.subscription;
    },

    // ========================================================================
    // Feature Access Checks
    // ========================================================================

    /**
     * Check if user has access to a specific feature
     * @param {string} featureCode - The feature code to check
     * @returns {boolean} Whether user has access
     */
    hasFeature(featureCode) {
      const feature = this.features[featureCode];
      return feature?.available === true;
    },

    /**
     * Check if a feature is locked
     * @param {string} featureCode - The feature code to check
     * @returns {boolean} Whether feature is locked
     */
    isLocked(featureCode) {
      const feature = this.features[featureCode];
      return feature?.locked === true;
    },

    /**
     * Get required plan for a feature
     * @param {string} featureCode - The feature code
     * @returns {string} Required plan code
     */
    getRequiredPlan(featureCode) {
      const feature = this.features[featureCode];
      return feature?.requiredPlan || 'free';
    },

    /**
     * Get all accessible features
     * @returns {string[]} Array of accessible feature codes
     */
    getAccessibleFeatures() {
      return Object.entries(this.features)
        .filter(([_, info]) => info.available)
        .map(([code, _]) => code);
    },

    /**
     * Get all locked features
     * @returns {string[]} Array of locked feature codes
     */
    getLockedFeatures() {
      return Object.entries(this.features)
        .filter(([_, info]) => info.locked)
        .map(([code, _]) => code);
    },

    // ========================================================================
    // UI Updates
    // ========================================================================

    /**
     * Apply feature visibility to all elements with data-feature attribute
     */
    applyFeatureVisibility() {
      const featureElements = document.querySelectorAll('[data-feature]');

      featureElements.forEach(element => {
        const featureCode = element.dataset.feature;
        const action = element.dataset.featureAction || 'hide';
        const hasAccess = this.hasFeature(featureCode);

        this.applyFeatureToElement(element, hasAccess, action, featureCode);
      });

      // Update auth-dependent elements
      this.updateAuthUI();
    },

    /**
     * Apply feature access to a single element
     * @param {HTMLElement} element - The element to update
     * @param {boolean} hasAccess - Whether user has access
     * @param {string} action - Action to take (hide/disable/blur/overlay)
     * @param {string} featureCode - The feature code
     */
    applyFeatureToElement(element, hasAccess, action, featureCode) {
      // Remove previous feature states
      element.classList.remove('feature-locked', 'feature-available');
      element.removeAttribute('disabled');

      if (hasAccess) {
        element.classList.add('feature-available');
        element.style.display = '';
        element.style.opacity = '';
        element.style.pointerEvents = '';
        
        // Remove upgrade overlay if present
        const overlay = element.querySelector('.feature-upgrade-overlay');
        if (overlay) overlay.remove();
      } else {
        element.classList.add('feature-locked');

        switch (action) {
          case 'hide':
            element.style.display = 'none';
            break;

          case 'disable':
            element.setAttribute('disabled', 'disabled');
            element.style.opacity = '0.5';
            element.style.pointerEvents = 'none';
            break;

          case 'blur':
            element.style.filter = 'blur(4px)';
            element.style.pointerEvents = 'none';
            this.addUpgradeOverlay(element, featureCode);
            break;

          case 'overlay':
            element.style.position = 'relative';
            this.addUpgradeOverlay(element, featureCode);
            break;

          case 'click':
            // Allow click but show upgrade modal
            element.addEventListener('click', (e) => {
              if (!this.hasFeature(featureCode)) {
                e.preventDefault();
                e.stopPropagation();
                this.showUpgradeModal(featureCode);
              }
            }, { capture: true });
            break;
        }
      }
    },

    /**
     * Add upgrade overlay to locked element
     * @param {HTMLElement} element - The element to add overlay to
     * @param {string} featureCode - The feature code
     */
    addUpgradeOverlay(element, featureCode) {
      if (element.querySelector('.feature-upgrade-overlay')) return;

      const requiredPlan = this.getRequiredPlan(featureCode);
      const overlay = document.createElement('div');
      overlay.className = 'feature-upgrade-overlay';
      overlay.innerHTML = `
        <div class="upgrade-content">
          <span class="lock-icon">🔒</span>
          <p>Requires ${this.formatPlanName(requiredPlan)} plan</p>
          <button onclick="FeatureAccess.showUpgradeModal('${featureCode}')" class="upgrade-btn">
            Upgrade Now
          </button>
        </div>
      `;
      element.style.position = 'relative';
      element.appendChild(overlay);
    },

    /**
     * Update authentication-dependent UI elements
     */
    updateAuthUI() {
      // Update login/logout buttons
      const loginButtons = document.querySelectorAll('[data-auth="login"]');
      const logoutButtons = document.querySelectorAll('[data-auth="logout"]');
      const authRequired = document.querySelectorAll('[data-auth="required"]');
      const guestOnly = document.querySelectorAll('[data-auth="guest"]');
      const userInfo = document.querySelectorAll('[data-user-info]');

      loginButtons.forEach(btn => {
        btn.style.display = this.isAuthenticated ? 'none' : '';
      });

      logoutButtons.forEach(btn => {
        btn.style.display = this.isAuthenticated ? '' : 'none';
      });

      authRequired.forEach(el => {
        el.style.display = this.isAuthenticated ? '' : 'none';
      });

      guestOnly.forEach(el => {
        el.style.display = this.isAuthenticated ? 'none' : '';
      });

      // Update user info displays
      userInfo.forEach(el => {
        const field = el.dataset.userInfo;
        if (this.user && this.user[field]) {
          el.textContent = this.user[field];
        }
      });

      // Update plan badge
      const planBadges = document.querySelectorAll('[data-plan-badge]');
      planBadges.forEach(badge => {
        if (this.subscription) {
          badge.textContent = this.formatPlanName(this.subscription.plan);
          badge.className = `plan-badge plan-${this.subscription.plan}`;
        } else {
          badge.textContent = 'Free';
          badge.className = 'plan-badge plan-free';
        }
      });
    },

    // ========================================================================
    // Upgrade Modal
    // ========================================================================

    /**
     * Show upgrade modal for a locked feature
     * @param {string} featureCode - The feature code
     */
    showUpgradeModal(featureCode) {
      const requiredPlan = this.getRequiredPlan(featureCode);

      // Remove existing modal
      const existingModal = document.getElementById('feature-upgrade-modal');
      if (existingModal) existingModal.remove();

      const modal = document.createElement('div');
      modal.id = 'feature-upgrade-modal';
      modal.className = 'feature-modal-overlay';
      modal.innerHTML = `
        <div class="feature-modal">
          <button class="modal-close" onclick="FeatureAccess.hideUpgradeModal()">&times;</button>
          <div class="modal-icon">🔒</div>
          <h2>Upgrade Required</h2>
          <p>This feature requires the <strong>${this.formatPlanName(requiredPlan)}</strong> plan.</p>
          <div class="modal-feature-info">
            <span class="feature-name">${this.formatFeatureName(featureCode)}</span>
          </div>
          ${this.isAuthenticated ? `
            <a href="${this.config.pricingUrl}" class="modal-btn primary">View Plans</a>
          ` : `
            <p class="modal-subtext">Sign in to access premium features</p>
            <a href="${this.config.loginUrl}" class="modal-btn primary">Sign In</a>
            <a href="${this.config.pricingUrl}" class="modal-btn secondary">View Plans</a>
          `}
        </div>
      `;

      document.body.appendChild(modal);

      // Close on overlay click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.hideUpgradeModal();
      });

      // Close on escape
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          this.hideUpgradeModal();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
    },

    /**
     * Hide upgrade modal
     */
    hideUpgradeModal() {
      const modal = document.getElementById('feature-upgrade-modal');
      if (modal) modal.remove();
    },

    // ========================================================================
    // Login with Provider
    // ========================================================================

    /**
     * Login with a specific provider
     * @param {string} provider - Provider name (google, facebook, apple)
     */
    login(provider) {
      const returnTo = window.location.pathname + window.location.search;
      sessionStorage.setItem('loginReturnTo', returnTo);
      window.location.href = `/auth/${provider}`;
    },

    /**
     * Logout current user
     */
    async logout() {
      try {
        const response = await fetch('/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          this.isAuthenticated = false;
          this.user = null;
          this.subscription = null;
          this.features = {};
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Logout failed:', error);
        // Fallback to redirect-based logout
        window.location.href = '/auth/logout';
      }
    },

    // ========================================================================
    // Helpers
    // ========================================================================

    /**
     * Format plan code to display name
     * @param {string} planCode - The plan code
     * @returns {string} Formatted plan name
     */
    formatPlanName(planCode) {
      const planNames = {
        free: 'Free',
        basic: 'Basic',
        premium: 'Premium',
        pro: 'Pro',
      };
      return planNames[planCode] || planCode;
    },

    /**
     * Format feature code to display name
     * @param {string} featureCode - The feature code
     * @returns {string} Formatted feature name
     */
    formatFeatureName(featureCode) {
      return featureCode
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
      // Listen for login button clicks
      document.addEventListener('click', (e) => {
        const loginBtn = e.target.closest('[data-login-provider]');
        if (loginBtn) {
          e.preventDefault();
          const provider = loginBtn.dataset.loginProvider;
          this.login(provider);
        }

        const logoutBtn = e.target.closest('[data-logout]');
        if (logoutBtn) {
          e.preventDefault();
          this.logout();
        }
      });
    },

    /**
     * Start periodic refresh timer
     */
    startRefreshTimer() {
      if (this.config.refreshInterval > 0) {
        setInterval(() => {
          this.checkAuthStatus().then(() => {
            this.applyFeatureVisibility();
          }).catch(() => {
            // Silently fail on refresh
          });
        }, this.config.refreshInterval);
      }
    },

    /**
     * Refresh feature access (manual)
     * @returns {Promise<object>} Updated features
     */
    async refresh() {
      await this.checkAuthStatus();
      this.applyFeatureVisibility();
      return this.features;
    },
  };

  // ============================================================================
  // CSS Styles for Feature Access UI
  // ============================================================================

  const styles = `
    /* Feature Locked States */
    .feature-locked {
      position: relative;
    }

    .feature-upgrade-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      border-radius: inherit;
    }

    .feature-upgrade-overlay .upgrade-content {
      text-align: center;
      color: white;
      padding: 20px;
    }

    .feature-upgrade-overlay .lock-icon {
      font-size: 32px;
      display: block;
      margin-bottom: 10px;
    }

    .feature-upgrade-overlay .upgrade-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      margin-top: 10px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .feature-upgrade-overlay .upgrade-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    /* Upgrade Modal */
    .feature-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    }

    .feature-modal {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 420px;
      width: 90%;
      text-align: center;
      position: relative;
      animation: slideUp 0.3s ease-out;
    }

    .feature-modal .modal-close {
      position: absolute;
      top: 12px;
      right: 16px;
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #666;
      line-height: 1;
    }

    .feature-modal .modal-close:hover {
      color: #000;
    }

    .feature-modal .modal-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .feature-modal h2 {
      margin: 0 0 12px;
      color: #1a1a2e;
    }

    .feature-modal p {
      color: #666;
      margin-bottom: 20px;
    }

    .feature-modal .modal-feature-info {
      background: #f5f5f5;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .feature-modal .feature-name {
      font-weight: 600;
      color: #333;
    }

    .feature-modal .modal-btn {
      display: inline-block;
      padding: 12px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 4px;
      transition: all 0.2s;
    }

    .feature-modal .modal-btn.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .feature-modal .modal-btn.secondary {
      background: #f0f0f0;
      color: #333;
    }

    .feature-modal .modal-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .feature-modal .modal-subtext {
      font-size: 14px;
      color: #888;
      margin-bottom: 16px;
    }

    /* Plan Badges */
    .plan-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .plan-badge.plan-free {
      background: #e0e0e0;
      color: #666;
    }

    .plan-badge.plan-basic {
      background: #e3f2fd;
      color: #1976d2;
    }

    .plan-badge.plan-premium {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .plan-badge.plan-pro {
      background: linear-gradient(135deg, #f5af19 0%, #f12711 100%);
      color: white;
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Export to window
  window.FeatureAccess = FeatureAccess;

})(window);
