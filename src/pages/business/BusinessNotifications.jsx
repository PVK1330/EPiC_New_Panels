import { Bell, AlertCircle, CheckCircle2, Info, Trash2, Filter } from "lucide-react";
import { useState } from "react";

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

  const getNotificationIcon = (type) => {
    switch (type) {
      case "alert":
        return <AlertCircle size={20} className="text-red-600" />;
      case "success":
        return <CheckCircle2 size={20} className="text-green-600" />;
      case "info":
        return <Info size={20} className="text-blue-600" />;
      default:
        return <Bell size={20} className="text-slate-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "alert":
        return "border-red-300 bg-red-50 hover:bg-red-100";
      case "success":
        return "border-green-300 bg-green-50 hover:bg-green-100";
      case "info":
        return "border-blue-300 bg-blue-50 hover:bg-blue-100";
      default:
        return "border-slate-300 bg-slate-50 hover:bg-slate-100";
    }
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const filteredNotifications = notifications.filter((notif) =>
    filterType === "all" || notif.type === filterType || (filterType === "unread" && !notif.read)
  );

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-600 mt-2">Stay updated with important alerts and messages</p>
        </div>
        {unreadCount > 0 && (
          <div className="bg-red-100 border border-red-300 rounded-lg px-4 py-2">
            <p className="text-red-700 font-semibold">{unreadCount} Unread</p>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Filter size={18} className="text-slate-400 mt-1" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        >
          <option value="all">All Notifications</option>
          <option value="unread">Unread</option>
          <option value="alert">Alerts</option>
          <option value="success">Success</option>
          <option value="info">Info</option>
        </select>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`border rounded-lg p-4 flex items-start gap-4 transition-colors cursor-pointer ${getNotificationColor(notif.type)} ${
                !notif.read ? "border-l-4" : ""
              }`}
              onClick={() => handleMarkAsRead(notif.id)}
            >
              <div className="mt-1">{getNotificationIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-slate-900 font-semibold">{notif.title}</h3>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
                <p className="text-slate-600 text-sm mt-1">{notif.message}</p>
                <p className="text-slate-500 text-xs mt-2">{notif.timestamp}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notif.id);
                }}
                className="p-2 hover:bg-slate-300/50 rounded transition-colors text-slate-600 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm">
            <Bell size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600">No notifications at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessNotifications;
