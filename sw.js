/**
 * Service Worker for Kegel Timer
 * Handles caching of assets for offline functionality
 */

// Cache name - update version when assets change significantly
const CACHE_NAME = 'kegel-timer-v2';

// Assets to cache for offline use
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './kegel-timer.html',
  './styles.css',
  './kegel-timer.css',
  './script.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

/**
 * Install event - cache all key assets when service worker is installed
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  // Cache all assets defined in the list
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching assets...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('Service Worker: Assets cached successfully');
      })
  );
});

/**
 * Fetch event - respond with cached assets when available
 */
self.addEventListener('fetch', (event) => {
  // Network-first for HTML documents, cache-first for other assets
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Optionally update cache with fresh HTML
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request))
    );
  }
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  // Delete old cache versions
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any cache that doesn't match current version
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker: Activated successfully');
    })
  );
});
