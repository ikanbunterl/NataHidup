/* ============================================================
   NataHidup V2 — Script build (mode B: bundle)
   Sumber (js/*.jsx, css/*.css — 26 file modular) dikompres jadi:
       deploy/app.bundle.js   (semua JS+JSX, terminify)
       deploy/styles.css      (3 CSS jadi 1, terminify)
   lalu index.html, manifest, sw, dan ikon disalin.
   Yang di-UPLOAD ke hosting = ISI FOLDER deploy/.

   Pakai:  npm run build
   ============================================================ */
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'deploy');

const kb = (n) => (n / 1024).toFixed(1) + ' KB';

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'icons'), { recursive: true });

  // 1) Bundle JS+JSX (tanpa Babel di browser lagi)
  const jsRes = esbuild.buildSync({
    entryPoints: [path.join(__dirname, 'entry.js')],
    bundle: true,
    minify: true,
    outfile: path.join(OUT, 'app.bundle.js'),
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    target: ['es2018'],
    legalComments: 'none',
    logLevel: 'warning',
  });

  // 2) Bundle CSS
  esbuild.buildSync({
    entryPoints: [path.join(__dirname, 'styles.entry.css')],
    bundle: true,
    minify: true,
    outfile: path.join(OUT, 'styles.css'),
    logLevel: 'warning',
  });

  // 3) HTML, manifest, service worker
  fs.copyFileSync(path.join(__dirname, 'index.template.html'), path.join(OUT, 'index.html'));
  fs.copyFileSync(path.join(ROOT, 'manifest.json'), path.join(OUT, 'manifest.json'));
  fs.copyFileSync(path.join(__dirname, 'sw.deploy.js'), path.join(OUT, 'sw.js'));

  // 4) Ikon
  for (const f of fs.readdirSync(path.join(ROOT, 'icons'))) {
    if (f.endsWith('.png')) fs.copyFileSync(path.join(ROOT, 'icons', f), path.join(OUT, 'icons', f));
  }

  // 5) Laporan
  const rows = [];
  const walk = (dir, base = '') => {
    for (const f of fs.readdirSync(dir).sort()) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) walk(p, base + f + '/');
      else rows.push([base + f, fs.statSync(p).size]);
    }
  };
  walk(OUT);
  const core = rows.filter(([n]) => !n.startsWith('icons/'));
  console.log('\n=== deploy/ (yang di-upload) ===');
  core.forEach(([n, s]) => console.log(`  ${n.padEnd(22)} ${kb(s)}`));
  const iconsSize = rows.filter(([n]) => n.startsWith('icons/')).reduce((a, [, s]) => a + s, 0);
  console.log(`  ${'icons/ (12 file)'.padEnd(22)} ${kb(iconsSize)}`);
  console.log(`  TOTAL file inti: ${core.length} (vs mode sumber: 31 file inti)`);
  const srcJs = fs.readdirSync(path.join(ROOT, 'js'), { recursive: true })
    .filter((f) => String(f).match(/\.(js|jsx)$/))
    .reduce((a, f) => a + fs.statSync(path.join(ROOT, 'js', String(f))).size, 0);
  console.log(`  JS sumber ${kb(srcJs)} -> bundle ${kb(fs.statSync(path.join(OUT, 'app.bundle.js')).size)} (minify)`);
  console.log('  Babel standalone (2,8 MB) tidak lagi diunduh visitor ✔');
  if (jsRes && jsRes.errors && jsRes.errors.length) process.exit(1);
}

main();
