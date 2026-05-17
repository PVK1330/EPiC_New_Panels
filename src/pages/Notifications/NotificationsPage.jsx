import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Bell, Filter, Search, CheckSquare, Trash2 } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationList from '../../components/Notifications/NotificationList';

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAllNotificationsAsRead,
    clearNotificationError
  } = useNotifications({ autoFetch: true });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Search filter
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Type filter
    if (filterType !== 'all' && notification.type !== filterType) {
      return false;
    }

    // Priority filter
    if (filterPriority !== 'all' && notification.priority !== filterPriority) {
      return false;
    }

    // Unread filter
    if (showUnreadOnly && notification.isRead) {
      return false;
    }

    return true;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterPriority('all');
    setShowUnreadOnly(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="message_received">Messages</option>
                <option value="case_assigned">Case Assigned</option>
                <option value="case_updated">Case Updated</option>
                <option value="deadline_reminder">Deadline Reminder</option>
                <option value="system_announcement">System Announcement</option>
                <option value="escalation_created">Escalation</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                    showUnreadOnly
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showUnreadOnly ? 'Unread Only' : 'All'}
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Clear filters"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="mt-3 text-sm text-gray-600">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={clearNotificationError}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterType !== 'all' || filterPriority !== 'all' || showUnreadOnly
                  ? 'No matching notifications'
                  : 'No notifications'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all' || filterPriority !== 'all' || showUnreadOnly
                  ? 'Try adjusting your filters or search terms'
                  : 'You\'re all caught up! No new notifications.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                  {/* Notification item content would go here */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.sentAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
