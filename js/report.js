/* Genera el informe HTML autónomo a partir de la plantilla embebida en index.html (#reportTpl). */
(function (HI) {
  HI.buildReport = function (ALL, NUC, fileName) {
    const tpl = document.getElementById('reportTpl').textContent.split('<\\/script>').join('</scr' + 'ipt>');
    const esc = o => Object.assign({}, o, { n: HI.escapeHtml(o.n), l: HI.escapeHtml(o.l || ''), d: HI.escapeHtml(o.d || '') });
    const safe = o => JSON.stringify(o).replace(/</g, '\\u003c');
    const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    const nuc = NUC.map(o => ({ n: HI.escapeHtml(o.n), y: o.y, t: o.t, cites: o.cites, l: HI.escapeHtml(o.l || ''),
      cs: (o.cs || []).filter(x => x[1] > 0).map(x => [HI.escapeHtml(x[0]), x[1]]) }));
    const data = 'const ALL=' + safe(ALL.map(esc)) + ';\nconst NUC=' + safe(nuc) + ';\nconst META=' + safe({ file: HI.escapeHtml(fileName), date: today }) + ';';
    return tpl.replace('/*__DATA__*/', () => data);
  };
})(window.HI);
