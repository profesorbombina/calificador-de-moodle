"use strict";

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const defaultOutput = path.resolve(projectRoot, "..", "calificador-de-moodle-embebible", "index.html");
const outputPath = path.resolve(process.argv[2] || defaultOutput);

const htmlPath = path.join(projectRoot, "index.html");
const cssPath = path.join(projectRoot, "styles.css");
const appPath = path.join(projectRoot, "app.js");

const html = fs.readFileSync(htmlPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const app = fs.readFileSync(appPath, "utf8");

const embedAdjustments = `
/* Ajustes exclusivos para incorporar la aplicación en Google Sites. */
body { background-attachment: fixed; }
.app-shell { width: min(1500px, calc(100% - 24px)); }
.topbar { min-height: 88px; }
.hero { min-height: auto; padding: 34px 0; }
.dashboard { padding-top: 34px; }
footer { padding-bottom: 20px; }

@media (max-width: 760px) {
  .topbar { min-height: auto; }
  .hero { padding: 28px 0; }
}
`;

const buildComment = `<!--
  CALIFICADOR DE MOODLE - VERSIÓN EMBEBIBLE

  Este archivo se genera automáticamente desde el proyecto principal.
  No debe editarse manualmente.

  Para actualizarlo:
  node tools/build-embeddable.js

  Publicación en Google Sites:
  1. Publicar este archivo mediante GitHub Pages.
  2. En Google Sites elegir Insertar > Incorporar > URL.
  3. Usar la URL pública de GitHub Pages.
-->
`;

let bundled = html
  .replace("<!DOCTYPE html>", `<!DOCTYPE html>\n${buildComment}`)
  .replace('<link rel="stylesheet" href="styles.css">', `<style>\n${css}\n${embedAdjustments}\n</style>`)
  .replace('  <script defer src="app.js"></script>\n', "")
  .replace("</body>", `<script>\n${app}\n</script>\n</body>`)
  .replace("<title>Calificador de Moodle</title>", "<title>Calificador de Moodle · Embebible</title>")
  .replace("VERSIÓN 2 · FLUJO GUIADO", "VERSIÓN 2 · EMBEBIBLE EN GOOGLE SITES");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, bundled, "utf8");

console.log(`Embebible actualizado: ${outputPath}`);
