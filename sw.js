/* ============================================================
   NataHidup V3.0 — Service Worker (MODE BUNDLE / deploy)
   - CACHE_NAME dinaikkan ke natahidup-v3.0.0
   - config.js + ocr.worker.js ikut di-precache (BUG-001/004)
   - F-3.9: handler push + notificationclick (Web Push 19.00)
   - Supabase API tetap network-only (data harus segar)
   - Navigasi network-first fallback index.html (query param
     shortcut PWA tetap diteruskan ke network)
   - URL blob: (Web Worker OCR) tidak pernah di-cache
   ============================================================ */
const CACHE_NAME = 'natahidup-v3.0.0';
const CDN_CACHE = 'natahidup-v2-cdn';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './config.js',
  './ocr.worker.js',
  './app.bundle.js',
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

  // Worker blob URL & data URI: jangan disentuh SW (F22)
  if (url.protocol === 'blob:' || url.protocol === 'data:') return;

  // Request API Supabase: jaringan murni (data harus segar)
  if (isApiRequest(url)) return;

  // Navigasi (termasuk ?action=... shortcut): network-first, fallback cache
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

/* ===== F-3.9 — Web Push (payload dikirim nightly-push Edge Function) ===== */
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: 'NataHidup', body: (event.data && event.data.text()) || 'Catat pengeluaranmu 🌙' }; }
  const title = data.title || 'NataHidup 🌙';
  const body = data.body || 'Udah jam 7 malam — pengeluaran hari ini udah dicatat belum?';
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: data.icon || './icons/icon-192x192.png',
    badge: './icons/icon-96x96.png',
    tag: 'nh-7pm',
    data: { url: data.url || './?action=add-expense' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './?action=add-expense';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) {
      if ('focus' in c) { c.navigate(url); return c.focus(); }
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
