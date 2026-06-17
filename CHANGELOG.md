# Changelog

Los cambios relevantes del proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las versiones publicadas siguen [Versionado Semantico](https://semver.org/lang/es/).

## [Sin publicar]

### Agregado

- Seccion de correos de acompanamiento para Riesgo Alto, Riesgo Medio y Riesgo Bajo / Sin riesgo.
- Botones para copiar destinatarios y cuerpos sugeridos directamente al correo institucional.
- Asunto sugerido, personalizacion de curso/docente/tono y boton Gmail para armar borradores con destinatarios, asunto y cuerpo.
- Hoja `Correos` en el informe exportado con destinatarios agrupados y mensajes pedagogicos sugeridos.
- Filtros globales por senales de seguimiento: sin ingreso, sin entregas, promedio bajo y sin correo.
- Metricas y filtro por estado de usuario Activo/Suspendido cuando Moodle informa ese dato en Participantes.
- Hojas `Alertas` y `Reporte coordinacion` en la exportacion Excel.
- Preparacion de la rama de desarrollo para la version 2.
- Comandos estandarizados de prueba y generacion.
- Integracion continua mediante GitHub Actions.
- Documentacion del flujo de contribucion y hoja de ruta.
- Flujo visual guiado de seis pasos obligatorios.
- Soporte de listados de Participantes con 5, 6 o 7 columnas.
- Configuracion independiente de umbrales de entregas para Riesgo Alto y Riesgo Bajo.
- Publicacion simultanea de la version estable y la vista previa V2 mediante GitHub Pages.

### Cambiado

- Clasificacion de riesgo basada en acceso, entregas, promedio y criterios configurables.
- Informe exportado con el motivo de riesgo de cada estudiante.
- Calculo de entregas y porcentajes basado en las actividades planificadas del Paso 3.
- Dashboard del Excel reorganizado con indicadores de estudiantes en columnas A/B y actividades en C/D.

## [1.0.0] - 2026-06-15

### Agregado

- Importacion de archivos XLSX, XLS, ODS y CSV.
- Importacion de hojas publicas de Google Sheets.
- Cruce de calificaciones y participantes mediante correo electronico.
- Dashboard de entregas, promedios y niveles de riesgo.
- Exportacion de informes Excel.
- Generacion automatica de la version embebible.

[Sin publicar]: https://github.com/profesorbombina/calificador-de-moodle/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/profesorbombina/calificador-de-moodle/releases/tag/v1.0.0
