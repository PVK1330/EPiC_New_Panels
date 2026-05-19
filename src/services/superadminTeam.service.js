import api from "./api";

export const fetchPlatformModules = () => api.get("/api/superadmin/team/modules");

export const fetchTeamMembers = () => api.get("/api/superadmin/team");

export const inviteTeamMember = (body) => api.post("/api/superadmin/team", body);

export const updateTeamMember = (id, body) => api.patch(`/api/superadmin/team/${id}`, body);

export const fetchPlatformRoles = () => api.get("/api/superadmin/platform-roles");

export const createPlatformRole = (body) => api.post("/api/superadmin/platform-roles", body);

export const updatePlatformRole = (id, body) =>
  api.patch(`/api/superadmin/platform-roles/${id}`, body);

export const deletePlatformRole = (id) => api.delete(`/api/superadmin/platform-roles/${id}`);
