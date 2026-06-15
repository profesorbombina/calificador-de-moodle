# Contribuir

## Ramas

- `main`: ultima version estable.
- `codex/v2`: integracion de la proxima version mayor.
- `feature/<nombre>`: cambios funcionales creados desde `codex/v2`.
- `fix/<nombre>`: correcciones puntuales.

No se desarrollan funcionalidades directamente en `main`.

## Flujo de trabajo

1. Crear una rama breve desde `codex/v2`.
2. Implementar un cambio acotado.
3. Ejecutar `npm test`.
4. Ejecutar `npm run test:embeddable-sync` cuando se actualice el proyecto embebible hermano.
5. Documentar el cambio en `CHANGELOG.md`.
6. Integrar mediante pull request.

## Criterios de aceptacion

- Los datos de estudiantes continuan procesandose localmente.
- Las pruebas automatizadas pasan.
- La interfaz funciona en escritorio y dispositivos moviles.
- La version embebible puede generarse sin dependencias locales separadas.
- Los cambios de comportamiento quedan documentados.

## Versiones

El proyecto usa versionado semantico:

- `PATCH`: correcciones compatibles.
- `MINOR`: nuevas funciones compatibles.
- `MAJOR`: cambios incompatibles o una renovacion amplia.

Las versiones estables se publican desde `main` mediante etiquetas anotadas.
