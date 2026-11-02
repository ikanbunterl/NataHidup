/* NataHidup V3 — OCR worker same-origin (BUG-004).
   CSP ketat cukup mengizinkan worker-src 'self' — blob: hanya fallback. */
self.onmessage = function (ev) {
  var d = ev.data || {};
  try { importScripts(d.cdn); }
  catch (err) { self.postMessage({ type: 'error', message: 'CDN gagal: ' + err }); return; }
  Tesseract.recognize(d.blob, 'ind+eng', {
    logger: function (m) {
      if (m && m.status) self.postMessage({ type: 'progress', status: m.status, progress: m.progress || 0 });
    }
  }).then(function (r) {
    self.postMessage({ type: 'done', text: (r.data && r.data.text) || '' });
  }).catch(function (err) {
    self.postMessage({ type: 'error', message: String((err && err.message) || err) });
  });
};
