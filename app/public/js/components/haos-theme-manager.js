/**
 * HAOS Theme Manager Component
 * Handles theming, dark/light modes, and workspace-specific color schemes
 * 
 * Usage:
 * <haos-theme-manager workspace="techno" theme="dark"></haos-theme-manager>
 * 
 * Or via JavaScript:
 * HAOSTheme.setWorkspace('modular');
 * HAOSTheme.setTheme('light');
 * 
 * @version 1.0.0
 * @author HAOS.fm
 */

class HAOSThemeManager extends HTMLElement {
  static get observedAttributes() {
    return ['workspace', 'theme'];
  }

  constructor() {
    super();
    
    // Design System Tokens
    this.designSystem = {
      // Brand Colors
      brand: {
        orange: '#FF6B35',
        orangeBright: '#FF8C42',
        orangeDark: '#E55A2D',
        cyan: '#00D9FF',
        cyanBright: '#00EEFF',
        cyanDark: '#00B8D9',
        green: '#39FF14',
        greenBright: '#50FF30',
        greenDark: '#2EC40F',
        pink: '#FF006E',
        pinkBright: '#FF2080',
        pinkDark: '#D9005D',
        purple: '#8B5CF6',
        gold: '#FFD700'
      },
      
      // Workspace Colors
      workspaces: {
        techno: {
          primary: '#FF6B35',
          secondary: '#FF8C42',
          accent: '#39FF14',
          glow: 'rgba(255, 107, 53, 0.4)'
        },
        modular: {
          primary: '#00D9FF',
          secondary: '#00EEFF',
          accent: '#FF006E',
          glow: 'rgba(0, 217, 255, 0.4)'
        },
        builder: {
          primary: '#39FF14',
          secondary: '#50FF30',
          accent: '#FF6B35',
          glow: 'rgba(57, 255, 20, 0.4)'
        },
        sounds: {
          primary: '#FF006E',
          secondary: '#FF2080',
          accent: '#00D9FF',
          glow: 'rgba(255, 0, 110, 0.4)'
        }
      },
      
      // Theme Colors
      themes: {
        dark: {
          bg: '#0a0a0a',
          bgAlt: '#0f0f12',
          surface: 'rgba(20, 20, 25, 0.95)',
          surfaceAlt: 'rgba(30, 30, 35, 0.95)',
          border: 'rgba(255, 255, 255, 0.1)',
          text: '#e0e0e0',
          textAlt: '#b0b0b0',
          textDim: '#888888',
          textMuted: '#555555',
          overlay: 'rgba(0, 0, 0, 0.85)',
          shadow: 'rgba(0, 0, 0, 0.4)'
        },
        light: {
          bg: '#f5f5f7',
          bgAlt: '#ffffff',
          surface: 'rgba(255, 255, 255, 0.95)',
          surfaceAlt: 'rgba(245, 245, 247, 0.95)',
          border: 'rgba(0, 0, 0, 0.1)',
          text: '#1a1a1a',
          textAlt: '#333333',
          textDim: '#666666',
          textMuted: '#999999',
          overlay: 'rgba(255, 255, 255, 0.85)',
          shadow: 'rgba(0, 0, 0, 0.1)'
        }
      },
      
      // Typography
      fonts: {
        display: "'Bebas Neue', sans-serif",
        body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        mono: "'Space Mono', monospace"
      },
      
      // Spacing
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        xxl: '3rem'
      },
      
      // Border Radius
      radius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '24px',
        round: '50%'
      },
      
      // Transitions
      transitions: {
        fast: '0.15s ease',
        normal: '0.25s ease',
        slow: '0.4s ease',
        spring: '0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      },
      
      // Z-Index Scale
      zIndex: {
        base: 1,
        dropdown: 100,
        sticky: 200,
        modal: 1000,
        tooltip: 2000,
        notification: 3000
      }
    };
    
    // State
    this._workspace = 'techno';
    this._theme = 'dark';
    this._initialized = false;
    
    // Bind methods
    this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
  }

  connectedCallback() {
    if (!this._initialized) {
      this.initialize();
      this._initialized = true;
    }
  }

  disconnectedCallback() {
    // Remove system theme listener
    window.matchMedia('(prefers-color-scheme: dark)')
      .removeEventListener('change', this.handleSystemThemeChange);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'workspace':
        this._workspace = newValue || 'techno';
        this.applyWorkspace();
        break;
      case 'theme':
        this._theme = newValue || 'dark';
        this.applyTheme();
        break;
    }
  }

  initialize() {
    // Load saved preferences
    this.loadPreferences();
    
    // Apply initial styles
    this.injectBaseStyles();
    this.applyTheme();
    this.applyWorkspace();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', this.handleSystemThemeChange);
    
    // Expose global API
    window.HAOSTheme = {
      setWorkspace: (ws) => this.setWorkspace(ws),
      setTheme: (theme) => this.setTheme(theme),
      toggle: () => this.toggleTheme(),
      getDesignSystem: () => this.designSystem,
      getCurrentWorkspace: () => this._workspace,
      getCurrentTheme: () => this._theme
    };
  }

  loadPreferences() {
    try {
      const saved = localStorage.getItem('haos_theme_prefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        this._theme = prefs.theme || 'dark';
        this._workspace = prefs.workspace || 'techno';
      } else {
        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          this._theme = 'light';
        }
      }
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
    }
  }

  savePreferences() {
    try {
      localStorage.setItem('haos_theme_prefs', JSON.stringify({
        theme: this._theme,
        workspace: this._workspace
      }));
    } catch (error) {
      console.warn('Failed to save theme preferences:', error);
    }
  }

  injectBaseStyles() {
    // Check if styles already exist
    if (document.getElementById('haos-theme-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'haos-theme-styles';
    style.textContent = this.getBaseStyles();
    document.head.appendChild(style);
    
    // Import fonts if not already loaded
    this.loadFonts();
  }

  loadFonts() {
    const existingLink = document.querySelector('link[href*="fonts.googleapis.com"]');
    if (existingLink) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap';
    document.head.appendChild(link);
  }

  getBaseStyles() {
    return `
      /* HAOS Design System Base Styles */
      :root {
        /* Brand Colors */
        --haos-orange: ${this.designSystem.brand.orange};
        --haos-orange-bright: ${this.designSystem.brand.orangeBright};
        --haos-orange-dark: ${this.designSystem.brand.orangeDark};
        --haos-cyan: ${this.designSystem.brand.cyan};
        --haos-cyan-bright: ${this.designSystem.brand.cyanBright};
        --haos-cyan-dark: ${this.designSystem.brand.cyanDark};
        --haos-green: ${this.designSystem.brand.green};
        --haos-green-bright: ${this.designSystem.brand.greenBright};
        --haos-green-dark: ${this.designSystem.brand.greenDark};
        --haos-pink: ${this.designSystem.brand.pink};
        --haos-pink-bright: ${this.designSystem.brand.pinkBright};
        --haos-pink-dark: ${this.designSystem.brand.pinkDark};
        --haos-purple: ${this.designSystem.brand.purple};
        --haos-gold: ${this.designSystem.brand.gold};
        
        /* Typography */
        --haos-font-display: ${this.designSystem.fonts.display};
        --haos-font-body: ${this.designSystem.fonts.body};
        --haos-font-mono: ${this.designSystem.fonts.mono};
        
        /* Spacing */
        --haos-space-xs: ${this.designSystem.spacing.xs};
        --haos-space-sm: ${this.designSystem.spacing.sm};
        --haos-space-md: ${this.designSystem.spacing.md};
        --haos-space-lg: ${this.designSystem.spacing.lg};
        --haos-space-xl: ${this.designSystem.spacing.xl};
        --haos-space-xxl: ${this.designSystem.spacing.xxl};
        
        /* Border Radius */
        --haos-radius-sm: ${this.designSystem.radius.sm};
        --haos-radius-md: ${this.designSystem.radius.md};
        --haos-radius-lg: ${this.designSystem.radius.lg};
        --haos-radius-xl: ${this.designSystem.radius.xl};
        --haos-radius-xxl: ${this.designSystem.radius.xxl};
        
        /* Transitions */
        --haos-transition-fast: ${this.designSystem.transitions.fast};
        --haos-transition-normal: ${this.designSystem.transitions.normal};
        --haos-transition-slow: ${this.designSystem.transitions.slow};
        --haos-transition-spring: ${this.designSystem.transitions.spring};
        
        /* Z-Index */
        --haos-z-dropdown: ${this.designSystem.zIndex.dropdown};
        --haos-z-sticky: ${this.designSystem.zIndex.sticky};
        --haos-z-modal: ${this.designSystem.zIndex.modal};
        --haos-z-tooltip: ${this.designSystem.zIndex.tooltip};
        --haos-z-notification: ${this.designSystem.zIndex.notification};
      }

      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }

      /* Selection */
      ::selection {
        background: var(--haos-primary, var(--haos-orange));
        color: white;
      }

      /* Focus outline */
      *:focus-visible {
        outline: 2px solid var(--haos-primary, var(--haos-orange));
        outline-offset: 2px;
      }

      /* Scrollbar styling for dark theme */
      [data-haos-theme="dark"] ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      [data-haos-theme="dark"] ::-webkit-scrollbar-track {
        background: var(--haos-bg);
      }

      [data-haos-theme="dark"] ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }

      [data-haos-theme="dark"] ::-webkit-scrollbar-thumb:hover {
        background: var(--haos-primary, var(--haos-orange));
      }

      /* Utility Classes */
      .haos-glow {
        filter: drop-shadow(0 0 10px var(--haos-glow, rgba(255, 107, 53, 0.4)));
      }

      .haos-gradient-text {
        background: linear-gradient(135deg, var(--haos-primary), var(--haos-secondary));
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .haos-panel {
        background: var(--haos-surface);
        border: 1px solid var(--haos-border);
        border-radius: var(--haos-radius-xl);
        padding: var(--haos-space-lg);
      }

      .haos-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--haos-space-sm);
        padding: var(--haos-space-sm) var(--haos-space-lg);
        background: transparent;
        border: 1px solid var(--haos-border);
        border-radius: var(--haos-radius-md);
        color: var(--haos-text);
        font-family: var(--haos-font-mono);
        font-size: 0.875rem;
        cursor: pointer;
        transition: all var(--haos-transition-fast);
      }

      .haos-btn:hover {
        border-color: var(--haos-primary);
        color: var(--haos-primary);
        background: rgba(var(--haos-primary-rgb), 0.1);
      }

      .haos-btn--primary {
        background: var(--haos-primary);
        border-color: var(--haos-primary);
        color: white;
      }

      .haos-btn--primary:hover {
        background: var(--haos-secondary);
        border-color: var(--haos-secondary);
        color: white;
      }

      /* Animations */
      @keyframes haos-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      @keyframes haos-glow-pulse {
        0%, 100% { filter: drop-shadow(0 0 5px var(--haos-glow)); }
        50% { filter: drop-shadow(0 0 20px var(--haos-glow)); }
      }

      @keyframes haos-slide-up {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      @keyframes haos-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .haos-animate-pulse {
        animation: haos-pulse 2s ease-in-out infinite;
      }

      .haos-animate-glow {
        animation: haos-glow-pulse 2s ease-in-out infinite;
      }

      .haos-animate-slide-up {
        animation: haos-slide-up 0.3s ease-out;
      }

      .haos-animate-fade-in {
        animation: haos-fade-in 0.3s ease-out;
      }
    `;
  }

  applyTheme() {
    const theme = this.designSystem.themes[this._theme];
    if (!theme) return;
    
    const root = document.documentElement;
    
    // Set theme attribute
    document.body.setAttribute('data-haos-theme', this._theme);
    
    // Apply theme colors as CSS variables
    root.style.setProperty('--haos-bg', theme.bg);
    root.style.setProperty('--haos-bg-alt', theme.bgAlt);
    root.style.setProperty('--haos-surface', theme.surface);
    root.style.setProperty('--haos-surface-alt', theme.surfaceAlt);
    root.style.setProperty('--haos-border', theme.border);
    root.style.setProperty('--haos-text', theme.text);
    root.style.setProperty('--haos-text-alt', theme.textAlt);
    root.style.setProperty('--haos-text-dim', theme.textDim);
    root.style.setProperty('--haos-text-muted', theme.textMuted);
    root.style.setProperty('--haos-overlay', theme.overlay);
    root.style.setProperty('--haos-shadow', theme.shadow);
    
    // Update body background
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;
    
    this.savePreferences();
    this.dispatchThemeChangeEvent();
  }

  applyWorkspace() {
    const ws = this.designSystem.workspaces[this._workspace];
    if (!ws) return;
    
    const root = document.documentElement;
    
    // Set workspace attribute
    document.body.setAttribute('data-haos-workspace', this._workspace);
    
    // Apply workspace colors
    root.style.setProperty('--haos-primary', ws.primary);
    root.style.setProperty('--haos-secondary', ws.secondary);
    root.style.setProperty('--haos-accent', ws.accent);
    root.style.setProperty('--haos-glow', ws.glow);
    
    // Calculate RGB values for rgba() usage
    const primaryRGB = this.hexToRGB(ws.primary);
    root.style.setProperty('--haos-primary-rgb', primaryRGB);
    
    this.savePreferences();
    this.dispatchWorkspaceChangeEvent();
  }

  hexToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '255, 107, 53'; // Default orange
  }

  handleSystemThemeChange(e) {
    // Only auto-switch if user hasn't explicitly set preference
    const saved = localStorage.getItem('haos_theme_prefs');
    if (!saved) {
      this._theme = e.matches ? 'dark' : 'light';
      this.applyTheme();
    }
  }

  // Public API
  setWorkspace(workspace) {
    if (this.designSystem.workspaces[workspace]) {
      this._workspace = workspace;
      this.setAttribute('workspace', workspace);
      this.applyWorkspace();
    }
  }

  setTheme(theme) {
    if (this.designSystem.themes[theme]) {
      this._theme = theme;
      this.setAttribute('theme', theme);
      this.applyTheme();
    }
  }

  toggleTheme() {
    const newTheme = this._theme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }

  dispatchThemeChangeEvent() {
    this.dispatchEvent(new CustomEvent('theme-change', {
      detail: { theme: this._theme },
      bubbles: true
    }));
    
    document.dispatchEvent(new CustomEvent('haos-theme-change', {
      detail: { theme: this._theme }
    }));
  }

  dispatchWorkspaceChangeEvent() {
    this.dispatchEvent(new CustomEvent('workspace-change', {
      detail: { workspace: this._workspace },
      bubbles: true
    }));
    
    document.dispatchEvent(new CustomEvent('haos-workspace-change', {
      detail: { workspace: this._workspace }
    }));
  }
}

// Register the custom element
customElements.define('haos-theme-manager', HAOSThemeManager);

// Auto-initialize if no element exists
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('haos-theme-manager')) {
    const themeManager = document.createElement('haos-theme-manager');
    document.body.appendChild(themeManager);
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HAOSThemeManager;
}
