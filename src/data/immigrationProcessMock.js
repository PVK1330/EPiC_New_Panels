import {
  PIPELINE_STAGES,
  IMMIGRATION_CASE_STEPS,
  STAGE_GUIDANCE,
} from "../constants/immigrationCaseProcess";

/** Static demo cases spread across workflow stages (UI preview only). */
export const MOCK_PIPELINE_CARDS = [
  { id: "CAS-104821", caseId: "CAS-104821", name: "Amara Okafor", meta: "Skilled Worker · TechCorp Ltd", badge: "Enquiry", badgeClass: "bg-slate-100 text-slate-700", caseStage: "client_enquiry" },
  { id: "CAS-104655", caseId: "CAS-104655", name: "James Mitchell", meta: "ILR · —", badge: "Consultation", badgeClass: "bg-slate-100 text-slate-700", caseStage: "initial_consultation" },
  { id: "CAS-104902", caseId: "CAS-104902", name: "Priya Sharma", meta: "Student · EduHost UK", badge: "Data & Docs", badgeClass: "bg-amber-100 text-amber-800", caseStage: "data_capture_initial_docs" },
  { id: "CAS-104710", caseId: "CAS-104710", name: "Chen Wei", meta: "Global Talent · Innovate Labs", badge: "Preparation", badgeClass: "bg-amber-100 text-amber-800", caseStage: "application_preparation" },
  { id: "CAS-104588", caseId: "CAS-104588", name: "Fatima Hassan", meta: "Family · —", badge: "Doc Review", badgeClass: "bg-yellow-100 text-yellow-800", caseStage: "document_review" },
  { id: "CAS-104431", caseId: "CAS-104431", name: "Lucas Ferreira", meta: "Skilled Worker · BuildRight", badge: "Draft App", badgeClass: "bg-orange-100 text-orange-800", caseStage: "draft_application_review" },
  { id: "CAS-104319", caseId: "CAS-104319", name: "Elena Popov", meta: "Spouse Visa · —", badge: "CCL Issued", badgeClass: "bg-blue-100 text-blue-800", caseStage: "ccl_issued" },
  { id: "CAS-104205", caseId: "CAS-104205", name: "David Okonkwo", meta: "Skilled Worker · Meridian Care", badge: "Submitted", badgeClass: "bg-indigo-100 text-indigo-800", caseStage: "application_submitted" },
  { id: "CAS-104112", caseId: "CAS-104112", name: "Sofia Andersson", meta: "Graduate · —", badge: "Bio Booked", badgeClass: "bg-violet-100 text-violet-800", caseStage: "biometrics_booked" },
  { id: "CAS-103998", caseId: "CAS-103998", name: "Raj Patel", meta: "ILR · Self-sponsored", badge: "Decision", badgeClass: "bg-fuchsia-100 text-fuchsia-800", caseStage: "awaiting_decision" },
  { id: "CAS-103876", caseId: "CAS-103876", name: "Maria Gonzalez", meta: "Skilled Worker · HealthFirst", badge: "Decided", badgeClass: "bg-emerald-100 text-emerald-800", caseStage: "decision_communicated" },
];

export function buildStaticPipelineStages() {
  return PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: MOCK_PIPELINE_CARDS.filter((c) => c.caseStage === stage.id).length,
    cards: MOCK_PIPELINE_CARDS.filter((c) => c.caseStage === stage.id),
  }));
}

export const MOCK_PROCESS_STATS = [
  { label: "Active cases", value: "47", sub: "Across all stages", tone: "primary" },
  { label: "Awaiting documents", value: "12", sub: "Steps 3–6", tone: "amber" },
  { label: "With Home Office", value: "8", sub: "Steps 10–14", tone: "indigo" },
  { label: "Closed this month", value: "5", sub: "Step 16", tone: "emerald" },
];

export const MOCK_SAMPLE_CASE = {
  caseId: "CAS-104431",
  candidate: "Lucas Ferreira",
  visaType: "Skilled Worker",
  sponsor: "BuildRight Construction Ltd",
  caseworker: "Sarah Thompson",
  caseStage: "draft_application_review",
  status: "Drafting",
  targetDate: "15 Jun 2026",
  priority: "High",
};

/** Document-aligned detail per step (from Standard Immigration Case Process). */
export const PROCESS_STEP_DETAILS = IMMIGRATION_CASE_STEPS.map((step) => {
  const extras = {
    ...STAGE_GUIDANCE,
    awaiting_decision: {
      actions: ["Monitor status", "Chase if overdue"],
      docs: [],
    },
    decision_communicated: {
      actions: ["Send approval/refusal email", "Attach decision letter"],
      docs: ["Decision letter", "BRP collection info (if granted)"],
    },
    case_closure: {
      actions: ["Send closure email", "Archive case file"],
      docs: ["Case closure letter"],
    },
  };
  return { ...step, ...(extras[step.id] || { actions: [], docs: [] }) };
});
