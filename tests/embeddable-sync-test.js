"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const generatedProject = path.resolve(projectRoot, "..", "calificador-de-moodle-embebible");
const generatedIndex = path.join(generatedProject, "index.html");
const temporaryIndex = path.join(os.tmpdir(), "calificador-de-moodle-embebible-test.html");

execFileSync(process.execPath, [path.join(projectRoot, "tools", "build-embeddable.js"), temporaryIndex], {
  cwd: projectRoot,
  stdio: "ignore"
});

const expected = fs.readFileSync(temporaryIndex, "utf8");
const current = fs.readFileSync(generatedIndex, "utf8");
fs.unlinkSync(temporaryIndex);

if (expected !== current) {
  throw new Error("El proyecto embebible no está sincronizado. Ejecutá node tools/build-embeddable.js");
}

if (current.includes('href="styles.css"') || current.includes('src="app.js"')) {
  throw new Error("El archivo embebible todavía depende de archivos locales separados");
}

console.log("Embeddable sync test OK");
