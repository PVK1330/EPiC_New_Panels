import { useState, useEffect, useRef } from "react";
import { toPng } from 'html-to-image';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "react-icons/ri";
import {
  getDashboardStats,
  getRecentCases,
  getRecentActivities,
  exportDashboardPDF,
} from "../../services/dashboardApi";
import { getConversations } from "../../services/messagingApi";

// ─── Static Data (from index.html dashboard) ──────────────────────────────────

const today = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

// (Static data removed - now dynamic from API)


// (Static data removed - now dynamic from API)



// ─── Chip colour map ───────────────────────────────────────────────────────────
const chipCls = {
  green:  "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red:    "bg-red-100 text-red-600",
  blue:   "bg-blue-100 text-blue-700",
  gray:   "bg-gray-100 text-gray-500",
  purple: "bg-purple-100 text-purple-700",
};

// ─── Motion helpers ────────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [dashboardFilter, setDashboardFilter] = useState('all'); // 'all' or 'this_month'
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef(null);

  // Fetch dashboard data on component mount or when filter changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [statsRes, casesRes, activitiesRes, messagesRes] = await Promise.all([
          getDashboardStats({ filter: dashboardFilter }),
          getRecentCases({ limit: 5 }),
          getRecentActivities({ limit: 5 }),
          getConversations(),
        ]);

        setDashboardStats(statsRes.data.data);
        setRecentCases(casesRes.data.data.cases || []);
        setRecentActivities(activitiesRes.data.data.activities || []);
        setRecentMessages(messagesRes.data.data.conversations?.slice(0, 5) || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dashboardFilter]);

  const handleExport = async () => {
    if (!dashboardRef.current) return;
    
    try {
      setIsExporting(true);
      
      // Capture the exact UI as a PNG
      const dataUrl = await toPng(dashboardRef.current, {
        cacheBust: true,
        backgroundColor: '#f9fafb',
        style: {
          borderRadius: '0'
        },
        // Filter out the buttons/header actions if needed, 
        // but user wants "exact same", so we capture everything inside the ref
        filter: (node) => {
          // Optional: hide buttons if you want it cleaner, 
          // but for "exact same" we keep most things
          return true; 
        }
      });
      
      const link = document.createElement('a');
      link.download = `EPiC_Dashboard_Snapshot_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to capture dashboard snapshot. Please ensure your browser supports advanced CSS capturing.");
    } finally {
      setIsExporting(false);
    }
  };

  // Transform backend data to KPI cards format (matching ReferenceUI structure)
  const kpiCards = dashboardStats ? [
    {
      label: "Total Cases",
      value: dashboardStats.caseStats?.totalCases?.toString() || "0",
      icon: RiFolderOpenLine,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      to: "/admin/cases",
    },
    {
      label: "Cases In Progress",
      value: dashboardStats.caseStats?.activeCases?.toString() || "0",
      icon: RiSettings3Line,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50",
    },
    {
      label: "Delayed Cases",
      value: dashboardStats.caseStats?.pendingCases?.toString() || "0",
      icon: RiAlarmWarningLine,
      iconColor: "text-red-500",
      iconBg: "bg-red-50",
      to: "/admin/cases",
    },
    {
      label: "Completed This Month",
      value: dashboardStats.caseStats?.completedCases?.toString() || "0",
      icon: RiCheckLine,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
    },
    {
      label: "Active Caseworkers",
      value: dashboardStats.userStats?.totalCaseworkers?.toString() || "0",
      icon: RiUserLine,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      to: "/admin/caseworkers",
    },
    {
      label: "Fees Collected",
      value: `£${(dashboardStats.financeStats?.totalRevenue || 0).toLocaleString()}`,
      icon: RiMoneyDollarCircleLine,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-50",
      to: "/admin/finance",
    },
    {
      label: "Visa Expiry Alerts",
      value: (dashboardStats.caseStats?.visaExpiryAlerts || 0).toString(),
      icon: RiErrorWarningLine,
      iconColor: "text-red-500",
      iconBg: "bg-red-50",
    },
    {
      label: "Sponsor Licence Expiry",
      value: (dashboardStats.caseStats?.sponsorExpiryAlerts || 0).toString(),
      icon: RiBuildingLine,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50",
    },
  ] : [];

  return (
    <div ref={dashboardRef} className="space-y-8 pb-10 p-4">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
        {...fade(0)}
      >
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {today} — Overview of all active operations
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setDashboardFilter(dashboardFilter === 'all' ? 'this_month' : 'all')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border rounded-xl transition-all shadow-sm ${
              dashboardFilter === 'this_month' 
                ? "bg-primary text-white border-primary" 
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <RiCalendarLine size={15} />
            {dashboardFilter === 'this_month' ? 'Showing: This Month' : 'This Month'}
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl transition-all shadow-sm ${
              isExporting ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <RiDownloadLine size={15} />
            )}
            {isExporting ? "Generating PDF..." : "Export Snapshot"}
          </button>
        </div>
      </motion.div>

      {/* ── KPI Grid (8 cards) ───────────────────────────────────────────────── */}
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
            className={`bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative overflow-hidden group ${
              card.to
                ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                : ""
            }`}
          >
            <div className={`absolute top-4 right-4 p-2 rounded-xl ${card.iconBg}`}>
              <card.icon size={18} className={card.iconColor} />
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2 pr-10 leading-tight">
              {card.label}
            </p>
            <p className="text-3xl font-black text-secondary leading-none">{card.value}</p>
            <p className="text-xs text-gray-400 mt-2">{card.sub}</p>
            {card.to && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-xl" />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* ── Row: Recent Cases + Active Escalations ────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        {...fade(0.2)}
      >
        {/* Recent Cases */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-secondary">Recent Cases</h3>
            <button
              onClick={() => navigate("/admin/cases")}
              className="text-xs font-bold text-primary hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Case ID", "Candidate", "Visa Type", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentCases.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-bold text-secondary whitespace-nowrap">
                      {row.caseId || `#${row.id}`}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">
                      {row.candidate ? `${row.candidate.first_name} ${row.candidate.last_name}` : 'Unknown'}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {row.visaType?.name || 'N/A'}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                        row.status === 'Completed' ? chipCls.green :
                        row.status === 'Pending' ? chipCls.yellow :
                        row.status === 'Cancelled' ? chipCls.red :
                        chipCls.blue
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Escalations */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-sm font-black text-secondary mb-4">🚩 Active Escalations</h3>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {dashboardStats?.escalations?.length > 0 ? (
              dashboardStats.escalations.map((esc, i) => {
                const isCritical = esc.severity === "Critical" || esc.severity === "High";
                return (
                  <div
                    key={esc.id || i}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                      isCritical
                        ? "bg-red-50 border-red-100"
                        : "bg-yellow-50 border-yellow-100"
                    }`}
                  >
                    <div
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        isCritical ? "bg-red-500" : "bg-yellow-500"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-black leading-snug truncate ${
                          isCritical ? "text-red-700" : "text-yellow-700"
                        }`}
                        title={esc.caseId}
                      >
                        {esc.caseId} — {esc.triggerType || 'Issue'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{esc.trigger || esc.candidate}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                <RiCheckLine size={40} className="text-green-500 mb-2" />
                <p className="text-xs font-bold">No active escalations</p>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/admin/cases")}
            className="mt-4 text-xs font-bold text-gray-500 hover:text-secondary transition-colors self-start"
          >
            View All Escalations →
          </button>
        </div>
      </motion.div>

      {/* ── Row: Team Workload + Financial Overview ──────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        {...fade(0.3)}
      >
        {/* Team Workload */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-sm font-black text-secondary mb-5">👥 Team Workload</h3>
          <div className="space-y-4 flex-1">
            {dashboardStats?.teamWorkload?.length > 0 ? (
              dashboardStats.teamWorkload.map((member, i) => (
                <div key={member.name} className="flex items-center gap-3">
                  <p className="text-xs font-semibold text-gray-600 w-28 shrink-0 truncate">
                    {member.name}
                  </p>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${member.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${member.pct}%` }}
                      transition={{ duration: 0.7, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs font-black text-secondary w-6 text-right shrink-0">
                    {member.cases}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-10 text-center">No active workload data</p>
            )}
          </div>
          <button
            onClick={() => navigate("/admin/caseworkers")}
            className="mt-5 text-xs font-bold text-gray-500 hover:text-secondary transition-colors self-start"
          >
            Full Workload Report →
          </button>
        </div>

        {/* Financial Overview */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-sm font-black text-secondary mb-4">💳 Financial Overview</h3>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-[11px] font-bold text-gray-400 mb-1">Total Revenue</p>
              <p className="text-2xl font-black text-green-600">£{(dashboardStats?.financeStats?.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-[11px] font-bold text-gray-400 mb-1">Outstanding</p>
              <p className="text-2xl font-black text-red-500">£{(dashboardStats?.financeStats?.totalOutstanding || 0).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Top Outstanding Clients
          </p>
          <div className="flex-1">
            {dashboardStats?.financeStats?.outstandingSponsors?.length > 0 ? (
              dashboardStats.financeStats.outstandingSponsors.map((c, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between py-2.5 ${
                    i < dashboardStats.financeStats.outstandingSponsors.length - 1 ? "border-b border-gray-50" : ""
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-700">{c.name}</p>
                  <p className="text-xs font-black font-mono text-red-500">£{c.amount.toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">No outstanding payments</p>
            )}
          </div>

          <button
            onClick={() => navigate("/admin/finance")}
            className="mt-4 text-xs font-bold text-gray-500 hover:text-secondary transition-colors self-start"
          >
            View Finance Panel →
          </button>
        </div>
      </motion.div>

      {/* ── Row: Recent Activity + Recent Messages ─────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        {...fade(0.4)}
      >
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-secondary">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto custom-scrollbar">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold text-secondary truncate">{activity.title}</p>
                    <p className="text-xs text-gray-400 truncate">{activity.description}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-lg">
                    {new Date(activity.createdAt).toLocaleDateString()}
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

        {/* Recent Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-secondary">Recent Messages</h3>
            <button
              onClick={() => navigate("/admin/messages")}
              className="text-xs font-bold text-primary hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto custom-scrollbar">
            {recentMessages.length > 0 ? (
              recentMessages.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => navigate("/admin/messages", { state: { userId: conv.user.id } })}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-100 text-secondary font-black text-xs uppercase tracking-tighter shadow-sm">
                      {conv.user.first_name[0]}{conv.user.last_name[0]}
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
                        {conv.user.first_name} {conv.user.last_name}
                      </p>
                      <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate leading-relaxed italic">
                      {conv.lastMessage.content}
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
        </div>
      </motion.div>
      </>
      )}
    </div>
  );
}
