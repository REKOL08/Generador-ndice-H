/* Exportación Excel de Web of Science. */
HI.Sources.register({
  id: 'wos', label: 'Web of Science (exportación)',
  signature: ['ut unique wos id', 'article title', 'times cited all databases', 'times cited wos core', 'publication year', 'document type'],
  minScore: 2,
  aliases: { cites: ['times cited wos core', 'times cited all databases'] },
  classify: (tipo, n) => HI.Sources.byId('generic').classify(tipo, n)
});
