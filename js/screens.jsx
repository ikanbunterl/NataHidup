/* ============================================================
   NataHidup V2 — Layar Autentikasi
   Login / Daftar / Lupa password (Supabase Auth email+password).
   ============================================================ */
window.NH = window.NH || {};

NH.AuthScreen = (function () {
  const { useState } = React;
  const { sb } = NH.db;
  const { APP_NAME } = NH.config;
  const Mascot = NH.Mascot;
  const I = NH.I;

  const AUTH_ERR_MAP = {
    'Invalid login credentials': 'Email atau password salah.',
    'Email not confirmed': 'Email belum dikonfirmasi. Cek inbox/spam kamu, lalu coba lagi.',
    'User already registered': 'Email sudah terdaftar. Silakan masuk.',
    'Password should be at least 6 characters.': 'Password minimal 6 karakter.',
    'Unable to validate email address: invalid format': 'Format email tidak valid.',
    'For security purposes, you can only request this after 60 seconds.': 'Tunggu sebentar sebelum meminta ulang.',
    'Email rate limit exceeded': 'Terlalu banyak percobaan. Coba lagi beberapa menit.',
    'Email rate limit exceeded: reached hourly limit, try again later': 'Terlalu banyak percobaan. Coba lagi nanti.',
  };
  const authErr = (m) => {
    const s = String(m || '');
    if (AUTH_ERR_MAP[s]) return AUTH_ERR_MAP[s];
    const k = Object.keys(AUTH_ERR_MAP).find((key) => s.toLowerCase().includes(key.toLowerCase()));
    return k ? AUTH_ERR_MAP[k] : s;
  };

  return function AuthScreen() {
    const [mode, setMode] = useState('login'); // login | register | forgot
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [pw2, setPw2] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const [info, setInfo] = useState('');

    const switchMode = (m) => { setMode(m); setErr(''); setInfo(''); setPw(''); setPw2(''); };

    const login = async (e) => {
      e.preventDefault(); if (busy) return;
      setBusy(true); setErr(''); setInfo('');
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pw });
      setBusy(false);
      if (error) setErr(authErr(error.message));
    };

    const register = async (e) => {
      e.preventDefault(); if (busy) return;
      if (pw.length < 6) { setErr('Password minimal 6 karakter.'); return; }
      if (pw !== pw2) { setErr('Konfirmasi password tidak cocok.'); return; }
      setBusy(true); setErr(''); setInfo('');
      const { data, error } = await sb.auth.signUp({ email: email.trim(), password: pw });
      setBusy(false);
      if (error) { setErr(authErr(error.message)); return; }
      if (!(data && data.session))
        setInfo('Pendaftaran berhasil! Cek email kamu (termasuk folder spam) untuk konfirmasi akun, lalu masuk kembali.');
      else setInfo('Akun dibuat. Selamat datang! 🌱');
    };

    const resend = async () => {
      if (!email.trim()) { setErr('Isi email kamu dulu.'); return; }
      const { error } = await sb.auth.resend({ type: 'signup', email: email.trim() });
      if (error) { setErr(authErr(error.message)); return; }
      setInfo('Email konfirmasi dikirim ulang. Cek inbox/spam kamu.');
    };

    const reset = async (e) => {
      e.preventDefault(); if (busy) return;
      if (!email.trim()) { setErr('Isi email kamu dulu.'); return; }
      setBusy(true); setErr(''); setInfo('');
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.href });
      setBusy(false);
      if (error) { setErr(authErr(error.message)); return; }
      setInfo('Link reset password sudah dikirim ke email kamu.');
    };

    return (
      <div className="auth-wrap">
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div className="auth-logo">🌱</div>
          <h1 className="auth-title">{APP_NAME}</h1>
          <p className="auth-sub">Keuangan & produktivitas pribadi,<br />tersinkron aman di cloud</p>

          <div className="auth-card">
            {mode !== 'forgot' && (
              <div className="seg" style={{ marginBottom: 18 }}>
                <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Masuk</button>
                <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Daftar</button>
              </div>
            )}
            {err !== '' && <div className="form-msg error">{err}</div>}
            {info !== '' && <div className="form-msg info">{info}</div>}

            {mode === 'login' && (
              <form onSubmit={login} className="col gap-3">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                <input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
                <button type="submit" disabled={busy} className="btn btn-primary btn-block">
                  {busy ? <><span className="spinner spin" /> Memproses...</> : 'Masuk'}
                </button>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => switchMode('forgot')} className="xs dim" style={{ textDecoration: 'underline' }}>Lupa password?</button>
                  <button type="button" onClick={resend} className="xs dim" style={{ textDecoration: 'underline' }}>Kirim ulang email konfirmasi</button>
                </div>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={register} className="col gap-3">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                <input type="password" placeholder="Password (min. 6 karakter)" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" required />
                <input type="password" placeholder="Ulangi password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" required />
                <button type="submit" disabled={busy} className="btn btn-primary btn-block">
                  {busy ? <><span className="spinner spin" /> Memproses...</> : 'Buat Akun'}
                </button>
                <p className="xs faint center">Data kamu tersimpan di cloud Supabase dan bisa diakses dari perangkat mana pun dengan akun ini.</p>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={reset} className="col gap-3">
                <p className="xs dim">Masukkan email akunmu. Kami kirimkan link untuk mengatur password baru.</p>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                <button type="submit" disabled={busy} className="btn btn-primary btn-block">
                  {busy ? <><span className="spinner spin" /> Mengirim...</> : 'Kirim Link Reset'}
                </button>
                <button type="button" onClick={() => switchMode('login')} className="btn btn-ghost btn-block btn-sm">Kembali ke Login</button>
              </form>
            )}
          </div>

          <div className="row gap-2 anim-float" style={{ justifyContent: 'center', marginTop: 26, opacity: 0.9 }}>
            <Mascot id="capybara" size={64} />
          </div>
        </div>
      </div>
    );
  };
})();
/* ============================================================
   NataHidup V2 — Layar Beranda
   Hero saldo + maskot interaktif, ringkasan hari ini, aksi cepat,
   peringatan budget, transaksi & tugas terbaru.
   ============================================================ */
window.NH = window.NH || {};

NH.Home = (function () {
  const { useState, useRef, useMemo } = React;
  const { fmtC, fmtD, dayLabel, greeting, triggerHaptic } = NH.utils;
  const { CatBadge, Progress, DashSkel } = NH.UI;
  const Mascot = NH.Mascot;
  const I = NH.I;

  return function Home(p) {
    const {
      wallets, totalBal, mIncome, mExpense, remain, todayExp, todayTxns, recentTxns,
      todos, budgets, catSpend, allCats, openM, loading, dailyLim,
      hideBal, toggleHideBal, mascotId, mascotOn, setTab, togTodo, warnings,
    } = p;

    const [bubble, setBubble] = useState('');
    const bubbleTimer = useRef(null);

    const money = (v) => (hideBal ? 'Rp ••••••' : fmtC(v));

    const tapMascot = () => {
      triggerHaptic(15);
      const line = NH.mascotSpeech({
        hour: new Date().getHours(),
        todayExp, dailyLim,
        hasTxns: todayTxns.length > 0,
        overspent: dailyLim > 0 && todayExp > dailyLim,
        saved: dailyLim > 0 && todayExp > 0 && todayExp <= dailyLim * 0.7,
      });
      setBubble(line);
      clearTimeout(bubbleTimer.current);
      bubbleTimer.current = setTimeout(() => setBubble(''), 4000);
    };

    const pendTodos = useMemo(() => todos.filter((t) => !t.completed).slice(0, 3), [todos]);

    if (loading) return <DashSkel />;

    const now = new Date();
    const todayPct = dailyLim > 0 ? (todayExp / dailyLim) * 100 : 0;

    return (
      <div className="stack anim-page">
        {/* ===== Header ===== */}
        <div className="page-head row" style={{ justifyContent: 'space-between' }}>
          <div>
            <p className="dim xs bold">{now.toLocaleDateString('id-ID', { weekday: 'long' })}, {fmtD(now)}</p>
            <h1 className="page-title" style={{ marginTop: 2 }}>{greeting()} 👋</h1>
          </div>
          <button className="icon-round" onClick={() => setTab('settings')} aria-label="Pengaturan">
            <I.Gear size={17} />
          </button>
        </div>

        {/* ===== Kartu saldo + maskot ===== */}
        <div style={{ position: 'relative' }}>
          <div className="hero-card">
            <div className="row" style={{ justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
              <p className="hero-label">Total Saldo</p>
              <button className="hero-eye" onClick={toggleHideBal} aria-label="Sembunyikan saldo">
                {hideBal ? <I.EyeOff size={16} /> : <I.Eye size={16} />}
              </button>
            </div>
            <p className="hero-balance mono-num" style={{ position: 'relative', zIndex: 2 }}>{money(totalBal)}</p>

            {mascotOn && (
              <div className="hero-mascot anim-float" onClick={tapMascot} role="button" aria-label="Maskot">
                <Mascot id={mascotId} size={88} />
              </div>
            )}

            <div className="hero-stats">
              <div>
                <p className="hero-stat-label">Pemasukan bulan ini</p>
                <p className="hero-stat-value mono-num"><I.Up size={13} /> {money(mIncome)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="hero-stat-label">Pengeluaran bulan ini</p>
                <p className="hero-stat-value mono-num" style={{ justifyContent: 'flex-end' }}><I.Down size={13} /> {money(mExpense)}</p>
              </div>
            </div>
          </div>
          {mascotOn && bubble && <div className="mascot-bubble">{bubble}</div>}
        </div>

        {/* ===== Aksi cepat ===== */}
        <div className="row gap-2" style={{ justifyContent: 'space-between' }}>
          {[
            { ic: <I.Down size={18} />, l: 'Keluar', c: 'var(--red)', bg: 'var(--red-soft)', fn: () => openM('addTxn', { type: 'expense' }) },
            { ic: <I.Up size={18} />, l: 'Masuk', c: 'var(--green)', bg: 'var(--green-soft)', fn: () => openM('addTxn', { type: 'income' }) },
            { ic: <I.Cam size={18} />, l: 'Scan', c: 'var(--amber)', bg: 'var(--amber-soft)', fn: () => openM('scanReceipt') },
            { ic: <I.Transfer size={18} />, l: 'Transfer', c: 'var(--blue)', bg: 'var(--blue-soft)', fn: () => openM('addTxn', { type: 'transfer' }) },
          ].map((a) => (
            <button key={a.l} className="card card-flat grow"
              style={{ padding: '12px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}
              onClick={() => { triggerHaptic(); a.fn(); }}>
              <span style={{ width: 36, height: 36, borderRadius: 12, background: a.bg, color: a.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{a.ic}</span>
              <span className="xs bold dim">{a.l}</span>
            </button>
          ))}
        </div>

        {/* ===== Hari ini ===== */}
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 className="section-title" style={{ margin: 0 }}><span className="icon"><I.Target size={16} /></span> Pengeluaran Hari Ini</h3>
            <span className={`bold mono-num ${todayExp > dailyLim && dailyLim > 0 ? 'red' : ''}`}>{money(todayExp)}</span>
          </div>
          <Progress pct={todayPct} />
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
            <p className="xs faint">Limit harian: {dailyLim > 0 ? money(dailyLim) : 'belum diatur'}</p>
            {dailyLim > 0 && (
              todayExp > dailyLim
                ? <span className="status-pill over">Lewat batas</span>
                : todayPct >= 70
                  ? <span className="status-pill warn">Hampir habis</span>
                  : <span className="status-pill ok">Aman ✨</span>
            )}
          </div>
        </div>

        {/* ===== Peringatan budget (sesuai periode: bulanan/mingguan) ===== */}
        {warnings.length > 0 && (
          <div className="card">
            <h3 className="section-title" style={{ color: 'var(--amber)' }}><span className="icon"><I.Alert size={16} /></span> Peringatan Budget</h3>
            <div className="col gap-3">
              {warnings.map(({ b, spent }) => {
                const pct = Math.min(100, (spent / b.limit) * 100);
                const cat = allCats.find((c) => c.id === b.category) || { name: b.category, color: 'var(--faint)' };
                return (
                  <div key={b.id}>
                    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 5 }}>
                      <span className="row gap-2 sm bold"><CatBadge cat={cat} size="sm" /> {cat.name}
                        {b.period === 'weekly' && <span className="tag-pill">7 hari</span>}
                      </span>
                      <span className={`xs bold mono-num ${pct >= 100 ? 'red' : 'amber'}`}>{hideBal ? '•••' : `${fmtC(spent)} / ${fmtC(b.limit)}`}</span>
                    </div>
                    <Progress pct={pct} thin />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== Transaksi terbaru ===== */}
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 className="section-title" style={{ margin: 0 }}><span className="icon"><I.Clock size={16} /></span> Transaksi Terbaru</h3>
            <button className="xs bold accent" onClick={() => setTab('finance')}>Lihat semua →</button>
          </div>
          {recentTxns.length > 0 ? (
            <div className="col gap-2">
              {recentTxns.slice(0, 4).map((t) => {
                if (t.type === 'transfer') {
                  const fromW = wallets.find((w) => w.id === t.transferFrom);
                  const toW = wallets.find((w) => w.id === t.transferTo);
                  return (
                    <div key={t.id} className="row gap-3" style={{ padding: '5px 0' }}>
                      <span className="cat-badge sm" style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}><I.Transfer size={13} /></span>
                      <div className="grow">
                        <p className="sm bold truncate">Transfer</p>
                        <p className="xs faint truncate">{fromW ? fromW.name : '?'} → {toW ? toW.name : '?'} · {dayLabel(t.date)}</p>
                      </div>
                      <span className="sm bold blue mono-num">{hideBal ? '•••' : fmtC(t.amount)}</span>
                    </div>
                  );
                }
                const cat = allCats.find((c) => c.id === t.category) || { name: t.category || 'Umum', color: 'var(--faint)' };
                return (
                  <div key={t.id} className="row gap-3" style={{ padding: '5px 0' }} onClick={() => openM('txnDetail', t)}>
                    <CatBadge cat={cat} size="sm" />
                    <div className="grow">
                      <p className="sm bold truncate">{t.note || cat.name}</p>
                      <p className="xs faint truncate">{cat.name} · {dayLabel(t.date)}</p>
                    </div>
                    <span className={`sm bold mono-num ${t.type === 'income' ? 'green' : 'red'}`}>
                      {hideBal ? '•••' : `${t.type === 'income' ? '+' : '−'}${fmtC(t.amount)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '18px 8px' }}>
              <p className="empty-sub">Belum ada transaksi. Ketuk tombol <b className="accent">+</b> untuk mencatat.</p>
            </div>
          )}
        </div>

        {/* ===== Tugas hari ini ===== */}
        {pendTodos.length > 0 && (
          <div className="card">
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 className="section-title" style={{ margin: 0 }}><span className="icon"><I.Check size={16} /></span> Tugas ({todos.filter((t) => !t.completed).length})</h3>
              <button className="xs bold accent" onClick={() => setTab('notes')}>Semua →</button>
            </div>
            <div className="col gap-2">
              {pendTodos.map((t) => (
                <div key={t.id} className="row gap-3" style={{ padding: '4px 0' }}>
                  <button className="todo-check" onClick={() => togTodo(t.id)} aria-label="Selesaikan"><I.Check size={13} /></button>
                  <p className="sm grow truncate">{t.title}</p>
                  {t.deadline && <span className="xs faint">{fmtD(t.deadline)}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
})();
/* ============================================================
   NataHidup V2 — Layar Keuangan
   Sub-tab: Ringkasan (dompet, tren 6 bulan, kategori),
   Transaksi (cari + filter + swipe hapus), Budget, Hutang.
   ============================================================ */
window.NH = window.NH || {};

NH.Finance = (function () {
  const { useState, useMemo } = React;
  const { fmtC, fmtShort, fmtD, fmtT, dayLabel, getMY, getToday, triggerHaptic, spendForBudget } = NH.utils;
  const { Segmented, SwipeItem, CatBadge, Progress, EmptyState, DashSkel, SearchBox } = NH.UI;
  NH.WalletIcon;
  const I = NH.I;

  /* ===== Grafik tren 6 bulan (SVG-free, batang CSS) ===== */
  function TrendChart({ txns, hideBal }) {
    const months = useMemo(() => {
      const out = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        out.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('id-ID', { month: 'short' }), inc: 0, exp: 0 });
      }
      return out;
    }, []);
    useMemo(() => {
      months.forEach((m) => { m.inc = 0; m.exp = 0; });
      txns.forEach((t) => {
        if (t.type === 'transfer' || !t.date) return;
        const mk = t.date.slice(0, 7);
        const m = months.find((x) => x.key === mk);
        if (!m) return;
        if (t.type === 'income') m.inc += t.amount; else m.exp += t.amount;
      });
    }, [txns, months]);
    const max = Math.max(1, ...months.map((m) => Math.max(m.inc, m.exp)));
    const thisMK = getMY();
    return (
      <div>
        <div className="trend-chart">
          {months.map((m) => (
            <div key={m.key} className={`trend-col ${m.key === thisMK ? 'this-month' : ''}`}>
              <div className="trend-bars">
                <div className="trend-bar in" style={{ height: `${Math.max(3, (m.inc / max) * 100)}%` }} title={hideBal ? '' : fmtC(m.inc)} />
                <div className="trend-bar out" style={{ height: `${Math.max(3, (m.exp / max) * 100)}%` }} title={hideBal ? '' : fmtC(m.exp)} />
              </div>
              <span className="trend-label">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="row gap-3 xs faint" style={{ justifyContent: 'center', marginTop: 8 }}>
          <span className="row gap-1"><span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--green)', display: 'inline-block' }} /> Masuk</span>
          <span className="row gap-1"><span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--red)', display: 'inline-block' }} /> Keluar</span>
        </div>
      </div>
    );
  }

  /* ===== Ringkasan ===== */
  function FinOverview({ wallets, mIncome, mExpense, catSpend, allCats, txns, openM, hideBal }) {
    const money = (v) => (hideBal ? 'Rp ••••••' : fmtC(v));
    const totalExp = Object.values(catSpend).reduce((a, b) => a + b, 0);
    const chart = allCats.filter((c) => c.type === 'expense')
      .map((c) => ({ ...c, amt: catSpend[c.id] || 0, pct: totalExp > 0 ? ((catSpend[c.id] || 0) / totalExp) * 100 : 0 }))
      .filter((d) => d.amt > 0).sort((a, b) => b.amt - a.amt);
    const transferCount = txns.filter((t) => t.type === 'transfer' && t.date && t.date.startsWith(getMY())).length;

    return (
      <div className="stack">
        {/* Dompet */}
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 className="section-title" style={{ margin: 0 }}><span className="icon"><I.Wallet size={16} /></span> Dompet & Rekening</h3>
            <button className="xs bold accent" onClick={() => openM('addWallet')}>+ Tambah</button>
          </div>
          <div className="col gap-2">
            {wallets.map((w) => (
              <div key={w.id} className="wallet-row">
                <div className="row gap-3">
                  <span className="wallet-ic"><NH.WalletIcon type={w.type} /></span>
                  <div>
                    <p className="sm bold">{w.name}</p>
                    <p className="xs faint" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{w.type}</p>
                  </div>
                </div>
                <p className="bold sm mono-num">{money(w.balance)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Masuk/keluar bulan ini */}
        <div className="mini-grid">
          <div className="mini-card">
            <div className="mini-ic" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}><I.Up size={17} /></div>
            <p className="mini-label">Pemasukan</p>
            <p className="mini-value green mono-num">{money(mIncome)}</p>
          </div>
          <div className="mini-card">
            <div className="mini-ic" style={{ background: 'var(--red-soft)', color: 'var(--red)' }}><I.Down size={17} /></div>
            <p className="mini-label">Pengeluaran</p>
            <p className="mini-value red mono-num">{money(mExpense)}</p>
          </div>
        </div>

        {transferCount > 0 && (
          <div className="row gap-3 card" style={{ padding: 13 }}>
            <span className="mini-ic" style={{ margin: 0, background: 'var(--blue-soft)', color: 'var(--blue)' }}><I.Transfer size={16} /></span>
            <div>
              <p className="sm bold">{transferCount} transfer bulan ini</p>
              <p className="xs faint">Tidak dihitung sebagai pemasukan/pengeluaran</p>
            </div>
          </div>
        )}

        {/* Tren 6 bulan */}
        <div className="card">
          <h3 className="section-title"><span className="icon"><I.Chart size={16} /></span> Tren 6 Bulan</h3>
          <TrendChart txns={txns} hideBal={hideBal} />
        </div>

        {/* Kategori */}
        <div className="card">
          <h3 className="section-title"><span className="icon"><I.Target size={16} /></span> Pengeluaran per Kategori</h3>
          {chart.length > 0 ? (
            <div className="col gap-3">
              {chart.map((c) => (
                <div key={c.id}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 5 }}>
                    <span className="row gap-2 sm bold"><CatBadge cat={c} size="sm" /> {c.name}</span>
                    <span className="sm bold mono-num">{hideBal ? '•••' : fmtC(c.amt)}</span>
                  </div>
                  <div className="progress thin"><div className="bar" style={{ width: `${c.pct}%`, background: c.color }} /></div>
                  <p className="xs faint" style={{ marginTop: 3 }}>{c.pct.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="sm faint center" style={{ padding: '14px 0' }}>Belum ada pengeluaran bulan ini</p>
          )}
        </div>
      </div>
    );
  }

  /* ===== Daftar transaksi ===== */
  function TxnList({ txns, getCat, openM, delTxn, wallets, hideBal }) {
    const [filter, setFilter] = useState('all');
    const [q, setQ] = useState('');
    const filtered = useMemo(() => {
      let f = txns;
      if (filter !== 'all') f = f.filter((t) => t.type === filter);
      if (q.trim()) {
        const s = q.toLowerCase();
        f = f.filter((t) => (t.note || '').toLowerCase().includes(s) || (t.category || '').toLowerCase().includes(s));
      }
      return f;
    }, [txns, filter, q]);
    const grouped = useMemo(() => {
      const g = {};
      filtered.forEach((t) => { const k = t.date || 'tanpa-tanggal'; (g[k] = g[k] || []).push(t); });
      return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]));
    }, [filtered]);

    return (
      <div className="stack">
        <SearchBox value={q} onChange={setQ} placeholder="Cari catatan atau kategori..." />
        <div className="row gap-2 sb-hide" style={{ overflowX: 'auto' }}>
          {[{ id: 'all', l: 'Semua' }, { id: 'expense', l: 'Keluar' }, { id: 'income', l: 'Masuk' }, { id: 'transfer', l: 'Transfer' }].map((f) => (
            <button key={f.id} className={`chip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>{f.l}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<I.Wallet size={26} />}
            title={q.trim() ? `Tidak ditemukan: "${q}"` : 'Keuanganmu masih kosong'}
            sub={q.trim() ? 'Coba kata kunci lain.' : 'Yuk, catat pemasukan atau pengeluaran pertamamu!'}
          />
        ) : (
          grouped.map(([date, items]) => {
            const dayExp = items.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            return (
              <div key={date}>
                <div className="row" style={{ justifyContent: 'space-between', margin: '4px 2px 8px' }}>
                  <p className="xs bold dim">{dayLabel(date)}</p>
                  {!hideBal && dayExp > 0 && <p className="xs faint mono-num">−{fmtC(dayExp)}</p>}
                </div>
                <div className="col gap-2">
                  {items.map((t) => {
                    if (t.type === 'transfer') {
                      const fromW = wallets.find((w) => w.id === t.transferFrom);
                      const toW = wallets.find((w) => w.id === t.transferTo);
                      return (
                        <SwipeItem key={t.id} onDel={() => delTxn(t.id)}>
                          <div className="list-item" onClick={() => openM('txnDetail', t)}>
                            <span className="cat-badge md" style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}><I.Transfer size={16} /></span>
                            <div className="grow">
                              <p className="li-title">Transfer</p>
                              <p className="li-sub">{fromW ? fromW.name : '?'} → {toW ? toW.name : '?'} · {fmtT(t.createdAt)}</p>
                            </div>
                            <span className="li-amount blue mono-num">{hideBal ? '•••' : fmtC(t.amount)}</span>
                          </div>
                        </SwipeItem>
                      );
                    }
                    const cat = getCat(t.category) || { name: t.category || 'Umum', color: 'var(--faint)' };
                    return (
                      <SwipeItem key={t.id} onDel={() => delTxn(t.id)}>
                        <div className="list-item" onClick={() => openM('txnDetail', t)}>
                          <CatBadge cat={cat} />
                          <div className="grow">
                            <p className="li-title truncate">{t.note || cat.name}</p>
                            <p className="li-sub">
                              {cat.name}
                              {t.isRecurring && <span className="accent row gap-1"><I.Repeat size={11} /></span>}
                              <span>· {fmtT(t.createdAt)}</span>
                            </p>
                          </div>
                          <span className={`li-amount mono-num ${t.type === 'income' ? 'green' : 'red'}`}>
                            {hideBal ? '•••' : `${t.type === 'income' ? '+' : '−'}${fmtC(t.amount)}`}
                          </span>
                        </div>
                      </SwipeItem>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
        <p className="xs faint center" style={{ padding: '4px 0 8px' }}>Geser baris ke kiri untuk menghapus</p>
      </div>
    );
  }

  /* ===== Budget ===== */
  function BudgetView({ budgets, txns, allCats, openM, hideBal }) {
    const totalB = budgets.reduce((s, b) => s + b.limit, 0);
    const periodLabel = { weekly: 'Mingguan \u00b7 7 hari', monthly: 'Bulanan', custom: 'Custom' };
    return (
      <div className="stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <p className="xs dim bold">Total Budget</p>
            <p className="lg bold mono-num">{hideBal ? 'Rp ••••••' : fmtC(totalB)}</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => openM('editBudget')}>
            <I.Edit size={14} /> Atur Budget
          </button>
        </div>
        {budgets.length === 0 && (
          <EmptyState icon={<I.Target size={26} />} title="Belum ada budget" sub="Buat budget untuk mengontrol pengeluaran per kategori." />
        )}
        {budgets.map((b) => {
          const spent = spendForBudget(b, txns);
          const pct = b.limit > 0 ? Math.min(100, (spent / b.limit) * 100) : 0;
          const cat = allCats.find((c) => c.id === b.category) || { name: b.category, color: 'var(--faint)' };
          const over = pct >= 100, warn = pct >= 70 && !over;
          return (
            <div key={b.id} className="card" style={over ? { borderColor: 'var(--red)' } : undefined}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 9 }}>
                <span className="row gap-2 sm bold"><CatBadge cat={cat} size="sm" /> {cat.name}</span>
                <span className="row gap-1">
                  <span className="tag-pill">{periodLabel[b.period] || 'Bulanan'}</span>
                  {over && <span className="status-pill over">LEBIH</span>}
                  {warn && <span className="status-pill warn">Hampir</span>}
                </span>
              </div>
              <div className="row xs dim" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="mono-num">{hideBal ? '•••' : fmtC(spent)}</span>
                <span className="bold mono-num">{hideBal ? '•••' : fmtC(b.limit)}</span>
              </div>
              <Progress pct={pct} />
              <p className="xs faint" style={{ marginTop: 6 }}>
                Sisa: {hideBal ? '•••' : fmtC(Math.max(0, b.limit - spent))}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  /* ===== Hutang / piutang ===== */
  function DebtView({ debts, openM, tog, del, hideBal }) {
    const pending = debts.filter((d) => d.status === 'pending');
    const paid = debts.filter((d) => d.status === 'paid');
    const totalH = pending.filter((d) => d.dtype === 'hutang').reduce((s, d) => s + d.amount, 0);
    const totalP = pending.filter((d) => d.dtype === 'piutang').reduce((s, d) => s + d.amount, 0);
    const money = (v) => (hideBal ? '•••' : fmtC(v));
    const debtRow = (d, isPaid) => (
      <SwipeItem key={d.id} onDel={() => del(d.id)}>
        <div className="list-item" style={isPaid ? { opacity: 0.55 } : undefined} onClick={() => tog(d.id)}>
          <span className={`cat-badge md ${isPaid ? '' : ''}`}
            style={{ background: isPaid ? 'var(--surface3)' : d.dtype === 'hutang' ? 'var(--red-soft)' : 'var(--green-soft)', color: isPaid ? 'var(--faint)' : d.dtype === 'hutang' ? 'var(--red)' : 'var(--green)' }}>
            {isPaid ? <I.Check size={15} /> : <I.Handshake size={15} />}
          </span>
          <div className="grow">
            <p className={`li-title truncate ${isPaid ? 'todo-title done' : ''}`}>{d.name}</p>
            <p className="li-sub">
              {isPaid ? 'Lunas' : d.dtype === 'hutang' ? 'Kamu hutang' : 'Dihutang kamu'}
              {!isPaid && d.dueDate && <span>· JT: {fmtD(d.dueDate)}</span>}
            </p>
          </div>
          <span className={`li-amount mono-num ${isPaid ? 'faint' : d.dtype === 'hutang' ? 'red' : 'green'}`}>{money(d.amount)}</span>
        </div>
      </SwipeItem>
    );
    return (
      <div className="stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <p className="sm dim">Catat hutang & piutang</p>
          <button className="btn btn-primary btn-sm" onClick={() => openM('addDebt')}><I.Plus size={14} /> Tambah</button>
        </div>
        <div className="debt-summary">
          <div className="debt-card hutang">
            <p className="lbl">Hutang (kamu pinjam)</p>
            <p className="val mono-num">{money(totalH)}</p>
          </div>
          <div className="debt-card piutang">
            <p className="lbl">Piutang (dipinjam orang)</p>
            <p className="val mono-num">{money(totalP)}</p>
          </div>
        </div>
        {debts.length === 0 ? (
          <EmptyState icon={<I.Handshake size={26} />} title="Tidak ada catatan hutang" sub="Bersih! Pertahankan ya 🎉" />
        ) : (
          <>
            {pending.length > 0 && (
              <div>
                <p className="xs bold dim" style={{ margin: '2px 2px 8px' }}>Belum Lunas ({pending.length})</p>
                <div className="col gap-2">{pending.map((d) => debtRow(d, false))}</div>
              </div>
            )}
            {paid.length > 0 && (
              <div>
                <p className="xs bold dim" style={{ margin: '2px 2px 8px' }}>Lunas ({paid.length})</p>
                <div className="col gap-2">{paid.map((d) => debtRow(d, true))}</div>
              </div>
            )}
            <p className="xs faint center">Ketuk baris untuk mengubah status · geser kiri untuk menghapus</p>
          </>
        )}
      </div>
    );
  }

  /* ===== Layar utama Keuangan ===== */
  return function Finance(p) {
    const [sub, setSub] = useState('overview');
    if (p.loading) return <DashSkel />;
    return (
      <div className="stack anim-page">
        <div className="page-head">
          <h1 className="page-title">Keuangan</h1>
          <p className="page-sub">Kelola uangmu dengan tenang</p>
        </div>
        <Segmented
          items={[{ id: 'overview', label: 'Ringkasan' }, { id: 'transactions', label: 'Transaksi' }, { id: 'budget', label: 'Budget' }, { id: 'debts', label: 'Hutang' }]}
          value={sub} onChange={(v) => { triggerHaptic(8); setSub(v); }} className="sm"
        />
        {sub === 'overview' && <FinOverview wallets={p.wallets} mIncome={p.mIncome} mExpense={p.mExpense} catSpend={p.catSpend} allCats={p.allCats} txns={p.txns} openM={p.openM} hideBal={p.hideBal} />}
        {sub === 'transactions' && <TxnList txns={p.txns} getCat={p.getCat} openM={p.openM} delTxn={p.delTxn} wallets={p.wallets} hideBal={p.hideBal} />}
        {sub === 'budget' && <BudgetView budgets={p.budgets} txns={p.txns} allCats={p.allCats} openM={p.openM} hideBal={p.hideBal} />}
        {sub === 'debts' && <DebtView debts={p.debts} openM={p.openM} tog={p.togDebt} del={p.delDebt} hideBal={p.hideBal} />}
      </div>
    );
  };
})();
/* ============================================================
   NataHidup V2 — Layar Catatan & To-Do
   ============================================================ */
window.NH = window.NH || {};

NH.Notes = (function () {
  const { useState, useMemo } = React;
  const { fmtC, fmtD, triggerHaptic } = NH.utils;
  const { Segmented, SwipeItem, EmptyState, DashSkel, SearchBox } = NH.UI;
  const I = NH.I;

  /* ===== Form cepat tambah tugas ===== */
  function TodoQuick({ add }) {
    const [t, setT] = useState('');
    const [deadline, setDeadline] = useState('');
    const [budget, setBudget] = useState('');
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
      e.preventDefault();
      if (!t.trim() || busy) return;
      setBusy(true);
      const ok = await add({ title: t.trim(), deadline: deadline || null, budget: parseFloat(budget) || 0 });
      setBusy(false);
      if (ok !== false) { setT(''); setDeadline(''); setBudget(''); }
    };

    if (!open) {
      return (
        <button className="card card-flat row gap-3" style={{ width: '100%', padding: 14, border: '1.5px dashed var(--border-strong)' }}
          onClick={() => setOpen(true)}>
          <span className="mini-ic" style={{ margin: 0, background: 'var(--accent-soft)', color: 'var(--accent)' }}><I.Plus size={16} /></span>
          <span className="sm bold dim">Tambah tugas baru...</span>
        </button>
      );
    }
    return (
      <form onSubmit={submit} className="card col gap-2 anim-pop">
        <div className="row gap-2">
          <input type="text" placeholder="Mau mengerjakan apa?" value={t} onChange={(e) => setT(e.target.value)} autoFocus className="grow" />
          <button type="submit" disabled={busy || !t.trim()} className="btn btn-primary" style={{ padding: '12px 16px' }}>{busy ? <span className="spinner spin" /> : <I.Plus size={16} />}</button>
        </div>
        <div className="row gap-2">
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="grow xs" />
          <input type="number" inputMode="numeric" min="0" placeholder="Est. biaya (Rp)" value={budget} onChange={(e) => setBudget(e.target.value)} className="grow xs" />
        </div>
        <button type="button" className="xs faint" style={{ alignSelf: 'flex-start' }} onClick={() => setOpen(false)}>Tutup</button>
      </form>
    );
  }

  function TodoItem({ t, tog }) {
    return (
      <div className="list-item" style={{ cursor: 'default' }}>
        <button className={`todo-check ${t.completed ? 'done' : ''}`} onClick={() => tog(t.id)} aria-label="Toggle">
          <I.Check size={13} />
        </button>
        <div className="grow">
          <p className={`sm ${t.completed ? 'todo-title done' : 'bold'}`}>{t.title}</p>
          <div className="row gap-2" style={{ marginTop: 3 }}>
            {t.deadline && <span className="xs faint row gap-1"><I.Cal size={11} /> {fmtD(t.deadline)}</span>}
            {t.budget > 0 && <span className="xs accent bold">Est: {fmtC(t.budget)}</span>}
          </div>
        </div>
      </div>
    );
  }

  return function NotesScreen(p) {
    const { notes, todos, addNote, updNote, delNote, addTodo, togTodo, delTodo, openM, loading } = p;
    const [sub, setSub] = useState('notes');
    const [q, setQ] = useState('');
    const [tag, setTag] = useState('all');

    const allTags = useMemo(() => {
      const s = new Set();
      notes.forEach((n) => (n.tags || []).forEach((t) => s.add(t)));
      return ['all', ...Array.from(s)];
    }, [notes]);

    const filtered = useMemo(() => {
      let f = notes;
      if (q) f = f.filter((n) => n.title.toLowerCase().includes(q.toLowerCase()) || n.content.toLowerCase().includes(q.toLowerCase()));
      if (tag !== 'all') f = f.filter((n) => (n.tags || []).includes(tag));
      return [...f].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.updatedAt) - new Date(a.updatedAt));
    }, [notes, q, tag]);

    const pend = todos.filter((t) => !t.completed);
    const done = todos.filter((t) => t.completed);

    if (loading) return <DashSkel />;

    return (
      <div className="stack anim-page">
        <div className="page-head">
          <h1 className="page-title">Catatan</h1>
          <p className="page-sub">Tulis dan atur semuanya di sini</p>
        </div>
        <Segmented
          items={[{ id: 'notes', label: `Catatan (${notes.length})` }, { id: 'todos', label: `To-Do (${pend.length})` }]}
          value={sub} onChange={(v) => { triggerHaptic(8); setSub(v); }}
        />

        {sub === 'notes' && (
          <div className="stack">
            <SearchBox value={q} onChange={setQ} placeholder="Cari catatan..." />
            {allTags.length > 1 && (
              <div className="row gap-2 sb-hide" style={{ overflowX: 'auto' }}>
                {allTags.map((t) => (
                  <button key={t} className={`chip ${tag === t ? 'active' : ''}`} onClick={() => setTag(t)}>
                    {t === 'all' ? 'Semua' : `#${t}`}
                  </button>
                ))}
              </div>
            )}
            <button className="btn btn-soft btn-block btn-sm" onClick={() => openM('addNote')}>
              <I.Plus size={14} /> Catatan Baru
            </button>
            {filtered.length > 0 ? (
              <div className="notes-grid">
                {filtered.map((n) => (
                  <div key={n.id} className="note-card" onClick={() => openM('addNote', n)}>
                    {n.pinned && <span className="accent" style={{ position: 'absolute', top: 11, right: 11 }}><I.Pin size={13} /></span>}
                    <p className="note-title">{n.title || 'Tanpa Judul'}</p>
                    <p className="note-body">{n.content}</p>
                    <div className="note-meta">
                      <div className="row gap-1">
                        {(n.tags || []).slice(0, 2).map((t) => <span key={t} className="tag-pill">#{t}</span>)}
                      </div>
                      <span className="xs faint">{fmtD(n.updatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<I.Notes size={26} />}
                title={q || tag !== 'all' ? 'Catatan tidak ditemukan' : 'Belum ada catatan'}
                sub={q || tag !== 'all' ? 'Coba kata kunci atau tag lain.' : 'Ide, daftar belanja, jurnal — tulis di sini.'}
              />
            )}
          </div>
        )}

        {sub === 'todos' && (
          <div className="stack">
            <TodoQuick add={addTodo} />
            {pend.length > 0 && (
              <div>
                <p className="xs bold dim" style={{ margin: '2px 2px 8px' }}>Belum Selesai ({pend.length})</p>
                <div className="col gap-2">
                  {pend.map((t) => (
                    <SwipeItem key={t.id} onDel={() => delTodo(t.id)}><TodoItem t={t} tog={togTodo} /></SwipeItem>
                  ))}
                </div>
              </div>
            )}
            {done.length > 0 && (
              <div>
                <p className="xs bold dim" style={{ margin: '2px 2px 8px' }}>Selesai ({done.length})</p>
                <div className="col gap-2">
                  {done.map((t) => (
                    <SwipeItem key={t.id} onDel={() => delTodo(t.id)}><TodoItem t={t} tog={togTodo} /></SwipeItem>
                  ))}
                </div>
              </div>
            )}
            {todos.length === 0 && (
              <EmptyState icon={<I.Check size={26} />} title="Belum ada tugas" sub="Tambahkan tugas pertamamu di atas." />
            )}
          </div>
        )}
      </div>
    );
  };
})();
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
          <button className="btn btn-primary btn-sm" disabled={busy || !name.trim()} onClick={add}>{busy ? <span className="spinner spin" /> : <I.Plus size={15} />}</button>
        </div>
      </div>
    );
  }

  return function SettingsScreen(p) {
    const {
      user, wallets, txns, notes, todos, debts, expCats, incCats,
      addCat, delCat, theme, setThemeId, mascotId, setMascotId, mascotOn, setMascotOn,
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
          <div style={{ marginTop: 14 }}>
            <Switch on={mascotOn} onChange={setMascotOn}
              label="Tampilkan maskot di kartu saldo"
              sub="Matikan jika ingin kartu saldo yang lebih bersih" />
          </div>
          <div style={{ marginTop: 10 }}>
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
