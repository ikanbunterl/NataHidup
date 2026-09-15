/* ============================================================
   NataHidup V2 — Aplikasi utama (Root + App)
   Berisi state global, semua mutasi Supabase (server-first),
   navigasi tab, router modal, dan render root.

   Catatan V2:
   - Fitur streak DIJEDA (dihapus dari UI & logika; data transaksi
     tetap utuh, bisa dirancang ulang nanti).
   - OCR hanya offline (js/ocr.js); tidak ada konfigurasi API.
   - Preferensi tampilan (tema, maskot, privasi saldo) per-perangkat.
   ============================================================ */
window.NH = window.NH || {};

(function () {
  const { useState, useEffect, useCallback, useMemo, useRef } = React;
  const {
    genId, getToday, getMY, daysInMonth, errMsg, triggerHaptic, usePref,
  } = NH.utils;
  const { sb, rowToWallet, rowToTxn, txnToRow, rowToCat, rowToBudget, rowToNote, rowToTodo, rowToDebt, txnDelta, flipDelta, mergeDelta, checkSchema, loadAllData } = NH.db;
  const { CAT_COLORS, KEYS, DEFAULT_MASCOT } = NH.config;
  const { Toasts, Splash } = NH.UI;
  const I = NH.I;

  /* ============================================================
     Root: sesi auth + toast global
     ============================================================ */
  function Root() {
    const [session, setSession] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [toasts, setToasts] = useState([]);

    const toast = useCallback((msg, type = 'error') => {
      const id = genId();
      setToasts((p) => [...p, { id, msg, type }].slice(-3));
      setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 4500);
    }, []);

    useEffect(() => {
      let mounted = true;
      sb.auth.getSession()
        .then(({ data }) => { if (mounted) { setSession(data.session); setAuthReady(true); } })
        .catch(() => { if (mounted) setAuthReady(true); });
      const { data: sub } = sb.auth.onAuthStateChange((_e, s) => {
        if (mounted) { setSession(s); setAuthReady(true); }
      });
      return () => { mounted = false; try { sub.subscription.unsubscribe(); } catch (e) {} };
    }, []);

    if (!authReady) {
      return <div className="app-shell"><Splash /><Toasts toasts={toasts} /></div>;
    }
    return (
      <div className="app-shell">
        {session
          ? <App key={session.user.id} user={session.user} toast={toast} />
          : <NH.AuthScreen />}
        <Toasts toasts={toasts} />
      </div>
    );
  }

  /* ============================================================
     App: state data + mutasi + navigasi + modal
     ============================================================ */
  function App({ user, toast }) {
    const [tab, setTabState] = useState('home');
    const [pageKey, setPageKey] = useState(0);
    const [modal, setModal] = useState(null);
    const [mData, setMData] = useState(null);

    // Data pengguna (server = sumber kebenaran)
    const [wallets, setWallets] = useState([]);
    const [txns, setTxns] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [notes, setNotes] = useState([]);
    const [todos, setTodos] = useState([]);
    const [debts, setDebts] = useState([]);
    const [expCats, setExpCats] = useState([]);
    const [incCats, setIncCats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bootError, setBootError] = useState('');
    const [online, setOnline] = useState(typeof navigator === 'undefined' || navigator.onLine !== false);
    const [undoTxn, setUndoTxn] = useState(null);

    // Preferensi perangkat
    const [learnedKw, setLearnedKw] = usePref(KEYS.learnedKw, {});
    const [mascotId, setMascotId] = usePref(KEYS.mascot, DEFAULT_MASCOT);
    const [hideBal, setHideBal] = usePref(KEYS.hideBal, false);
    const [themeId, setThemeIdState] = useState(NH.theme.current().id);

    const walletsRef = useRef([]); walletsRef.current = wallets;
    const recRef = useRef(false);

    const setThemeId = (id) => { NH.theme.apply(id); setThemeIdState(id); };
    const setTab = (t) => { setTabState(t); setPageKey((k) => k + 1); window.scrollTo({ top: 0 }); };

    useEffect(() => {
      const up = () => setOnline(true), dn = () => setOnline(false);
      window.addEventListener('online', up);
      window.addEventListener('offline', dn);
      return () => { window.removeEventListener('online', up); window.removeEventListener('offline', dn); };
    }, []);

    /* ===== Boot: unduh semua data dari server ===== */
    const boot = useCallback(async () => {
      setLoading(true); setBootError('');
      try {
        const missing = await checkSchema();
        if (missing.length)
          throw new Error('Skema database belum lengkap (' + missing.join(', ') + '). Jalankan supabase/schema.sql di SQL Editor Supabase, lalu muat ulang.');
        const d = await loadAllData(user.id);
        setWallets(d.wallets); setTxns(d.txns); setBudgets(d.budgets);
        setNotes(d.notes); setTodos(d.todos); setDebts(d.debts);
        setExpCats(d.expCats); setIncCats(d.incCats);
      } catch (e) {
        setBootError(errMsg(e));
      } finally {
        setLoading(false);
      }
    }, [user.id]);
    useEffect(() => { boot(); }, [boot]);

    /* ===== Nilai turunan ===== */
    const allCats = useMemo(() => [...expCats, ...incCats], [expCats, incCats]);
    const getCat = useCallback((id) => allCats.find((c) => c.id === id), [allCats]);
    const totalBal = useMemo(() => wallets.reduce((s, w) => s + w.balance, 0), [wallets]);
    const mTxns = useMemo(() => txns.filter((t) => t.date && t.date.startsWith(getMY()) && t.type !== 'transfer'), [txns]);
    const mIncome = useMemo(() => mTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0), [mTxns]);
    const mExpense = useMemo(() => mTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [mTxns]);
    const todayTxns = useMemo(() => txns.filter((t) => t.date === getToday()), [txns]);
    const todayExp = useMemo(() => todayTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [todayTxns]);
    const recentTxns = useMemo(() => txns.slice(0, 6), [txns]);
    const catSpend = useMemo(() => {
      const s = {};
      mTxns.filter((t) => t.type === 'expense').forEach((t) => { s[t.category] = (s[t.category] || 0) + t.amount; });
      return s;
    }, [mTxns]);
    const dailyLim = useMemo(() => {
      const now = new Date();
      const dim = daysInMonth(now.getFullYear(), now.getMonth() + 1);
      return budgets.reduce((s, b) => s + (b.limit || 0), 0) / dim;
    }, [budgets]);

    /* ===== Saldo dompet: hitung delta -> simpan server -> UI ===== */
    const applyWalletDelta = async (delta) => {
      const entries = Object.entries(delta || {}).filter(([, v]) => v !== 0);
      if (!entries.length) return;
      await Promise.all(entries.map(async ([wid, d]) => {
        const w = walletsRef.current.find((x) => x.id === wid);
        if (!w) return;
        const nb = Math.round(w.balance + d);
        const { error } = await sb.from('wallets').update({ balance: nb }).eq('id', wid);
        if (error) toast(`Saldo dompet "${w.name}" gagal diperbarui: ${errMsg(error)}`);
        else setWallets((p) => p.map((x) => (x.id === wid ? { ...x, balance: nb } : x)));
      }));
    };

    /* ===== Transaksi berulang: buat anak bulanan di server ===== */
    useEffect(() => {
      if (loading || recRef.current) return;
      recRef.current = true;
      (async () => {
        const my = getMY();
        const dayNum = new Date().getDate();
        const templates = txns.filter((t) => t.isRecurring && t.recurringDay);
        for (const r of templates) {
          try {
            const exists = txns.some((t) => t.recurringPid === r.id && t.date && t.date.startsWith(my));
            if (exists || dayNum < r.recurringDay) continue;
            const payload = txnToRow({ ...r, isRecurring: false, recurringPid: r.id, date: `${my}-${String(r.recurringDay).padStart(2, '0')}` });
            payload.user_id = user.id;
            const { data, error } = await sb.from('transactions').insert(payload).select().single();
            if (error) throw error;
            const nt = rowToTxn(data);
            setTxns((p) => [nt, ...p]);
            await applyWalletDelta(txnDelta(nt));
          } catch (e) { toast('Transaksi berulang gagal dibuat: ' + errMsg(e)); }
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);

    /* ===== Mutasi transaksi ===== */
    const addTxn = async (t) => {
      triggerHaptic();
      try {
        const payload = txnToRow(t); payload.user_id = user.id;
        const { data, error } = await sb.from('transactions').insert(payload).select().single();
        if (error) throw error;
        const nt = rowToTxn(data);
        setTxns((p) => [nt, ...p]);
        await applyWalletDelta(txnDelta(nt));
        return true;
      } catch (e) { toast('Gagal menyimpan transaksi: ' + errMsg(e)); return false; }
    };

    const saveTxn = async (t) => {
      triggerHaptic();
      if (mData && mData.id) {
        try {
          const old = txns.find((x) => x.id === mData.id);
          const payload = txnToRow(t);
          const { data, error } = await sb.from('transactions').update(payload).eq('id', mData.id).select().single();
          if (error) throw error;
          const nt = rowToTxn(data);
          setTxns((p) => p.map((x) => (x.id === nt.id ? { ...nt, createdAt: x.createdAt } : x)));
          if (old) await applyWalletDelta(mergeDelta(flipDelta(txnDelta(old)), txnDelta(nt)));
          return true;
        } catch (e) { toast('Gagal memperbarui transaksi: ' + errMsg(e)); return false; }
      }
      return addTxn(t);
    };

    const delTxn = async (id, callback) => {
      if (!id) return;
      const t = txns.find((x) => x.id === id);
      if (!t) return;
      triggerHaptic();
      try {
        const { error } = await sb.from('transactions').update({ is_deleted: true }).eq('id', id);
        if (error) throw error;
        setTxns((p) => p.filter((x) => x.id !== id));
        await applyWalletDelta(flipDelta(txnDelta(t)));
        setUndoTxn({ txn: t });
        if (callback) callback();
      } catch (e) { toast('Gagal menghapus transaksi: ' + errMsg(e)); }
    };

    useEffect(() => {
      if (!undoTxn) return;
      const tm = setTimeout(() => setUndoTxn(null), 6000);
      return () => clearTimeout(tm);
    }, [undoTxn]);

    const undoDelete = async () => {
      if (!undoTxn) return;
      const t = undoTxn.txn;
      setUndoTxn(null);
      try {
        const { error } = await sb.from('transactions').update({ is_deleted: false }).eq('id', t.id);
        if (error) throw error;
        setTxns((p) => [t, ...p]);
        await applyWalletDelta(txnDelta(t));
        toast('Transaksi dipulihkan', 'ok');
      } catch (e) { toast('Gagal memulihkan transaksi: ' + errMsg(e)); }
    };

    /* ===== Mutasi catatan ===== */
    const addNote = async (n) => {
      triggerHaptic();
      try {
        const { data, error } = await sb.from('notes').insert({
          user_id: user.id, title: n.title || '', content: n.content || '', tags: n.tags || [], pinned: !!n.pinned,
        }).select().single();
        if (error) throw error;
        setNotes((p) => [rowToNote(data), ...p]);
        return true;
      } catch (e) { toast('Gagal menyimpan catatan: ' + errMsg(e)); return false; }
    };
    const updNote = async (id, u) => {
      try {
        const { data, error } = await sb.from('notes').update({
          title: u.title || '', content: u.content || '', tags: u.tags || [], pinned: !!u.pinned, updated_at: new Date().toISOString(),
        }).eq('id', id).select().single();
        if (error) throw error;
        setNotes((p) => p.map((n) => (n.id === id ? rowToNote(data) : n)));
        return true;
      } catch (e) { toast('Gagal memperbarui catatan: ' + errMsg(e)); return false; }
    };
    const delNote = async (id) => {
      try {
        const { error } = await sb.from('notes').delete().eq('id', id);
        if (error) throw error;
        setNotes((p) => p.filter((n) => n.id !== id));
      } catch (e) { toast('Gagal menghapus catatan: ' + errMsg(e)); }
    };

    /* ===== Mutasi tugas ===== */
    const addTodo = async (t) => {
      triggerHaptic();
      try {
        const { data, error } = await sb.from('todos').insert({
          user_id: user.id, title: t.title, completed: false, deadline: t.deadline || null, budget: t.budget || 0,
        }).select().single();
        if (error) throw error;
        setTodos((p) => [rowToTodo(data), ...p]);
        return true;
      } catch (e) { toast('Gagal menambah tugas: ' + errMsg(e)); return false; }
    };
    const togTodo = async (id) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;
      if (!todo.completed && todo.budget > 0) { openM('todoBudget', todo); return; }
      const nv = !todo.completed;
      try {
        const { error } = await sb.from('todos').update({ completed: nv }).eq('id', id);
        if (error) throw error;
        setTodos((p) => p.map((t) => (t.id === id ? { ...t, completed: nv } : t)));
      } catch (e) { toast('Gagal memperbarui tugas: ' + errMsg(e)); }
    };
    const delTodo = async (id) => {
      try {
        const { error } = await sb.from('todos').delete().eq('id', id);
        if (error) throw error;
        setTodos((p) => p.filter((t) => t.id !== id));
      } catch (e) { toast('Gagal menghapus tugas: ' + errMsg(e)); }
    };
    const completeTodoWithExpense = async (todoId, realCost, walletId) => {
      const todo = todos.find((t) => t.id === todoId);
      try {
        const { error } = await sb.from('todos').update({ completed: true }).eq('id', todoId);
        if (error) throw error;
        setTodos((p) => p.map((t) => (t.id === todoId ? { ...t, completed: true } : t)));
      } catch (e) { toast('Gagal memperbarui tugas: ' + errMsg(e)); return; }
      if (todo) {
        const fallback = expCats.find((c) => c.id === 'lainnya_e') || expCats[expCats.length - 1];
        await addTxn({
          type: 'expense', amount: realCost, category: fallback ? fallback.id : '',
          note: `[Tugas] ${todo.title}`.slice(0, 60), date: getToday(), walletId,
        });
      }
      closeM();
    };
    const skipTodoExpense = async (todoId) => {
      try {
        const { error } = await sb.from('todos').update({ completed: true }).eq('id', todoId);
        if (error) throw error;
        setTodos((p) => p.map((t) => (t.id === todoId ? { ...t, completed: true } : t)));
        closeM();
      } catch (e) { toast('Gagal memperbarui tugas: ' + errMsg(e)); }
    };

    /* ===== Mutasi hutang ===== */
    const addDebt = async (d) => {
      triggerHaptic();
      try {
        const { data, error } = await sb.from('debts').insert({
          user_id: user.id, name: d.name, dtype: d.dtype || 'hutang', amount: d.amount,
          due_date: d.dueDate || null, note: d.note || '', status: 'pending',
        }).select().single();
        if (error) throw error;
        setDebts((p) => [rowToDebt(data), ...p]);
        return true;
      } catch (e) { toast('Gagal menyimpan hutang: ' + errMsg(e)); return false; }
    };
    const togDebt = async (id) => {
      const d = debts.find((x) => x.id === id);
      if (!d) return;
      const ns = d.status === 'pending' ? 'paid' : 'pending';
      try {
        const { error } = await sb.from('debts').update({ status: ns }).eq('id', id);
        if (error) throw error;
        setDebts((p) => p.map((x) => (x.id === id ? { ...x, status: ns } : x)));
      } catch (e) { toast('Gagal memperbarui hutang: ' + errMsg(e)); }
    };
    const delDebt = async (id) => {
      try {
        const { error } = await sb.from('debts').delete().eq('id', id);
        if (error) throw error;
        setDebts((p) => p.filter((x) => x.id !== id));
      } catch (e) { toast('Gagal menghapus hutang: ' + errMsg(e)); }
    };

    /* ===== Mutasi dompet ===== */
    const addWallet = async (w) => {
      try {
        const { data, error } = await sb.from('wallets').insert({ user_id: user.id, name: w.name, type: w.type, balance: 0 }).select().single();
        if (error) throw error;
        setWallets((p) => [...p, rowToWallet(data)]);
        return true;
      } catch (e) { toast('Gagal menambah dompet: ' + errMsg(e)); return false; }
    };

    /* ===== Mutasi budget ===== */
    const saveBudgets = async (list) => {
      try {
        for (const b of list) {
          const cats = (b.categories && b.categories.length) ? b.categories : [b.category];
          const { error } = await sb.from('budgets')
            .update({ category: cats[0], categories: cats, amount_limit: b.limit || 0, period: b.period || 'monthly' })
            .eq('id', b.id);
          if (error) throw error;
        }
        setBudgets(list.map((b) => ({
          ...b,
          category: (b.categories && b.categories.length) ? b.categories[0] : b.category,
          categories: (b.categories && b.categories.length) ? b.categories : [b.category],
        })));
        return true;
      } catch (e) { toast('Gagal menyimpan budget: ' + errMsg(e)); return false; }
    };
    const addBudget = async (b) => {
      try {
        const { data, error } = await sb.from('budgets').insert({
          user_id: user.id, category: b.category, categories: b.categories || [b.category],
          amount_limit: b.limit, period: b.period || 'monthly',
        }).select().single();
        if (error) throw error;
        const nb = rowToBudget(data);
        setBudgets((p) => [...p, nb]);
        return nb;
      } catch (e) { toast('Gagal menambah budget: ' + errMsg(e)); return false; }
    };
    const delBudget = async (id) => {
      try {
        const { error } = await sb.from('budgets').delete().eq('id', id);
        if (error) throw error;
        setBudgets((p) => p.filter((b) => b.id !== id));
        return true;
      } catch (e) { toast('Gagal menghapus budget: ' + errMsg(e)); return false; }
    };

    /* ===== Mutasi kategori ===== */
    const addCat = async (name, type) => {
      const nm = String(name || '').trim();
      if (!nm) return false;
      const code = 'c' + genId();
      const color = CAT_COLORS[Math.floor(Math.random() * CAT_COLORS.length)];
      try {
        const { data, error } = await sb.from('categories').insert({ user_id: user.id, name: nm, color, type, code }).select().single();
        if (error) throw error;
        const c = rowToCat(data);
        if (type === 'expense') setExpCats((p) => [...p, c]); else setIncCats((p) => [...p, c]);
        return true;
      } catch (e) { toast('Gagal menambah kategori: ' + errMsg(e)); return false; }
    };
    const delCat = async (id) => {
      const c = allCats.find((x) => x.id === id);
      if (!c) return false;
      if (!confirm(`Hapus kategori "${c.name}"? Riwayat transaksi lama tetap ada tapi tanpa kategori.`)) return false;
      try {
        const { error } = await sb.from('categories').delete().eq('id', c.dbId);
        if (error) throw error;
        setExpCats((p) => p.filter((x) => x.id !== id));
        setIncCats((p) => p.filter((x) => x.id !== id));
        return true;
      } catch (e) { toast('Gagal menghapus kategori: ' + errMsg(e)); return false; }
    };

    /* ===== Router modal ===== */
    const openM = (t, d = null) => { setMData(d); setModal(t); };
    const closeM = () => { setModal(null); setMData(null); };

    /* ===== Swipe antar-tab (dengan pengaman anti-konflik) ===== */
    const tabs = ['home', 'notes', 'finance', 'settings'];
    const touchX = useRef(0);
    const touchY = useRef(0);
    const swipeOk = useRef(true);
    const handleTouchStart = (e) => {
      // jangan deteksi swipe dari area yang punya gestur sendiri
      swipeOk.current = !e.target.closest('.swipe-wrap, .sheet-overlay, .sb-hide, .numpad, input, textarea, select, video');
      touchX.current = e.touches[0].clientX;
      touchY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e) => {
      if (!swipeOk.current || modal) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      const dy = e.changedTouches[0].clientY - touchY.current;
      if (Math.abs(dx) > 90 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        const idx = tabs.indexOf(tab);
        if (dx < 0 && idx < tabs.length - 1) setTab(tabs[idx + 1]);
        else if (dx > 0 && idx > 0) setTab(tabs[idx - 1]);
      }
    };

    /* ===== Layar error boot ===== */
    if (bootError && !loading) {
      return (
        <div className="boot-error">
          <div className="ic"><I.Alert size={28} /></div>
          <div>
            <h1 className="lg bold" style={{ marginBottom: 8 }}>Gagal memuat data</h1>
            <p className="sm dim" style={{ maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>{bootError}</p>
          </div>
          <button className="btn btn-primary" style={{ padding: '13px 34px' }} onClick={boot}>Coba Lagi</button>
          <button className="xs faint" style={{ textDecoration: 'underline' }} onClick={() => sb.auth.signOut()}>Keluar dari akun</button>
        </div>
      );
    }

    return (
      <div style={{ minHeight: '100vh' }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {!online && <div className="offline-banner">Kamu sedang offline — perubahan tidak bisa disimpan</div>}

        <div className="page anim-page" key={pageKey}>
          {tab === 'home' && (
            <NH.Home
              wallets={wallets} totalBal={totalBal} mIncome={mIncome} mExpense={mExpense}
              todayExp={todayExp} todayTxns={todayTxns} recentTxns={recentTxns}
              todos={todos} budgets={budgets} catSpend={catSpend} allCats={allCats}
              dailyLim={dailyLim} openM={openM} loading={loading} setTab={setTab} togTodo={togTodo}
              hideBal={hideBal} toggleHideBal={() => setHideBal(!hideBal)} mascotId={mascotId}
            />
          )}
          {tab === 'notes' && (
            <NH.Notes
              notes={notes} todos={todos} addNote={addNote} updNote={updNote} delNote={delNote}
              addTodo={addTodo} togTodo={togTodo} delTodo={delTodo} openM={openM} loading={loading}
            />
          )}
          {tab === 'finance' && (
            <NH.Finance
              wallets={wallets} txns={txns} budgets={budgets} catSpend={catSpend} debts={debts}
              mIncome={mIncome} mExpense={mExpense} totalBal={totalBal} allCats={allCats} getCat={getCat}
              addDebt={addDebt} togDebt={togDebt} delDebt={delDebt} delTxn={delTxn}
              openM={openM} loading={loading} hideBal={hideBal}
            />
          )}
          {tab === 'settings' && (
            <NH.Settings
              user={user} wallets={wallets} txns={txns} notes={notes} todos={todos} debts={debts}
              expCats={expCats} incCats={incCats} addCat={addCat} delCat={delCat}
              theme={themeId} setThemeId={setThemeId} mascotId={mascotId} setMascotId={setMascotId}
              hideBal={hideBal} setHideBal={setHideBal} onRefresh={boot} toast={toast}
            />
          )}
        </div>

        {/* ===== Navigasi bawah ===== */}
        <nav className="bottom-nav">
          <div className="nav-inner">
            <NB ic={<I.Home size={21} />} lb="Beranda" ac={tab === 'home'} fn={() => setTab('home')} />
            <NB ic={<I.Notes size={21} />} lb="Catatan" ac={tab === 'notes'} fn={() => setTab('notes')} />
            <button className="fab" onClick={() => { triggerHaptic(); openM('quickAdd'); }} aria-label="Tambah">
              <I.Plus size={26} />
            </button>
            <NB ic={<I.Chart size={21} />} lb="Keuangan" ac={tab === 'finance'} fn={() => setTab('finance')} />
            <NB ic={<I.Gear size={21} />} lb="Setelan" ac={tab === 'settings'} fn={() => setTab('settings')} />
          </div>
        </nav>

        {/* ===== Modal ===== */}
        {modal === 'quickAdd' && <NH.QuickAddModal close={closeM} openM={openM} />}
        {modal === 'scanReceipt' && (
          <NH.ScanModal
            close={closeM} openM={openM} expCats={expCats} wallets={wallets}
            learnedKw={learnedKw} setLearnedKw={setLearnedKw} addTxn={addTxn} toast={toast}
          />
        )}
        {modal === 'addTxn' && <NH.TxnModal close={closeM} save={saveTxn} wallets={wallets} expCats={expCats} incCats={incCats} ed={mData} />}
        {modal === 'addNote' && <NH.NoteModal close={closeM} save={mData && mData.id ? (n) => updNote(mData.id, n) : addNote} ed={mData} />}
        {modal === 'addWallet' && <NH.WalletModal close={closeM} save={addWallet} />}
        {modal === 'editBudget' && <NH.BudgetModal close={closeM} budgets={budgets} expCats={expCats} save={saveBudgets} addBudget={addBudget} delBudget={delBudget} />}
        {modal === 'addDebt' && <NH.DebtModal close={closeM} save={addDebt} />}
        {modal === 'txnDetail' && (
          <NH.TxnDetailModal
            txn={mData} close={closeM} getCat={getCat} wallets={wallets}
            del={() => { const id = mData.id; closeM(); setTimeout(() => delTxn(id), 120); }}
            edit={() => openM('addTxn', mData)}
          />
        )}
        {modal === 'todoBudget' && (
          <NH.TodoBudgetModal close={closeM} todo={mData} wallets={wallets}
            completeWithExpense={completeTodoWithExpense} skipExpense={skipTodoExpense} />
        )}

        {/* ===== Undo hapus ===== */}
        {undoTxn && (
          <div className="undo-bar">
            <div className="undo-card">
              <span>🗑️ Transaksi dihapus</span>
              <button className="bold accent" onClick={undoDelete} style={{ padding: '4px 10px' }}>UNDO</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function NB({ ic, lb, ac, fn }) {
    return (
      <button className={`nav-btn ${ac ? 'active' : ''}`} onClick={fn}>
        <span className="nav-ic">{ic}</span>
        <span>{lb}</span>
      </button>
    );
  }

  /* ===== Render ===== */
  ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
})();
