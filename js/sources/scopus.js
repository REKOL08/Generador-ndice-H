/* Exportación CSV/Excel de Scopus. */
HI.Sources.register({
  id: 'scopus', label: 'Scopus (exportación)',
  signature: ['eid', 'source title', 'document type', 'cited by', 'authors'],
  minScore: 3,
  classify: (tipo, n) => HI.Sources.byId('generic').classify(tipo, n)
});
