import api from "./api";

export const fetchOrganisations = () => api.get("/api/superadmin/organisations");

export const createOrganisation = (body) => api.post("/api/superadmin/organisations", body);

export const updateOrganisation = (id, body) =>
  api.patch(`/api/superadmin/organisations/${id}`, body);

export const createOrganisationAdmin = (organisationId, body) =>
  api.post(`/api/superadmin/organisations/${organisationId}/admins`, body);
