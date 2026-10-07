/* Fuente de respaldo: cualquier Excel/CSV con títulos y (opcionalmente) citas, año, tipo, autor.
 * Todas las filas cuentan para el índice h salvo tipos claramente no citables. */
HI.Sources.register({
  id: 'generic',
  label: 'Excel genérico',
  classify(tipo) {
    const t = HI.norm(tipo);
    if (/columna|opinion/.test(t)) return { c: 'Columna de opinión', nu: 0, t: '' };
    if (/prensa|periodico|newspaper|news/.test(t)) return { c: 'Prensa (periódico)', nu: 0, t: '' };
    if (/divulg|outreach|podcast|video/.test(t)) return { c: 'Divulgación pública', nu: 0, t: '' };
    if (/tutor|dirigid|jurado|supervision/.test(t)) return { c: 'Trabajos dirigidos/Tutorías', nu: 0, t: '' };
    if (/chapter|capitulo/.test(t)) return { c: 'Capítulo de libro', nu: 1, t: 'Capítulo' };
    if (/\bbook\b|libro|monograf/.test(t)) return { c: 'Libro resultado de investigación', nu: 1, t: 'Libro' };
    return { c: 'Artículo en revista especializada', nu: 1, t: 'Artículo' };
  }
});
