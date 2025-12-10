/**
 * HAOS Navigation Component
 * Unified navigation system for all HAOS.fm workspaces
 * 
 * Usage:
 * <haos-navigation variant="full|workspace|minimal" workspace-name="TECHNO WORKSPACE"></haos-navigation>
 * 
 * @version 1.0.0
 * @author HAOS.fm
 */

class HAOSNavigation extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'workspace-name', 'back-url', 'current-page', 'show-search'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default configuration
    this._config = {
      variant: 'full', // full, workspace, minimal
      workspaceName: '',
      backUrl: '/',
      currentPage: '',
      showSearch: false
    };
    
    // Workspace definitions
    this.workspaces = [
      { id: 'techno', name: 'TECHNO', fullName: 'TECHNO WORKSPACE', icon: '🎛️', path: '/techno-workspace.html', color: '#FF6B35' },
      { id: 'modular', name: 'MODULAR', fullName: 'MODULAR WORKSPACE', icon: '🎹', path: '/modular-workspace.html', color: '#00D9FF' },
      { id: 'builder', name: 'BUILDER', fullName: 'BUILDER', icon: '🔧', path: '/builder.html', color: '#39FF14' },
      { id: 'sounds', name: 'SOUNDS', fullName: 'SOUNDS', icon: '🎵', path: '/sounds.html', color: '#FF006E' }
    ];
    
    // Navigation links
    this.navLinks = [
      { name: 'WORKSPACES', path: '#', hasDropdown: true },
      { name: 'SOUNDS', path: '/sounds.html', icon: 'fa-music' },
      { name: 'RADIO', path: '/radio.html', icon: 'fa-broadcast-tower' },
      { name: 'PRICING', path: '/pricing.html', icon: 'fa-tag' }
    ];
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
    this.checkAuthStatus();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'variant':
        this._config.variant = newValue || 'full';
        break;
      case 'workspace-name':
        this._config.workspaceName = newValue || '';
        break;
      case 'back-url':
        this._config.backUrl = newValue || '/';
        break;
      case 'current-page':
        this._config.currentPage = newValue || '';
        break;
      case 'show-search':
        this._config.showSearch = newValue === 'true';
        break;
    }
    
    if (this.shadowRoot.innerHTML) {
      this.render();
      this.attachEventListeners();
    }
  }

  getStyles() {
    return `
      <style>
        :host {
          display: block;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* ==========================================
           HAOS DESIGN SYSTEM VARIABLES
           ========================================== */
        .haos-nav {
          --haos-black: #0a0a0a;
          --haos-panel: rgba(20, 20, 25, 0.95);
          --haos-orange: #FF6B35;
          --haos-orange-bright: #FF8C42;
          --haos-orange-dark: #E55A2B;
          --haos-green: #39FF14;
          --haos-cyan: #00D9FF;
          --haos-pink: #FF006E;
          --haos-text: #e0e0e0;
          --haos-dim: #888;
          --haos-border: rgba(255, 107, 53, 0.2);
          --haos-sepia-cream: #f5e6d3;
          
          --font-display: 'Bebas Neue', sans-serif;
          --font-mono: 'Space Mono', monospace;
          --font-body: 'Inter', sans-serif;
        }

        /* ==========================================
           BASE NAVIGATION STYLES
           ========================================== */
        .haos-nav {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: var(--haos-panel);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--haos-border);
        }

        .haos-nav__container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
          gap: 1rem;
        }

        /* ==========================================
           LOGO SECTION
           ========================================== */
        .haos-nav__logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          flex-shrink: 0;
        }

        .haos-nav__logo-img {
          width: 36px;
          height: 36px;
          object-fit: contain;
          filter: drop-shadow(0 0 8px rgba(255, 107, 53, 0.5));
        }

        .haos-nav__brand {
          display: flex;
          flex-direction: column;
        }

        .haos-nav__brand-name {
          font-family: var(--font-display);
          font-size: 1.4rem;
          letter-spacing: 2px;
          background: linear-gradient(135deg, var(--haos-orange), var(--haos-orange-bright));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
        }

        .haos-nav__brand-tagline {
          font-family: var(--font-mono);
          font-size: 0.55rem;
          color: var(--haos-dim);
          letter-spacing: 0.5px;
        }

        /* ==========================================
           BACK BUTTON (Workspace/Minimal variants)
           ========================================== */
        .haos-nav__back {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--haos-text);
          text-decoration: none;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .haos-nav__back:hover {
          color: var(--haos-orange);
          background: rgba(255, 107, 53, 0.1);
          border-color: var(--haos-border);
        }

        .haos-nav__back i {
          font-size: 0.9rem;
        }

        /* ==========================================
           WORKSPACE TITLE
           ========================================== */
        .haos-nav__title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          letter-spacing: 2px;
          color: var(--haos-text);
          text-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
        }

        .haos-nav__title--minimal {
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .haos-nav__title-icon {
          font-size: 1.1rem;
        }

        /* ==========================================
           NAVIGATION LINKS
           ========================================== */
        .haos-nav__links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .haos-nav__link {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--haos-text);
          text-decoration: none;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          border: 1px solid transparent;
        }

        .haos-nav__link:hover {
          color: var(--haos-orange);
          background: rgba(255, 107, 53, 0.1);
          border-color: var(--haos-border);
        }

        .haos-nav__link--active {
          color: var(--haos-orange);
          background: rgba(255, 107, 53, 0.15);
          border-color: var(--haos-orange);
        }

        .haos-nav__link i {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        /* ==========================================
           WORKSPACE DROPDOWN
           ========================================== */
        .haos-nav__dropdown {
          position: relative;
        }

        .haos-nav__dropdown-trigger {
          cursor: pointer;
        }

        .haos-nav__dropdown-trigger::after {
          content: '▼';
          font-size: 0.6rem;
          margin-left: 0.25rem;
          transition: transform 0.2s;
        }

        .haos-nav__dropdown:hover .haos-nav__dropdown-trigger::after {
          transform: rotate(180deg);
        }

        .haos-nav__dropdown-menu {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          background: var(--haos-panel);
          border: 1px solid var(--haos-border);
          border-radius: 12px;
          padding: 0.75rem;
          min-width: 280px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          z-index: 1001;
        }

        .haos-nav__dropdown:hover .haos-nav__dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(5px);
        }

        .haos-nav__workspace-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          color: var(--haos-text);
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .haos-nav__workspace-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--workspace-color, var(--haos-border));
        }

        .haos-nav__workspace-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .haos-nav__workspace-info {
          flex: 1;
        }

        .haos-nav__workspace-name {
          font-family: var(--font-display);
          font-size: 1rem;
          letter-spacing: 1px;
          color: var(--workspace-color, var(--haos-text));
        }

        .haos-nav__workspace-desc {
          font-size: 0.7rem;
          color: var(--haos-dim);
          margin-top: 2px;
        }

        /* ==========================================
           WORKSPACE SWITCHER BUTTON
           ========================================== */
        .haos-nav__switcher {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid var(--haos-border);
          color: var(--haos-orange);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .haos-nav__switcher:hover {
          background: rgba(255, 107, 53, 0.2);
          border-color: var(--haos-orange);
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
        }

        .haos-nav__switcher i {
          font-size: 0.9rem;
        }

        .haos-nav__switcher-shortcut {
          display: none;
          font-size: 0.65rem;
          opacity: 0.6;
          margin-left: 0.5rem;
        }

        @media (min-width: 768px) {
          .haos-nav__switcher-shortcut {
            display: inline;
          }
        }

        /* ==========================================
           USER MENU
           ========================================== */
        .haos-nav__user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .haos-nav__user-btn {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .haos-nav__login {
          background: transparent;
          border: 1px solid var(--haos-border);
          color: var(--haos-text);
        }

        .haos-nav__login:hover {
          border-color: var(--haos-orange);
          color: var(--haos-orange);
        }

        .haos-nav__register {
          background: linear-gradient(135deg, var(--haos-orange), var(--haos-orange-bright));
          border: none;
          color: white;
          font-weight: 600;
        }

        .haos-nav__register:hover {
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
          transform: translateY(-1px);
        }

        .haos-nav__avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--haos-orange), var(--haos-pink));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 1rem;
          color: white;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s ease;
        }

        .haos-nav__avatar:hover {
          border-color: var(--haos-orange);
          box-shadow: 0 0 15px rgba(255, 107, 53, 0.5);
        }

        /* ==========================================
           WORKSPACE ACTIONS (Save, Load, etc.)
           ========================================== */
        .haos-nav__actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .haos-nav__action-btn {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--haos-text);
        }

        .haos-nav__action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--haos-border);
        }

        .haos-nav__action-btn--primary {
          background: rgba(255, 107, 53, 0.2);
          border-color: var(--haos-orange);
          color: var(--haos-orange);
        }

        .haos-nav__action-btn--primary:hover {
          background: var(--haos-orange);
          color: white;
        }

        /* ==========================================
           SEARCH BAR
           ========================================== */
        .haos-nav__search {
          position: relative;
          flex: 1;
          max-width: 300px;
        }

        .haos-nav__search-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--haos-border);
          border-radius: 8px;
          padding: 0.5rem 1rem 0.5rem 2.5rem;
          color: var(--haos-text);
          font-family: var(--font-body);
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }

        .haos-nav__search-input::placeholder {
          color: var(--haos-dim);
        }

        .haos-nav__search-input:focus {
          outline: none;
          border-color: var(--haos-orange);
          box-shadow: 0 0 15px rgba(255, 107, 53, 0.2);
        }

        .haos-nav__search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--haos-dim);
          font-size: 0.85rem;
        }

        /* ==========================================
           MOBILE MENU
           ========================================== */
        .haos-nav__mobile-toggle {
          display: none;
          background: transparent;
          border: 1px solid var(--haos-border);
          color: var(--haos-text);
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .haos-nav__mobile-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .haos-nav__links,
          .haos-nav__search {
            display: none;
          }

          .haos-nav--mobile-open .haos-nav__links {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 60px;
            left: 0;
            right: 0;
            background: var(--haos-panel);
            padding: 1rem;
            border-bottom: 1px solid var(--haos-border);
          }

          .haos-nav__dropdown-menu {
            position: static;
            transform: none;
            opacity: 1;
            visibility: visible;
            box-shadow: none;
            background: rgba(255, 255, 255, 0.02);
            margin-top: 0.5rem;
          }

          .haos-nav__user-btn span {
            display: none;
          }
        }

        /* ==========================================
           ANIMATIONS
           ========================================== */
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px var(--haos-orange); }
          50% { box-shadow: 0 0 20px var(--haos-orange); }
        }

        .haos-nav__live-indicator {
          width: 8px;
          height: 8px;
          background: var(--haos-green);
          border-radius: 50%;
          animation: pulse-glow 2s ease-in-out infinite;
        }
      </style>
    `;
  }

  render() {
    const { variant, workspaceName, backUrl, showSearch } = this._config;
    
    let content = '';
    
    switch (variant) {
      case 'workspace':
        content = this.renderWorkspaceNav();
        break;
      case 'minimal':
        content = this.renderMinimalNav();
        break;
      case 'full':
      default:
        content = this.renderFullNav();
        break;
    }
    
    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      ${content}
    `;
  }

  renderFullNav() {
    return `
      <nav class="haos-nav haos-nav--full">
        <div class="haos-nav__container">
          <!-- Logo -->
          <a href="/" class="haos-nav__logo">
            <img src="/images/haos-logo-white.png" alt="HAOS.fm" class="haos-nav__logo-img" 
                 onerror="this.style.display='none'">
            <div class="haos-nav__brand">
              <span class="haos-nav__brand-name">HAOS.FM</span>
              <span class="haos-nav__brand-tagline">HARDWARE-INSPIRED SYNTHESIS</span>
            </div>
          </a>

          <!-- Navigation Links -->
          <div class="haos-nav__links">
            <!-- Workspaces Dropdown -->
            <div class="haos-nav__dropdown">
              <a href="#" class="haos-nav__link haos-nav__dropdown-trigger">
                <i class="fas fa-th-large"></i>
                WORKSPACES
              </a>
              <div class="haos-nav__dropdown-menu">
                ${this.workspaces.map(ws => `
                  <a href="${ws.path}" class="haos-nav__workspace-item" style="--workspace-color: ${ws.color}">
                    <span class="haos-nav__workspace-icon">${ws.icon}</span>
                    <div class="haos-nav__workspace-info">
                      <div class="haos-nav__workspace-name">${ws.fullName}</div>
                      <div class="haos-nav__workspace-desc">${this.getWorkspaceDescription(ws.id)}</div>
                    </div>
                  </a>
                `).join('')}
              </div>
            </div>

            ${this.navLinks.filter(l => !l.hasDropdown).map(link => `
              <a href="${link.path}" class="haos-nav__link ${this._config.currentPage === link.name.toLowerCase() ? 'haos-nav__link--active' : ''}">
                ${link.icon ? `<i class="fas ${link.icon}"></i>` : ''}
                ${link.name}
              </a>
            `).join('')}
          </div>

          <!-- User Menu -->
          <div class="haos-nav__user" id="user-menu">
            <a href="/login.html" class="haos-nav__user-btn haos-nav__login">
              <i class="fas fa-sign-in-alt"></i>
              <span>LOGIN</span>
            </a>
            <a href="/register.html" class="haos-nav__user-btn haos-nav__register">
              <i class="fas fa-user-plus"></i>
              <span>REGISTER</span>
            </a>
          </div>

          <!-- Mobile Toggle -->
          <button class="haos-nav__mobile-toggle" aria-label="Toggle menu">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </nav>
    `;
  }

  renderWorkspaceNav() {
    const { workspaceName, backUrl } = this._config;
    const currentWorkspace = this.workspaces.find(ws => 
      workspaceName.toLowerCase().includes(ws.id)
    );
    
    return `
      <nav class="haos-nav haos-nav--workspace">
        <div class="haos-nav__container">
          <!-- Left: Back + Title -->
          <div style="display: flex; align-items: center; gap: 1rem;">
            <a href="${backUrl}" class="haos-nav__back">
              <i class="fas fa-arrow-left"></i>
              HAOS.FM
            </a>
            <h1 class="haos-nav__title">${workspaceName || 'WORKSPACE'}</h1>
            ${currentWorkspace ? `<div class="haos-nav__live-indicator" title="Live"></div>` : ''}
          </div>

          <!-- Center: Workspace Switcher -->
          <button class="haos-nav__switcher" id="workspace-switcher">
            <i class="fas fa-th-large"></i>
            SWITCH
            <span class="haos-nav__switcher-shortcut">⌘K</span>
          </button>

          <!-- Right: Actions -->
          <div class="haos-nav__actions">
            <button class="haos-nav__action-btn" title="Load Preset">
              <i class="fas fa-folder-open"></i>
              LOAD
            </button>
            <button class="haos-nav__action-btn haos-nav__action-btn--primary" title="Save Preset">
              <i class="fas fa-save"></i>
              SAVE
            </button>
            <div class="haos-nav__user" id="user-menu">
              <div class="haos-nav__avatar" id="user-avatar" title="Account">?</div>
            </div>
          </div>
        </div>
      </nav>
    `;
  }

  renderMinimalNav() {
    const { workspaceName, backUrl } = this._config;
    
    return `
      <nav class="haos-nav haos-nav--minimal">
        <div class="haos-nav__container">
          <!-- Left: Back Button -->
          <a href="${backUrl}" class="haos-nav__back">
            <i class="fas fa-arrow-left"></i>
            Back
          </a>

          <!-- Center: Title -->
          <h1 class="haos-nav__title haos-nav__title--minimal">
            ${workspaceName || 'Instrument'}
          </h1>

          <!-- Right: Actions -->
          <div class="haos-nav__actions">
            <button class="haos-nav__action-btn" title="Settings">
              <i class="fas fa-cog"></i>
            </button>
            <button class="haos-nav__action-btn haos-nav__action-btn--primary" title="Save">
              <i class="fas fa-save"></i>
              SAVE
            </button>
          </div>
        </div>
      </nav>
    `;
  }

  getWorkspaceDescription(id) {
    const descriptions = {
      techno: 'TB-303, TR-909, Sequencer',
      modular: 'ARP 2600, Guitar, Violin',
      builder: 'Create preset variations',
      sounds: '1000+ presets library'
    };
    return descriptions[id] || '';
  }

  attachEventListeners() {
    // Mobile menu toggle
    const mobileToggle = this.shadowRoot.querySelector('.haos-nav__mobile-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        const nav = this.shadowRoot.querySelector('.haos-nav');
        nav.classList.toggle('haos-nav--mobile-open');
      });
    }

    // Workspace switcher
    const switcher = this.shadowRoot.querySelector('#workspace-switcher');
    if (switcher) {
      switcher.addEventListener('click', () => {
        this.openWorkspaceSwitcher();
      });
    }

    // User avatar click
    const avatar = this.shadowRoot.querySelector('#user-avatar');
    if (avatar) {
      avatar.addEventListener('click', () => {
        window.location.href = '/account.html';
      });
    }

    // Keyboard shortcut for workspace switcher (Ctrl/Cmd + K)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openWorkspaceSwitcher();
      }
    });

    // Prevent dropdown from closing when clicking inside
    const dropdown = this.shadowRoot.querySelector('.haos-nav__dropdown-menu');
    if (dropdown) {
      dropdown.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }

  async checkAuthStatus() {
    const userMenu = this.shadowRoot.querySelector('#user-menu');
    if (!userMenu) return;

    try {
      const token = localStorage.getItem('haos_token') || localStorage.getItem('haos_admin_token');
      const user = localStorage.getItem('haos_user') || localStorage.getItem('haos_admin');
      
      if (token && user) {
        const userData = JSON.parse(user);
        const initial = (userData.name || userData.email || '?').charAt(0).toUpperCase();
        
        userMenu.innerHTML = `
          <div class="haos-nav__avatar" id="user-avatar" title="${userData.name || userData.email}">${initial}</div>
        `;
        
        // Re-attach avatar click
        const avatar = userMenu.querySelector('#user-avatar');
        if (avatar) {
          avatar.addEventListener('click', () => {
            window.location.href = '/account.html';
          });
        }
      }
    } catch (error) {
      console.warn('Error checking auth status:', error);
    }
  }

  openWorkspaceSwitcher() {
    // Dispatch custom event for workspace switcher modal
    this.dispatchEvent(new CustomEvent('open-workspace-switcher', {
      bubbles: true,
      composed: true
    }));

    // Fallback: Show simple workspace selector if no modal exists
    if (!window.HAOSWorkspaceSwitcher) {
      const workspace = prompt(
        'Switch to workspace:\n1. TECHNO WORKSPACE\n2. MODULAR WORKSPACE\n3. BUILDER\n4. SOUNDS\n\nEnter number (1-4):'
      );
      
      if (workspace) {
        const paths = [
          '/techno-workspace.html',
          '/modular-workspace.html',
          '/builder.html',
          '/sounds.html'
        ];
        const index = parseInt(workspace) - 1;
        if (index >= 0 && index < paths.length) {
          window.location.href = paths[index];
        }
      }
    }
  }
}

// Register the custom element
customElements.define('haos-navigation', HAOSNavigation);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HAOSNavigation;
}
