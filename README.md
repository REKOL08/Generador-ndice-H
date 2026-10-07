# Generador de índice h

Sube cualquier Excel/CSV con tus obras y obtén el análisis de índice h al instante (sin plantilla).
Demo: https://rekol08.github.io/Generador-ndice-H/

## Cómo funciona
- `js/core/analyze.js`: detecta fila de encabezados, hoja, columnas (título, año, citas, tipo, autor) y la fuente.
- `js/sources/*.js`: un archivo por fuente (GrupLAC, Scopus, Dimensions, Google Scholar, genérico; Altmetric no suma citas).
- `js/report.js` + plantilla en `index.html` (`#reportTpl`): informe HTML autónomo.

## Agregar una fuente nueva
1. Crea `js/sources/mi-fuente.js` con `HI.Sources.register({id, label, signature, aliases, classify})` (ver `scopus.js`).
2. Añade su `<script>` en `index.html` antes de `js/core/analyze.js`.

Para sinónimos de columnas nuevos para todas las fuentes, edita `FIELDS` en `js/core/registry.js`.

## Editar en remoto
Abre el repo en GitHub y presiona `.` (github.dev) o usa el lápiz de GitHub; al guardar en `main`, Pages se actualiza solo.
