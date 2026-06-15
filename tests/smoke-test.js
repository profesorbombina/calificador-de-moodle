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
  "Nunca",
  "Inactivo",
  "Seleccionar 'María López'",
  "mlopez",
  "maria@example.com",
  "Estudiante",
  "Comisión C",
  "1 hora",
  "Activo"
].join("\n");

const participants = context.parseMoodleParticipants(participantText);
if (participants.length !== 3) throw new Error("No se interpretaron correctamente los participantes de 5, 6 y 7 columnas");
if (participants.find(person => person.email === "luis@example.com")?.status !== "Inactivo") throw new Error("No se interpretó el estatus");
if (participants.find(person => person.email === "maria@example.com")?.groups !== "Comisión C") throw new Error("No se interpretó el listado con nombre de usuario");

const rows = [
  ["Nombre", "Apellido(s)", "Dirección de correo", "Tarea: Trabajo 1 calificación (Real)", "Foro: Debate calificación (Real)", "Tarea: Estado calificación (Real)"],
  ["Ana", "Pérez", "ana@example.com", 80, 90, "Aprobado"],
  ["Luis", "Gómez", "luis@example.com", "-", 70, "Desaprobado"],
  ["María", "López", "maria@example.com", 80, "-", "-"]
];

const analysis = context.buildAnalysis(rows, participants, "Calificaciones", 3, 0, 2, 60);
if (analysis.students.length !== 3) throw new Error("Cantidad de estudiantes incorrecta");
if (analysis.activities.length !== 3) throw new Error("Cantidad de actividades incorrecta");
if (analysis.totals.delivered !== 6) throw new Error("No se contaron las entregas textuales");
if (analysis.activities[2].textualDeliveries !== 2) throw new Error("No se detectó la escala textual");
if (analysis.totals.noAccess !== 1) throw new Error("No se detectó el estudiante sin acceso");
if (analysis.totals.average !== 80) throw new Error("Promedio del curso incorrecto");
if (analysis.totals.riskHigh !== 1 || analysis.totals.riskMedium !== 1 || analysis.totals.riskLow !== 1) {
  throw new Error("Clasificación de riesgos incorrecta");
}

const failedGrade = context.classifyRisk({ delivered: 3, average: 59, noAccess: false, highRiskDeliveries: 1, lowRiskDeliveries: 2, approvalGrade: 60 });
if (failedGrade.status !== "high") throw new Error("Una nota desaprobada debe determinar Riesgo Alto");

const highByDeliveries = context.classifyRisk({ delivered: 3, average: 80, noAccess: false, highRiskDeliveries: 3, lowRiskDeliveries: 7, approvalGrade: 60 });
const mediumByDeliveries = context.classifyRisk({ delivered: 5, average: 80, noAccess: false, highRiskDeliveries: 3, lowRiskDeliveries: 7, approvalGrade: 60 });
const lowByDeliveries = context.classifyRisk({ delivered: 7, average: 80, noAccess: false, highRiskDeliveries: 3, lowRiskDeliveries: 7, approvalGrade: 60 });
if (highByDeliveries.status !== "high" || mediumByDeliveries.status !== "medium" || lowByDeliveries.status !== "low") {
  throw new Error("Los umbrales de entregas no clasifican correctamente");
}

const plannedLimitAnalysis = context.buildAnalysis(rows, participants, "Calificaciones", 2, 0, 1, 60);
if (plannedLimitAnalysis.students.some(student => student.delivered > 2)) {
  throw new Error("Las entregas consideradas no deben superar las actividades planificadas");
}
if (plannedLimitAnalysis.totals.possible !== 6 || plannedLimitAnalysis.totals.delivered !== 5) {
  throw new Error("El total de entregas no se calculó sobre las actividades planificadas");
}

console.log("Smoke test OK");
