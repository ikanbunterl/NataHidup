/* ============================================================
   NataHidup V2 — Modal Tambah Cepat (sheet pilihan)
   ============================================================ */
window.NH = window.NH || {};

NH.QuickAddModal = (function () {
  const { Sheet } = NH.UI;
  const { triggerHaptic } = NH.utils;
  const I = NH.I;

  return function QuickAddModal({ close, openM }) {
    const go = (modal, data) => {
      triggerHaptic(10);
      close();
      setTimeout(() => openM(modal, data), 160);
    };
    return (
      <Sheet close={close} title="Tambah Cepat">
        <div className="qa-grid">
          <button className="qa-btn expense" onClick={() => go('addTxn', { type: 'expense' })}>
            <span className="ic"><I.Down size={19} /></span> Pengeluaran
          </button>
          <button className="qa-btn income" onClick={() => go('addTxn', { type: 'income' })}>
            <span className="ic"><I.Up size={19} /></span> Pemasukan
          </button>
          <button className="qa-btn transfer" onClick={() => go('addTxn', { type: 'transfer' })}>
            <span className="ic"><I.Transfer size={19} /></span> Transfer
          </button>
          <button className="qa-btn note" onClick={() => go('addNote')}>
            <span className="ic"><I.Notes size={19} /></span> Catatan
          </button>
          <button className="qa-btn scan" onClick={() => go('scanReceipt')}>
            <span className="ic"><I.Cam size={17} /></span> Scan Struk (OCR offline)
          </button>
        </div>
      </Sheet>
    );
  };
})();
