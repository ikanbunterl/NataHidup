/* ============================================================
   NataHidup V2 — Tema dinamis
   Menerapkan tema melalui CSS variables (data-theme di <html>).
   Lihat css/themes.css untuk definisi variabel tiap tema.
   ============================================================ */
window.NH = window.NH || {};

NH.theme = (function () {
  const { THEMES, DEFAULT_THEME, KEYS } = NH.config;

  const getTheme = (id) => THEMES.find((t) => t.id === id) || THEMES.find((t) => t.id === DEFAULT_THEME);

  function apply(id) {
    const t = getTheme(id);
    document.documentElement.setAttribute('data-theme', t.id);
    document.documentElement.classList.toggle('light', !t.dark);
    // warna address bar browser mengikuti tema
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t.meta);
    try { localStorage.setItem(KEYS.theme, JSON.stringify(t.id)); } catch (e) {}
    return t;
  }

  function current() {
    try {
      const raw = localStorage.getItem(KEYS.theme);
      return getTheme(raw ? JSON.parse(raw) : DEFAULT_THEME);
    } catch (e) { return getTheme(DEFAULT_THEME); }
  }

  // Dipanggil sedini mungkin (sebelum React render) agar tidak ada
  // kedipan tema default saat halaman dimuat.
  function init() { apply(current().id); }

  return { apply, current, init, getTheme };
})();

NH.theme.init();
