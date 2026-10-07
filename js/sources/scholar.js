/* Google Scholar vía Publish or Perish (Cites, Authors, Title, Year, Source, Publisher...). */
HI.Sources.register({
  id: 'scholar', label: 'Google Scholar / Publish or Perish',
  signature: ['cites', 'cluster id', 'gscholar', 'publisher', 'citesurl'],
  minScore: 2,
  classify: (tipo, n) => HI.Sources.byId('generic').classify(tipo, n)
});
