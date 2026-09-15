/* ============================================================
   NataHidup V2 — Konfigurasi global
   Berisi kredensial Supabase, seed data default, daftar tema,
   daftar maskot, dan kunci penyimpanan lokal (per-perangkat).
   ============================================================ */
window.NH = window.NH || {};

NH.config = {
  APP_NAME: 'NataHidup',
  APP_VERSION: '2.0.0',

  // ===== Supabase =====
  // Anon key memang bersifat publik; keamanan data dijaga oleh
  // Row Level Security (RLS) di database (lihat supabase/schema.sql).
  SUPABASE_URL: 'https://nvxvfbwvplkxqoetzwky.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eHZmYnd2cGxreHFvZXR6d2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDQ0NDEsImV4cCI6MjEwNDgyMDQ0MX0.Lii0Fe1sS5vqKEFvgi3lgb_ETGCCIKA2WaR6Nn7ZlSM',

  // ===== Kunci localStorage (pengaturan PERANGKAT, bukan data pengguna) =====
  KEYS: {
    theme:     'nh2_theme',      // id tema aktif
    mascot:    'nh2_mascot',     // id maskot di kartu saldo
    hideBal:   'nh2_hidebal',    // sembunyikan nominal (privasi)
    learnedKw: 'nh_lkw',         // memori kata kunci kategori hasil OCR (dipertahankan dari V1)
  },

  // ===== Seed default untuk akun baru =====
  DEF_WALLETS: [
    { name: 'Cash',       type: 'cash' },
    { name: 'Bank Utama', type: 'bank' },
    { name: 'E-Wallet',   type: 'ewallet' },
  ],
  DEF_EXP_CAT: [
    { id: 'makan',     name: 'Makan & Minum', color: '#f59e0b', type: 'expense' },
    { id: 'transport', name: 'Transport',     color: '#3b82f6', type: 'expense' },
    { id: 'hiburan',   name: 'Hiburan',       color: '#8b5cf6', type: 'expense' },
    { id: 'tagihan',   name: 'Tagihan',       color: '#ef4444', type: 'expense' },
    { id: 'kopi',      name: 'Kopi & Jajan',  color: '#a855f7', type: 'expense' },
    { id: 'belanja',   name: 'Belanja',       color: '#ec4899', type: 'expense' },
    { id: 'kesehatan', name: 'Kesehatan',     color: '#10b981', type: 'expense' },
    { id: 'pendidikan',name: 'Pendidikan',    color: '#06b6d4', type: 'expense' },
    { id: 'cicilan',   name: 'Cicilan',       color: '#f97316', type: 'expense' },
    { id: 'lainnya_e', name: 'Lainnya',       color: '#6b7280', type: 'expense' },
  ],
  DEF_INC_CAT: [
    { id: 'gaji',      name: 'Gaji',      color: '#10b981', type: 'income' },
    { id: 'freelance', name: 'Freelance', color: '#3b82f6', type: 'income' },
    { id: 'bonus',     name: 'Bonus',     color: '#f59e0b', type: 'income' },
    { id: 'lainnya_i', name: 'Lainnya',   color: '#6b7280', type: 'income' },
  ],
  DEF_BUDGETS: [
    { category: 'makan',     limit: 1500000, period: 'monthly', categories: ['makan', 'kopi', 'belanja'] },
    { category: 'transport', limit: 500000,  period: 'monthly', categories: ['transport'] },
    { category: 'hiburan',   limit: 300000,  period: 'monthly', categories: ['hiburan'] },
  ],

  CAT_COLORS: ['#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899', '#10b981', '#06b6d4', '#f97316'],

  // ===== Tema (CSS variables di css/themes.css) =====
  THEMES: [
    { id: 'midnight', name: 'Midnight', dark: true,  swatch: ['#4f46e5', '#9333ea'], meta: '#0a0e1c' },
    { id: 'ocean',    name: 'Ocean',    dark: true,  swatch: ['#0284c7', '#38bdf8'], meta: '#071120' },
    { id: 'forest',   name: 'Forest',   dark: true,  swatch: ['#059669', '#34d399'], meta: '#0a1410' },
    { id: 'sunset',   name: 'Sunset',   dark: true,  swatch: ['#f97316', '#ec4899'], meta: '#170d10' },
    { id: 'dawn',     name: 'Dawn',     dark: false, swatch: ['#6366f1', '#8b5cf6'], meta: '#f4f6fb' },
    { id: 'sakura',   name: 'Sakura',   dark: false, swatch: ['#ec4899', '#c084fc'], meta: '#fdf6f8' },
  ],
  DEFAULT_THEME: 'midnight',

  // ===== Maskot kartu saldo =====
  MASCOTS: [
    { id: 'capybara', name: 'Kapibara'  },
    { id: 'butterfly',name: 'Kupu-kupu' },
    { id: 'cat',      name: 'Kucing'    },
    { id: 'penguin',  name: 'Penguin'   },
    { id: 'sprout',   name: 'Tunas'     },
  ],
  DEFAULT_MASCOT: 'capybara',
};
