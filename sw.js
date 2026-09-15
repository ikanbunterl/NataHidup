/* ============================================================
   NataHidup V2 — Service Worker
   Strategi:
   - Aset aplikasi (same-origin): pre-cache saat install,
     cache-first + revalidasi di latar belakang.
   - CDN (React, Babel, Supabase, Tesseract, font):
     stale-while-revalidate → app tetap bisa dibuka offline
     setelah sekali dimuat.
   - Request API (Supabase REST/Auth) & non-GET: selalu jaringan.
   ============================================================ */
const CACHE_NAME = 'natahidup-v2.0.0';
const CDN_CACHE = 'natahidup-v2-cdn';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/themes.css',
  './css/base.css',
  './css/components.css',
  './js/config.js',
  './js/utils.js',
  './js/theme.js',
  './js/db.js',
  './js/ocr.js',
  './js/icons.jsx',
  './js/mascots.jsx',
  './js/ui.jsx',
  './js/modals/quickadd.jsx',
  './js/modals/txn.jsx',
  './js/modals/scan.jsx',
  './js/modals/note.jsx',
  './js/modals/wallet.jsx',
  './js/modals/budget.jsx',
  './js/modals/debt.jsx',
  './js/modals/txndetail.jsx',
  './js/modals/todobudget.jsx',
  './js/screens/auth.jsx',
  './js/screens/home.jsx',
  './js/screens/finance.jsx',
  './js/screens/notes.jsx',
  './js/screens/settings.jsx',
  './js/app.jsx',
];

const CDN_HOSTS = [
  'unpkg.com',
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];
const isApiRequest = (url) => url.hostname.endsWith('.supabase.co');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch((err) => console.warn('Pre-cache sebagian gagal:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const whitelist = [CACHE_NAME, CDN_CACHE];
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.map((n) => (whitelist.includes(n) ? null : caches.delete(n)))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // mutasi data selalu ke jaringan

  const url = new URL(request.url);

  // Request API Supabase: jaringan murni (data harus segar)
  if (isApiRequest(url)) return;

  // Navigasi: network-first, fallback cache saat offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put('./index.html', copy));
          return resp;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // CDN pihak ketiga: stale-while-revalidate (mendukung mode offline)
  if (url.origin !== self.location.origin) {
    if (!CDN_HOSTS.includes(url.hostname)) return;
    event.respondWith(
      caches.open(CDN_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fetched = fetch(request)
            .then((resp) => {
              if (resp && (resp.ok || resp.type === 'opaque')) cache.put(request, resp.clone());
              return resp;
            })
            .catch(() => cached);
          return cached || fetched;
        })
      )
    );
    return;
  }

  // Aset same-origin: cache-first + revalidasi latar belakang
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((resp) => {
          if (resp && resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          }
          return resp;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
