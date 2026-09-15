/* ============================================================
   NataHidup V2 — Maskot karakter (SVG inline, tanpa aset外部)
   NH.Mascots.<id>  : komponen SVG (prop: size)
   NH.Mascot        : render maskot by id
   NH.mascotSpeech  : kalimat gelembung ucapan sesuai konteks
   Karakter tidak boleh menutupi angka saldo — posisi diatur CSS
   (.hero-mascot di components.css).
   ============================================================ */
window.NH = window.NH || {};

NH.Mascots = (function () {

  /* ---------- Kapibara (default) ---------- */
  const Capybara = ({ size = 96 }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* jeruk di kepala */}
      <circle cx="60" cy="24" r="9.5" fill="#fb923c" />
      <circle cx="56.5" cy="21" r="2.4" fill="#fdba74" opacity="0.8" />
      <path d="M60 14 C 60 10, 64 8, 67 9 C 66 12, 63 14, 60 14 Z" fill="#4ade80" />
      {/* badan */}
      <ellipse cx="60" cy="96" rx="37" ry="23" fill="#b57f52" />
      <ellipse cx="60" cy="100" rx="26" ry="15" fill="#c99a6b" opacity="0.65" />
      {/* kaki depan */}
      <ellipse cx="46" cy="112" rx="8" ry="5" fill="#96683f" />
      <ellipse cx="74" cy="112" rx="8" ry="5" fill="#96683f" />
      {/* telinga */}
      <circle cx="30" cy="42" r="8" fill="#8a5a3b" />
      <circle cx="30" cy="42" r="4" fill="#6d4529" />
      <circle cx="90" cy="42" r="8" fill="#8a5a3b" />
      <circle cx="90" cy="42" r="4" fill="#6d4529" />
      {/* kepala */}
      <ellipse cx="60" cy="60" rx="35" ry="31" fill="#c08d5d" />
      {/* moncong */}
      <ellipse cx="60" cy="72" rx="21" ry="14.5" fill="#e3c49b" />
      {/* hidung + mulut */}
      <ellipse cx="54" cy="67" rx="2.6" ry="3.4" fill="#5d4028" transform="rotate(-18 54 67)" />
      <ellipse cx="66" cy="67" rx="2.6" ry="3.4" fill="#5d4028" transform="rotate(18 66 67)" />
      <path d="M60 71 V76 M60 76 C 57 79.5, 53 79, 52 76.5 M60 76 C 63 79.5, 67 79, 68 76.5"
        stroke="#5d4028" strokeWidth="2.2" strokeLinecap="round" />
      {/* mata santai */}
      <circle cx="43" cy="53" r="4" fill="#2f2118" />
      <circle cx="77" cy="53" r="4" fill="#2f2118" />
      <circle cx="44.3" cy="51.7" r="1.3" fill="#fff" />
      <circle cx="78.3" cy="51.7" r="1.3" fill="#fff" />
      {/* pipi */}
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
      {/* sayap kiri */}
      <g className="wing-l">
        <path d="M57 54 C 40 26, 6 32, 14 58 C 19 75, 43 73, 57 65 Z" fill="url(#bfwU)" stroke="#a855f7" strokeWidth="2" />
        <path d="M57 68 C 40 68, 25 82, 35 96 C 43 106, 55 93, 57 80 Z" fill="url(#bfwL)" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="30" cy="50" r="4.5" fill="#fff" opacity="0.75" />
        <circle cx="42" cy="60" r="2.6" fill="#fff" opacity="0.6" />
        <circle cx="41" cy="86" r="3" fill="#fff" opacity="0.7" />
      </g>
      {/* sayap kanan */}
      <g className="wing-r">
        <path d="M63 54 C 80 26, 114 32, 106 58 C 101 75, 77 73, 63 65 Z" fill="url(#bfwU)" stroke="#a855f7" strokeWidth="2" />
        <path d="M63 68 C 80 68, 95 82, 85 96 C 77 106, 65 93, 63 80 Z" fill="url(#bfwL)" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="90" cy="50" r="4.5" fill="#fff" opacity="0.75" />
        <circle cx="78" cy="60" r="2.6" fill="#fff" opacity="0.6" />
        <circle cx="79" cy="86" r="3" fill="#fff" opacity="0.7" />
      </g>
      {/* antena */}
      <path d="M56 38 C 52 30, 46 27, 43 29" stroke="#6b4f3a" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M64 38 C 68 30, 74 27, 77 29" stroke="#6b4f3a" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="42" cy="29" r="2.6" fill="#6b4f3a" />
      <circle cx="78" cy="29" r="2.6" fill="#6b4f3a" />
      {/* badan */}
      <ellipse cx="60" cy="72" rx="7" ry="24" fill="#7c5a41" />
      <ellipse cx="60" cy="72" rx="3.4" ry="19" fill="#96704f" opacity="0.7" />
      {/* kepala */}
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
      {/* ekor */}
      <path d="M92 100 C 108 98, 112 82, 102 74" stroke="#9aa3b2" strokeWidth="9" strokeLinecap="round" />
      {/* badan */}
      <ellipse cx="60" cy="96" rx="33" ry="22" fill="#9aa3b2" />
      <ellipse cx="60" cy="100" rx="21" ry="14" fill="#e7ebf1" />
      <ellipse cx="47" cy="113" rx="7.5" ry="4.6" fill="#7d8798" />
      <ellipse cx="73" cy="113" rx="7.5" ry="4.6" fill="#7d8798" />
      {/* telinga */}
      <path d="M32 44 L28 20 L50 32 Z" fill="#9aa3b2" />
      <path d="M88 44 L92 20 L70 32 Z" fill="#9aa3b2" />
      <path d="M34 40 L32 27 L44 34 Z" fill="#f2a7a0" />
      <path d="M86 40 L88 27 L76 34 Z" fill="#f2a7a0" />
      {/* kepala */}
      <circle cx="60" cy="56" r="31" fill="#a8b0bd" />
      {/* mata tertutup senang ^ ^ */}
      <path d="M42 54 C 45 49, 51 49, 54 54" stroke="#2f3542" strokeWidth="3" strokeLinecap="round" />
      <path d="M66 54 C 69 49, 75 49, 78 54" stroke="#2f3542" strokeWidth="3" strokeLinecap="round" />
      {/* hidung + mulut */}
      <path d="M57 64 L63 64 L60 68 Z" fill="#f2a7a0" />
      <path d="M60 68 V71 M60 71 C 57.5 74, 54 73, 53.5 70.5 M60 71 C 62.5 74, 66 73, 66.5 70.5"
        stroke="#2f3542" strokeWidth="2" strokeLinecap="round" />
      {/* kumis */}
      <path d="M36 62 L24 59 M36 66 L24 67 M84 62 L96 59 M84 66 L96 67"
        stroke="#7d8798" strokeWidth="1.8" strokeLinecap="round" />
      {/* pipi */}
      <ellipse cx="40" cy="62" rx="4.6" ry="3" fill="#f2a7a0" opacity="0.6" />
      <ellipse cx="80" cy="62" rx="4.6" ry="3" fill="#f2a7a0" opacity="0.6" />
    </svg>
  );

  /* ---------- Penguin ---------- */
  const Penguin = ({ size = 96 }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* sayap */}
      <ellipse cx="22" cy="78" rx="9" ry="22" fill="#2c3648" transform="rotate(14 22 78)" />
      <ellipse cx="98" cy="78" rx="9" ry="22" fill="#2c3648" transform="rotate(-14 98 78)" />
      {/* badan */}
      <ellipse cx="60" cy="70" rx="34" ry="42" fill="#38435a" />
      <ellipse cx="60" cy="76" rx="24" ry="32" fill="#f5f7fb" />
      {/* kaki */}
      <ellipse cx="48" cy="112" rx="9" ry="5" fill="#fb923c" />
      <ellipse cx="72" cy="112" rx="9" ry="5" fill="#fb923c" />
      {/* mata */}
      <circle cx="48" cy="48" r="4.4" fill="#1f2430" />
      <circle cx="72" cy="48" r="4.4" fill="#1f2430" />
      <circle cx="49.4" cy="46.6" r="1.5" fill="#fff" />
      <circle cx="73.4" cy="46.6" r="1.5" fill="#fff" />
      {/* paruh */}
      <path d="M53 58 L67 58 L60 68 Z" fill="#fb923c" />
      <path d="M53 58 L67 58 L60 61.5 Z" fill="#fdba74" />
      {/* pipi */}
      <ellipse cx="39" cy="57" rx="4.4" ry="2.8" fill="#f2a7a0" opacity="0.55" />
      <ellipse cx="81" cy="57" rx="4.4" ry="2.8" fill="#f2a7a0" opacity="0.55" />
      {/* perut highlight */}
      <ellipse cx="53" cy="86" rx="6" ry="9" fill="#fff" opacity="0.5" />
    </svg>
  );

  /* ---------- Tunas (maskot merek 🌱) ---------- */
  const Sprout = ({ size = 96 }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* batang */}
      <path d="M60 78 C 60 62, 58 52, 54 44" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" />
      {/* daun */}
      <path d="M54 46 C 42 44, 34 34, 36 22 C 50 22, 58 32, 56 45 Z" fill="#4ade80" />
      <path d="M56 44 C 66 38, 78 40, 84 50 C 74 58, 62 56, 55 47 Z" fill="#22c55e" />
      <path d="M54 46 C 47 40, 42 32, 40 25" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
      {/* kilau */}
      <path d="M90 26 l2.2 5.8 5.8 2.2 -5.8 2.2 -2.2 5.8 -2.2-5.8 -5.8-2.2 5.8-2.2 Z" fill="#fde68a" />
      <circle cx="28" cy="52" r="2.6" fill="#a7f3d0" />
      {/* pot */}
      <path d="M34 78 H86 L80 110 C 79.4 113, 77 115, 74 115 H46 C 43 115, 40.6 113, 40 110 Z" fill="#e08a5a" />
      <rect x="30" y="72" width="60" height="11" rx="5.5" fill="#c96f3f" />
      {/* wajah di pot */}
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

/* ===== Kalimat gelembung ucapan (kontekstual) =====
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
