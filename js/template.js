/* Plantilla Excel OPCIONAL (ya no es necesaria: el generador lee cualquier Excel). */
(function (HI) {
  HI.downloadTemplate = function () {
    const head = ['Tipo', 'Nombre', 'Año', 'Autor', 'Citas'];
    const ej = [
      ['Producción bibliográfica - Artículo - Publicado en revista especializada', 'Título del artículo', 2023, 'Pérez, Ana; Gómez, Luis', 12],
      ['Producción bibliográfica - Libro - Capítulo de libro', 'Título del capítulo', 2022, 'Pérez, Ana', 3]
    ];
    const ws = XLSX.utils.aoa_to_sheet([head].concat(ej));
    ws['!cols'] = [{ wch: 58 }, { wch: 46 }, { wch: 7 }, { wch: 28 }, { wch: 8 }];
    const tv = [['Tipos GrupLAC reconocidos', '¿Cuenta para índice h?']].concat((HI.GRUPLAC_TIPOS || []).map(t => [t.v, t.n ? 'Sí' : 'No']));
    const wst = XLSX.utils.aoa_to_sheet(tv); wst['!cols'] = [{ wch: 90 }, { wch: 22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PRODUCTOS');
    XLSX.utils.book_append_sheet(wb, wst, 'Tipos_validos');
    XLSX.writeFile(wb, 'plantilla_indice_h_opcional.xlsx');
  };
})(window.HI);
