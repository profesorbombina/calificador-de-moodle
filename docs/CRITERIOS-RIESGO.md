# Criterios de riesgo

## Propósito

La clasificación permite priorizar el acompañamiento docente. Es una señal orientativa basada en datos disponibles y criterios configurados antes de cada análisis.

## Datos obligatorios

1. **Calificaciones:** archivo local o Google Sheets con las actividades y notas.
2. **Participantes:** listado de Moodle utilizado para conocer el último acceso y cruzar estudiantes por correo.
3. **Actividades a realizar a la fecha:** total de actividades que deberían haberse realizado.
4. **Máximo de entregas en Riesgo Alto:** quien tenga esta cantidad de entregas o menos queda en Riesgo Alto.
5. **Mínimo de entregas sin riesgo:** quien tenga esta cantidad de entregas o más puede quedar en Riesgo Bajo.
6. **Nota de aprobación:** promedio mínimo aprobado, expresado como entero de 0 a 100.

Los umbrales de los pasos 4 y 5 no pueden superar las actividades a realizar a la fecha. El Paso 4 debe ser menor que el Paso 5.

La cantidad indicada en el Paso 3 es el denominador de entregas y porcentajes. Por ejemplo, si se planificaron `10` actividades, la tabla mostrará `6 / 10` y calculará un nivel de entrega del `60%`. Si el archivo contiene actividades futuras, las entregas consideradas se limitan al valor planificado para evitar porcentajes superiores al `100%`.

## Tabla de decisión

| Prioridad | Resultado | Condición |
| --- | --- | --- |
| 1 | Riesgo Alto | Nunca ingresó a la plataforma. |
| 2 | Riesgo Alto | Tiene promedio numérico inferior a la nota de aprobación. |
| 3 | Riesgo Alto | Tiene una cantidad de entregas igual o menor al Paso 4. |
| 4 | Riesgo Bajo | Tiene una cantidad de entregas igual o mayor al Paso 5 y promedio numérico aprobado. |
| 5 | Riesgo Medio | Tiene una cantidad de entregas ubicada entre los pasos 4 y 5, o no dispone de promedio numérico. |

La primera condición aplicable determina el resultado. Cada estudiante conserva un motivo explicativo visible en la tabla y en el informe exportado.

## Casos especiales

- Una entrega con escala textual cuenta como entrega, pero no integra el promedio numérico.
- Un estudiante con entregas textuales y sin promedio numérico queda en Riesgo Medio, salvo que nunca haya ingresado.
- La nota de aprobación debe utilizar la misma escala que las calificaciones importadas. Por ejemplo, para notas de 0 a 100 puede utilizarse `60`.
- El listado de Participantes admite cinco columnas base y las columnas opcionales Nombre de usuario y Estatus.

## Responsabilidad

La clasificación no reemplaza una decisión pedagógica. El motivo asociado permite revisar cada caso antes de contactar o intervenir.
