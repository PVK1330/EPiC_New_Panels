import api from "./api";

export const sendSuperadminAnnouncement = (data) =>
  api.post("/api/superadmin/announcements", data);

export const listSuperadminAnnouncements = (params = {}) =>
  api.get("/api/superadmin/announcements", { params });

export const updateSuperadminAnnouncement = (id, data) =>
  api.put(`/api/superadmin/announcements/${id}`, data);

export const deleteSuperadminAnnouncement = (id) =>
  api.delete(`/api/superadmin/announcements/${id}`);

export const exportSuperadminAnnouncements = () =>
  api.get("/api/superadmin/announcements/export", { responseType: "blob" });
