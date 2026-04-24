import api from "./api";

export const getMe = () => api.get("/api/settings/me");
export const updateMe = (data) => api.patch("/api/settings/me", data, {
  headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
});
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

export const getSlaRules = () => api.get("/api/settings/sla-rules");
export const createSlaRule = (data) => api.post("/api/settings/sla-rules", data);
export const updateSlaRule = (id, data) => api.patch(`/api/settings/sla-rules/${id}`, data);
export const deleteSlaRule = (id) => api.delete(`/api/settings/sla-rules/${id}`);

export const getEmailTemplates = () => api.get("/api/settings/email-templates");
export const createEmailTemplate = (data) => api.post("/api/settings/email-templates", data);
export const getEmailTemplate = (key) => api.get(`/api/settings/email-templates/${key}`);
export const updateEmailTemplate = (key, data) => api.put(`/api/settings/email-templates/${key}`, data);
export const deleteEmailTemplate = (key) => api.delete(`/api/settings/email-templates/${key}`);

export const getPaymentSetting = () => api.get("/api/settings/payment-settings");
export const updatePaymentSetting = (data) => api.put("/api/settings/payment-settings", data);
