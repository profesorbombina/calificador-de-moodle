# Hoja de ruta de la version 2

## Objetivo

Mejorar la mantenibilidad, precision y experiencia de uso sin comprometer la privacidad: los datos sensibles deben continuar procesandose localmente.

## Principios

- Una unica fuente de verdad para la aplicacion principal y la embebible.
- Cambios pequenos, verificables y documentados.
- Compatibilidad con exportaciones reales de Moodle.
- Indicadores explicables para docentes y estudiantes.
- Accesibilidad y diseno responsive desde el inicio.

## Etapas

### 1. Base tecnica

- Modularizar progresivamente `app.js`.
- Incorporar muestras anonimizadas y ampliar pruebas.
- Definir un modelo de datos estable para cursos, estudiantes y actividades.
- Automatizar validaciones en cada pull request.

### 2. Calidad del analisis

- Permitir configurar umbrales de riesgo.
- Mejorar la deteccion de columnas y escalas de Moodle.
- Explicar por que cada estudiante recibe una clasificacion.
- Validar datos incompletos, duplicados y formatos inesperados.

### 3. Experiencia docente

- Simplificar el flujo de importacion.
- Mejorar filtros, ordenamiento y visualizaciones.
- Permitir guardar y recuperar configuraciones sin almacenar datos sensibles.
- Mejorar el informe exportado y su trazabilidad.

### 4. Publicacion

- Validar la aplicacion principal y la version embebible.
- Documentar migracion y cambios incompatibles.
- Publicar una version candidata antes de `v2.0.0`.

## Fuera de alcance inicial

- Almacenar datos de estudiantes en un servidor.
- Autenticarse en Moodle con credenciales docentes.
- Reemplazar las decisiones pedagogicas del equipo docente.
