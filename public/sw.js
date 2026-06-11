// PharmaCalc Pro — Service Worker
// Robust offline support for all calculators, history, patient context, and PDF export.
// All math is pure client-side JS — once assets are cached the entire app works without network.

const CACHE_NAME = 'pharmacalc-pro-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  '/icons/pharmacalc-icon.svg',
];

// During install: precache the app shell + critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(STATIC_ASSETS);
      } catch (e) {
        // Non-fatal in some dev/build scenarios
        console.warn('[SW] Precache partial failure (non-fatal):', e);
      }
      // Activate immediately so the new SW takes control on first load
      await self.skipWaiting();
    })()
  );
});

// Take control of all clients as soon as activated
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Fetch strategy:
// - For navigation (HTML shell): network-first with cache fallback (so updates propagate, but offline works)
// - For JS/CSS/assets (hashed): cache-first (immutable in prod build)
// - For everything else: cache-first then network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Special: never cache the SW itself or manifest in a way that blocks updates
  if (url.pathname === '/sw.js' || url.pathname === '/manifest.json') {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Navigation requests (page loads / route changes that hit server)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          // Update the shell in cache for future offline
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, fresh.clone());
          return fresh;
        } catch (err) {
          // Offline: serve cached shell or root
          const cached = await caches.match(request) || await caches.match('/');
          if (cached) return cached;
          // Last resort basic offline page (rare)
          return new Response(
            '<!doctype html><title>PharmaCalc Pro — Offline</title><h1>Offline</h1><p>PharmaCalc Pro is ready. All calculators work without internet. Reload when back online for updates.</p>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      })()
    );
    return;
  }

  // Static assets (JS chunks, CSS, fonts, icons, etc.) — Cache First, then Network, update cache
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const respClone = response.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, respClone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default: try cache, fall back to network (good for API-like or other GETs, though none critical here)
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).catch(() => cached))
  );
});

// Optional: allow the page to trigger immediate update skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
