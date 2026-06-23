import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Bell, BellRing } from 'lucide-react';
import { fetchUnreadCount, addNotification, setUnreadCount } from '../../store/slices/notificationSlice';
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
  // Tracks live socket state so the backstop poll never competes with real-time.
  const socketConnectedRef = useRef(false);

  // Initial count on mount, and a resync whenever the tab regains focus (covers
  // anything missed while the tab was backgrounded). Real-time updates otherwise
  // arrive over the socket below.
  useEffect(() => {
    dispatch(fetchUnreadCount());
    const onVisible = () => {
      if (!document.hidden) dispatch(fetchUnreadCount());
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [dispatch]);

  // Backstop polling — only fires when the socket is NOT connected (e.g. the
  // production WebSocket upgrade is unavailable) and the tab is visible. When
  // real-time works this never runs, so the bell makes no periodic requests.
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && !socketConnectedRef.current) {
        dispatch(fetchUnreadCount());
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Real-time updates. The server pushes the new notification and the
  // authoritative unread count, so we update the store directly instead of
  // re-fetching over HTTP on every event.
  useEffect(() => {
    if (!user?.id || !token) return undefined;

    const url = getMessagingSocketUrl();
    const socket = io(url, {
      auth: { token },
      // Auth lives in an HttpOnly cookie; withCredentials sends it on the handshake.
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socketConnectedRef.current = true;
      // Catch up on anything missed while the socket was down.
      dispatch(fetchUnreadCount());
    });
    socket.on('disconnect', () => {
      socketConnectedRef.current = false;
    });

    // New notification → prepend to the list and bump the badge (deduped in the slice).
    socket.on('notification:new', (payload) => {
      if (payload && payload.id != null) dispatch(addNotification(payload));
    });
    // Authoritative unread count from the server — no HTTP round-trip.
    socket.on('notification:count', (payload) => {
      if (payload && typeof payload.count === 'number') {
        dispatch(setUnreadCount(payload.count));
      }
    });

    return () => {
      socketConnectedRef.current = false;
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
        <div className="absolute right-0 mt-2 w-[22rem] sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-xl border border-gray-200 z-50 flex flex-col overflow-hidden">
          {/* The list owns its own header (title, tabs, refresh, mark-all-read);
              the dropdown only provides the panel chrome, a close button, and
              the footer link so we don't render two stacked "Notifications"
              headers. */}
          <NotificationList showUnreadOnly={false} onClose={() => setIsOpen(false)} />

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(getNotificationRoute({}, user));
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-semibold"
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
