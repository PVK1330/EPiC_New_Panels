import { useState } from "react";
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
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Notifications
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Stay updated with important alerts and messages.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <Bell size={20} className="text-primary" />
            <span className="font-black">Total Notifications</span>
          </div>
          <p className="text-3xl font-black text-secondary">{notifications.length}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <AlertCircle size={20} className="text-amber-500" />
            <span className="font-black">Unread</span>
          </div>
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-700">
            {unreadCount}
          </span>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span className="font-black">Read</span>
          </div>
          <p className="text-3xl font-black text-secondary">{notifications.length - unreadCount}</p>
        </motion.div>
      </motion.div>

      {/* Filter */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
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
              className={`border rounded-xl p-4 flex items-start gap-4 transition-colors cursor-pointer ${getNotificationColor(notif.type)} ${
                !notif.read ? "border-l-4 border-l-primary" : ""
              }`}
              onClick={() => handleMarkAsRead(notif.id)}
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
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))
        ) : (
          <motion.div
            variants={cardVariants}
            className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm"
          >
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm font-bold text-gray-600">No notifications at the moment</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default BusinessNotifications;
