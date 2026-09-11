const CACHE_NAME = 'natahidup-v2'; // ⬆️ naikkan versi agar cache lama terhapus

const urlsToCache = [
  // === Aset Lokal ===
  '/',
  '/index.html',
  '/manifest.json',
  '/icons.js',       // ⬅️ file baru (Saran: Evakuasi SVG)
  '/data.js',        // ⬅️ file baru (Saran: Isolasi Data Default)

  // === CDN: React & ReactDOM (Saran 3: Caching CDN) ===
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',

  // === CDN: Babel (untuk JSX transpile di browser) ===
  'https://unpkg.com/@babel/standalone/babel.min.js',

  // === CDN: Tailwind CSS ===
  'https://cdn.tailwindcss.com',

  // === CDN: QR Code (Saran 2: P2P Sync) ===
  'https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js',

  // === Google Fonts (Saran 3: Caching Font) ===
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2'
];

// ─── Install ───
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell + CDN assets...');
        // Gunakan addAll dengan fallback agar satu URL gagal tidak membatalkan semua
        return Promise.allSettled(
          urlsToCache.map(url =>
            cache.add(url).catch(err =>
              console.warn(`[SW] Gagal cache: ${url}`, err)
            )
          )
        );
      })
  );
  self.skipWaiting();
});

// ─── Fetch: Cache-First untuk aset, Network-First untuk API ───
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Untuk CDN & aset statis → Cache-First
  if (
    url.origin === location.origin ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('cdn.tailwindcss.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          // Simpan ke cache setelah berhasil fetch
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Fallback default
  event.respondWith(
    caches.match(request).then(response => response || fetch(request))
  );
});

// ─── Activate: Hapus cache lama ───
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => !cacheWhitelist.includes(name))
          .map(name => {
            console.log(`[SW] Menghapus cache lama: ${name}`);
            return caches.delete(name);
          })
      )
    )
  );
  self.clients.claim();
});