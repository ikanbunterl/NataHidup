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
    mascotOn:  'nh2_mascot_on',  // maskot tampil / tidak
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
/* ============================================================
   NataHidup V2 — Utilitas murni (tanpa JSX)
   Format angka/tanggal, evaluasi ekspresi numpad, pembersih
   angka OCR, hook preferensi perangkat, dan helper kecil.
   ============================================================ */
window.NH = window.NH || {};

NH.utils = (function () {
  const { useState } = React;

  // ===== Format =====
  const nf = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  });
  const fmtC = (n) => nf.format(Math.round(Number(n) || 0));
  // Versi ringkas untuk chart: 1,2 jt / 850 rb
  const fmtShort = (n) => {
    n = Number(n) || 0;
    const abs = Math.abs(n);
    if (abs >= 1e9) return (n / 1e9).toFixed(1).replace('.', ',') + ' M';
    if (abs >= 1e6) return (n / 1e6).toFixed(abs >= 1e7 ? 0 : 1).replace('.', ',') + ' jt';
    if (abs >= 1e3) return Math.round(n / 1e3) + ' rb';
    return String(Math.round(n));
  };
  const fmtD = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtDShort = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  const fmtT = (d) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const dayLabel = (dateStr) => {
    if (dateStr === getToday()) return 'Hari ini';
    const y = new Date(Date.now() - 864e5).toISOString().split('T')[0];
    if (dateStr === y) return 'Kemarin';
    return fmtD(dateStr);
  };

  // ===== Tanggal =====
  const getToday = () => {
    // tanggal lokal, bukan UTC — penting untuk zona waktu WIB/WITA/WIT
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  };
  const getYesterday = () => {
    const n = new Date(Date.now() - 864e5);
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  };
  const getMY = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
  };
  const daysInMonth = (y, m) => new Date(y, m, 0).getDate(); // m: 1-12
  const monthName = (ym) => {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'short' });
  };

  // ===== Ekspresi kalkulator untuk numpad =====
  // Simbol tampil: × − ÷  ->  dinormalisasi ke * - /
  const normExpr = (s) =>
    String(s).replace(/×/g, '*').replace(/[−–]/g, '-').replace(/÷/g, '/').replace(/\s+/g, '');
  const evalAmt = (s) => {
    try {
      s = normExpr(s);
      if (!s) return NaN;
      if (!/[+\-*/]/.test(s)) {
        const v = parseFloat(s);
        return isFinite(v) ? Math.round(v) : NaN;
      }
      if (!/^[\d+\-*/().]+$/.test(s) || !/\d/.test(s)) return NaN;
      const r = Function('"use strict";return(' + s + ')')();
      return typeof r === 'number' && isFinite(r) ? Math.round(r) : NaN;
    } catch (e) { return NaN; }
  };
  const hasOp = (s) => /[+\-*/×−÷]/.test(normExpr(s).slice(1)); // abaikan minus di depan

  // ===== Pembersih angka hasil OCR =====
  // Mengatasi salah baca titik/koma, huruf O/o, dan simbol Rp.
  const toNum = (n) => {
    n = String(n).replace(/rp\.?/gi, '').replace(/[^\d.,]/g, '').replace(/[oO]/g, '0');
    if (!n) return 0;
    if (n.includes(',') && n.includes('.')) {
      n = n.replace(/\./g, '').replace(',', '.');
    } else if (n.includes(',')) {
      n = /,\d{3}(\D|$)/.test(n) ? n.replace(/,/g, '') : n.replace(',', '.');
    } else {
      n = n.replace(/\./g, '');
    }
    const v = parseFloat(n);
    return isFinite(v) ? v : 0;
  };

  // Normalisasi tanggal dari teks OCR ke 'YYYY-MM-DD'
  const normDate = (s) => {
    if (!s) return '';
    s = String(s).trim();
    let m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = s.match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b/);
    if (m) {
      const y = m[3].length === 2 ? '20' + m[3] : m[3];
      const mo = parseInt(m[2], 10), da = parseInt(m[1], 10);
      if (mo >= 1 && mo <= 12 && da >= 1 && da <= 31)
        return `${y}-${String(mo).padStart(2, '0')}-${String(da).padStart(2, '0')}`;
      if (da >= 1 && da <= 12 && mo >= 13 && mo <= 31) // format terbalik dd/mm vs mm/dd
        return `${y}-${String(da).padStart(2, '0')}-${String(mo).padStart(2, '0')}`;
    }
    return '';
  };

  // ===== Lain-lain =====
  const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  const triggerHaptic = (ms = 40) => { if (navigator.vibrate) navigator.vibrate(ms); };

  const errMsg = (e) => {
    const m = String((e && (e.message || e)) || 'Terjadi kesalahan');
    if (/failed to fetch|fetch failed|networkerror|network request|load failed|timeout|econnrefused/i.test(m))
      return 'Tidak ada koneksi internet. Periksa jaringanmu, lalu coba lagi.';
    return m;
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // Hook preferensi per-perangkat (localStorage)
  function usePref(key, initial) {
    const [v, setV] = useState(() => {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? initial : JSON.parse(raw);
      } catch (e) { return initial; }
    });
    const save = (val) => {
      try {
        const next = typeof val === 'function' ? val(v) : val;
        setV(next);
        localStorage.setItem(key, JSON.stringify(next));
      } catch (e) { /* storage penuh/diblokir — abaikan */ }
    };
    return [v, save];
  }

  const escCsv = (v) => {
    const s = (v === null || v === undefined) ? '' : String(v);
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };

  // Pengeluaran yang terpantau sebuah budget, sesuai periodenya:
  // monthly -> bulan kalender ini; weekly -> 7 hari terakhir bergulir.
  const spendForBudget = (b, txns) => {
    const cats = (b.categories && b.categories.length) ? b.categories : [b.category];
    const set = {};
    cats.forEach((c) => { set[c] = 1; });
    let from;
    if (b.period === 'weekly') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else {
      from = getMY() + '-00'; // semua tanggal bulan ini (perbandingan string)
    }
    let s = 0;
    (txns || []).forEach((t) => {
      if (t.type === 'expense' && t.date && t.date >= from && set[t.category]) s += t.amount;
    });
    return s;
  };

  return {
    fmtC, fmtShort, fmtD, fmtDShort, fmtT, dayLabel,
    getToday, getYesterday, getMY, daysInMonth, monthName,
    evalAmt, normExpr, hasOp, toNum, normDate,
    genId, clamp, triggerHaptic, errMsg, greeting, usePref, escCsv,
    spendForBudget,
  };
})();
/* ============================================================
   NataHidup V2 — Tema dinamis
   Menerapkan tema melalui CSS variables (data-theme di <html>).
   Lihat css/themes.css untuk definisi variabel tiap tema.
   ============================================================ */
window.NH = window.NH || {};

NH.theme = (function () {
  const { THEMES, DEFAULT_THEME, KEYS } = NH.config;

  const getTheme = (id) => THEMES.find((t) => t.id === id) || THEMES.find((t) => t.id === DEFAULT_THEME);

  function apply(id) {
    const t = getTheme(id);
    document.documentElement.setAttribute('data-theme', t.id);
    document.documentElement.classList.toggle('light', !t.dark);
    // warna address bar browser mengikuti tema
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t.meta);
    try { localStorage.setItem(KEYS.theme, JSON.stringify(t.id)); } catch (e) {}
    return t;
  }

  function current() {
    try {
      const raw = localStorage.getItem(KEYS.theme);
      return getTheme(raw ? JSON.parse(raw) : DEFAULT_THEME);
    } catch (e) { return getTheme(DEFAULT_THEME); }
  }

  // Dipanggil sedini mungkin (sebelum React render) agar tidak ada
  // kedipan tema default saat halaman dimuat.
  function init() { apply(current().id); }

  return { apply, current, init, getTheme };
})();

// Guard: di Node (unit test) tidak ada document — lewati init.
if (typeof document !== 'undefined') NH.theme.init();
/* ============================================================
   NataHidup V2 — Lapisan database (Supabase)
   Klien, pemetaan baris (snake_case) <-> objek UI (camelCase),
   pemeriksaan skema, dan pemuatan data awal + seed default.
   Skema tabel TIDAK berubah dari V1 — data lama tetap terpakai.
   ============================================================ */
window.NH = window.NH || {};

NH.db = (function () {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, DEF_WALLETS, DEF_EXP_CAT, DEF_INC_CAT, DEF_BUDGETS } = NH.config;
  const { getToday } = NH.utils;

  // Guard: window.supabase tidak ada saat unit test di Node.
  const sb = (typeof window !== 'undefined' && window.supabase)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  // ===== Pemetaan baris database <-> objek UI =====
  const rowToWallet = (r) => ({ id: r.id, name: r.name, type: r.type, balance: Number(r.balance) || 0 });

  const rowToTxn = (r) => ({
    id: r.id,
    type: r.type,
    amount: Number(r.amount) || 0,
    category: r.category || '',
    note: r.note || '',
    date: String(r.date || '').slice(0, 10),
    walletId: r.wallet_id || '',
    transferFrom: r.transfer_from || '',
    transferTo: r.transfer_to || '',
    isRecurring: !!r.is_recurring,
    recurringDay: (r.recurring_day === null || r.recurring_day === undefined) ? null : r.recurring_day,
    recurringPid: r.recurring_pid || '',
    createdAt: r.created_at,
  });

  const txnToRow = (t) => ({
    type: t.type,
    amount: t.amount,
    category: t.category || null,
    note: t.note || null,
    date: t.date || getToday(),
    wallet_id: t.walletId || null,
    transfer_from: t.transferFrom || null,
    transfer_to: t.transferTo || null,
    is_recurring: !!t.isRecurring,
    recurring_day: t.isRecurring ? (t.recurringDay || null) : null,
    recurring_pid: t.recurringPid || null,
  });

  const rowToCat = (r) => ({ id: r.code, dbId: r.id, name: r.name, color: r.color, type: r.type });
  const rowToBudget = (r) => ({
    id: r.id,
    category: r.category,
    categories: (r.categories && r.categories.length) ? r.categories : [r.category],
    limit: Number(r.amount_limit) || 0,
    period: r.period || 'monthly',
  });
  const rowToNote = (r) => ({
    id: r.id, title: r.title || '', content: r.content || '', tags: r.tags || [],
    pinned: !!r.pinned, createdAt: r.created_at, updatedAt: r.updated_at || r.created_at,
  });
  const rowToTodo = (r) => ({
    id: r.id, title: r.title, completed: !!r.completed,
    deadline: r.deadline || null, budget: Number(r.budget) || 0, createdAt: r.created_at,
  });
  const rowToDebt = (r) => ({
    id: r.id, name: r.name, dtype: r.dtype || 'hutang', amount: Number(r.amount) || 0,
    dueDate: r.due_date || null, note: r.note || '', status: r.status || 'pending', createdAt: r.created_at,
  });

  // ===== Delta saldo dompet yang dihasilkan sebuah transaksi =====
  const txnDelta = (t) => {
    const d = {};
    if (t.type === 'transfer') {
      if (t.transferFrom) d[t.transferFrom] = -t.amount;
      if (t.transferTo) d[t.transferTo] = (d[t.transferTo] || 0) + t.amount;
    } else if (t.walletId) {
      d[t.walletId] = (t.type === 'income' ? 1 : -1) * t.amount;
    }
    return d;
  };
  const flipDelta = (d) => { const o = {}; Object.keys(d || {}).forEach((k) => { o[k] = -d[k]; }); return o; };
  const mergeDelta = (a, b) => {
    const o = { ...(a || {}) };
    Object.keys(b || {}).forEach((k) => { o[k] = (o[k] || 0) + b[k]; });
    return o;
  };

  // ===== Cek kelengkapan skema sebelum boot =====
  async function checkSchema() {
    const probes = await Promise.all([
      sb.from('categories').select('code').limit(1),
      sb.from('transactions').select('recurring_pid').limit(1),
      sb.from('budgets').select('id').limit(1),
      sb.from('notes').select('id').limit(1),
      sb.from('todos').select('id').limit(1),
      sb.from('debts').select('id').limit(1),
    ]);
    const labels = [
      'kolom categories.code', 'kolom transactions.recurring_pid',
      'tabel budgets', 'tabel notes', 'tabel todos', 'tabel debts',
    ];
    return probes.map((p, i) => (p.error ? labels[i] : null)).filter(Boolean);
  }

  // ===== Unduh semua data pengguna + seed default bila kosong =====
  async function loadAllData(uid) {
    const [wR, cR, tR] = await Promise.all([
      sb.from('wallets').select('*').eq('user_id', uid).order('created_at', { ascending: true }),
      sb.from('categories').select('*').eq('user_id', uid).order('created_at', { ascending: true }),
      sb.from('transactions').select('*').eq('user_id', uid).eq('is_deleted', false)
        .order('date', { ascending: false }).order('created_at', { ascending: false }),
    ]);
    if (wR.error) throw wR.error;
    if (cR.error) throw cR.error;
    if (tR.error) throw tR.error;

    const [bgR, nR, tdR, dbR] = await Promise.all([
      sb.from('budgets').select('*').eq('user_id', uid),
      sb.from('notes').select('*').eq('user_id', uid).order('updated_at', { ascending: false }),
      sb.from('todos').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      sb.from('debts').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    ]);
    if (bgR.error) throw bgR.error;
    if (nR.error) throw nR.error;
    if (tdR.error) throw tdR.error;
    if (dbR.error) throw dbR.error;

    // Seed kategori default untuk akun baru
    let cats = cR.data.filter((r) => r.code).map(rowToCat);
    if (!cR.data.length) {
      const seed = [...DEF_EXP_CAT, ...DEF_INC_CAT]
        .map((c) => ({ user_id: uid, name: c.name, color: c.color, type: c.type, code: c.id }));
      const { data, error } = await sb.from('categories').insert(seed).select();
      if (error) throw error;
      cats = data.map(rowToCat);
    }

    // Seed dompet default
    let wallets = wR.data.map(rowToWallet);
    if (!wR.data.length) {
      const seed = DEF_WALLETS.map((w) => ({ user_id: uid, name: w.name, type: w.type, balance: 0 }));
      const { data, error } = await sb.from('wallets').insert(seed).select();
      if (error) throw error;
      wallets = data.map(rowToWallet);
    }

    // Seed budget default
    let budgets = bgR.data.map(rowToBudget);
    if (!bgR.data.length) {
      const seed = DEF_BUDGETS.map((b) => ({
        user_id: uid, category: b.category, categories: b.categories,
        amount_limit: b.limit, period: b.period,
      }));
      const { data, error } = await sb.from('budgets').insert(seed).select();
      if (error) throw error;
      budgets = data.map(rowToBudget);
    }

    return {
      wallets,
      txns: tR.data.map(rowToTxn),
      budgets,
      notes: nR.data.map(rowToNote),
      todos: tdR.data.map(rowToTodo),
      debts: dbR.data.map(rowToDebt),
      expCats: cats.filter((c) => c.type === 'expense'),
      incCats: cats.filter((c) => c.type === 'income'),
    };
  }

  return {
    sb,
    rowToWallet, rowToTxn, txnToRow, rowToCat, rowToBudget, rowToNote, rowToTodo, rowToDebt,
    txnDelta, flipDelta, mergeDelta,
    checkSchema, loadAllData,
  };
})();
