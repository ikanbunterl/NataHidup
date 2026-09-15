/* ============================================================
   NataHidup V2 — Modal "Tugas Selesai" (catat realisasi biaya)
   Muncul saat menyelesaikan tugas yang punya estimasi biaya.
   ============================================================ */
window.NH = window.NH || {};

NH.TodoBudgetModal = (function () {
  const { useState } = React;
  const { fmtC, evalAmt } = NH.utils;
  const { Sheet, AmountKeypad } = NH.UI;

  return function TodoBudgetModal({ close, todo, completeWithExpense, skipExpense, wallets }) {
    const [realCost, setRealCost] = useState(todo.budget ? String(todo.budget) : '');
    const [walletId, setWalletId] = useState((wallets[0] && wallets[0].id) || '');
    const [busy, setBusy] = useState(false);

    const amtVal = evalAmt(realCost);
    const amtOk = !isNaN(amtVal) && amtVal > 0;

    const confirm = async (e) => {
      e.preventDefault();
      if (busy || !amtOk) return;
      setBusy(true);
      await completeWithExpense(todo.id, amtVal, walletId);
      setBusy(false);
    };

    const skip = async () => {
      if (busy) return;
      setBusy(true);
      await skipExpense(todo.id);
      setBusy(false);
    };

    return (
      <Sheet close={close} title="Tugas Selesai! 🎉">
        <form onSubmit={confirm} className="col gap-4">
          <p className="sm dim">
            <b style={{ color: 'var(--text)' }}>"{todo.title}"</b> selesai.
            {todo.budget > 0 && <> Estimasi biaya: <b>{fmtC(todo.budget)}</b>.</>} Catat sebagai pengeluaran?
          </p>
          <div>
            <label className="field-label">Nominal realisasi</label>
            <AmountKeypad value={realCost} onChange={setRealCost} />
          </div>
          <div>
            <label className="field-label">Dari Dompet</label>
            <div className="row gap-2 sb-hide" style={{ overflowX: 'auto' }}>
              {wallets.map((w) => (
                <button type="button" key={w.id} className={`wallet-pill ${walletId === w.id ? 'active' : ''}`} onClick={() => setWalletId(w.id)}>
                  <NH.WalletIcon type={w.type} size={15} /> {w.name}
                </button>
              ))}
            </div>
          </div>
          <div className="row gap-3">
            <button type="button" className="btn btn-ghost grow" disabled={busy} onClick={skip}>Lewati</button>
            <button type="submit" className="btn btn-primary grow" disabled={busy || !amtOk}>
              {busy ? 'Menyimpan...' : 'Catat Pengeluaran'}
            </button>
          </div>
        </form>
      </Sheet>
    );
  };
})();
