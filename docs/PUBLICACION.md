# Publicación versionada

## Objetivo

Mantener la versión estable y la versión en desarrollo publicadas simultáneamente, sin duplicar código ni reemplazar accidentalmente la versión utilizada por docentes.

## URLs

- **Versión estable V1:** `https://profesorbombina.github.io/calificador-de-moodle-embebible/`
- **Vista previa V2:** `https://profesorbombina.github.io/calificador-de-moodle-embebible/v2/`

## Fuente de cada publicación

| Ruta pública | Repositorio | Rama |
| --- | --- | --- |
| `/` | `calificador-de-moodle-embebible` | `main` |
| `/v2/` | `calificador-de-moodle-embebible` | `codex/v2` |

El workflow `pages-versionadas.yml` descarga ambas ramas y genera un único artefacto de GitHub Pages. La raíz siempre se toma desde `main`, por lo que un cambio realizado en V2 no puede reemplazar la versión estable.

## Flujo de actualización

1. Implementar y verificar cambios en `calificador-de-moodle`, rama `codex/v2`.
2. Generar la versión embebible con `npm run build:embeddable`.
3. Ejecutar `npm run test:embeddable-sync`.
4. Publicar `calificador-de-moodle-embebible`, rama `codex/v2`.
5. GitHub Actions actualizará exclusivamente la ruta `/v2/`.

## Publicación de V2 como estable

Cuando V2 esté aprobada:

1. Etiquetar y preservar la última versión estable.
2. Integrar los cambios aprobados en las ramas `main`.
3. Verificar nuevamente ambas rutas.
4. Mantener una ruta de vista previa para la siguiente versión.

## Configuración inicial en GitHub

El repositorio embebible debe utilizar GitHub Actions como origen de Pages:

1. Abrir **Settings > Pages**.
2. En **Build and deployment > Source**, seleccionar **GitHub Actions**.
3. Ejecutar manualmente el workflow **Publicar versiones en GitHub Pages** o publicar un cambio en `codex/v2`.
