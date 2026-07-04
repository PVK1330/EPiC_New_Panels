import { useMemo, useState, useEffect } from "react";
import NotificationsPanel from "../../components/notifications/NotificationsPanel";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../services/notificationApi";
import { formatDateLong } from "../../utils/datetime";

const PAGE_SIZE = 10;

export default function CandidateNotifications() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_SIZE, pages: 0 });

  useEffect(() => {
    fetchNotifications();
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
          icon: getIconForType(n.type),
          type: n.type === 'error' ? 'alert' : n.type === 'warning' ? 'warning' : n.type,
          title: n.title,
          body: n.message,
          time: formatTime(n.createdAt),
          unread: !n.isRead,
          priority: n.priority,
          metadata: n.metadata,
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

  const getIconForType = (type) => {
    const map = {
      info: "📤",
      alert: "❌",
      error: "❌",
      warning: "�",
      success: "✅",
      case_assigned: "🚀",
      case_status: "📅",
      payment: "💰",
      system: "ℹ️",
    };
    return map[type] || "📢";
  };

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => n.unread);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const markRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  return (
    <NotificationsPanel
      title="Notifications"
      subtitle="System updates, deadlines, and document alerts."
      notifications={filtered}
      filter={filter}
      onFilterChange={setFilter}
      onMarkRead={markRead}
      pagination={pagination}
      onPageChange={setPage}
    />
  );
}

