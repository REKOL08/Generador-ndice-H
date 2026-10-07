# Generador de informe de índice h

Herramienta web de **Bibliotecas Areandina** que calcula el índice h a partir de un Excel con tus obras (artículos, libros, capítulos). No necesitas instalar nada ni usar una plantilla: arrastras el archivo y el informe aparece solo.

**Úsala aquí:** https://rekol08.github.io/Generador-ndice-H/

> Tus datos **no salen de tu computador**: el archivo se procesa en tu navegador y no se envía a ningún servidor.

---

## ¿Qué es el índice h?

Un autor, grupo o institución tiene índice **h** si **h** de sus obras tienen **al menos h citas** cada una.

**Ejemplo:** obras con 9, 6, 5, 3 y 1 citas. La 1.ª tiene 9 (≥ 1 ✓), la 2.ª tiene 6 (≥ 2 ✓), la 3.ª tiene 5 (≥ 3 ✓), la 4.ª tiene 3 (≥ 4 ✗). Entonces **h = 3**.

El informe incluye una explicación paso a paso con los datos de tu propio archivo.

---

## Cómo usarla (3 pasos)

1. **Entra** a https://rekol08.github.io/Generador-ndice-H/
2. **Arrastra tu Excel** al recuadro grande (o haz clic en él para elegir el archivo). Puedes subir **varios archivos a la vez**: se combinan sin repetir obras.
3. **Listo.** Se muestran al instante:
   - **Resultados rápidos:** índice h, índice g, i10, citas totales y número de obras citables.
   - **Vista previa del informe** con calculadora, gráficos, listado de productos y notas para el programa.
   - **Tabla de índice h por autor** (si tu archivo trae la columna de autores).

### Descargar el informe

| Botón | Qué obtienes |
|---|---|
| **⬇ Descargar informe PDF** | Se abre el cuadro de impresión. En *Destino* elige **«Guardar como PDF»**. Incluye todas las secciones. |
| **⬇ Descargar informe HTML** | Un archivo autónomo que puedes guardar, compartir o abrir sin internet. |
| **↗ Abrir en pestaña nueva** | El informe a pantalla completa. |
| **Descargar tabla completa (CSV)** | El índice h de cada autor, para abrir en Excel. |

---

## ¿Qué Excel puedo subir?

Casi cualquiera: **.xlsx, .xls, .csv, .tsv**. Solo necesita **una columna con el título de cada obra**. El resto se detecta solo si existe:

| Dato | Cómo puede llamarse la columna |
|---|---|
| **Título** (obligatorio) | Título, Nombre, Title, Nombre del producto… |
| **Año** | Año, Year, Fecha de publicación… |
| **Citas** | Scopus, Dimensions, Scholar, Citado por, Citas, Cited by… |
| **Tipo** | Tipo, Tipología, Type… |
| **Autores** | Autor, Autores, Authors… |
| **Enlace** | Enlace, URL, Link, DOI… |
| **Fecha de consulta** | Fecha de consulta, Fecha de acceso, Accessed… |

Cosas que la herramienta resuelve sola:
- Encabezados que **no están en la primera fila** (títulos del reporte, filas vacías arriba).
- Libros con **varias hojas**: elige la más completa (puedes cambiarla en «Hoja a usar»).
- **Títulos repetidos**: se cuentan una sola vez.
- Filas vacías al final de la hoja.

### Fuentes de citas

Solo se usan **Scopus, Dimensions y Google Scholar**. Si una obra tiene citas en varias, se toma **el valor más alto** (no se suman entre sí, para no contar dos veces la misma cita). **Altmetric** mide atención, no citas, y no entra al índice h.

### ¿Qué obras cuentan para el índice h?

- **Formato GrupLAC/Minciencias** (columna *Tipo* con textos como «Producción bibliográfica - Artículo…»): cuentan solo artículos en revista especializada, libros de investigación y capítulos. No cuentan prensa, columnas de opinión, divulgación, tutorías ni producción técnica.
- **Cualquier otro Excel:** cuentan todas las obras, salvo las que digan claramente que son prensa, opinión, divulgación o tutorías.

---

## El informe, pestaña por pestaña

- **Calculadora índice h:** las tarjetas de resultados son **clicables** (haz clic en *Índice h*, *Citas totales*, *Citas máx.* o *i10* para ver qué obras las componen, con enlace a cada artículo). Aquí también está la fórmula paso a paso y puedes **editar las citas** de cada obra para ver cómo cambia el resultado.
- **Producción del archivo:** composición por tipo, productos por año y listado completo con buscador. El botón de cada obra **abre el artículo**.
- **Qué es el índice h:** explicación, ejemplo y referencias.
- **Para el programa:** puntos a afirmar y preguntas probables de pares.

---

## Preguntas frecuentes

**Subí mi Excel y salió «índice h = 0».**
Tu archivo no trae citas, o la columna de citas no se detectó. Abre **«Columnas detectadas»** (debajo de la vista previa) y elige la columna correcta. También puedes escribir las citas a mano en la calculadora.

**Una columna se detectó mal (título, año, citas…).**
Abre **«Columnas detectadas»** y cámbiala con el menú desplegable; el informe se recalcula al instante.

**«El archivo no es un Excel/CSV válido».**
Revisa que no esté dañado ni protegido con contraseña. Si es un archivo de Google Sheets, descárgalo antes como .xlsx.

**El PDF sale cortado o sin gráficos.**
Usa Chrome o Edge, deja los márgenes en *Predeterminados* y activa *Gráficos de fondo*.

**No veo los cambios después de una actualización.**
Recarga con **Ctrl + F5**. Los informes descargados antes no se actualizan solos; vuelve a generarlos.

**¿Mis datos quedan guardados en algún lado?**
No. Todo ocurre en tu navegador; al cerrar la pestaña desaparece.

---

## Para quien mantiene el proyecto

Sitio estático (HTML + JavaScript, sin servidor) publicado con GitHub Pages desde la rama `main`. Librerías: SheetJS (lectura de Excel) y Chart.js (gráficos), cargadas desde CDN.

```
index.html              Página principal + plantilla del informe (#reportTpl)
js/core/utils.js        Utilidades y métricas (h, g, i10)
js/core/registry.js     Sinónimos de columnas y registro de fuentes
js/core/analyze.js      Detección de encabezados, columnas y fuente
js/sources/*.js         Una fuente por archivo (GrupLAC, Scopus, Dimensions, Scholar, genérico)
js/report.js            Genera el informe HTML autónomo
js/app.js               Interfaz: carga de archivos, resultados, descargas
```

### Editar sin instalar nada
1. Abre https://github.com/REKOL08/Generador-ndice-H y presiona la tecla **`.`** (abre el editor web), o usa el ícono del lápiz en cualquier archivo.
2. Edita y guarda (*Commit*) en `main`. En 1–2 minutos la página se actualiza.
3. Si cambias archivos de `js/`, sube también el número de versión `?v=...` de los `<script>` en `index.html` para que los navegadores no usen una copia vieja.

### Agregar una fuente de datos nueva
1. Crea `js/sources/mi-fuente.js`:
   ```js
   HI.Sources.register({
     id: 'mi-fuente', label: 'Mi fuente (exportación)',
     signature: ['encabezado-unico-1', 'encabezado-unico-2'],  // columnas que la delatan (sin tildes, minúsculas)
     minScore: 2,
     aliases: { cites: ['nombre de la columna de citas'] },    // sinónimos extra opcionales
     classify: (tipo, titulo) => HI.Sources.byId('generic').classify(tipo, titulo)
   });
   ```
2. Añade su `<script src="js/sources/mi-fuente.js?v=...">` en `index.html`, antes de `js/core/analyze.js`.
3. Para sinónimos de columna válidos para todas las fuentes, edita `FIELDS` en `js/core/registry.js`.

No hace falta tocar la lógica central.

---

*Desarrollado para Bibliotecas Areandina.*
