import api from "./api";

export const getAllModules = () => api.get("/api/superadmin/modules");

export const createModule = (data) => api.post("/api/superadmin/modules", data);

export const updateModule = (id, data) => api.put(`/api/superadmin/modules/${id}`, data);

export const deleteModule = (id) => api.delete(`/api/superadmin/modules/${id}`);

export const getModulesByPlan = (planId) => api.get(`/api/superadmin/plans/${planId}/modules`);

export const updatePlanModules = (planId, module_ids) =>
  api.put(`/api/superadmin/plans/${planId}/modules`, { module_ids });
