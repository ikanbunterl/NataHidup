/* ============================================================
   NataHidup V2 — Komponen UI bersama (JSX)
   Sheet/modal bawah, Toast, Numpad kalkulator, SwipeItem,
   CatBadge, Segmented, EmptyState, Progress, Switch, Splash.
   ============================================================ */
window.NH = window.NH || {};

NH.UI = (function () {
  const { useState, useRef, useEffect } = React;
  const { fmtC, evalAmt, triggerHaptic } = NH.utils;
  const I = NH.I;

  /* ===== Sheet: modal bawah ===== */
  function Sheet({ close, title, children }) {
    useEffect(() => {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }, []);
    return (
      <div className="sheet-overlay" onClick={close}>
        <div className="sheet sb-hide" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-handle" />
          <div className="sheet-head">
            <h2 className="sheet-title">{title}</h2>
            <button className="sheet-close" onClick={close} aria-label="Tutup"><I.X size={18} /></button>
          </div>
          <div className="sheet-body">{children}</div>
        </div>
      </div>
    );
  }

  /* ===== Toast ===== */
  function Toasts({ toasts }) {
    if (!toasts.length) return null;
    const ic = { ok: '✅', info: 'ℹ️', error: '⚠️' };
    return (
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{ic[t.type] || 'ℹ️'}</span>
            <span className="grow">{t.msg}</span>
          </div>
        ))}
      </div>
    );
  }

  /* ===== Splash & skeleton ===== */
  function Splash({ text }) {
    return (
      <div className="splash">
        <div className="spinner spin" />
        <p className="dim sm">{text || 'Memuat NataHidup...'}</p>
      </div>
    );
  }
  function DashSkel() {
    return (
      <div className="stack">
        <div className="skeleton" style={{ height: 44 }} />
        <div className="skeleton" style={{ height: 180, borderRadius: 24 }} />
        <div className="skeleton" style={{ height: 96 }} />
        <div className="skeleton" style={{ height: 160 }} />
      </div>
    );
  }

  /* ===== Swipe to delete ===== */
  function SwipeItem({ children, onDel }) {
    const [off, setOff] = useState(0);
    const [drag, setDrag] = useState(false);
    const sx = useRef(0);
    const sy = useRef(0);
    const lock = useRef(null); // 'x' | 'y' | null — biar tidak bentrok scroll vertikal
    const TH = 74;
    const ts = (e) => { sx.current = e.touches[0].clientX; sy.current = e.touches[0].clientY; lock.current = null; setDrag(true); };
    const tm = (e) => {
      if (!drag) return;
      const dx = e.touches[0].clientX - sx.current;
      const dy = e.touches[0].clientY - sy.current;
      if (lock.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8))
        lock.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (lock.current !== 'x') return;
      if (dx < 0) setOff(Math.max(dx, -TH - 30));
    };
    const te = () => { setDrag(false); setOff((o) => (o < -TH ? -TH : 0)); };
    return (
      <div className="swipe-wrap">
        <div className="swipe-bg">
          <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); onDel(); }}>
            <I.Trash size={13} /> Hapus
          </button>
        </div>
        <div className={`swipe-fg ${drag ? 'dragging' : ''}`} style={{ transform: `translateX(${off}px)` }}
          onTouchStart={ts} onTouchMove={tm} onTouchEnd={te} onTouchCancel={te}>
          {children}
        </div>
      </div>
    );
  }

  /* ===== Badge kategori ===== */
  function CatBadge({ cat, size = 'md' }) {
    const letter = (cat && cat.name ? cat.name.charAt(0) : '?').toUpperCase();
    return (
      <div className={`cat-badge ${size}`} style={{ backgroundColor: (cat && cat.color) || 'var(--faint)' }}>
        {letter}
      </div>
    );
  }

  /* ===== Segmented control ===== */
  function Segmented({ items, value, onChange, className = '' }) {
    return (
      <div className={`seg ${className}`}>
        {items.map((it) => (
          <button key={it.id} type="button"
            className={`${value === it.id ? 'active' : ''} ${it.cls || ''}`}
            onClick={() => onChange(it.id)}>
            {it.label}
          </button>
        ))}
      </div>
    );
  }

  /* ===== Empty state ===== */
  function EmptyState({ icon, title, sub, action }) {
    return (
      <div className="empty-state">
        <div className="empty-ic">{icon || <I.Sparkle size={26} />}</div>
        <p className="empty-title">{title}</p>
        {sub && <p className="empty-sub">{sub}</p>}
        {action && <div style={{ marginTop: 14 }}>{action}</div>}
      </div>
    );
  }

  /* ===== Progress bar ===== */
  function Progress({ pct, tone, thin }) {
    const t = tone || (pct >= 100 ? 'bar-red' : pct >= 70 ? 'bar-amber' : 'bar-green');
    return (
      <div className={`progress ${thin ? 'thin' : ''}`}>
        <div className={`bar ${t}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
    );
  }

  /* ===== Switch ===== */
  function Switch({ on, onChange, label, sub }) {
    return (
      <div className="row gap-3" style={{ justifyContent: 'space-between', padding: '4px 0', cursor: 'pointer' }}
        onClick={() => { triggerHaptic(10); onChange(!on); }}>
        <div className="grow">
          {label && <p className="sm bold">{label}</p>}
          {sub && <p className="xs faint" style={{ marginTop: 2 }}>{sub}</p>}
        </div>
        <div className={`switch ${on ? 'on' : ''}`} />
      </div>
    );
  }

  /* ============================================================
     Numpad kalkulator dalam-aplikasi
     - Tanpa keyboard HP: 0-9 . + − × ÷ ⌫
     - Chip nominal cepat (5rb…100rb)
     - Evaluasi ekspresi live ("50000+12000" = Rp 62.000)
     ============================================================ */
  const QUICK = [5000, 10000, 20000, 50000, 100000];
  const OPS = ['+', '−', '×', '÷'];

  function AmountKeypad({ value, onChange, quick = true, compact = false }) {
    const v = String(value || '');
    const isOp = (ch) => OPS.includes(ch);

    const press = (k) => {
      triggerHaptic(8);
      let nv = v;
      if (k === 'back') {
        nv = v.slice(0, -1);
      } else if (isOp(k)) {
        if (!v) return;                       // tidak mulai dengan operator
        if (isOp(v.slice(-1)) || v.endsWith('.')) nv = v.slice(0, -1) + k;
        else nv = v + k;
      } else if (k === '.') {
        const seg = v.split(/[+\−×÷]/).pop() || '';
        if (seg.includes('.')) return;        // satu titik per segmen
        nv = (v === '' ? '0' : v) + '.';
      } else {
        // digit
        if (v === '0') nv = k;                // ganti nol di depan
        else nv = v + k;
        if (nv.replace(/\D/g, '').length > 15) return;
      }
      onChange(nv);
    };

    const addQuick = (n) => {
      triggerHaptic(8);
      if (!v) { onChange(String(n)); return; }
      if (isOp(v.slice(-1))) onChange(v + n);
      else onChange(v + '+' + n);
    };

    const clearAll = () => { triggerHaptic(12); onChange(''); };

    // tampilan: angka polos diformat ribuan; ekspresi ditampilkan apa adanya
    const pretty = (() => {
      if (!v) return '0';
      if (OPS.some((o) => v.includes(o))) return v;
      const n = parseFloat(v.replace(/[^\d.]/g, ''));
      if (isNaN(n)) return v;
      const [ip, dp] = v.split('.');
      const fmtIp = Number(ip || '0').toLocaleString('id-ID');
      return dp !== undefined ? `${fmtIp}.${dp}` : (/\.$/.test(v) ? fmtIp + '.' : fmtIp);
    })();

    const result = OPS.some((o) => v.includes(o)) ? evalAmt(v) : NaN;
    const showResult = !isNaN(result);

    const key = (k, cls = '', label) => (
      <button type="button" key={k} className={cls} onClick={() => press(k)} aria-label={label || k}>
        {label || k}
      </button>
    );

    return (
      <div>
        <div className="amount-display focused">
          {v.length > 0 && <button type="button" className="amount-clear" onClick={clearAll}>C</button>}
          <div className="amount-value"><span className="rp">Rp</span>{pretty}</div>
          <div className="amount-result">{showResult ? `= ${fmtC(result)}` : '\u00A0'}</div>
        </div>

        {quick && (
          <div className="quick-chips sb-hide" style={{ margin: '10px 0 4px' }}>
            {QUICK.map((n) => (
              <button type="button" key={n} className="chip" onClick={() => addQuick(n)}>
                + {n / 1000}rb
              </button>
            ))}
          </div>
        )}

        <div className="numpad" style={compact ? { gap: 6 } : undefined}>
          {key('7')}{key('8')}{key('9')}{key('back', 'del', <I.Backspace size={20} />)}
          {key('4')}{key('5')}{key('6')}{key('+', 'op')}
          {key('1')}{key('2')}{key('3')}{key('−', 'op')}
          {key('0')}{key('.', 'fn', '.')}
          {key('×', 'op')}{key('÷', 'op')}
        </div>
      </div>
    );
  }

  return { Sheet, Toasts, Splash, DashSkel, SwipeItem, CatBadge, Segmented, EmptyState, Progress, Switch, AmountKeypad, QUICK };
})();
