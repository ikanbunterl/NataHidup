/* ============================================================
   NataHidup V2 — Modal Atur Budget
   V2: budget bisa DITAMBAH & DIHAPUS (V1 hanya bisa edit).
   ============================================================ */
window.NH = window.NH || {};

NH.BudgetModal = (function () {
  const { useState } = React;
  const { fmtC, triggerHaptic } = NH.utils;
  const { Sheet, CatBadge } = NH.UI;
  const I = NH.I;

  return function BudgetModal({ close, budgets, expCats, save, addBudget, delBudget }) {
    const [local, setLocal] = useState(budgets.map((b) => ({ ...b })));
    const [busy, setBusy] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newCat, setNewCat] = useState('');
    const [newLimit, setNewLimit] = useState('');

    const usedCats = new Set(local.flatMap((b) => b.categories && b.categories.length ? b.categories : [b.category]));
    const freeCats = expCats.filter((c) => !usedCats.has(c.id));

    const upd = (id, field, v) =>
      setLocal((p) => p.map((b) => (b.id === id ? { ...b, [field]: field === 'limit' ? (parseFloat(v) || 0) : v } : b)));

    const toggleCategory = (budgetId, catId) => {
      setLocal((p) => p.map((b) => {
        if (b.id !== budgetId) return b;
        const cs = b.categories || [b.category];
        const has = cs.includes(catId);
        const next = has ? cs.filter((c) => c !== catId) : [...cs, catId];
        return { ...b, categories: next.length ? next : cs, category: next.includes(b.category) ? b.category : next[0] };
      }));
    };

    const simpan = async () => {
      if (busy) return;
      setBusy(true);
      const ok = await save(local);
      setBusy(false);
      if (ok !== false) close();
    };

    const tambah = async () => {
      const limit = parseFloat(newLimit) || 0;
      if (!newCat || limit <= 0 || busy) return;
      setBusy(true);
      const created = await addBudget({ category: newCat, categories: [newCat], limit, period: 'monthly' });
      setBusy(false);
      if (created) {
        setLocal((p) => [...p, created]);
        setAdding(false); setNewCat(''); setNewLimit('');
      }
    };

    const hapus = async (id) => {
      if (!confirm('Hapus budget ini?')) return;
      setBusy(true);
      const ok = await delBudget(id);
      setBusy(false);
      if (ok !== false) setLocal((p) => p.filter((b) => b.id !== id));
    };

    return (
      <Sheet close={close} title="Atur Budget">
        <div className="col gap-3">
          <p className="xs dim">Tentukan limit bulanan per kategori. Peringatan muncul saat pengeluaran mendekati limit.</p>

          {local.map((b) => {
            const cat = expCats.find((c) => c.id === b.category) || { name: b.category, color: 'var(--faint)' };
            const tracked = b.categories || [b.category];
            return (
              <div key={b.id} className="card" style={{ padding: 14 }}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="row gap-2 sm bold"><CatBadge cat={cat} size="sm" /> {cat.name}</span>
                  <button className="btn btn-danger btn-sm" style={{ padding: '5px 10px' }} onClick={() => hapus(b.id)} aria-label="Hapus budget">
                    <I.Trash size={13} />
                  </button>
                </div>
                <div className="row gap-3">
                  <div className="grow">
                    <label className="field-label">Limit (Rp)</label>
                    <input type="number" inputMode="numeric" min="0" value={b.limit || ''} placeholder="0"
                      onChange={(e) => upd(b.id, 'limit', e.target.value)} className="sm" />
                  </div>
                  <div style={{ width: 128 }}>
                    <label className="field-label">Periode</label>
                    <select value={b.period || 'monthly'} onChange={(e) => upd(b.id, 'period', e.target.value)} className="sm">
                      <option value="weekly">Mingguan</option>
                      <option value="monthly">Bulanan</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <label className="field-label">Kategori yang dipantau</label>
                  <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                    {expCats.map((ec) => (
                      <button type="button" key={ec.id}
                        className={`chip ${tracked.includes(ec.id) ? 'active' : ''}`}
                        style={{ padding: '5px 10px', fontSize: 11 }}
                        onClick={() => { triggerHaptic(6); toggleCategory(b.id, ec.id); }}>
                        <span className="dot" style={{ background: ec.color }} /> {ec.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {local.length === 0 && !adding && (
            <p className="sm faint center" style={{ padding: 12 }}>Belum ada budget. Tambahkan di bawah.</p>
          )}

          {adding ? (
            <div className="card anim-pop" style={{ padding: 14 }}>
              <label className="field-label">Budget baru — kategori utama</label>
              <div className="row gap-1" style={{ flexWrap: 'wrap', marginBottom: 10 }}>
                {freeCats.length === 0 && <p className="xs faint">Semua kategori sudah terpakai budget lain.</p>}
                {freeCats.map((c) => (
                  <button type="button" key={c.id} className={`chip ${newCat === c.id ? 'active' : ''}`}
                    style={{ padding: '6px 11px', fontSize: 11.5 }} onClick={() => setNewCat(c.id)}>
                    <span className="dot" style={{ background: c.color }} /> {c.name}
                  </button>
                ))}
              </div>
              <label className="field-label">Limit bulanan (Rp)</label>
              <input type="number" inputMode="numeric" min="0" placeholder="Contoh: 500000" value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)} className="sm" />
              <div className="row gap-2" style={{ marginTop: 10 }}>
                <button className="btn btn-ghost grow btn-sm" onClick={() => setAdding(false)}>Batal</button>
                <button className="btn btn-primary grow btn-sm" disabled={!newCat || !(parseFloat(newLimit) > 0) || busy} onClick={tambah}>
                  {busy ? '...' : 'Tambahkan'}
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-soft btn-block btn-sm" disabled={freeCats.length === 0} onClick={() => setAdding(true)}>
              <I.Plus size={14} /> Tambah Budget
            </button>
          )}

          <button className="btn btn-primary btn-block" style={{ padding: 14 }} disabled={busy} onClick={simpan}>
            {busy ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </Sheet>
    );
  };
})();
