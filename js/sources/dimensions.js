/* Exportación de Dimensions. */
HI.Sources.register({
  id: 'dimensions', label: 'Dimensions (exportación)',
  signature: ['publication id', 'times cited', 'fwci', 'publication type', 'source title'],
  minScore: 3,
  classify: (tipo, n) => HI.Sources.byId('generic').classify(tipo, n)
});
