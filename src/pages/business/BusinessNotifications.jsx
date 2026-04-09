import { useMemo, useState } from "react";
import NotificationsPanel from "../../components/notifications/NotificationsPanel";

const BusinessNotifications = () => {
  const [filterType, setFilterType] = useState("all");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "alert",
      title: "Worker Visa Expiring Soon",
      message: "Ahmed Khan's skilled worker visa will expire on 15 Mar 2025",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "success",
      title: "COS Payment Processed",
      message: "Your Certificate of Sponsorship payment of £3,500 has been processed successfully",
      timestamp: "5 hours ago",
      read: true,
    },
    {
      id: 3,
      type: "info",
      title: "Compliance Audit Scheduled",
      message: "Your quarterly compliance audit is scheduled for 15 Jan 2024 at 10:00 AM",
      timestamp: "1 day ago",
      read: true,
    },
    {
      id: 4,
      type: "alert",
      title: "License Expiry Notice",
      message: "Your sponsor license will expire in 84 days. Please prepare renewal documents",
      timestamp: "3 days ago",
      read: true,
    },
    {
      id: 5,
      type: "info",
      title: "New Worker Added",
      message: "Ananya Patel has been successfully added to your payroll system",
      timestamp: "1 week ago",
      read: true,
    },
    {
      id: 6,
      type: "success",
      title: "Document Verified",
      message: "Financial statements for Q4 2023 have been verified by compliance team",
      timestamp: "2 weeks ago",
      read: true,
    },
  ]);

  const handleDelete = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const handleMarkAsRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const filteredNotifications = useMemo(
    () =>
      notifications.filter(
        (n) => filterType === "all" || n.type === filterType || (filterType === "unread" && !n.read),
      ),
    [notifications, filterType],
  );

  return (
    <NotificationsPanel
      title="Notifications"
      subtitle="Stay updated with important alerts and messages"
      notifications={filteredNotifications}
      filter={filterType}
      onFilterChange={setFilterType}
      onMarkRead={handleMarkAsRead}
      onDelete={handleDelete}
      showDelete
    />
  );
};

export default BusinessNotifications;
