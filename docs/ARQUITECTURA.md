# Arquitectura

## Objetivo

Mantener una aplicación estática, fácil de publicar y capaz de procesar información sensible sin enviarla a un backend.

## Componentes

### Interfaz

`index.html` contiene una sola pantalla dividida en tres áreas:

- Fuentes de información.
- Procesamiento y estado.
- Dashboard, alertas y seguimiento detallado.

`styles.css` implementa el sistema visual oscuro, responsive y accesible.

### Procesamiento

`app.js` centraliza el flujo:

1. Lee un archivo local o descarga una hoja pública.
2. Detecta la hoja de calificaciones.
3. Identifica estudiantes y actividades.
4. Interpreta participantes y cruza los datos por correo.
5. Calcula indicadores y señales de riesgo.
6. Renderiza el dashboard.
7. Genera el informe Excel.

## Criterio de riesgo

Un estudiante queda marcado:

- **Nunca ingresó**: el texto de Participantes informa `Nunca`.
- **En riesgo**: entregó como máximo el 35% de las actividades, con un mínimo de una.
- **Activo**: no cumple las condiciones anteriores.

Este criterio está aislado dentro de `buildAnalysis` para facilitar cambios futuros.

## Dependencias

- `xlsx-js-style`: lectura y generación de planillas, cargada desde CDN.
- Google Fonts: tipografía Manrope.

## Próximas extensiones recomendadas

- Configuración editable del umbral de riesgo.
- Autenticación para Google Sheets privados.
- Detección de escalas de calificación y notas aprobatorias.
- Persistencia de análisis históricos.
- Pruebas automatizadas con muestras anonimizadas de Moodle.

