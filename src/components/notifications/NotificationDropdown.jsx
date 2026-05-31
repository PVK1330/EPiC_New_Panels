import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Bell, BellRing, X, ChevronDown } from 'lucide-react';
import { fetchUnreadCount, fetchNotifications } from '../../store/slices/notificationSlice';
import NotificationList from './NotificationList';
import { getMessagingSocketUrl } from '../../utils/socketOrigin';
import { getNotificationRoute } from '../../utils/notificationHelpers';

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount, unreadCountLoading } = useSelector((state) => state.notifications);
  const { user, token } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    
    // Set up polling for unread count every 30 seconds (fallback)
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Real-time socket listener for instant message notifications
  useEffect(() => {
    if (!user?.id || !token) return;

    const url = getMessagingSocketUrl();
    const socket = io(url, {
      auth: { token },
      // Auth lives in an HttpOnly cookie; withCredentials sends it on the handshake.
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    // Server pushes `notification:new` for every notification type (messages,
    // case updates, tasks, etc). Refresh the badge and first page on arrival.
    const refresh = () => {
      dispatch(fetchUnreadCount());
      dispatch(fetchNotifications({ limit: 20, unread_only: false, page: 1 }));
    };
    socket.on('notification:new', refresh);
    socket.on('notification:count', () => dispatch(fetchUnreadCount()));

    // Fallback: a brand-new message also implies a notification for the receiver.
    socket.on('message:new', (payload) => {
      const m = payload?.message;
      if (!m) return;
      if (Number(user.id) === Number(m.receiverId)) refresh();
    });

    return () => {
      // Small delay to ensure any pending connection attempts are handled
      // before we forcefully disconnect during rapid remounts.
      setTimeout(() => {
        if (socket.connected || socket.connecting) {
          socket.disconnect();
        }
      }, 50);
    };
  }, [user?.id, token, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking inside a notification modal portal
      if (event.target.closest('[data-notification-modal]')) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[1.25rem] h-5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {unreadCountLoading && (
          <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[32rem] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[28rem] overflow-y-auto">
            <NotificationList showUnreadOnly={false} />
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(getNotificationRoute({}, user));
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
