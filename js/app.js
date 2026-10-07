/* Interfaz: carga de archivos -> análisis automático -> resultados. */
(function (HI) {
  const $ = id => document.getElementById(id);
  let FILES = [];          // [{name, scan}]
  let SHEET = '';          // hoja elegida (solo con un archivo)
  let OVR = {};            // correcciones manuales de columnas
  let LASTHTML = '', LASTLABEL = '', AUTHORS = [];

  function show(msgs) { $('status').innerHTML = msgs.map(m => `<div class="msg ${m.t}">${m.h}</div>`).join(''); }
  const esc = HI.escapeHtml;

  // ---------- lectura de archivos ----------
  function readFile(f) {
    return new Promise((resolve, reject) => {
      const rd = new FileReader();
      const isText = /\.(csv|tsv|txt)$/i.test(f.name);
      rd.onerror = () => reject('No se pudo leer «' + f.name + '».');
      rd.onload = e => {
        try {
          let wb;
          if (isText) {
            let txt = new TextDecoder('utf-8').decode(new Uint8Array(e.target.result));
            if (txt.indexOf('�') >= 0) txt = new TextDecoder('windows-1252').decode(new Uint8Array(e.target.result));
            wb = XLSX.read(txt, { type: 'string' });
          } else wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
          resolve({ name: f.name, scan: HI.scanWorkbook(wb) });
        } catch (err) { reject('«' + f.name + '» no es un Excel/CSV válido.'); }
      };
      rd.readAsArrayBuffer(f);
    });
  }

  async function handleFiles(list) {
    list = Array.from(list || []);
    if (!list.length) return;
    show([{ t: 'ok', h: '<span>Leyendo y analizando…</span>' }]);
    try {
      FILES = await Promise.all(list.map(readFile));
      OVR = {};
      SHEET = FILES.length === 1 ? HI.bestSheet(FILES[0].scan) : '';
      run();
    } catch (e) {
      show([{ t: 'err', h: '<span>⚠️ ' + esc(typeof e === 'string' ? e : 'No se pudo procesar el archivo.') + '</span>' }]);
      ['previewbox', 'resultbar', 'kpis', 'colpanel', 'authpanel'].forEach(i => $(i).style.display = 'none');
    }
  }

  // ---------- análisis ----------
  function run() {
    const single = FILES.length === 1;
    let items = [], msgs = [], label, res = null;
    if (single) {
      const f = FILES[0];
      res = SHEET && Object.keys(OVR).length ? HI.analyzeRows(f.scan[SHEET]._rows, OVR) : f.scan[SHEET];
      items = res.items; label = f.name;
      const names = Object.keys(f.scan);
      const sel = $('sheet'); sel.innerHTML = names.map(n => `<option value="${esc(n)}">${esc(n)} (${f.scan[n].items.length})</option>`).join('');
      sel.value = SHEET; $('sheetsel').style.display = names.length > 1 ? 'block' : 'none';
      msgs.push({ t: 'ok', h: `<span>✓ Fuente detectada: <b>${esc(res.source.label)}</b> · hoja «${esc(SHEET)}» · <b>${items.length}</b> registros leídos.</span>` });
    } else {
      $('sheetsel').style.display = 'none';
      label = FILES.length + ' archivos';
      FILES.forEach(f => { const r = f.scan[HI.bestSheet(f.scan)]; items = items.concat(r.items); msgs.push({ t: 'ok', h: `<span>✓ <b>${esc(f.name)}</b>: ${esc(r.source.label)}, ${r.items.length} registros.</span>` }); });
    }
    LASTLABEL = label;
    const fin = HI.finalize(items);
    AUTHORS = fin.authors;

    if (res) {
      res.warnings.forEach(w => msgs.push({ t: 'warn', h: '<span>' + esc(w) + '</span>' }));
      if (res.map && res.map.title >= 0) {
        if (!res.map.cites.length) msgs.push({ t: 'warn', h: '<span>No se encontró una columna de <b>citas</b>. El informe se genera igual y puedes ingresar las citas en su calculadora, o elegir la columna en «Columnas detectadas».</span>' });
        if (res.how.title === 'contenido') msgs.push({ t: 'warn', h: '<span>La columna de títulos se adivinó por su contenido; verifícala en «Columnas detectadas».</span>' });
      }
      if (res.otros) msgs.push({ t: 'warn', h: `<span><b>${res.otros}</b> registro(s) con un «Tipo» no reconocido quedaron como «Otro».</span>` });
      if (res.skipped) msgs.push({ t: 'warn', h: `<span><b>${res.skipped}</b> fila(s) sin título se omitieron.</span>` });
    }
    if (!fin.NUC.length) msgs.push({ t: 'warn', h: '<span>No se detectaron obras citables: el índice h será 0.</span>' });
    show(msgs);

    renderColumns(single ? res : null);
    renderKpis(fin);
    renderAuthors();
    if (!items.length) { ['previewbox', 'resultbar'].forEach(i => $(i).style.display = 'none'); return; }
    LASTHTML = HI.buildReport(fin.ALL, fin.NUC, label);
    $('preview').srcdoc = LASTHTML;
    $('previewbox').style.display = 'block'; $('resultbar').style.display = 'flex';
    const cited = fin.NUC.filter(o => o.cites > 0).length;
    $('phmeta').textContent = cited ? `${cited} obra(s) con citas precargadas` : 'sin citas en el archivo';
    $('genmeta').textContent = 'Informe listo · ' + label;
  }

  function renderKpis(fin) {
    const m = HI.metrics(fin.NUC.map(o => o.cites));
    $('kpis').style.display = 'grid';
    $('kpis').innerHTML = [['Índice h', m.h], ['Índice g', m.g], ['i10', m.i10], ['Citas totales', m.total], ['Obras citables', m.n]]
      .map(k => `<div class="kpi"><div class="kv">${k[1]}</div><div class="kk">${k[0]}</div></div>`).join('');
  }

  function renderColumns(res) {
    const box = $('colpanel');
    if (!res || !res.headers.length) { box.style.display = 'none'; return; }
    const cur = { title: res.map.title, year: res.map.year, type: res.map.type, author: res.map.author, cites: res.map.cites.length ? res.map.cites[0] : -1 };
    const extra = res.map.cites.length > 1 ? ` <span class="note">(se usa el mayor valor de ${res.map.cites.length} columnas de citas)</span>` : '';
    const opts = c => '<option value="-1">— ninguna —</option>' + res.headers.map((h, i) => `<option value="${i}"${i === c ? ' selected' : ''}>${esc(h || 'Columna ' + (i + 1))}</option>`).join('');
    $('colbody').innerHTML = HI.FIELD_NAMES.map(f => `<label>${HI.FIELD_LABELS[f]}<select data-f="${f}">${opts(cur[f])}</select></label>`).join('') + extra;
    $('colbody').querySelectorAll('select').forEach(s => s.onchange = () => { OVR[s.dataset.f] = parseInt(s.value, 10); run(); });
    box.style.display = 'block';
  }

  function renderAuthors() {
    const box = $('authpanel');
    if (AUTHORS.length < 2) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    $('authcount').textContent = AUTHORS.length + ' autores';
    $('authbody').innerHTML = AUTHORS.slice(0, 30).map((a, i) => `<tr><td class="rank">${i + 1}</td><td>${esc(a.name)}</td><td>${a.n}</td><td>${a.total}</td><td><b>${a.h}</b></td><td>${a.g}</td><td>${a.i10}</td></tr>`).join('');
  }

  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  HI.downloadReport = () => { if (LASTHTML) download('informe_indice_h.html', LASTHTML, 'text/html;charset=utf-8'); };
  HI.openReport = () => { if (LASTHTML) window.open(URL.createObjectURL(new Blob([LASTHTML], { type: 'text/html;charset=utf-8' })), '_blank'); };
  HI.downloadAuthors = () => {
    const q = v => '"' + String(v).replace(/"/g, '""') + '"';
    const csv = '﻿Autor,Obras,Citas totales,Indice h,Indice g,i10\n' + AUTHORS.map(a => [q(a.name), a.n, a.total, a.h, a.g, a.i10].join(',')).join('\n');
    download('indice_h_por_autor.csv', csv, 'text/csv;charset=utf-8');
  };

  // ---------- eventos ----------
  const drop = $('drop'), file = $('file');
  drop.onclick = () => file.click();
  file.onchange = e => { handleFiles(e.target.files); file.value = ''; };
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); handleFiles(e.dataTransfer.files); };
  $('sheet').onchange = e => { SHEET = e.target.value; OVR = {}; run(); };
  // Soltar un archivo en cualquier parte de la página también funciona.
  window.addEventListener('dragover', e => e.preventDefault());
  window.addEventListener('drop', e => { if (e.target !== drop && !drop.contains(e.target)) { e.preventDefault(); handleFiles(e.dataTransfer.files); } });
})(window.HI);
