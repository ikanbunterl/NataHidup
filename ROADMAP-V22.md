# NataHidup — Roadmap V2.2+ (27 Ide dari Owner)

Status: **V2.1.1** (31 Okt 2026). Ide yang sudah diimplementasikan ditandai ✅.
Kategori effort: 🟢 ringan (< 1 hari) · 🟡 sedang (1–3 hari) · 🔴 berat (> 3 hari / butuh backend baru).

---

## A. Immersive UI (ide 1–7)

| # | Ide | Effort | Catatan Teknis |
|---|-----|--------|----------------|
| 1 | Maskot 3D, mata mengikuti (Spline/Three.js) | 🔴 | **Bentrok constraint PRD**: Three.js ≈ 150 KB gzip (batas 50 KB), Spline butuh runtime + hosting aset. **Alternatif disarankan**: pupil 2D yang mengikuti sentuh/kursor (murni CSS+JS, < 2 KB) — efeknya 80% mirip, beratnya 0%. |
| 2 | Glassmorphism ekstrem (blur 20px di surface) | ✅ 🟢 | **Rilis di V2.1.1** untuk `.sheet` (backdrop-filter blur(20px) saturate(1.35) + background semi-transparan). Bottom-nav memang sudah blur(18px) dari V2.0. Blur di semua `.card` TIDAK disarankan: puluhan layer backdrop-filter = scroll lag di HP mid-range. |
| 3 | Scroll-snap antar-tab + haptic | 🟡 | Carousel tier sudah pakai scroll-snap (✅ V2.1.1). Untuk swipe antar halaman: swipe-tabs sudah ada; tinggal tambah `NH.Haptics.vibe(10)` di handler `ve()` saat pindah tab. Bagian snap penuh per-halaman = refactor `.page` → scroll container, risiko regresi sedang. |
| 4 | Wrapped ala TikTok/Reels (full-screen 9:16, swipe vertikal) | 🟡 | `NH.Wrapped` sudah punya sistem slide. Ubah container jadi `100dvh` + `scroll-snap-type: y mandatory` + progress bar ala Stories + auto-advance 4 dtk/slide. Data & copy sudah jadi. |
| 5 | Background "bernapas" (radial-gradient animasi) | ✅ 🟢 | **Rilis di V2.1.1**: `#root:before` (yang sudah punya radial-gradient) kini dianimasikan `nh-breathe` 9 detik (opacity + scale halus). Otomatis mati di `prefers-reduced-motion`. |
| 6 | Confetti koin fisika saat todo selesai | 🟢 | Partikel DOM/canvas ringan tanpa lib (±3 KB): 12–16 koin (emoji 🪙/span) dengan gravity + rotasi, spawn di posisi checkbox. Hook ke `Ze()` yang sudah memainkan SFX "pop" + haptic success. |
| 7 | Soundpack kustom | 🟡 | Engine `NH.SFX` sudah ada (3 WAV base64). Tambah 2–3 pack (mis. "Retro 8-bit", "Koplo", "ASMR") + picker di Setelan. Ukuran harus dijaga: WAV pendek 8-bit mono, ≤ 15 KB/sound. |

## B. Langganan 5 Tier (ide 8–12) — ✅ rilis V2.1.1

| # | Ide | Status |
|---|-----|--------|
| 8 | Laman carousel 5 tier | ✅ `NH.Entitlement.TiersSheet` — carousel scroll-snap, dibuka dari Setelan → kartu "✦ NataHidup+" |
| 9 | Tier 1 "Sobat Miskin" (abu, minimalis) | ✅ |
| 10 | Tier 2 "Mendang-Mending" (neon border) | ✅ `.tier-neon` cyan glow |
| 11 | Tier 3 "Si Paling Healing" (pastel gradient) | ✅ `.tier-pastel` |
| 12 | Tier 4 "Suhu Keuangan" (holographic) + Tier 5 "Sultan Mode" (gold glitter interaktif) | ✅ `.tier-holo` (animated gradient) + `.tier-sultan` (glitter partikel animasi) |

Sudah termasuk: label **"Gratis (Demo) · Berakhir Kuartal 1 2027"** di semua tier + **countdown** "⏳ X hari lagi" (update tiap menit, target 31 Maret 2027), banner 👑 **Owner** untuk `irkhamdaffa74@gmail.com`.

**Langkah lanjutan (belum, masuk V2.5):** simpan plan per-user ke Supabase (tabel `subscriptions` sudah ada di migration V2.1 — tinggal dipakai), gating fitur nyata per tier, dan sinkron antar-perangkat (sekarang plan demo masih di localStorage).

## C. Kehadiran di Luar Web (ide 13–16)

| # | Ide | Effort | Catatan Teknis |
|---|-----|--------|----------------|
| 13 | Document PiP widget (catatan mengambang di atas aplikasi lain) | 🔴 | Document Picture-in-Picture API baru didukung Chrome desktop/Android. Perlu fallback + render React kedua ke window PiP. Nilai guna tinggi untuk "catat cepat saat nonton/belanja". |
| 14 | Web Push jam 7 malam (pesan lucu maskot) | 🟡 | Butuh: VAPID keys + `push`/`notificationclick` handler di sw.js + **cron** (Supabase Edge Function + pg_cron) karena tidak ada server sendiri. Copy lucu bisa di-generate dari template `NH.mascotSpeech`. Tanpa Supabase function, alternatif: notifikasi lokal saat app dibuka (kurang "nendang"). |
| 15 | App Badging API (titik merah di ikon) | 🟢 | `navigator.setAppBadge(n)` — 1 baris: n = jumlah pengingat jatuh tempo + budget jebol. Didukung Chrome/Edge/Samsung Android; auto no-op di iOS Safari. |
| 16 | Widget maskot mengambang (draggable) | 🟢–🟡 | PWA **tidak bisa** membuat widget OS-level (Android widget butuh native/TWA). Yang bisa: maskot mengambang *di dalam app* — draggable, snap ke tepi, tap = buka quick-add / speech bubble tips. |

## D. Engagement & Sosial (ide 17–27)

| # | Ide | Effort | Catatan Teknis |
|---|-----|--------|----------------|
| 17 | Toggle "Girl Math" / "Boy Math" | 🟢 | Murni copy + mode hitung di Jajan Check: Girl Math = "kalau diskon 30% artinya GRATIS (hematnya bisa buat jajan lagi)"; Boy Math = "1 gadget = 60 hari kopi". Toggle di Setelan, default off. |
| 18 | Roast bertenaga LLM | 🔴 | Butuh API key + proxy (Supabase Edge Function — key JANGAN di bundle) + biaya per panggilan + filter konten (guardrail PRD: no kasar/body-shaming, max 1×/hari). Roast rules-based sekarang = fallback gratis & aman. |
| 19 | QR Code split bill | 🟡 | Generate QR lokal (canvas, tanpa lib besar ≈ 4 KB encoder) → peserta scan → join ke `split_bills`/`split_participants` (tabel sudah ada di migration). Butuh flow "join bill" publik tanpa login = keputusan RLS tersendiri. |
| 20 | Share receipt ala IG Story (9:16) | 🟢–🟡 | Render kartu transaksi ke canvas 1080×1920 (font + gradient hero) → `navigator.share({files})`. Engine share sudah ada (`NH.Share`), tinggal output gambar. |
| 21 | Tag guilt-trip vs self-reward → mood maskot | 🟢 | Tag per transaksi; maskot sedih 😔 saat guilt-trip numpuk, bangga 😌 saat self-reward terencana. State maskot sudah modular (`NH.Mascot`). |
| 22 | Leaderboard nasional anonim | 🔴 | Agregasi WAJIB via Edge Function (jangan pernah select data user lain dari client — RLS sekarang per-user). Hash ID + opt-in eksplisit + peringkat "hemat mingguan". Isu privasi = harus hati-hati. |
| 23 | Swipe wishlist ala Tinder | 🟢 | Wishlist sudah ada; tambah gesture swipe kiri (buang) / kanan (gaskeun) + animasi kartu. Review berkala mingguan = cron toast. |
| 24 | Toggle Bahasa Gaul ("Gas"/"Buang"/"Cuan Tersisa") | 🟢 | Kamus label i18n ringan: mode "Santai" vs "Gaul". Menyentuh banyak string → kerjakan sekali jalan dengan tabel label terpusat. |
| 25 | Weekly challenge + skin eksklusif | 🟡 | Engine challenge (mis. "7 hari tanpa kopi sachet") + reward skin maskot. Sistem unlock aksesoris streak sudah ada — tinggal diperluas + aset skin baru. |
| 26 | Mini-player lofi | 🟡 | UI player mini = ringan; **aset audio = berat** (lofi loop 1–3 MB/lagu → bundle membengkak; harus di-host terpisah/streaming) + **lisensi musik** harus jelas. Alternatif: generate ambient sederhana via WebAudio (tanpa file). |
| 27 | Animasi undo "terbakar" | 🟢 | Saat timeout undo-bar habis: kartu undo terbakar (CSS flame + particle emoji 🔥) sebelum hilang. Murni CSS/keyframes. |

---

## Usulan Pengelompokan Rilis

| Rilis | Tema | Isi |
|-------|------|-----|
| **V2.2 "Delight Pack"** | Semua 🟢, murni client-side, risiko rendah | #6 confetti koin, #15 app badge, #17 girl/boy math, #20 IG-story receipt, #21 mood maskot, #23 swipe wishlist, #24 bahasa gaul, #27 undo terbakar, + haptic di swipe tab (#3 parsial) |
| **V2.3 "Kehadiran"** | Butuh eksperimen API / Edge Function | #14 web push 7 malam, #16 maskot mengambang draggable, #13 Document PiP |
| **V2.4 "Sosial"** | Backend + privasi | #19 QR split bill, #22 leaderboard anonim, #25 weekly challenge + skin |
| **V2.5 "Premium"** | Monetisasi beneran | Plan per-user ke Supabase + gating fitur per tier, #7 soundpack, #4 Wrapped full-screen, #18 roast LLM, #26 lofi, #1 maskot 3D (atau versi 2D ringan) |

> Catatan constraint PRD yang tetap berlaku: single bundle, Supabase-only, tanpa library baru > 50 KB gzip, semua fitur baru wajib bisa dimatikan dari Setelan, dan gagal gracefully kalau tabel/migration belum ada.
