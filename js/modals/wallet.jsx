/* ============================================================
   NataHidup V2 — Modal Tambah Dompet
   ============================================================ */
window.NH = window.NH || {};

NH.WalletModal = (function () {
  const { useState } = React;
  const { Sheet } = NH.UI;

  return function WalletModal({ close, save }) {
    const [name, setName] = useState('');
    const [type, setType] = useState('cash');
    const [busy, setBusy] = useState(false);

    const sub = async (e) => {
      e.preventDefault();
      if (!name.trim() || busy) return;
      setBusy(true);
      const ok = await save({ name: name.trim(), type });
      setBusy(false);
      if (ok !== false) close();
    };

    return (
      <Sheet close={close} title="Tambah Dompet">
        <form onSubmit={sub} className="col gap-4">
          <div>
            <label className="field-label">Nama</label>
            <input type="text" placeholder="Contoh: BCA, GoPay, Dompet Kantor" value={name}
              onChange={(e) => setName(e.target.value)} autoFocus maxLength={30} />
          </div>
          <div>
            <label className="field-label">Tipe</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[{ id: 'cash', l: 'Cash' }, { id: 'bank', l: 'Bank' }, { id: 'ewallet', l: 'E-Wallet' }].map((t) => (
                <button type="button" key={t.id}
                  className={`wallet-pill ${type === t.id ? 'active' : ''}`}
                  style={{ justifyContent: 'center', flexDirection: 'column', padding: '14px 6px', borderRadius: 16, gap: 6 }}
                  onClick={() => setType(t.id)}>
                  <NH.WalletIcon type={t.id} size={19} />
                  <span className="xs bold">{t.l}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="xs faint">Saldo awal otomatis Rp 0 — tambahkan lewat transaksi pemasukan atau transfer.</p>
          <button type="submit" disabled={busy || !name.trim()} className="btn btn-primary btn-block" style={{ padding: 14 }}>
            {busy ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Sheet>
    );
  };
})();
