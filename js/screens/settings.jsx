/* ============================================================
   NataHidup V2 — Layar Pengaturan
   Akun, Tampilan (tema + maskot), kategori, data cloud,
   info OCR offline, statistik, tentang. (Streak DIJEDA di V2.)
   ============================================================ */
window.NH = window.NH || {};

NH.Settings = (function () {
  const { useState, useEffect } = React;
  const { fmtC, getToday, triggerHaptic, escCsv } = NH.utils;
  const { Switch, CatBadge } = NH.UI;
  const { APP_NAME, APP_VERSION, THEMES, MASCOTS } = NH.config;
  const { sb } = NH.db;
  const Mascot = NH.Mascot;
  const I = NH.I;

  /* ===== Editor kategori inline ===== */
  function CatEditor({ cats, addCat, delCat, type }) {
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const add = async () => {
      if (!name.trim() || busy) return;
      setBusy(true);
      const ok = await addCat(name, type);
      setBusy(false);
      if (ok) setName('');
    };
    return (
      <div>
        <p className="xs bold dim" style={{ marginBottom: 8 }}>{type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</p>
        <div className="row gap-2" style={{ flexWrap: 'wrap', marginBottom: 10 }}>
          {cats.map((c) => (
            <span key={c.id} className="chip" style={{ paddingRight: 6 }}>
              <span className="dot" style={{ background: c.color }} />
              {c.name}
              <button onClick={() => delCat(c.id)} aria-label="Hapus kategori"
                style={{ color: 'var(--faint)', display: 'flex', padding: 2, marginLeft: 2 }}>
                <I.X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="row gap-2">
          <input type="text" placeholder="Nama kategori baru..." value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()} className="grow sm" />
          <button className="btn btn-primary btn-sm" disabled={busy || !name.trim()} onClick={add}>{busy ? '...' : <I.Plus size={15} />}</button>
        </div>
      </div>
    );
  }

  return function SettingsScreen(p) {
    const {
      user, wallets, txns, notes, todos, debts, expCats, incCats,
      addCat, delCat, theme, setThemeId, mascotId, setMascotId,
      hideBal, setHideBal, onRefresh,
    } = p;

    const [isInstalled, setIsInstalled] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone)
        setIsInstalled(true);
    }, []);

    const handleInstall = async () => {
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        await window.deferredPrompt.userChoice;
        window.deferredPrompt = null;
      } else {
        alert('Untuk menginstall: buka menu browser (titik tiga) → "Install App" atau "Tambahkan ke Layar Utama".');
      }
    };

    const refresh = async () => {
      if (busy) return;
      setBusy(true);
      await onRefresh();
      setBusy(false);
    };

    const dlReport = () => {
      if (!txns.length) { alert('Belum ada transaksi untuk dilaporkan.'); return; }
      const allC = [...expCats, ...incCats];
      const catName = (id) => { const c = allC.find((x) => x.id === id); return c ? c.name : (id || '-'); };
      const wName = (id) => { const w = wallets.find((x) => x.id === id); return w ? w.name : '-'; };
      const rows = [['Tanggal', 'Tipe', 'Kategori', 'Dompet', 'Jumlah', 'Catatan']];
      [...txns].sort((a, b) => String(a.date).localeCompare(String(b.date))).forEach((t) => {
        const dompet = t.type === 'transfer' ? (wName(t.transferFrom) + ' -> ' + wName(t.transferTo)) : wName(t.walletId);
        rows.push([t.date, t.type, t.type === 'transfer' ? 'Transfer' : catName(t.category), dompet, t.amount, (t.note || '').replace(/\r?\n/g, ' ')]);
      });
      const csv = '\uFEFF' + rows.map((r) => r.map(escCsv).join(';')).join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u; a.download = `natahidup-laporan-${getToday()}.csv`; a.click();
      URL.revokeObjectURL(u);
    };

    const signOut = async () => { if (confirm('Keluar dari akun ini?')) await sb.auth.signOut(); };

    return (
      <div className="stack anim-page">
        <div className="page-head">
          <h1 className="page-title">Pengaturan</h1>
          <p className="page-sub">Sesuaikan NataHidup dengan gayamu</p>
        </div>

        {/* ===== Identitas aplikasi ===== */}
        <div className="card center" style={{ padding: 22 }}>
          <div className="auth-logo" style={{ width: 60, height: 60, fontSize: 28, marginBottom: 12 }}>🌱</div>
          <h2 className="lg" style={{ fontWeight: 800 }}>{APP_NAME} <span className="accent">V2</span></h2>
          <p className="xs faint" style={{ marginTop: 3 }}>v{APP_VERSION} · Online · Supabase Cloud</p>
        </div>

        {/* ===== Akun ===== */}
        <div className="card">
          <h3 className="section-title"><span className="icon"><I.Cloud size={16} /></span> Akun</h3>
          <div className="row gap-3" style={{ background: 'var(--surface2)', borderRadius: 16, padding: 12 }}>
            <span className="cat-badge md" style={{ background: 'var(--accent)' }}>
              {String(user.email || '?').charAt(0).toUpperCase()}
            </span>
            <div className="grow">
              <p className="sm bold truncate">{user.email}</p>
              <p className="xs green row gap-1"><I.Cloud size={11} /> Data tersinkron ke cloud</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 12 }} onClick={signOut}>
            <I.Logout size={15} /> Keluar (Sign Out)
          </button>
        </div>

        {!isInstalled && (
          <button className="btn btn-primary btn-block" style={{ padding: 15 }} onClick={handleInstall}>
            <I.DL size={16} /> Install App ke Homescreen
          </button>
        )}

        {/* ===== Tampilan: tema + maskot ===== */}
        <div className="card">
          <h3 className="section-title"><span className="icon"><I.Palette size={16} /></span> Tampilan</h3>
          <p className="xs dim" style={{ marginBottom: 10 }}>Tema warna</p>
          <div className="theme-grid" style={{ marginBottom: 18 }}>
            {THEMES.map((t) => (
              <button key={t.id} className={`theme-opt ${theme === t.id ? 'active' : ''}`}
                onClick={() => { triggerHaptic(10); setThemeId(t.id); }}>
                <span className="theme-swatch" style={{ background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]})` }} />
                <span className="nm">{t.name}</span>
              </button>
            ))}
          </div>
          <p className="xs dim" style={{ marginBottom: 10 }}>Karakter di kartu saldo</p>
          <div className="mascot-row sb-hide">
            {MASCOTS.map((m) => (
              <button key={m.id} className={`mascot-opt ${mascotId === m.id ? 'active' : ''}`}
                onClick={() => { triggerHaptic(10); setMascotId(m.id); }}>
                <Mascot id={m.id} size={44} />
                <span className="nm">{m.name}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <Switch on={hideBal} onChange={setHideBal}
              label="Sembunyikan nominal"
              sub="Ganti semua angka dengan ••• (mode privasi)" />
          </div>
        </div>

        {/* ===== Kategori ===== */}
        <div className="card">
          <h3 className="section-title"><span className="icon"><I.Sparkle size={16} /></span> Kategori</h3>
          <div className="col gap-4">
            <CatEditor cats={expCats} addCat={addCat} delCat={delCat} type="expense" />
            <CatEditor cats={incCats} addCat={addCat} delCat={delCat} type="income" />
          </div>
        </div>

        {/* ===== Data cloud ===== */}
        <div className="card col gap-2">
          <h3 className="section-title"><span className="icon"><I.Cloud size={16} /></span> Data Cloud</h3>
          <button className="btn btn-soft btn-block" disabled={busy} onClick={refresh}>
            <I.Refresh size={15} className={busy ? 'spin' : ''} /> {busy ? 'Memuat ulang...' : 'Muat Ulang Data dari Server'}
          </button>
          <button className="btn btn-ghost btn-block" onClick={dlReport}>
            <I.FileText size={15} /> Unduh Laporan Transaksi (CSV)
          </button>
          <p className="xs faint" style={{ marginTop: 6 }}>
            Data tersimpan otomatis di cloud dan mengikuti akun ini di perangkat mana pun.
          </p>
        </div>

        {/* ===== OCR ===== */}
        <div className="card">
          <h3 className="section-title"><span className="icon"><I.Cam size={16} /></span> Scan Struk (OCR)</h3>
          <p className="xs dim" style={{ lineHeight: 1.6 }}>
            V2 memakai <b style={{ color: 'var(--text)' }}>mesin OCR offline</b> (Tesseract.js) — tanpa API pihak ketiga,
            tanpa kunci API, foto struk tidak pernah dikirim ke server mana pun.
            Model bahasa (~5 MB) diunduh sekali saat pertama dipakai, lalu tersimpan di perangkat.
          </p>
        </div>

        {/* ===== Statistik ===== */}
        <div className="card">
          <h3 className="section-title"><span className="icon"><I.Chart size={16} /></span> Statistik</h3>
          <div className="set-row"><span className="k">Transaksi</span><span className="v">{txns.length}</span></div>
          <div className="set-row"><span className="k">Catatan</span><span className="v">{notes.length}</span></div>
          <div className="set-row"><span className="k">To-Do</span><span className="v">{todos.length}</span></div>
          <div className="set-row"><span className="k">Hutang/Piutang</span><span className="v">{debts.length}</span></div>
          <div className="set-row"><span className="k">Dompet</span><span className="v">{wallets.length}</span></div>
        </div>

        {/* ===== Tentang ===== */}
        <div className="about-card">
          <h3 className="section-title"><span className="icon"><I.Info size={16} /></span> Tentang NataHidup V2</h3>
          <p>
            NataHidup lahir dari frustrasi yang sama seperti kamu: buka aplikasi keuangan malah stres,
            buka notes malah bingung. <b>Mengatur hidup tidak harus ribet.</b>
          </p>
          <p>
            V2 dirancang ulang total: mencatat pengeluaran cukup beberapa ketukan lewat <b>numpad dalam aplikasi</b>,
            scan struk berjalan <b>100% offline</b>, dan ada teman kecil di kartu saldomu yang
            menyemangati (bukan menghakimi).
          </p>
          <p>
            Fitur streak <b>dijeda sementara</b> — kami sedang merancangnya ulang agar lebih memotivasi,
            bukan mengintimidasi. Data transaksimu tetap aman dan tidak ada yang hilang. 🌱
          </p>
        </div>

        <p className="xs faint center" style={{ padding: '4px 0 12px' }}>
          {APP_NAME} V2 · v{APP_VERSION} · dibuat dengan ❤️ di Indonesia
        </p>
      </div>
    );
  };
})();
