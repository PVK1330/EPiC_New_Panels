import { useState, useEffect, useRef } from "react";
import { toPng } from "html-to-image";
import { cloneWithResolvedStyles, removeCloneHost } from "../../utils/canvasExportUtils";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  RiAddLine,
  RiArrowRightSLine,
} from "react-icons/ri";
import Button from "../../components/Button";
import {
  getDashboardStats,
  getRecentCases,
  getRecentActivities,
} from "../../services/dashboardApi";
import { getConversations } from "../../services/messagingApi";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_RECENT_CASES,
  MOCK_RECENT_ACTIVITIES,
  MOCK_RECENT_MESSAGES,
} from "../../data/adminDashboardMock";

const today = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [dashboardFilter, setDashboardFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const dashboardRef = useRef(null);

  const applyDemoDashboard = () => {
    setDashboardStats(MOCK_DASHBOARD_STATS);
    setRecentCases(MOCK_RECENT_CASES);
    setRecentActivities(MOCK_RECENT_ACTIVITIES);
    setRecentMessages(MOCK_RECENT_MESSAGES);
    setUsingDemoData(true);
  };

  const normalizeConversations = (conversations) =>
    (Array.isArray(conversations) ? conversations : []).slice(0, 5).map((conv) => ({
      ...conv,
      user: conv.user || {},
      lastMessage: conv.lastMessage || { content: "", createdAt: null },
    }));

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setUsingDemoData(false);

      const [statsResult, casesResult, activitiesResult, messagesResult] =
        await Promise.allSettled([
          getDashboardStats({ filter: dashboardFilter }),
          getRecentCases({ limit: 5 }),
          getRecentActivities({ limit: 5 }),
          getConversations(),
        ]);

      let anySuccess = false;

      if (statsResult.status === "fulfilled" && statsResult.value?.data?.data) {
        setDashboardStats(statsResult.value.data.data);
        anySuccess = true;
      }

      if (casesResult.status === "fulfilled" && casesResult.value?.data?.data) {
        setRecentCases(casesResult.value.data.data.cases || []);
        anySuccess = true;
      }

      if (
        activitiesResult.status === "fulfilled" &&
        activitiesResult.value?.data?.data
      ) {
        setRecentActivities(activitiesResult.value.data.data.activities || []);
        anySuccess = true;
      }

      if (messagesResult.status === "fulfilled" && messagesResult.value?.data) {
        const conv =
          messagesResult.value.data.data?.conversations ??
          messagesResult.value.data.conversations ??
          [];
        setRecentMessages(normalizeConversations(conv));
        anySuccess = true;
      }

      if (!anySuccess) {
        console.warn("Dashboard API unavailable — showing sample data");
        applyDemoDashboard();
      } else {
        if (statsResult.status === "rejected") {
          setDashboardStats(MOCK_DASHBOARD_STATS);
          setUsingDemoData(true);
        }
        if (casesResult.status === "rejected") {
          setRecentCases(MOCK_RECENT_CASES);
          setUsingDemoData(true);
        }
        if (activitiesResult.status === "rejected") {
          setRecentActivities(MOCK_RECENT_ACTIVITIES);
          setUsingDemoData(true);
        }
        if (messagesResult.status === "rejected") {
          setRecentMessages(MOCK_RECENT_MESSAGES);
          setUsingDemoData(true);
        }
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, [dashboardFilter]);

  const handleExport = async () => {
    if (!dashboardRef.current) return;
    const { clone, host } = cloneWithResolvedStyles(dashboardRef.current);
    try {
      setIsExporting(true);
      const dataUrl = await toPng(clone, {
        cacheBust: true,
        backgroundColor: "#f9fafb",
        style: { borderRadius: "0" },
      });
      const link = document.createElement("a");
      link.download = `EPiC_Dashboard_Snapshot_${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      removeCloneHost(host);
      setIsExporting(false);
    }
  };

  const kpiCards = dashboardStats
    ? [
        {
          label: "Total Cases",
          value: dashboardStats.caseStats?.totalCases?.toString() || "0",
          trend: "+12.5%",
          icon: RiFolderOpenLine,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-50",
          to: "/admin/cases",
        },
        {
          label: "In Progress",
          value: dashboardStats.caseStats?.activeCases?.toString() || "0",
          trend: "+5.2%",
          icon: RiSettings3Line,
          iconColor: "text-orange-500",
          iconBg: "bg-orange-50",
        },
        {
          label: "Delayed",
          value: dashboardStats.caseStats?.pendingCases?.toString() || "0",
          trend: "-2.1%",
          icon: RiAlarmWarningLine,
          iconColor: "text-red-500",
          iconBg: "bg-red-50",
          to: "/admin/cases",
        },
        {
          label: "Completed",
          value: dashboardStats.caseStats?.completedCases?.toString() || "0",
          trend: "+18.3%",
          icon: RiCheckLine,
          iconColor: "text-green-600",
          iconBg: "bg-green-50",
        },
        {
          label: "Caseworkers",
          value: dashboardStats.userStats?.totalCaseworkers?.toString() || "0",
          trend: "0%",
          icon: RiUserLine,
          iconColor: "text-purple-600",
          iconBg: "bg-purple-50",
          to: "/admin/caseworkers",
        },
        {
          label: "Revenue",
          value: `£${(dashboardStats.financeStats?.totalRevenue || 0).toLocaleString()}`,
          trend: "+10.1%",
          icon: RiMoneyDollarCircleLine,
          iconColor: "text-yellow-600",
          iconBg: "bg-yellow-50",
          to: "/admin/finance",
        },
        {
          label: "Visa Alerts",
          value: (dashboardStats.caseStats?.visaExpiryAlerts || 0).toString(),
          trend: "+3",
          icon: RiErrorWarningLine,
          iconColor: "text-red-500",
          iconBg: "bg-red-50",
        },
        {
          label: "Sponsor Alerts",
          value: (dashboardStats.caseStats?.sponsorExpiryAlerts || 0).toString(),
          trend: "+1",
          icon: RiBuildingLine,
          iconColor: "text-orange-500",
          iconBg: "bg-orange-50",
        },
      ]
    : [];

  return (
    <div ref={dashboardRef} className="pb-10 p-4 max-w-[1600px] mx-auto">
      <Skeleton name="admin-dashboard" loading={loading} animate="shimmer">
        <motion.div className="space-y-6">
          {usingDemoData && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 font-medium"
            >
              Showing sample dashboard data — live stats will appear when the API is available.
            </motion.div>
          )}
          {/* Slim Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 mb-6">
            <div>
              <h1 className="text-xl font-black text-secondary tracking-tight">Dashboard</h1>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">
                Consolidated platform intelligence — {today}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
                <RiDownloadLine size={14} className="mr-1.5" />
                {isExporting ? "Exporting..." : "Generate Report"}
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate("/admin/cases")}>
                <RiAddLine size={16} className="mr-1" />
                New Case
              </Button>
            </div>
          </div>

          {/* KPI Grid */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {kpiCards.map((card) => (
              <motion.div
                key={card.label}
                variants={cardItem}
                onClick={() => card.to && navigate(card.to)}
                className={`bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative overflow-hidden group transition-all duration-200 ${
                  card.to ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
                }`}
              >
                <div className={`absolute top-4 right-4 p-2 rounded-xl ${card.iconBg}`}>
                  <card.icon size={18} className={card.iconColor} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 pr-10 leading-tight">
                  {card.label}
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-2xl font-black text-secondary tracking-tight leading-none">{card.value}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mb-0.5 ${
                    card.trend.startsWith('+') ? 'bg-green-50 text-green-700' : 
                    card.trend.startsWith('-') ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {card.trend}
                  </span>
                </div>
                {card.to && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-xl" />
                )}
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            {/* Recent Cases */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xs font-black text-secondary uppercase tracking-widest">Recent Cases</h3>
                <button onClick={() => navigate("/admin/cases")} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left border-b border-gray-100">
                      {["Case ID", "Candidate", "Visa Type", "Status"].map((h) => (
                        <th key={h} className="px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentCases.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-secondary">{row.caseId || `#${row.id}`}</td>
                        <td className="px-5 py-3.5 text-xs font-bold text-gray-700">
                          {row.candidate ? `${row.candidate.first_name} ${row.candidate.last_name}` : "Unknown"}
                        </td>
                        <td className="px-5 py-3.5 text-[11px] font-medium text-gray-500">{row.visaType?.name || "N/A"}</td>
                        <td className="px-5 py-3.5 flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            row.status === "Completed" ? "bg-green-50 text-green-700 border-green-100" :
                            row.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-100" :
                            row.status === "Cancelled" ? "bg-red-50 text-red-700 border-red-100" :
                            "bg-blue-50 text-blue-700 border-blue-100"
                          }`}>{row.status}</span>
                          <RiArrowRightSLine size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Escalations */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-secondary uppercase tracking-widest">🚩 Active Escalations</h3>
                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded border border-red-100">Action Required</span>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {dashboardStats?.escalations?.length > 0 ? (
                  dashboardStats.escalations.map((esc, i) => (
                    <div key={esc.id || i} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-red-200 transition-colors group cursor-pointer">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${esc.severity === "Critical" ? "bg-red-500 animate-pulse" : "bg-amber-500"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-secondary uppercase tracking-tight">{esc.caseId} — {esc.triggerType || "Issue"}</p>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{esc.trigger || esc.candidate}</p>
                      </div>
                      <RiArrowRightSLine className="text-gray-300 group-hover:text-red-500 transition-colors" />
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                    <RiCheckLine size={32} className="text-green-500 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No active escalations</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity + Recent Messages */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            {...fade(0.4)}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <motion.div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-secondary">Recent Activity</h3>
              </motion.div>
              <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, i) => (
                    <div
                      key={activity.id || i}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-bold text-secondary truncate">{activity.title}</p>
                        <p className="text-xs text-gray-400 truncate">{activity.description}</p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-lg">
                        {activity.createdAt
                          ? new Date(activity.createdAt).toLocaleDateString()
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-secondary">Recent Messages</h3>
                <button
                  type="button"
                  onClick={() => navigate("/admin/messages")}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  View All →
                </button>
              </div>
              <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                {recentMessages.length > 0 ? (
                  recentMessages.map((conv) => (
                    <motion.div
                      key={conv.id}
                      onClick={() =>
                        conv.user?.id &&
                        navigate("/admin/messages", { state: { userId: conv.user.id } })
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
                              ? new Date(conv.lastMessage.createdAt).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate leading-relaxed italic">
                          {conv.lastMessage?.content || "No message"}
                        </p>
                        {conv.case && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-widest">
                              {conv.case.caseId}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="px-6 py-10 text-center text-gray-400 opacity-40">
                    <RiUserLine size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold">No recent messages</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Skeleton>
    </div>
  );
}
