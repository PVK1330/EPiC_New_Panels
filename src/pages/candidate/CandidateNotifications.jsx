import { useMemo, useState } from "react";
import NotificationsPanel from "../../components/notifications/NotificationsPanel";

const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    icon: "📤",
    type: "info",
    title: "Document request — Certificate of Sponsorship",
    body: "Your caseworker has requested your Certificate of Sponsorship from your employer.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "n2",
    icon: "❌",
    type: "alert",
    title: "Document rejected — Bank statement (February)",
    body: "Your bank statement was rejected. Please re-upload with a balance of £1,270+ for 28 days.",
    time: "11 Apr, 10:32am",
    unread: true,
  },
  {
    id: "n3",
    icon: "💰",
    type: "warning",
    title: "Payment reminder — £800 balance due",
    body: "Your remaining balance of £800 is due by 30 Apr 2026.",
    time: "10 Apr, 9:00am",
    unread: true,
  },
  {
    id: "n4",
    icon: "📅",
    type: "warning",
    title: "Deadline alert — Passport upload",
    body: "Your passport upload is due on 18 Apr. Don't miss this deadline.",
    time: "10 Apr, 8:00am",
    unread: true,
  },
  {
    id: "n5",
    icon: "✅",
    type: "success",
    title: "Document approved — Employment contract",
    body: "Your employment contract has been reviewed and approved.",
    time: "9 Apr, 4:00pm",
    unread: false,
  },
  {
    id: "n6",
    icon: "🚀",
    type: "success",
    title: "Case created — VT-2024-0841",
    body: "Your visa application case has been created. Welcome!",
    time: "5 Apr, 9:00am",
    unread: false,
  },
];

export default function CandidateNotifications() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => n.unread);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const markRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
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

