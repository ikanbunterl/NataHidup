/* ============================================================
   NataHidup V3 — Konfigurasi runtime (BUG-001)
   Kredensial Supabase TIDAK lagi di-bake ke app.bundle.js.
   Catatan keamanan: anon key Supabase memang bersifat publik —
   keamanan data bergantung pada RLS (lihat supabase/rls_audit.sql).
   File ini dipisah agar kunci bisa di-rotate / dibedakan per
   environment tanpa rebuild bundle. JANGAN taruh service_role
   key di sini.
   ============================================================ */
window.__NH_CONFIG = {
  SUPABASE_URL: "https://nvxvfbwvplkxqoetzwky.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eHZmYnd2cGxreHFvZXR6d2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDQ0NDEsImV4cCI6MjEwNDgyMDQ0MX0.Lii0Fe1sS5vqKEFvgi3lgb_ETGCCIKA2WaR6Nn7ZlSM",
  /* F-3.9 Web Push: isi dengan VAPID public key (base64url) setelah
     deploy supabase/functions/nightly-push — lihat README-V30.md.
     Kosong = aplikasi otomatis memakai mode pengingat lokal. */
  VAPID_PUBLIC_KEY: "",
  /* BUG-004: CDN Tesseract untuk OCR worker (bisa diarahkan ke
     salinan self-host bila CSP hosting melarang CDN). */
  OCR_CDN: "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/tesseract.min.js"
};
