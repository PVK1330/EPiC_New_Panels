import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, CheckSquare, RefreshCw, Loader2 } from 'lucide-react';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllAsRead,
  clearError
} from '../../store/slices/notificationSlice';
import NotificationItem from './NotificationItem';

const NotificationList = ({ showUnreadOnly = false }) => {
  const dispatch = useDispatch();
  const {
    notifications,
    unreadCount,
    pagination,
    loading,
    error,
    unreadCountLoading
  } = useSelector((state) => state.notifications);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    limit: 20,
    unread_only: showUnreadOnly
  });

  useEffect(() => {
    dispatch(fetchNotifications({ ...filters, page }));
    dispatch(fetchUnreadCount());
  }, [dispatch, page, filters]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, unread_only: showUnreadOnly }));
    setPage(1);
  }, [showUnreadOnly]);

  const handleRefresh = () => {
    dispatch(fetchNotifications({ ...filters, page }));
    dispatch(fetchUnreadCount());
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleLoadMore = () => {
    if (page < pagination.pages) {
      setPage(prev => prev + 1);
    }
  };

  const safeNotifications = notifications || [];

  const filteredNotifications = showUnreadOnly
    ? safeNotifications.filter(n => !n.isRead)
    : safeNotifications;

  if (loading && safeNotifications.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh notifications"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
            
            {/* Load More */}
            {pagination.page < pagination.pages && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {pagination.total > 0 && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <p className="text-xs text-gray-500">
            Showing {safeNotifications.length} of {pagination.total} notifications
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
