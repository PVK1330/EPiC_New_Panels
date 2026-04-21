import api from "./api";

export const fetchCandidateAccount = () => api.get("/api/candidate-account");

export const patchCandidatePreferences = (data) =>
  api.patch("/api/candidate-account/preferences", data);

export const submitCandidateFeedback = (data) =>
  api.post("/api/candidate-account/feedback", data);

export const postCandidateConsent = (data) =>
  api.post("/api/candidate-account/consent", data || {});

export const postCandidateDataDeletionRequest = () =>
  api.post("/api/candidate-account/data-deletion-request");

export const updateUserProfile = (data) => api.put("/api/user/profile", data);

export const changeOwnPassword = (data) =>
  api.post("/api/user/change-password", data);
