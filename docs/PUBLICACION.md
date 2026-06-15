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
| `/v2/` | `calificador-de-moodle-embebible` | Copia automática de `codex/v2` en `main/v2/` |

GitHub Pages continúa publicando desde la raíz de `main`. El workflow `pages-versionadas.yml` copia únicamente la versión embebible de `codex/v2` dentro de `main/v2/`. El archivo `index.html` raíz no se modifica, por lo que un cambio realizado en V2 no puede reemplazar la versión estable.

## Flujo de actualización

1. Implementar y verificar cambios en `calificador-de-moodle`, rama `codex/v2`.
2. Generar la versión embebible con `npm run build:embeddable`.
3. Ejecutar `npm run test:embeddable-sync`.
4. Publicar `calificador-de-moodle-embebible`, rama `codex/v2`.
5. GitHub Actions actualizará exclusivamente la carpeta `main/v2/`, publicada en la ruta `/v2/`.

## Publicación de V2 como estable

Cuando V2 esté aprobada:

1. Etiquetar y preservar la última versión estable.
2. Integrar los cambios aprobados en las ramas `main`.
3. Verificar nuevamente ambas rutas.
4. Mantener una ruta de vista previa para la siguiente versión.

## Configuración de GitHub Pages

El repositorio embebible continúa utilizando la configuración existente:

1. Abrir **Settings > Pages**.
2. Confirmar que Pages publica desde la rama `main` y la carpeta raíz.
3. El workflow **Publicar vista previa V2** se ejecutará al publicar cambios en `codex/v2`.
