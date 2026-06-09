"use strict";

const state = {
  sourceName: "",
  sourceData: null,
  analysis: null,
  filteredStudents: []
};

const elements = {
  fileInput: document.querySelector("#fileInput"),
  fileName: document.querySelector("#fileName"),
  dropzone: document.querySelector("#dropzone"),
  fileTab: document.querySelector("#fileTab"),
  urlTab: document.querySelector("#urlTab"),
  fileSource: document.querySelector("#fileSource"),
  urlSource: document.querySelector("#urlSource"),
  sheetUrl: document.querySelector("#sheetUrl"),
  loadUrlBtn: document.querySelector("#loadUrlBtn"),
  participantText: document.querySelector("#participantText"),
  participantHint: document.querySelector("#participantHint"),
  clearParticipantsBtn: document.querySelector("#clearParticipantsBtn"),
  plannedActivities: document.querySelector("#plannedActivities"),
  plannedStatus: document.querySelector("#plannedStatus"),
  sourceStatus: document.querySelector("#sourceStatus"),
  participantStatus: document.querySelector("#participantStatus"),
  analyzeBtn: document.querySelector("#analyzeBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  downloadBtn: document.querySelector("#downloadBtn"),
  processStatus: document.querySelector("#processStatus"),
  dashboard: document.querySelector("#dashboard"),
  studentSearch: document.querySelector("#studentSearch"),
  riskFilter: document.querySelector("#riskFilter"),
  averageFilter: document.querySelector("#averageFilter"),
  studentTableBody: document.querySelector("#studentTableBody"),
  tableCount: document.querySelector("#tableCount"),
  activityChart: document.querySelector("#activityChart"),
  alertsList: document.querySelector("#alertsList")
};

const metricElements = {
  students: document.querySelector("#metricStudents"),
  studentsNote: document.querySelector("#metricStudentsNote"),
  activities: document.querySelector("#metricActivities"),
  activitiesNote: document.querySelector("#metricActivitiesNote"),
  planned: document.querySelector("#metricPlanned"),
  plannedNote: document.querySelector("#metricPlannedNote"),
  delivery: document.querySelector("#metricDelivery"),
  deliveryNote: document.querySelector("#metricDeliveryNote"),
  average: document.querySelector("#metricAverage"),
  averageNote: document.querySelector("#metricAverageNote"),
  riskLow: document.querySelector("#metricRiskLow"),
  riskMedium: document.querySelector("#metricRiskMedium"),
  riskHigh: document.querySelector("#metricRiskHigh")
};

const ACCEPTED_EXTENSIONS = /\.(xlsx|xls|ods|csv)$/i;
const MAX_EXPORT_ROWS = 1000;

elements.fileInput.addEventListener("change", () => selectLocalFile(elements.fileInput.files[0]));
elements.loadUrlBtn.addEventListener("click", loadGoogleSheet);
elements.analyzeBtn.addEventListener("click", analyzeCourse);
elements.downloadBtn.addEventListener("click", downloadReport);
elements.resetBtn.addEventListener("click", resetApplication);
elements.clearParticipantsBtn.addEventListener("click", clearParticipants);
elements.studentSearch.addEventListener("input", applyStudentFilters);
elements.riskFilter.addEventListener("change", applyStudentFilters);
elements.averageFilter.addEventListener("change", applyStudentFilters);
elements.plannedActivities.addEventListener("input", validatePlannedActivities);
elements.fileTab.addEventListener("click", () => selectSourceTab("file"));
elements.urlTab.addEventListener("click", () => selectSourceTab("url"));
elements.participantText.addEventListener("input", updateParticipantStatus);

["dragenter", "dragover"].forEach(eventName => {
  elements.dropzone.addEventListener(eventName, event => {
    event.preventDefault();
    elements.dropzone.classList.add("dragging");
  });
});
["dragleave", "drop"].forEach(eventName => {
  elements.dropzone.addEventListener(eventName, event => {
    event.preventDefault();
    elements.dropzone.classList.remove("dragging");
  });
});
elements.dropzone.addEventListener("drop", event => selectLocalFile(event.dataTransfer.files[0]));

function selectSourceTab(source) {
  const isFile = source === "file";
  elements.fileTab.classList.toggle("active", isFile);
  elements.urlTab.classList.toggle("active", !isFile);
  elements.fileTab.setAttribute("aria-selected", String(isFile));
  elements.urlTab.setAttribute("aria-selected", String(!isFile));
  elements.fileSource.hidden = !isFile;
  elements.urlSource.hidden = isFile;
}

async function selectLocalFile(file) {
  if (!file) return;
  if (!ACCEPTED_EXTENSIONS.test(file.name)) {
    setStatus("source", "Formato no permitido", "error");
    setProcessStatus("Usá un archivo XLSX, XLS, ODS o CSV.", "error");
    return;
  }

  try {
    state.sourceData = await file.arrayBuffer();
    state.sourceName = file.name;
    elements.fileName.textContent = file.name;
    setStatus("source", "Archivo listo", "ok");
    setProcessStatus("Fuente cargada. Ya podés analizar el curso.", "ok");
    validatePlannedActivities();
  } catch (error) {
    setProcessStatus(`No se pudo leer el archivo: ${error.message}`, "error");
  }
}

async function loadGoogleSheet() {
  const rawUrl = elements.sheetUrl.value.trim();
  if (!rawUrl) {
    setProcessStatus("Ingresá una URL de Google Sheets.", "error");
    return;
  }

  try {
    elements.loadUrlBtn.disabled = true;
    setProcessStatus("Descargando la hoja pública...");
    const exportUrl = buildGoogleExportUrl(rawUrl);
    const response = await fetch(exportUrl);
    if (!response.ok) throw new Error(`Google respondió con estado ${response.status}`);
    state.sourceData = await response.arrayBuffer();
    state.sourceName = "google-sheets-moodle.xlsx";
    setStatus("source", "Google Sheets listo", "ok");
    setProcessStatus("Hoja cargada. Ya podés analizar el curso.", "ok");
    validatePlannedActivities();
  } catch (error) {
    setStatus("source", "No disponible", "error");
    setProcessStatus("No se pudo abrir la hoja. Verificá que sea pública o accesible mediante enlace.", "error");
  } finally {
    elements.loadUrlBtn.disabled = false;
  }
}

function buildGoogleExportUrl(rawUrl) {
  const match = rawUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) throw new Error("La URL no corresponde a Google Sheets");
  return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=xlsx`;
}

function updateParticipantStatus() {
  const text = elements.participantText.value.trim();
  if (!text) {
    setStatus("participant", "Opcional", "neutral");
    elements.participantHint.textContent = "Se tomarán únicamente los registros con rol Estudiante.";
    return;
  }
  const students = parseMoodleParticipants(text);
  setStatus("participant", `${students.length} detectados`, students.length ? "ok" : "error");
  elements.participantHint.textContent = students.length
    ? `${students.length} estudiantes únicos listos para cruzar.`
    : "No se detectaron estudiantes. Podés analizar igualmente las calificaciones.";
}

function validatePlannedActivities() {
  const value = Number(elements.plannedActivities.value);
  const valid = Number.isInteger(value) && value >= 0 && value <= 100;
  setStatusElement(elements.plannedStatus, valid ? `${value} actividades` : "Valor inválido", valid ? "ok" : "error");
  elements.analyzeBtn.disabled = !(state.sourceData && valid);
  return valid ? value : null;
}

function clearParticipants() {
  elements.participantText.value = "";
  updateParticipantStatus();
}

async function analyzeCourse() {
  if (!state.sourceData) return;
  const plannedActivities = validatePlannedActivities();
  if (plannedActivities === null) {
    setProcessStatus("Ingresá un número entero entre 0 y 100 para las actividades a la fecha.", "error");
    return;
  }

  try {
    elements.analyzeBtn.disabled = true;
    setProcessStatus("Analizando calificaciones, entregas y participantes...");

    // Dejamos respirar a la interfaz antes del procesamiento sincrónico de SheetJS.
    await new Promise(resolve => setTimeout(resolve, 40));

    const workbook = XLSX.read(state.sourceData, { type: "array", cellDates: true });
    const gradeSheetName = detectGradeSheet(workbook);
    const gradeRows = XLSX.utils.sheet_to_json(workbook.Sheets[gradeSheetName], { header: 1, defval: "", raw: true });
    const participants = parseMoodleParticipants(elements.participantText.value);
    state.analysis = buildAnalysis(gradeRows, participants, gradeSheetName, plannedActivities);

    renderDashboard(state.analysis);
    elements.downloadBtn.disabled = false;
    elements.studentSearch.disabled = false;
    elements.riskFilter.disabled = false;
    elements.averageFilter.disabled = false;
    setProcessStatus(`Análisis listo: ${state.analysis.students.length} estudiantes y ${state.analysis.activities.length} actividades.`, "ok");
    elements.dashboard.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    setProcessStatus(`No se pudo analizar la fuente: ${error.message}`, "error");
  } finally {
    elements.analyzeBtn.disabled = !state.sourceData;
  }
}

function detectGradeSheet(workbook) {
  for (const sheetName of workbook.SheetNames) {
    const preview = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" });
    const headers = (preview[0] || []).map(normalizeText);
    const hasIdentity = headers.some(header => header.includes("correo")) &&
      headers.some(header => header === "nombre" || header.includes("apellido"));
    if (hasIdentity) return sheetName;
  }
  if (!workbook.SheetNames.length) throw new Error("El archivo no contiene hojas");
  return workbook.SheetNames[0];
}

function buildAnalysis(rows, participants, sheetName, plannedActivities = 0) {
  if (rows.length < 2) throw new Error("La hoja de calificaciones no contiene datos suficientes");

  const headers = rows[0].map(value => String(value || "").trim());
  const normalizedHeaders = headers.map(normalizeText);
  const indexes = {
    firstName: findHeaderIndex(normalizedHeaders, ["nombre"]),
    lastName: findHeaderIndex(normalizedHeaders, ["apellido(s)", "apellidos", "apellido"]),
    email: findHeaderIndex(normalizedHeaders, ["direccion de correo", "correo electronico", "correo", "email"]),
    id: findHeaderIndex(normalizedHeaders, ["numero de id", "id"])
  };

  const identityIndexes = new Set(Object.values(indexes).filter(index => index >= 0));
  const activityIndexes = headers
    .map((header, index) => ({ header, index }))
    .filter(item => !identityIndexes.has(item.index) && isActivityHeader(item.header))
    .map(item => item.index);

  if (indexes.firstName < 0 && indexes.lastName < 0 && indexes.email < 0) {
    throw new Error("No se detectaron columnas de identidad de estudiantes");
  }
  if (!activityIndexes.length) {
    throw new Error("No se detectaron actividades. Los encabezados deben incluir Foro, Cuestionario o Tarea");
  }

  const participantMap = new Map(participants.map(person => [person.email.toLowerCase(), person]));
  const activities = activityIndexes.map(index => ({
    name: cleanActivityName(headers[index]),
    sourceIndex: index,
    delivered: 0,
    grades: [],
    textualDeliveries: 0
  }));

  const students = [];
  for (const row of rows.slice(1)) {
    const email = String(row[indexes.email] || "").trim();
    const fullName = [row[indexes.firstName], row[indexes.lastName]].filter(Boolean).join(" ").trim();
    if (!email && !fullName) continue;

    const submissions = activityIndexes.map((index, activityPosition) => {
      const submission = parseSubmission(row[index]);
      if (submission.delivered) {
        activities[activityPosition].delivered += 1;
        if (submission.numeric !== null) activities[activityPosition].grades.push(submission.numeric);
        else activities[activityPosition].textualDeliveries += 1;
      }
      return submission;
    });
    const delivered = submissions.filter(submission => submission.delivered).length;
    const numericGrades = submissions.map(submission => submission.numeric).filter(grade => grade !== null);
    const average = averageOf(numericGrades);
    const participant = participantMap.get(email.toLowerCase()) || {};
    const noAccess = normalizeText(participant.access) === "nunca";
    const expectedActivities = plannedActivities;
    const deliveryRate = expectedActivities > 0 ? Math.min(delivered / expectedActivities, 1) : 0;
    const risk = classifyRisk(deliveryRate, noAccess, expectedActivities);

    students.push({
      name: participant.name || fullName || email,
      email,
      id: indexes.id >= 0 ? row[indexes.id] : "",
      group: participant.groups || "Sin grupo",
      access: participant.access || "Sin dato",
      grades: submissions.map(submission => submission.display),
      delivered,
      average,
      deliveryRate,
      status: risk
    });
  }

  students.sort((a, b) => {
    const priority = { high: 0, medium: 1, low: 2 };
    return priority[a.status] - priority[b.status] || a.name.localeCompare(b.name, "es");
  });

  const totalPossible = students.length * plannedActivities;
  const totalDelivered = students.reduce((sum, student) => sum + student.delivered, 0);
  const riskLow = students.filter(student => student.status === "low").length;
  const riskMedium = students.filter(student => student.status === "medium").length;
  const riskHigh = students.filter(student => student.status === "high").length;
  const noAccessCount = students.filter(student => normalizeText(student.access) === "nunca").length;
  const matchedParticipants = students.filter(student => participantMap.has(student.email.toLowerCase())).length;
  // El promedio del curso pondera cada calificación numérica registrada por igual.
  const courseAverage = averageOf(activities.flatMap(activity => activity.grades));

  return {
    generatedAt: new Date(),
    sourceName: state.sourceName,
    sourceSheet: sheetName,
    plannedActivities,
    activities,
    students,
    totals: {
      delivered: totalDelivered,
      possible: totalPossible,
      deliveryRate: totalPossible ? Math.min(totalDelivered / totalPossible, 1) : 0,
      average: courseAverage,
      riskLow,
      riskMedium,
      riskHigh,
      noAccess: noAccessCount,
      matchedParticipants
    }
  };
}

function renderDashboard(analysis) {
  const { students, activities, totals } = analysis;
  metricElements.students.textContent = students.length;
  metricElements.studentsNote.textContent = `${totals.matchedParticipants} cruzados con Participantes`;
  metricElements.activities.textContent = activities.length;
  metricElements.activitiesNote.textContent = `${activities.filter(activity => activity.textualDeliveries).length} con escala textual`;
  metricElements.planned.textContent = analysis.plannedActivities;
  metricElements.plannedNote.textContent = `${totals.possible} entregas esperadas`;
  metricElements.delivery.textContent = formatPercent(totals.deliveryRate);
  metricElements.deliveryNote.textContent = `${totals.delivered} de ${totals.possible} esperadas`;
  metricElements.average.textContent = totals.average === null ? "—" : totals.average.toFixed(2);
  metricElements.averageNote.textContent = "Solo calificaciones numéricas";
  metricElements.riskLow.textContent = totals.riskLow;
  metricElements.riskMedium.textContent = totals.riskMedium;
  metricElements.riskHigh.textContent = totals.riskHigh;

  renderActivityChart(activities, students.length);
  renderAlerts(analysis);
  applyStudentFilters();
}

function renderActivityChart(activities, studentCount) {
  elements.activityChart.classList.remove("empty-state");
  elements.activityChart.innerHTML = activities.map(activity => {
    const rate = studentCount ? activity.delivered / studentCount : 0;
    return `
      <div class="activity-row">
        <span class="activity-name" title="${escapeHtml(activity.name)}">${escapeHtml(activity.name)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.round(rate * 100)}%"></div></div>
        <span class="activity-value">${activity.delivered} · ${formatPercent(rate)}</span>
      </div>`;
  }).join("");
}

function renderAlerts(analysis) {
  const { students, activities, totals } = analysis;
  const weakActivities = activities.filter(activity => activity.delivered / Math.max(students.length, 1) < 0.5);
  const alerts = [];

  if (totals.noAccess) alerts.push(["danger", "!", `${totals.noAccess} sin ingreso`, "Conviene contactar primero a quienes nunca accedieron al aula."]);
  if (weakActivities.length) alerts.push(["warning", "↓", `${weakActivities.length} actividades con baja entrega`, "Tienen menos del 50% de participación registrada."]);
  if (totals.riskHigh) alerts.push(["danger", "!", `${totals.riskHigh} estudiantes en Riesgo Alto`, "La señal combina hasta 35% de entregas o falta de acceso."]);
  if (totals.deliveryRate >= 0.75) alerts.push(["success", "✓", "Buen nivel de participación", `El curso alcanza ${formatPercent(totals.deliveryRate)} de entregas.`]);
  if (!alerts.length) alerts.push(["success", "✓", "Sin alertas críticas", "El análisis no encontró señales prioritarias."]);

  elements.alertsList.classList.remove("empty-state");
  elements.alertsList.innerHTML = alerts.map(([type, symbol, title, text]) => `
    <div class="alert-item alert-${type}">
      <span class="alert-symbol">${symbol}</span>
      <div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></div>
    </div>`).join("");
}

function applyStudentFilters() {
  if (!state.analysis) return;
  const query = normalizeText(elements.studentSearch.value);
  const status = elements.riskFilter.value;
  const averageFilter = elements.averageFilter.value;
  state.filteredStudents = state.analysis.students.filter(student => {
    const matchesText = !query || normalizeText(`${student.name} ${student.email} ${student.group}`).includes(query);
    const matchesStatus = status === "all" || student.status === status;
    const matchesAverage = averageMatches(student.average, averageFilter);
    return matchesText && matchesStatus && matchesAverage;
  });
  renderStudentTable(state.filteredStudents, state.analysis.activities.length);
}

function renderStudentTable(students, activityCount) {
  elements.tableCount.textContent = `${students.length} registros`;
  if (!students.length) {
    elements.studentTableBody.innerHTML = '<tr><td colspan="7" class="table-empty">No hay estudiantes que coincidan con el filtro.</td></tr>';
    return;
  }
  elements.studentTableBody.innerHTML = students.map(student => `
    <tr>
      <td class="student-name">${escapeHtml(student.name)}</td>
      <td class="muted-cell">${escapeHtml(student.email || "Sin dato")}</td>
      <td class="muted-cell">${escapeHtml(student.group)}</td>
      <td>${student.delivered} / ${activityCount}</td>
      <td>${student.average === null ? "Sin nota" : student.average.toFixed(2)}</td>
      <td class="muted-cell">${escapeHtml(student.access)}</td>
      <td>${statusBadge(student.status)}</td>
    </tr>`).join("");
}

function statusBadge(status) {
  const config = {
    low: ["Riesgo Bajo", "badge-low"],
    medium: ["Riesgo Medio", "badge-medium"],
    high: ["Riesgo Alto", "badge-high"]
  };
  const [label, className] = config[status];
  return `<span class="badge ${className}">${label}</span>`;
}

function downloadReport() {
  if (!state.analysis) return;
  const workbook = buildReportWorkbook(state.analysis);
  const baseName = state.sourceName.replace(/\.(xlsx|xls|ods|csv)$/i, "") || "curso-moodle";
  XLSX.writeFile(workbook, `${baseName} - Informe Moodle v1.xlsx`);
  setProcessStatus("Informe descargado correctamente.", "ok");
}

function buildReportWorkbook(analysis) {
  const workbook = XLSX.utils.book_new();
  const dashboardData = [
    ["INFORME DEL CURSO", "", "", ""],
    ["Generado", analysis.generatedAt.toLocaleString("es-AR"), "Fuente", analysis.sourceName],
    [],
    ["INDICADOR", "VALOR", "DETALLE", ""],
    ["Estudiantes", analysis.students.length, "Cruce con Participantes", analysis.totals.matchedParticipants],
    ["Actividades", analysis.activities.length, "Entregas registradas", analysis.totals.delivered],
    ["Actividades a la fecha", analysis.plannedActivities, "Entregas esperadas", analysis.totals.possible],
    ["Nivel de entrega", analysis.totals.deliveryRate, "Promedio del Curso", analysis.totals.average ?? ""],
    ["Riesgo Bajo", analysis.totals.riskLow, "Riesgo Medio", analysis.totals.riskMedium],
    ["Riesgo Alto", analysis.totals.riskHigh, "Nunca ingresaron", analysis.totals.noAccess],
    [],
    ["ACTIVIDAD", "ENTREGAS", "PARTICIPACIÓN", "PROMEDIO"],
    ...analysis.activities.map(activity => [
      activity.name,
      activity.delivered,
      analysis.students.length ? activity.delivered / analysis.students.length : 0,
      averageOf(activity.grades) ?? ""
    ])
  ];
  const dashboardSheet = XLSX.utils.aoa_to_sheet(dashboardData);
  styleDashboardSheet(dashboardSheet, dashboardData.length);
  XLSX.utils.book_append_sheet(workbook, dashboardSheet, "Dashboard");

  const gradeHeaders = ["Nombre", "Correo", "ID", "Grupo", ...analysis.activities.map(activity => activity.name), "Entregas", "Promedio", "Último acceso", "Estado"];
  const gradeRows = analysis.students.map(student => [
    student.name,
    student.email,
    student.id,
    student.group,
    ...student.grades.map(grade => grade ?? "-"),
    student.delivered,
    student.average ?? "",
    student.access,
    statusLabel(student.status)
  ]);
  const gradeSheet = XLSX.utils.aoa_to_sheet([gradeHeaders, ...gradeRows]);
  styleDataSheet(gradeSheet, gradeHeaders.length, gradeRows.length + 1);
  XLSX.utils.book_append_sheet(workbook, gradeSheet, "Calificaciones");

  const trackingHeaders = ["Nombre y Apellido", "Correo", "Grupo", "Último acceso", "Estado"];
  const trackingRows = analysis.students.map(student => [student.name, student.email, student.group, student.access, statusLabel(student.status)]);
  const trackingSheet = XLSX.utils.aoa_to_sheet([trackingHeaders, ...trackingRows]);
  styleDataSheet(trackingSheet, trackingHeaders.length, trackingRows.length + 1);
  XLSX.utils.book_append_sheet(workbook, trackingSheet, "Seguimiento");
  return workbook;
}

function styleDashboardSheet(sheet, rowCount) {
  const border = excelBorder();
  for (let row = 1; row <= rowCount; row++) {
    for (let col = 1; col <= 4; col++) {
      const ref = `${columnLetter(col)}${row}`;
      if (!sheet[ref]) sheet[ref] = { t: "s", v: "" };
      sheet[ref].s = { font: { name: "Aptos", sz: 10, color: { rgb: "FF163238" } }, alignment: { vertical: "center", wrapText: true }, border };
    }
  }
  ["A1", "A4", "A12"].forEach(ref => {
    sheet[ref].s.fill = { fgColor: { rgb: "FF087C68" } };
    sheet[ref].s.font = { name: "Aptos Display", bold: true, sz: ref === "A1" ? 18 : 11, color: { rgb: "FFFFFFFF" } };
  });
  sheet["!merges"] = [XLSX.utils.decode_range("A1:D1"), XLSX.utils.decode_range("A4:D4")];
  sheet["!cols"] = [{ wch:28 }, { wch:18 }, { wch:28 }, { wch:18 }];
  sheet["B8"].z = "0.00%";
  for (let row = 13; row <= rowCount; row++) sheet[`C${row}`].z = "0.00%";
}

function styleDataSheet(sheet, colCount, rowCount) {
  const border = excelBorder();
  for (let row = 1; row <= Math.min(rowCount, MAX_EXPORT_ROWS); row++) {
    for (let col = 1; col <= colCount; col++) {
      const ref = `${columnLetter(col)}${row}`;
      if (!sheet[ref]) sheet[ref] = { t: "s", v: "" };
      sheet[ref].s = {
        font: { name: "Aptos", sz: 9, color: { rgb: row === 1 ? "FFFFFFFF" : "FF163238" }, bold: row === 1 },
        fill: row === 1 ? { fgColor: { rgb: "FF087C68" } } : undefined,
        alignment: { vertical: "center", wrapText: true },
        border
      };
    }
  }
  sheet["!autofilter"] = { ref: `A1:${columnLetter(colCount)}${Math.max(rowCount, 1)}` };
  sheet["!freeze"] = { xSplit: 0, ySplit: 1 };
  sheet["!cols"] = Array.from({ length: colCount }, (_, index) => ({ wch: index < 4 ? 24 : 15 }));
}

function excelBorder() {
  const edge = { style: "thin", color: { rgb: "FFD4E2E2" } };
  return { top: edge, bottom: edge, left: edge, right: edge };
}

function parseMoodleParticipants(rawText) {
  const text = String(rawText || "").replace(/\r/g, "").replace(/\u00a0/g, " ").trim();
  if (!text) return [];

  const selectorRegex = /Seleccionar\s+['"]([^'"]+)['"]/gi;
  const matches = [...text.matchAll(selectorRegex)];
  const blocks = matches.length
    ? matches.map((match, index) => ({
        name: cleanPersonName(match[1]),
        content: text.slice(match.index, matches[index + 1]?.index ?? text.length)
      }))
    : text.split(/\n{2,}/).map(content => ({ name: "", content }));

  const unique = new Map();
  for (const block of blocks) {
    const cells = block.content.split(/\n|\t+/).map(value => value.trim()).filter(Boolean);
    const email = block.content.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
    const role = cells.find(cell => ["estudiante", "student"].includes(normalizeText(cell)));
    if (!email || !role) continue;
    const roleIndex = cells.indexOf(role);
    const access = [...cells].reverse().find(cell => /^(Nunca|Never|\d+\s+(día|días|hora|horas|minuto|minutos|segundo|segundos))/i.test(cell)) || "Sin dato";
    const accessIndex = cells.indexOf(access);
    const groups = roleIndex >= 0 && accessIndex > roleIndex ? cells.slice(roleIndex + 1, accessIndex).join(" ") : "Sin grupo";
    const emailIndex = cells.findIndex(cell => cell.includes(email));
    const name = block.name || cleanPersonName(cells[emailIndex - 1] || email);
    unique.set(email.toLowerCase(), { name, email, role, groups: groups || "Sin grupo", access });
  }
  return [...unique.values()];
}

function findHeaderIndex(headers, alternatives) {
  for (const alternative of alternatives) {
    const exact = headers.indexOf(normalizeText(alternative));
    if (exact >= 0) return exact;
  }
  return -1;
}

function isActivityHeader(header) {
  const text = normalizeText(header);
  return text.includes("foro") || text.includes("cuestionario") || text.includes("tarea") || text.includes("assignment") || text.includes("quiz");
}

function cleanActivityName(value) {
  return String(value || "")
    .replace(/^(Foro|Cuestionario|Tarea|Assignment|Quiz):\s*/i, "")
    .replace(/\s+calificación\s*\(Real\)\s*$/i, "")
    .replace(/\s*\(Real\)\s*$/i, "")
    .trim();
}

function parseSubmission(value) {
  if (typeof value === "number" && Number.isFinite(value)) return { delivered: true, numeric: value, display: value };
  const text = String(value ?? "").trim();
  if (!text || text === "-") return { delivered: false, numeric: null, display: "-" };
  const parsed = Number(text.replace(",", "."));
  return {
    delivered: true,
    numeric: Number.isFinite(parsed) ? parsed : null,
    display: Number.isFinite(parsed) ? parsed : text
  };
}

function classifyRisk(deliveryRate, noAccess, expectedActivities) {
  if (noAccess) return "high";
  if (expectedActivities === 0) return "low";
  if (deliveryRate <= 0.35) return "high";
  if (deliveryRate <= 0.70) return "medium";
  return "low";
}

function averageMatches(average, filter) {
  if (filter === "all") return true;
  if (filter === "none") return average === null;
  if (average === null) return false;
  if (filter === "below4") return average < 4;
  if (filter === "between4and7") return average >= 4 && average < 7;
  return average >= 7;
}

function averageOf(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function statusLabel(status) {
  return status === "low" ? "Riesgo Bajo" : status === "medium" ? "Riesgo Medio" : "Riesgo Alto";
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
}

function cleanPersonName(value) {
  return String(value || "").replace(/\s*\/\s*cas\s*$/i, "").replace(/\s+/g, " ").trim();
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function columnLetter(number) {
  let result = "";
  while (number > 0) {
    const remainder = (number - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    number = Math.floor((number - 1) / 26);
  }
  return result;
}

function setStatus(target, message, type) {
  const element = target === "source" ? elements.sourceStatus : elements.participantStatus;
  setStatusElement(element, message, type);
}

function setStatusElement(element, message, type) {
  element.textContent = message;
  element.className = `status-pill ${type}`;
}

function setProcessStatus(message, type = "") {
  elements.processStatus.textContent = message;
  elements.processStatus.className = `process-status ${type}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function resetApplication() {
  state.sourceName = "";
  state.sourceData = null;
  state.analysis = null;
  state.filteredStudents = [];
  elements.fileInput.value = "";
  elements.fileName.textContent = "Ningún archivo seleccionado";
  elements.sheetUrl.value = "";
  elements.participantText.value = "";
  elements.plannedActivities.value = "0";
  elements.studentSearch.value = "";
  elements.riskFilter.value = "all";
  elements.averageFilter.value = "all";
  elements.analyzeBtn.disabled = true;
  elements.downloadBtn.disabled = true;
  elements.studentSearch.disabled = true;
  elements.riskFilter.disabled = true;
  elements.averageFilter.disabled = true;
  setStatus("source", "Pendiente", "neutral");
  updateParticipantStatus();
  setProcessStatus("Cargá un archivo para comenzar.");
  metricElements.students.textContent = "0";
  metricElements.activities.textContent = "0";
  metricElements.planned.textContent = "0";
  metricElements.delivery.textContent = "0%";
  metricElements.average.textContent = "0";
  metricElements.riskLow.textContent = "0";
  metricElements.riskMedium.textContent = "0";
  metricElements.riskHigh.textContent = "0";
  metricElements.studentsNote.textContent = "Esperando datos";
  metricElements.activitiesNote.textContent = "Esperando datos";
  metricElements.plannedNote.textContent = "Esperando datos";
  metricElements.deliveryNote.textContent = "Esperando datos";
  metricElements.averageNote.textContent = "Solo notas numéricas";
  elements.activityChart.className = "activity-chart empty-state";
  elements.activityChart.textContent = "Los indicadores aparecerán después del análisis.";
  elements.alertsList.className = "alerts-list empty-state";
  elements.alertsList.textContent = "Todavía no hay señales para mostrar.";
  elements.studentTableBody.innerHTML = '<tr><td colspan="7" class="table-empty">Cargá información para construir el seguimiento.</td></tr>';
  elements.tableCount.textContent = "0 registros";
  validatePlannedActivities();
}

validatePlannedActivities();
