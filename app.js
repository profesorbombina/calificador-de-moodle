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
  highRiskDeliveries: document.querySelector("#highRiskDeliveries"),
  highRiskStatus: document.querySelector("#highRiskStatus"),
  lowRiskDeliveries: document.querySelector("#lowRiskDeliveries"),
  lowRiskStatus: document.querySelector("#lowRiskStatus"),
  approvalGrade: document.querySelector("#approvalGrade"),
  approvalStatus: document.querySelector("#approvalStatus"),
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
  signalFilter: document.querySelector("#signalFilter"),
  participantStateFilter: document.querySelector("#participantStateFilter"),
  studentTableBody: document.querySelector("#studentTableBody"),
  tableCount: document.querySelector("#tableCount"),
  activityChart: document.querySelector("#activityChart"),
  alertsList: document.querySelector("#alertsList"),
  mailCourseName: document.querySelector("#mailCourseName"),
  mailTeacherName: document.querySelector("#mailTeacherName"),
  mailTone: document.querySelector("#mailTone"),
  mailHighCount: document.querySelector("#mailHighCount"),
  mailMediumCount: document.querySelector("#mailMediumCount"),
  mailLowCount: document.querySelector("#mailLowCount"),
  mailHighSubject: document.querySelector("#mailHighSubject"),
  mailMediumSubject: document.querySelector("#mailMediumSubject"),
  mailLowSubject: document.querySelector("#mailLowSubject"),
  mailHighRecipients: document.querySelector("#mailHighRecipients"),
  mailMediumRecipients: document.querySelector("#mailMediumRecipients"),
  mailLowRecipients: document.querySelector("#mailLowRecipients"),
  mailHighBody: document.querySelector("#mailHighBody"),
  mailMediumBody: document.querySelector("#mailMediumBody"),
  mailLowBody: document.querySelector("#mailLowBody")
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
  riskHigh: document.querySelector("#metricRiskHigh"),
  active: document.querySelector("#metricActive"),
  suspended: document.querySelector("#metricSuspended"),
  activeCard: document.querySelector("#activeMetricCard"),
  suspendedCard: document.querySelector("#suspendedMetricCard")
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
elements.signalFilter.addEventListener("change", applyStudentFilters);
elements.participantStateFilter.addEventListener("change", applyStudentFilters);
elements.mailCourseName.addEventListener("input", refreshMailFromFilters);
elements.mailTeacherName.addEventListener("input", refreshMailFromFilters);
elements.mailTone.addEventListener("change", refreshMailFromFilters);
elements.plannedActivities.addEventListener("input", validatePlannedActivities);
elements.highRiskDeliveries.addEventListener("input", validateRiskThresholds);
elements.lowRiskDeliveries.addEventListener("input", validateRiskThresholds);
elements.approvalGrade.addEventListener("input", validateApprovalGrade);
elements.fileTab.addEventListener("click", () => selectSourceTab("file"));
elements.urlTab.addEventListener("click", () => selectSourceTab("url"));
elements.participantText.addEventListener("input", updateParticipantStatus);
document.querySelectorAll("[data-copy-target]").forEach(button => {
  button.addEventListener("click", () => copyFieldValue(button.dataset.copyTarget, button));
});
document.querySelectorAll("[data-gmail-group]").forEach(button => {
  button.addEventListener("click", () => openGmailDraft(button.dataset.gmailGroup));
});

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
    setProcessStatus("Fuente cargada. Continuá con los pasos obligatorios.", "ok");
    updateFormReadiness();
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
    setProcessStatus("Hoja cargada. Continuá con los pasos obligatorios.", "ok");
    updateFormReadiness();
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
    setStatus("participant", "Requerido", "neutral");
    elements.participantHint.textContent = "Acepta 5, 6 o 7 columnas copiadas desde Participantes de Moodle.";
    updateFormReadiness();
    return;
  }
  const students = parseMoodleParticipants(text);
  setStatus("participant", `${students.length} detectados`, students.length ? "ok" : "error");
  elements.participantHint.textContent = students.length
    ? `${students.length} estudiantes únicos listos para cruzar.`
    : "No se detectaron estudiantes con correo y rol Estudiante.";
  updateFormReadiness();
}

function validatePlannedActivities() {
  const value = parseRequiredInteger(elements.plannedActivities.value);
  const valid = Number.isInteger(value) && value >= 0 && value <= 100;
  const empty = elements.plannedActivities.value.trim() === "";
  setStatusElement(elements.plannedStatus, valid ? `${value} actividades` : empty ? "Requerido" : "Valor inválido", valid ? "ok" : empty ? "neutral" : "error");
  validateRiskThresholds(false);
  updateAnalyzeButton();
  return valid ? value : null;
}

function validateRiskThresholds(updateButton = true) {
  const highRisk = parseRequiredInteger(elements.highRiskDeliveries.value);
  const lowRisk = parseRequiredInteger(elements.lowRiskDeliveries.value);
  const planned = parseRequiredInteger(elements.plannedActivities.value);
  const highEmpty = elements.highRiskDeliveries.value.trim() === "";
  const lowEmpty = elements.lowRiskDeliveries.value.trim() === "";
  const highValid = Number.isInteger(highRisk) && highRisk >= 0 && Number.isInteger(planned) && highRisk <= planned &&
    (!Number.isInteger(lowRisk) || highRisk < lowRisk);
  const lowValid = Number.isInteger(lowRisk) && lowRisk >= 0 && Number.isInteger(planned) && lowRisk <= planned &&
    (!Number.isInteger(highRisk) || lowRisk > highRisk);
  const highMessage = highValid ? `Hasta ${highRisk} entregas` : highEmpty ? "Requerido" : Number.isInteger(lowRisk) && highRisk >= lowRisk ? "Debe ser menor al Paso 5" : Number.isInteger(planned) ? `Debe estar entre 0 y ${planned}` : "Completá primero el Paso 3";
  const lowMessage = lowValid ? `Desde ${lowRisk} entregas` : lowEmpty ? "Requerido" : Number.isInteger(highRisk) && lowRisk <= highRisk ? "Debe ser mayor al Paso 4" : Number.isInteger(planned) ? `Debe estar entre 0 y ${planned}` : "Completá primero el Paso 3";
  setStatusElement(elements.highRiskStatus, highMessage, highValid ? "ok" : highEmpty ? "neutral" : "error");
  setStatusElement(elements.lowRiskStatus, lowMessage, lowValid ? "ok" : lowEmpty ? "neutral" : "error");
  if (updateButton) updateAnalyzeButton();
  return highValid && lowValid ? { highRisk, lowRisk } : null;
}

function validateApprovalGrade() {
  const value = parseRequiredInteger(elements.approvalGrade.value);
  const valid = Number.isInteger(value) && value >= 0 && value <= 100;
  const empty = elements.approvalGrade.value.trim() === "";
  setStatusElement(elements.approvalStatus, valid ? `Aprueba con ${value}` : empty ? "Requerido" : "Valor inválido", valid ? "ok" : empty ? "neutral" : "error");
  updateAnalyzeButton();
  return valid ? value : null;
}

function updateFormReadiness() {
  validatePlannedActivities();
  validateApprovalGrade();
  updateAnalyzeButton();
}

function updateAnalyzeButton() {
  const participantsValid = parseMoodleParticipants(elements.participantText.value).length > 0;
  const planned = parseRequiredInteger(elements.plannedActivities.value);
  const highRisk = parseRequiredInteger(elements.highRiskDeliveries.value);
  const lowRisk = parseRequiredInteger(elements.lowRiskDeliveries.value);
  const approval = parseRequiredInteger(elements.approvalGrade.value);
  const configurationValid = Number.isInteger(planned) && planned >= 0 && planned <= 100 &&
    Number.isInteger(highRisk) && highRisk >= 0 && highRisk < lowRisk &&
    Number.isInteger(lowRisk) && lowRisk <= planned &&
    Number.isInteger(approval) && approval >= 0 && approval <= 100;
  elements.analyzeBtn.disabled = !(state.sourceData && participantsValid && configurationValid);
}

function clearParticipants() {
  elements.participantText.value = "";
  updateParticipantStatus();
}

async function analyzeCourse() {
  if (!state.sourceData) return;
  const plannedActivities = validatePlannedActivities();
  const thresholds = validateRiskThresholds();
  const approvalGrade = validateApprovalGrade();
  const participants = parseMoodleParticipants(elements.participantText.value);
  if (!participants.length || plannedActivities === null || thresholds === null || approvalGrade === null) {
    setProcessStatus("Completá correctamente los seis pasos obligatorios antes de analizar.", "error");
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
    state.analysis = buildAnalysis(gradeRows, participants, gradeSheetName, plannedActivities, thresholds.highRisk, thresholds.lowRisk, approvalGrade);

    renderDashboard(state.analysis);
    elements.downloadBtn.disabled = false;
    elements.studentSearch.disabled = false;
    elements.riskFilter.disabled = false;
    elements.averageFilter.disabled = false;
    elements.signalFilter.disabled = false;
    elements.participantStateFilter.disabled = !state.analysis.hasParticipantStates;
    elements.participantStateFilter.hidden = !state.analysis.hasParticipantStates;
    setProcessStatus(`Análisis listo: ${state.analysis.students.length} estudiantes y ${state.analysis.activities.length} actividades.`, "ok");
    elements.dashboard.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    setProcessStatus(`No se pudo analizar la fuente: ${error.message}`, "error");
  } finally {
    updateAnalyzeButton();
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

function buildAnalysis(rows, participants, sheetName, plannedActivities = 0, highRiskDeliveries = 0, lowRiskDeliveries = 0, approvalGrade = 0) {
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
    const detectedDeliveries = submissions.filter(submission => submission.delivered).length;
    const delivered = Math.min(detectedDeliveries, plannedActivities);
    const numericGrades = submissions.map(submission => submission.numeric).filter(grade => grade !== null);
    const average = averageOf(numericGrades);
    const participant = participantMap.get(email.toLowerCase()) || {};
    const noAccess = normalizeText(participant.access) === "nunca";
    const participantState = normalizeParticipantState(participant.status);
    const expectedActivities = plannedActivities;
    const deliveryRate = expectedActivities > 0 ? Math.min(delivered / expectedActivities, 1) : 0;
    const risk = classifyRisk({ delivered, average, noAccess, highRiskDeliveries, lowRiskDeliveries, approvalGrade });

    students.push({
      name: participant.name || fullName || email,
      email,
      id: indexes.id >= 0 ? row[indexes.id] : "",
      group: participant.groups || "Sin grupo",
      access: participant.access || "Sin dato",
      participantStatus: participant.status || "Sin dato",
      participantState,
      grades: submissions.map(submission => submission.display),
      delivered,
      detectedDeliveries,
      average,
      deliveryRate,
      status: risk.status,
      riskReason: risk.reason
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
  const activeCount = students.filter(student => student.participantState === "active").length;
  const suspendedCount = students.filter(student => student.participantState === "suspended").length;
  const hasParticipantStates = students.some(student => student.participantState !== "unknown");
  // El promedio del curso pondera cada calificación numérica registrada por igual.
  const courseAverage = averageOf(activities.flatMap(activity => activity.grades));

  return {
    generatedAt: new Date(),
    sourceName: state.sourceName,
    sourceSheet: sheetName,
    plannedActivities,
    highRiskDeliveries,
    lowRiskDeliveries,
    approvalGrade,
    activities,
    students,
    hasParticipantStates,
    totals: {
      delivered: totalDelivered,
      possible: totalPossible,
      deliveryRate: totalPossible ? Math.min(totalDelivered / totalPossible, 1) : 0,
      average: courseAverage,
      riskLow,
      riskMedium,
      riskHigh,
      noAccess: noAccessCount,
      matchedParticipants,
      active: activeCount,
      suspended: suspendedCount
    }
  };
}

function renderDashboard(analysis) {
  toggleParticipantStateControls(analysis);
  applyStudentFilters();
}

function renderDashboardPanels(analysis) {
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
  metricElements.active.textContent = totals.active;
  metricElements.suspended.textContent = totals.suspended;

  renderActivityChart(activities, students.length);
  renderAlerts(analysis);
  renderMailSection(analysis);
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
  const alerts = collectAlerts(analysis);
  elements.alertsList.classList.remove("empty-state");
  elements.alertsList.innerHTML = alerts.map(([type, symbol, title, text]) => `
    <div class="alert-item alert-${type}">
      <span class="alert-symbol">${symbol}</span>
      <div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></div>
    </div>`).join("");
}

function collectAlerts(analysis) {
  const { students, activities, totals } = analysis;
  const weakActivities = activities.filter(activity => activity.delivered / Math.max(students.length, 1) < 0.5);
  const alerts = [];

  if (totals.noAccess) alerts.push(["danger", "!", `${totals.noAccess} sin ingreso`, "Conviene contactar primero a quienes nunca accedieron al aula."]);
  if (weakActivities.length) alerts.push(["warning", "↓", `${weakActivities.length} actividades con baja entrega`, "Tienen menos del 50% de participación registrada."]);
  if (totals.riskHigh) alerts.push(["danger", "!", `${totals.riskHigh} estudiantes en Riesgo Alto`, "No ingresaron, no entregaron actividades o su promedio está desaprobado."]);
  if (totals.deliveryRate >= 0.75) alerts.push(["success", "✓", "Buen nivel de participación", `El curso alcanza ${formatPercent(totals.deliveryRate)} de entregas.`]);
  if (!alerts.length) alerts.push(["success", "✓", "Sin alertas críticas", "El análisis no encontró señales prioritarias."]);
  return alerts;
}

function renderMailSection(analysis) {
  const groups = {
    high: analysis.students.filter(student => student.status === "high" && student.email),
    medium: analysis.students.filter(student => student.status === "medium" && student.email),
    low: analysis.students.filter(student => student.status === "low" && student.email)
  };

  setMailGroup("High", groups.high, buildMailSubject("high"), buildMailBody("high", analysis));
  setMailGroup("Medium", groups.medium, buildMailSubject("medium"), buildMailBody("medium", analysis));
  setMailGroup("Low", groups.low, buildMailSubject("low"), buildMailBody("low", analysis));
}

function setMailGroup(key, students, subject, body) {
  const uniqueEmails = [...new Set(students.map(student => student.email.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  elements[`mail${key}Count`].innerHTML = `<span class="count-number">${uniqueEmails.length}</span> destinatario${uniqueEmails.length === 1 ? "" : "s"}`;
  elements[`mail${key}Subject`].value = subject;
  elements[`mail${key}Recipients`].value = uniqueEmails.join(", ");
  elements[`mail${key}Body`].value = body;
}

function buildMailSubject(status) {
  const courseName = getMailCourseName();
  const suffix = courseName ? ` - ${courseName}` : "";
  const subjects = {
    high: `Seguimiento prioritario en Moodle${suffix}`,
    medium: `Seguimiento preventivo de cursada${suffix}`,
    low: `Continuidad y reconocimiento de participación${suffix}`
  };
  return subjects[status];
}

function buildMailBody(status, analysis) {
  const courseName = getMailCourseName();
  const teacherName = getMailTeacherName();
  const courseReference = courseName ? ` del curso ${courseName}` : " del aula virtual";
  const courseContext = `Al revisar el seguimiento${courseReference}, se consideraron ${analysis.plannedActivities} actividades planificadas hasta la fecha y una nota de aprobación de ${analysis.approvalGrade}.`;
  const signatures = `Saludos cordiales.\n\n${teacherName}`;
  const formal = elements.mailTone.value === "formal";
  const greeting = formal ? "Estimados/as estudiantes:" : "Hola a todos/as:";
  const closeInvite = formal ? "por favor comuníquense" : "escríbannos";
  const bodies = {
    high: `${greeting}\n\nEspero que se encuentren bien. ${courseContext}\n\nEl registro muestra que necesitan una intervención prioritaria para sostener la continuidad en la cursada. Les pedimos que ingresen a Moodle a la brevedad, revisen las actividades pendientes y regularicen las entregas posibles.\n\nSi tuvieron dificultades de acceso, organización, comprensión de consignas o cualquier otra situación que esté afectando su participación, ${closeInvite} con el equipo docente para poder acompañarlos/as y acordar una estrategia de recuperación.\n\nEs importante retomar la actividad en el aula virtual cuanto antes para evitar que se acumulen nuevas tareas y para fortalecer el proceso de aprendizaje.\n\n${signatures}`,
    medium: `${greeting}\n\nEspero que se encuentren bien. ${courseContext}\n\nEl seguimiento indica participación parcial o algunos indicadores que conviene atender para sostener una trayectoria regular. Les recomendamos ingresar a Moodle, revisar las actividades realizadas y completar aquellas que todavía estén pendientes.\n\nTambién los/as invitamos a consultar con el equipo docente si necesitan orientación sobre consignas, plazos, materiales o formas de entrega. La intención de este mensaje es acompañar preventivamente y evitar que pequeñas demoras se transformen en dificultades mayores.\n\nContinuar con una participación frecuente les permitirá fortalecer los aprendizajes y llegar en mejores condiciones a las próximas instancias del curso.\n\n${signatures}`,
    low: `${greeting}\n\nEspero que se encuentren bien. ${courseContext}\n\nEl seguimiento muestra una participación adecuada en la plataforma y un avance favorable en las actividades propuestas. Queremos reconocer el compromiso sostenido y alentarlos/as a continuar con este ritmo de trabajo.\n\nLes sugerimos seguir ingresando periódicamente a Moodle, revisar las novedades del aula y mantener al día las próximas entregas. Ante cualquier duda o dificultad, pueden comunicarse con el equipo docente para recibir orientación.\n\nLa continuidad en la participación es clave para consolidar los aprendizajes y transitar el curso de manera organizada.\n\n${signatures}`
  };
  return bodies[status];
}

function getMailCourseName() {
  return elements.mailCourseName.value.trim();
}

function getMailTeacherName() {
  return elements.mailTeacherName.value.trim() || "Equipo docente";
}

function refreshMailFromFilters() {
  if (!state.analysis) return;
  renderMailSection(buildFilteredAnalysis(state.analysis, state.filteredStudents));
}

async function copyFieldValue(targetId, button) {
  const field = document.querySelector(`#${targetId}`);
  if (!field || !field.value.trim()) {
    setProcessStatus("No hay contenido para copiar en ese bloque.", "error");
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(field.value);
    } else {
      field.focus();
      field.select();
      document.execCommand("copy");
      field.setSelectionRange(0, 0);
    }
    const originalText = button.textContent;
    button.textContent = "Copiado";
    setProcessStatus("Contenido copiado al portapapeles.", "ok");
    setTimeout(() => { button.textContent = originalText; }, 1400);
  } catch (error) {
    setProcessStatus("No se pudo copiar automaticamente. Selecciona el texto y copialo manualmente.", "error");
  }
}

function openGmailDraft(key) {
  const recipients = elements[`mail${key}Recipients`].value.trim();
  const subject = elements[`mail${key}Subject`].value.trim();
  const body = elements[`mail${key}Body`].value.trim();
  if (!recipients || !body) {
    setProcessStatus("No hay destinatarios suficientes para abrir Gmail en ese grupo.", "error");
    return;
  }

  const url = new URL("https://mail.google.com/mail/");
  url.searchParams.set("view", "cm");
  url.searchParams.set("fs", "1");
  url.searchParams.set("to", recipients);
  url.searchParams.set("su", subject);
  url.searchParams.set("body", body);
  window.open(url.toString(), "_blank", "noopener");
  setProcessStatus("Gmail se abrió con destinatarios, asunto y cuerpo cargados.", "ok");
}

function applyStudentFilters() {
  if (!state.analysis) return;
  const query = normalizeText(elements.studentSearch.value);
  const status = elements.riskFilter.value;
  const averageFilter = elements.averageFilter.value;
  const signalFilter = elements.signalFilter.value;
  const participantState = state.analysis.hasParticipantStates ? elements.participantStateFilter.value : "all";
  state.filteredStudents = state.analysis.students.filter(student => {
    const matchesText = !query || normalizeText(`${student.name} ${student.email} ${student.group} ${student.participantStatus}`).includes(query);
    const matchesStatus = status === "all" || student.status === status;
    const matchesAverage = averageMatches(student.average, averageFilter, state.analysis.approvalGrade);
    const matchesSignal = signalMatches(student, signalFilter, state.analysis.approvalGrade);
    const matchesParticipantState = participantState === "all" || student.participantState === participantState;
    return matchesText && matchesStatus && matchesAverage && matchesSignal && matchesParticipantState;
  });
  const filteredAnalysis = buildFilteredAnalysis(state.analysis, state.filteredStudents);
  renderDashboardPanels(filteredAnalysis);
  renderStudentTable(state.filteredStudents, state.analysis.plannedActivities);
}

function renderStudentTable(students, plannedActivities) {
  elements.tableCount.textContent = `${students.length} registros`;
  if (!students.length) {
    elements.studentTableBody.innerHTML = '<tr><td colspan="9" class="table-empty">No hay estudiantes que coincidan con el filtro.</td></tr>';
    return;
  }
  elements.studentTableBody.innerHTML = students.map(student => `
    <tr>
      <td class="student-name">${escapeHtml(student.name)}</td>
      <td class="muted-cell">${escapeHtml(student.email || "Sin dato")}</td>
      <td class="muted-cell">${escapeHtml(student.group)}</td>
      <td>${student.delivered} / ${plannedActivities}</td>
      <td>${student.average === null ? "Sin nota" : student.average.toFixed(2)}</td>
      <td class="muted-cell">${escapeHtml(student.access)}</td>
      <td class="muted-cell">${escapeHtml(student.participantStatus)}</td>
      <td>${statusBadge(student.status, student.riskReason)}</td>
      <td class="reason-cell">${escapeHtml(student.riskReason)}</td>
    </tr>`).join("");
}

function statusBadge(status, reason = "") {
  const config = {
    low: ["Riesgo Bajo", "badge-low"],
    medium: ["Riesgo Medio", "badge-medium"],
    high: ["Riesgo Alto", "badge-high"]
  };
  const [label, className] = config[status];
  return `<span class="badge ${className}" title="${escapeHtml(reason)}">${label}</span>`;
}

function downloadReport() {
  if (!state.analysis) return;
  const workbook = buildReportWorkbook(state.analysis);
  const baseName = state.sourceName.replace(/\.(xlsx|xls|ods|csv)$/i, "") || "curso-moodle";
  XLSX.writeFile(workbook, `${baseName} - Informe Moodle v2.xlsx`);
  setProcessStatus("Informe descargado correctamente.", "ok");
}

function buildReportWorkbook(analysis) {
  const workbook = XLSX.utils.book_new();
  const dashboardData = [
    ["INFORME DEL CURSO", "", "", ""],
    ["Generado", analysis.generatedAt.toLocaleString("es-AR"), "Fuente", analysis.sourceName],
    [],
    ["ESTUDIANTES", "VALOR", "ACTIVIDADES", "VALOR"],
    ["Total de estudiantes analizados", analysis.students.length, "Total de actividades detectadas", analysis.activities.length],
    ["Estudiantes cruzados con Participantes", analysis.totals.matchedParticipants, "Actividades a realizar a la fecha", analysis.plannedActivities],
    ["Estudiantes con Riesgo Bajo", analysis.totals.riskLow, "Entregas registradas", analysis.totals.delivered],
    ["Estudiantes con Riesgo Medio", analysis.totals.riskMedium, "Entregas esperadas", analysis.totals.possible],
    ["Estudiantes con Riesgo Alto", analysis.totals.riskHigh, "Nivel de entrega del curso", analysis.totals.deliveryRate],
    ["Estudiantes que nunca ingresaron", analysis.totals.noAccess, "Promedio del Curso", analysis.totals.average ?? ""],
    ["Estudiantes activos", analysis.totals.active, "Riesgo Alto hasta entregas", analysis.highRiskDeliveries],
    ["Estudiantes suspendidos", analysis.totals.suspended, "Riesgo Bajo desde entregas", analysis.lowRiskDeliveries],
    ["Nota de aprobación configurada", analysis.approvalGrade, "", ""],
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

  const gradeHeaders = ["Nombre", "Correo", "ID", "Grupo", ...analysis.activities.map(activity => activity.name), "Entregas", "Promedio", "Último acceso", "Estado usuario", "Riesgo", "Motivo"];
  const gradeRows = analysis.students.map(student => [
    student.name,
    student.email,
    student.id,
    student.group,
    ...student.grades.map(grade => grade ?? "-"),
    `${student.delivered} / ${analysis.plannedActivities}`,
    student.average ?? "",
    student.access,
    student.participantStatus,
    statusLabel(student.status),
    student.riskReason
  ]);
  const gradeSheet = XLSX.utils.aoa_to_sheet([gradeHeaders, ...gradeRows]);
  styleDataSheet(gradeSheet, gradeHeaders.length, gradeRows.length + 1);
  XLSX.utils.book_append_sheet(workbook, gradeSheet, "Calificaciones");

  const trackingHeaders = ["Nombre y Apellido", "Correo", "Grupo", "Último acceso", "Estado usuario", "Riesgo", "Motivo"];
  const trackingRows = analysis.students.map(student => [student.name, student.email, student.group, student.access, student.participantStatus, statusLabel(student.status), student.riskReason]);
  const trackingSheet = XLSX.utils.aoa_to_sheet([trackingHeaders, ...trackingRows]);
  styleDataSheet(trackingSheet, trackingHeaders.length, trackingRows.length + 1);
  XLSX.utils.book_append_sheet(workbook, trackingSheet, "Seguimiento");

  const alertRows = [["Tipo", "Señal", "Detalle"], ...collectAlerts(analysis).map(([type, , title, text]) => [alertTypeLabel(type), title, text])];
  const alertSheet = XLSX.utils.aoa_to_sheet(alertRows);
  styleDataSheet(alertSheet, 3, alertRows.length);
  alertSheet["!cols"] = [{ wch: 18 }, { wch: 36 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, alertSheet, "Alertas");

  const coordinationRows = buildCoordinationReportRows(analysis);
  const coordinationSheet = XLSX.utils.aoa_to_sheet(coordinationRows);
  styleDataSheet(coordinationSheet, 2, coordinationRows.length);
  coordinationSheet["!cols"] = [{ wch: 34 }, { wch: 95 }];
  XLSX.utils.book_append_sheet(workbook, coordinationSheet, "Reporte coordinación");

  const mailRows = buildMailExportRows(analysis);
  const mailSheet = XLSX.utils.aoa_to_sheet(mailRows);
  styleDataSheet(mailSheet, 5, mailRows.length);
  mailSheet["!cols"] = [{ wch: 30 }, { wch: 14 }, { wch: 48 }, { wch: 42 }, { wch: 90 }];
  XLSX.utils.book_append_sheet(workbook, mailSheet, "Correos");

  return workbook;
}

function buildCoordinationReportRows(analysis) {
  return [
    ["Reporte para coordinación", "Síntesis del seguimiento del curso"],
    ["Fecha de generación", analysis.generatedAt.toLocaleString("es-AR")],
    ["Fuente", analysis.sourceName],
    ["Resumen de estudiantes", `${analysis.students.length} estudiantes analizados. ${analysis.totals.riskHigh} con Riesgo Alto, ${analysis.totals.riskMedium} con Riesgo Medio y ${analysis.totals.riskLow} con Riesgo Bajo.`],
    ["Resumen de actividades", `${analysis.activities.length} actividades detectadas. Se esperaban ${analysis.totals.possible} entregas y se registraron ${analysis.totals.delivered}, equivalente al ${formatPercent(analysis.totals.deliveryRate)}.`],
    ["Promedio del Curso", analysis.totals.average === null ? "Sin calificaciones numéricas suficientes" : analysis.totals.average.toFixed(2)],
    ["Señales prioritarias", collectAlerts(analysis).map(([, , title, text]) => `${title}: ${text}`).join("\n")],
    ["Sugerencia de acción", "Priorizar contacto con estudiantes sin ingreso, sin entregas o con promedio inferior a la nota de aprobación. Usar la hoja Correos para copiar destinatarios, asunto y cuerpo sugerido."]
  ];
}

function alertTypeLabel(type) {
  if (type === "danger") return "Prioritaria";
  if (type === "warning") return "Atención";
  return "Informativa";
}

function buildMailExportRows(analysis) {
  const groups = [
    ["Estudiantes con Riesgo Alto", analysis.students.filter(student => student.status === "high" && student.email), buildMailSubject("high"), buildMailBody("high", analysis)],
    ["Estudiantes con Riesgo Medio", analysis.students.filter(student => student.status === "medium" && student.email), buildMailSubject("medium"), buildMailBody("medium", analysis)],
    ["Estudiantes con Riesgo Bajo", analysis.students.filter(student => student.status === "low" && student.email), buildMailSubject("low"), buildMailBody("low", analysis)]
  ];
  const rows = [["Grupo", "Destinatarios", "Correos", "Asunto sugerido", "Cuerpo sugerido"]];
  for (const [label, students, subject, body] of groups) {
    const emails = [...new Set(students.map(student => student.email.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
    rows.push([label, emails.length, emails.join("; "), subject, body]);
  }
  return rows;
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
  ["A1", "A4", "B4", "C4", "D4", "A15", "B15", "C15", "D15"].forEach(ref => {
    sheet[ref].s.fill = { fgColor: { rgb: "FF087C68" } };
    sheet[ref].s.font = { name: "Aptos Display", bold: true, sz: ref === "A1" ? 18 : 11, color: { rgb: "FFFFFFFF" } };
  });
  sheet["!merges"] = [XLSX.utils.decode_range("A1:D1")];
  sheet["!cols"] = [{ wch:28 }, { wch:18 }, { wch:28 }, { wch:18 }];
  if (sheet["D9"]) sheet["D9"].z = "0.00%";
  if (sheet["D10"]) sheet["D10"].z = "0.00";
  for (let row = 16; row <= rowCount; row++) {
    if (sheet[`C${row}`]) sheet[`C${row}`].z = "0.00%";
    if (sheet[`D${row}`]) sheet[`D${row}`].z = "0.00";
  }
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
  const tabularRows = text.split("\n")
    .map(row => row.split("\t").map(cell => cell.trim()).filter(Boolean))
    .filter(cells => cells.some(cell => /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(cell)));
  const blocks = matches.length
    ? matches.map((match, index) => ({
        name: cleanPersonName(match[1]),
        content: text.slice(match.index, matches[index + 1]?.index ?? text.length)
      }))
    : tabularRows.length
      ? tabularRows.map(cells => ({ name: cleanPersonName(cells[0]), cells }))
      : text.split(/\n{2,}/).map(content => ({ name: "", content }));

  const unique = new Map();
  for (const block of blocks) {
    const cells = block.cells || block.content.split(/\n|\t+/).map(value => value.trim()).filter(Boolean);
    const email = cells.find(cell => /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(cell))
      ?.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
    const role = cells.find(cell => {
      const normalized = normalizeText(cell);
      return normalized.includes("estudiante") || normalized.includes("student");
    });
    if (!email || !role) continue;
    const roleIndex = cells.indexOf(role);
    const access = cells.find(isAccessValue) || "Sin dato";
    const accessIndex = cells.indexOf(access);
    const groups = roleIndex >= 0 && accessIndex > roleIndex ? cells.slice(roleIndex + 1, accessIndex).join(" ") : "Sin grupo";
    const status = accessIndex >= 0 ? cells.slice(accessIndex + 1).find(isParticipantStatus) || "Sin dato" : "Sin dato";
    const emailIndex = cells.findIndex(cell => cell.includes(email));
    const name = block.name || cleanPersonName(cells[emailIndex - 1] || email);
    unique.set(email.toLowerCase(), { name, email, role, groups: groups || "Sin grupo", access, status });
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

function classifyRisk({ delivered, average, noAccess, highRiskDeliveries, lowRiskDeliveries, approvalGrade }) {
  if (noAccess) return { status: "high", reason: "Nunca ingresó a la plataforma" };
  if (average !== null && average < approvalGrade) {
    return { status: "high", reason: `Promedio ${average.toFixed(2)} inferior a la nota de aprobación (${approvalGrade})` };
  }
  if (delivered <= highRiskDeliveries) {
    return { status: "high", reason: `Realizó ${delivered} entregas; el Riesgo Alto alcanza hasta ${highRiskDeliveries}` };
  }
  if (delivered >= lowRiskDeliveries && average !== null && average >= approvalGrade) {
    return { status: "low", reason: `Realizó ${delivered} entregas y tiene promedio aprobado` };
  }
  if (average === null) return { status: "medium", reason: "Tiene entregas, pero no dispone de promedio numérico" };
  return { status: "medium", reason: `Realizó ${delivered} entregas; está entre los umbrales de Riesgo Alto y Bajo` };
}

function buildFilteredAnalysis(analysis, students) {
  const activities = analysis.activities.map((activity, activityIndex) => {
    const grades = [];
    let textualDeliveries = 0;
    let delivered = 0;
    for (const student of students) {
      const parsed = parseSubmission(student.grades[activityIndex]);
      if (!parsed.delivered) continue;
      delivered += 1;
      if (parsed.numeric !== null) grades.push(parsed.numeric);
      else textualDeliveries += 1;
    }
    return { ...activity, delivered, grades, textualDeliveries };
  });
  const totalPossible = students.length * analysis.plannedActivities;
  const totalDelivered = students.reduce((sum, student) => sum + student.delivered, 0);
  const riskLow = students.filter(student => student.status === "low").length;
  const riskMedium = students.filter(student => student.status === "medium").length;
  const riskHigh = students.filter(student => student.status === "high").length;
  const noAccessCount = students.filter(student => normalizeText(student.access) === "nunca").length;
  const matchedParticipants = students.filter(student => normalizeText(student.access) !== "sin dato" || normalizeText(student.participantStatus) !== "sin dato").length;
  return {
    ...analysis,
    activities,
    students,
    totals: {
      ...analysis.totals,
      delivered: totalDelivered,
      possible: totalPossible,
      deliveryRate: totalPossible ? Math.min(totalDelivered / totalPossible, 1) : 0,
      average: averageOf(activities.flatMap(activity => activity.grades)),
      riskLow,
      riskMedium,
      riskHigh,
      noAccess: noAccessCount,
      matchedParticipants,
      active: students.filter(student => student.participantState === "active").length,
      suspended: students.filter(student => student.participantState === "suspended").length
    }
  };
}

function signalMatches(student, filter, approvalGrade) {
  if (filter === "all") return true;
  if (filter === "noAccess") return normalizeText(student.access) === "nunca";
  if (filter === "noDeliveries") return student.delivered === 0;
  if (filter === "belowAverage") return student.average !== null && student.average < approvalGrade;
  if (filter === "noEmail") return !student.email;
  return true;
}

function toggleParticipantStateControls(analysis) {
  metricElements.activeCard.hidden = !analysis.hasParticipantStates;
  metricElements.suspendedCard.hidden = !analysis.hasParticipantStates;
  elements.participantStateFilter.hidden = !analysis.hasParticipantStates;
  elements.participantStateFilter.disabled = !analysis.hasParticipantStates;
  if (!analysis.hasParticipantStates) elements.participantStateFilter.value = "all";
}

function averageMatches(average, filter, approvalGrade) {
  if (filter === "all") return true;
  if (filter === "none") return average === null;
  if (average === null) return false;
  if (filter === "belowApproval") return average < approvalGrade;
  return average >= approvalGrade;
}

function averageOf(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function statusLabel(status) {
  return status === "low" ? "Riesgo Bajo" : status === "medium" ? "Riesgo Medio" : "Riesgo Alto";
}

function statusExportLabel(status) {
  return status === "low" ? "Estudiantes con Riesgo Bajo" : status === "medium" ? "Estudiantes con Riesgo Medio" : "Estudiantes con Riesgo Alto";
}

function normalizeParticipantState(value) {
  const text = normalizeText(value);
  if (["activo", "activa", "active"].includes(text)) return "active";
  if (["suspendido", "suspendida", "suspended", "inactivo", "inactiva", "inactive"].includes(text)) return "suspended";
  return "unknown";
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
}

function parseRequiredInteger(value) {
  if (String(value).trim() === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function isAccessValue(value) {
  const text = normalizeText(value);
  return text === "nunca" || text === "never" ||
    /^\d+\s+(dia|dias|hora|horas|minuto|minutos|segundo|segundos)/.test(text);
}

function isParticipantStatus(value) {
  const text = normalizeText(value);
  return ["activo", "activa", "inactivo", "inactiva", "suspendido", "suspendida", "active", "inactive", "suspended"].includes(text);
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
  elements.plannedActivities.value = "";
  elements.highRiskDeliveries.value = "";
  elements.lowRiskDeliveries.value = "";
  elements.approvalGrade.value = "";
  elements.studentSearch.value = "";
  elements.riskFilter.value = "all";
  elements.averageFilter.value = "all";
  elements.signalFilter.value = "all";
  elements.participantStateFilter.value = "all";
  elements.mailCourseName.value = "";
  elements.mailTeacherName.value = "";
  elements.mailTone.value = "formal";
  elements.analyzeBtn.disabled = true;
  elements.downloadBtn.disabled = true;
  elements.studentSearch.disabled = true;
  elements.riskFilter.disabled = true;
  elements.averageFilter.disabled = true;
  elements.signalFilter.disabled = true;
  elements.participantStateFilter.disabled = true;
  elements.participantStateFilter.hidden = true;
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
  metricElements.active.textContent = "0";
  metricElements.suspended.textContent = "0";
  metricElements.activeCard.hidden = true;
  metricElements.suspendedCard.hidden = true;
  metricElements.studentsNote.textContent = "Esperando datos";
  metricElements.activitiesNote.textContent = "Esperando datos";
  metricElements.plannedNote.textContent = "Esperando datos";
  metricElements.deliveryNote.textContent = "Esperando datos";
  metricElements.averageNote.textContent = "Solo notas numéricas";
  elements.activityChart.className = "activity-chart empty-state";
  elements.activityChart.textContent = "Los indicadores aparecerán después del análisis.";
  elements.alertsList.className = "alerts-list empty-state";
  elements.alertsList.textContent = "Todavía no hay señales para mostrar.";
  resetMailSection();
  elements.studentTableBody.innerHTML = '<tr><td colspan="9" class="table-empty">Cargá información para construir el seguimiento.</td></tr>';
  elements.tableCount.textContent = "0 registros";
  updateFormReadiness();
}

function resetMailSection() {
  elements.mailHighCount.textContent = "0 destinatarios";
  elements.mailMediumCount.textContent = "0 destinatarios";
  elements.mailLowCount.textContent = "0 destinatarios";
  elements.mailHighSubject.value = "";
  elements.mailMediumSubject.value = "";
  elements.mailLowSubject.value = "";
  elements.mailHighRecipients.value = "";
  elements.mailMediumRecipients.value = "";
  elements.mailLowRecipients.value = "";
  elements.mailHighBody.value = "";
  elements.mailMediumBody.value = "";
  elements.mailLowBody.value = "";
}

updateParticipantStatus();
updateFormReadiness();
