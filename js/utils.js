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

  return {
    fmtC, fmtShort, fmtD, fmtDShort, fmtT, dayLabel,
    getToday, getYesterday, getMY, daysInMonth, monthName,
    evalAmt, normExpr, hasOp, toNum, normDate,
    genId, clamp, triggerHaptic, errMsg, greeting, usePref, escCsv,
  };
})();
