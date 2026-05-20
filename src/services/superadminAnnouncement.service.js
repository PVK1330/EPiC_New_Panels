import api from "./api";

export const sendSuperadminAnnouncement = (data) =>
  api.post("/api/superadmin/announcements", data);
