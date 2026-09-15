/* ============================================================
   NataHidup V2 — UI KIT (satu file)
   Bagian 1: set ikon SVG            (NH.I, NH.WalletIcon)
   Bagian 2: maskot karakter         (NH.Mascots, NH.Mascot, NH.mascotSpeech)
   Bagian 3: komponen bersama        (NH.UI: Sheet, Toasts, Numpad, dll.)
   ============================================================ */
window.NH = window.NH || {};

/* ############################################################
   BAGIAN 1 — IKON (gaya feather, stroke konsisten)
   ############################################################ */
NH.I = (function () {
  const S = ({ size = 22, w = 2, children, fill = 'none' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
      strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  );

  return {
    Home: (p) => <S {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></S>,
    Notes: (p) => <S {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></S>,
    Wallet: (p) => <S {...p}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></S>,
    Gear: (p) => <S {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.65.77 1.11 1.51 1.11H21a2 2 0 0 1 0 4h-.09c-.74 0-1.31.46-1.51 1.11z" /></S>,
    Plus: (p) => <S w={2.6} {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>,
    X: (p) => <S {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>,
    Trash: (p) => <S {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></S>,
    Check: (p) => <S w={3} {...p}><polyline points="20 6 9 17 4 12" /></S>,
    Up: (p) => <S {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></S>,
    Down: (p) => <S {...p}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></S>,
    Cal: (p) => <S {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></S>,
    Search: (p) => <S {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></S>,
    DL: (p) => <S {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></S>,
    Clock: (p) => <S {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></S>,
    Pin: (p) => <S {...p}><line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" /></S>,
    Repeat: (p) => <S {...p}><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></S>,
    Alert: (p) => <S {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></S>,
    Transfer: (p) => <S {...p}><path d="M7 10h14l-4-4" /><path d="M17 14H3l4 4" /></S>,
    Cam: (p) => <S {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></S>,
    CamOff: (p) => <S {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><line x1="2" y1="2" x2="22" y2="22" /></S>,
    Building: (p) => <S {...p}><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><line x1="8" y1="6" x2="8.01" y2="6" /><line x1="16" y1="6" x2="16.01" y2="6" /><line x1="12" y1="6" x2="12.01" y2="6" /><line x1="8" y1="10" x2="8.01" y2="10" /><line x1="16" y1="10" x2="16.01" y2="10" /><line x1="12" y1="10" x2="12.01" y2="10" /><line x1="8" y1="14" x2="8.01" y2="14" /><line x1="16" y1="14" x2="16.01" y2="14" /><line x1="12" y1="14" x2="12.01" y2="14" /></S>,
    Phone: (p) => <S {...p}><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></S>,
    Handshake: (p) => <S {...p}><path d="m11 17 2 2a1 1 0 1 0 3-3" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" /><path d="m21 3 1 11h-2" /><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" /><path d="M3 4h8" /></S>,
    Eye: (p) => <S {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></S>,
    EyeOff: (p) => <S {...p}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></S>,
    Palette: (p) => <S {...p}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></S>,
    Backspace: (p) => <S {...p}><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></S>,
    Logout: (p) => <S {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></S>,
    Refresh: (p) => <S {...p}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></S>,
    FileText: (p) => <S {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></S>,
    Info: (p) => <S {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></S>,
    Edit: (p) => <S {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></S>,
    Chart: (p) => <S {...p}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></S>,
    Image: (p) => <S {...p}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></S>,
    ChevronR: (p) => <S {...p}><polyline points="9 18 15 12 9 6" /></S>,
    Target: (p) => <S {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></S>,
    Sparkle: (p) => <S {...p}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" /></S>,
    Cloud: (p) => <S {...p}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></S>,
  };
})();

// Ikon dompet sesuai tipe
NH.WalletIcon = function ({ type, size = 18 }) {
  const I = NH.I;
  if (type === 'cash') return <I.Wallet size={size} />;
  if (type === 'bank') return <I.Building size={size} />;
  return <I.Phone size={size} />;
};

/* ############################################################
   BAGIAN 2 — MASKOT KARAKTER (SVG inline)
   Karakter tidak boleh menutupi angka saldo & tombol privasi —
   posisi/ukuran diatur di css/app.css (.hero-mascot) dan bisa
   dimatikan lewat Pengaturan → Tampilan.
   ############################################################ */
NH.Mascots = (function () {

  /* ---------- Kapibara (default) ---------- */
  const Capybara = ({ size = 96 }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="24" r="9.5" fill="#fb923c" />
      <circle cx="56.5" cy="21" r="2.4" fill="#fdba74" opacity="0.8" />
      <path d="M60 14 C 60 10, 64 8, 67 9 C 66 12, 63 14, 60 14 Z" fill="#4ade80" />
      <ellipse cx="60" cy="96" rx="37" ry="23" fill="#b57f52" />
      <ellipse cx="60" cy="100" rx="26" ry="15" fill="#c99a6b" opacity="0.65" />
      <ellipse cx="46" cy="112" rx="8" ry="5" fill="#96683f" />
      <ellipse cx="74" cy="112" rx="8" ry="5" fill="#96683f" />
      <circle cx="30" cy="42" r="8" fill="#8a5a3b" />
      <circle cx="30" cy="42" r="4" fill="#6d4529" />
      <circle cx="90" cy="42" r="8" fill="#8a5a3b" />
      <circle cx="90" cy="42" r="4" fill="#6d4529" />
      <ellipse cx="60" cy="60" rx="35" ry="31" fill="#c08d5d" />
      <ellipse cx="60" cy="72" rx="21" ry="14.5" fill="#e3c49b" />
      <ellipse cx="54" cy="67" rx="2.6" ry="3.4" fill="#5d4028" transform="rotate(-18 54 67)" />
      <ellipse cx="66" cy="67" rx="2.6" ry="3.4" fill="#5d4028" transform="rotate(18 66 67)" />
      <path d="M60 71 V76 M60 76 C 57 79.5, 53 79, 52 76.5 M60 76 C 63 79.5, 67 79, 68 76.5"
        stroke="#5d4028" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="43" cy="53" r="4" fill="#2f2118" />
      <circle cx="77" cy="53" r="4" fill="#2f2118" />
      <circle cx="44.3" cy="51.7" r="1.3" fill="#fff" />
      <circle cx="78.3" cy="51.7" r="1.3" fill="#fff" />
      <ellipse cx="34" cy="63" rx="5" ry="3.4" fill="#f2a7a0" opacity="0.55" />
      <ellipse cx="86" cy="63" rx="5" ry="3.4" fill="#f2a7a0" opacity="0.55" />
    </svg>
  );

  /* ---------- Kupu-kupu ---------- */
  const Butterfly = ({ size = 96 }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="bfwU" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f9a8d4" /><stop offset="1" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="bfwL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <g className="wing-l">
        <path d="M57 54 C 40 26, 6 32, 14 58 C 19 75, 43 73, 57 65 Z" fill="url(#bfwU)" stroke="#a855f7" strokeWidth="2" />
        <path d="M57 68 C 40 68, 25 82, 35 96 C 43 106, 55 93, 57 80 Z" fill="url(#bfwL)" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="30" cy="50" r="4.5" fill="#fff" opacity="0.75" />
        <circle cx="42" cy="60" r="2.6" fill="#fff" opacity="0.6" />
        <circle cx="41" cy="86" r="3" fill="#fff" opacity="0.7" />
      </g>
      <g className="wing-r">
        <path d="M63 54 C 80 26, 114 32, 106 58 C 101 75, 77 73, 63 65 Z" fill="url(#bfwU)" stroke="#a855f7" strokeWidth="2" />
        <path d="M63 68 C 80 68, 95 82, 85 96 C 77 106, 65 93, 63 80 Z" fill="url(#bfwL)" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="90" cy="50" r="4.5" fill="#fff" opacity="0.75" />
        <circle cx="78" cy="60" r="2.6" fill="#fff" opacity="0.6" />
        <circle cx="79" cy="86" r="3" fill="#fff" opacity="0.7" />
      </g>
      <path d="M56 38 C 52 30, 46 27, 43 29" stroke="#6b4f3a" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M64 38 C 68 30, 74 27, 77 29" stroke="#6b4f3a" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="42" cy="29" r="2.6" fill="#6b4f3a" />
      <circle cx="78" cy="29" r="2.6" fill="#6b4f3a" />
      <ellipse cx="60" cy="72" rx="7" ry="24" fill="#7c5a41" />
      <ellipse cx="60" cy="72" rx="3.4" ry="19" fill="#96704f" opacity="0.7" />
      <circle cx="60" cy="43" r="9" fill="#7c5a41" />
      <circle cx="56.5" cy="42" r="1.9" fill="#2f2118" />
      <circle cx="63.5" cy="42" r="1.9" fill="#2f2118" />
      <circle cx="57.1" cy="41.4" r="0.7" fill="#fff" />
      <circle cx="64.1" cy="41.4" r="0.7" fill="#fff" />
      <path d="M57.5 47 C 59 48.6, 61 48.6, 62.5 47" stroke="#2f2118" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="52.6" cy="45.6" rx="2" ry="1.3" fill="#f2a7a0" opacity="0.7" />
      <ellipse cx="67.4" cy="45.6" rx="2" ry="1.3" fill="#f2a7a0" opacity="0.7" />
    </svg>
  );

  /* ---------- Kucing ---------- */
  const Cat = ({ size = 96 }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <path d="M92 100 C 108 98, 112 82, 102 74" stroke="#9aa3b2" strokeWidth="9" strokeLinecap="round" />
      <ellipse cx="60" cy="96" rx="33" ry="22" fill="#9aa3b2" />
      <ellipse cx="60" cy="100" rx="21" ry="14" fill="#e7ebf1" />
      <ellipse cx="47" cy="113" rx="7.5" ry="4.6" fill="#7d8798" />
      <ellipse cx="73" cy="113" rx="7.5" ry="4.6" fill="#7d8798" />
      <path d="M32 44 L28 20 L50 32 Z" fill="#9aa3b2" />
      <path d="M88 44 L92 20 L70 32 Z" fill="#9aa3b2" />
      <path d="M34 40 L32 27 L44 34 Z" fill="#f2a7a0" />
      <path d="M86 40 L88 27 L76 34 Z" fill="#f2a7a0" />
      <circle cx="60" cy="56" r="31" fill="#a8b0bd" />
      <path d="M42 54 C 45 49, 51 49, 54 54" stroke="#2f3542" strokeWidth="3" strokeLinecap="round" />
      <path d="M66 54 C 69 49, 75 49, 78 54" stroke="#2f3542" strokeWidth="3" strokeLinecap="round" />
      <path d="M57 64 L63 64 L60 68 Z" fill="#f2a7a0" />
      <path d="M60 68 V71 M60 71 C 57.5 74, 54 73, 53.5 70.5 M60 71 C 62.5 74, 66 73, 66.5 70.5"
        stroke="#2f3542" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 62 L24 59 M36 66 L24 67 M84 62 L96 59 M84 66 L96 67"
        stroke="#7d8798" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="40" cy="62" rx="4.6" ry="3" fill="#f2a7a0" opacity="0.6" />
      <ellipse cx="80" cy="62" rx="4.6" ry="3" fill="#f2a7a0" opacity="0.6" />
    </svg>
  );

  /* ---------- Penguin ---------- */
  const Penguin = ({ size = 96 }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <ellipse cx="22" cy="78" rx="9" ry="22" fill="#2c3648" transform="rotate(14 22 78)" />
      <ellipse cx="98" cy="78" rx="9" ry="22" fill="#2c3648" transform="rotate(-14 98 78)" />
      <ellipse cx="60" cy="70" rx="34" ry="42" fill="#38435a" />
      <ellipse cx="60" cy="76" rx="24" ry="32" fill="#f5f7fb" />
      <ellipse cx="48" cy="112" rx="9" ry="5" fill="#fb923c" />
      <ellipse cx="72" cy="112" rx="9" ry="5" fill="#fb923c" />
      <circle cx="48" cy="48" r="4.4" fill="#1f2430" />
      <circle cx="72" cy="48" r="4.4" fill="#1f2430" />
      <circle cx="49.4" cy="46.6" r="1.5" fill="#fff" />
      <circle cx="73.4" cy="46.6" r="1.5" fill="#fff" />
      <path d="M53 58 L67 58 L60 68 Z" fill="#fb923c" />
      <path d="M53 58 L67 58 L60 61.5 Z" fill="#fdba74" />
      <ellipse cx="39" cy="57" rx="4.4" ry="2.8" fill="#f2a7a0" opacity="0.55" />
      <ellipse cx="81" cy="57" rx="4.4" ry="2.8" fill="#f2a7a0" opacity="0.55" />
      <ellipse cx="53" cy="86" rx="6" ry="9" fill="#fff" opacity="0.5" />
    </svg>
  );

  /* ---------- Tunas (maskot merek) ---------- */
  const Sprout = ({ size = 96 }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <path d="M60 78 C 60 62, 58 52, 54 44" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" />
      <path d="M54 46 C 42 44, 34 34, 36 22 C 50 22, 58 32, 56 45 Z" fill="#4ade80" />
      <path d="M56 44 C 66 38, 78 40, 84 50 C 74 58, 62 56, 55 47 Z" fill="#22c55e" />
      <path d="M54 46 C 47 40, 42 32, 40 25" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
      <path d="M90 26 l2.2 5.8 5.8 2.2 -5.8 2.2 -2.2 5.8 -2.2-5.8 -5.8-2.2 5.8-2.2 Z" fill="#fde68a" />
      <circle cx="28" cy="52" r="2.6" fill="#a7f3d0" />
      <path d="M34 78 H86 L80 110 C 79.4 113, 77 115, 74 115 H46 C 43 115, 40.6 113, 40 110 Z" fill="#e08a5a" />
      <rect x="30" y="72" width="60" height="11" rx="5.5" fill="#c96f3f" />
      <circle cx="51" cy="93" r="3" fill="#5b3320" />
      <circle cx="69" cy="93" r="3" fill="#5b3320" />
      <circle cx="52" cy="92" r="1" fill="#fff" />
      <circle cx="70" cy="92" r="1" fill="#fff" />
      <path d="M55 100 C 58 103.5, 62 103.5, 65 100" stroke="#5b3320" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="43.5" cy="98.5" rx="3.6" ry="2.3" fill="#f2a7a0" opacity="0.7" />
      <ellipse cx="76.5" cy="98.5" rx="3.6" ry="2.3" fill="#f2a7a0" opacity="0.7" />
    </svg>
  );

  return { capybara: Capybara, butterfly: Butterfly, cat: Cat, penguin: Penguin, sprout: Sprout };
})();

// Render maskot berdasarkan id (fallback: kapibara)
NH.Mascot = function ({ id, size = 96, className = '' }) {
  const C = NH.Mascots[id] || NH.Mascots.capybara;
  return <div className={className}><C size={size} /></div>;
};

/* Kalimat gelembung ucapan (kontekstual)
   ctx: { hour, todayExp, dailyLim, hasTxns, overspent, saved } */
NH.mascotSpeech = function (ctx) {
  const h = ctx && ctx.hour != null ? ctx.hour : new Date().getHours();
  const pools = [];

  if (ctx && ctx.overspent) {
    pools.push([
      'Waduh, hari ini agak boros… besok lebih hemat yuk! 😅',
      'Nggak apa-apa, yang penting sadar. Aku tetap sayang kamu 🫶',
      'Limit harian lewat nih. Tarik napas, tahan dompetnya 🙈',
    ]);
  } else if (ctx && ctx.saved && ctx.hasTxns) {
    pools.push([
      'Hemat banget hari ini! Aku bangga sama kamu ✨',
      'Keren, pengeluaran masih di bawah batas. Lanjutkan! 💪',
      'Nabung mode: ON. Kamu hebat hari ini 🥰',
    ]);
  } else if (!ctx || !ctx.hasTxns) {
    pools.push([
      h < 11 ? 'Pagi! Jangan lupa catat sarapanmu ya 🍳' :
      h < 19 ? 'Hai! Ada pengeluaran hari ini? Catat yuk ✍️' :
      'Malam! Tutup hari dengan catat pengeluaranmu 🌙',
      'Aku di sini nemenin kamu atur uang 🌱',
      'Klik aku lagi kalau butuh semangat ✨',
    ]);
  } else {
    pools.push([
      'Kamu sedang di jalur yang benar. Terus gitu ya! 🌱',
      'Catat sedikit-sedikit, lama-lama kelihatan polanya 📊',
      'Uang yang dicatat = uang yang terkendali 😎',
      h < 11 ? 'Semangat pagi! Rezeki lancar hari ini 🍀' :
      h < 19 ? 'Jangan lupa minum air ya, sambil catat pengeluaran 💧' :
      'Hampir tutup hari. Kamu sudah melakukan yang terbaik 🌙',
    ]);
  }
  const pool = pools[0];
  return pool[Math.floor(Math.random() * pool.length)];
};

/* ############################################################
   BAGIAN 3 — KOMPONEN BERSAMA
   ############################################################ */
NH.UI = (function () {
  const { useState, useRef, useEffect } = React;
  const { fmtC, evalAmt, triggerHaptic } = NH.utils;
  const I = NH.I;

  /* ===== Sheet: modal bawah (tutup via overlay, tombol ×, atau Esc) ===== */
  function Sheet({ close, title, children }) {
    useEffect(() => {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (e) => { if (e.key === 'Escape') close(); };
      window.addEventListener('keydown', onKey);
      return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
    }, []);
    return (
      <div className="sheet-overlay" onClick={close}>
        <div className="sheet sb-hide" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-handle" />
          <div className="sheet-head">
            <h2 className="sheet-title">{title}</h2>
            <button className="sheet-close" onClick={close} aria-label="Tutup"><I.X size={18} /></button>
          </div>
          <div className="sheet-body">{children}</div>
        </div>
      </div>
    );
  }

  /* ===== Toast ===== */
  function Toasts({ toasts }) {
    if (!toasts.length) return null;
    const ic = { ok: '✅', info: 'ℹ️', error: '⚠️' };
    return (
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{ic[t.type] || 'ℹ️'}</span>
            <span className="grow">{t.msg}</span>
          </div>
        ))}
      </div>
    );
  }

  /* ===== Splash & skeleton ===== */
  function Splash({ text }) {
    return (
      <div className="splash">
        <div className="spinner spin" />
        <p className="dim sm">{text || 'Memuat NataHidup...'}</p>
      </div>
    );
  }
  function DashSkel() {
    return (
      <div className="stack">
        <div className="skeleton" style={{ height: 44 }} />
        <div className="skeleton" style={{ height: 180, borderRadius: 24 }} />
        <div className="skeleton" style={{ height: 96 }} />
        <div className="skeleton" style={{ height: 160 }} />
      </div>
    );
  }

  /* ===== Swipe to delete ===== */
  function SwipeItem({ children, onDel }) {
    const [off, setOff] = useState(0);
    const [drag, setDrag] = useState(false);
    const sx = useRef(0);
    const sy = useRef(0);
    const lock = useRef(null); // 'x' | 'y' | null — biar tidak bentrok scroll vertikal
    const TH = 74;
    const ts = (e) => { sx.current = e.touches[0].clientX; sy.current = e.touches[0].clientY; lock.current = null; setDrag(true); };
    const tm = (e) => {
      if (!drag) return;
      const dx = e.touches[0].clientX - sx.current;
      const dy = e.touches[0].clientY - sy.current;
      if (lock.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8))
        lock.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (lock.current !== 'x') return;
      if (dx < 0) setOff(Math.max(dx, -TH - 30));
    };
    const te = () => { setDrag(false); setOff((o) => (o < -TH ? -TH : 0)); };
    return (
      <div className="swipe-wrap">
        <div className="swipe-bg">
          <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); onDel(); }}>
            <I.Trash size={13} /> Hapus
          </button>
        </div>
        <div className={`swipe-fg ${drag ? 'dragging' : ''}`} style={{ transform: `translateX(${off}px)` }}
          onTouchStart={ts} onTouchMove={tm} onTouchEnd={te} onTouchCancel={te}>
          {children}
        </div>
      </div>
    );
  }

  /* ===== Badge kategori ===== */
  function CatBadge({ cat, size = 'md' }) {
    const letter = (cat && cat.name ? cat.name.charAt(0) : '?').toUpperCase();
    return (
      <div className={`cat-badge ${size}`} style={{ backgroundColor: (cat && cat.color) || 'var(--faint)' }}>
        {letter}
      </div>
    );
  }

  /* ===== Segmented control ===== */
  function Segmented({ items, value, onChange, className = '' }) {
    return (
      <div className={`seg ${className}`}>
        {items.map((it) => (
          <button key={it.id} type="button"
            className={`${value === it.id ? 'active' : ''} ${it.cls || ''}`}
            onClick={() => onChange(it.id)}>
            {it.label}
          </button>
        ))}
      </div>
    );
  }

  /* ===== Empty state ===== */
  function EmptyState({ icon, title, sub, action }) {
    return (
      <div className="empty-state">
        <div className="empty-ic">{icon || <I.Sparkle size={26} />}</div>
        <p className="empty-title">{title}</p>
        {sub && <p className="empty-sub">{sub}</p>}
        {action && <div style={{ marginTop: 14 }}>{action}</div>}
      </div>
    );
  }

  /* ===== Progress bar ===== */
  function Progress({ pct, tone, thin }) {
    const t = tone || (pct >= 100 ? 'bar-red' : pct >= 70 ? 'bar-amber' : 'bar-green');
    return (
      <div className={`progress ${thin ? 'thin' : ''}`}>
        <div className={`bar ${t}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
    );
  }

  /* ===== Switch ===== */
  function Switch({ on, onChange, label, sub }) {
    return (
      <div className="row gap-3" style={{ justifyContent: 'space-between', padding: '4px 0', cursor: 'pointer' }}
        onClick={() => { triggerHaptic(10); onChange(!on); }}>
        <div className="grow">
          {label && <p className="sm bold">{label}</p>}
          {sub && <p className="xs faint" style={{ marginTop: 2 }}>{sub}</p>}
        </div>
        <div className={`switch ${on ? 'on' : ''}`} />
      </div>
    );
  }

  /* ===== Search box dengan tombol bersihkan ===== */
  function SearchBox({ value, onChange, placeholder }) {
    return (
      <div className="search-box">
        <span className="ic"><I.Search size={16} /></span>
        <input type="text" placeholder={placeholder || 'Cari...'} value={value}
          onChange={(e) => onChange(e.target.value)} style={value ? { paddingRight: 38 } : undefined} />
        {value !== '' && (
          <button type="button" className="search-clear" onClick={() => onChange('')} aria-label="Bersihkan pencarian">
            <I.X size={14} />
          </button>
        )}
      </div>
    );
  }

  /* ============================================================
     Numpad kalkulator dalam-aplikasi
     - Tanpa keyboard HP: 0-9 . + − × ÷ ⌫
     - Chip nominal cepat (5rb…100rb)
     - Evaluasi ekspresi live ("50000+12000" = Rp 62.000)
     ============================================================ */
  const QUICK = [5000, 10000, 20000, 50000, 100000];
  const OPS = ['+', '−', '×', '÷'];

  function AmountKeypad({ value, onChange, quick = true, compact = false }) {
    const v = String(value || '');
    const isOp = (ch) => OPS.includes(ch);

    const press = (k) => {
      triggerHaptic(8);
      let nv = v;
      if (k === 'back') {
        nv = v.slice(0, -1);
      } else if (isOp(k)) {
        if (!v) return;                       // tidak mulai dengan operator
        if (isOp(v.slice(-1)) || v.endsWith('.')) nv = v.slice(0, -1) + k;
        else nv = v + k;
      } else if (k === '.') {
        const seg = v.split(/[+\−×÷]/).pop() || '';
        if (seg.includes('.')) return;        // satu titik per segmen
        nv = (v === '' ? '0' : v) + '.';
      } else {
        // digit
        if (v === '0') nv = k;                // ganti nol di depan
        else nv = v + k;
        if (nv.replace(/\D/g, '').length > 15) return;
      }
      onChange(nv);
    };

    const addQuick = (n) => {
      triggerHaptic(8);
      if (!v) { onChange(String(n)); return; }
      if (isOp(v.slice(-1))) onChange(v + n);
      else onChange(v + '+' + n);
    };

    const clearAll = () => { triggerHaptic(12); onChange(''); };

    // tampilan: angka polos diformat ribuan; ekspresi ditampilkan apa adanya
    const pretty = (() => {
      if (!v) return '0';
      if (OPS.some((o) => v.includes(o))) return v;
      const n = parseFloat(v.replace(/[^\d.]/g, ''));
      if (isNaN(n)) return v;
      const [ip, dp] = v.split('.');
      const fmtIp = Number(ip || '0').toLocaleString('id-ID');
      return dp !== undefined ? `${fmtIp}.${dp}` : (/\.$/.test(v) ? fmtIp + '.' : fmtIp);
    })();

    const result = OPS.some((o) => v.includes(o)) ? evalAmt(v) : NaN;
    const showResult = !isNaN(result);

    const key = (k, cls = '', label) => (
      <button type="button" key={k} className={cls} onClick={() => press(k)} aria-label={label || k}>
        {label || k}
      </button>
    );

    return (
      <div>
        <div className="amount-display focused">
          {v.length > 0 && <button type="button" className="amount-clear" onClick={clearAll}>C</button>}
          <div className="amount-value"><span className="rp">Rp</span>{pretty}</div>
          <div className="amount-result">{showResult ? `= ${fmtC(result)}` : '\u00A0'}</div>
        </div>

        {quick && (
          <div className="quick-chips sb-hide" style={{ margin: '10px 0 4px' }}>
            {QUICK.map((n) => (
              <button type="button" key={n} className="chip" onClick={() => addQuick(n)}>
                + {n / 1000}rb
              </button>
            ))}
          </div>
        )}

        <div className="numpad" style={compact ? { gap: 6 } : undefined}>
          {key('7')}{key('8')}{key('9')}{key('back', 'del', <I.Backspace size={20} />)}
          {key('4')}{key('5')}{key('6')}{key('+', 'op')}
          {key('1')}{key('2')}{key('3')}{key('−', 'op')}
          {key('0')}{key('.', 'fn', '.')}
          {key('×', 'op')}{key('÷', 'op')}
        </div>
      </div>
    );
  }

  return { Sheet, Toasts, Splash, DashSkel, SwipeItem, CatBadge, Segmented, EmptyState, Progress, Switch, SearchBox, AmountKeypad, QUICK };
})();
