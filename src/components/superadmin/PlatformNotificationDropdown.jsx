import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  RiNotification3Line,
  RiNotification3Fill,
  RiCloseLine,
  RiCheckDoubleLine,
  RiArrowRightSLine,
} from "react-icons/ri";
import {
  fetchPlatformNotifications,
  fetchPlatformUnreadCount,
  markPlatformNotificationRead,
  markAllPlatformNotificationsRead,
} from "../../services/superadminNotification.service";
import { formatDateLong } from "../../utils/datetime";

const TYPE_DOT = {
  success: "bg-green-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  info: "bg-blue-500",
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDateLong(dateStr, { month: "short" });
}

const PlatformNotificationDropdown = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await fetchPlatformUnreadCount();
      setUnreadCount(res.data?.data?.unreadCount ?? res.data?.unreadCount ?? 0);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPlatformNotifications({ limit: 15 });
      const list = res.data?.data?.notifications ?? res.data?.notifications ?? [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadNotifications();
  }, [isOpen, loadNotifications]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markPlatformNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* silent */
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllPlatformNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      /* silent */
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="p-2 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-all relative"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <RiNotification3Fill size={20} />
        ) : (
          <RiNotification3Line size={20} />
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed sm:absolute top-16 sm:top-auto left-4 right-4 sm:left-auto sm:right-0 mt-2 sm:w-96 w-auto bg-white rounded-xl border border-gray-100 shadow-xl z-50 origin-top-right overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-secondary">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-white bg-primary rounded-full px-1.5 py-0.5 leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="p-1.5 text-gray-400 hover:text-primary rounded transition-colors"
                    title="Mark all as read"
                  >
                    <RiCheckDoubleLine size={16} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  <RiCloseLine size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <RiNotification3Line size={32} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) handleMarkRead(n.id);
                    }}
                    className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                      !n.isRead ? "bg-primary/[0.02]" : ""
                    }`}
                  >
                    <div className="shrink-0 mt-1.5">
                      <div className={`w-2 h-2 rounded-full ${!n.isRead ? (TYPE_DOT[n.type] || TYPE_DOT.info) : "bg-gray-200"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-tight ${!n.isRead ? "font-semibold text-secondary" : "font-medium text-gray-500"}`}>
                        {n.title}
                      </p>
                      {n.desc && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{n.desc}</p>
                      )}
                      <span className="text-[10px] font-medium text-gray-300 mt-1 block">
                        {timeAgo(n.created_at || n.createdAt)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/superadmin/notifications");
                }}
                className="w-full text-center text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1"
              >
                View all notifications <RiArrowRightSLine size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlatformNotificationDropdown;
