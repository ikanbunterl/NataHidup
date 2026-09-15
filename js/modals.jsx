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
    // kategori: dari data edit/scan, sonst kategori terakhir yang dipakai untuk tipe ini
    const [cat, setCat] = useState((ed && ed.category) || (() => {
      try { return localStorage.getItem('nh2_lastcat_' + ((ed && ed.type) || 'expense')) || ''; }
      catch (e) { return ''; }
    })());
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
      if (ok !== false) {
        if (type !== 'transfer' && cat) {
          try { localStorage.setItem('nh2_lastcat_' + type, cat); } catch (e) {}
        }
        close();
      }
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
            {busy ? <><span className="spinner spin" /> Menyimpan...</> : amtOk ? `Simpan · ${fmtC(amtVal)}` : 'Simpan'}
          </button>
        </form>
      </Sheet>
    );
  };
})();
/* ============================================================
   NataHidup V2 — Modal Scan Struk (OCR 100% offline)
   Foto/galeri -> Tesseract.js -> parseReceipt (js/ocr.js) ->
   form konfirmasi (numpad) -> simpan langsung atau buka form
   lengkap. Auto-learn kata kunci kategori dari koreksi user.
   API online (Taggun/Mindee) DIHAPUS TOTAL di V2.
   ============================================================ */
window.NH = window.NH || {};

NH.ScanModal = (function () {
  const { useState, useRef, useEffect } = React;
  const { evalAmt, fmtC, getToday, getYesterday, triggerHaptic } = NH.utils;
  const { Sheet, AmountKeypad, CatBadge, Progress } = NH.UI;
  const I = NH.I;

  function CamError({ onBack }) {
    return (
      <div className="card" style={{ background: 'var(--red-soft)', borderColor: 'transparent', textAlign: 'center' }}>
        <div className="empty-ic" style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--red)' }}><I.CamOff size={26} /></div>
        <p className="bold red sm">Kamera Tidak Bisa Diakses</p>
        <div className="xs dim col gap-1" style={{ textAlign: 'left', background: 'var(--surface)', borderRadius: 12, padding: 12, margin: '12px 0', lineHeight: 1.6 }}>
          <p>1. Ketuk ikon <b>gembok 🔒</b> di address bar browser.</p>
          <p>2. Buka <b>Izin Situs</b> → <b>Kamera</b> → pilih <b>Izinkan</b>.</p>
          <p>3. Kembali ke aplikasi, lalu coba lagi.</p>
        </div>
        <button type="button" className="btn btn-ghost btn-block btn-sm" onClick={onBack}>Kembali</button>
      </div>
    );
  }

  return function ScanModal({ close, openM, expCats, wallets, learnedKw, setLearnedKw, addTxn }) {
    const [step, setStep] = useState('menu'); // menu | camera | processing | confirm
    const [prog, setProg] = useState(0);
    const [status, setStatus] = useState('');
    const [err, setErr] = useState('');
    const [camErr, setCamErr] = useState(false);
    const [confidence, setConfidence] = useState('');
    const [amt, setAmt] = useState('');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(getToday());
    const [cat, setCat] = useState('');
    const [wid, setWid] = useState((wallets[0] && wallets[0].id) || '');
    const [busy, setBusy] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const fileRef = useRef(null);

    useEffect(() => () => { if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); }, []);

    const stopCam = () => {
      if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    };

    const startCam = async () => {
      setErr(''); setCamErr(false);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false,
        });
        streamRef.current = stream;
        setStep('camera');
        setTimeout(() => {
          if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
        }, 120);
      } catch (e) { setCamErr(true); }
    };

    const process = async (blob) => {
      stopCam(); setErr(''); setStep('processing'); setProg(0);
      setStatus('Menyiapkan mesin OCR offline...');
      try {
        const r = await NH.ocr.scan(blob, (p, label) => {
          if (p !== null) setProg(p);
          if (label) setStatus(label);
        });
        if (!r.amount) {
          setStep('menu');
          setErr('Nominal tidak terbaca. Coba foto lebih dekat, rata, dan terang — atau isi manual.');
          return;
        }
        setAmt(String(r.amount));
        setNote(r.note || '');
        setDate(r.date || getToday());
        setCat(r.category || '');
        setConfidence(r.confidence || '');
        setStep('confirm');
      } catch (e) {
        setStep('menu');
        setErr('❌ ' + ((e && e.message) || 'OCR gagal. Coba foto lebih dekat & terang.'));
      }
    };

    const capture = () => {
      const v = videoRef.current;
      if (!v || !v.videoWidth) return;
      triggerHaptic(20);
      const c = document.createElement('canvas');
      c.width = v.videoWidth; c.height = v.videoHeight;
      c.getContext('2d').drawImage(v, 0, 0);
      c.toBlob((b) => { if (b) process(b); }, 'image/jpeg', 0.92);
    };

    const onFile = (e) => {
      const f = e.target.files && e.target.files[0];
      e.target.value = '';
      if (f) process(f);
    };

    const amtVal = evalAmt(amt);
    const amtOk = !isNaN(amtVal) && amtVal > 0;

    const learn = () => {
      // auto-learn: kata kunci dari catatan -> kategori pilihan user
      if (note.trim() && cat) setLearnedKw(NH.ocr.learnKeyword(note, cat, learnedKw));
    };

    const saveDirect = async () => {
      if (!amtOk || busy) return;
      setBusy(true);
      const ok = await addTxn({
        type: 'expense', amount: amtVal, category: cat, note: note.trim(),
        date: date || getToday(), walletId: wid,
      });
      setBusy(false);
      if (ok !== false) {
        learn();
        close();
      }
    };

    const openFullForm = () => {
      learn();
      const payload = { type: 'expense', amount: amtVal || undefined, note: note.trim(), date: date || getToday(), category: cat, walletId: wid };
      stopCam(); close();
      setTimeout(() => openM('addTxn', payload), 180);
    };

    return (
      <Sheet close={close} title="Scan Struk">
        <input ref={fileRef} type="file" accept="image/*" className="hidden-el" onChange={onFile} />

        {step === 'menu' && (
          <div className="col gap-3">
            {err && <p className="form-msg error" style={{ marginBottom: 0 }}>{err}</p>}
            <p className="xs dim" style={{ lineHeight: 1.6 }}>
              Foto struk belanja — nominal, tanggal & nama toko terisi otomatis.
              <b style={{ color: 'var(--green)' }}> 100% offline</b>: gambar tidak pernah dikirim ke server mana pun.
            </p>
            {camErr ? <CamError onBack={() => setCamErr(false)} /> : (
              <div className="mini-grid">
                <button className="scan-big-btn" onClick={startCam}>
                  <span className="ic" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}><I.Cam size={20} /></span>
                  Foto Struk
                </button>
                <button className="scan-big-btn" onClick={() => fileRef.current && fileRef.current.click()}>
                  <span className="ic" style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}><I.Image size={20} /></span>
                  Dari Galeri
                </button>
              </div>
            )}
            <p className="xs faint center">
              Pemakaian pertama mengunduh model bahasa (~5 MB), berikutnya cepat & bisa tanpa internet.
            </p>
          </div>
        )}

        {step === 'camera' && (
          <div className="col gap-3">
            <div className="cam-box">
              <video ref={videoRef} playsInline muted />
              <div className="cam-guide"><div className="frame" /></div>
            </div>
            <p className="xs dim center" style={{ lineHeight: 1.6 }}>
              Posisikan bagian <b>TOTAL</b> & nama toko dalam bingkai.<br />Pastikan struk rata dan cahaya terang.
            </p>
            <div className="row gap-3">
              <button className="btn btn-ghost grow" onClick={() => { stopCam(); setStep('menu'); }}>Kembali</button>
              <button className="btn btn-primary grow" style={{ background: 'var(--amber)', color: '#241a02' }} onClick={capture}>📸 Ambil Foto</button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="col gap-3 center" style={{ padding: '26px 4px' }}>
            <div className="spinner spin" style={{ margin: '0 auto', borderTopColor: 'var(--amber)' }} />
            <p className="sm bold">{status || 'Memproses...'}</p>
            <Progress pct={Math.max(3, prog)} tone="bar-amber" />
            <p className="xs faint">Semua berjalan di perangkatmu — strukmu privat.</p>
          </div>
        )}

        {step === 'confirm' && (
          <div className="col gap-4">
            {confidence === 'low' && (
              <p className="form-msg error" style={{ marginBottom: 0 }}>
                ⚠️ Nominal kurang yakin terbaca (OCR bisa salah baca angka, mis. 8 → B). Periksa dulu ya.
              </p>
            )}
            {confidence !== 'low' && (
              <p className="xs dim" style={{ background: 'var(--green-soft)', color: 'var(--green)', borderRadius: 12, padding: '10px 12px', fontWeight: 700 }}>
                ✨ Hasil terbaca {confidence === 'high' ? 'dengan yakin' : 'cukup yakin'} — kamu tetap bisa mengoreksi.
              </p>
            )}

            <div>
              <label className="field-label">Nominal</label>
              <AmountKeypad value={amt} onChange={setAmt} quick={false} />
            </div>

            <div>
              <label className="field-label">Tanggal</label>
              <div className="row gap-2">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="grow" />
                <button type="button" className={`chip ${date === getToday() ? 'active' : ''}`} onClick={() => setDate(getToday())}>Hari ini</button>
              </div>
            </div>

            <div>
              <label className="field-label">Nama Toko / Catatan</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} maxLength={60} />
            </div>

            <div>
              <label className="field-label">Kategori {cat && <span className="accent">(tertebak otomatis)</span>}</label>
              <div className="cat-grid">
                {expCats.map((c) => (
                  <button type="button" key={c.id} className={`cat-opt ${cat === c.id ? 'active' : ''}`}
                    onClick={() => { triggerHaptic(8); setCat(cat === c.id ? '' : c.id); }}>
                    <CatBadge cat={c} size="sm" />
                    <span className="nm">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Dompet</label>
              <div className="row gap-2 sb-hide" style={{ overflowX: 'auto' }}>
                {wallets.map((w) => (
                  <button type="button" key={w.id} className={`wallet-pill ${wid === w.id ? 'active' : ''}`} onClick={() => setWid(w.id)}>
                    <NH.WalletIcon type={w.type} size={15} /> {w.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="row gap-3">
              <button className="btn btn-ghost" onClick={() => { setErr(''); setStep('menu'); }}>Ulangi</button>
              <button className="btn btn-soft grow" onClick={openFullForm}>Form Lengkap</button>
              <button className="btn btn-primary grow" disabled={!amtOk || busy} onClick={saveDirect}>
                {busy ? <><span className="spinner spin" /> Menyimpan...</> : `Simpan${amtOk ? ' · ' + fmtC(amtVal) : ''}`}
              </button>
            </div>
          </div>
        )}
      </Sheet>
    );
  };
})();
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
            {busy ? <><span className="spinner spin" /> Menyimpan...</> : 'Simpan'}
          </button>
        </form>
      </Sheet>
    );
  };
})();
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
            {busy ? <><span className="spinner spin" /> Menyimpan...</> : 'Simpan'}
          </button>
        </form>
      </Sheet>
    );
  };
})();
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
                  {busy ? <span className="spinner spin" /> : 'Tambahkan'}
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-soft btn-block btn-sm" disabled={freeCats.length === 0} onClick={() => setAdding(true)}>
              <I.Plus size={14} /> Tambah Budget
            </button>
          )}

          <button className="btn btn-primary btn-block" style={{ padding: 14 }} disabled={busy} onClick={simpan}>
            {busy ? <><span className="spinner spin" /> Menyimpan...</> : 'Simpan Perubahan'}
          </button>
        </div>
      </Sheet>
    );
  };
})();
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
            {busy ? <><span className="spinner spin" /> Menyimpan...</> : 'Simpan'}
          </button>
        </form>
      </Sheet>
    );
  };
})();
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
              {busy ? <><span className="spinner spin" /> Menyimpan...</> : 'Catat Pengeluaran'}
            </button>
          </div>
        </form>
      </Sheet>
    );
  };
})();
