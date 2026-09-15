/* ============================================================
   NataHidup V2 — Modal Transaksi (Keluar / Masuk / Transfer)
   Andalan V2: numpad kalkulator dalam aplikasi, chip nominal
   cepat, kategori sekali ketuk, dompet pill, tanggal cepat.
   ============================================================ */
window.NH = window.NH || {};

NH.TxnModal = (function () {
  const { useState, useEffect } = React;
  const { fmtC, evalAmt, getToday, getYesterday, triggerHaptic } = NH.utils;
  const { Sheet, AmountKeypad, CatBadge, Segmented, Switch } = NH.UI;
  NH.WalletIcon;
  const I = NH.I;

  return function TxnModal({ close, save, wallets, expCats, incCats, ed }) {
    const [type, setType] = useState((ed && ed.type) || 'expense');
    const [amt, setAmt] = useState(ed && ed.amount ? String(ed.amount) : '');
    const [cat, setCat] = useState((ed && ed.category) || '');
    const [note, setNote] = useState((ed && ed.note) || '');
    const [wid, setWid] = useState((ed && ed.walletId) || (wallets[0] && wallets[0].id) || '');
    const [transferFrom, setFrom] = useState((ed && ed.transferFrom) || (wallets[0] && wallets[0].id) || '');
    const [transferTo, setTo] = useState((ed && ed.transferTo) || (wallets[1] && wallets[1].id) || (wallets[0] && wallets[0].id) || '');
    const [date, setDate] = useState((ed && ed.date) || getToday());
    const [recurring, setRec] = useState(!!(ed && ed.isRecurring));
    const [recDay, setRecDay] = useState((ed && ed.recurringDay) || new Date().getDate());
    const [busy, setBusy] = useState(false);

    const cats = type === 'expense' ? expCats : incCats;
    const amtVal = evalAmt(amt);
    const amtOk = !isNaN(amtVal) && amtVal > 0;

    // transfer: pastikan dari ≠ ke
    useEffect(() => {
      if (type === 'transfer' && transferFrom === transferTo && wallets.length > 1) {
        const next = wallets.find((w) => w.id !== transferFrom);
        if (next) setTo(next.id);
      }
    }, [transferFrom, type, wallets]);

    const invalid = !amtOk || (type !== 'transfer' && !cat) || (type === 'transfer' && (transferFrom === transferTo || !transferFrom || !transferTo));

    const sub = async (e) => {
      if (e) e.preventDefault();
      if (invalid || busy) return;
      let payload;
      if (type === 'transfer') {
        payload = { type: 'transfer', amount: amtVal, note: note.trim(), transferFrom, transferTo, date };
      } else {
        payload = {
          type, amount: amtVal, category: cat, note: note.trim(), walletId: wid, date,
          isRecurring: recurring, recurringDay: recurring ? recDay : null,
        };
      }
      setBusy(true);
      const ok = await save(payload);
      setBusy(false);
      if (ok !== false) close();
    };

    const changeType = (t) => {
      triggerHaptic(8);
      setType(t);
      setCat('');
    };

    return (
      <Sheet close={close} title={ed && ed.id ? 'Edit Transaksi' : 'Tambah Transaksi'}>
        <form onSubmit={sub} className="col gap-4">
          <Segmented
            className="seg-type"
            items={[
              { id: 'expense', label: 'Keluar', cls: 't-expense' },
              { id: 'income', label: 'Masuk', cls: 't-income' },
              { id: 'transfer', label: 'Transfer', cls: 't-transfer' },
            ]}
            value={type} onChange={changeType}
          />

          {/* Jumlah + numpad */}
          <div>
            <label className="field-label">Jumlah — bisa hitung langsung, mis. 50000+12000</label>
            <AmountKeypad value={amt} onChange={setAmt} />
          </div>

          {type === 'transfer' ? (
            <>
              <div>
                <label className="field-label">Dari Dompet</label>
                <div className="row gap-2 sb-hide" style={{ overflowX: 'auto' }}>
                  {wallets.map((w) => (
                    <button type="button" key={w.id} className={`wallet-pill ${transferFrom === w.id ? 'active' : ''}`} onClick={() => setFrom(w.id)}>
                      <NH.WalletIcon type={w.type} size={15} /> {w.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label">Ke Dompet</label>
                <div className="row gap-2 sb-hide" style={{ overflowX: 'auto' }}>
                  {wallets.filter((w) => w.id !== transferFrom).map((w) => (
                    <button type="button" key={w.id} className={`wallet-pill ${transferTo === w.id ? 'active' : ''}`} onClick={() => setTo(w.id)}>
                      <NH.WalletIcon type={w.type} size={15} /> {w.name}
                    </button>
                  ))}
                </div>
              </div>
              <p className="xs blue" style={{ background: 'var(--blue-soft)', borderRadius: 12, padding: '10px 12px' }}>
                Transfer hanya memindahkan saldo antar dompet — tidak dihitung sebagai pemasukan/pengeluaran.
              </p>
            </>
          ) : (
            <>
              {/* Kategori */}
              <div>
                <label className="field-label">Kategori</label>
                <div className="cat-grid">
                  {cats.map((c) => (
                    <button type="button" key={c.id} className={`cat-opt ${cat === c.id ? 'active' : ''}`} onClick={() => { triggerHaptic(8); setCat(c.id); }}>
                      <CatBadge cat={c} size="sm" />
                      <span className="nm">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dompet */}
              <div>
                <label className="field-label">Dompet</label>
                <div className="row gap-2 sb-hide" style={{ overflowX: 'auto' }}>
                  {wallets.map((w) => (
                    <button type="button" key={w.id} className={`wallet-pill ${wid === w.id ? 'active' : ''}`} onClick={() => setWid(w.id)}>
                      <NH.WalletIcon type={w.type} size={15} /> {w.name}
                      <span className="faint mono-num" style={{ fontWeight: 600 }}>· {fmtC(w.balance)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Berulang */}
              <div className="card card-flat" style={{ background: 'var(--surface2)', padding: 13 }}>
                <Switch on={recurring} onChange={setRec} label="Transaksi berulang" sub="Otomatis dicatat setiap bulan" />
                {recurring && (
                  <div style={{ marginTop: 12 }}>
                    <label className="field-label">Setiap tanggal</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                        <button type="button" key={d}
                          className={`chip ${recDay === d ? 'active' : ''}`}
                          style={{ justifyContent: 'center', padding: '7px 0', fontSize: 12 }}
                          onClick={() => setRecDay(d)}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tanggal */}
          <div>
            <label className="field-label">Tanggal</label>
            <div className="row gap-2">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="grow" />
              <button type="button" className={`chip ${date === getToday() ? 'active' : ''}`} onClick={() => setDate(getToday())}>Hari ini</button>
              <button type="button" className={`chip ${date === getYesterday() ? 'active' : ''}`} onClick={() => setDate(getYesterday())}>Kemarin</button>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="field-label">Catatan (opsional)</label>
            <input type="text" placeholder="Deskripsi singkat..." value={note} onChange={(e) => setNote(e.target.value)} maxLength={60} />
          </div>

          <button type="submit" disabled={invalid || busy} className="btn btn-primary btn-block" style={{ padding: 15, fontSize: 15 }}>
            {busy ? 'Menyimpan...' : amtOk ? `Simpan · ${fmtC(amtVal)}` : 'Simpan'}
          </button>
        </form>
      </Sheet>
    );
  };
})();
