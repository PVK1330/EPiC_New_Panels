import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, CheckSquare, RefreshCw, Loader2, X } from 'lucide-react';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllAsRead,
  clearError
} from '../../store/slices/notificationSlice';
import NotificationItem from './NotificationItem';
import Pagination from '../common/Pagination';

const NotificationList = ({ showUnreadOnly = false, onClose = null }) => {
  // `onClose` is passed when rendered inside the bell dropdown. In that mode the
  // dropdown supplies the panel chrome (rounded card, shadow, border), so the
  // list renders flat to avoid a double-framed look; on the full page it keeps
  // its own card wrapper.
  const isDropdown = typeof onClose === 'function';
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
  const [viewMode, setViewMode] = useState(showUnreadOnly ? 'unread' : 'all');
  const limit = 20;

  // The "unread" tab is filtered server-side so paging + totals are accurate for
  // that view. ("read" has no dedicated server filter, so it stays a client-side
  // filter over the current page — see filteredNotifications below.)
  const unreadOnly = viewMode === 'unread';

  useEffect(() => {
    dispatch(fetchNotifications({ limit, page, unreadOnly: unreadOnly ? 'true' : 'false' }));
    dispatch(fetchUnreadCount());
  }, [dispatch, page, unreadOnly]);

  useEffect(() => {
    setViewMode(showUnreadOnly ? 'unread' : 'all');
    setPage(1);
  }, [showUnreadOnly]);

  // Changing tab restarts paging from the first page of that filtered set.
  const changeViewMode = (mode) => {
    setViewMode(mode);
    setPage(1);
  };

  const handleRefresh = () => {
    dispatch(fetchNotifications({ limit, page, unreadOnly: unreadOnly ? 'true' : 'false' }));
    dispatch(fetchUnreadCount());
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const safePagination = pagination || { total: 0, page: 1, limit: 20, pages: 0 };

  // Dropdown keeps the lightweight "Load More" (cramped space); the full page
  // gets a numbered pager.
  const handleLoadMore = () => {
    if (page < safePagination.pages) {
      setPage(prev => prev + 1);
    }
  };

  const safeNotifications = notifications || [];

  const filteredNotifications = safeNotifications.filter(n => {
    if (viewMode === 'unread') return !n.isRead;
    if (viewMode === 'read') return n.isRead;
    return true;
  });

  if (loading && safeNotifications.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className={isDropdown ? 'flex flex-col min-h-0 max-h-[32rem]' : 'bg-white rounded-lg shadow-sm border border-gray-200'}>
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <Bell className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 truncate">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full flex-shrink-0">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200/60 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-1 px-2.5 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                title="Mark all as read"
              >
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}

            {isDropdown && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50/50">
        <button
          onClick={() => changeViewMode('all')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${viewMode === 'all' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-800'}`}
        >
          All
        </button>
        <button
          onClick={() => changeViewMode('unread')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${viewMode === 'unread' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Unread
        </button>
        <button
          onClick={() => changeViewMode('read')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${viewMode === 'read' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Read
        </button>
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
      <div className={isDropdown ? 'flex-1 min-h-0 overflow-y-auto' : 'max-h-96 overflow-y-auto'}>
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {viewMode === 'unread' ? 'No unread notifications' : viewMode === 'read' ? 'No read notifications' : 'No notifications'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
            
            {/* Dropdown keeps the lightweight "Load More"; the full page uses the
                numbered pager in the footer below. */}
            {isDropdown && safePagination.page < safePagination.pages && (
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

      {/* Footer — hidden in dropdown mode where the dropdown owns the footer
          ("View all notifications"), so we don't stack two footers. The full
          page shows a numbered pager (auto-hidden when there's a single page). */}
      {!isDropdown && safePagination.pages > 1 && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <Pagination
            page={safePagination.page}
            totalPages={safePagination.pages}
            total={safePagination.total}
            limit={safePagination.limit}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationList;
