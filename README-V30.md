# NataHidup V3.0.0 — Catatan Implementasi
### "Interaktif, Personal, dan Cerdas"

Status: **Siap deploy** · Bundle: `app.bundle.js` (263 KB / **81 KB gzip**) + `styles.css` (52 KB / 12 KB gzip) + `config.js` + `sw.js` + `ocr.worker.js` + `manifest.json`
Baseline: V2.1.1. Ditambah **1 library kecil**: `qrcode-generator` 1.4.4 (MIT, **7,3 KB gzip** — jauh di bawah batas 50 KB) untuk F-3.12.

---

## 1. Fitur (Epik 1–5)

| ID | Fitur | Implementasi |
|---|---|---|
| F-3.1 | Mata maskot mengikuti | `NH.EyeTracker` — pupil (highlight putih) di-overlay pada 4 maskot (capybara/butterfly/penguin/sprout; **cat sengaja tanpa pupil** karena matanya busur tertutup). Pointer global listener + rAF, `transition .09s`, clamp dalam bola mata. Toggle di Setelan; hormat `prefers-reduced-motion`. |
| F-3.2 | Maskot mengambang | `NH.FloatMascot.Widget` — fixed, drag via Pointer Events (`touch-action:none`), posisi disimpan (`nh_prefs.floatPos`), tap = QuickAdd sheet, haptic saat drop. Clamp tidak menutupi bottom-nav. Toggle di Setelan. |
| F-3.3 | Glassmorphism ekstrem | `.sheet` blur 20px (V2.1.1) + **semua `.card`** blur 20px saturate 1.3 dengan background `color-mix` 80% (V3). `.bottom-nav` memang sudah blur 18px. Semua di dalam `@supports backdrop-filter` → fallback solid otomatis. Background "bernapas" `#root:before` (V2.1.1) tetap. |
| F-3.4 | Wrapped sinematik 9:16 | `NH.Wrapped.Cinema` — overlay fixed 100dvh, slide vertikal `scroll-snap-type: y mandatory` + `scroll-snap-stop: always`, **auto-advance 5,2 dtk** (pause 9 dtk saat disentuh), progress bar segmen ala IG Stories (bisa diklik), picker bulan, toggle sembunyikan nominal, share teks. Flag off → kembali ke `NH.Wrapped.Modal` lama. |
| F-3.5 | Navigasi + haptic | `NH.Haptics.vibe(10)` tiap pindah tab + animasi slide **searah** (`page-fwd`/`page-back` mengikuti urutan tab). *Catatan deviasi di §3.* |
| F-3.6 | Tema per tier | `NH.Entitlement.applyTheme()` memasang `data-plan` di `<html>`; CSS override per tier: Sobat Miskin (abu minimalis), Mendang-Mending (neon cyan + glow), Si Paling Healing (pastel), Suhu Keuangan (hero holografik animasi), Sultan/Owner (hero emas animasi). Dipanggil saat login & saat memilih tier. |
| F-3.7 | Laman carousel premium | Sudah dari V2.1.1 (`TiersSheet`) + V3: strip preview gradien tema per tier, pilih tier langsung mengganti tema aplikasi. |
| F-3.8 | Confetti koin fisika | `NH.Confetti` — 14–28 partikel 🪙/✨ via Web Animations API (parabola naik→jatuh + rotasi + fade), spawn di posisi checkbox to-do (Home & Notes) hanya saat **menyelesaikan** (bukan uncheck). Klaim tantangan = burst 24 koin. Toggle di Setelan; hormat reduced-motion. |
| F-3.9 | Push jam 19.00 | Client: `NH.Push` (permission → subscribe VAPID → simpan ke `push_subscriptions`), toggle "Pengingat 19.00" di Setelan. SW: handler `push` + `notificationclick` (buka `?action=add-expense`). Server: draf `supabase/functions/nightly-push/index.ts` + pg_cron (19.00 WIB). **Tanpa VAPID/deploy function, otomatis fallback pengingat lokal** (toast/notifikasi lokal pesan lucu maskot saat app dibuka ≥ jam 19.00, max 1×/hari). |
| F-3.10 | Weekly challenge + skin | `NH.Challenges` — 4 tantangan rotasi per minggu ISO (7 hari tanpa kopi, catat 5 hari, total < Rp150rb, no big-buy belanja/hiburan ≥100rb), deterministik dari tanggal. Kartu progress di Home. Hadiah **skin eksklusif**: "Ikat Kepala Hemat" 🎽 & "Medali Konsisten" 🏅 (`unlock: Infinity` — tidak bisa dibuka lewat streak), masuk sistem aksesoris yang ada (chip di Setelan langsung kompatibel). |
| F-3.11 | Share story 9:16 | `NH.StoryShare` — canvas 1080×1920 (gradient tema berjalan via `getComputedStyle`, chip kategori berwarna, nominal besar, footer) → `navigator.share({files})` → fallback unduh PNG. Tombol **"📸 Share Story 9:16"** di detail transaksi. |
| F-3.12 | QR split bill | `NH.QR` (vendored qrcode-generator) — tombol **"🔳 QR"** di Split Bill: payload {total, judul, tanggal, jumlah orang, metode, pembulatan} → URL `?action=join-split&d=<base64url>` → QR PNG (bisa diunduh/share). Scanner (kamera apa pun) membuka app dengan total & jumlah orang **sudah terisi** + banner "Kamu bergabung ke patungan". Mode ini **tanpa backend** (payload di URL); migration V3 menambah policy agar peserta ber-akun juga bisa membaca bill dari DB. |

## 2. Bug Fixes (tabel PRD §4)

| ID | Status | Solusi (akar masalah) |
|---|---|---|
| BUG-001 (P0) | ✅ | Kredensial **dikeluarkan dari bundle** → `config.js` runtime (`window.__NH_CONFIG`), dimuat sebelum bundle; `NH.db` hanya membuat client bila URL+key ada; `checkSchema` melempar pesan jelas ("config.js belum dimuat") → boot-error UI. **Guard build**: build GAGAL bila pola anon key muncul lagi di bundle. + `supabase/rls_audit.sql` (4 query audit) & catatan rate-limiting dashboard di README. *Jujur: anon key tetap "publik" di config.js — itu desain Supabase; pertahanan sesungguhnya = RLS (audit disediakan). Pindah ke env var server-side tidak mungkin untuk PWA statis tanpa backend proxy.* |
| BUG-002 (P1) | ✅ | Akar masalah **ditemukan & dicabut**: V2.1 ternyata memasang efek auto-paste di TxnModal (`useEffect` → `clipboard.readText()` tanpa gesture, flag `FEATURES.autoPaste` default ON) — persis pola yang dilaporkan PRD (di iOS Safari memicu prompt "Allow Paste"/diblokir). Perbaikan V3.0.0: efek, flag, state `clip21`, chip kandidat, dan CSS `.paste-chip` **dihapus total**; diganti chip **"Tempel"** eksplisit di `AmountKeypad` (muncul di Quick-Add & TxnModal) — `readText()` HANYA dipanggil di dalam `onClick` (gesture sah, aman iOS). Sukses → nominal terisi + haptic; gagal/tidak ada angka → pola haptic error. Parser menerima format "Rp 25.000", "1.234.567", dsb. Regresi dikunci unit test (jumlah call-site readText, `autoPaste`/`paste-chip` harus lenyap dari bundle, semantik parser 4 kasus). |
| BUG-003 (P1) | ✅ | Deteksi iOS (UA + iPadOS `maxTouchPoints`) di `index.html` → banner statis "Share ⬆ → Add to Home Screen (via Safari)" tanpa auto-hide, dismiss persisten; `NH.Platform.installHint()` di Setelan memberikan instruksi spesifik iOS/Android. |
| BUG-004 (P2) | ✅ | Worker OCR kini **same-origin** `./ocr.worker.js` (CSP `worker-src 'self'` cukup); blob: hanya fallback; CDN Tesseract bisa dioverride via `config.js → OCR_CDN` (bisa self-host). Contoh CSP lengkap siap-pasang di `app/_headers`. Sengaja **tidak** memasang `<meta http-equiv="CSP">` agar tidak memutus domain yang belum terduga di hosting-mu — pasang `_headers` bila host mendukung. |
| BUG-005 (P1) | ✅ | `NH.utils.normDate`: tahun 2 digit memakai jendela +20 tahun — `yy > (tahunIni+20)%100 → 1900+yy`, selain itu `2000+yy`. Unit test: "5/7/99"→1999-07-05, "1/1/25"→2025-01-01, "31/12/47"→1947-12-31, 4 digit tak berubah. |
| BUG-006 (P1) | ✅ | `NH.SFX` ditulis ulang: satu `AudioContext` global, buffer didekode **sekali** per suara (cache), antrian callback saat decode berlangsung, `BufferSource` per-play (murah, GC normal) — tidak ada lagi `new Audio()` per pemutaran. Fallback: **satu** elemen `Audio` reusable per suara bila WebAudio tak ada. |
| BUG-007 (P2) | ✅ | Semua jalur penutup banner (`dismissBtn`, install sukses, appinstalled, auto-hide) lewat `hideBanner()` yang memanggil `clearTimeout(window.__nhBannerTimer)` + null. |

## 3. Deviasi yang dilaporkan (kebijakan "jangan tutupi bug")

1. **F-3.5 scroll-snap per halaman TIDAK diimplementasikan penuh.** Akar masalah: arsitektur app memakai *body-scroll* + render halaman kondisional; `NH.PullRefresh` dan swipe-tabs terikat ke scroll window. Mengubah ke scroller horizontal snap berarti (a) merender 4 halaman berat sekaligus, (b) memutus pull-to-refresh. Solusi yang dipasang: haptic saat pindah tab + animasi slide searah gestur (swipe kiri/kanan sudah ada sejak V2.1). Bila tetap mau snap penuh, itu refactor terencana tersendiri (V3.1).
2. **F-3.9 push remote butuh 2 langkah deploy darimu** (generate VAPID keys, deploy Edge Function + pg_cron) — tanpa itu aplikasi tetap jalan dengan pengingat lokal (graceful, sesuai constraint PRD).
3. **Koreksi laporan sebelumnya (BUG-002)**: audit awal saya menyimpulkan "auto-paste tidak ada di codebase" — itu **keliru**, karena audit hanya memeriksa baseline V2.0 (`uploads/`) dan melewatkan efek auto-paste yang ditambahkan build V2.1 sendiri di TxnModal. Bug-nya nyata; kini sudah dicabut dari akar (lihat tabel §2) dan dikunci regression test.
4. Maskot **cat** tidak dapat pupil mengikuti (matanya digambar sebagai busur tersenyum) — memilih tidak menggambar ulang seni aslinya.

## 4. Deploy

1. Salin seluruh isi `app/` ke hosting statis (struktur relatif harus utuh: `config.js` & `ocr.worker.js` WAJIB ikut).
2. Supabase SQL Editor: jalankan `supabase/migrations/20261101_v30_features.sql` (setelah migration V2.1). Lalu jalankan `supabase/rls_audit.sql` — pastikan query #1 mengembalikan **0 baris**.
3. (Opsional, untuk push remote) `npx web-push generate-vapid-keys` → isi `VAPID_PUBLIC_KEY` di `config.js` → `supabase functions deploy nightly-push` + `supabase secrets set VAPID_PUBLIC_KEY=… VAPID_PRIVATE_KEY=…` → aktifkan pg_cron (SQL ada di file migration).
4. (Opsional) pasang `_headers` bila host mendukung (Netlify/Cloudflare Pages).
5. Service worker naik ke `natahidup-v3.0.0` → client lama refresh otomatis (network-first).

## 5. Verifikasi

- **Unit test 89/89** (Y2K, QR roundtrip unicode, challenges, story spec, push graceful, SFX pool, entitle­ment/owner, dst).
- **Smoke jsdom: 27/27 modul**, AuthScreen render, **tanpa error runtime**, versi 3.0.0.
- Guard otomatis di `build.sh`: struktur nav (regresi V2.1.0), eye/float/cinema/join-split/challenges/Y2K terpasang, **anon key tidak boleh ada di bundle**.
- Toggle Setelan baru: Mata Maskot Mengikuti · Maskot Mengambang · Confetti Koin · Pengingat 19.00 (semua default ON kecuali push).
