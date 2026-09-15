/* ============================================================
   NataHidup V2 — Layar Keuangan
   Sub-tab: Ringkasan (dompet, tren 6 bulan, kategori),
   Transaksi (cari + filter + swipe hapus), Budget, Hutang.
   ============================================================ */
window.NH = window.NH || {};

NH.Finance = (function () {
  const { useState, useMemo } = React;
  const { fmtC, fmtShort, fmtD, fmtT, dayLabel, getMY, getToday, triggerHaptic } = NH.utils;
  const { Segmented, SwipeItem, CatBadge, Progress, EmptyState, DashSkel } = NH.UI;
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
        <div className="search-box">
          <span className="ic"><I.Search size={16} /></span>
          <input type="text" placeholder="Cari catatan atau kategori..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
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
  function BudgetView({ budgets, catSpend, allCats, openM, hideBal }) {
    const totalB = budgets.reduce((s, b) => s + b.limit, 0);
    const periodLabel = { weekly: 'Mingguan', monthly: 'Bulanan', custom: 'Custom' };
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
          const spent = catSpend[b.category] || 0;
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
        {sub === 'budget' && <BudgetView budgets={p.budgets} catSpend={p.catSpend} allCats={p.allCats} openM={p.openM} hideBal={p.hideBal} />}
        {sub === 'debts' && <DebtView debts={p.debts} openM={p.openM} tog={p.togDebt} del={p.delDebt} hideBal={p.hideBal} />}
      </div>
    );
  };
})();
