import api from "./api";

export const sendAdminAnnouncement = (data) =>
  api.post("/api/admin/announcements", data);
