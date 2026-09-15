/* ============================================================
   NataHidup V2 — Layar Catatan & To-Do
   ============================================================ */
window.NH = window.NH || {};

NH.Notes = (function () {
  const { useState, useMemo } = React;
  const { fmtC, fmtD, triggerHaptic } = NH.utils;
  const { Segmented, SwipeItem, EmptyState, DashSkel } = NH.UI;
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
          <button type="submit" disabled={busy || !t.trim()} className="btn btn-primary" style={{ padding: '12px 16px' }}>{busy ? '...' : <I.Plus size={16} />}</button>
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
            <div className="search-box">
              <span className="ic"><I.Search size={16} /></span>
              <input type="text" placeholder="Cari catatan..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
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
