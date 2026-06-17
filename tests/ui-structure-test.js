"use strict";

const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

for (const step of ["Paso 1", "Paso 2", "Paso 3", "Paso 4", "Paso 5", "Paso 6"]) {
  if (!html.includes(step)) throw new Error(`Falta la guía visual ${step}`);
}

const requiredFields = ["participantText", "plannedActivities", "highRiskDeliveries", "lowRiskDeliveries", "approvalGrade"];
for (const id of requiredFields) {
  const field = html.match(new RegExp(`<(?:input|textarea)[^>]*id="${id}"[^>]*>`, "i"))?.[0] || "";
  if (!field || !/\srequired(?:\s|>|=)/i.test(field)) throw new Error(`El campo ${id} debe ser obligatorio`);
}

if (!/id="approvalGrade"[^>]*min="0"[^>]*max="100"/i.test(html)) {
  throw new Error("La nota de aprobación debe admitir enteros de 0 a 100");
}

for (const label of ["Riesgo Alto", "Riesgo Medio", "Riesgo Bajo / Sin riesgo"]) {
  if (!html.includes(label)) throw new Error(`Falta el bloque de correo para ${label}`);
}

for (const id of ["mailHighSubject", "mailMediumSubject", "mailLowSubject", "mailHighRecipients", "mailMediumRecipients", "mailLowRecipients", "mailHighBody", "mailMediumBody", "mailLowBody"]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Falta el campo de correo ${id}`);
}

const copyButtons = html.match(/data-copy-target="/g) || [];
if (copyButtons.length < 9) throw new Error("Cada bloque de correo debe permitir copiar destinatarios, asunto y cuerpo");

const gmailButtons = html.match(/data-gmail-group="/g) || [];
if (gmailButtons.length !== 3) throw new Error("Cada bloque de correo debe incluir botÃ³n Gmail");

for (const id of ["mailCourseName", "mailTeacherName", "mailTone", "signalFilter", "participantStateFilter", "metricActive", "metricSuspended"]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Falta el control ${id}`);
}

console.log("UI structure test OK");
