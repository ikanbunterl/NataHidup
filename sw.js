// NataHidup v7 — Service Worker (Online Mode / Supabase)
// Strategi: aset same-origin di-cache (app shell), SEMUA request API / non-GET diteruskan ke jaringan.
const CACHE_NAME = 'natahidup-v7';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // Hanya intercept GET same-origin (aset UI). Request API & non-GET langsung ke jaringan.
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Navigasi: network-first supaya versi terbaru selalu diambil, fallback ke cache saat offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put('./index.html', copy));
          return resp;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Aset statis same-origin: cache-first dengan penulisan ulang cache
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(resp => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
        }
        return resp;
      });
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) return caches.delete(cacheName);
        })
      )
    ).then(() => self.clients.claim())
  );
});