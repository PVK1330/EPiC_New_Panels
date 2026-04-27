import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, FileText, AlertTriangle, CheckCircle, Clock, User, Trash2 } from 'lucide-react';
import { markAsRead, removeNotification } from '../../store/slices/notificationSlice';

const formatTimeAgo = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

const NotificationItem = ({ notification }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'message_received':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'case_assigned':
      case 'case_updated':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'deadline_reminder':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'system_announcement':
        return <Bell className="w-5 h-5 text-purple-500" />;
      case 'escalation_created':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'permission_granted':
      case 'role_assigned':
        return <User className="w-5 h-5 text-indigo-500" />;
      case 'task_completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-gray-300 bg-gray-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }
  };

  const handleDelete = () => {
    dispatch(removeNotification(notification.id));
  };

  const handleClick = () => {
    handleMarkAsRead();
    // Handle navigation based on entity type
    if (notification.entityType === 'message' && notification.metadata?.conversationId) {
      // Navigate to conversation
      navigate(`/messages/${notification.metadata.conversationId}`);
    } else if (notification.entityType === 'case' && notification.entityId) {
      // Navigate to case
      navigate(`/cases/${notification.entityId}`);
    }
  };

  return (
    <div
      className={`
        relative border-l-4 p-4 mb-2 cursor-pointer transition-all duration-200
        ${getPriorityColor(notification.priority)}
        ${!notification.isRead ? 'shadow-sm' : 'opacity-75'}
      `}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {notification.title}
          </h4>

          {/* Message */}
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>

          {/* Metadata */}
          {notification.metadata && (
            <div className="mt-2 text-xs text-gray-500">
              {notification.metadata.senderName && (
                <span>From: {notification.metadata.senderName}</span>
              )}
              {notification.metadata.messageType && (
                <span className="ml-2">Type: {notification.metadata.messageType}</span>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className="mt-2 text-xs text-gray-400">
            {formatTimeAgo(notification.sentAt)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2">
          {!notification.isRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsRead();
              }}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="Mark as read"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
            title="Delete notification"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
