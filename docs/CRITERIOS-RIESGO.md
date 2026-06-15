# Criterios de riesgo

## Propósito

La clasificación permite priorizar el acompañamiento docente. Es una señal orientativa basada en datos disponibles y criterios configurados antes de cada análisis.

## Datos obligatorios

1. **Calificaciones:** archivo local o Google Sheets con las actividades y notas.
2. **Participantes:** listado de Moodle utilizado para conocer el último acceso y cruzar estudiantes por correo.
3. **Actividades a realizar a la fecha:** total de actividades que deberían haberse realizado.
4. **Entregas mínimas esperadas:** cantidad de entregas necesarias para considerar al estudiante al día.
5. **Nota de aprobación:** promedio mínimo aprobado, expresado como entero de 0 a 100.

Las entregas mínimas no pueden superar las actividades a realizar a la fecha.

## Tabla de decisión

| Prioridad | Resultado | Condición |
| --- | --- | --- |
| 1 | Riesgo Alto | Nunca ingresó a la plataforma. |
| 2 | Riesgo Alto | No realizó ninguna entrega. |
| 3 | Riesgo Alto | Tiene promedio numérico inferior a la nota de aprobación. |
| 4 | Riesgo Bajo | Ingresó, alcanzó las entregas mínimas y tiene promedio numérico aprobado. |
| 5 | Riesgo Medio | Tiene actividad registrada, pero no reúne todas las condiciones de Riesgo Bajo. |

La primera condición aplicable determina el resultado. Cada estudiante conserva un motivo explicativo visible en la tabla y en el informe exportado.

## Casos especiales

- Una entrega con escala textual cuenta como entrega, pero no integra el promedio numérico.
- Un estudiante con entregas textuales y sin promedio numérico queda en Riesgo Medio, salvo que nunca haya ingresado.
- La nota de aprobación debe utilizar la misma escala que las calificaciones importadas. Por ejemplo, para notas de 0 a 100 puede utilizarse `60`.
- El listado de Participantes admite cinco columnas base y las columnas opcionales Nombre de usuario y Estatus.

## Responsabilidad

La clasificación no reemplaza una decisión pedagógica. El motivo asociado permite revisar cada caso antes de contactar o intervenir.
