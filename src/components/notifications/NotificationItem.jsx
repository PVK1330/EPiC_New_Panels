import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, FileText, AlertTriangle, CheckCircle, Clock, User, Trash2, X, ArrowRight } from 'lucide-react';
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
  const [showModal, setShowModal] = useState(false);

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
    setShowModal(true);
  };

  const handleNavigate = () => {
    setShowModal(false);
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

  const hasRoute = getNotificationRoute(notification, user) || getCaseworkerOpenCaseState(notification);

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

      {showModal && createPortal(
        <div data-notification-modal className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
          <div
            className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-sm font-black text-gray-900">Notification Details</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto cursor-default">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">{notification.title}</h4>
                {notification.priority && (
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                    notification.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    notification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    notification.priority === 'low' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {notification.priority} Priority
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-6 whitespace-pre-wrap leading-relaxed">{notification.message}</p>
              
              {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Metadata</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                    {Object.entries(notification.metadata).map(([key, value]) => {
                      if (['senderId', 'conversationId', 'entityId', 'applicationId', 'taskId'].includes(key)) return null;
                      return (
                        <div key={key}>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 mt-0.5 break-words">
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Received: {new Date(notification.createdAt || notification.sentAt).toLocaleString()}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 cursor-default">
              <button
                type="button"
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(false);
                }}
              >
                Close
              </button>
              {hasRoute && (
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate();
                  }}
                >
                  View Details
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotificationItem;
