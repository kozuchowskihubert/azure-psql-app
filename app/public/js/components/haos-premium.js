/**
 * HAOS Premium Components
 * Frontend components for premium plan display, gates, and upgrade prompts
 */

(function() {
  'use strict';

  // ============================================================================
  // PLAN DATA (mirrors backend)
  // ============================================================================

  const PLANS = {
    free: {
      code: 'free',
      name: 'Free',
      badge: { text: 'FREE', color: '#6B6B6B' },
      price: { monthly: 0, yearly: 0 },
    },
    basic: {
      code: 'basic',
      name: 'Basic',
      badge: { text: 'BASIC', color: '#00D9FF' },
      price: { monthly: 499, yearly: 4990 },
    },
    premium: {
      code: 'premium',
      name: 'Premium',
      badge: { text: 'PREMIUM', color: '#D4AF37' },
      price: { monthly: 999, yearly: 9990 },
      featured: true,
    },
    pro: {
      code: 'pro',
      name: 'Pro',
      badge: { text: 'PRO', color: '#FF6B35' },
      price: { monthly: 2499, yearly: 24990 },
    },
  };

  // ============================================================================
  // PREMIUM STATE MANAGEMENT
  // ============================================================================

  class HaosPremiumState {
    constructor() {
      this.state = {
        isAuthenticated: false,
        plan: PLANS.free,
        downloads: { unlimited: false, remaining: 5, limit: 5 },
        featureAccess: {},
      };
      this.listeners = [];
      this.init();
    }

    async init() {
      // Try to load from session/API
      const savedState = sessionStorage.getItem('haos_premium_state');
      if (savedState) {
        try {
          this.state = JSON.parse(savedState);
        } catch (e) {}
      }

      // Fetch fresh state from server
      await this.fetchState();
    }

    async fetchState() {
      try {
        const response = await fetch('/api/premium/state');
        if (response.ok) {
          const data = await response.json();
          this.state = { ...this.state, ...data };
          sessionStorage.setItem('haos_premium_state', JSON.stringify(this.state));
          this.notify();
        }
      } catch (e) {
        // Use default state for non-authenticated users
        console.log('Using default premium state');
      }
    }

    getState() {
      return this.state;
    }

    getPlan() {
      return this.state.plan || PLANS.free;
    }

    isPremium() {
      const plan = this.getPlan();
      return ['premium', 'pro'].includes(plan.code);
    }

    hasFeature(feature) {
      return this.state.featureAccess?.[feature] || false;
    }

    getDownloadsRemaining() {
      return this.state.downloads?.remaining ?? 5;
    }

    isUnlimited() {
      return this.state.downloads?.unlimited || false;
    }

    subscribe(callback) {
      this.listeners.push(callback);
      return () => {
        this.listeners = this.listeners.filter(l => l !== callback);
      };
    }

    notify() {
      this.listeners.forEach(l => l(this.state));
    }

    // Decrement download count locally (optimistic update)
    useDownload() {
      if (!this.state.downloads.unlimited && this.state.downloads.remaining > 0) {
        this.state.downloads.remaining--;
        this.notify();
      }
    }
  }

  // Global premium state instance
  window.HaosPremium = new HaosPremiumState();

  // ============================================================================
  // WEB COMPONENTS
  // ============================================================================

  /**
   * <haos-premium-badge> - Shows user's current plan badge
   * 
   * Usage: <haos-premium-badge></haos-premium-badge>
   * Attributes:
   *   - plan: Override plan code (optional)
   *   - size: 'sm', 'md', 'lg'
   */
  class HaosPremiumBadge extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
      return ['plan', 'size'];
    }

    connectedCallback() {
      this.render();
      this.unsubscribe = window.HaosPremium.subscribe(() => this.render());
    }

    disconnectedCallback() {
      if (this.unsubscribe) this.unsubscribe();
    }

    attributeChangedCallback() {
      this.render();
    }

    render() {
      const planCode = this.getAttribute('plan') || window.HaosPremium.getPlan()?.code || 'free';
      const size = this.getAttribute('size') || 'md';
      const plan = PLANS[planCode] || PLANS.free;

      const sizes = {
        sm: { padding: '2px 8px', fontSize: '0.65rem' },
        md: { padding: '4px 12px', fontSize: '0.75rem' },
        lg: { padding: '6px 16px', fontSize: '0.85rem' },
      };

      const style = sizes[size] || sizes.md;

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
          }
          .badge {
            font-family: 'Space Mono', 'Courier New', monospace;
            font-weight: 700;
            padding: ${style.padding};
            font-size: ${style.fontSize};
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 1px;
            background: ${plan.badge.color}22;
            color: ${plan.badge.color};
            border: 1px solid ${plan.badge.color}44;
            box-shadow: 0 0 10px ${plan.badge.color}22;
            animation: ${planCode === 'premium' || planCode === 'pro' ? 'glow 2s ease-in-out infinite' : 'none'};
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 10px ${plan.badge.color}22; }
            50% { box-shadow: 0 0 20px ${plan.badge.color}44; }
          }
        </style>
        <span class="badge">${plan.badge.text}</span>
      `;
    }
  }

  /**
   * <haos-premium-gate> - Wraps content that requires premium access
   * 
   * Usage: 
   *   <haos-premium-gate feature="modularWorkspace" min-plan="premium">
   *     <div slot="content">Premium content here</div>
   *     <div slot="locked">Upgrade to unlock</div>
   *   </haos-premium-gate>
   */
  class HaosPremiumGate extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
      return ['feature', 'min-plan'];
    }

    connectedCallback() {
      this.render();
      this.unsubscribe = window.HaosPremium.subscribe(() => this.render());
    }

    disconnectedCallback() {
      if (this.unsubscribe) this.unsubscribe();
    }

    attributeChangedCallback() {
      this.render();
    }

    hasAccess() {
      const feature = this.getAttribute('feature');
      const minPlan = this.getAttribute('min-plan');

      if (feature) {
        return window.HaosPremium.hasFeature(feature);
      }

      if (minPlan) {
        const planOrder = { free: 1, basic: 2, premium: 3, pro: 4 };
        const userPlanOrder = planOrder[window.HaosPremium.getPlan()?.code] || 1;
        const requiredOrder = planOrder[minPlan] || 1;
        return userPlanOrder >= requiredOrder;
      }

      return true;
    }

    render() {
      const hasAccess = this.hasAccess();
      const minPlan = this.getAttribute('min-plan') || 'premium';
      const plan = PLANS[minPlan] || PLANS.premium;

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            position: relative;
          }
          .content { display: ${hasAccess ? 'block' : 'none'}; }
          .locked { display: ${hasAccess ? 'none' : 'block'}; }
          .locked-overlay {
            position: relative;
            padding: 30px;
            background: rgba(10, 10, 10, 0.95);
            border: 2px solid ${plan.badge.color}44;
            border-radius: 12px;
            text-align: center;
          }
          .lock-icon {
            font-size: 2rem;
            margin-bottom: 15px;
            display: block;
          }
          .lock-title {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 1.4rem;
            color: #F4E8D8;
            margin-bottom: 10px;
            letter-spacing: 2px;
          }
          .lock-message {
            font-family: 'Space Mono', monospace;
            font-size: 0.85rem;
            color: #6B6B6B;
            margin-bottom: 20px;
          }
          .upgrade-btn {
            display: inline-block;
            padding: 12px 28px;
            background: linear-gradient(135deg, ${plan.badge.color}, ${plan.badge.color}cc);
            color: #0a0a0a;
            font-family: 'Space Mono', monospace;
            font-weight: 700;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
          }
          .upgrade-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px ${plan.badge.color}44;
          }
        </style>
        <div class="content"><slot name="content"></slot></div>
        <div class="locked">
          <slot name="locked">
            <div class="locked-overlay">
              <span class="lock-icon">🔒</span>
              <h3 class="lock-title">${plan.name} Feature</h3>
              <p class="lock-message">This feature requires ${plan.name} plan or higher</p>
              <a href="/premium" class="upgrade-btn">Upgrade to ${plan.name}</a>
            </div>
          </slot>
        </div>
      `;
    }
  }

  /**
   * <haos-download-counter> - Shows remaining downloads
   * 
   * Usage: <haos-download-counter></haos-download-counter>
   */
  class HaosDownloadCounter extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      this.render();
      this.unsubscribe = window.HaosPremium.subscribe(() => this.render());
    }

    disconnectedCallback() {
      if (this.unsubscribe) this.unsubscribe();
    }

    render() {
      const state = window.HaosPremium.getState();
      const downloads = state.downloads || { unlimited: false, remaining: 5, limit: 5 };
      const isPremium = window.HaosPremium.isPremium();

      if (downloads.unlimited) {
        this.shadowRoot.innerHTML = `
          <style>
            .counter {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 8px 14px;
              background: rgba(212, 175, 55, 0.1);
              border: 1px solid rgba(212, 175, 55, 0.3);
              border-radius: 20px;
              font-family: 'Space Mono', monospace;
              font-size: 0.8rem;
              color: #D4AF37;
            }
            .infinity { font-size: 1.1rem; }
          </style>
          <div class="counter">
            <span class="infinity">∞</span> Unlimited Downloads
          </div>
        `;
        return;
      }

      const percentage = (downloads.remaining / downloads.limit) * 100;
      const isLow = percentage <= 20;
      const color = isLow ? '#FF6B35' : '#00D9FF';

      this.shadowRoot.innerHTML = `
        <style>
          .counter {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 8px 14px;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid ${color}44;
            border-radius: 20px;
            font-family: 'Space Mono', monospace;
            font-size: 0.8rem;
            color: #F4E8D8;
          }
          .bar-container {
            width: 60px;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
          }
          .bar {
            height: 100%;
            width: ${percentage}%;
            background: ${color};
            border-radius: 3px;
            transition: width 0.3s ease;
          }
          .count {
            color: ${color};
            font-weight: 700;
          }
          .upgrade-hint {
            color: #6B6B6B;
            font-size: 0.7rem;
            cursor: pointer;
            text-decoration: underline;
          }
          .upgrade-hint:hover {
            color: #D4AF37;
          }
        </style>
        <div class="counter">
          <span class="count">${downloads.remaining}/${downloads.limit}</span>
          <div class="bar-container"><div class="bar"></div></div>
          ${isLow ? '<a href="/premium" class="upgrade-hint">Get unlimited</a>' : ''}
        </div>
      `;
    }
  }

  /**
   * <haos-upgrade-prompt> - Modal upgrade prompt
   * 
   * Usage: <haos-upgrade-prompt target-plan="premium"></haos-upgrade-prompt>
   * Methods: show(), hide()
   */
  class HaosUpgradePrompt extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.visible = false;
    }

    connectedCallback() {
      this.render();
    }

    show(options = {}) {
      this.visible = true;
      this.options = options;
      this.render();
      document.body.style.overflow = 'hidden';
    }

    hide() {
      this.visible = false;
      this.render();
      document.body.style.overflow = '';
    }

    render() {
      const targetPlan = this.getAttribute('target-plan') || this.options?.targetPlan || 'premium';
      const plan = PLANS[targetPlan] || PLANS.premium;
      const currentPlan = window.HaosPremium.getPlan();
      const reason = this.options?.reason || 'Unlock premium features';

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: ${this.visible ? 'block' : 'none'};
          }
          .overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .modal {
            background: linear-gradient(145deg, #151515, #0a0a0a);
            border: 2px solid ${plan.badge.color}44;
            border-radius: 16px;
            padding: 40px;
            max-width: 450px;
            width: 90%;
            text-align: center;
            position: relative;
            animation: slideUp 0.3s ease;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px ${plan.badge.color}22;
          }
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .close-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            color: #6B6B6B;
            font-size: 1.5rem;
            cursor: pointer;
            transition: color 0.2s;
          }
          .close-btn:hover { color: #F4E8D8; }
          .icon {
            font-size: 3.5rem;
            margin-bottom: 20px;
            display: block;
          }
          .title {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 2rem;
            letter-spacing: 3px;
            color: #F4E8D8;
            margin-bottom: 10px;
          }
          .plan-name {
            color: ${plan.badge.color};
          }
          .reason {
            font-family: 'Space Mono', monospace;
            font-size: 0.9rem;
            color: #6B6B6B;
            margin-bottom: 25px;
          }
          .price {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 2.5rem;
            color: ${plan.badge.color};
            margin-bottom: 5px;
          }
          .price span {
            font-size: 1rem;
            color: #6B6B6B;
          }
          .billing {
            font-size: 0.8rem;
            color: #6B6B6B;
            margin-bottom: 25px;
          }
          .features {
            text-align: left;
            margin: 25px 0;
            padding: 20px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
          }
          .feature {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 0;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            color: #F4E8D8;
          }
          .feature-icon {
            color: ${plan.badge.color};
          }
          .cta-btn {
            display: block;
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, ${plan.badge.color}, ${plan.badge.color}cc);
            color: #0a0a0a;
            font-family: 'Space Mono', monospace;
            font-weight: 700;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 12px;
          }
          .cta-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px ${plan.badge.color}44;
          }
          .secondary-btn {
            display: block;
            width: 100%;
            padding: 12px;
            background: transparent;
            color: #6B6B6B;
            font-family: 'Space Mono', monospace;
            font-size: 0.8rem;
            border: 1px solid #333;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .secondary-btn:hover {
            border-color: #555;
            color: #F4E8D8;
          }
          .current-badge {
            display: inline-block;
            padding: 4px 10px;
            background: ${currentPlan.badge?.color || '#6B6B6B'}22;
            color: ${currentPlan.badge?.color || '#6B6B6B'};
            font-family: 'Space Mono', monospace;
            font-size: 0.7rem;
            border-radius: 4px;
            margin-bottom: 20px;
          }
        </style>
        <div class="overlay" onclick="if(event.target === this) this.getRootNode().host.hide()">
          <div class="modal">
            <button class="close-btn" onclick="this.getRootNode().host.hide()">×</button>
            <span class="icon">⚡</span>
            <span class="current-badge">Current: ${currentPlan.name || 'Free'}</span>
            <h2 class="title">Upgrade to <span class="plan-name">${plan.name}</span></h2>
            <p class="reason">${reason}</p>
            <div class="price">$${(plan.price.monthly / 100).toFixed(2)}<span>/month</span></div>
            <div class="billing">or $${(plan.price.yearly / 100).toFixed(2)}/year (save 17%)</div>
            <div class="features">
              <div class="feature"><span class="feature-icon">✓</span> Unlimited preset downloads</div>
              <div class="feature"><span class="feature-icon">✓</span> Access all workspaces</div>
              <div class="feature"><span class="feature-icon">✓</span> Exclusive premium presets</div>
              <div class="feature"><span class="feature-icon">✓</span> Cloud storage for projects</div>
              <div class="feature"><span class="feature-icon">✓</span> Priority support</div>
            </div>
            <button class="cta-btn" onclick="window.location.href='/premium?plan=${targetPlan}'">Upgrade Now</button>
            <button class="secondary-btn" onclick="this.getRootNode().host.hide()">Maybe Later</button>
          </div>
        </div>
      `;
    }
  }

  /**
   * <haos-preset-badge> - Shows premium/exclusive badge on presets
   * 
   * Usage: <haos-preset-badge type="premium"></haos-preset-badge>
   */
  class HaosPresetBadge extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
      return ['type'];
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback() {
      this.render();
    }

    render() {
      const type = this.getAttribute('type') || 'premium';
      
      const badges = {
        premium: { text: 'PREMIUM', color: '#D4AF37', icon: '⭐' },
        exclusive: { text: 'EXCLUSIVE', color: '#FF6B35', icon: '💎' },
        pro: { text: 'PRO', color: '#FF6B35', icon: '🔥' },
        new: { text: 'NEW', color: '#39FF14', icon: '✨' },
      };

      const badge = badges[type] || badges.premium;

      this.shadowRoot.innerHTML = `
        <style>
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 8px;
            background: ${badge.color}22;
            border: 1px solid ${badge.color}44;
            border-radius: 4px;
            font-family: 'Space Mono', monospace;
            font-size: 0.65rem;
            font-weight: 700;
            color: ${badge.color};
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .icon { font-size: 0.7rem; }
        </style>
        <span class="badge"><span class="icon">${badge.icon}</span> ${badge.text}</span>
      `;
    }
  }

  // ============================================================================
  // REGISTER COMPONENTS
  // ============================================================================

  customElements.define('haos-premium-badge', HaosPremiumBadge);
  customElements.define('haos-premium-gate', HaosPremiumGate);
  customElements.define('haos-download-counter', HaosDownloadCounter);
  customElements.define('haos-upgrade-prompt', HaosUpgradePrompt);
  customElements.define('haos-preset-badge', HaosPresetBadge);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Show upgrade prompt programmatically
   */
  window.showUpgradePrompt = function(options = {}) {
    let prompt = document.querySelector('haos-upgrade-prompt');
    if (!prompt) {
      prompt = document.createElement('haos-upgrade-prompt');
      document.body.appendChild(prompt);
    }
    prompt.show(options);
    return prompt;
  };

  /**
   * Check feature access and show prompt if needed
   */
  window.requirePremium = async function(feature, options = {}) {
    const hasAccess = window.HaosPremium.hasFeature(feature);
    
    if (!hasAccess) {
      window.showUpgradePrompt({
        targetPlan: options.minPlan || 'premium',
        reason: options.reason || `This feature requires a premium plan`,
      });
      return false;
    }
    
    return true;
  };

  /**
   * Track and validate download
   */
  window.trackDownload = async function(presetId) {
    if (window.HaosPremium.isUnlimited()) {
      return { allowed: true };
    }

    const remaining = window.HaosPremium.getDownloadsRemaining();
    
    if (remaining <= 0) {
      window.showUpgradePrompt({
        targetPlan: 'premium',
        reason: 'You\'ve reached your daily download limit',
      });
      return { allowed: false };
    }

    // Optimistic update
    window.HaosPremium.useDownload();
    
    // Track on server
    try {
      const response = await fetch('/api/premium/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetId }),
      });
      return await response.json();
    } catch (e) {
      return { allowed: true, offline: true };
    }
  };

  console.log('✅ HAOS Premium Components loaded');

})();
