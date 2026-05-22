import api from "./api";

const unwrap = (res) => res.data?.data ?? res.data;

// ── Candidate ────────────────────────────────────────────────────────────────
export const getDataCaptureForm = () =>
  api.get("/api/workflow/data-capture").then(unwrap);

export const saveDataCaptureDraft = (body) =>
  api.put("/api/workflow/data-capture", body).then(unwrap);

export const submitDataCapture = (body) =>
  api.post("/api/workflow/data-capture/submit", body).then(unwrap);

export const getDecisionDocuments = () =>
  api.get("/api/workflow/decision-documents").then(unwrap);

export const getCandidateCcl = () =>
  api.get("/api/workflow/ccl").then(unwrap);

export const downloadCandidateCcl = () =>
  api.get("/api/workflow/ccl/download", { responseType: "blob" });

export const acceptCcl = () =>
  api.post("/api/workflow/ccl/accept").then(unwrap);

export const confirmCclSigned = (body) =>
  api.post("/api/workflow/ccl/confirm-signed", body).then(unwrap);

export const getCandidatePaymentSchedule = () =>
  api.get("/api/workflow/payments/schedule").then((res) => res.data?.data ?? res.data);

export const getCandidateTasks = () =>
  api.get("/api/workflow/my-tasks").then(unwrap);

export const completeCandidateTask = (taskId) =>
  api.patch(`/api/workflow/my-tasks/${taskId}/complete`).then(unwrap);

export const getCandidateWorkflowProcess = () =>
  api.get("/api/workflow/process").then(unwrap);

export const submitDraftReview = (confirmed) =>
  api.post("/api/workflow/draft-review", { confirmed }).then(unwrap);

export const submitBiometricAvailability = (body) =>
  api.post("/api/workflow/biometric-availability", body).then(unwrap);

export const markBiometricAttended = () =>
  api.post("/api/workflow/mark-biometric-attended").then(unwrap);

// ── Staff (admin / caseworker) ───────────────────────────────────────────────
export const getCaseWorkflowBundle = (caseId) =>
  api.get(`/api/workflow/cases/${caseId}/bundle`).then(unwrap);

export const getDataCapture = (caseId) =>
  api.get(`/api/workflow/cases/${caseId}/data-capture`).then(unwrap);

export const sendDataCaptureRequest = (caseId) =>
  api.post(`/api/workflow/cases/${caseId}/data-capture/send`).then(unwrap);

export const reviewDataCapture = (caseId, body) =>
  api.patch(`/api/workflow/cases/${caseId}/data-capture/review`, body).then(unwrap);

export const getCclStatus = (caseId) =>
  api.get(`/api/workflow/cases/${caseId}/ccl`).then(unwrap);

export const proposeCclFees = (caseId, body) =>
  api.post(`/api/workflow/cases/${caseId}/ccl/propose`, body).then(unwrap);

export const reviewCclFees = (caseId, body) =>
  api.patch(`/api/workflow/cases/${caseId}/ccl/fee-review`, body).then(unwrap);

export const getPendingCclFeeApprovals = () =>
  api.get("/api/workflow/ccl/pending-approvals").then(unwrap);

export const recordVisaPortalSubmission = (caseId, body) =>
  api.post(`/api/workflow/cases/${caseId}/visa-portal-submit`, body).then(unwrap);

export const sendBiometricSlot = (caseId, body) =>
  api.post(`/api/workflow/cases/${caseId}/biometric-slot`, body).then(unwrap);

export const recordBiometricDocsUploaded = (caseId) =>
  api.post(`/api/workflow/cases/${caseId}/biometric-docs-uploaded`).then(unwrap);

export const recordVisaPortalReply = (caseId, body) =>
  api.post(`/api/workflow/cases/${caseId}/visa-portal-reply`, body).then(unwrap);
