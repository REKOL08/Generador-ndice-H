/* Registro de fuentes de datos y campos.
 *
 * Para agregar una fuente nueva (otro formato de Excel): crea js/sources/<nombre>.js,
 * llama HI.Sources.register({...}) y añade su <script> en index.html. No hay que tocar el núcleo.
 *
 * Una fuente puede definir:
 *   id, label                      identificación
 *   signature: ['eid', ...]        encabezados (normalizados) que delatan la fuente
 *   minScore                       aciertos mínimos de signature para elegirla (por defecto 2)
 *   aliases: { title:[], year:[], cites:[], type:[], author:[] }   sinónimos de columna extra
 *   matchData(tipos[])             true si los valores de la columna "tipo" son de esta fuente
 *   classify(tipo, titulo)         -> { c: categoría, nu: 1|0 (cuenta al índice h), t: Artículo|Libro|Capítulo|'' }
 */
window.HI = window.HI || {};
(function (HI) {
  const list = [];

  // Sinónimos base (ya normalizados: minúsculas, sin tildes). exclude = palabras que descartan la columna.
  const FIELDS = {
    title: { aliases: ['title', 'titulo', 'nombre', 'nombre del producto', 'nombre producto', 'producto', 'document title', 'article title', 'titulo del articulo', 'titulo de la obra', 'obra', 'articulo', 'name'],
             exclude: ['source', 'journal', 'revista', 'book series', 'fuente', 'serie', 'subject'] },
    year: { aliases: ['year', 'ano', 'anio', 'publication year', 'pub year', 'ano de publicacion', 'ano publicacion', 'fecha', 'date', 'published', 'fecha de publicacion'],
            exclude: ['access', 'acceso', 'retriev', 'consulta', 'per year', 'por ano', 'cited', 'citas'] },
    cites: { aliases: ['cited by', 'times cited', 'citations', 'citas', 'cites', 'cited', 'total citations', 'citado por', 'numero de citas', 'n citas', 'scopus', 'dimensions', 'dimec', 'google scholar', 'scholar', 'openalex'],
             exclude: ['reference', 'referencia', 'per year', 'por ano', 'rank', 'percentile', 'percentil', 'normalized', 'fwci', 'altmetric', 'h index', 'source id', 'link', 'url', 'id', 'consulta'] , exactOnly: ['id'] },
    type: { aliases: ['type', 'tipo', 'document type', 'doc type', 'tipo de producto', 'tipologia', 'categoria', 'publication type', 'tipo de documento'],
            exclude: ['source type'] },
    link: { aliases: ['enlace', 'enlaces', 'link', 'url', 'doi', 'enlace al articulo', 'hipervinculo', 'vinculo', 'direccion web', 'sitio web'],
            exclude: ['issn', 'consulta'] },
    date: { aliases: ['fecha de consulta', 'fecha consulta', 'fecha de consulta de citas', 'fecha de acceso', 'fecha acceso', 'consulta', 'accessed', 'access date', 'date accessed', 'retrieved', 'date retrieved'],
            exclude: [] },
    journal: { aliases: ['revista', 'journal', 'source title', 'nombre de la revista', 'publicacion en', 'fuente'], exclude: ['issn', 'enlace'] },
    index: { aliases: ['categoria de indexacion', 'indexacion', 'cuartil', 'quartile', 'clasificacion', 'categoria publindex', 'sjr quartile'], exclude: [] },
    faculty: { aliases: ['facultad', 'faculty', 'departamento'], exclude: [] },
    program: { aliases: ['programa', 'program', 'programa academico', 'carrera'], exclude: [] },
    author: { aliases: ['authors', 'author', 'autores', 'autor', 'author full names', 'author names', 'creators', 'investigador', 'investigadores', 'docente', 'nombre del autor', 'author s'],
              exclude: ['id', 'affiliation', 'afiliacion', 'email', 'keyword', 'correspond', 'address'] }
  };

  HI.FIELD_NAMES = Object.keys(FIELDS);
  HI.FIELD_LABELS = { title: 'Título / nombre', year: 'Año', cites: 'Citas', type: 'Tipo de producto', author: 'Autor(es)', link: 'Enlace al artículo', date: 'Fecha de consulta', journal: 'Revista', index: 'Indexación (Q, A1…)', faculty: 'Facultad', program: 'Programa' };

  HI.Sources = {
    register(s) { list.push(s); },
    all: () => list,
    byId: id => list.find(s => s.id === id),
    aliases(field) {
      const extra = [].concat.apply([], list.map(s => (s.aliases && s.aliases[field]) || []));
      return FIELDS[field].aliases.concat(extra.map(HI.norm));
    },
    exclude: field => FIELDS[field].exclude,
    exactOnly: field => FIELDS[field].exactOnly || []
  };
})(window.HI);
