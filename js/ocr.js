/* ============================================================
   NataHidup V2 — Mesin OCR struk (OFFLINE, ditulis ulang)
   Hanya memakai Tesseract.js. Tidak ada API online (Taggun/Mindee
   dihapus total di V2). Alur:
     foto/gambar -> teks mentah -> parseReceipt() -> {amount, date,
     note, category, confidence}
   Semua fungsi parsing murni & teruji terpisah dari UI.
   ============================================================ */
window.NH = window.NH || {};

NH.ocr = (function () {
  const { toNum, normDate, getToday } = NH.utils;
  const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/tesseract.min.js';

  // ===== Muat library Tesseract sekali (lazy) =====
  let loadingPromise = null;
  function ensureTesseract() {
    if (typeof Tesseract !== 'undefined') return Promise.resolve();
    if (loadingPromise) return loadingPromise;
    loadingPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = TESSERACT_CDN;
      s.onload = resolve;
      s.onerror = () => {
        loadingPromise = null;
        reject(new Error('Gagal memuat mesin OCR. Butuh internet sekali saat pertama dipakai.'));
      };
      document.head.appendChild(s);
    });
    return loadingPromise;
  }

  // ===== Jalankan pemindaian penuh =====
  async function scan(blob, onProgress) {
    onProgress(3, 'Menyiapkan mesin OCR...');
    await ensureTesseract();
    const res = await Tesseract.recognize(blob, 'ind+eng', {
      logger: (m) => {
        if (!m || !m.status) return;
        if (m.status === 'recognizing text') {
          onProgress(10 + Math.round(m.progress * 88), 'Membaca teks struk...');
        } else if (/language/i.test(m.status)) {
          onProgress(5, 'Mengunduh model bahasa (~5 MB, sekali saja)...');
        }
      },
    });
    return parseReceipt(res.data.text || '');
  }

  /* ============================================================
     PARSING STRUK
     ============================================================ */

  // Baris "sampah" yang tidak mungkin nama toko
  const JUNK_RX = /(alamat|address|jl\.|jln\b|jalan\b|telp|telpon|telepon|phone|\bhp\b|whatsapp|npwp|gst|vat\b|ppn\b|cabang|branch|nomor|no\s*\.|struk|receipt|invoice|faktur|tanggal|date\b|kasir|cashier|operator|layanan|service|hotline|terima\s*kasih|thank\s*you|selamat|www\.|https?|\.com|\.co\.id|@)/i;
  // Kata kunci yang menandakan nama toko
  const STORE_RX = /(mart|store|toko|cafe|caffe|coffee|resto|restaurant|warung|kopi|shop|market|grosir|food|bakery|apotek|apotik|farmasi|laundry|salon|barber|bioskop|cinema|mall|plaza|supermarket|minimarket|kantin|sehat|jaya|maju|makmur|abadi|sentosa)/i;

  // Sinyal kuat tingkat MERCHANT — dicek sebelum pola per-item,
  // supaya "INDOMIE" di struk Indomaret tidak mengalahkan "indomaret".
  const PRIORITY_MAP = [
    { key: 'belanja',   rx: /(alfamart|indomaret|indogrosir|hypermart|superindo|transmart|carrefour|giant\b|lottemart|lotte mart|supermarket|minimarket|grosir)/ },
    { key: 'transport', rx: /(spbu|pertamina|pertalite|pertamax|shell\b|gojek|grab\b|blue\s*bird)/ },
    { key: 'kopi',      rx: /(starbucks|janji jiwa|kenangan|excelso|fore coffee|kopi kenangan)/ },
    { key: 'kesehatan', rx: /(apotek|apotik|guardian|watsons|kimia\s*farma|klinik)/ },
  ];

  // Skor kata kunci "total": grand total > total belanja > total biasa
  const TOTAL_PATTERNS = [
    { rx: /(grand\s*total|total\s*akhir)/i, score: 5 },
    { rx: /(total\s*belanja|total\s*tagihan|total\s*bayar|total\s*amount|amount\s*due|total\s*harga|jumlah\s*tagihan)/i, score: 4 },
    { rx: /(total|jumlah|bayar)\b/i, score: 3 },
    { rx: /(subtotal|sub\s*total)/i, score: 1 },
  ];
  const CASH_RX = /(tunai|cash|dibayar|diterima|received|pembayaran)/i;
  const CHANGE_RX = /(kembali|kembalian|change\b)/i;

  // Ambil semua angka bermakna dari satu baris
  function lineNumbers(line) {
    const clean = line.replace(/rp\.?/gi, ' ');
    const parts = clean.match(/[\d][\d.,]*[\d]|[\d]/g) || [];
    const out = [];
    for (const p of parts) {
      // lewati kandidat nomor telepon/kode panjang tanpa pemisah (>= 8 digit polos)
      if (/^\d{8,}$/.test(p.replace(/[^\d]/g, '')) && !/[.,]/.test(p)) continue;
      const v = toNum(p);
      if (v > 0) out.push(v);
    }
    return out;
  }

  function bestTotalScore(line) {
    let s = 0;
    for (const p of TOTAL_PATTERNS) if (p.rx.test(line)) s = Math.max(s, p.score);
    return s;
  }

  // Cari nominal utama struk: utamakan verifikasi matematika
  // (Tunai − Kembali = Total), lalu baris ber-kata-kunci total.
  function findAmount(lines) {
    let cashVal = 0, changeVal = 0;
    let kwTotal = 0, kwScore = 0;
    let maxAny = 0;
    const reasonable = (v) => v > 100 && v < 5e7;

    for (const line of lines) {
      const nums = lineNumbers(line).filter(reasonable);
      if (!nums.length) continue;
      const mx = Math.max(...nums);
      if (mx > maxAny) maxAny = mx;

      const ts = bestTotalScore(line);
      if (ts > 0 && ts >= kwScore) {
        // bila beberapa total, ambil skor tertinggi; nilai terbesar pada baris itu
        if (ts > kwScore || mx > kwTotal) { kwTotal = mx; kwScore = ts; }
      }
      if (CASH_RX.test(line) && !CHANGE_RX.test(line)) cashVal = Math.max(cashVal, mx);
      if (CHANGE_RX.test(line) && !CASH_RX.test(line)) changeVal = Math.max(changeVal, mx);
    }

    // 1) Verifikasi matematika: tunai − kembali = total
    const mathTotal = (cashVal > changeVal && changeVal >= 0 && cashVal > 0) ? cashVal - changeVal : 0;
    if (mathTotal > 0 && reasonable(mathTotal)) {
      const agreesWithKw = kwTotal > 0 && Math.abs(kwTotal - mathTotal) <= Math.max(1, mathTotal * 0.02);
      if (agreesWithKw) return { amount: Math.round(mathTotal), confidence: 'high' };
      if (kwTotal === 0) return { amount: Math.round(mathTotal), confidence: 'med' };
      // kata kunci total tidak cocok dengan matematika → tetap percaya matematika bila
      // selisihnya besar (OCR sering salah baca salah satu)
      return { amount: Math.round(mathTotal), confidence: 'med' };
    }

    // 2) Baris kata kunci total
    if (kwTotal > 0 && kwScore >= 3) return { amount: Math.round(kwTotal), confidence: kwScore >= 4 ? 'high' : 'med' };
    if (kwTotal > 0) return { amount: Math.round(kwTotal), confidence: 'med' };

    // 3) Angka terbesar yang wajar di seluruh struk
    if (maxAny > 0) return { amount: Math.round(maxAny), confidence: 'low' };
    return { amount: 0, confidence: 'low' };
  }

  // Cari nama toko dari beberapa baris pertama
  function findMerchant(lines) {
    let best = null, bestScore = 0;
    const head = lines.slice(0, 8);
    head.forEach((line, idx) => {
      if (line.length < 3 || line.length > 60) return;
      if (/^[\d\s.,:/-]+$/.test(line)) return; // lewati baris murni angka (barcode, nomor struk)
      if (bestTotalScore(line) > 0 || CASH_RX.test(line) || CHANGE_RX.test(line)) return; // baris total/tunai/kembali bukan nama toko
      let score = 0;
      const isStore = STORE_RX.test(line);
      if (JUNK_RX.test(line)) score -= isStore ? 1 : 4; // nama toko+cabang tetap berharga
      if (isStore) score += 3;
      const letters = (line.match(/[a-zA-Z]/g) || []).length;
      if (letters / Math.max(line.length, 1) > 0.6) score += 2;
      if (line === line.toUpperCase() && letters > 3) score += 1;
      if (/\d{4,}/.test(line)) score -= 2;
      score -= idx * 0.2; // baris lebih atas sedikit diunggulkan
      if (score > bestScore) { bestScore = score; best = line; }
    });
    if (!best) {
      best = head.find((l) =>
        l.length > 3 && !JUNK_RX.test(l) && /[a-zA-Z]{3}/.test(l) &&
        bestTotalScore(l) === 0 && !CASH_RX.test(l) && !CHANGE_RX.test(l)
      ) || 'Scan struk';
    }
    return best.replace(/\s+/g, ' ').trim().slice(0, 40);
  }

  /* ============================================================
     PENEBAK KATEGORI + AUTO-LEARN
     learnedKw: { 'kata kunci': catId } — memori hasil koreksi user.
     ============================================================ */
  const KEYWORD_MAP = [
    { key: 'transport', rx: /(spbu|bensin|pertalite|pertamax|pertamina|solar\b|shell\b|parkir|\btol\b|e-?toll|gojek|grab\b|krl|mrt|transjakarta|busway|angkot|ojol|taksi|taxi|blue\s*bird|kereta|damri|tiket\s*(bus|kereta|pesawat))/ },
    { key: 'kopi',      rx: /(kopi|coffee|cafe|caffe|starbucks|janji\s*jiwa|kenangan|fore\b|tuku|excelso|teh\s*tarik)/ },
    { key: 'makan',     rx: /(resto|restaurant|warung|makan|sate|bakso|mie\b|nasi\b|mcd|kfc|ayam|padang|seafood|pizza|burger|warteg|kantin|food\b|bakery|roti|martabak)/ },
    { key: 'kesehatan', rx: /(apotek|apotik|klinik|rumah\s*sakit|\brs\b|farmasi|guardian|watsons|kimia\s*farma|dokter|laboratorium|vitamin|obat)/ },
    { key: 'tagihan',   rx: /(pln|listrik|token|pulsa|paket\s*data|telkomsel|xl\b|indosat|tri\b|smartfren|indihome|wifi|internet|bpjs|pdam|air\b|iuran|tagihan|spp\b.*listrik)/ },
    { key: 'hiburan',   rx: /(cinema|xxi|cgv|bioskop|netflix|spotify|youtube|google\s*play|steam\b|game\b|karaoke|wisata|taman\s*bermain|konser|langganan)/ },
    { key: 'belanja',   rx: /(alfamart|indomaret|indogrosir|hypermart|superindo|transmart|lotte|giant\b|carrefour|supermarket|minimarket|grosir|buah|sayur|shopee|tokopedia|blibli|lazada|tiktok\s*shop|baju|celana|sepatu|skincare|makeup)/ },
    { key: 'pendidikan',rx: /(sekolah|spp\b|universitas|kampus|bimbel|kursus|les\b|buku|gramedia|yayasan|uktr|kuliah)/ },
    { key: 'cicilan',   rx: /(cicilan|angsuran|kredit|leasing|pinjaman|paylater|paylater|fif|adira|kredivo)/ },
  ];

  function guessCat(text, expCats, learnedKw) {
    const t = ' ' + String(text).toLowerCase().replace(/\s+/g, ' ') + ' ';
    expCats = expCats || [];
    learnedKw = learnedKw || {};

    // A. Memori auto-learn: pilih kata kunci TERPANJANG yang cocok
    //    (paling spesifik), bukan sekadar urutan objek.
    let bestWord = '', bestCat = '';
    for (const word of Object.keys(learnedKw)) {
      if (word && t.includes(' ' + word) && word.length > bestWord.length) {
        bestWord = word; bestCat = learnedKw[word];
      }
    }
    if (bestCat) return bestCat;

    // B. Nama kategori milik user (persis sebagai kata)
    for (const c of expCats) {
      if (c.type !== 'expense') continue;
      const nm = String(c.name || '').toLowerCase();
      if (nm.length >= 3 && t.includes(nm)) return c.id;
    }

    // C. Sinyal kuat tingkat merchant (toko jelas => kategori jelas)
    for (const { key, rx } of PRIORITY_MAP) {
      if (!rx.test(t)) continue;
      const hit = expCats.find((c) =>
        c.type === 'expense' &&
        (c.id === key || String(c.name).toLowerCase().includes(key))
      );
      if (hit) return hit.id;
    }

    // D. Pola kata kunci per-item → dicocokkan ke kategori user
    for (const { key, rx } of KEYWORD_MAP) {
      if (!rx.test(t)) continue;
      const hit = expCats.find((c) =>
        c.type === 'expense' &&
        (c.id === key || String(c.name).toLowerCase().includes(key))
      );
      if (hit) return hit.id;
    }
    return '';
  }

  // Simpan pembelajaran: 1–2 kata pertama dari catatan → kategori
  function learnKeyword(note, catId, learnedKw) {
    const clean = String(note || '').trim().toLowerCase();
    if (!catId || clean.length < 4) return learnedKw;
    const kw = clean.split(/\s+/).slice(0, 2).join(' ');
    if (kw.length < 4) return learnedKw;
    const next = { ...learnedKw, [kw]: catId };
    // batasi memori 200 entri (buang yang terlama)
    const keys = Object.keys(next);
    if (keys.length > 200) delete next[keys[0]];
    return next;
  }

  /* ============================================================
     RANGKAIAN UTAMA: teks mentah → data transaksi
     ============================================================ */
  function parseReceipt(text, expCats, learnedKw) {
    const lines = String(text).split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter((l) => l.length > 1);
    const { amount, confidence } = findAmount(lines);
    const note = findMerchant(lines);
    const date = normDate(text) || getToday();
    const category = guessCat(note + '\n' + text, expCats, learnedKw);
    return { amount, confidence, date, note, category };
  }

  return { scan, parseReceipt, guessCat, learnKeyword, ensureTesseract };
})();
