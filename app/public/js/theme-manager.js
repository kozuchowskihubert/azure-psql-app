/**
 * Theme Manager - Universal Dark/Light Mode System
 * ============================================
 * Provides consistent theme management across all haos.fm pages
 * 
 * Features:
 * - LocalStorage persistence
 * - Smooth transitions
 * - Toast notifications
 * - CSS variable system
 * - Auto-detection of user preference
 * 
 * Usage:
 * <script src="/js/theme-manager.js"></script>
 * <script>
 *   const themeManager = new ThemeManager();
 *   themeManager.init();
 * </script>
 */

class ThemeManager {
    constructor(options = {}) {
        this.options = {
            storageKey: 'theme',
            defaultTheme: 'dark',
            toggleButtonId: 'theme-toggle',
            showToast: true,
            autoDetect: false,
            ...options
        };
        
        this.theme = null;
        this.toggleButton = null;
        this.themeIcon = null;
    }
    
    /**
     * Initialize theme system
     */
    init() {
        // Get saved theme or use default
        this.theme = this.options.autoDetect 
            ? this.detectPreferredTheme() 
            : (localStorage.getItem(this.options.storageKey) || this.options.defaultTheme);
        
        // Apply theme immediately (before page render)
        this.applyTheme(this.theme, false);
        
        // Setup toggle button when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupToggle());
        } else {
            this.setupToggle();
        }
        
        // Inject necessary styles
        this.injectStyles();
    }
    
    /**
     * Detect user's preferred color scheme
     */
    detectPreferredTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }
    
    /**
     * Setup theme toggle button
     */
    setupToggle() {
        this.toggleButton = document.getElementById(this.options.toggleButtonId);
        
        if (!this.toggleButton) {
            console.warn(`Theme toggle button with id "${this.options.toggleButtonId}" not found`);
            return;
        }
        
        // Find or create icon element
        this.themeIcon = this.toggleButton.querySelector('i');
        if (!this.themeIcon) {
            this.themeIcon = document.createElement('i');
            this.toggleButton.appendChild(this.themeIcon);
        }
        
        // Update icon to match current theme
        this.updateIcon();
        
        // Add click listener
        this.toggleButton.addEventListener('click', () => this.toggle());
        
        // Add keyboard support
        this.toggleButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });
        
        // Ensure button is keyboard accessible
        if (!this.toggleButton.hasAttribute('tabindex')) {
            this.toggleButton.setAttribute('tabindex', '0');
        }
        if (!this.toggleButton.hasAttribute('aria-label')) {
            this.toggleButton.setAttribute('aria-label', 'Toggle theme');
        }
    }
    
    /**
     * Toggle between light and dark themes
     */
    toggle() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme, this.options.showToast);
    }
    
    /**
     * Apply a specific theme
     */
    applyTheme(theme, showToast = false) {
        this.theme = theme;
        
        // Update body class
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
        
        // Update icon
        this.updateIcon();
        
        // Save to localStorage
        localStorage.setItem(this.options.storageKey, theme);
        
        // Update button aria-label
        if (this.toggleButton) {
            this.toggleButton.setAttribute('aria-label', 
                `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
            );
        }
        
        // Show notification
        if (showToast) {
            this.showToast(theme);
        }
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themechange', { 
            detail: { theme } 
        }));
    }
    
    /**
     * Update theme icon
     */
    updateIcon() {
        if (!this.themeIcon) return;
        
        this.themeIcon.className = ''; // Clear all classes
        if (this.theme === 'light') {
            this.themeIcon.className = 'fas fa-sun';
        } else {
            this.themeIcon.className = 'fas fa-moon';
        }
    }
    
    /**
     * Show toast notification
     */
    showToast(theme) {
        const toast = document.createElement('div');
        toast.className = 'theme-toast';
        toast.innerHTML = `
            <span class="theme-toast-icon">${theme === 'light' ? '☀️' : '🌙'}</span>
            <span class="theme-toast-text">${theme === 'light' ? 'Light' : 'Dark'} mode activated</span>
        `;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
    
    /**
     * Inject required CSS styles
     */
    injectStyles() {
        if (document.getElementById('theme-manager-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'theme-manager-styles';
        style.textContent = `
            /* Theme Manager Styles */
            
            /* CSS Variables for Light Mode */
            :root {
                /* Dark mode (default) */
                --bg-primary: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
                --bg-secondary: rgba(255, 255, 255, 0.1);
                --bg-tertiary: rgba(255, 255, 255, 0.05);
                --text-primary: #ffffff;
                --text-secondary: #9ca3af;
                --text-tertiary: #6b7280;
                --border-color: rgba(255, 255, 255, 0.1);
                --card-bg: rgba(255, 255, 255, 0.1);
                --hover-bg: rgba(255, 255, 255, 0.2);
                --shadow: rgba(0, 0, 0, 0.3);
            }
            
            body.light-mode {
                /* Light mode colors */
                --bg-primary: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 50%, #dde3ef 100%);
                --bg-secondary: rgba(0, 0, 0, 0.05);
                --bg-tertiary: rgba(0, 0, 0, 0.02);
                --text-primary: #1a202c;
                --text-secondary: #4a5568;
                --text-tertiary: #718096;
                --border-color: rgba(0, 0, 0, 0.1);
                --card-bg: rgba(255, 255, 255, 0.9);
                --hover-bg: rgba(0, 0, 0, 0.1);
                --shadow: rgba(0, 0, 0, 0.1);
            }
            
            /* Smooth transitions */
            body {
                transition: background 0.3s ease, color 0.3s ease;
            }
            
            body.light-mode {
                background: var(--bg-primary) !important;
                color: var(--text-primary) !important;
            }
            
            /* Theme toggle button animation */
            #theme-toggle {
                cursor: pointer;
                transition: transform 0.2s ease, background-color 0.2s ease;
            }
            
            #theme-toggle:hover {
                transform: scale(1.1);
            }
            
            #theme-toggle:active {
                transform: scale(0.95);
            }
            
            #theme-toggle i {
                transition: transform 0.3s ease, color 0.3s ease;
            }
            
            #theme-toggle:hover i {
                transform: rotate(20deg);
            }
            
            #theme-toggle:focus {
                outline: 2px solid var(--text-primary);
                outline-offset: 2px;
            }
            
            /* Toast notification */
            .theme-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 12px 20px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 10px;
                opacity: 0;
                transform: translateX(400px);
                transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            .theme-toast.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .theme-toast-icon {
                font-size: 1.2em;
            }
            
            .theme-toast-text {
                font-weight: 500;
                font-size: 0.95em;
            }
            
            /* Light mode adjustments for common elements */
            body.light-mode .glass,
            body.light-mode .card {
                background: var(--card-bg);
                border-color: var(--border-color);
                box-shadow: 0 4px 6px var(--shadow);
            }
            
            body.light-mode .text-gray-400,
            body.light-mode .text-gray-300 {
                color: var(--text-secondary) !important;
            }
            
            body.light-mode .text-gray-500,
            body.light-mode .text-gray-600 {
                color: var(--text-tertiary) !important;
            }
            
            body.light-mode h1, 
            body.light-mode h2, 
            body.light-mode h3, 
            body.light-mode h4,
            body.light-mode h5,
            body.light-mode h6 {
                color: var(--text-primary) !important;
            }
            
            body.light-mode button:hover {
                background: var(--hover-bg);
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .theme-toast {
                    top: 10px;
                    right: 10px;
                    padding: 10px 16px;
                    font-size: 0.9em;
                }
            }
            
            /* Animation keyframes */
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(400px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Get current theme
     */
    getTheme() {
        return this.theme;
    }
    
    /**
     * Check if current theme is dark
     */
    isDark() {
        return this.theme === 'dark';
    }
    
    /**
     * Check if current theme is light
     */
    isLight() {
        return this.theme === 'light';
    }
}

// Auto-initialize if script is loaded directly (not as module)
if (typeof module === 'undefined') {
    window.ThemeManager = ThemeManager;
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
