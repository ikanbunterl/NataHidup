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
      hideBal, toggleHideBal, mascotId, setTab, togTodo,
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
    const warnings = useMemo(
      () => budgets.filter((b) => { const s = catSpend[b.category] || 0; return b.limit > 0 && s / b.limit > 0.7; }).slice(0, 3),
      [budgets, catSpend]
    );

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
          <button className="hero-eye" style={{ background: 'var(--surface2)', color: 'var(--dim)' }}
            onClick={() => setTab('settings')} aria-label="Pengaturan">
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

            <div className="hero-mascot anim-float" onClick={tapMascot} role="button" aria-label="Maskot">
              <Mascot id={mascotId} size={96} />
            </div>

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
          {bubble && <div className="mascot-bubble">{bubble}</div>}
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

        {/* ===== Peringatan budget ===== */}
        {warnings.length > 0 && (
          <div className="card">
            <h3 className="section-title" style={{ color: 'var(--amber)' }}><span className="icon"><I.Alert size={16} /></span> Peringatan Budget</h3>
            <div className="col gap-3">
              {warnings.map((bw) => {
                const spent = catSpend[bw.category] || 0;
                const pct = Math.min(100, (spent / bw.limit) * 100);
                const cat = allCats.find((c) => c.id === bw.category) || { name: bw.category, color: 'var(--faint)' };
                return (
                  <div key={bw.id}>
                    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 5 }}>
                      <span className="row gap-2 sm bold"><CatBadge cat={cat} size="sm" /> {cat.name}</span>
                      <span className={`xs bold mono-num ${pct >= 100 ? 'red' : 'amber'}`}>{hideBal ? '•••' : `${fmtC(spent)} / ${fmtC(bw.limit)}`}</span>
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
