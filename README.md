# Calificador de Moodle

Aplicación web para transformar exportaciones del calificador de Moodle en un dashboard de seguimiento y un informe Excel listo para trabajar.

La versión 1 funciona completamente en el navegador: los archivos locales no se envían a ningún servidor.

## Estado del proyecto

- La versión estable actual está preservada en la etiqueta `v1.0.0`.
- La versión 2 se desarrolla en la rama `codex/v2`.
- Los cambios previstos para la nueva versión están en [`docs/ROADMAP-V2.md`](docs/ROADMAP-V2.md).
- El historial de versiones está en [`CHANGELOG.md`](CHANGELOG.md).

## Funcionalidades

- Importa archivos `.xlsx`, `.xls`, `.ods` y `.csv`.
- Admite una URL pública o compartida de Google Sheets.
- Interpreta el texto copiado desde la pantalla **Participantes** de Moodle.
- Cruza estudiantes por correo electrónico.
- Detecta actividades cuyos encabezados incluyen Foro, Cuestionario o Tarea.
- Calcula entregas, promedios, nivel de participación y señales de riesgo.
- Cuenta entregas con escalas numéricas y textuales, por ejemplo Aprobado/Desaprobado.
- Calcula las métricas según las actividades planificadas a la fecha.
- Permite buscar y filtrar estudiantes por nivel de riesgo y promedio.
- Descarga un informe `.xlsx` con hojas Dashboard, Calificaciones y Seguimiento.

## Uso

1. Abrí `index.html` en un navegador moderno.
2. Cargá la exportación del calificador o una URL pública de Google Sheets.
3. Opcionalmente, pegá el listado copiado desde Participantes.
4. Indicá la cantidad de actividades a realizar a la fecha.
5. Presioná **Analizar curso**.
6. Revisá el dashboard y descargá el informe.

## Publicación en GitHub Pages

El proyecto no requiere compilación ni servidor.

1. Subí los archivos del directorio al repositorio.
2. En GitHub, abrí **Settings > Pages**.
3. Seleccioná la rama principal y la carpeta raíz.
4. Guardá la configuración.

## Proyecto embebible

El archivo único para Google Sites se genera desde este proyecto para evitar mantener dos códigos diferentes:

```powershell
node tools/build-embeddable.js
```

El comando actualiza `../calificador-de-moodle-embebible/index.html`. Cada modificación realizada en `index.html`, `styles.css` o `app.js` debe finalizar ejecutando ese generador.

## Verificación técnica

Requiere Node.js 20 o superior para ejecutar las herramientas de desarrollo. La aplicación publicada continúa funcionando directamente en el navegador.

La suite principal valida la interpretación de Participantes, los cálculos principales y la generación embebible:

```powershell
npm test
```

La sincronización con el repositorio embebible hermano se comprueba localmente:

```powershell
npm run test:embeddable-sync
```

GitHub Actions ejecuta la suite principal en cada cambio relevante y pull request.

## Privacidad

Los archivos locales se leen y procesan exclusivamente en el navegador. La aplicación utiliza SheetJS desde CDN para interpretar y generar planillas.

Una URL de Google Sheets debe permitir acceso mediante enlace o estar publicada. Las hojas privadas requieren autenticación con Google, funcionalidad que no forma parte de esta versión.

## Estructura

```text
calificador-de-moodle-v1/
├── index.html
├── styles.css
├── app.js
├── tools/
│   ├── build-embeddable.js
│   └── sync-embeddable.ps1
├── tests/
│   └── smoke-test.js
└── docs/
    ├── ARQUITECTURA.md
    └── BITACORA.md
```

## Limitaciones conocidas de la v1

- La clasificación de riesgo es orientativa: Riesgo Alto hasta 35%, Riesgo Medio entre 36% y 70%, y Riesgo Bajo por encima del 70% de entregas. Nunca haber ingresado implica Riesgo Alto.
- El promedio del curso considera únicamente calificaciones numéricas.
- La detección automática depende de los nombres de columnas exportados por Moodle.
- Las URLs privadas de Google Sheets no pueden abrirse sin integrar autenticación.
- El informe descargado es un libro nuevo y no conserva formatos personalizados del archivo original.
