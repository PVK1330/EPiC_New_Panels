import api from "./api";

export const fetchOrganisations = () => api.get("/api/superadmin/organisations");

export const fetchOrganisationById = (id) =>
  api.get(`/api/superadmin/organisations/${id}`);

/** Tenant DB provisioning runs many SQL migrations; default api timeout (10s) is too short. */
const ORG_PROVISION_TIMEOUT_MS = 600000;

export const createOrganisation = (body) =>
  api.post("/api/superadmin/organisations", body, { timeout: ORG_PROVISION_TIMEOUT_MS });

export const createOrganisationAdmin = (organisationId, body) =>
  api.post(`/api/superadmin/organisations/${organisationId}/admins`, body, {
    timeout: ORG_PROVISION_TIMEOUT_MS,
  });

export const updateOrganisation = (id, body) =>
  api.patch(`/api/superadmin/organisations/${id}`, body);

export const deleteOrganisation = (id) =>
  api.delete(`/api/superadmin/organisations/${id}`);

export const suspendOrganisation = (id) =>
  api.post(`/api/superadmin/organisations/${id}/suspend`);

export const activateOrganisation = (id) =>
  api.post(`/api/superadmin/organisations/${id}/activate`);

export const impersonateOrganisation = (organisationId) =>
  api.post(`/api/superadmin/organisations/${organisationId}/impersonate`);
