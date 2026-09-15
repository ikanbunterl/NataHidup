/* ============================================================
   NataHidup V2 — Modal Hutang / Piutang
   ============================================================ */
window.NH = window.NH || {};

NH.DebtModal = (function () {
  const { useState } = React;
  const { Sheet, AmountKeypad } = NH.UI;
  const { evalAmt } = NH.utils;

  return function DebtModal({ close, save }) {
    const [name, setName] = useState('');
    const [dtype, setDtype] = useState('hutang');
    const [amt, setAmt] = useState('');
    const [due, setDue] = useState('');
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);

    const amtVal = evalAmt(amt);
    const amtOk = !isNaN(amtVal) && amtVal > 0;

    const sub = async (e) => {
      e.preventDefault();
      if (!name.trim() || !amtOk || busy) return;
      setBusy(true);
      const ok = await save({ name: name.trim(), dtype, amount: amtVal, dueDate: due || null, note: note.trim() });
      setBusy(false);
      if (ok !== false) close();
    };

    return (
      <Sheet close={close} title="Hutang / Piutang">
        <form onSubmit={sub} className="col gap-4">
          <div className="seg seg-type">
            <button type="button" className={`t-expense ${dtype === 'hutang' ? 'active' : ''}`} onClick={() => setDtype('hutang')}>Hutang</button>
            <button type="button" className={`t-income ${dtype === 'piutang' ? 'active' : ''}`} onClick={() => setDtype('piutang')}>Piutang</button>
          </div>
          <div>
            <label className="field-label">Nama Orang / Entitas</label>
            <input type="text" placeholder={dtype === 'hutang' ? 'Contoh: Budi, PayLater' : 'Contoh: Budi pinjam'} value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={40} />
          </div>
          <div>
            <label className="field-label">Jumlah</label>
            <AmountKeypad value={amt} onChange={setAmt} compact />
          </div>
          <div>
            <label className="field-label">Jatuh tempo (opsional)</label>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Catatan</label>
            <input type="text" placeholder="Keterangan tambahan" value={note} onChange={(e) => setNote(e.target.value)} maxLength={60} />
          </div>
          <button type="submit" disabled={busy || !name.trim() || !amtOk} className="btn btn-primary btn-block" style={{ padding: 14 }}>
            {busy ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Sheet>
    );
  };
})();
