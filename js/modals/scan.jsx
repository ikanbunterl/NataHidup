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

  return function ScanModal({ close, openM, expCats, wallets, learnedKw, setLearnedKw, addTxn, toast }) {
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
        if (toast) toast('Pengeluaran dari struk tersimpan ✨', 'ok');
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
                {busy ? '...' : `Simpan${amtOk ? ' · ' + fmtC(amtVal) : ''}`}
              </button>
            </div>
          </div>
        )}
      </Sheet>
    );
  };
})();
