import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Bell,
  AlertCircle,
  CheckCircle2,
  Info,
  Trash2,
  Filter,
  LayoutDashboard,
} from "lucide-react";
import {
  getNotifications,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../services/notificationApi";
import { formatDateLong } from "../../utils/datetime";
import { resolveNotificationTarget } from "../../utils/notificationHelpers";
import Pagination from "../../components/common/Pagination";

const PAGE_SIZE = 10;

const BusinessNotifications = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [filterType, setFilterType] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_SIZE, pages: 0 });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await getNotifications({ page, limit: PAGE_SIZE });
      if (res.data?.status === "success") {
        const data = res.data.data || {};
        const mappedNotifications = (data.notifications || []).map(n => ({
          id: n.id,
          type: n.type === 'error' ? 'alert' : n.type === 'warning' ? 'info' : n.type,
          title: n.title,
          message: n.message,
          timestamp: formatTime(n.createdAt),
          read: n.isRead,
          // Routing fields — required by resolveNotificationTarget
          entityType: n.entityType,
          entityId: n.entityId,
          actionType: n.actionType,
          category: n.category,
          metadata: n.metadata,
          actionUrl: n.actionUrl,
        }));
        setNotifications(mappedNotifications);

        // Normalize the two response shapes: flat { total, page, totalPages }
        // or nested { pagination } — same handling as AdminNotifications.
        const p = data.pagination || {};
        const total = p.total ?? data.total ?? 0;
        const limit = p.limit ?? PAGE_SIZE;
        const pages = p.pages ?? data.totalPages ?? (limit ? Math.ceil(total / limit) : 0);
        setPagination({ total, page: p.page ?? data.page ?? page, limit, pages });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getNotificationStats();
      if (res.data?.status === "success") {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDateLong(date, { month: 'short' });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "alert":
        return <AlertCircle size={20} className="text-red-600" />;
      case "success":
        return <CheckCircle2 size={20} className="text-emerald-600" />;
      case "info":
        return <Info size={20} className="text-primary" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "alert":
        return "border-red-200 bg-red-50 hover:bg-red-100";
      case "success":
        return "border-emerald-200 bg-emerald-50 hover:bg-emerald-100";
      case "info":
        return "border-primary/20 bg-primary/10 hover:bg-primary/20";
      default:
        return "border-gray-200 bg-gray-50 hover:bg-gray-100";
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter((notif) => notif.id !== id));
      fetchStats();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      fetchStats();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) await handleMarkAsRead(notif.id);
    const target = resolveNotificationTarget(notif, user);
    if (target?.path) {
      navigate(target.path, target.state ? { state: target.state } : undefined);
    }
  };

  const filteredNotifications = notifications.filter((notif) =>
    filterType === "all" || notif.type === filterType || (filterType === "unread" && !notif.read)
  );

  const unreadCount = stats.unread;

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
          <LayoutDashboard className="text-primary" size={26} />
          Notifications
        </h1>
        <p className="text-primary font-bold text-sm mt-0.5">
          Stay updated with important alerts and messages.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="flex items-center gap-2.5 mb-3 text-gray-900">
            <Bell size={20} className="text-primary" />
            <span className="text-sm font-black">Total Notifications</span>
          </div>
          <p className="text-3xl font-black text-secondary">{stats.total}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="flex items-center gap-2.5 mb-3 text-gray-900">
            <AlertCircle size={20} className="text-amber-500" />
            <span className="text-sm font-black">Unread</span>
          </div>
          <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
            {stats.unread}
          </span>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="flex items-center gap-2.5 mb-3 text-gray-900">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span className="text-sm font-black">Read</span>
          </div>
          <p className="text-3xl font-black text-secondary">{stats.read}</p>
        </motion.div>
      </motion.div>

      {/* Filter */}
      <motion.div
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm overflow-hidden relative"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="alert">Alerts</option>
            <option value="success">Success</option>
            <option value="info">Info</option>
          </select>
        </div>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        className="space-y-3"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <motion.div
              key={notif.id}
              variants={cardVariants}
              className={`border rounded-xl px-3 py-2.5 flex items-start gap-3 transition-colors cursor-pointer ${getNotificationColor(notif.type)} ${
                !notif.read ? "border-l-4 border-l-primary" : ""
              }`}
              onClick={() => handleNotifClick(notif)}
            >
              <div className="mt-1">{getNotificationIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-secondary">{notif.title}</h3>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </div>
                <p className="text-xs font-bold text-gray-600 mt-1">{notif.message}</p>
                <p className="text-[10px] font-bold text-gray-500 mt-2">{notif.timestamp}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notif.id);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))
        ) : (
          <motion.div
            variants={cardVariants}
            className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
            <Bell size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-600">No notifications at the moment</p>
          </motion.div>
        )}
      </motion.div>

      {pagination.pages > 1 && (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <Pagination
            page={pagination.page}
            totalPages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default BusinessNotifications;
