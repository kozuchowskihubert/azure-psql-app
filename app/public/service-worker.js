// =============================================================================
// Service Worker - Progressive Web App
// =============================================================================
// Handles offline caching, background sync, and push notifications
// Version 2.1.0
// =============================================================================

const CACHE_NAME = 'notes-app-v2.1.0';
const RUNTIME_CACHE = 'notes-app-runtime';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/excel.html',
  '/calendar.html',
  '/sso.html',
  '/features.html',
  '/excel.js',
  '/sso.js',
  '/manifest.json',
  // External CDN resources (cached with network-first strategy)
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
];

// Routes that should work offline
const OFFLINE_ROUTES = [
  '/',
  '/excel.html',
  '/calendar.html',
  '/features.html',
];

// =============================================================================
// Installation - Cache static assets
// =============================================================================
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing version', CACHE_NAME);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Skip waiting');
        return self.skipWaiting();
      }),
  );
});

// =============================================================================
// Activation - Clean up old caches
// =============================================================================
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating version', CACHE_NAME);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Claiming clients');
        return self.clients.claim();
      }),
  );
});

// =============================================================================
// Fetch - Network strategies
// =============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle app shell with cache-first strategy
  if (OFFLINE_ROUTES.includes(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Handle external resources with stale-while-revalidate
  if (!url.origin.includes(self.location.origin)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Default: cache-first for everything else
  event.respondWith(cacheFirst(request));
});

// =============================================================================
// Caching Strategies
// =============================================================================

/**
 * Cache First - For static assets that rarely change
 * 1. Check cache
 * 2. Return cached version if found
 * 3. Otherwise fetch from network and cache
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }

    throw error;
  }
}

/**
 * Network First - For API requests
 * 1. Try network first
 * 2. Cache the response
 * 3. Fall back to cache if network fails
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache');
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

/**
 * Stale While Revalidate - For external resources
 * 1. Return cached version immediately
 * 2. Update cache in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// =============================================================================
// Background Sync - For offline note creation
// =============================================================================
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);

  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }

  if (event.tag === 'sync-calendar') {
    event.waitUntil(syncCalendar());
  }
});

async function syncNotes() {
  try {
    // Get pending notes from IndexedDB
    const pendingNotes = await getPendingNotes();

    for (const note of pendingNotes) {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });

      if (response.ok) {
        await removePendingNote(note.id);
      }
    }

    console.log('[ServiceWorker] Notes synced successfully');
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
    throw error;
  }
}

async function syncCalendar() {
  try {
    // Get pending events from IndexedDB
    const pendingEvents = await getPendingEvents();

    for (const event of pendingEvents) {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      if (response.ok) {
        await removePendingEvent(event.id);
      }
    }

    console.log('[ServiceWorker] Calendar synced successfully');
  } catch (error) {
    console.error('[ServiceWorker] Calendar sync failed:', error);
    throw error;
  }
}

// =============================================================================
// Push Notifications
// =============================================================================
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id,
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notes App', options),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/'),
    );
  }
});

// =============================================================================
// Helper Functions
// =============================================================================

async function getPendingNotes() {
  // Placeholder - would use IndexedDB in production
  return [];
}

async function removePendingNote(id) {
  // Placeholder - would use IndexedDB in production
  return true;
}

async function getPendingEvents() {
  // Placeholder - would use IndexedDB in production
  return [];
}

async function removePendingEvent(id) {
  // Placeholder - would use IndexedDB in production
  return true;
}

// =============================================================================
// Message Handler - For client communication
// =============================================================================
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(event.data.urls)),
    );
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        )),
    );
  }
});

console.log('[ServiceWorker] Loaded successfully');
