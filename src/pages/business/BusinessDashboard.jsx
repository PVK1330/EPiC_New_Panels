import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Inbox,
  CheckCircle,
  Clock,
  Users,
  Bell,
  AlertTriangle,
  Briefcase,
  ShieldCheck,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { getBusinessDashboard, getBusinessCases } from "../../services/businessProfileApi";
import LicenceStatusBadge from "../../components/business/LicenceStatusBadge";
import LicenceGateBanner from "../../components/business/LicenceGateBanner";
import { getSponsoredWorkers } from "../../services/sponsoredWorkerApi";
import { getNotifications } from "../../services/notificationApi";
import messagingApi from "../../services/messagingApi";
import {
  extractConversationsFromResponse,
  formatLastMessagePreview,
  sortConversationsByRecent,
} from "../../utils/messagingConversations";
import { formatDate, formatDateTime } from "../../utils/datetime";

const getStatusIcon = (status) => {
  if (status === "Completed") return <CheckCircle size={16} className="text-green-600" />;
  if (status === "In Progress") return <Clock size={16} className="text-blue-600" />;
  return <AlertTriangle size={16} className="text-yellow-600" />;
};

const getPriorityColor = (priority) => {
  if (priority === "High") return "text-red-600 bg-red-100";
  if (priority === "Medium") return "text-yellow-600 bg-yellow-100";
  return "text-green-600 bg-green-100";
};

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [cases, setCases] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [dRes, cRes, wRes, nRes, mRes] = await Promise.all([
          getBusinessDashboard().catch(() => null),
          getBusinessCases({ limit: 5 }).catch(() => null),
          getSponsoredWorkers().catch(() => null),
          getNotifications({ limit: 6 }).catch(() => null),
          messagingApi.getConversations().catch(() => null),
        ]);
        setDashboard(dRes?.data?.data || null);
        setCases(cRes?.data?.data?.cases || []);
        setWorkers(wRes?.data?.data || []);
        const notifList = nRes?.data?.data?.notifications || nRes?.data?.data || [];
        setNotifications(Array.isArray(notifList) ? notifList : []);
        const msgList = sortConversationsByRecent(
          extractConversationsFromResponse(mRes),
        ).slice(0, 5);
        setMessages(msgList);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Active Workers",
        value: dashboard?.stats?.activeCases ?? workers.length,
        icon: Users,
        bg: "bg-blue-100",
        color: "text-blue-600",
      },
      {
        label: "Pending Licence Cases",
        value: dashboard?.stats?.pendingLicenceApplications ?? 0,
        icon: Inbox,
        bg: "bg-orange-100",
        color: "text-orange-600",
      },
      {
        label: "Total Cases",
        value: dashboard?.stats?.totalWorkers ?? cases.length,
        icon: CheckCircle,
        bg: "bg-green-100",
        color: "text-green-600",
      },
      {
        label: "Overdue Cases",
        value: dashboard?.stats?.overdueCount ?? 0,
        icon: Clock,
        bg: "bg-yellow-100",
        color: "text-yellow-600",
      },
      {
        label: "Licence Status",
        value: dashboard?.licenceStatus || "Pending",
        icon: ShieldCheck,
        bg: "bg-purple-100",
        color: "text-purple-600",
      },
      {
        label: "Licence Number",
        value: dashboard?.licenceNumber || "Not issued",
        icon: ShieldCheck,
        bg: "bg-indigo-100",
        color: "text-indigo-600",
      },
      {
        label: "Licence Expiry",
        value: dashboard?.licenceExpiry?.date ? formatDate(dashboard.licenceExpiry.date) : "—",
        icon: Clock,
        bg: "bg-sky-100",
        color: "text-sky-600",
      },
      {
        label: "Available CoS",
        value: dashboard?.cos?.available ?? 0,
        icon: Briefcase,
        bg: "bg-emerald-100",
        color: "text-emerald-600",
      },
      {
        label: "Pending CoS Requests",
        value: dashboard?.pendingCosRequests ?? 0,
        icon: Inbox,
        bg: "bg-amber-100",
        color: "text-amber-600",
      },
      {
        label: "Compliance Alerts",
        value: dashboard?.complianceAlerts ?? 0,
        icon: AlertTriangle,
        bg: "bg-red-100",
        color: "text-red-600",
      },
    ],
    [dashboard, workers.length, cases.length]
  );

  const remindersData = useMemo(() => {
    const items = [];
    if (dashboard?.licenceExpiry?.date) {
      const days = dashboard.licenceExpiry.daysRemaining ?? 999;
      items.push({
        id: "licence-expiry",
        title: "Sponsor Licence Expiry",
        description: `${days} day(s) remaining`,
        dueDate: formatDate(dashboard.licenceExpiry.date),
        priority: days < 30 ? "High" : "Medium",
        status: dashboard.licenceExpiry.renewalDue ? "Pending" : "In Progress",
      });
    }
    if ((dashboard?.stats?.overdueCount ?? 0) > 0) {
      items.push({
        id: "overdue",
        title: "Caseworker Follow-up Required",
        description: `${dashboard.stats.overdueCount} case(s) overdue`,
        dueDate: "Immediate",
        priority: "High",
        status: "Overdue",
      });
    }
    if ((dashboard?.complianceAlerts ?? 0) > 0) {
      items.push({
        id: "compliance-alerts",
        title: "Compliance Action Required",
        description: `${dashboard.complianceAlerts} compliance item(s) awaiting your response`,
        dueDate: "Immediate",
        priority: "High",
        status: "Pending",
      });
    }
    if ((dashboard?.pendingCosRequests ?? 0) > 0) {
      items.push({
        id: "pending-cos",
        title: "CoS Requests Under Review",
        description: `${dashboard.pendingCosRequests} request(s) awaiting a decision`,
        dueDate: "In progress",
        priority: "Medium",
        status: "In Progress",
      });
    }
    return items;
  }, [dashboard]);

  const workerRows = useMemo(
    () =>
      workers.slice(0, 6).map((w) => ({
        id: w.id,
        name: `${w.candidate?.first_name || ""} ${w.candidate?.last_name || ""}`.trim() || "Worker",
        visaType: w.visaType || "Unknown",
        cosNumber: w.caseId || "N/A",
        jobTitle: w.jobTitle || "Not assigned",
        visaExpiry: w.created_at ? formatDate(w.created_at) : "N/A",
        status: w.status || "Pending",
      })),
    [workers]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-gray-600">Loading sponsor dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="text-red-600" size={26} />
            Business Dashboard
          </h1>
          {dashboard?.licenceStatus && <LicenceStatusBadge status={dashboard.licenceStatus} />}
        </div>
        <p className="text-primary font-bold text-sm mt-0.5">
          Manage your business operations and workers.
          {dashboard?.licenceNumber && (
            <span className="ml-2 text-gray-500">• Licence No. {dashboard.licenceNumber}</span>
          )}
        </p>
      </motion.div>

      {dashboard && dashboard.licenceActive === false && (
        <LicenceGateBanner status={dashboard.licenceStatus} />
      )}

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants} initial="hidden" animate="visible">
        {stats.map(({ label, value, icon: Icon, bg, color }) => (
          <motion.div key={label} variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm flex items-center gap-3">
            <div className={`p-2 ${bg} rounded-xl`}>
              <Icon className={`${color} h-5 w-5`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600">{label}</p>
              <p className="text-2xl font-black text-secondary">{value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4 mb-3">
        <motion.div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="px-5 pt-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-secondary flex items-center gap-2">
                <Bell size={16} className="text-primary" /> Compliance Reminders
              </h3>
            </div>
            <div className="space-y-3">
              {remindersData.length === 0 && <p className="text-xs font-bold text-gray-500 px-3 py-4">No urgent compliance reminders.</p>}
              {remindersData.map((item) => (
                <div key={item.id} className="p-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-black text-secondary">{item.title}</h4>
                      <p className="text-xs font-bold text-gray-500">{item.description}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">Due: {item.dueDate}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${getPriorityColor(item.priority)}`}>{item.priority}</span>
                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        {getStatusIcon(item.status)}
                        {item.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="px-5 pt-5 pb-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-black text-secondary flex items-center gap-2">
                <Briefcase size={16} className="text-primary" /> Active Cases
              </h3>
            </div>
            <div className="space-y-3">
              {cases.length === 0 && <p className="text-xs font-bold text-gray-500 px-3 py-4">No active cases yet.</p>}
              {cases.map((item) => (
                <div key={item.id} className="p-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-black text-secondary">
                        {`${item.candidate?.first_name || ""} ${item.candidate?.last_name || ""}`.trim() || "Candidate"}
                      </h4>
                      <p className="text-xs font-bold text-gray-500">{item.jobTitle || "Case in progress"}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">Case ID: {item.caseId || "N/A"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${getPriorityColor(item.status === "Overdue" ? "High" : "Medium")}`}>
                        {item.status === "Overdue" ? "High" : "Medium"}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        {getStatusIcon(item.status || "Pending")}
                        {item.status || "Pending"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="px-5 pt-5 pb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-secondary flex items-center gap-2">
              <Users size={16} className="text-primary" /> Recent Sponsored Workers
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Worker Name</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Visa Type</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Case Ref</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Job Title</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Added On</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {workerRows.map((worker) => (
                  <tr key={worker.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-sm font-black text-secondary">{worker.name}</td>
                    <td className="px-3 py-2 text-sm font-bold text-gray-600">{worker.visaType}</td>
                    <td className="px-3 py-2 text-sm font-bold text-gray-600">{worker.cosNumber}</td>
                    <td className="px-3 py-2 text-sm font-bold text-gray-600">{worker.jobTitle}</td>
                    <td className="px-3 py-2 text-sm font-bold text-gray-600">{worker.visaExpiry}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black ${worker.status === "Active" ? "bg-green-100 text-green-700" : worker.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                        {worker.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {workerRows.length === 0 && (
                  <tr>
                    <td className="px-3 py-2 text-xs font-bold text-gray-500" colSpan={6}>
                      No sponsored workers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        <motion.div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative flex flex-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="px-5 pt-5 pb-5 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-secondary flex items-center gap-2">
                <MessageSquare size={16} className="text-primary" /> Recent Messages
              </h3>
              <button
                type="button"
                onClick={() => navigate("/business/messages")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white hover:bg-primary-dark transition shadow-sm"
              >
                View all
              </button>
            </div>
            <div
              className="p-3 mb-3 rounded-xl border border-gray-100 bg-gray-50/70 cursor-pointer"
              onClick={() => navigate("/business/messages")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/business/messages");
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none pointer-events-none"
                />
                <span className="rounded-xl bg-primary p-2 text-white shadow-md shadow-primary/20 flex items-center justify-center shrink-0">
                  <Send size={16} />
                </span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {messages.map((item) => {
                const otherUser = item.user || {};
                const lastMsg = item.lastMessage || {};
                const name = `${otherUser.first_name || ""} ${otherUser.last_name || ""}`.trim() || "User";
                const preview = formatLastMessagePreview(
                  typeof lastMsg === "object" ? lastMsg?.content : lastMsg,
                );
                const time = String(lastMsg.createdAt || item.lastMessageTime || "").split("T")[0];
                return (
                  <div
                    key={item.id || Math.random()}
                    onClick={() => navigate("/business/messages")}
                    className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-black text-secondary truncate">{name}</h4>
                      {time && <span className="text-[9px] font-bold text-gray-400 shrink-0">{time}</span>}
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-0.5">{preview || "Open conversation"}</p>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <p className="text-xs font-bold text-gray-400 text-center py-8">No recent messages.</p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative flex flex-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="px-5 pt-5 pb-5 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-secondary flex items-center gap-2">
                <Bell size={16} className="text-primary" /> Updates & Notifications
              </h3>
              <button
                type="button"
                onClick={() => window.location.href = '/business/notifications'}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white hover:bg-primary-dark transition shadow-sm"
              >
                View all
              </button>
            </div>
            <div className="space-y-3 flex-1">
              {notifications.slice(0, 4).map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-secondary truncate">{item.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{item.message}</p>
                      <p className="text-[9px] font-bold text-gray-400 mt-1">
                        {item.createdAt ? formatDateTime(item.createdAt) : "Recent"}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${getPriorityColor(item.priority === "high" ? "High" : item.priority === "medium" ? "Medium" : "Low")}`}>
                      {item.priority === "high" ? "High" : item.priority === "medium" ? "Medium" : "Low"}
                    </span>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && <p className="text-xs font-bold text-gray-400 text-center py-8">No notifications yet.</p>}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
