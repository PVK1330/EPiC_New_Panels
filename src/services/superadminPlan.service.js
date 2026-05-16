import api from "./api";

export const fetchPlans = () => api.get("/api/superadmin/plans");

export const fetchPlanById = (id) => api.get(`/api/superadmin/plans/${id}`);

export const createPlan = (body) => api.post("/api/superadmin/plans", body);

export const updatePlan = (id, body) => api.put(`/api/superadmin/plans/${id}`, body);

export const deletePlan = (id) => api.delete(`/api/superadmin/plans/${id}`);
