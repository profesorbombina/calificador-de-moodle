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

console.log("UI structure test OK");
