import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import useDownloads from "../../hooks/useDownloads";
import {
  FiClipboard, FiCheckCircle, FiXCircle, FiClock,
  FiFileText, FiDownload, FiRefreshCw,
} from "react-icons/fi";
import Button from "../../components/Button";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getActionBadge = (action = "") => {
  const a = action.toLowerCase();
  if (a.includes("login"))   return "bg-purple-100 text-purple-800";
  if (a.includes("case") && a.includes("creat")) return "bg-blue-100 text-blue-800";
  if (a.includes("updat"))   return "bg-green-100 text-green-800";
  if (a.includes("payment")) return "bg-yellow-100 text-yellow-700";
  if (a.includes("delet"))   return "bg-red-100 text-red-700";
  if (a.includes("user"))    return "bg-indigo-100 text-indigo-800";
  return "bg-gray-100 text-gray-700";
};

const getStatusBadge = (status = "") => {
  const s = status.toLowerCase();
  if (s === "success") return "bg-green-100 text-green-800";
  if (s === "failed")  return "bg-red-100 text-red-800";
  if (s === "pending") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-600";
};

// ─── Constants ────────────────────────────────────────────────────────────────

const selectClass =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30";

const DATE_OPTIONS = [
  { value: "all",     label: "All time"      },
  { value: "last7",   label: "Last 7 days"   },
  { value: "last30",  label: "Last 30 days"  },
  { value: "last90",  label: "Last 3 months" },
  { value: "last365", label: "Last year"     },
];

const ACTION_OPTIONS = [
  { value: "all",               label: "All actions"        },
  { value: "login",             label: "Login / logout"     },
  { value: "Case Created",      label: "Case created"       },
  { value: "Case Updated",      label: "Case updated"       },
  { value: "Payment Processed", label: "Payment processed"  },
  { value: "user_mgmt",         label: "User management"    },
];

const STATUS_OPTIONS = [
  { value: "all",     label: "All status" },
  { value: "Success", label: "Success"    },
  { value: "Failed",  label: "Failed"     },
  { value: "Pending", label: "Pending"    },
];

const TABLE_COLS = ["Timestamp", "User", "Action", "Resource", "IP Address", "Status", "Details"];

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminAuditLogs() {
  const [filters, setFilters] = useState({
    dateRange:  "last7",
    actionType: "all",
    user:       "all",
    status:     "all",
  });

  const [logs,       setLogs]       = useState([]);
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error,      setError]      = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const { exportAuditLogsList } = useDownloads();

  const debounceRef = useRef(null);

  const listQueryParams = useCallback(() => {
    const params = {
      dateRange: filters.dateRange !== "all" ? filters.dateRange : undefined,
      status:    filters.status    !== "all" ? filters.status    : undefined,
    };
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    return params;
  }, [filters]);

  // ─── Fetch stats ────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/api/audit-logs/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error("Audit stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ─── Fetch logs with current filters ────────────────────────────────────────
  const fetchLogs = useCallback(async (currentFilters = filters, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 50,
        dateRange:  currentFilters.dateRange,
        actionType: currentFilters.actionType !== "all" ? currentFilters.actionType : undefined,
        user:       currentFilters.user       !== "all" ? currentFilters.user       : undefined,
        status:     currentFilters.status     !== "all" ? currentFilters.status     : undefined,
      };
      // Strip undefined
      Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);

      const res = await api.get("/api/audit-logs", { params });
      const data = res.data.data;
      setLogs(Array.isArray(data) ? data : []);
      if (res.data.meta?.pagination) {
        setPagination(res.data.meta.pagination);
      }
    } catch (err) {
      console.error("Audit logs error:", err);
      setError("Failed to load audit logs. Please try again.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchLogs(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when filters change (debounced for user search)
  const handleFilter = useCallback((e) => {
    const { name, value } = e.target;
    const next = { ...filters, [name]: value };
    setFilters(next);

    if (name === "user") {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchLogs(next), 400);
    } else {
      fetchLogs(next);
    }
  }, [filters, fetchLogs]);

  const handleUserSearch = useCallback((e) => {
    const value = e.target.value;
    const next = { ...filters, user: value || "all" };
    setFilters(next);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchLogs(next), 400);
  }, [filters, fetchLogs]);

  // ─── Export ─────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    const result = await exportAuditLogsList(listQueryParams());
    if (!result.ok) {
      console.error("Export failed:", result.error);
      setError("Export failed. Please try again.");
    }
  };

  // ─── Refresh ─────────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    fetchStats();
    fetchLogs(filters);
  }, [fetchStats, fetchLogs, filters]);

  // ─── Stat cards ──────────────────────────────────────────────────────────────
  const statCards = [
    { label: "Total activities", bg: "bg-blue-100",   color: "text-blue-600",   Icon: FiClipboard,   value: stats?.total_activities ?? 0 },
    { label: "Successful",       bg: "bg-green-100",  color: "text-green-600",  Icon: FiCheckCircle, value: stats?.successful_count  ?? 0 },
    { label: "Failed",           bg: "bg-red-100",    color: "text-red-600",    Icon: FiXCircle,     value: stats?.failed_count      ?? 0 },
    { label: "Today",            bg: "bg-purple-100", color: "text-purple-600", Icon: FiClock,       value: stats?.today_count       ?? 0 },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-10">

      {/* Header */}
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
            <FiFileText className="text-primary shrink-0" size={34} />
            Audit logs
          </h1>
          <p className="text-primary font-bold text-sm mt-1">
            Track system activities and user actions
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl inline-flex items-center gap-2"
            onClick={handleExport}
            disabled={loading}
          >
            <FiDownload size={15} />
            Export audit
          </Button>
          <Button
            type="button"
            className="rounded-xl inline-flex items-center gap-2"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Run audit
          </Button>
        </div>
      </motion.div>

      {/* Error banner */}
      {error && (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-xl p-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-red-800">
            <span className="font-bold">Error:</span> {error}
          </p>
        </motion.div>
      )}

      {/* Stat cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statCards.map(({ label, bg, color, Icon, value }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`p-3 ${bg} rounded-lg shrink-0`}>
              <Icon className={`${color} h-6 w-6`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-black text-secondary">
                {statsLoading ? (
                  <span className="inline-block w-8 h-6 bg-gray-100 rounded animate-pulse" />
                ) : (
                  value
                )}
              </p>
            </div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shrink-0" />
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
          Filters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Date range */}
          <div className="flex flex-col gap-1">
            <label htmlFor="audit-dateRange" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Date range
            </label>
            <select
              id="audit-dateRange"
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilter}
              className={selectClass}
            >
              {DATE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Action type */}
          <div className="flex flex-col gap-1">
            <label htmlFor="audit-actionType" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Action type
            </label>
            <select
              id="audit-actionType"
              name="actionType"
              value={filters.actionType}
              onChange={handleFilter}
              className={selectClass}
            >
              {ACTION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* User search */}
          <div className="flex flex-col gap-1">
            <label htmlFor="audit-user" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              User search
            </label>
            <input
              type="text"
              id="audit-user"
              placeholder="Search by name…"
              value={filters.user === "all" ? "" : filters.user}
              onChange={handleUserSearch}
              className={selectClass}
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label htmlFor="audit-status" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Status
            </label>
            <select
              id="audit-status"
              name="status"
              value={filters.status}
              onChange={handleFilter}
              className={selectClass}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          {loading ? (
            <span className="animate-pulse">Loading…</span>
          ) : (
            <>
              Showing <span className="font-bold text-secondary">{logs.length}</span> of{" "}
              <span className="font-bold text-secondary">{pagination.total}</span> entries
            </>
          )}
        </p>
      </motion.div>

      {/* Table */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-secondary">Recent activity</h3>
          {loading && (
            <span className="text-xs text-gray-400 animate-pulse flex items-center gap-1.5">
              <FiRefreshCw size={12} className="animate-spin" /> Loading…
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {TABLE_COLS.map(col => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                /* Skeleton rows */
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {TABLE_COLS.map(c => (
                      <td key={c} className="px-6 py-4">
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <FiClipboard className="mx-auto text-gray-200 mb-3" size={36} />
                    <p className="text-sm text-gray-400 font-medium">No entries match the current filters.</p>
                    <p className="text-xs text-gray-300 mt-1">Try changing the date range or clearing filters.</p>
                  </td>
                </tr>
              ) : (
                logs.map((row, idx) => (
                  <motion.tr
                    key={row.id ?? idx}
                    className="hover:bg-gray-50/70 transition-colors"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                  >
                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                      {row.timestamp}
                    </td>

                    {/* User */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-secondary">
                            {row.initials || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-secondary leading-tight">
                            {row.userName || "System"}
                          </p>
                          <p className="text-xs text-gray-400">{row.role || ""}</p>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getActionBadge(row.action)}`}>
                        {row.action || "—"}
                      </span>
                    </td>

                    {/* Resource */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {row.resourceType || "—"}
                    </td>

                    {/* IP */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                      {row.ipAddress || "—"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(row.status)}`}>
                        {row.status || "—"}
                      </span>
                    </td>

                    {/* Details */}
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-[220px] truncate">
                      {row.details || "—"}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {!loading && pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
            <span>
              Page <span className="font-bold text-secondary">{pagination.page}</span> of{" "}
              <span className="font-bold text-secondary">{pagination.pages}</span>
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchLogs(filters, pagination.page - 1)}
                className="px-3 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
              >
                ← Prev
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchLogs(filters, pagination.page + 1)}
                className="px-3 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
