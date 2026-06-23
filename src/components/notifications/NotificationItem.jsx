import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, FileText, AlertTriangle, CheckCircle, Clock, User, Trash2, X } from 'lucide-react';
import { markAsRead, removeNotification } from '../../store/slices/notificationSlice';
import { resolveNotificationTarget } from '../../utils/notificationHelpers';
import { formatDate, formatDateTime } from '../../utils/datetime';

// The list row prefers `createdAt` (always populated) over `sentAt` (nullable in
// the model) so a missing `sentAt` no longer collapses to `new Date(null)` → the
// Unix epoch (the "01/01/1970" bug).
const getNotificationTimestamp = (notification) =>
  notification?.createdAt ||
  notification?.created_at ||
  notification?.sentAt ||
  notification?.sent_at ||
  null;

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 0) return formatDate(date); // future-dated → show the date, not "in -3 mins"
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return formatDate(date);
};

// Internal plumbing keys that should never be shown to the user as metadata.
const HIDDEN_METADATA_KEYS = new Set([
  'senderId', 'conversationId', 'entityId', 'applicationId', 'taskId',
  'id', 'userId', 'recipientId', 'organisationId', 'orgId', 'priority',
  'sendEmail', 'scheduledFor', 'nextStage',
]);

// "case_status_changed" / "caseStatusChanged" → "Case status changed".
const prettifyLabel = (key) =>
  String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

// "Case_status_changed" → "Case status changed" for snake_case enum values,
// while leaving human values (names, "CAS-000004", "Approved") untouched.
const prettifyValue = (value) => {
  if (Array.isArray(value)) return value.map(prettifyValue).join(', ');
  const str = String(value ?? '').trim();
  if (!str) return '';
  // Only de-snake values that are clearly machine enums (no spaces, has _).
  if (/^[a-z0-9]+(_[a-z0-9]+)+$/i.test(str)) {
    return str.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
  }
  return str;
};

// Turn raw metadata into clean, display-ready [label, value] pairs.
const getDisplayMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object') return [];
  return Object.entries(metadata)
    .filter(([key, value]) => {
      if (HIDDEN_METADATA_KEYS.has(key)) return false;
      if (value === null || value === undefined || value === '') return false;
      if (typeof value === 'object' && !Array.isArray(value)) return false;
      return true;
    })
    .map(([key, value]) => [prettifyLabel(key), prettifyValue(value)])
    .filter(([, value]) => value !== '');
};

// `onClose` is supplied when the row is rendered inside the bell dropdown, so a
// click can close the dropdown after navigating. It is undefined on the
// full-page notification views, where there is no dropdown to close.
const NotificationItem = ({ notification, onClose = null }) => {
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

  // Clicking a notification takes the user straight to the page it refers to
  // (the case, document, licence, payment, message...). The details modal is
  // only a fallback for notifications that have no specific destination.
  const handleClick = () => {
    handleMarkAsRead();
    const target = resolveNotificationTarget(notification, user);
    if (target?.path) {
      onClose?.(); // close the bell dropdown before navigating
      navigate(target.path, target.state ? { state: target.state } : undefined);
      return;
    }
    setShowModal(true);
  };

  const timestamp = getNotificationTimestamp(notification);
  const timeAgo = formatTimeAgo(timestamp);
  const listMetadata = getDisplayMetadata(notification.metadata);

  return (
    <div
      className={`
        relative border border-gray-200 border-l-4 rounded-lg p-3 cursor-pointer transition-all duration-200
        hover:shadow-sm hover:border-gray-300
        ${getPriorityColor(notification.priority)}
        ${notification.isRead ? 'opacity-80' : ''}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(notification.actionType || notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            {!notification.isRead && (
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" title="Unread" />
            )}
            <span className="truncate">{notification.title}</span>
          </h4>

          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>

          {listMetadata.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {listMetadata.slice(0, 4).map(([label, value]) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md max-w-full"
                >
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium truncate">{value}</span>
                </span>
              ))}
            </div>
          )}

          {timeAgo && (
            <div className="mt-2 text-xs text-gray-400">
              {timeAgo}
            </div>
          )}
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
              
              {listMetadata.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Details</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                    {listMetadata.map(([label, value]) => (
                      <div key={label}>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {label}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mt-0.5 break-words">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {timestamp && (
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Received: {formatDateTime(timestamp)}
                </div>
              )}
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
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotificationItem;
