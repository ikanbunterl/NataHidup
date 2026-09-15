/* ============================================================
   NataHidup V2 — Layar Autentikasi
   Login / Daftar / Lupa password (Supabase Auth email+password).
   ============================================================ */
window.NH = window.NH || {};

NH.AuthScreen = (function () {
  const { useState } = React;
  const { sb } = NH.db;
  const { APP_NAME } = NH.config;
  const Mascot = NH.Mascot;
  const I = NH.I;

  const AUTH_ERR_MAP = {
    'Invalid login credentials': 'Email atau password salah.',
    'Email not confirmed': 'Email belum dikonfirmasi. Cek inbox/spam kamu, lalu coba lagi.',
    'User already registered': 'Email sudah terdaftar. Silakan masuk.',
    'Password should be at least 6 characters.': 'Password minimal 6 karakter.',
    'Unable to validate email address: invalid format': 'Format email tidak valid.',
    'For security purposes, you can only request this after 60 seconds.': 'Tunggu sebentar sebelum meminta ulang.',
    'Email rate limit exceeded': 'Terlalu banyak percobaan. Coba lagi beberapa menit.',
    'Email rate limit exceeded: reached hourly limit, try again later': 'Terlalu banyak percobaan. Coba lagi nanti.',
  };
  const authErr = (m) => {
    const s = String(m || '');
    if (AUTH_ERR_MAP[s]) return AUTH_ERR_MAP[s];
    const k = Object.keys(AUTH_ERR_MAP).find((key) => s.toLowerCase().includes(key.toLowerCase()));
    return k ? AUTH_ERR_MAP[k] : s;
  };

  return function AuthScreen() {
    const [mode, setMode] = useState('login'); // login | register | forgot
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [pw2, setPw2] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const [info, setInfo] = useState('');

    const switchMode = (m) => { setMode(m); setErr(''); setInfo(''); setPw(''); setPw2(''); };

    const login = async (e) => {
      e.preventDefault(); if (busy) return;
      setBusy(true); setErr(''); setInfo('');
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pw });
      setBusy(false);
      if (error) setErr(authErr(error.message));
    };

    const register = async (e) => {
      e.preventDefault(); if (busy) return;
      if (pw.length < 6) { setErr('Password minimal 6 karakter.'); return; }
      if (pw !== pw2) { setErr('Konfirmasi password tidak cocok.'); return; }
      setBusy(true); setErr(''); setInfo('');
      const { data, error } = await sb.auth.signUp({ email: email.trim(), password: pw });
      setBusy(false);
      if (error) { setErr(authErr(error.message)); return; }
      if (!(data && data.session))
        setInfo('Pendaftaran berhasil! Cek email kamu (termasuk folder spam) untuk konfirmasi akun, lalu masuk kembali.');
      else setInfo('Akun dibuat. Selamat datang! 🌱');
    };

    const resend = async () => {
      if (!email.trim()) { setErr('Isi email kamu dulu.'); return; }
      const { error } = await sb.auth.resend({ type: 'signup', email: email.trim() });
      if (error) { setErr(authErr(error.message)); return; }
      setInfo('Email konfirmasi dikirim ulang. Cek inbox/spam kamu.');
    };

    const reset = async (e) => {
      e.preventDefault(); if (busy) return;
      if (!email.trim()) { setErr('Isi email kamu dulu.'); return; }
      setBusy(true); setErr(''); setInfo('');
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.href });
      setBusy(false);
      if (error) { setErr(authErr(error.message)); return; }
      setInfo('Link reset password sudah dikirim ke email kamu.');
    };

    return (
      <div className="auth-wrap">
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div className="auth-logo">🌱</div>
          <h1 className="auth-title">{APP_NAME}</h1>
          <p className="auth-sub">Keuangan & produktivitas pribadi,<br />tersinkron aman di cloud</p>

          <div className="auth-card">
            {mode !== 'forgot' && (
              <div className="seg" style={{ marginBottom: 18 }}>
                <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Masuk</button>
                <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Daftar</button>
              </div>
            )}
            {err !== '' && <div className="form-msg error">{err}</div>}
            {info !== '' && <div className="form-msg info">{info}</div>}

            {mode === 'login' && (
              <form onSubmit={login} className="col gap-3">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                <input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
                <button type="submit" disabled={busy} className="btn btn-primary btn-block">
                  {busy ? 'Memproses...' : 'Masuk'}
                </button>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => switchMode('forgot')} className="xs dim" style={{ textDecoration: 'underline' }}>Lupa password?</button>
                  <button type="button" onClick={resend} className="xs dim" style={{ textDecoration: 'underline' }}>Kirim ulang email konfirmasi</button>
                </div>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={register} className="col gap-3">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                <input type="password" placeholder="Password (min. 6 karakter)" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" required />
                <input type="password" placeholder="Ulangi password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" required />
                <button type="submit" disabled={busy} className="btn btn-primary btn-block">
                  {busy ? 'Memproses...' : 'Buat Akun'}
                </button>
                <p className="xs faint center">Data kamu tersimpan di cloud Supabase dan bisa diakses dari perangkat mana pun dengan akun ini.</p>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={reset} className="col gap-3">
                <p className="xs dim">Masukkan email akunmu. Kami kirimkan link untuk mengatur password baru.</p>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                <button type="submit" disabled={busy} className="btn btn-primary btn-block">
                  {busy ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
                <button type="button" onClick={() => switchMode('login')} className="btn btn-ghost btn-block btn-sm">Kembali ke Login</button>
              </form>
            )}
          </div>

          <div className="row gap-2 anim-float" style={{ justifyContent: 'center', marginTop: 26, opacity: 0.9 }}>
            <Mascot id="capybara" size={64} />
          </div>
        </div>
      </div>
    );
  };
})();
