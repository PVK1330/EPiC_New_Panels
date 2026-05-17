import api from "./api";

// User notification routes
export const getNotifications = (params = {}) =>
  api.get(`/api/notifications`, { params });

export const getUnreadNotificationCount = () =>
  api.get(`/api/notifications/unread-count`);

export const getNotificationStats = () =>
  api.get(`/api/notifications/stats`);

export const markNotificationAsRead = (id) =>
  api.patch(`/api/notifications/${id}/mark-read`);

export const markAllNotificationsAsRead = () =>
  api.patch(`/api/notifications/mark-all-read`);

export const deleteNotification = (id) =>
  api.delete(`/api/notifications/${id}`);

// Admin notification routes
export const getAllNotifications = (params = {}) =>
  api.get(`/api/notifications/admin/all`, { params });

export const createManualNotification = (data) =>
  api.post(`/api/notifications/admin/create`, data);

export const getAdminNotificationStats = () =>
  api.get(`/api/notifications/admin/stats`);

export const processScheduledNotifications = () =>
  api.post(`/api/notifications/admin/process-scheduled`);

export const deleteExpiredNotifications = () =>
  api.delete(`/api/notifications/admin/delete-expired`);
