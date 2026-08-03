import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Skeleton } from "boneyard-js/react";
import {
  RiFolderOpenLine,
  RiSettings3Line,
  RiAlarmWarningLine,
  RiCheckLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiErrorWarningLine,
  RiBuildingLine,
  RiCalendarLine,
  RiDownloadLine,
  RiShieldUserLine,
  RiShieldCheckLine,
  RiFileShieldLine,
  RiInboxArchiveLine,
  RiAddLine,
  RiArrowRightSLine,
  RiSendPlaneLine,
} from "react-icons/ri";
import Button from "../../components/Button";
import {
  getDashboardStats,
  getRecentCases,
  getRecentActivities,
  getDueOverdueTasks,
} from "../../services/dashboardApi";
import useDownloads from "../../hooks/useDownloads";
import DueOverdueTasksWidget from "../../components/dashboard/DueOverdueTasksWidget";
import { getConversations } from "../../services/messagingApi";
import {
  extractConversationsFromResponse,
  normalizeConversationForDashboard,
  sortConversationsByRecent,
} from "../../utils/messagingConversations";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../services/notificationApi";
import { formatDate, formatDateLong, formatDateTime } from "../../utils/datetime";

const today = formatDateLong(new Date(), { month: "long" });

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [dashboardFilter, setDashboardFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [dueOverdue, setDueOverdue] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const dashboardRef = useRef(null);
  const { downloadDashboardPdf } = useDownloads();

  const normalizeConversations = (conversations) =>
    sortConversationsByRecent(conversations)
      .slice(0, 5)
      .map(normalizeConversationForDashboard);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      const [
        statsResult,
        casesResult,
        activitiesResult,
        messagesResult,
        dueResult,
        notifResult,
      ] = await Promise.allSettled([
        getDashboardStats({ filter: dashboardFilter }),
        getRecentCases({ limit: 5 }),
        getRecentActivities({ limit: 5 }),
        getConversations(),
        getDueOverdueTasks(),
        getNotifications({ limit: 5 }),
      ]);

      if (statsResult.status === "fulfilled" && statsResult.value?.data?.data) {
        setDashboardStats(statsResult.value.data.data);
      } else {
        setDashboardStats(null);
      }

      if (casesResult.status === "fulfilled" && casesResult.value?.data?.data) {
        setRecentCases(casesResult.value.data.data.cases || []);
      } else {
        setRecentCases([]);
      }

      if (
        activitiesResult.status === "fulfilled" &&
        activitiesResult.value?.data?.data
      ) {
        setRecentActivities(activitiesResult.value.data.data.activities || []);
      } else {
        setRecentActivities([]);
      }

      if (messagesResult.status === "fulfilled") {
        const conv = extractConversationsFromResponse(messagesResult.value);
        setRecentMessages(normalizeConversations(conv));
      } else {
        setRecentMessages([]);
      }

      if (dueResult.status === "fulfilled" && dueResult.value?.data?.data) {
        setDueOverdue(dueResult.value.data.data);
      } else {
        setDueOverdue(null);
      }

      if (notifResult.status === "fulfilled" && notifResult.value?.data?.data) {
        setNotifications(notifResult.value.data.data.notifications || []);
      } else {
        setNotifications([]);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, [dashboardFilter]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await downloadDashboardPdf();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
        );
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }
    setSelectedNotification(notif);
  };

  const kpiCards = dashboardStats
    ? [
        {
          label: "Total Cases",
          value: dashboardStats.caseStats?.totalCases?.toString() || "0",
          icon: RiFolderOpenLine,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-50",
          to: "/admin/cases",
        },
        {
          label: "In Progress",
          value: dashboardStats.caseStats?.activeCases?.toString() || "0",
          icon: RiSettings3Line,
          iconColor: "text-orange-500",
          iconBg: "bg-orange-50",
        },
        {
          label: "Delayed",
          value: dashboardStats.caseStats?.pendingCases?.toString() || "0",
          icon: RiAlarmWarningLine,
          iconColor: "text-red-500",
          iconBg: "bg-red-50",
          to: "/admin/cases",
        },
        {
          label: "Completed",
          value: dashboardStats.caseStats?.completedCases?.toString() || "0",
          icon: RiCheckLine,
          iconColor: "text-green-600",
          iconBg: "bg-green-50",
        },
        {
          label: "New Immigration Cases",
          value: (dashboardStats.caseStats?.newImmigrationCases || 0).toString(),
          icon: RiFolderOpenLine,
          iconColor: "text-sky-600",
          iconBg: "bg-sky-50",
          to: "/admin/cases",
        },
        {
          label: "Unassigned Cases",
          value: (dashboardStats.caseStats?.unassignedCases || 0).toString(),
          icon: RiInboxArchiveLine,
          iconColor: "text-amber-600",
          iconBg: "bg-amber-50",
          to: "/admin/cases",
        },
        {
          label: "Pending Licence Reviews",
          value: (dashboardStats.reviewStats?.pendingLicenceReviews || 0).toString(),
          icon: RiShieldUserLine,
          iconColor: "text-indigo-600",
          iconBg: "bg-indigo-50",
          to: "/admin/licence-requests",
        },
        {
          label: "Pending CoS Requests",
          value: (dashboardStats.reviewStats?.pendingCosRequests || 0).toString(),
          icon: RiShieldCheckLine,
          iconColor: "text-teal-600",
          iconBg: "bg-teal-50",
          to: "/admin/cos-requests",
        },
        {
          label: "Pending Compliance Reviews",
          value: (dashboardStats.reviewStats?.pendingComplianceReviews || 0).toString(),
          icon: RiFileShieldLine,
          iconColor: "text-rose-600",
          iconBg: "bg-rose-50",
          to: "/admin/compliance-review",
        },
        {
          label: "Caseworkers",
          value: dashboardStats.userStats?.totalCaseworkers?.toString() || "0",
          icon: RiUserLine,
          iconColor: "text-purple-600",
          iconBg: "bg-purple-50",
          to: "/admin/caseworkers",
        },
        {
          label: "Revenue",
          value: `£${(dashboardStats.financeStats?.totalRevenue || 0).toLocaleString()}`,
          icon: RiMoneyDollarCircleLine,
          iconColor: "text-yellow-600",
          iconBg: "bg-yellow-50",
          to: "/admin/finance",
        },
        {
          label: "Visa Alerts",
          value: (dashboardStats.caseStats?.visaExpiryAlerts || 0).toString(),
          icon: RiErrorWarningLine,
          iconColor: "text-red-500",
          iconBg: "bg-red-50",
        },
        {
          label: "Sponsor Alerts",
          value: (
            dashboardStats.caseStats?.sponsorExpiryAlerts || 0
          ).toString(),
          icon: RiBuildingLine,
          iconColor: "text-orange-500",
          iconBg: "bg-orange-50",
        },
      ]
    : [];

  return (
    <div ref={dashboardRef} className="pb-5 p-4 max-w-[1600px] mx-auto">
      <Skeleton name="admin-dashboard" loading={loading} animate="shimmer">
        <div className="space-y-4">
          {/* Slim Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 mb-4">
            <div>
              <h1 className="text-xl font-black text-secondary tracking-tight">
                Dashboard
              </h1>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">
                Consolidated platform intelligence — {today}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
              >
                <RiDownloadLine size={14} className="mr-1.5" />
                {isExporting ? "Exporting..." : "Generate Report"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/admin/cases")}
              >
                <RiAddLine size={16} className="mr-1" />
                New Case
              </Button>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {kpiCards.map((card) => (
              <div
                key={card.label}
                onClick={() => card.to && navigate(card.to)}
                className={`bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative overflow-hidden group transition-all duration-200 ${
                  card.to
                    ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                    : ""
                }`}
              >
                <div
                  className={`absolute top-4 right-4 p-2 rounded-xl ${card.iconBg}`}
                >
                  <card.icon size={18} className={card.iconColor} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 pr-10 leading-tight">
                  {card.label}
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-2xl font-black text-secondary tracking-tight leading-none">
                    {card.value}
                  </span>
                </div>
                {card.to && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-xl" />
                )}
              </div>
            ))}
          </div>

          {dueOverdue && (
            <DueOverdueTasksWidget
              data={dueOverdue}
              casesLink="/admin/cases"
              tasksLink="/admin/assign"
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
            {/* Recent Cases */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xs font-black text-secondary uppercase tracking-widest">
                  Recent Cases
                </h3>
                <button
                  onClick={() => navigate("/admin/cases")}
                  className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 text-left border-b border-gray-100">
                      {["Case ID", "Client", "Visa Type", "Status"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentCases.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-secondary">
                          {row.caseId || `#${row.id}`}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-bold text-gray-700">
                          {row.candidate
                            ? `${row.candidate.first_name} ${row.candidate.last_name}`
                            : "Unknown"}
                        </td>
                        <td className="px-5 py-3.5 text-[11px] font-medium text-gray-500">
                          {row.visaType?.name || "N/A"}
                        </td>
                        <td className="px-5 py-3.5 flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              row.status === "Completed"
                                ? "bg-green-50 text-green-700 border-green-100"
                                : row.status === "Pending"
                                  ? "bg-amber-50 text-amber-700 border-amber-100"
                                  : row.status === "Cancelled"
                                    ? "bg-red-50 text-red-700 border-red-100"
                                    : "bg-blue-50 text-blue-700 border-blue-100"
                            }`}
                          >
                            {row.status}
                          </span>
                          <RiArrowRightSLine
                            size={16}
                            className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Escalations */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-secondary uppercase tracking-widest">
                  🚩 Active Escalations
                </h3>
                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded border border-red-100">
                  Action Required
                </span>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {dashboardStats?.escalations?.length > 0 ? (
                  dashboardStats.escalations.map((esc, i) => (
                    <div
                      key={esc.id || i}
                      className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-red-200 transition-colors group cursor-pointer"
                    >
                      <div
                        className={`mt-1 w-2 h-2 rounded-full shrink-0 ${esc.severity === "Critical" ? "bg-red-500 animate-pulse" : "bg-amber-500"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-secondary uppercase tracking-tight">
                          {esc.caseId} — {esc.triggerType || "Issue"}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">
                          {esc.trigger || esc.candidate}
                        </p>
                      </div>
                      <RiArrowRightSLine className="text-gray-300 group-hover:text-red-500 transition-colors" />
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                    <RiCheckLine size={32} className="text-green-500 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      No active escalations
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity + Recent Messages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-secondary">
                  Recent Activity
                </h3>
              </div>
              <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, i) => (
                    <div
                      key={activity.id || i}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-bold text-secondary truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-lg">
                        {activity.createdAt
                          ? formatDate(activity.createdAt)
                          : "—"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-10 text-center text-gray-400">
                    <p className="text-xs font-bold">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-secondary">
                  Recent Messages
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/admin/messages")}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  View All →
                </button>
              </div>
              <div className="flex-1 divide-y divide-gray-50 max-h-[350px] overflow-y-auto custom-scrollbar">
                {recentMessages.length > 0 ? (
                  recentMessages.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() =>
                        conv.user?.id &&
                        navigate("/admin/messages", {
                          state: { userId: conv.user.id },
                        })
                      }
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-100 text-secondary font-black text-xs uppercase tracking-tighter shadow-sm">
                          {conv.user?.first_name?.[0] || "?"}
                          {conv.user?.last_name?.[0] || ""}
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-primary/20">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-bold text-secondary truncate group-hover:text-primary transition-colors">
                            {conv.user?.first_name} {conv.user?.last_name}
                          </p>
                          <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">
                            {conv.lastMessage?.createdAt
                              ? formatDate(conv.lastMessage.createdAt)
                              : ""}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate leading-relaxed italic">
                          {conv.lastMessage?.preview || "No message"}
                        </p>
                        {conv.case && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-widest">
                              {conv.case.caseId}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-10 text-center text-gray-400 opacity-40">
                    <RiUserLine size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold">No recent messages</p>
                  </div>
                )}
              </div>
              <div
                className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0"
                onClick={() => navigate("/admin/messages")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    navigate("/admin/messages");
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex gap-2 cursor-pointer">
                  <input
                    type="text"
                    readOnly
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none pointer-events-none"
                  />
                  <span className="rounded-xl bg-primary p-2.5 text-white shadow-md shadow-primary/20 flex items-center justify-center">
                    <RiSendPlaneLine size={18} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="grid grid-cols-1 mt-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-secondary">
                  Recent Notifications
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/admin/notifications")}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  View All →
                </button>
              </div>
              <div className="flex-1 divide-y divide-gray-50 max-h-[350px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors cursor-pointer group ${notif.isRead ? "hover:bg-gray-50" : "bg-blue-50/30 hover:bg-blue-50/50"}`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center justify-between mb-0.5">
                          <p
                            className={`text-sm font-bold truncate transition-colors ${notif.isRead ? "text-secondary group-hover:text-primary" : "text-primary"}`}
                          >
                            {notif.title}
                          </p>
                          <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">
                            {notif.createdAt
                              ? formatDate(notif.createdAt)
                              : ""}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-10 text-center text-gray-400 opacity-40">
                    <RiAlarmWarningLine
                      size={32}
                      className="mx-auto mb-2 opacity-20"
                    />
                    <p className="text-xs font-bold">No recent notifications</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Skeleton>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-sm font-black text-secondary">
                Notification Details
              </h3>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-secondary">
                  {selectedNotification.title}
                </h4>
                {selectedNotification.priority && (
                  <span
                    className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      selectedNotification.priority === "urgent"
                        ? "bg-red-100 text-red-700"
                        : selectedNotification.priority === "high"
                          ? "bg-orange-100 text-orange-700"
                          : selectedNotification.priority === "low"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {selectedNotification.priority} Priority
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap leading-relaxed">
                {selectedNotification.message}
              </p>

              {selectedNotification.metadata &&
                Object.keys(selectedNotification.metadata).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Notification Details
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                      {Object.entries(selectedNotification.metadata).map(
                        ([key, value]) => (
                          <div key={key}>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                            <div className="text-sm font-semibold text-secondary mt-0.5 break-words">
                              {Array.isArray(value)
                                ? value.join(", ")
                                : String(value)}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Received:{" "}
                {formatDateTime(selectedNotification.createdAt)}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <Button
                variant="primary"
                onClick={() => setSelectedNotification(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
