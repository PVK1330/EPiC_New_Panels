import api from "./api";

/** Candidate: document checklist for their active case (by visa type) */
export const getMyDocumentChecklist = () =>
  api.get("/api/candidate/documents/checklist");
