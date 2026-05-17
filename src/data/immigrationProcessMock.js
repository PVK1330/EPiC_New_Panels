import { PIPELINE_STAGES, IMMIGRATION_CASE_STEPS } from "../constants/immigrationCaseProcess";

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
    client_enquiry: {
      actions: ["Log enquiry", "Assign caseworker", "Schedule consultation"],
      docs: [],
    },
    initial_consultation: {
      actions: ["Assess eligibility", "Confirm visa route", "Send fee estimate"],
      docs: [],
    },
    data_capture_initial_docs: {
      actions: ["Send Data Capture Sheet", "Request mandatory documents"],
      docs: ["Passport", "BRP / eVisa", "Driving licence (if applicable)"],
    },
    application_preparation: {
      actions: ["Begin application form", "Verify DCS received"],
      docs: ["Completed Data Capture Sheet"],
    },
    document_review: {
      actions: ["Review uploads", "Flag gaps", "Internal QC"],
      docs: ["All mandatory documents"],
    },
    further_information_request: {
      actions: ["Email client for missing items", "Set follow-up date"],
      docs: ["As identified in review"],
    },
    draft_application_review: {
      actions: ["Send draft to client", "Collect written approval"],
      docs: ["Draft application PDF"],
    },
    ccl_issued: {
      actions: ["Issue Client Care Letter", "Attach terms & fees"],
      docs: ["Client Care Letter (unsigned)"],
    },
    ccl_payment_received: {
      actions: ["Collect signed CCL", "Confirm payment cleared"],
      docs: ["Signed CCL", "Payment receipt"],
    },
    application_submitted: {
      actions: ["Submit to Home Office", "Record UAN / reference"],
      docs: ["Submission confirmation"],
    },
    biometrics_booked: {
      actions: ["Book appointment", "Add to case calendar"],
      docs: ["Appointment letter"],
    },
    biometrics_confirmation_sent: {
      actions: ["Email client instructions", "Confirm attendance"],
      docs: ["Biometrics confirmation email"],
    },
    documents_uploaded: {
      actions: ["Upload supporting docs", "Pre-biometrics checklist"],
      docs: ["Supporting evidence bundle"],
    },
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
