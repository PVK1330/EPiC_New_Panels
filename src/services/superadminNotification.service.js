import api from "./api";

export const fetchPlatformNotifications = (params) =>
  api.get("/api/superadmin/notifications", { params });

export const markPlatformNotificationRead = (id) =>
  api.post(`/api/superadmin/notifications/${id}/read`);

export const markAllPlatformNotificationsRead = () =>
  api.post("/api/superadmin/notifications/mark-all-read");
