// =============================================================================
// PWA Installer & Mobile App Handler
// =============================================================================
// Handles service worker registration, install prompts, and mobile features
// =============================================================================

let deferredPrompt;
let swRegistration;

// =============================================================================
// Service Worker Registration
// =============================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registered:', swRegistration.scope);

      // Check for updates
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration.installing;
        console.log('🔄 New Service Worker installing...');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateNotification();
          }
        });
      });

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  });
}

// =============================================================================
// Install Prompt Handler
// =============================================================================
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('📱 Install prompt available');
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

window.addEventListener('appinstalled', () => {
  console.log('✅ PWA installed successfully');
  deferredPrompt = null;
  hideInstallButton();
  
  // Track installation
  if (typeof gtag !== 'undefined') {
    gtag('event', 'app_install', {
      event_category: 'PWA',
      event_label: 'Installed'
    });
  }
  
  showToast('App installed! You can now use it offline 🎉', 'success');
});

// =============================================================================
// Install UI Functions
// =============================================================================
function showInstallButton() {
  // Create install banner if it doesn't exist
  if (document.getElementById('install-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'install-banner';
  banner.className = 'fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-2xl z-50 transform transition-transform duration-300';
  banner.style.transform = 'translateY(100%)';
  
  banner.innerHTML = `
    <div class="container mx-auto flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-3">
        <i class="fas fa-mobile-alt text-2xl"></i>
        <div>
          <p class="font-bold">Install Notes App</p>
          <p class="text-sm opacity-90">Add to home screen for quick access & offline use</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="install-app-btn" class="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
          <i class="fas fa-download mr-2"></i>Install
        </button>
        <button id="dismiss-install-btn" class="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  // Animate in
  setTimeout(() => {
    banner.style.transform = 'translateY(0)';
  }, 100);

  // Event listeners
  document.getElementById('install-app-btn').addEventListener('click', installApp);
  document.getElementById('dismiss-install-btn').addEventListener('click', () => {
    hideInstallButton();
    localStorage.setItem('install-dismissed', Date.now());
  });

  // Auto-show only if not dismissed recently (within 7 days)
  const dismissed = localStorage.getItem('install-dismissed');
  if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
    hideInstallButton();
  }
}

function hideInstallButton() {
  const banner = document.getElementById('install-banner');
  if (banner) {
    banner.style.transform = 'translateY(100%)';
    setTimeout(() => banner.remove(), 300);
  }
}

async function installApp() {
  if (!deferredPrompt) {
    showIOSInstallInstructions();
    return;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`User response to install prompt: ${outcome}`);
  
  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
  } else {
    console.log('User dismissed the install prompt');
  }
  
  deferredPrompt = null;
  hideInstallButton();
}

// =============================================================================
// iOS Install Instructions
// =============================================================================
function showIOSInstallInstructions() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.navigator.standalone === true;

  if (isIOS && !isStandalone) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-md animate-fadeInUp">
        <div class="text-center mb-4">
          <i class="fas fa-mobile-alt text-blue-600 text-4xl mb-2"></i>
          <h3 class="text-xl font-bold text-gray-800">Install on iOS</h3>
        </div>
        <ol class="text-left space-y-3 text-gray-700 mb-6">
          <li class="flex items-start">
            <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
            <span>Tap the <strong>Share</strong> button <i class="fas fa-share text-blue-600"></i> at the bottom of Safari</span>
          </li>
          <li class="flex items-start">
            <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
            <span>Scroll down and tap <strong>"Add to Home Screen"</strong> <i class="fas fa-plus-square text-blue-600"></i></span>
          </li>
          <li class="flex items-start">
            <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
            <span>Tap <strong>"Add"</strong> in the top right corner</span>
          </li>
        </ol>
        <button onclick="this.closest('.fixed').remove()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Got it!
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    showToast('This app is already installed or install is not available', 'info');
  }
}

// =============================================================================
// Update Notification
// =============================================================================
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-white rounded-lg shadow-2xl p-4 max-w-sm z-50 border-l-4 border-green-500 animate-fadeInUp';
  notification.innerHTML = `
    <div class="flex items-start gap-3">
      <i class="fas fa-sync-alt text-green-600 text-xl mt-1"></i>
      <div class="flex-1">
        <p class="font-bold text-gray-800">Update Available</p>
        <p class="text-sm text-gray-600 mt-1">A new version is ready to install</p>
        <div class="flex gap-2 mt-3">
          <button id="update-now-btn" class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition">
            Update Now
          </button>
          <button id="update-later-btn" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition">
            Later
          </button>
        </div>
      </div>
      <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  document.body.appendChild(notification);

  document.getElementById('update-now-btn').addEventListener('click', () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  });

  document.getElementById('update-later-btn').addEventListener('click', () => {
    notification.remove();
  });
}

// =============================================================================
// Mobile-Specific Features
// =============================================================================

// Detect if running as installed PWA
function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://');
}

// Add PWA class to body
if (isPWA()) {
  document.documentElement.classList.add('pwa-installed');
  console.log('📱 Running as installed PWA');
}

// Prevent pull-to-refresh on mobile (interferes with app)
document.body.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1 && window.scrollY === 0) {
    // Allow pull-to-refresh
  }
}, { passive: false });

// Handle viewport height on mobile (fixes iOS Safari toolbar issue)
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);

// =============================================================================
// Offline/Online Detection
// =============================================================================
window.addEventListener('online', () => {
  showToast('✅ Back online! Syncing data...', 'success');
  
  // Trigger background sync
  if ('serviceWorker' in navigator && 'sync' in swRegistration) {
    swRegistration.sync.register('sync-notes');
    swRegistration.sync.register('sync-calendar');
  }
});

window.addEventListener('offline', () => {
  showToast('📡 You are offline. Changes will sync when online.', 'warning');
});

// Display current status on load
window.addEventListener('load', () => {
  if (!navigator.onLine) {
    showToast('📡 Offline mode - Changes saved locally', 'info');
  }
});

// =============================================================================
// Share Target Handler (for sharing files to the app)
// =============================================================================
if ('serviceWorker' in navigator && 'share' in navigator) {
  // Check if launched from share target
  const url = new URL(window.location);
  if (url.searchParams.has('title') || url.searchParams.has('text')) {
    handleSharedContent(url);
  }
}

function handleSharedContent(url) {
  const title = url.searchParams.get('title') || '';
  const text = url.searchParams.get('text') || '';
  const sharedUrl = url.searchParams.get('url') || '';

  console.log('Shared content:', { title, text, sharedUrl });

  // Auto-create note with shared content
  if (title || text) {
    setTimeout(() => {
      // Trigger note creation modal with pre-filled data
      const event = new CustomEvent('create-note', {
        detail: { title, content: text + (sharedUrl ? '\n\n' + sharedUrl : '') }
      });
      window.dispatchEvent(event);
    }, 500);
  }
}

// =============================================================================
// Utility Functions
// =============================================================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg text-white z-50 transition-all duration-300`;
  
  switch (type) {
    case 'success':
      toast.classList.add('bg-green-600');
      break;
    case 'warning':
      toast.classList.add('bg-yellow-600');
      break;
    case 'error':
      toast.classList.add('bg-red-600');
      break;
    default:
      toast.classList.add('bg-blue-600');
  }
  
  toast.textContent = message;
  toast.style.opacity = '0';
  document.body.appendChild(toast);
  
  setTimeout(() => toast.style.opacity = '1', 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Export utilities
window.PWAUtils = {
  isPWA,
  installApp,
  showInstallButton,
  hideInstallButton
};

console.log('📱 PWA installer loaded successfully');
