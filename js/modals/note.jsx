/* ============================================================
   NataHidup V2 — Modal Catatan (baru/edit)
   ============================================================ */
window.NH = window.NH || {};

NH.NoteModal = (function () {
  const { useState } = React;
  const { Sheet, Switch } = NH.UI;
  const I = NH.I;

  return function NoteModal({ close, save, ed }) {
    const [title, setTitle] = useState((ed && ed.title) || '');
    const [content, setContent] = useState((ed && ed.content) || '');
    const [tags, setTags] = useState(ed && ed.tags ? ed.tags.join(', ') : '');
    const [pinned, setPinned] = useState(!!(ed && ed.pinned));
    const [busy, setBusy] = useState(false);

    const sub = async (e) => {
      e.preventDefault();
      if ((!content.trim() && !title.trim()) || busy) return;
      setBusy(true);
      const ok = await save({
        title: title.trim(),
        content: content.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        pinned,
      });
      setBusy(false);
      if (ok !== false) close();
    };

    return (
      <Sheet close={close} title={ed && ed.id ? 'Edit Catatan' : 'Catatan Baru'}>
        <form onSubmit={sub} className="col gap-4">
          <input type="text" placeholder="Judul catatan..." value={title} onChange={(e) => setTitle(e.target.value)}
            style={{ fontSize: 17, fontWeight: 800 }} maxLength={80} />
          <textarea placeholder="Tulis catatan..." value={content} onChange={(e) => setContent(e.target.value)}
            rows={8} style={{ resize: 'none', lineHeight: 1.6 }} />
          <div>
            <label className="field-label">Tags (pisahkan dengan koma)</label>
            <input type="text" placeholder="Kerjaan, Pribadi, Ide" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <Switch on={pinned} onChange={setPinned} label="Sematkan di atas" />
          <button type="submit" disabled={busy} className="btn btn-primary btn-block" style={{ padding: 14 }}>
            {busy ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Sheet>
    );
  };
})();
