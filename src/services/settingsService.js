import api from "./api";

export const getMe = () => api.get("/api/settings/me");
export const updateMe = (data) => api.patch("/api/settings/me", data);
export const updateMePreferences = (data) => api.patch("/api/settings/me/preferences", data);
export const changePassword = (data) => api.post("/api/settings/change-password", data);

export const getVisaTypes = () => api.get("/api/settings/visa-types");
export const createVisaType = (data) => api.post("/api/settings/visa-types", data);
export const updateVisaType = (id, data) => api.patch(`/api/settings/visa-types/${id}`, data);
export const deleteVisaType = (id) => api.delete(`/api/settings/visa-types/${id}`);

export const getPetitionTypes = () => api.get("/api/settings/petition-types");
export const createPetitionType = (data) => api.post("/api/settings/petition-types", data);
export const updatePetitionType = (id, data) => api.patch(`/api/settings/petition-types/${id}`, data);
export const deletePetitionType = (id) => api.delete(`/api/settings/petition-types/${id}`);

export const getCaseCategories = () => api.get("/api/settings/case-categories");
export const createCaseCategory = (data) => api.post("/api/settings/case-categories", data);
export const deleteCaseCategory = (id) => api.delete(`/api/settings/case-categories/${id}`);

export const getSla = () => api.get("/api/settings/sla");
export const updateSla = (data) => api.put("/api/settings/sla", data);

export const getEmailTemplates = () => api.get("/api/settings/email-templates");
export const getEmailTemplate = (key) => api.get(`/api/settings/email-templates/${key}`);
export const updateEmailTemplate = (key, data) => api.put(`/api/settings/email-templates/${key}`, data);
