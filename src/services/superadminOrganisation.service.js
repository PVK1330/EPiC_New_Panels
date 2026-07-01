import api from "./api";

export const fetchOrganisations = (params = {}) =>
  api.get("/api/superadmin/organisations", { params });

export const exportOrganisationsExcel = () =>
  api.get("/api/superadmin/organisations/export/excel", { responseType: "blob" });

export const exportOrganisationsPdf = () =>
  api.get("/api/superadmin/organisations/export/pdf", { responseType: "blob" });

export const fetchOrganisationById = (id) => api.get(`/api/superadmin/organisations/${id}`);

export const createOrganisation = (data) => api.post("/api/superadmin/organisations", data);

/** Org + admin in one request; rolls back if admin email/mobile invalid or creation fails */
export const createOrganisationWithAdmin = (data) =>
  api.post("/api/superadmin/organisations/with-admin", data, {
    timeout: 120000,
  });

export const updateOrganisation = (id, data) => api.patch(`/api/superadmin/organisations/${id}`, data);

export const deleteOrganisation = (id) => api.delete(`/api/superadmin/organisations/${id}`);

export const suspendOrganisation = (id) => api.post(`/api/superadmin/organisations/${id}/suspend`);

export const activateOrganisation = (id) => api.post(`/api/superadmin/organisations/${id}/activate`);

export const markOrganisationAsPaid = (id, paymentMethod) =>
  api.post(`/api/superadmin/organisations/${id}/mark-paid`, { payment_method: paymentMethod });

export const createOrganisationAdmin = (orgId, data) => api.post(`/api/superadmin/organisations/${orgId}/admins`, data);

export const impersonateOrganisation = (orgId) => api.post(`/api/superadmin/organisations/${orgId}/impersonate`);
