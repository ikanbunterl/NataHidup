# NataHidup V2.1 — Catatan Implementasi
### "Gen-Z Money, Delight & Micro-Interaction Update"

Status: **Siap deploy** · Bundle: `app.bundle.js` (single file) + `styles.css` + `sw.js` + `manifest.json` + `icons/`
Baseline: kode V2.0 yang dilampirkan (bukan changelog lama). Semua 25 fitur PRD diimplementasikan di lapisan `NH.*` yang sudah ada, tanpa framework baru, tanpa server tambahan.

---

## 1. Peta Fitur → Kode

| ID | Fitur | Implementasi |
|---|---|---|
| F01 | Split Bill | `NH.SplitBill` (calc/personAmounts/shareText/Modal). Tombol **"Bagi Tagihan"** di `TxnDetailModal` (hanya expense). Metode Rata/Custom, pembulatan 100/500/1000, nama peserta opsional, sisa pembulatan, share via Web Share → fallback WhatsApp (`wa.me`) → copy. "Simpan sebagai catatan" & simpan ke `split_bills` (best-effort). Kalkulasi 100% offline. |
| F02 | PayLater / Pinjol Tracker | `NH.PayLater` + perluasan `Debts`: tipe komitmen `paylater`/`cicilan` (label UI **"Komitmen Bayar"**), field provider (datalist SPayLater/GoPayLater/Kredivo/dll) + nominal per bulan. Reminder **H-3/H-1/H-0**: banner Home, badge di list, segmen filter di tab Hutang. Tombol "Ubah tanggal". Tidak ada CTA pinjaman sama sekali. |
| F03 | Wishlist "Racun TikTok" | `NH.Wishlist` + segmen **"Target Tabungan"** di tab Budget. Item: nama, harga target, emoji, link, deadline, prioritas; progress bar; "Nabung" (ledger terpisah, **tidak menyentuh expense bulanan**); kontribusi bisa dihapus (undo); "Sudah dibeli" (opsional catat expense) / "Batalkan"; empty state "Belum ada racun TikTok". Tabel `savings_goals` + `savings_contributions`. |
| F04 | Roast My Spend | `NH.Roast`: copy bank overbudget / budget>80% / streak putus / jajan 3 hari; **max 1× per trigger per hari** (throttle localStorage); setting "Mode Roast"; ikut dipakai `NH.mascotSpeech` saat maskot diketuk. Tanpa kata kasar/body-shaming. |
| F05 | Subscription Tracker | `NH.Subscriptions`: tab baru **"Langganan"** di Keuangan; deteksi otomatis dari transaksi (`isRecurring` + nama dikenal: Spotify, Netflix, YouTube, iCloud, Canva, dll) dengan saran "Tambah"; siklus mingguan/bulanan/tahunan; peringatan H-3/H-1/H-0 + banner Home; "Sudah dibayar" → geser tanggal + buka TxnModal dengan **marker idempotency** `[sub:id:due]` supaya tidak double-count; edit/hapus; toggle deteksi otomatis. |
| F06 | Boleh Jajan Gak? | `NH.JajanCheck`: tombol di kartu "Pengeluaran Hari Ini" + shortcut PWA. Algoritma: `sisaHarian = dailyLimit − pengeluaranHariIni`; 3 state (Boleh / Boleh tapi hati-hati dengan toleransi 20% / Tahan dulu) + fallback "Limit harian belum diatur"; animasi maskot-emoji + haptic; tombol "Catat saja" membuka TxnModal terisi. |
| F07 | Wrapped Bulanan | `NH.Wrapped`: slide story (total, kategori terboros, hari terboros, langganan termahal, vs bulan lalu, level), picker bulan, toggle **"Sembunyikan nominal"** untuk share, share via Web Share/copy. Banner Home otomatis tanggal 1–7. Entry juga di Settings. Tidak crash saat data kosong. |
| F08 | Radial Menu FAB | `NH.RadialFab.Trigger`: tap = QuickAdd (fallback lama), **long-press 250 ms** = radial 5 aksi (Pengeluaran/Pemasukan/Transfer/Catatan/Scan); lepas jari di item (elementFromPoint) atau klik; haptic saat terbuka; tidak konflik scroll (pointer events). |
| F09 | Haptic Dinamis | `NH.Haptics`: input 8–10 ms, sukses `[12,40,12]`, error `[30,60,30]`; semua `triggerHaptic` lama didelegasikan; toggle "Getaran"; silent bila `navigator.vibrate` tidak ada (iOS aman). |
| F10 | Pull-to-Refresh | `NH.PullRefresh` di Home: scrollTop 0 + tarik >70 px → spinner → `He()` (refresh Supabase) → crossfade; tidak aktif di sheet/numpad/input/swipe; toast error berasal dari `He()`; haptic sukses. |
| F11 | Auto-Paste Nominal | Di `TxnModal`: saat dibuka (bukan edit) baca `navigator.clipboard.readText()` sekali; parse `50.000` / `Rp50.000` / `50000`; chip "📋 Tempel Rp…?"; tidak auto-submit; permission ditolak = silent. Clipboard tidak pernah dikirim ke server. |
| F12 | Skeleton Crossfade | `NH.Crossfade` membungkus halaman di App: skeleton min. 300 ms lalu opacity-fade 260 ms ke konten; `prefers-reduced-motion` mematikan animasi; skeleton `aria-hidden`. |
| F13 | Swipe-to-Complete Todo | `NH.UI.SwipeItem` mendukung `onComplete`: swipe kanan >74 px = selesai (haptic sukses + SFX pop + background hijau "Selesai"); swipe kiri tetap hapus; todo ber-budget tetap membuka `TodoBudgetModal`. |
| F14 | Auto Dark/Light | `NH.AutoTheme`: setting "Ikuti Sistem"; `prefers-color-scheme` → dark = tema dark terakhir (`nh21_lastdark`), light = Dawn; listener perubahan OS; pilihan manual tidak ditimpa; `meta theme-color` ikut; init sebelum paint (tanpa flicker). |
| F15 | Aksesoris Maskot | `NH.Gamification`: unlock streak 7/14/30/60 hari (kacamata/topi/syal/mahkota) — toast + SFX saat unlock; overlay SVG ringan di `NH.Mascot`; picker di Settings & panel Streak; tersimpan di prefs + tabel `achievements` tersedia di migrasi. |
| F16 | Leveling System | `NH.Gamification.level`: skor dari rasio tabungan, kepatuhan budget, streak, hari mencatat → "Suhu Keuangan / Si Paling Hemat / Raja Boros (playful) / Bertumbuh" + tooltip tips; kartu level di Settings. Tidak memengaruhi fitur inti. |
| F17 | Revamp Streak Saver | `NH.Gamification.computeStreak` dari tanggal transaksi (tidak ada streak palsu); badge 🔥 di Home → panel: current/longest/kalender 28 hari; "Streak dijeda" + **Pulihkan** via 1 freeze gratis/bulan (`freeze_days`) atau tombol catat transaksi; sinkron best-effort ke tabel `streaks`. |
| F18 | Sound Effects UI | `NH.SFX`: WAV base64 inline di bundle (`kaching` pemasukan, `pop` todo/selesai, `click` simpan) — tanpa file eksternal; hanya berbunyi setelah gestur user; toggle "Suara"; try/catch untuk browser yang memblokir audio. |
| F19 | Mode Puasa Jajan | `NH.PuasaJajan`: durasi 1/3/7 hari, kategori terkunci (default Kopi & Jajan) tampil abu-abu+coret di TxnModal; mencoba mencatat → maskot mencegah + konfirmasi "Batalkan puasa jajan?"; berakhir otomatis; manajemen & pembatalan di Settings; transaksi kategori lain tidak diblokir. |
| F20 | Web Share API | `NH.Share`: `navigator.share` → fallback copy clipboard (legacy execCommand) ; dipakai Wrapped, Split Bill, dan **"Share Laporan Bulanan"** di Settings; teks format bold WhatsApp (`*…*`); tidak ada share tanpa aksi user. |
| F21 | PWA App Shortcuts | `manifest.json` → 3 shortcut (`?action=add-expense`, `?action=scan`, `?action=jajan-check`); App membaca query saat load dan membuka modal terkait lalu membersihkan URL; SW network-first untuk navigasi sehingga query tidak diblok; parameter tak dikenal diabaikan. |
| F22 | Web Worker OCR | `NH.WorkerOCR`: worker dari `URL.createObjectURL(new Blob([...]))`, `importScripts` Tesseract CDN, progress → main thread, timeout 120 s, `stop()`; fallback otomatis ke main-thread `Tesseract.recognize` bila worker gagal; gambar tidak dikirim ke server mana pun. |
| F23 | CSS Native Nesting | Seluruh CSS komponen V2.1 (`styles.css` bagian bawah) memakai nesting native (`& ...`); tanpa PostCSS/build tambahan; CSS lama tidak diubah → nol regresi visual. |
| F24 | Input Suara Cepat | `NH.Voice`: Web Speech API `lang="id-ID"`; parsing lokal tipe (keluar/masuk), nominal angka **dan kata bilangan** ("lima puluh ribu", "dua juta", "seratus"), kategori via kata kunci; mengisi form tanpa auto-submit; tombol mic bersembunyi bila API tidak didukung; audio tidak dikirim ke server. |
| F25 | Swipeable Tabs Keuangan | Tab Ringkasan/Transaksi/Budget/Hutang/**Langganan** bisa digeser (threshold 90 px, dominan horizontal, haptic); tidak aktif di input/seg/sheet/numpad/swipe-wrap sehingga tidak bentrok dengan swipe-to-delete. |

---

## 2. Arsitektur

- **Single bundle** `app.bundle.js` (React 18 UMD + Supabase UMD dari CDN, tanpa Babel di runtime). Modul V2.1 menempel di namespace `NH` yang sudah ada: `NH.prefs, NH.Haptics, NH.SFX, NH.Share, NH.AutoTheme, NH.Roast, NH.Gamification, NH.PuasaJajan, NH.Voice, NH.WorkerOCR, NH.Crossfade, NH.PullRefresh, NH.RadialFab, NH.SplitBill, NH.JajanCheck, NH.PayLater, NH.Subscriptions, NH.Wishlist, NH.Wrapped, NH.V21`.
- **Feature flags**: `NH.config.FEATURES` (splitBill, paylater, wishlist, subscriptions, jajanCheck, wrapped, roast, radialFab, voiceInput, workerOCR, pullRefresh, autoPaste, swipeTabs, gamification, puasaJajan, sfx). Rollback = matikan flag, bukan rollback DB.
- **Graceful degradation**: setiap query tabel baru di-`catch`; UI menampilkan pesan ramah ("tabel … belum ada — jalankan migrasi V2.1") sementara fitur inti V2.0 tetap jalan. `checkSchema()` lama tidak diubah.
- **Privasi**: clipboard, speech, dan OCR diproses lokal; share hanya lewat aksi eksplisit; tidak ada storage token selain session Supabase.
- **Service worker**: `CACHE_NAME = natahidup-v2.1.1`; Supabase network-only; navigasi network-first (query shortcut aman); `blob:`/`data:` tidak di-cache.

## 3. Migrasi Supabase

Jalankan **sekali** isi file `supabase/migrations/20261031_v21_features.sql` di SQL Editor Supabase:
`user_settings`, `split_bills`, `split_participants`, `paylater_accounts` (cadangan), `savings_goals`, `savings_contributions`, `subscriptions`, `streaks`, `achievements`, `wrapped_reports` + RLS (`user_id = auth.uid()`), index, serta `ALTER` `transactions` (`paylater_account_id`, `subscription_id`) dan `debts` (`kind`, `provider`, `monthly_amount`). Semua backward-compatible (nullable/default).

## 4. QA yang sudah dijalankan

- `node --check` bundle: OK.
- **52 unit test** (`work/test/unit.js`) lulus: split calc + rounding + custom, jajan check 4 state, voice parsing (angka & kata bilangan), streak/longest/freeze-unlock, level, subscription detect/dueSoon/idempotency, paylater dueSoon, wrapped build + hide-amount, roast throttle & on/off, puasa jajan lock, toggle haptic/sfx, auto-theme.
- **Smoke test jsdom** (`work/test/smoke.js`): aplikasi boot, 18/18 modul V2.1 terdaftar, AuthScreen render, **nol runtime error**.
- Build reproducible: `work/patch.py` (52 patch surgikal ke bundle V2.0) + `work/v21-part1.js` + `work/v21-part2.js` + `work/v21.css`.

## 5. Cara deploy

1. Jalankan migrasi SQL di atas (jika belum).
2. Upload isi folder ini (index.html, app.bundle.js, styles.css, sw.js, manifest.json, icons/, supabase/) ke hosting statis Anda, menimpa file V2.0.
3. Versi SW naik otomatis → user lama mendapat cache baru saat reload.
4. Opsional: matikan flag tertentu di `NH.config.FEATURES` bila ada fitur yang ingin ditahan.

## 6. Catatan & keputusan open-questions PRD

1. Wishlist "Nabung" = **ledger target** (saldo wallet tidak dipindahkan) — sesuai rekomendasi PRD.
2. PayLater dihitung expense **saat pembayaran** (via "Sudah dibayar" → TxnModal), bukan saat jatuh tempo.
3. Wrapped share = **teks** dulu (format WhatsApp), gambar = fase berikutnya.
4. Roast = rules-based + variasi copy, tanpa LLM.
5. Prompt push notification tidak dipaksa; banner in-app kanal utama (fallback sesuai PRD).
6. Auto theme: user baru default mengikuti sistem lewat `NH.AutoTheme` (prefs `nh21_theme_mode`), user lama tetap manual sampai menyalakan switch.

---

## V2.1.1 — Hotfix & Owner Update (31 Okt 2026)

### 🐛 Bug yang ditemukan & diperbaiki (dilaporkan ke owner sesuai instruksi)
1. **Nav bawah rusak (kritikal)** — `NH.RadialFab.Trigger` salah sarang: masuk sebagai *anak* tombol "Catatan", sehingga tombol "Keuangan" & "Setelan" ikut tertelan dan tidak pernah render (nav cuma tampil 2 tombol 50/50). Akar masalah: satu kurung tutup `)` hilang di patch FAB, dan secara kebetulan ada `)` kelebihan di patch undo-bar — keduanya saling menetralkan sehingga `node --check` & smoke test lolos (sintaks valid, struktur DOM salah). **Fix**: kurung diluruskan (Trigger kini *sibling* antar tombol nav) + **guard struktur** di `build.sh` (build gagal kalau Trigger bukan sibling / tombol nav < 4).
2. **Gap kosong di Home** — container banner (`col gap-2`) tetap dirender walau semua banner kosong → ruang hampa antara greeting dan kartu hero. **Fix**: container hanya dirender bila minimal ada satu pengingat aktif (PayLater jatuh tempo / langganan H-3 / Wrapped tgl 1–7 / Puasa Jajan aktif).
3. **Typo email owner** (tertangkap unit test sebelum rilis) — `irhamdaffa74` (kurang "k") diperbaiki ke `irkhamdaffa74@gmail.com`.
4. Bukan bug: benda oranye di kepala maskot = seni asli kapibara+mikan; data saldo/streak/jajan render normal = migration Supabase sukses.

### ✨ Baru di V2.1.1
- **F26 Entitlement / Owner** — `NH.Entitlement`: akun `irkhamdaffa74@gmail.com` = **Owner** (chip 👑 OWNER di Setelan, semua fitur berbayar terbuka permanen, case/spasi-insensitive).
- **Laman 5 Tier Langganan (Demo)** — Setelan → kartu "✦ NataHidup+" → sheet carousel scroll-snap: Sobat Miskin / Mendang-Mending (neon) / Si Paling Healing (pastel) / Suhu Keuangan (holographic) / Sultan Mode (gold glitter). Semua tier berlabel **"Gratis (Demo) · Berakhir Kuartal 1 2027"** + countdown hari (target 31 Mar 2027, refresh tiap menit). Pilih tier disimpan lokal (`nh_prefs.plan21`).
- **Glassmorphism sheet** — `backdrop-filter: blur(20px) saturate(1.35)` + background semi-transparan (dengan `@supports` fallback).
- **Breathing background** — `#root:before` dianimasikan `nh-breathe` 9s (hormat `prefers-reduced-motion`).
- `sw.js` CACHE_NAME → `natahidup-v2.1.1` (client lama auto-refresh).

### ✅ Verifikasi
- Unit test **63/63** (12 test F26 baru: owner deteksi, case-insensitive, countdown, plan free/tersimpan/reset).
- Smoke jsdom: **19/19 modul**, render tanpa error runtime, versi 2.1.1.
- Guard struktur nav di `build.sh` + inspeksi bundle hasil minify (Trigger sibling, sheet `tiers` terpasang, email owner benar).
- Roadmap 27 ide owner → `ROADMAP-V22.md`.
