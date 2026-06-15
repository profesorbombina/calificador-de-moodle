"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const temporaryIndex = path.join(os.tmpdir(), "calificador-de-moodle-build-test.html");

execFileSync(process.execPath, [path.join(projectRoot, "tools", "build-embeddable.js"), temporaryIndex], {
  cwd: projectRoot,
  stdio: "ignore"
});

const generated = fs.readFileSync(temporaryIndex, "utf8");
fs.unlinkSync(temporaryIndex);

if (!generated.includes("<style>") || !generated.includes("<script>")) {
  throw new Error("El archivo embebible no contiene los estilos y scripts esperados");
}

if (generated.includes('href="styles.css"') || generated.includes('src="app.js"')) {
  throw new Error("El archivo embebible todavia depende de archivos locales separados");
}

console.log("Build test OK");
