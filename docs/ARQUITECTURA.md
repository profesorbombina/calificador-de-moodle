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
6. Calcula entregas esperadas según las actividades planificadas a la fecha.
7. Renderiza el dashboard.
8. Genera el informe Excel.

## Criterio de riesgo

Un estudiante queda marcado:

- **Riesgo Alto**: entregó hasta el 35% de las actividades planificadas o nunca ingresó.
- **Riesgo Medio**: entregó entre el 36% y el 70%.
- **Riesgo Bajo**: entregó más del 70%.

Este criterio está aislado dentro de `buildAnalysis` para facilitar cambios futuros.

Las escalas textuales cuentan como entregas. El promedio del curso y los promedios individuales utilizan exclusivamente calificaciones numéricas.

## Dependencias

- `xlsx-js-style`: lectura y generación de planillas, cargada desde CDN.
- Google Fonts: tipografía Manrope.

## Sincronización del proyecto embebible

El proyecto principal es la única fuente de verdad. `tools/build-embeddable.js` combina el HTML, CSS y JavaScript en un solo archivo y lo escribe en el proyecto hermano `calificador-de-moodle-embebible`.

No deben realizarse cambios funcionales directamente sobre el HTML generado. Después de modificar el proyecto principal se ejecuta:

```powershell
node tools/build-embeddable.js
```

## Próximas extensiones recomendadas

- Configuración editable del umbral de riesgo.
- Autenticación para Google Sheets privados.
- Detección de escalas de calificación y notas aprobatorias.
- Persistencia de análisis históricos.
- Pruebas automatizadas con muestras anonimizadas de Moodle.
