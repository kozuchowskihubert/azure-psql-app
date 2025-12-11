/**
 * HAOS Frontend Authentication Manager
 * Client-side state management for authentication
 * 
 * Features:
 * - Reactive auth state
 * - OAuth popup handling
 * - Magic link requests
 * - Session management
 * - Feature access control
 * - Event listeners for auth changes
 */

class HAOSAuthManager {
  constructor() {
    this.currentUser = null;
    this.tier = 'anonymous';
    this.sessionId = null;
    this.authenticated = false;
    this.listeners = [];
    this.features = [];
    this.initialized = false;
  }

  /**
   * Initialize auth manager - call on page load
   */
  async init() {
    try {
      await this.checkSession();
      this.initialized = true;
      console.log('[HAOSAuth] Initialized:', {
        authenticated: this.authenticated,
        tier: this.tier,
        user: this.currentUser?.email
      });
    } catch (error) {
      console.error('[HAOSAuth] Initialization failed:', error);
      // Continue with anonymous session
      this.tier = 'anonymous';
      this.authenticated = false;
    }
  }

  /**
   * Check current session status
   */
  async checkSession() {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include' // Include cookies
      });

      if (!response.ok) {
        throw new Error('Failed to check session');
      }

      const data = await response.json();
      
      this.authenticated = data.authenticated;
      this.tier = data.tier || 'anonymous';
      this.currentUser = data.user;
      this.sessionId = data.session?.id;
      
      this.notifyListeners();
      return data;
    } catch (error) {
      console.error('[HAOSAuth] Session check failed:', error);
      this.authenticated = false;
      this.tier = 'anonymous';
      this.currentUser = null;
      return null;
    }
  }

  // ============================================================================
  // OAUTH AUTHENTICATION
  // ============================================================================

  /**
   * Login with Google OAuth
   */
  async loginWithGoogle() {
    return this.loginWithOAuth('google');
  }

  /**
   * Login with Apple OAuth
   */
  async loginWithApple() {
    return this.loginWithOAuth('apple');
  }

  /**
   * Login with Facebook OAuth
   */
  async loginWithFacebook() {
    return this.loginWithOAuth('facebook');
  }

  /**
   * Generic OAuth login handler
   */
  async loginWithOAuth(provider) {
    try {
      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        `/auth/${provider}`,
        `${provider} Login`,
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Poll popup for completion
      return new Promise((resolve, reject) => {
        const pollTimer = setInterval(async () => {
          try {
            if (popup.closed) {
              clearInterval(pollTimer);
              
              // Check if login was successful
              const session = await this.checkSession();
              
              if (session && session.authenticated) {
                resolve(session);
              } else {
                reject(new Error('OAuth login cancelled or failed'));
              }
            }
          } catch (error) {
            // Ignore cross-origin errors while popup is open
          }
        }, 500);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(pollTimer);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('OAuth login timeout'));
        }, 5 * 60 * 1000);
      });
    } catch (error) {
      console.error(`[HAOSAuth] ${provider} OAuth failed:`, error);
      throw error;
    }
  }

  // ============================================================================
  // MAGIC LINK AUTHENTICATION
  // ============================================================================

  /**
   * Request magic link to email
   */
  async sendMagicLink(email) {
    try {
      const response = await fetch('/api/auth/magic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      return data;
    } catch (error) {
      console.error('[HAOSAuth] Magic link request failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // EMAIL/PASSWORD AUTHENTICATION
  // ============================================================================

  /**
   * Register with email/password
   */
  async register(email, password, name) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('[HAOSAuth] Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login with email/password
   */
  async login(email, password, rememberMe = true) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Update state
      this.authenticated = true;
      this.tier = data.tier;
      this.currentUser = data.user;
      this.notifyListeners();

      return data;
    } catch (error) {
      console.error('[HAOSAuth] Login failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Logout user
   */
  async logout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Reset state
      this.authenticated = false;
      this.tier = 'anonymous';
      this.currentUser = null;
      this.sessionId = null;
      this.notifyListeners();

      console.log('[HAOSAuth] Logged out successfully');
    } catch (error) {
      console.error('[HAOSAuth] Logout failed:', error);
      throw error;
    }
  }

  /**
   * Create anonymous session
   */
  async createAnonymousSession() {
    try {
      const response = await fetch('/api/auth/anonymous', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to create anonymous session');
      }

      this.tier = 'anonymous';
      this.authenticated = false;
      this.sessionId = data.session.id;
      this.notifyListeners();

      return data;
    } catch (error) {
      console.error('[HAOSAuth] Anonymous session creation failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // FEATURE ACCESS CONTROL
  // ============================================================================

  /**
   * Check if user can access a feature
   */
  canAccess(feature) {
    const permissions = {
      anonymous: ['radio', 'synth-preview', 'browse'],
      free: ['radio', 'synth-preview', 'browse'],
      basic: ['radio', 'synth-preview', 'browse', 'save', 'upload', 'collaborate-basic'],
      premium: ['*'], // All features
      pro: ['*'] // All features
    };

    const allowed = permissions[this.tier] || permissions.anonymous;
    return allowed.includes('*') || allowed.includes(feature);
  }

  /**
   * Require authentication (redirect to login if not authenticated)
   */
  requireAuth(redirectUrl = null) {
    if (!this.authenticated) {
      const currentUrl = redirectUrl || window.location.pathname;
      window.location.href = `/login.html?redirect=${encodeURIComponent(currentUrl)}`;
      return false;
    }
    return true;
  }

  /**
   * Require premium (redirect to upgrade if not premium)
   */
  requirePremium(redirectUrl = null) {
    if (!this.requireAuth(redirectUrl)) {
      return false;
    }

    if (this.tier !== 'premium' && this.tier !== 'pro') {
      const currentUrl = redirectUrl || window.location.pathname;
      window.location.href = `/premium.html?redirect=${encodeURIComponent(currentUrl)}`;
      return false;
    }

    return true;
  }

  /**
   * Require specific feature access
   */
  requireFeature(feature, redirectUrl = null) {
    if (!this.canAccess(feature)) {
      const needsAuth = !this.authenticated;
      const currentUrl = redirectUrl || window.location.pathname;
      
      if (needsAuth) {
        window.location.href = `/login.html?redirect=${encodeURIComponent(currentUrl)}&feature=${feature}`;
      } else {
        window.location.href = `/premium.html?redirect=${encodeURIComponent(currentUrl)}&feature=${feature}`;
      }
      
      return false;
    }

    return true;
  }

  // ============================================================================
  // UI HELPERS
  // ============================================================================

  /**
   * Update UI based on auth state
   */
  updateUI() {
    // Update login/logout buttons
    const loginButtons = document.querySelectorAll('[data-auth="login"]');
    const logoutButtons = document.querySelectorAll('[data-auth="logout"]');
    const authRequired = document.querySelectorAll('[data-auth="required"]');
    const guestOnly = document.querySelectorAll('[data-auth="guest"]');

    if (this.authenticated) {
      loginButtons.forEach(btn => btn.style.display = 'none');
      logoutButtons.forEach(btn => btn.style.display = 'block');
      authRequired.forEach(el => el.style.display = 'block');
      guestOnly.forEach(el => el.style.display = 'none');
    } else {
      loginButtons.forEach(btn => btn.style.display = 'block');
      logoutButtons.forEach(btn => btn.style.display = 'none');
      authRequired.forEach(el => el.style.display = 'none');
      guestOnly.forEach(el => el.style.display = 'block');
    }

    // Update user info
    const userNameElements = document.querySelectorAll('[data-auth="user-name"]');
    const userEmailElements = document.querySelectorAll('[data-auth="user-email"]');
    const userAvatarElements = document.querySelectorAll('[data-auth="user-avatar"]');

    if (this.currentUser) {
      userNameElements.forEach(el => el.textContent = this.currentUser.name);
      userEmailElements.forEach(el => el.textContent = this.currentUser.email);
      userAvatarElements.forEach(el => {
        if (this.currentUser.avatar) {
          el.src = this.currentUser.avatar;
        }
      });
    }

    // Update tier badges
    const tierElements = document.querySelectorAll('[data-auth="tier"]');
    tierElements.forEach(el => {
      el.textContent = this.tier.toUpperCase();
      el.className = `tier-badge tier-${this.tier}`;
    });
  }

  /**
   * Show login modal
   */
  showLoginModal() {
    // Check if modal exists
    let modal = document.getElementById('haos-login-modal');
    
    if (!modal) {
      // Create modal dynamically
      modal = this.createLoginModal();
      document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
  }

  /**
   * Create login modal HTML
   */
  createLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'haos-login-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.style.display='none'"></div>
      <div class="modal-content">
        <button class="modal-close" onclick="this.closest('#haos-login-modal').style.display='none'">×</button>
        <h2>Sign In to HAOS.fm</h2>
        
        <div class="oauth-buttons">
          <button onclick="HAOSAuth.loginWithGoogle()" class="btn-oauth btn-google">
            <i class="fab fa-google"></i> Continue with Google
          </button>
          <button onclick="HAOSAuth.loginWithApple()" class="btn-oauth btn-apple">
            <i class="fab fa-apple"></i> Continue with Apple
          </button>
          <button onclick="HAOSAuth.loginWithFacebook()" class="btn-oauth btn-facebook">
            <i class="fab fa-facebook"></i> Continue with Facebook
          </button>
        </div>
        
        <div class="divider">or</div>
        
        <form id="magic-link-form">
          <input type="email" placeholder="Enter your email" required />
          <button type="submit">Send Magic Link</button>
        </form>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #haos-login-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        align-items: center;
        justify-content: center;
      }
      .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
      }
      .modal-content {
        position: relative;
        background: #1a1a1a;
        padding: 2rem;
        border-radius: 12px;
        max-width: 400px;
        width: 90%;
        color: #fff;
      }
      .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        color: #fff;
        font-size: 2rem;
        cursor: pointer;
      }
      .btn-oauth {
        width: 100%;
        padding: 12px;
        margin: 8px 0;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      .btn-google { background: #fff; color: #333; }
      .btn-apple { background: #000; color: #fff; }
      .btn-facebook { background: #1877f2; color: #fff; }
    `;
    document.head.appendChild(style);

    // Add event listener for magic link form
    modal.querySelector('#magic-link-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target.querySelector('input').value;
      try {
        await this.sendMagicLink(email);
        alert('Check your email for the magic link!');
        modal.style.display = 'none';
      } catch (error) {
        alert(error.message);
      }
    });

    return modal;
  }

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================

  /**
   * Subscribe to auth state changes
   */
  onAuthChange(callback) {
    this.listeners.push(callback);
    
    // Call immediately with current state
    if (this.initialized) {
      callback({
        authenticated: this.authenticated,
        tier: this.tier,
        user: this.currentUser
      });
    }
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners() {
    const state = {
      authenticated: this.authenticated,
      tier: this.tier,
      user: this.currentUser,
      sessionId: this.sessionId
    };

    this.listeners.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('[HAOSAuth] Listener error:', error);
      }
    });

    // Update UI automatically
    this.updateUI();
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get user display name
   */
  getUserName() {
    return this.currentUser?.name || 'Guest';
  }

  /**
   * Check if user is premium
   */
  isPremium() {
    return this.tier === 'premium' || this.tier === 'pro';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.authenticated;
  }

  /**
   * Get current tier
   */
  getTier() {
    return this.tier;
  }
}

// Create global instance
window.HAOSAuth = new HAOSAuthManager();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.HAOSAuth.init();
  });
} else {
  window.HAOSAuth.init();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HAOSAuthManager;
}
