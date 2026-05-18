import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, FileText, AlertTriangle, CheckCircle, Clock, User, Trash2 } from 'lucide-react';
import { markAsRead, removeNotification } from '../../store/slices/notificationSlice';
import { getNotificationRoute, getCaseworkerOpenCaseState } from '../../utils/notificationHelpers';

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
  const user = useSelector((state) => state.auth.user);

  const getIcon = (type) => {
    switch (type) {
      case 'message_received':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'case_assigned':
      case 'case_updated':
      case 'case_status_changed':
      case 'case_stage_change':
      case 'ccl_fee_review':
      case 'ccl_issued':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'task_assigned':
      case 'workflow_task':
        return <Clock className="w-5 h-5 text-indigo-500" />;
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
    const route = getNotificationRoute(notification, user);
    const roleId = Number(user?.role_id);
    const isCaseworker = user?.role === 'caseworker' || roleId === 2;

    if (isCaseworker) {
      const openState = getCaseworkerOpenCaseState(notification);
      if (openState) {
        navigate('/caseworker/cases', { state: openState });
        return;
      }
    }

    if (route) {
      navigate(route);
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
      {!notification.isRead && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon(notification.type || notification.actionType)}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {notification.title}
          </h4>

          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>

          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {Object.entries(notification.metadata).map(([key, value]) => {
                if (['senderId', 'conversationId', 'entityId', 'applicationId', 'taskId'].includes(key)) return null;
                return (
                  <span key={key} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium capitalize">
                    <span className="opacity-60">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {Array.isArray(value) ? value.join(', ') : String(value)}
                  </span>
                );
              })}
            </div>
          )}

          <div className="mt-2 text-xs text-gray-400">
            {formatTimeAgo(notification.sentAt)}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          {!notification.isRead && (
            <button
              type="button"
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
            type="button"
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
