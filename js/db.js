/* ============================================================
   NataHidup V2 — Lapisan database (Supabase)
   Klien, pemetaan baris (snake_case) <-> objek UI (camelCase),
   pemeriksaan skema, dan pemuatan data awal + seed default.
   Skema tabel TIDAK berubah dari V1 — data lama tetap terpakai.
   ============================================================ */
window.NH = window.NH || {};

NH.db = (function () {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, DEF_WALLETS, DEF_EXP_CAT, DEF_INC_CAT, DEF_BUDGETS } = NH.config;
  const { getToday } = NH.utils;

  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ===== Pemetaan baris database <-> objek UI =====
  const rowToWallet = (r) => ({ id: r.id, name: r.name, type: r.type, balance: Number(r.balance) || 0 });

  const rowToTxn = (r) => ({
    id: r.id,
    type: r.type,
    amount: Number(r.amount) || 0,
    category: r.category || '',
    note: r.note || '',
    date: String(r.date || '').slice(0, 10),
    walletId: r.wallet_id || '',
    transferFrom: r.transfer_from || '',
    transferTo: r.transfer_to || '',
    isRecurring: !!r.is_recurring,
    recurringDay: (r.recurring_day === null || r.recurring_day === undefined) ? null : r.recurring_day,
    recurringPid: r.recurring_pid || '',
    createdAt: r.created_at,
  });

  const txnToRow = (t) => ({
    type: t.type,
    amount: t.amount,
    category: t.category || null,
    note: t.note || null,
    date: t.date || getToday(),
    wallet_id: t.walletId || null,
    transfer_from: t.transferFrom || null,
    transfer_to: t.transferTo || null,
    is_recurring: !!t.isRecurring,
    recurring_day: t.isRecurring ? (t.recurringDay || null) : null,
    recurring_pid: t.recurringPid || null,
  });

  const rowToCat = (r) => ({ id: r.code, dbId: r.id, name: r.name, color: r.color, type: r.type });
  const rowToBudget = (r) => ({
    id: r.id,
    category: r.category,
    categories: (r.categories && r.categories.length) ? r.categories : [r.category],
    limit: Number(r.amount_limit) || 0,
    period: r.period || 'monthly',
  });
  const rowToNote = (r) => ({
    id: r.id, title: r.title || '', content: r.content || '', tags: r.tags || [],
    pinned: !!r.pinned, createdAt: r.created_at, updatedAt: r.updated_at || r.created_at,
  });
  const rowToTodo = (r) => ({
    id: r.id, title: r.title, completed: !!r.completed,
    deadline: r.deadline || null, budget: Number(r.budget) || 0, createdAt: r.created_at,
  });
  const rowToDebt = (r) => ({
    id: r.id, name: r.name, dtype: r.dtype || 'hutang', amount: Number(r.amount) || 0,
    dueDate: r.due_date || null, note: r.note || '', status: r.status || 'pending', createdAt: r.created_at,
  });

  // ===== Delta saldo dompet yang dihasilkan sebuah transaksi =====
  const txnDelta = (t) => {
    const d = {};
    if (t.type === 'transfer') {
      if (t.transferFrom) d[t.transferFrom] = -t.amount;
      if (t.transferTo) d[t.transferTo] = (d[t.transferTo] || 0) + t.amount;
    } else if (t.walletId) {
      d[t.walletId] = (t.type === 'income' ? 1 : -1) * t.amount;
    }
    return d;
  };
  const flipDelta = (d) => { const o = {}; Object.keys(d || {}).forEach((k) => { o[k] = -d[k]; }); return o; };
  const mergeDelta = (a, b) => {
    const o = { ...(a || {}) };
    Object.keys(b || {}).forEach((k) => { o[k] = (o[k] || 0) + b[k]; });
    return o;
  };

  // ===== Cek kelengkapan skema sebelum boot =====
  async function checkSchema() {
    const probes = await Promise.all([
      sb.from('categories').select('code').limit(1),
      sb.from('transactions').select('recurring_pid').limit(1),
      sb.from('budgets').select('id').limit(1),
      sb.from('notes').select('id').limit(1),
      sb.from('todos').select('id').limit(1),
      sb.from('debts').select('id').limit(1),
    ]);
    const labels = [
      'kolom categories.code', 'kolom transactions.recurring_pid',
      'tabel budgets', 'tabel notes', 'tabel todos', 'tabel debts',
    ];
    return probes.map((p, i) => (p.error ? labels[i] : null)).filter(Boolean);
  }

  // ===== Unduh semua data pengguna + seed default bila kosong =====
  async function loadAllData(uid) {
    const [wR, cR, tR] = await Promise.all([
      sb.from('wallets').select('*').eq('user_id', uid).order('created_at', { ascending: true }),
      sb.from('categories').select('*').eq('user_id', uid).order('created_at', { ascending: true }),
      sb.from('transactions').select('*').eq('user_id', uid).eq('is_deleted', false)
        .order('date', { ascending: false }).order('created_at', { ascending: false }),
    ]);
    if (wR.error) throw wR.error;
    if (cR.error) throw cR.error;
    if (tR.error) throw tR.error;

    const [bgR, nR, tdR, dbR] = await Promise.all([
      sb.from('budgets').select('*').eq('user_id', uid),
      sb.from('notes').select('*').eq('user_id', uid).order('updated_at', { ascending: false }),
      sb.from('todos').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      sb.from('debts').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    ]);
    if (bgR.error) throw bgR.error;
    if (nR.error) throw nR.error;
    if (tdR.error) throw tdR.error;
    if (dbR.error) throw dbR.error;

    // Seed kategori default untuk akun baru
    let cats = cR.data.filter((r) => r.code).map(rowToCat);
    if (!cR.data.length) {
      const seed = [...DEF_EXP_CAT, ...DEF_INC_CAT]
        .map((c) => ({ user_id: uid, name: c.name, color: c.color, type: c.type, code: c.id }));
      const { data, error } = await sb.from('categories').insert(seed).select();
      if (error) throw error;
      cats = data.map(rowToCat);
    }

    // Seed dompet default
    let wallets = wR.data.map(rowToWallet);
    if (!wR.data.length) {
      const seed = DEF_WALLETS.map((w) => ({ user_id: uid, name: w.name, type: w.type, balance: 0 }));
      const { data, error } = await sb.from('wallets').insert(seed).select();
      if (error) throw error;
      wallets = data.map(rowToWallet);
    }

    // Seed budget default
    let budgets = bgR.data.map(rowToBudget);
    if (!bgR.data.length) {
      const seed = DEF_BUDGETS.map((b) => ({
        user_id: uid, category: b.category, categories: b.categories,
        amount_limit: b.limit, period: b.period,
      }));
      const { data, error } = await sb.from('budgets').insert(seed).select();
      if (error) throw error;
      budgets = data.map(rowToBudget);
    }

    return {
      wallets,
      txns: tR.data.map(rowToTxn),
      budgets,
      notes: nR.data.map(rowToNote),
      todos: tdR.data.map(rowToTodo),
      debts: dbR.data.map(rowToDebt),
      expCats: cats.filter((c) => c.type === 'expense'),
      incCats: cats.filter((c) => c.type === 'income'),
    };
  }

  return {
    sb,
    rowToWallet, rowToTxn, txnToRow, rowToCat, rowToBudget, rowToNote, rowToTodo, rowToDebt,
    txnDelta, flipDelta, mergeDelta,
    checkSchema, loadAllData,
  };
})();
