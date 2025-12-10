/**
 * HAOS Components Library
 * Central import file for all HAOS Web Components
 * 
 * Usage:
 * <script src="/js/components/haos-components.js"></script>
 * 
 * This loads all components:
 * - <haos-navigation> - Unified navigation bar
 * - <haos-knob> - Rotary control for parameters
 * - <haos-preset-manager> - Preset loading/saving UI
 * - <haos-theme-manager> - Theme and workspace theming
 * 
 * Plus global utilities:
 * - window.HAOSWorkspaceSwitcher - Modal for Ctrl+K workspace switching
 * - window.HAOSTheme - Theme management API
 * 
 * @version 1.0.0
 * @author HAOS.fm
 */

(function() {
  'use strict';

  const COMPONENT_BASE_PATH = '/js/components';
  
  const components = [
    'haos-theme-manager.js',      // Load first for CSS variables
    'haos-navigation.js',
    'haos-workspace-switcher.js',
    'haos-knob.js',
    'haos-preset-manager.js'
  ];

  // Track loading state
  let loadedCount = 0;
  const totalComponents = components.length;
  
  function loadComponent(filename) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${COMPONENT_BASE_PATH}/${filename}`;
      script.async = false; // Maintain order
      
      script.onload = () => {
        loadedCount++;
        console.log(`[HAOS] Loaded ${filename} (${loadedCount}/${totalComponents})`);
        resolve();
      };
      
      script.onerror = () => {
        console.error(`[HAOS] Failed to load ${filename}`);
        reject(new Error(`Failed to load ${filename}`));
      };
      
      document.head.appendChild(script);
    });
  }

  async function loadAllComponents() {
    console.log('[HAOS] Loading component library...');
    
    for (const component of components) {
      try {
        await loadComponent(component);
      } catch (error) {
        console.error(`[HAOS] Error loading ${component}:`, error);
      }
    }
    
    console.log('[HAOS] All components loaded!');
    
    // Dispatch ready event
    document.dispatchEvent(new CustomEvent('haos-components-ready', {
      detail: {
        components: components.map(c => c.replace('.js', '')),
        timestamp: Date.now()
      }
    }));
  }

  // Load Font Awesome if not present
  function loadFontAwesome() {
    if (document.querySelector('link[href*="font-awesome"]')) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(link);
  }

  // Start loading when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadFontAwesome();
      loadAllComponents();
    });
  } else {
    loadFontAwesome();
    loadAllComponents();
  }

  // Export version info
  window.HAOSComponents = {
    version: '1.0.0',
    components: components.map(c => c.replace('.js', '')),
    isReady: () => loadedCount === totalComponents
  };

})();
