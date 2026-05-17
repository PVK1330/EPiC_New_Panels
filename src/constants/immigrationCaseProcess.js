/**
 * Standard UK immigration case workflow — mirrors Server/src/constants/immigrationCaseProcess.js
 */
export const DEFAULT_CASE_STAGE = "client_enquiry";

export const LEGACY_STATUS_TO_STAGE = {
  Lead: "client_enquiry",
  Pending: "initial_consultation",
  "In Progress": "application_preparation",
  "Docs Pending": "data_capture_initial_docs",
  Drafting: "draft_application_review",
  "Under Review": "document_review",
  Submitted: "application_submitted",
  Decision: "awaiting_decision",
  Approved: "decision_communicated",
  Rejected: "decision_communicated",
  Completed: "case_closure",
  Closed: "case_closure",
  "On Hold": "further_information_request",
  Cancelled: "case_closure",
  Overdue: "awaiting_decision",
};

const STAGE_UI = [
  { accent: "border-t-slate-400", dot: "bg-slate-400", header: "bg-slate-50 border-slate-200", titleClass: "text-slate-700", countClass: "bg-slate-200/80 text-slate-700" },
  { accent: "border-t-slate-500", dot: "bg-slate-500", header: "bg-slate-50 border-slate-200", titleClass: "text-slate-700", countClass: "bg-slate-200/80 text-slate-700" },
  { accent: "border-t-amber-400", dot: "bg-amber-400", header: "bg-amber-50 border-amber-100", titleClass: "text-amber-800", countClass: "bg-amber-100 text-amber-800" },
  { accent: "border-t-amber-500", dot: "bg-amber-500", header: "bg-amber-50 border-amber-100", titleClass: "text-amber-800", countClass: "bg-amber-100 text-amber-800" },
  { accent: "border-t-yellow-500", dot: "bg-yellow-500", header: "bg-yellow-50 border-yellow-100", titleClass: "text-yellow-800", countClass: "bg-yellow-100 text-yellow-800" },
  { accent: "border-t-orange-400", dot: "bg-orange-400", header: "bg-orange-50 border-orange-100", titleClass: "text-orange-800", countClass: "bg-orange-100 text-orange-800" },
  { accent: "border-t-blue-400", dot: "bg-blue-400", header: "bg-blue-50 border-blue-100", titleClass: "text-blue-800", countClass: "bg-blue-100 text-blue-800" },
  { accent: "border-t-blue-500", dot: "bg-blue-500", header: "bg-blue-50 border-blue-100", titleClass: "text-blue-800", countClass: "bg-blue-100 text-blue-800" },
  { accent: "border-t-indigo-500", dot: "bg-indigo-500", header: "bg-indigo-50 border-indigo-100", titleClass: "text-indigo-800", countClass: "bg-indigo-100 text-indigo-800" },
  { accent: "border-t-violet-500", dot: "bg-violet-500", header: "bg-violet-50 border-violet-100", titleClass: "text-violet-800", countClass: "bg-violet-100 text-violet-800" },
  { accent: "border-t-purple-500", dot: "bg-purple-500", header: "bg-purple-50 border-purple-100", titleClass: "text-purple-800", countClass: "bg-purple-100 text-purple-800" },
  { accent: "border-t-purple-600", dot: "bg-purple-600", header: "bg-purple-50 border-purple-100", titleClass: "text-purple-800", countClass: "bg-purple-100 text-purple-800" },
  { accent: "border-t-fuchsia-500", dot: "bg-fuchsia-500", header: "bg-fuchsia-50 border-fuchsia-100", titleClass: "text-fuchsia-800", countClass: "bg-fuchsia-100 text-fuchsia-800" },
  { accent: "border-t-orange-500", dot: "bg-orange-500", header: "bg-orange-50 border-orange-100", titleClass: "text-orange-800", countClass: "bg-orange-100 text-orange-800" },
  { accent: "border-t-emerald-500", dot: "bg-emerald-500", header: "bg-emerald-50 border-emerald-100", titleClass: "text-emerald-800", countClass: "bg-emerald-100 text-emerald-800" },
  { accent: "border-t-green-500", dot: "bg-green-500", header: "bg-emerald-50 border-emerald-100", titleClass: "text-emerald-800", countClass: "bg-emerald-100 text-emerald-800" },
];

export const IMMIGRATION_CASE_STEPS = [
  { id: "client_enquiry", order: 1, title: "Client Enquiry", shortTitle: "Enquiry", description: "Client contacts the firm with an immigration query." },
  { id: "initial_consultation", order: 2, title: "Initial Consultation", shortTitle: "Consultation", description: "Initial consultation to assess eligibility and visa options." },
  { id: "data_capture_initial_docs", order: 3, title: "Data Capture & Initial Documents", shortTitle: "Data & Docs", description: "Data Capture Sheet sent; passport, BRP/eVisa, driving licence requested." },
  { id: "application_preparation", order: 4, title: "Application Preparation", shortTitle: "Preparation", description: "Application form preparation begins once documents received." },
  { id: "document_review", order: 5, title: "Document Review", shortTitle: "Doc Review", description: "Caseworker reviews documents and identifies gaps." },
  { id: "further_information_request", order: 6, title: "Further Information Request", shortTitle: "Further Info", description: "Further information or documents requested from client." },
  { id: "draft_application_review", order: 7, title: "Draft Application Review", shortTitle: "Draft App", description: "Draft application sent to client for review and confirmation." },
  { id: "ccl_issued", order: 8, title: "Client Care Letter Issued", shortTitle: "CCL Issued", description: "Client Care Letter issued after draft approval." },
  { id: "ccl_payment_received", order: 9, title: "CCL & Payment Received", shortTitle: "CCL & Pay", description: "Signed CCL and payments received." },
  { id: "application_submitted", order: 10, title: "Application Submitted", shortTitle: "Submitted", description: "Final application submitted to the Home Office." },
  { id: "biometrics_booked", order: 11, title: "Biometrics Booked", shortTitle: "Bio Booked", description: "Biometrics appointment booked." },
  { id: "biometrics_confirmation_sent", order: 12, title: "Biometrics Confirmation Sent", shortTitle: "Bio Confirm", description: "Biometrics confirmation and instructions sent to client." },
  { id: "documents_uploaded", order: 13, title: "Documents Uploaded", shortTitle: "Uploaded", description: "Supporting documents uploaded before biometrics." },
  { id: "awaiting_decision", order: 14, title: "Awaiting Decision", shortTitle: "Decision", description: "Monitoring application while awaiting Home Office decision." },
  { id: "decision_communicated", order: 15, title: "Decision Communicated", shortTitle: "Decided", description: "Approval or refusal communicated to client." },
  { id: "case_closure", order: 16, title: "Case Closure", shortTitle: "Closed", description: "Final case closure email issued." },
];

const STEP_BY_ID = new Map(IMMIGRATION_CASE_STEPS.map((s) => [s.id, s]));

export const PIPELINE_STAGES = IMMIGRATION_CASE_STEPS.map((step, index) => ({
  ...step,
  ...STAGE_UI[index],
}));

export function isValidCaseStage(stageId) {
  return STEP_BY_ID.has(stageId);
}

export function getStepById(stageId) {
  return STEP_BY_ID.get(stageId) ?? null;
}

export function resolveCaseStage(caseRecord) {
  if (caseRecord?.caseStage && isValidCaseStage(caseRecord.caseStage)) {
    return caseRecord.caseStage;
  }
  const fromStatus = LEGACY_STATUS_TO_STAGE[caseRecord?.status];
  if (fromStatus) return fromStatus;
  return DEFAULT_CASE_STAGE;
}

export function getStepTitle(caseRecord) {
  const step = getStepById(resolveCaseStage(caseRecord));
  return step?.title ?? "Unknown stage";
}

export function getStepDescription(caseRecord) {
  const step = getStepById(resolveCaseStage(caseRecord));
  return step?.description ?? "";
}

export function getWorkflowProgress(caseRecord) {
  const stageId = resolveCaseStage(caseRecord);
  const current = getStepById(stageId);
  const order = current?.order ?? 1;
  return {
    stageId,
    currentStep: current,
    order,
    total: IMMIGRATION_CASE_STEPS.length,
    percent: Math.round((order / IMMIGRATION_CASE_STEPS.length) * 100),
  };
}

export function mapCaseToPipelineCard(c) {
  const stageId = resolveCaseStage(c);
  const step = getStepById(stageId) || IMMIGRATION_CASE_STEPS[0];
  return {
    id: c.caseId || String(c.id),
    caseId: c.caseId || String(c.id),
    name: c.candidate
      ? `${c.candidate.first_name || ""} ${c.candidate.last_name || ""}`.trim()
      : "Unknown",
    meta: `${c.visaType?.name || "—"} · ${
      c.sponsor ? `${c.sponsor.first_name || ""} ${c.sponsor.last_name || ""}`.trim() : "—"
    }`,
    badge: step.shortTitle,
    badgeClass: "bg-slate-100 text-slate-700",
    caseStage: stageId,
    status: c.status,
  };
}

export function buildStagesFromPipelineData(pipelineData) {
  return PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: pipelineData[stage.id]?.length || 0,
    cards: (pipelineData[stage.id] || []).map(mapCaseToPipelineCard),
  }));
}
