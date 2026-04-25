import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  removeNotification,
  addNotification,
  clearError
} from '../store/slices/notificationSlice';

export const useNotifications = (options = {}) => {
  const dispatch = useDispatch();
  const {
    notifications,
    unreadCount,
    pagination,
    loading,
    error,
    unreadCountLoading,
    unreadCountError
  } = useSelector((state) => state.notifications);

  const {
    autoFetch = true,
    autoFetchUnreadCount = true,
    pollingInterval = 30000, // 30 seconds
    filters = {}
  } = options;

  // Fetch notifications
  const loadNotifications = (params = {}) => {
    dispatch(fetchNotifications({ ...filters, ...params }));
  };

  // Fetch unread count
  const loadUnreadCount = () => {
    dispatch(fetchUnreadCount());
  };

  // Mark notification as read
  const markNotificationAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    dispatch(markAllAsRead());
  };

  // Delete notification
  const deleteNotification = (id) => {
    dispatch(removeNotification(id));
  };

  // Add new notification (for real-time updates)
  const addNewNotification = (notification) => {
    dispatch(addNotification(notification));
  };

  // Clear errors
  const clearNotificationError = () => {
    dispatch(clearError());
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.isRead);
  };

  // Get notifications by type
  const getNotificationsByType = (type) => {
    return notifications.filter(n => n.type === type);
  };

  // Get notifications by priority
  const getNotificationsByPriority = (priority) => {
    return notifications.filter(n => n.priority === priority);
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      loadNotifications();
    }
  }, [autoFetch]);

  // Auto-fetch unread count on mount
  useEffect(() => {
    if (autoFetchUnreadCount) {
      loadUnreadCount();
    }
  }, [autoFetchUnreadCount]);

  // Set up polling for unread count
  useEffect(() => {
    if (pollingInterval > 0) {
      const interval = setInterval(() => {
        loadUnreadCount();
      }, pollingInterval);

      return () => clearInterval(interval);
    }
  }, [pollingInterval]);

  return {
    // Data
    notifications,
    unreadCount,
    pagination,
    loading,
    error,
    unreadCountLoading,
    unreadCountError,

    // Actions
    loadNotifications,
    loadUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    addNewNotification,
    clearNotificationError,

    // Helpers
    getUnreadNotifications,
    getNotificationsByType,
    getNotificationsByPriority
  };
};

export default useNotifications;
