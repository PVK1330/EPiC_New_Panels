import api from "./api";

export const fetchOrganisations = () => api.get("/api/superadmin/organisations");

export const fetchOrganisationById = (id) => api.get(`/api/superadmin/organisations/${id}`);

export const createOrganisation = (data) => api.post("/api/superadmin/organisations", data);

export const updateOrganisation = (id, data) => api.patch(`/api/superadmin/organisations/${id}`, data);

export const deleteOrganisation = (id) => api.delete(`/api/superadmin/organisations/${id}`);

export const suspendOrganisation = (id) => api.post(`/api/superadmin/organisations/${id}/suspend`);

export const activateOrganisation = (id) => api.post(`/api/superadmin/organisations/${id}/activate`);

export const createOrganisationAdmin = (orgId, data) => api.post(`/api/superadmin/organisations/${orgId}/admins`, data);

export const impersonateOrganisation = (orgId) => api.post(`/api/superadmin/organisations/${orgId}/impersonate`);
