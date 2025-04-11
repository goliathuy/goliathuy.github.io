/**
 * Service Worker for Exercise Timer
 * Handles caching of assets for offline functionality
 */

// Cache name - update version when assets change significantly
const CACHE_NAME = 'exercise-timer-v1';

// Assets to cache for offline use
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './themes/css/classic-layout.css',
  './themes/css/card-layout.css',
  './themes/js/layout-manager.js'
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
  // Try to match the request with cached assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If found in cache, return the cached version
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        
        // If not in cache, fetch from network
        console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request)
          .catch(error => {
            console.error('Service Worker: Fetch failed:', error);
            // Could return a custom offline page here
          });
      })
  );
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
