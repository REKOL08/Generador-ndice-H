/* Utilidades generales y métricas bibliométricas. Sin dependencias. */
window.HI = window.HI || {};
(function (HI) {
  HI.strip = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '');
  // Normaliza para comparar: minúsculas, sin tildes, solo letras/números separados por un espacio.
  HI.norm = s => HI.strip(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  HI.cleanText = s => String(s == null ? '' : s).replace(/¿/g, '').replace(/\s+/g, ' ').trim();

  // Número de citas desde cualquier formato: 12, "12", "1,234", "12 citas".
  HI.num = function (x) {
    if (typeof x === 'number') return isFinite(x) && x > 0 ? Math.round(x) : 0;
    const m = String(x == null ? '' : x).replace(/(\d)[.,](?=\d{3}\b)/g, '$1').match(/\d+(?:\.\d+)?/);
    const v = m ? parseFloat(m[0]) : 0;
    return v > 0 ? Math.round(v) : 0;
  };
  HI.looksNumeric = function (x) {
    if (typeof x === 'number') return true;
    return /^\s*\d[\d.,]*\s*(citas?|cites?|citations?)?\s*$/i.test(String(x == null ? '' : x));
  };

  // Año desde número, texto o fecha serial de Excel.
  HI.parseYear = function (x) {
    if (x === '' || x == null) return null;
    if (typeof x === 'number') {
      if (x >= 1900 && x <= 2100) return Math.floor(x);
      if (x > 2100 && x < 80000) { const y = new Date(Math.round((x - 25569) * 86400000)).getUTCFullYear(); return y >= 1900 && y <= 2100 ? y : null; }
      return null;
    }
    const m = String(x).match(/\b(19|20)\d{2}\b/);
    return m ? parseInt(m[0], 10) : null;
  };

  // URL segura (solo http/https o DOI suelto); si no es válida devuelve ''.
  HI.cleanUrl = function (x) {
    const s = String(x == null ? '' : x).trim().split(/\s+/)[0];
    if (/^https?:\/\//i.test(s)) return s;
    if (/^10\.\d{4,9}\//.test(s)) return 'https://doi.org/' + s;
    if (/^www\./i.test(s)) return 'https://' + s;
    return '';
  };
  // Fecha de consulta legible (acepta fecha serial de Excel o texto).
  HI.fmtDate = function (x) {
    if (x === '' || x == null) return '';
    if (typeof x === 'number' && x > 20000 && x < 80000) {
      const d = new Date(Math.round((x - 25569) * 86400000));
      return String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0') + '/' + d.getUTCFullYear();
    }
    return String(x).trim();
  };

  // ---- métricas ----
  HI.hIndex = function (arr) {
    const s = arr.slice().sort((a, b) => b - a); let h = 0;
    for (let i = 0; i < s.length; i++) { if (s[i] >= i + 1) h = i + 1; else break; }
    return h;
  };
  HI.i10 = arr => arr.filter(x => x >= 10).length;
  HI.gIndex = function (arr) {
    const s = arr.slice().sort((a, b) => b - a); let sum = 0, g = 0;
    for (let i = 0; i < s.length; i++) { sum += s[i]; if (sum >= (i + 1) * (i + 1)) g = i + 1; }
    return g;
  };
  HI.metrics = function (cites) {
    return { h: HI.hIndex(cites), g: HI.gIndex(cites), i10: HI.i10(cites),
      total: cites.reduce((a, b) => a + b, 0), max: cites.length ? Math.max.apply(null, cites) : 0, n: cites.length };
  };

  // Nombre corto de la fuente de citas según el encabezado de la columna.
  HI.sourceLabel = function (h) {
    const n = HI.norm(h);
    if (n.includes('scopus')) return 'Scopus';
    if (n.includes('dimension')) return 'Dimensions';
    if (n.includes('scholar') || n.includes('gscholar')) return 'Google Scholar';
    if (n.includes('altmetric')) return 'Altmetric';
    return String(h).trim() || 'Citas';
  };

  HI.escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
})(window.HI);
