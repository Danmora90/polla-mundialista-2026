const CACHE_NAME = 'polla-mundialista-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Only intercept HTTP/HTTPS requests (ignores browser extensions and chrome-extension://)
  if (!e.request.url.startsWith('http')) return;

  // Skip intercepting hot-module-reload resources during development
  if (e.request.url.includes('@vite/client') || e.request.url.includes('@react-refresh') || e.request.url.includes('node_modules')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
