const CACHE_NAME = 'rice-handbook-2026-mobile-v5-assets-refresh';
const APP_SHELL = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/pwa.js',
  '/manifest.webmanifest',
  '/assets/rice.webp',
  '/assets/crop-phenology.webp',
  '/assets/lindungi-diri.webp',
  '/assets/stewardship.webp',
  '/assets/penggerek-batang.webp',
  '/assets/pelipat-daun.webp',
  '/assets/penyakit.webp',
  '/assets/gulma.webp',
  '/assets/bayer-logo-white.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map(async path => {
      try {
        const response = await fetch(path, { cache: 'reload' });
        if (response.ok) await cache.put(path, response);
      } catch (_) {
        // Keep installation resilient if an optional shell asset is unavailable.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML: network-first so deployed pages are preferred, cached page is offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: 'no-store' });
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put('/index.html', response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  const isAppCode = /\.(css|js)$/i.test(url.pathname);
  if (isAppCode) {
    // CSS/JS: network-first to pick up new deployments, cached fallback when offline.
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: 'no-store' });
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match(request)) || Response.error();
      }
    })());
    return;
  }

  // Images and other static files: cache-first, then store successful network responses.
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
