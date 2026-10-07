/* Exportación de GrupLAC / CvLAC (Minciencias): columna "Tipo" con vocabulario propio.
 * Solo artículos, libros de investigación y capítulos cuentan para el índice h. */
HI.GRUPLAC_TIPOS = 
[{"v": "Producción bibliográfica - Artículo - Publicado en revista especializada", "n": 1}, {"v": "Producción bibliográfica - Libro - Capítulo de libro", "n": 1}, {"v": "Producción bibliográfica - Libro - Libro resultado de investigación", "n": 1}, {"v": "Producción bibliográfica - Libro - Otro capítulo de libro publicado", "n": 1}, {"v": "Apropiación social del conocimiento - Proceso de Apropiación Social del Conocimiento para el fortalecimiento o solución de asuntos de interés social", "n": 0}, {"v": "Datos complementarios - Jurado/Comisiones evaluadoras de trabajo de grado - Maestría", "n": 0}, {"v": "Datos complementarios - Jurado/Comisiones evaluadoras de trabajo de grado - Pregrado", "n": 0}, {"v": "Datos complementarios - Participación en comités de evaluación - Acreditación de programas", "n": 0}, {"v": "Datos complementarios - Participación en comités de evaluación - Concurso docente", "n": 0}, {"v": "Datos complementarios - Participación en comités de evaluación - Otra", "n": 0}, {"v": "Demás trabajos - Demás trabajos", "n": 0}, {"v": "Divulgación pública de la ciencia - Desarrollos web: Páginas web-blogs, micrositios, aplicativos móviles + estrategia de Redes Sociales", "n": 0}, {"v": "Divulgación pública de la ciencia - Producciones de contenido digital - Audiovisuales - Cápsulas de video", "n": 0}, {"v": "Divulgación pública de la ciencia - Producciones de contenido digital - Audiovisuales - Video", "n": 0}, {"v": "Divulgación pública de la ciencia - Producciones de contenido digital - Recursos gráficos digitales - Videografías", "n": 0}, {"v": "Divulgación pública de la ciencia - Producciones de contenido digital - Sonoro - Podcast", "n": 0}, {"v": "Divulgación pública de la ciencia - Producciones de contenido digital - Sonoro - Programa radial", "n": 0}, {"v": "Divulgación pública de la ciencia - Producción de estrategias y contenidos transmedia", "n": 0}, {"v": "Divulgación pública de la ciencia - Publicaciones editoriales no especializadas: cartillas, manual no especializado, periódicos, revistas, boletín, etc", "n": 0}, {"v": "Producción bibliográfica - Documento de trabajo (Working Paper)", "n": 0}, {"v": "Producción bibliográfica - Libro - Libros de divulgación y/o Compilación de divulgación", "n": 0}, {"v": "Producción bibliográfica - Libro - Libros de formación", "n": 0}, {"v": "Producción bibliográfica - Otra producción bibliográfica - Introducción", "n": 0}, {"v": "Producción bibliográfica - Otro artículo publicado - Columna de opinión", "n": 0}, {"v": "Producción bibliográfica - Otro artículo publicado - Periódico de noticias", "n": 0}, {"v": "Producción bibliográfica - Otro artículo publicado - Revista de divulgación", "n": 0}, {"v": "Producción en artes, arquitectura y diseño - Obra o producto", "n": 0}, {"v": "Producción técnica - Consultoría Científico Tecnológica e Informe Técnico - Informe técnico", "n": 0}, {"v": "Producción técnica - Contenido Virtual - Portal", "n": 0}, {"v": "Producción técnica - Cursos de corta duración dictados - Especialización", "n": 0}, {"v": "Producción técnica - Cursos de corta duración dictados - Extensión extracurricular", "n": 0}, {"v": "Producción técnica - Cursos de corta duración dictados - Otro", "n": 0}, {"v": "Producción técnica - Cursos de corta duración dictados - Perfeccionamiento", "n": 0}, {"v": "Producción técnica - Editoración o revisión - Compilación", "n": 0}, {"v": "Producción técnica - Impresa - Boletín", "n": 0}, {"v": "Producción técnica - Informes de investigación", "n": 0}, {"v": "Producción técnica - Innovaciones generadas de producción empresarial - Organizacional", "n": 0}, {"v": "Producción técnica - Productos tecnológicos - Base de datos de referencia para investigacion", "n": 0}, {"v": "Producción técnica - Prototipo - Industrial", "n": 0}, {"v": "Producción técnica - Prototipo - Servicios", "n": 0}, {"v": "Trabajos dirigidos/Tutorías - Trabajo de grado de maestría o especialidad clínica", "n": 0}, {"v": "Trabajos dirigidos/Tutorías - Trabajos de grado de pregrado", "n": 0}, {"v": "Trabajos dirigidos/Tutorías - Trabajos dirigidos/Tutorías de otro tipo", "n": 0}]
;
HI.Sources.register({
  id: 'gruplac', label: 'GrupLAC / Minciencias',
  minScore: 5,
  aliases: { cites: ['scopus', 'dimensions'] },
  matchData(tipos) {
    const pre = /^(producci[oó]n|datos complementarios|divulgaci[oó]n|apropiaci[oó]n|trabajos dirigidos|dem[aá]s trabajos)/i;
    return tipos.filter(t => pre.test(String(t).trim())).length / tipos.length >= 0.25;
  },
  classify(tipo) {
    const t = (tipo || '').toString();
    if (t.includes('Artículo - Publicado en revista especializada')) return { c: 'Artículo en revista especializada', nu: 1, t: 'Artículo' };
    if (t.includes('Libro - Libro resultado de investigación')) return { c: 'Libro resultado de investigación', nu: 1, t: 'Libro' };
    if (t.includes('Libro - Capítulo de libro')) return { c: 'Capítulo de libro', nu: 1, t: 'Capítulo' };
    if (t.includes('Libro - Otro capítulo de libro publicado')) return { c: 'Capítulo de libro (otro)', nu: 1, t: 'Capítulo' };
    if (t.includes('Producción en artes')) return { c: 'Obra de arte/diseño', nu: 0, t: '' };
    if (t.includes('Periódico de noticias')) return { c: 'Prensa (periódico)', nu: 0, t: '' };
    if (t.includes('Columna de opinión')) return { c: 'Columna de opinión', nu: 0, t: '' };
    if (t.includes('Revista de divulgación')) return { c: 'Revista de divulgación', nu: 0, t: '' };
    if (t.includes('Working Paper')) return { c: 'Working paper', nu: 0, t: '' };
    if (t.includes('Introducción')) return { c: 'Introducción', nu: 0, t: '' };
    if (t.includes('Libros de divulgación') || t.includes('Libros de formación')) return { c: 'Libro de divulgación/formación', nu: 0, t: '' };
    if (t.includes('Divulgación pública')) return { c: 'Divulgación pública', nu: 0, t: '' };
    if (t.includes('Datos complementarios')) return { c: 'Datos complementarios', nu: 0, t: '' };
    if (t.includes('Trabajos dirigidos')) return { c: 'Trabajos dirigidos/Tutorías', nu: 0, t: '' };
    if (t.includes('Producción técnica')) return { c: 'Producción técnica', nu: 0, t: '' };
    if (t.includes('Apropiación social')) return { c: 'Apropiación social', nu: 0, t: '' };
    if (t.includes('Demás trabajos')) return { c: 'Demás trabajos', nu: 0, t: '' };
    return { c: 'Otro', nu: 0, t: '' };
  }
});
