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

El usuario configura las actividades a la fecha, las entregas mínimas esperadas y la nota de aprobación.

- **Riesgo Alto**: nunca ingresó, no realizó entregas o tiene promedio numérico inferior a la nota de aprobación.
- **Riesgo Bajo**: ingresó, alcanzó las entregas mínimas y tiene promedio numérico igual o superior a la nota de aprobación.
- **Riesgo Medio**: tiene actividad registrada, pero todavía no reúne todas las condiciones de Riesgo Bajo y tampoco presenta una condición de Riesgo Alto.

Cada estudiante conserva un motivo explicativo. El criterio está aislado dentro de `classifyRisk` para facilitar cambios futuros.

La especificación funcional y los casos especiales están documentados en [`CRITERIOS-RIESGO.md`](CRITERIOS-RIESGO.md).

## Participantes

El parser acepta listados copiados desde Moodle con 5, 6 o 7 columnas:

- Las cinco columnas base: nombre, correo, roles, grupos y último acceso.
- Una sexta columna opcional de estatus.
- Una columna opcional de nombre de usuario ubicada antes del correo.

El cruce utiliza el correo electrónico y solamente incorpora registros con rol Estudiante.

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

- Autenticación para Google Sheets privados.
- Detección de escalas de calificación y notas aprobatorias.
- Persistencia de análisis históricos.
- Pruebas automatizadas con muestras anonimizadas de Moodle.
