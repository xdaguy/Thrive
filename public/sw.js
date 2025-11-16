// Thrive Service Worker
// Version 0.2.1 - Offline-First with Query Parameter Support

const CACHE_NAME = 'thrive-v2.1';
const RUNTIME_CACHE = 'thrive-runtime-v2.1';

// App routes that should work offline (local-first)
const APP_ROUTES = [
  '/dashboard',
  '/finance',
  '/tasks',
  '/health',
  '/routines',
  '/settings',
  '/more',
  '/add',
  '/start',
  '/onboarding'
];

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  ...APP_ROUTES,
  '/manifest.json',
  '/icon.svg',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Cache-first for app routes (offline-first)
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);
  // Strip query parameters for route matching
  const pathname = url.pathname;
  const isAppRoute = APP_ROUTES.some(route => pathname.startsWith(route));
  const isLandingPage = pathname === '/';

  // For navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        // For app routes: Cache-first (offline-first)
        if (isAppRoute) {
          // Create cache key without query parameters for better matching
          const cacheUrl = new URL(event.request.url);
          cacheUrl.search = ''; // Remove query parameters
          const cacheRequest = new Request(cacheUrl);
          
          const cachedResponse = await caches.match(cacheRequest);
          if (cachedResponse) {
            // Update cache in background (with query params for proper route)
            fetch(event.request).then((response) => {
              if (response.ok) {
                caches.open(RUNTIME_CACHE).then((cache) => {
                  // Cache without query params for consistent matching
                  cache.put(cacheRequest, response.clone());
                });
              }
            }).catch(() => {
              // Silently fail - we're offline but cache works
            });
            return cachedResponse;
          }
          
          // If not in cache, try network
          try {
            const response = await fetch(event.request);
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                // Cache without query params for consistent matching
                cache.put(cacheRequest, responseClone);
              });
            }
            return response;
          } catch (error) {
            // Offline and not cached - return dashboard as fallback
            const dashboardCache = await caches.match('/dashboard');
            return dashboardCache || caches.match('/');
          }
        }
        
        // For landing page: Network-first (for SEO/fresh content)
        if (isLandingPage) {
          try {
            const response = await fetch(event.request);
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          } catch (error) {
            const cachedResponse = await caches.match(event.request);
            return cachedResponse || new Response('Offline', { status: 503 });
          }
        }

        // Default: try cache first
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      })()
    );
    return;
  }

  // For other requests (assets, API calls): Cache-first
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const response = await fetch(event.request);
        // Cache successful GET requests
        if (response.ok && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      } catch (error) {
        // Return offline response for failed requests
        return new Response('Offline', { 
          status: 503,
          statusText: 'Service Unavailable'
        });
      }
    })()
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
