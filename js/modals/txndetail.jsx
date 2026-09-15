/* ============================================================
   NataHidup V2 — Modal Detail Transaksi
   ============================================================ */
window.NH = window.NH || {};

NH.TxnDetailModal = (function () {
  const { fmtC, fmtD, fmtT, getMY } = NH.utils;
  const { Sheet, CatBadge } = NH.UI;
  const I = NH.I;

  return function TxnDetailModal({ txn, close, del, edit, getCat, wallets }) {
    if (!txn) return null;
    const cat = getCat(txn.category) || { name: txn.category || 'Umum', color: 'var(--faint)' };
    const fromW = wallets.find((w) => w.id === txn.transferFrom);
    const toW = wallets.find((w) => w.id === txn.transferTo);
    const wallet = wallets.find((w) => w.id === txn.walletId);

    const rows = [];
    if (txn.note) rows.push(['Catatan', txn.note]);
    rows.push(['Tanggal', fmtD(txn.date)]);
    rows.push(['Jam dicatat', fmtT(txn.createdAt)]);
    if (txn.type !== 'transfer' && wallet) rows.push(['Dompet', wallet.name]);
    if (txn.type !== 'transfer' && txn.isRecurring) rows.push(['Berulang', `Setiap tanggal ${txn.recurringDay}`]);
    if (txn.recurringPid) rows.push(['Asal', 'Transaksi berulang otomatis']);

    return (
      <Sheet close={close} title="Detail Transaksi">
        <div className="col gap-4">
          <div className="center" style={{ padding: '10px 0' }}>
            {txn.type === 'transfer' ? (
              <>
                <span className="cat-badge lg" style={{ background: 'var(--blue-soft)', color: 'var(--blue)', margin: '0 auto' }}>
                  <I.Transfer size={20} />
                </span>
                <p className="bold blue mono-num" style={{ fontSize: 26, marginTop: 10 }}>{fmtC(txn.amount)}</p>
                <p className="sm dim" style={{ marginTop: 4 }}>Transfer</p>
                <p className="xs faint" style={{ marginTop: 2 }}>
                  {fromW ? fromW.name : '?'} <span className="accent">→</span> {toW ? toW.name : '?'}
                </p>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'center' }}><CatBadge cat={cat} size="lg" /></div>
                <p className={`bold mono-num ${txn.type === 'income' ? 'green' : 'red'}`} style={{ fontSize: 26, marginTop: 10 }}>
                  {txn.type === 'income' ? '+' : '−'}{fmtC(txn.amount)}
                </p>
                <p className="sm dim" style={{ marginTop: 4 }}>{cat.name}</p>
              </>
            )}
          </div>

          <div className="card card-flat" style={{ background: 'var(--surface2)' }}>
            {rows.map(([k, v], i) => (
              <div key={i} className="set-row" style={{ padding: '9px 0' }}>
                <span className="k sm">{k}</span>
                <span className="v sm" style={{ textAlign: 'right', maxWidth: '62%' }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="row gap-3">
            <button className="btn btn-soft grow" onClick={edit}><I.Edit size={15} /> Edit</button>
            <button className="btn btn-danger grow" onClick={del}><I.Trash size={15} /> Hapus</button>
          </div>
        </div>
      </Sheet>
    );
  };
})();
