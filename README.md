# Calificador de Moodle

Aplicación web para transformar exportaciones del calificador de Moodle en un dashboard de seguimiento y un informe Excel listo para trabajar.

La versión 1 funciona completamente en el navegador: los archivos locales no se envían a ningún servidor.

## Funcionalidades

- Importa archivos `.xlsx`, `.xls`, `.ods` y `.csv`.
- Admite una URL pública o compartida de Google Sheets.
- Interpreta el texto copiado desde la pantalla **Participantes** de Moodle.
- Cruza estudiantes por correo electrónico.
- Detecta actividades cuyos encabezados incluyen Foro, Cuestionario o Tarea.
- Calcula entregas, promedios, nivel de participación y señales de riesgo.
- Permite buscar y filtrar estudiantes.
- Descarga un informe `.xlsx` con hojas Dashboard, Calificaciones y Seguimiento.

## Uso

1. Abrí `index.html` en un navegador moderno.
2. Cargá la exportación del calificador o una URL pública de Google Sheets.
3. Opcionalmente, pegá el listado copiado desde Participantes.
4. Presioná **Analizar curso**.
5. Revisá el dashboard y descargá el informe.

## Publicación en GitHub Pages

El proyecto no requiere compilación ni servidor.

1. Subí los archivos del directorio al repositorio.
2. En GitHub, abrí **Settings > Pages**.
3. Seleccioná la rama principal y la carpeta raíz.
4. Guardá la configuración.

## Verificación técnica

La prueba de humo valida la interpretación de Participantes y los cálculos principales:

```powershell
node tests/smoke-test.js
```

## Privacidad

Los archivos locales se leen y procesan exclusivamente en el navegador. La aplicación utiliza SheetJS desde CDN para interpretar y generar planillas.

Una URL de Google Sheets debe permitir acceso mediante enlace o estar publicada. Las hojas privadas requieren autenticación con Google, funcionalidad que no forma parte de esta versión.

## Estructura

```text
calificador-de-moodle-v1/
├── index.html
├── styles.css
├── app.js
├── tests/
│   └── smoke-test.js
└── docs/
    ├── ARQUITECTURA.md
    └── BITACORA.md
```

## Limitaciones conocidas de la v1

- La clasificación de riesgo es orientativa: considera baja cantidad de entregas y falta de acceso.
- La detección automática depende de los nombres de columnas exportados por Moodle.
- Las URLs privadas de Google Sheets no pueden abrirse sin integrar autenticación.
- El informe descargado es un libro nuevo y no conserva formatos personalizados del archivo original.
