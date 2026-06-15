# Bitácora

## Versión 2 en desarrollo

### Flujo guiado y criterio de riesgo

- Incorporación de seis pasos visuales y obligatorios.
- Soporte de listados de Participantes con 5, 6 o 7 columnas.
- Configuración independiente de umbrales de entregas para Riesgo Alto y Riesgo Bajo.
- Uso de las actividades planificadas como denominador de entregas y porcentajes.
- Reclasificación de Riesgo Alto, Medio y Bajo según acceso, entregas y promedio.
- Incorporación del motivo de riesgo en la interfaz y el informe exportado.
- Pruebas automatizadas para los formatos de Participantes y los tres niveles de riesgo.

## Versión 1

Fecha: 9 de junio de 2026

### Implementado

- Unificación de carga, participantes y dashboard en una pantalla.
- Diseño oscuro moderno con acentos verdes y turquesa.
- Importación local de XLSX, XLS, ODS y CSV.
- Importación de Google Sheets público.
- Interpretación del listado de Participantes.
- Cruce por correo electrónico.
- Métricas de estudiantes, actividades, entregas y riesgo.
- Alertas prioritarias, filtros y búsqueda.
- Exportación de informe Excel con tres hojas.
- Documentación de uso, arquitectura y limitaciones.

### Decisiones

- El procesamiento se mantiene local para proteger los datos de estudiantes.
- La URL de Google Sheets usa la exportación oficial a XLSX y requiere acceso público.
- La v1 genera un libro nuevo para asegurar un informe consistente y profesional.

## Mejoras de la versión 1

- Nuevo título descriptivo y autoría en el pie.
- Campo de actividades a realizar a la fecha.
- Conteo de entregas con escalas textuales.
- Métrica de Promedio del Curso.
- Niveles y filtros de Riesgo Bajo, Medio y Alto.
- Filtro por promedio.
- Cantidad de entregas visible en el gráfico de actividades.
- Generador automático del proyecto embebible para Google Sites.
