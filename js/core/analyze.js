/* Núcleo: detecta encabezados, columnas y fuente de cualquier hoja de Excel/CSV,
 * y la convierte en una lista normalizada de obras. No conoce formatos concretos:
 * todo lo específico vive en js/sources/. */
(function (HI) {
  const FIELD_ORDER = ['title', 'year', 'type', 'author', 'link', 'date', 'cites'];

  function wordHas(h, w) { return (' ' + h + ' ').indexOf(' ' + w + ' ') >= 0; }
  function matchScore(h, alias) {
    if (!h) return 0;
    if (h === alias) return 3;
    if (wordHas(h, alias)) return 2;
    if (alias.length >= 5 && h.indexOf(alias) >= 0) return 1;
    return 0;
  }
  function excluded(h, field) {
    return HI.Sources.exclude(field).some(w => wordHas(h, w) || (w.length >= 5 && h.indexOf(w) >= 0));
  }
  function fieldScore(h, field) {
    if (excluded(h, field)) return 0;
    return HI.Sources.aliases(field).reduce((m, a) => Math.max(m, matchScore(h, a)), 0);
  }

  // Busca la fila de encabezados entre las primeras 40 filas (puede haber títulos o filas vacías antes).
  function findHeaderRow(rows) {
    let best = -1, bestHits = 0;
    const lim = Math.min(rows.length, 40);
    for (let r = 0; r < lim; r++) {
      const cells = rows[r].map(HI.norm);
      if (cells.filter(Boolean).length < 2) continue;
      const hits = cells.filter(h => h && HI.FIELD_NAMES.some(f => fieldScore(h, f) > 0)).length;
      if (hits > bestHits) { bestHits = hits; best = r; }
    }
    if (best >= 0) return { row: best, hits: bestHits };
    for (let r = 0; r < lim; r++) if (rows[r].filter(c => String(c).trim() !== '').length >= 2) return { row: r, hits: 0 };
    return { row: 0, hits: 0 };
  }

  function colValues(rows, from, c, max) {
    const out = [];
    for (let r = from; r < rows.length && out.length < (max || 300); r++) {
      const v = rows[r][c]; if (v !== '' && v != null) out.push(v);
    }
    return out;
  }

  function mapColumns(headers, rows, dataFrom, overrides) {
    const H = headers.map(HI.norm);
    const cand = [];
    H.forEach((h, c) => { if (!h) return; FIELD_ORDER.forEach(f => { const s = fieldScore(h, f); if (s) cand.push({ f, c, s }); }); });
    cand.sort((a, b) => b.s - a.s || FIELD_ORDER.indexOf(a.f) - FIELD_ORDER.indexOf(b.f) || a.c - b.c);

    const map = { title: -1, year: -1, type: -1, author: -1, link: -1, date: -1, cites: [] };
    const used = new Set(), how = {};
    cand.forEach(x => {
      if (used.has(x.c)) return;
      if (x.f === 'cites') {
        const vals = colValues(rows, dataFrom, x.c, 200);
        if (vals.length && vals.filter(HI.looksNumeric).length / vals.length < 0.6) return;
        map.cites.push(x.c); used.add(x.c); how.cites = 'encabezado';
      } else if (map[x.f] < 0) { map[x.f] = x.c; used.add(x.c); how[x.f] = 'encabezado'; }
    });

    // Respaldo por contenido cuando el encabezado no ayuda.
    if (map.title < 0) {
      let bestC = -1, bestLen = 0;
      for (let c = 0; c < headers.length; c++) {
        if (used.has(c)) continue;
        const vals = colValues(rows, dataFrom, c, 100).filter(v => typeof v === 'string' && !HI.looksNumeric(v));
        if (vals.length < 3) continue;
        const avg = vals.reduce((a, v) => a + v.length, 0) / vals.length;
        if (avg > bestLen) { bestLen = avg; bestC = c; }
      }
      if (bestC >= 0 && bestLen >= 12) { map.title = bestC; used.add(bestC); how.title = 'contenido'; }
    }
    if (map.year < 0) {
      for (let c = 0; c < headers.length; c++) {
        if (used.has(c)) continue;
        const vals = colValues(rows, dataFrom, c, 100);
        if (vals.length >= 3 && vals.filter(v => HI.parseYear(v) != null).length / vals.length >= 0.8) { map.year = c; used.add(c); how.year = 'contenido'; break; }
      }
    }

    // Correcciones manuales del usuario (-1 = ninguna columna).
    if (overrides) HI.FIELD_NAMES.forEach(f => {
      if (overrides[f] === undefined) return;
      const v = overrides[f];
      if (f === 'cites') { map.cites = v < 0 ? [] : [v]; } else map[f] = v;
      how[f] = 'manual';
    });
    return { map, how };
  }

  function pickSource(H, tipos) {
    let best = HI.Sources.byId('generic'), bestScore = 0;
    HI.Sources.all().forEach(s => {
      if (s.id === 'generic') return;
      let sc = (s.signature || []).filter(sig => H.some(h => h === sig || wordHas(h, sig))).length;
      if (s.matchData && tipos.length && s.matchData(tipos)) sc += 5;
      if (sc >= (s.minScore || 2) && sc > bestScore) { best = s; bestScore = sc; }
    });
    return best;
  }

  // Divide una celda de autores en nombres individuales.
  function splitAuthors(s) {
    s = HI.cleanText(s).replace(/\bet al\.?$/i, '').replace(/\.\.\.$/, '').trim();
    if (!s) return [];
    let parts;
    if (/[;|]/.test(s)) parts = s.split(/\s*[;|]\s*/);
    else if (/\s(and|y|&)\s/i.test(s)) parts = s.split(/\s*(?:,|\s&\s|\sand\s|\sy\s)\s*/i);
    else if (/\.,\s/.test(s)) parts = s.split(/(?<=\.),\s*/);
    else parts = [s];
    return parts.map(p => p.trim()).filter(Boolean);
  }

  // Analiza una hoja (matriz de filas). overrides opcional: {title:col, year:col, cites:col, ...}
  function analyzeRows(rows, overrides) {
    rows = rows.filter(r => r.some(c => String(c).trim() !== ''));
    const res = { items: [], headers: [], headerRow: 0, map: null, how: {}, source: HI.Sources.byId('generic'), warnings: [], skipped: 0, otros: 0 };
    if (rows.length < 2) return res;
    const hd = findHeaderRow(rows);
    const noHeader = hd.hits === 0;
    const headers = rows[hd.row].map((c, i) => noHeader ? 'Columna ' + (i + 1) : String(c).trim());
    const dataFrom = noHeader ? hd.row : hd.row + 1;
    const mc = mapColumns(headers, rows, dataFrom, overrides);
    const map = mc.map;
    res.headers = headers; res.headerRow = hd.row; res.map = map; res.how = mc.how;

    const tipos = map.type >= 0 ? colValues(rows, dataFrom, map.type, 400).map(String) : [];
    const src = pickSource(headers.map(HI.norm), tipos);
    res.source = src;
    if (map.title < 0) { res.warnings.push('No se encontró ninguna columna con títulos de las obras. Elige una manualmente en «Columnas detectadas».'); return res; }

    const classify = src.classify || HI.Sources.byId('generic').classify;
    for (let r = dataFrom; r < rows.length; r++) {
      const row = rows[r];
      const n = HI.cleanText(row[map.title]);
      if (!n || HI.norm(n) === HI.norm(headers[map.title])) { res.skipped++; continue; }
      const tipo = map.type >= 0 ? row[map.type] : '';
      const k = classify(tipo, n) || { c: 'Otro', nu: 0, t: '' };
      if (k.c === 'Otro') res.otros++;
      const cs = map.cites.map(c => [HI.sourceLabel(headers[c]), HI.num(row[c])]);
      const cites = cs.reduce((m, x) => Math.max(m, x[1]), 0);
      res.items.push({ cs, n, y: map.year >= 0 ? HI.parseYear(row[map.year]) : null, c: k.c, nu: k.nu, t: k.t, cites,
        a: map.author >= 0 ? splitAuthors(row[map.author]) : [],
        l: map.link >= 0 ? HI.cleanUrl(row[map.link]) : '', d: map.date >= 0 ? HI.fmtDate(row[map.date]) : '' });
    }
    return res;
  }

  // Une items de una o varias hojas/archivos: lista completa, núcleo sin duplicados y resumen por autor.
  function finalize(items) {
    const ALL = items.map(o => ({ n: o.n, y: o.y, c: o.c, nu: o.nu, l: o.l, d: o.d, ct: o.cites }));
    const map = new Map();
    items.forEach(o => {
      if (!o.nu) return;
      const key = HI.norm(o.n);
      const ex = map.get(key);
      if (!ex) map.set(key, { n: o.n, y: o.y, t: o.t, cites: o.cites, a: o.a.slice(), l: o.l, d: o.d, cs: o.cs });
      else { if (o.cites > ex.cites) ex.cs = o.cs; ex.cites = Math.max(ex.cites, o.cites); if (!ex.y && o.y) ex.y = o.y; if (!ex.l && o.l) ex.l = o.l; if (!ex.d && o.d) ex.d = o.d; o.a.forEach(x => { if (!ex.a.includes(x)) ex.a.push(x); }); }
    });
    const NUC = [...map.values()];
    const au = new Map();
    NUC.forEach(o => o.a.forEach(name => {
      const k = HI.norm(name); if (!k) return;
      if (!au.has(k)) au.set(k, { name, cites: [] });
      au.get(k).cites.push(o.cites);
    }));
    const authors = [...au.values()].map(a => Object.assign({ name: a.name }, HI.metrics(a.cites)))
      .sort((x, y) => y.h - x.h || y.total - x.total || y.n - x.n);
    return { ALL, NUC, authors };
  }

  // Elige la hoja más útil de un libro (ignora hojas de instrucciones/listas).
  function scanWorkbook(wb) {
    const out = {};
    wb.SheetNames.forEach(n => {
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: '' });
      const res = analyzeRows(rows);
      const byHeader = res.how && res.how.title === 'encabezado';
      res._score = res.items.length * (byHeader ? 1 : 0.2) + (res.items.filter(o => o.cites > 0).length ? 0.5 : 0);
      res._rows = rows;
      out[n] = res;
    });
    return out;
  }
  function bestSheet(scan) {
    return Object.keys(scan).sort((a, b) => scan[b]._score - scan[a]._score)[0];
  }

  HI.analyzeRows = analyzeRows; HI.finalize = finalize; HI.scanWorkbook = scanWorkbook; HI.bestSheet = bestSheet;
  HI.splitAuthors = splitAuthors;
})(window.HI);
