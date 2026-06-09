"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

function createElementStub() {
  return {
    addEventListener() {},
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {},
    scrollIntoView() {},
    value: "",
    textContent: "",
    innerHTML: "",
    disabled: false,
    hidden: false,
    files: []
  };
}

const context = {
  console,
  document: { querySelector: () => createElementStub() },
  setTimeout,
  clearTimeout,
  Date,
  Map,
  Set,
  Blob,
  fetch: async () => {
    throw new Error("fetch no debe ejecutarse en esta prueba");
  }
};

vm.createContext(context);
const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
vm.runInContext(appSource, context);

const participantText = [
  "Seleccionar 'Ana Pérez'",
  "ana@example.com",
  "Estudiante",
  "Comisión A",
  "2 días",
  "Seleccionar 'Luis Gómez'",
  "luis@example.com",
  "Estudiante",
  "Comisión B",
  "Nunca"
].join("\n");

const participants = context.parseMoodleParticipants(participantText);
if (participants.length !== 2) throw new Error("No se interpretaron correctamente los participantes");

const rows = [
  ["Nombre", "Apellido(s)", "Dirección de correo", "Tarea: Trabajo 1 calificación (Real)", "Foro: Debate calificación (Real)"],
  ["Ana", "Pérez", "ana@example.com", 8, 9],
  ["Luis", "Gómez", "luis@example.com", "-", 7]
];

const analysis = context.buildAnalysis(rows, participants, "Calificaciones");
if (analysis.students.length !== 2) throw new Error("Cantidad de estudiantes incorrecta");
if (analysis.activities.length !== 2) throw new Error("Cantidad de actividades incorrecta");
if (analysis.totals.delivered !== 3) throw new Error("Cantidad de entregas incorrecta");
if (analysis.totals.noAccess !== 1) throw new Error("No se detectó el estudiante sin acceso");

console.log("Smoke test OK");
