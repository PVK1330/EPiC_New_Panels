import api from "./api";

export const fetchPlatformNotifications = (params) =>
  api.get("/api/superadmin/notifications", { params });

export const fetchPlatformUnreadCount = () =>
  api.get("/api/superadmin/notifications/unread-count");

export const markPlatformNotificationRead = (id) =>
  api.post(`/api/superadmin/notifications/${id}/read`);

export const markAllPlatformNotificationsRead = () =>
  api.post("/api/superadmin/notifications/mark-all-read");

export const getNotificationPreferences = () =>
  api.get("/api/superadmin/notification-preferences");

export const updateNotificationPreferences = (preferences) =>
  api.put("/api/superadmin/notification-preferences", preferences);
