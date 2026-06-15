import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "react-icons/ri";
import { fetchDashboardStats } from "../../services/superadminDashboard.service";
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
  active: "bg-green-50 text-green-700 border-green-100",
  trial: "bg-amber-50 text-amber-700 border-amber-100",
  suspended: "bg-red-50 text-red-700 border-red-100",
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
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
    className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 group hover:border-primary/20 transition-all"
  >
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg border ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-400 mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-secondary">{value}</span>
        {subtitle && <span className="text-xs font-medium text-gray-400">{subtitle}</span>}
      </div>
    </div>
  </motion.div>
);

const SkeletonCard = () => (
  <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse">
    <div className="w-10 h-10 bg-gray-100 rounded-lg mb-3" />
    <div className="w-24 h-3 bg-gray-100 rounded mb-2" />
    <div className="w-16 h-6 bg-gray-100 rounded" />
  </div>
);

const SuperadminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await fetchDashboardStats();
      setStats(res.data?.data?.stats || res.data?.stats || null);
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
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-semibold text-secondary">Platform Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5 font-medium">
            Real-time summary of platform growth and performance.
          </p>
        </div>
        <button
          onClick={() => loadStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-primary bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all disabled:opacity-50"
        >
          <RiRefreshLine size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(revenue.mrr)}
            subtitle={`ARR ${formatCurrency(revenue.arr)}`}
            icon={RiMoneyPoundCircleLine}
            color="bg-blue-50 text-blue-600 border-blue-100"
            delay={0}
          />
          <StatCard
            title="Organisations"
            value={orgs.total || 0}
            subtitle={orgs.newThisMonth > 0 ? `+${orgs.newThisMonth} this month` : undefined}
            icon={RiOrganizationChart}
            color="bg-green-50 text-green-600 border-green-100"
            delay={0.1}
          />
          <StatCard
            title="Platform Users"
            value={formatNumber(users.total)}
            subtitle={users.newThisMonth > 0 ? `+${users.newThisMonth} this month` : undefined}
            icon={RiGroupLine}
            color="bg-purple-50 text-purple-600 border-purple-100"
            delay={0.2}
          />
          <StatCard
            title="Active Subscriptions"
            value={subs.active || 0}
            subtitle={subs.churnRate > 0 ? `${subs.churnRate}% churn` : "0% churn"}
            icon={RiBarChartLine}
            color="bg-amber-50 text-amber-600 border-amber-100"
            delay={0.3}
          />
        </div>
      )}

      {/* Secondary Stats Row */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <MiniStat label="Active Orgs" value={orgs.active || 0} icon={RiCheckboxCircleLine} iconColor="text-green-500" />
          <MiniStat label="Trial Orgs" value={orgs.trial || 0} icon={RiTimeLine} iconColor="text-amber-500" />
          <MiniStat label="Suspended" value={orgs.suspended || 0} icon={RiCloseCircleLine} iconColor="text-red-500" />
          <MiniStat label="Gross Volume" value={formatCurrency(revenue.grossVolume)} icon={RiExchangeLine} iconColor="text-blue-500" />
          <MiniStat label="Pending Invoices" value={invoices.pending || 0} icon={RiAlertLine} iconColor="text-amber-500" />
          <MiniStat label="Overdue Invoices" value={invoices.overdue || 0} icon={RiCloseCircleLine} iconColor="text-red-500" />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-secondary">Revenue Trend</h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Monthly revenue over the last 12 months</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-secondary">{formatCurrency(revenue.netRevenue)}</p>
              <p className="text-xs text-gray-400">Net this month</p>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 min-h-[200px] flex items-center justify-center text-gray-300 text-sm">Loading chart...</div>
          ) : monthlyRev.length === 0 ? (
            <div className="flex-1 min-h-[200px] flex items-center justify-center text-gray-300 text-sm">No transaction data yet</div>
          ) : (
            <>
              <div className="flex-1 min-h-[200px] flex items-end gap-1.5 pb-2 border-b border-gray-100">
                {monthlyRev.map((m, i) => (
                  <div key={m.month} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max((m.amount / maxChartVal) * 100, 2)}%` }}
                      transition={{ delay: i * 0.04, duration: 0.6 }}
                      className="w-full bg-primary/15 rounded-t group-hover:bg-primary transition-all cursor-pointer relative max-w-[40px] mx-auto"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                        {formatCurrency(m.amount)}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {monthlyRev.map((m, i) => (
                  <span key={m.month} className="text-[10px] font-semibold text-gray-400 flex-1 text-center truncate">
                    {m.month}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-secondary">Plan Distribution</h3>
            <RiPieChart2Line className="text-primary" size={20} />
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">Loading...</div>
          ) : planDist.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">No plans configured</div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 176 176">
                  <circle cx="88" cy="88" r="75" fill="transparent" stroke="#f3f4f6" strokeWidth="18" />
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
                          cx="88" cy="88" r="75"
                          fill="transparent"
                          stroke={colors[i % colors.length]}
                          strokeWidth="18"
                          strokeDasharray={`${dash} ${circumference - dash}`}
                          strokeDashoffset={-currentOffset}
                          strokeLinecap="butt"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-semibold text-secondary">{planTotal}</span>
                  <span className="text-xs font-bold text-gray-400">Tenants</span>
                </div>
              </div>

              <div className="grid grid-cols-1 w-full gap-2">
                {planDist.map((plan, i) => (
                  <div key={plan.id} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-50 bg-gray-50/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${PLAN_COLORS[i % PLAN_COLORS.length]}`} />
                      <span className="text-sm font-bold text-gray-600">{plan.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-secondary">{plan.orgCount}</span>
                      <span className="text-xs text-gray-400">
                        ({planTotal > 0 ? ((plan.orgCount / planTotal) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
                {(stats?.orgsWithNoPlan || 0) > 0 && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-50 bg-gray-50/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                      <span className="text-sm font-bold text-gray-400">No Plan</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-400">{stats.orgsWithNoPlan}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Orgs Table + Transaction Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Organisations */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <h3 className="text-sm font-semibold text-secondary">Recent Organisations</h3>
            <button
              onClick={() => navigate("/superadmin/organisations")}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              View All <RiArrowRightSLine size={14} />
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-300 text-sm">Loading...</div>
          ) : recentOrgs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400 mb-3">No organisations yet</p>
              <button
                onClick={() => navigate("/superadmin/organisations")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RiAddLine size={16} /> Create Organisation
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Organisation</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Plan</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-400">Users</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-400">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                            {org.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <span className="font-bold text-secondary text-xs block">{org.name}</span>
                            <span className="text-[10px] text-gray-400">{org.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border bg-gray-50 text-gray-600 border-gray-100">
                          {org.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-xs font-medium text-secondary">{org.userCount}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_BADGE[org.status] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => navigate("/superadmin/organisations")}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Manage &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transaction & Subscription Summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
            <h3 className="text-sm font-semibold text-secondary">This Month</h3>
          </div>
          <div className="p-4 flex-1 flex flex-col gap-3">
            <SummaryRow label="Gross Volume" value={formatCurrency(revenue.grossVolume)} />
            <SummaryRow label="Net Revenue" value={formatCurrency(revenue.netRevenue)} />
            <SummaryRow label="Transactions" value={txns.total || 0} />
            <SummaryRow label="Success Rate" value={`${txns.successRate || 0}%`} />
            <SummaryRow label="Refund Rate" value={`${txns.refundRate || 0}%`} />

            <div className="border-t border-gray-100 pt-3 mt-1">
              <p className="text-xs font-bold text-gray-400 mb-2">Subscriptions</p>
              <div className="grid grid-cols-2 gap-2">
                <SubBadge label="Active" value={subs.active || 0} color="bg-green-50 text-green-700" />
                <SubBadge label="Trial" value={subs.trial || 0} color="bg-amber-50 text-amber-700" />
                <SubBadge label="Expired" value={subs.expired || 0} color="bg-gray-50 text-gray-500" />
                <SubBadge label="Cancelled" value={subs.cancelled || 0} color="bg-red-50 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function MiniStat({ label, value, icon: Icon, iconColor }) {
  return (
    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
      <Icon size={18} className={iconColor} />
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-bold text-secondary">{value}</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs font-medium text-gray-400">{label}</span>
      <span className="text-sm font-bold text-secondary">{value}</span>
    </div>
  );
}

function SubBadge({ label, value, color }) {
  return (
    <div className={`px-3 py-2 rounded-lg text-center ${color}`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] font-semibold">{label}</p>
    </div>
  );
}

export default SuperadminDashboard;
