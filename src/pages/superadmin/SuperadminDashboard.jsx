import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiOrganizationChart,
  RiGroupLine,
  RiMoneyPoundCircleLine,
  RiBarChartLine,
  RiPieChart2Line,
  RiArrowRightSLine,
  RiExchangeLine,
  RiRefreshLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiCloseCircleLine,
  RiTimeLine,
  RiAddLine,
  RiLineChartLine,
  RiFileDownloadLine,
} from "react-icons/ri";
import { fetchDashboardStats } from "../../services/superadminDashboard.service";
import { fetchPlatformNotifications } from "../../services/superadminNotification.service";
import { formatDateLong } from "../../utils/datetime";
import toast from "react-hot-toast";

const PLAN_COLORS = [
  "bg-primary",
  "bg-secondary",
  "bg-amber-400",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
];

const STATUS_BADGE = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100/85",
  trial: "bg-amber-50 text-amber-700 border-amber-100/85",
  suspended: "bg-rose-50 text-rose-700 border-rose-100/85",
};

function formatCurrency(value) {
  const n = Number(value) || 0;
  if (n >= 1000000) return `£${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `£${(n / 1000).toFixed(1)}k`;
  return `£${n.toFixed(2)}`;
}

function formatNumber(value) {
  const n = Number(value) || 0;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const StatCard = ({ title, value, subtitle, icon: Icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35, ease: "easeOut" }}
    className="p-5 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-300 flex flex-col justify-between min-h-[140px] group cursor-pointer"
  >
    <div className="flex items-center justify-between">
      <p className="text-xs font-black text-slate-600 uppercase tracking-widest">{title}</p>
      <div className={`p-2 rounded-xl border transition-all duration-300 group-hover:scale-110 ${color}`}>
        <Icon size={18} />
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-2xl font-black text-secondary tracking-tight group-hover:text-primary transition-colors">{value}</h3>
      {subtitle && <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mt-1">{subtitle}</p>}
    </div>
  </motion.div>
);

const SkeletonCard = () => (
  <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse min-h-[140px] flex flex-col justify-between">
    <div className="flex justify-between items-center">
      <div className="w-24 h-3 bg-gray-100 rounded" />
      <div className="w-8 h-8 bg-gray-100 rounded-xl" />
    </div>
    <div>
      <div className="w-16 h-7 bg-gray-100 rounded" />
      <div className="w-28 h-2.5 bg-gray-100 rounded mt-2" />
    </div>
  </div>
);

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDateLong(dateStr, { month: "short" });
}

const SuperadminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [res, notifRes] = await Promise.all([
        fetchDashboardStats(),
        fetchPlatformNotifications({ limit: 4 }).catch(() => ({ data: { notifications: [] } }))
      ]);

      setStats(res.data?.data?.stats || res.data?.stats || null);
      
      const notifList = notifRes.data?.data?.notifications || notifRes.data?.notifications || [];
      setNotifications(Array.isArray(notifList) ? notifList : []);
    } catch (err) {
      console.error("Dashboard stats error:", err);
      toast.error(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const orgs = stats?.organisations || {};
  const users = stats?.users || {};
  const revenue = stats?.revenue || {};
  const subs = stats?.subscriptions || {};
  const txns = stats?.transactions || {};
  const invoices = stats?.invoices || {};
  const planDist = stats?.planDistribution || [];
  const monthlyRev = stats?.monthlyRevenue || [];
  const recentOrgs = stats?.recentOrganisations || [];

  const maxChartVal = Math.max(...monthlyRev.map((m) => m.amount), 1);
  const planTotal = planDist.reduce((s, p) => s + p.orgCount, 0) + (stats?.orgsWithNoPlan || 0);

  return (
    <div className="space-y-6 pb-6 animate-in fade-in slide-in-from-bottom-3 duration-300 print-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-black text-secondary tracking-tight">Platform Overview</h1>
          <p className="text-xs text-slate-600 mt-0.5 font-bold uppercase tracking-widest">
            Real-time billing & tenant infrastructure analytics
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={() => loadStats(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
          >
            <RiRefreshLine size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-primary hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
          >
            <RiFileDownloadLine size={14} />
            Export Snapshot
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(revenue.mrr)}
            subtitle={`ARR equivalent: ${formatCurrency(revenue.arr)}`}
            icon={RiMoneyPoundCircleLine}
            color="bg-primary/5 text-primary border-primary/10"
            delay={0}
          />
          <StatCard
            title="Organizations"
            value={orgs.total || 0}
            subtitle={orgs.newThisMonth > 0 ? `+${orgs.newThisMonth} this month` : "No new orgs this month"}
            icon={RiOrganizationChart}
            color="bg-emerald-50 text-emerald-600 border-emerald-100"
            delay={0.05}
          />
          <StatCard
            title="Platform Users"
            value={formatNumber(users.total)}
            subtitle={users.newThisMonth > 0 ? `+${users.newThisMonth} this month` : "No new users this month"}
            icon={RiGroupLine}
            color="bg-purple-50 text-purple-600 border-purple-100"
            delay={0.1}
          />
          <StatCard
            title="Active Subscriptions"
            value={subs.active || 0}
            subtitle={`${subs.churnRate || 0}% Churn Rate`}
            icon={RiBarChartLine}
            color="bg-amber-50 text-amber-600 border-amber-100"
            delay={0.15}
          />
        </div>
      )}

      {/* Secondary Stats Row */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MiniStat label="Active Orgs" value={orgs.active || 0} icon={RiCheckboxCircleLine} iconColor="text-emerald-500" />
          <MiniStat label="Trial Orgs" value={orgs.trial || 0} icon={RiTimeLine} iconColor="text-amber-500" />
          <MiniStat label="Suspended" value={orgs.suspended || 0} icon={RiCloseCircleLine} iconColor="text-rose-500" />
          <MiniStat label="Gross Volume" value={formatCurrency(revenue.grossVolume)} icon={RiExchangeLine} iconColor="text-primary" />
          <MiniStat label="Pending Invoices" value={invoices.pending || 0} icon={RiAlertLine} iconColor="text-amber-500" />
          <MiniStat label="Overdue Invoices" value={invoices.overdue || 0} icon={RiCloseCircleLine} iconColor="text-rose-500" />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Revenue Trend</h3>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wide mt-1">Monthly platform revenue volume</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-secondary">{formatCurrency(revenue.netRevenue)}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Net volume this month</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 min-h-[240px] flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">Loading chart...</div>
          ) : monthlyRev.length === 0 ? (
            <div className="flex-1 min-h-[240px] flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">No transaction data yet</div>
          ) : (
            <div className="mt-6">
              <div className="flex items-end gap-2.5 pb-2 border-b border-gray-100 h-56">
                {monthlyRev.map((m, i) => {
                  const pct = Math.max((m.amount / maxChartVal) * 100, 4);
                  return (
                    <div key={m.month} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ delay: i * 0.03, duration: 0.6, ease: "easeOut" }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-primary/10 to-primary/25 group-hover:from-primary group-hover:to-primary/80 transition-all cursor-pointer relative max-w-[32px] mx-auto shadow-inner group-hover:shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] font-black py-1.5 px-2.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10 transition-opacity border border-gray-700/10">
                          {formatCurrency(m.amount)}
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-3">
                {monthlyRev.map((m) => (
                  <span key={m.month} className="text-[9px] font-black text-slate-600 flex-1 text-center truncate uppercase tracking-widest">
                    {m.month}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Plan Distribution</h3>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wide mt-1">Tenant subscription breakdown</p>
            </div>
            <RiPieChart2Line className="text-primary" size={20} />
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">Loading...</div>
          ) : planDist.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">No plans configured</div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 176 176">
                  <circle cx="88" cy="88" r="75" fill="transparent" stroke="#f8fafc" strokeWidth="16" />
                  {(() => {
                    let offset = 0;
                    const circumference = 2 * Math.PI * 75;
                    return planDist.map((plan, i) => {
                      const pct = planTotal > 0 ? plan.orgCount / planTotal : 0;
                      const dash = pct * circumference;
                      const currentOffset = offset;
                      offset += dash;
                      const colors = ["var(--primary, #6366f1)", "#1e293b", "#f59e0b", "#10b981", "#8b5cf6", "#f43f5e", "#06b6d4"];
                      return (
                        <circle
                          key={plan.id}
                          cx="88"
                          cy="88"
                          r="75"
                          fill="transparent"
                          stroke={colors[i % colors.length]}
                          strokeWidth="16"
                          strokeDasharray={`${dash} ${circumference - dash}`}
                          strokeDashoffset={-currentOffset}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-secondary tracking-tight">{planTotal}</span>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tenants</span>
                </div>
              </div>

              <div className="space-y-1.5 w-full">
                {planDist.map((plan, i) => (
                  <div key={plan.id} className="flex items-center justify-between p-2 rounded-xl border border-gray-100 bg-gray-50/20 text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${PLAN_COLORS[i % PLAN_COLORS.length]}`} />
                      <span>{plan.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-secondary">
                      <span>{plan.orgCount}</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        ({planTotal > 0 ? ((plan.orgCount / planTotal) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
                {(stats?.orgsWithNoPlan || 0) > 0 && (
                  <div className="flex items-center justify-between p-2 rounded-xl border border-gray-100 bg-gray-50/20 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                      <span>No Plan</span>
                    </div>
                    <span>{stats.orgsWithNoPlan}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Orgs Table + Transaction Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Organisations */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/20">
            <div>
              <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Recent Organizations</h3>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wide mt-0.5">Newly onboarded system tenants</p>
            </div>
            <button
              onClick={() => navigate("/superadmin/organisations")}
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              View All <RiArrowRightSLine size={14} />
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Loading...</div>
          ) : recentOrgs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-600 mb-3">No organisations yet</p>
              <button
                onClick={() => navigate("/superadmin/organisations")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <RiAddLine size={16} /> Create Organisation
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-left text-slate-600 font-bold">
                    <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest">Organization</th>
                    <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest">Plan</th>
                    <th className="px-5 py-3 text-center text-[9px] font-black uppercase tracking-widest">Users</th>
                    <th className="px-5 py-3 text-center text-[9px] font-black uppercase tracking-widest">Status</th>
                    <th className="px-5 py-3 text-right text-[9px] font-black uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-bold text-slate-700">
                  {recentOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-black text-xs border border-primary/10">
                            {org.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <span className="text-secondary block font-bold">{org.name}</span>
                            <span className="text-[9px] text-slate-500 font-medium lowercase block mt-0.5">{org.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase border bg-gray-50 text-slate-600 border-gray-200 tracking-wider">
                          {org.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-secondary">{org.userCount}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border capitalize ${STATUS_BADGE[org.status] || "bg-gray-50 text-gray-550 border-gray-200"}`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => navigate("/superadmin/organisations")}
                          className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Transaction & Subscription Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Month Metrics</h3>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wide mt-0.5">Current billing cycle KPIs</p>
              </div>
              <RiLineChartLine className="text-emerald-500" size={18} />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <SummaryRow label="Gross Volume" value={formatCurrency(revenue.grossVolume)} />
                <SummaryRow label="Net Revenue (97%)" value={formatCurrency(revenue.netRevenue)} />
                <SummaryRow label="Transactions" value={txns.total || 0} />
                <SummaryRow label="Success Rate" value={`${txns.successRate || 0}%`} />
                <SummaryRow label="Refund Rate" value={`${txns.refundRate || 0}%`} />
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Subscriptions</p>
                <div className="grid grid-cols-2 gap-2">
                  <SubBadge label="Active" value={subs.active || 0} color="bg-emerald-50 text-emerald-700 border border-emerald-100" />
                  <SubBadge label="Trial" value={subs.trial || 0} color="bg-amber-50 text-amber-700 border border-amber-100" />
                  <SubBadge label="Expired" value={subs.expired || 0} color="bg-slate-50 text-slate-650 border border-slate-200" />
                  <SubBadge label="Cancelled" value={subs.cancelled || 0} color="bg-rose-50 text-rose-700 border border-rose-100" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Recent Alerts</h3>
                <p className="text-[10px] text-slate-650 font-bold uppercase tracking-wide mt-0.5">Platform system events</p>
              </div>
              <button
                onClick={() => navigate("/superadmin/notifications")}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="p-4 flex-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                  No alerts logged
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-2.5">
                      <div className="shrink-0 mt-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full block ${
                          n.type === 'success' ? 'bg-green-500' :
                          n.type === 'warning' ? 'bg-amber-500' :
                          n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-secondary truncate">{n.title}</p>
                        <p className="text-[10px] text-slate-600 font-semibold line-clamp-1 mt-0.5">{n.desc}</p>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-1">{timeAgo(n.created_at || n.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function MiniStat({ label, value, icon: Icon, iconColor }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
      <div className={`p-1.5 rounded-lg bg-gray-50 border border-gray-100 shrink-0 ${iconColor}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-xs font-black text-secondary mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1 text-xs font-bold text-slate-600">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="text-secondary">{value}</span>
    </div>
  );
}

function SubBadge({ label, value, color }) {
  return (
    <div className={`p-3 rounded-xl text-center flex flex-col justify-center ${color}`}>
      <span className="text-lg font-black tracking-tight block leading-none">{value}</span>
      <span className="text-[9px] font-black uppercase tracking-widest opacity-80 mt-1 block">{label}</span>
    </div>
  );
}

export default SuperadminDashboard;
