import api from "./api";

export const sendAdminAnnouncement = (data) =>
  api.post("/api/admin/announcements", data);

export const listAdminAnnouncements = (params = {}) =>
  api.get("/api/admin/announcements", { params });

export const updateAdminAnnouncement = (id, data) =>
  api.put(`/api/admin/announcements/${id}`, data);

export const deleteAdminAnnouncement = (id) =>
  api.delete(`/api/admin/announcements/${id}`);

export const exportAdminAnnouncements = () =>
  api.get("/api/admin/announcements/export", { responseType: "blob" });
