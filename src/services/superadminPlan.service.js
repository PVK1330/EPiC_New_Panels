import api from "./api";

export const fetchPlans = () => api.get("/api/superadmin/plans");

export const fetchPlanById = (id) => api.get(`/api/superadmin/plans/${id}`);

export const createPlan = (data) => api.post("/api/superadmin/plans", data);

export const updatePlan = (id, data) => api.put(`/api/superadmin/plans/${id}`, data);

export const deletePlan = (id) => api.delete(`/api/superadmin/plans/${id}`);
