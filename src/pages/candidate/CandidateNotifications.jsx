import { useMemo, useState, useEffect } from "react";
import NotificationsPanel from "../../components/notifications/NotificationsPanel";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../services/notificationApi";

export default function CandidateNotifications() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await getNotifications();
      if (res.data?.status === "success") {
        const mappedNotifications = (res.data.data.notifications || []).map(n => ({
          id: n.id,
          icon: getIconForType(n.type),
          type: n.type === 'error' ? 'alert' : n.type === 'warning' ? 'warning' : n.type,
          title: n.title,
          body: n.message,
          time: formatTime(n.createdAt),
          unread: !n.isRead,
        }));
        setNotifications(mappedNotifications);
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
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
    />
  );
}

