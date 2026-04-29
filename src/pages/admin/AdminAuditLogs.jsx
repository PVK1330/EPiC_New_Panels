<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react";
=======
import { useState, useMemo, useCallback, useEffect } from "react";
>>>>>>> 48aee01c18e1def51f2c3d6688e1237b6bc89d06
import { motion } from "framer-motion";
import axios from "axios";
import {
  FiClipboard,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFileText,
  FiDownload,
  FiPlay,
} from "react-icons/fi";
import Button from "../../components/Button";
<<<<<<< HEAD

const API_BASE_URL = "http://localhost:5000";

const getInitials = (name) => {
  if (!name) return "N/A";
  return name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};



const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase() || "";
  if (statusLower === "success" || statusLower === "completed")
    return "bg-green-100 text-green-800";
  if (statusLower === "failed" || statusLower === "error")
    return "bg-red-100 text-red-800";
  if (statusLower === "pending") return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-800";
};
=======
import { getAuditLogs, getAuditActionTypes, exportAuditLogs } from "../../services/auditApi";
>>>>>>> 48aee01c18e1def51f2c3d6688e1237b6bc89d06

const TABLE_COLS = [
  "Timestamp",
  "User",
  "Action",
  "Resource",
  "IP Address",
  "Status",
  "Details",
];

const selectClass =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30";

const DATE_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "last90", label: "Last 3 months" },
  { value: "last365", label: "Last year" },
];

const ACTION_OPTIONS = [
  { value: "all", label: "All actions" },
<<<<<<< HEAD
  { value: "login", label: "Login / logout" },
  { value: "Case Created", label: "Case created" },
  { value: "Case Updated", label: "Case updated" },
  { value: "Payment Processed", label: "Payment processed" },
  { value: "user_mgmt", label: "User management" },
];

const USER_OPTIONS = [
  { value: "all", label: "All users" },
=======
>>>>>>> 48aee01c18e1def51f2c3d6688e1237b6bc89d06
];

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "Success", label: "Success" },
  { value: "Failed", label: "Failed" },
  { value: "Pending", label: "Pending" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// API Functions


const exportAuditLogs = async (filters) => {
  try {
    const params = {
      date_range: filters.dateRange !== "all" ? filters.dateRange : undefined,
      action: filters.actionType !== "all" ? filters.actionType : undefined,
      user_id: filters.user !== "all" ? filters.user : undefined,
      status: filters.status !== "all" ? filters.status : undefined,
    };

    // Remove undefined values
    Object.keys(params).forEach(
      (key) => params[key] === undefined && delete params[key]
    );

    const response = await axios.get(
      `${API_BASE_URL}/api/audit-logs/export`,
      {
        params,
        responseType: "blob",
      }
    );

    // Create a download link for the CSV file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `audit-export-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    throw error;
  }
};

export default function AdminAuditLogs() {
  

  const [filters, setFilters] = useState({
    dateRange: "last7",
    actionType: "all",
    user: "all",
    status: "all",
  });
<<<<<<< HEAD

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRunAt, setLastRunAt] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [Auditstats, setAuditStats] = useState([])
  const fetchAuditStats = async () => {
 
 try {
    const response = await axios.get(`${API_BASE_URL}/api/audit-logs/stats`, {
      withCredentials: true,
    });
    setAuditStats(response.data.data);
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    throw error;
  }
};
const fetchAuditLogs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/audit-logs`, {
      withCredentials: true,
    });
    console.log("Audit logs response:", response.data.data);
    setLogs(response.data.data);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
};

useEffect(()=>{
  fetchAuditStats(),
  fetchAuditLogs()
},[])

const statCards = [
  {
    label: "Total activities",
    bg: "bg-blue-100",
    color: "text-blue-600",
    Icon: FiClipboard,
    filterValue:Auditstats.total_activities,
    type: "total",
  },
  {
    label: "Successful",
    bg: "bg-green-100",
    color: "text-green-600",
    Icon: FiCheckCircle,
    filterValue: Auditstats.successful_count,
    type: "success",
  },
  {
    label: "Failed",
    bg: "bg-red-100",
    color: "text-red-600",
    Icon: FiXCircle,
    filterValue:Auditstats.failed_count,
    type: "failed",
  },
  {
    label: "Today",
    bg: "bg-purple-100",
    color: "text-purple-600",
    Icon: FiClock,
    filterValue: Auditstats.today_count,
    type: "today",
  },
];

=======
  
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    success: 0,
    failed: 0,
    today: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRunAt, setLastRunAt] = useState(new Date());

  const [dynamicActions, setDynamicActions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });

  const fetchActions = useCallback(async () => {
    try {
      const res = await getAuditActionTypes();
      if (res.data?.status === 'success') {
        setDynamicActions(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch actions:", err);
    }
  }, []);

  const fetchLogs = useCallback(async (targetPage = pagination.page) => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        page: targetPage,
        limit: 15,
        dateRange: filters.dateRange,
        actionType: filters.actionType,
        user: filters.user,
        status: filters.status
      });
      
      if (res.data?.status === 'success') {
        setLogs(res.data.data.logs);
        setStatistics(res.data.data.statistics);
        setPagination(res.data.data.pagination);
        setLastRunAt(new Date());
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch audit logs.");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  useEffect(() => {
    fetchLogs(1); // Reset to page 1 when filters change
  }, [filters]);

  const handlePageChange = (newPage) => {
    fetchLogs(newPage);
  };
>>>>>>> 48aee01c18e1def51f2c3d6688e1237b6bc89d06

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

<<<<<<< HEAD

  const runAudit = useCallback(() => {
    setLastRunAt(new Date());
  }, []);

  const exportAudit = useCallback(async () => {
    setExporting(true);
    try {
      await exportAuditLogs(filters);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Failed to export audit logs");
    } finally {
      setExporting(false);
    }
  }, [filters]);

=======
  const handleStatCardClick = (filterKey, filterValue) => {
    setFilters((prev) => ({ ...prev, [filterKey]: filterValue }));
  };

  const exportAudit = async () => {
    try {
      const res = await exportAuditLogs({
        dateRange: filters.dateRange,
        status: filters.status
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const statsCards = [
    {
      label: "Total activities",
      value: statistics.total,
      bg: "bg-blue-100",
      color: "text-blue-600",
      Icon: FiClipboard,
      filterKey: "status",
      filterValue: "all",
    },
    {
      label: "Successful",
      value: statistics.success,
      bg: "bg-green-100",
      color: "text-green-600",
      Icon: FiCheckCircle,
      filterKey: "status",
      filterValue: "Success",
    },
    {
      label: "Failed",
      value: statistics.failed,
      bg: "bg-red-100",
      color: "text-red-600",
      Icon: FiXCircle,
      filterKey: "status",
      filterValue: "Failed",
    },
    {
      label: "Today",
      value: statistics.today,
      bg: "bg-purple-100",
      color: "text-purple-600",
      Icon: FiClock,
      filterKey: "dateRange",
      filterValue: "last7",
    },
  ];
>>>>>>> 48aee01c18e1def51f2c3d6688e1237b6bc89d06

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
            <FiFileText className="text-primary shrink-0" size={36} />
            Audit logs
          </h1>
          <p className="text-primary font-bold text-sm mt-1">
            Track system activities and user actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl inline-flex items-center gap-2"
              onClick={exportAudit}
              disabled={exporting || loading}
            >
              <FiDownload size={16} aria-hidden />
              {exporting ? "Exporting..." : "Export audit"}
            </Button>
            <Button
              type="button"
              className="rounded-xl inline-flex items-center gap-2"
              onClick={fetchLogs}
            >
              <FiPlay size={16} aria-hidden />
              Run audit
            </Button>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-xl p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-red-800">
            <span className="font-bold">Error:</span> {error}
          </p>
        </motion.div>
      )}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
<<<<<<< HEAD
        {statCards.map(({ label, value, bg, color, Icon, filterValue }) => {
=======
        {statsCards.map(({ label, value, bg, color, Icon, filterKey, filterValue }) => {
          const isActive = filters[filterKey] === filterValue;
>>>>>>> 48aee01c18e1def51f2c3d6688e1237b6bc89d06
          return (
            <motion.div
              key={label}
              className={`bg-white p-6 rounded-2xl  shadow-sm flex items-center gap-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 "border-gray-100 hover:border-gray-200"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`p-3 ${bg} rounded-lg shrink-0 transition-all duration-200 ${
                 "ring-2 ring-white ring-offset-2"
              }`}>
                <Icon className={`${color} h-6 w-6`} aria-hidden />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-2xl font-black text-secondary">{value}</p>
              </div>
             
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  {filterValue !== "all" && (
                    <span className="ml-2 text-xl font-semibold text-primary">
                      {filterValue}
                    </span>
                  )}
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 mb-4">
          <h2 className="text-sm font-black text-secondary uppercase tracking-wide">
            Filters
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="audit-dateRange"
              className="text-xs font-bold text-gray-600 uppercase tracking-wide"
            >
              Date range
            </label>
            <select
              id="audit-dateRange"
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilter}
              className={selectClass}
            >
              {DATE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="audit-actionType"
              className="text-xs font-bold text-gray-600 uppercase tracking-wide"
            >
              Action type
            </label>
            <select
              id="audit-actionType"
              name="actionType"
              value={filters.actionType}
              onChange={handleFilter}
              className={selectClass}
            >
              <option value="all">All actions</option>
              {dynamicActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="audit-user"
              className="text-xs font-bold text-gray-600 uppercase tracking-wide"
            >
              User Search
            </label>
            <input
              type="text"
              id="audit-user"
              name="user"
              value={filters.user === 'all' ? '' : filters.user}
              onChange={(e) => setFilters(prev => ({...prev, user: e.target.value || 'all'}))}
              placeholder="Search by name..."
              className={selectClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="audit-status"
              className="text-xs font-bold text-gray-600 uppercase tracking-wide"
            >
              Status
            </label>
            <select
              id="audit-status"
              name="status"
              value={filters.status}
              onChange={handleFilter}
              className={selectClass}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
<<<<<<< HEAD
          {loading ? (
            <span>Loading audit logs...</span>
          ) : (
            <>
              Showing{" "}
              <span className="font-bold text-secondary">
                {logs.length}
              </span>{" "}
              entries.
              {lastRunAt && (
                <span className="ml-2">
                  · Last audit run:{" "}
                  <span className="font-semibold text-gray-600">
                    {lastRunAt.toLocaleString()}
                  </span>
                </span>
              )}
            </>
=======
          Showing{" "}
          <span className="font-bold text-secondary">
            {logs.length}
          </span>{" "}
          entries.
          {lastRunAt && (
            <span className="ml-2">
              · Last audit run:{" "}
              <span className="font-semibold text-gray-600">
                {lastRunAt.toLocaleString()}
              </span>
            </span>
>>>>>>> 48aee01c18e1def51f2c3d6688e1237b6bc89d06
          )}
        </p>
      </motion.div>

      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-black text-secondary">Recent activity</h3>
          {loading && <span className="text-sm text-gray-400 animate-pulse">Loading...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {TABLE_COLS.map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
<<<<<<< HEAD
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <span className="text-sm text-gray-500 ml-2">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
=======
              {logs.length === 0 ? (
>>>>>>> 48aee01c18e1def51f2c3d6688e1237b6bc89d06
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-gray-400"
                  >
                    {loading ? "Loading logs..." : "No entries match the current filters."}
                  </td>
                </tr>
              ) : (
<<<<<<< HEAD
                logs.map((data, index) => {
                  return (
                    <motion.tr
                      key={index}
=======
                logs.map(
                  (
                    {
                      id,
                      timestamp,
                      initials,
                      user,
                      role,
                      action,
                      actionClass,
                      resource,
                      ip,
                      status,
                      statusClass,
                      details,
                    },
                    index,
                  ) => (
                    <motion.tr
                      key={id || `${timestamp}-${user}-${action}-${index}`}
>>>>>>> 48aee01c18e1def51f2c3d6688e1237b6bc89d06
                      className="hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 + index * 0.06 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                        {data.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-secondary">
                              {data.id}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-secondary">
                              {data.userName}
                            </p>
                            <p className="text-xs text-gray-500">{""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full `}
                        >

                          {data.action == "LOGIN" ? (
                            <span className={`bg-purple-100 text-purple-800`}>
                              {data.action}
                            </span>
                          ) : data.action == "CASE CREATED" ? (
                            <span className={`bg-blue-100 text-blue-800`}> 
                              {data.action}
                            </span>
                          ) : data.action == "CASE UPDATED" ? (
                            <span className={`bg-green-100 text-green-800`}>
                              {data.action}
                            </span>
                          ) : data.action == "PAYMENT PROCESSED" ? (
                            <span className={`bg-yellow-100 text-yellow-500`}>
                              {data.action}
                            </span>
                          ) : (
                            <span className={`bg-gray-100 text-gray-800`}>
                              {data.action}
                              </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {data.resourceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                        {data.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full`}
                        >
                          {data.status == "SUCCESS" ? (
                            <span className={`bg-green-100 text-green-800`}>
                              {data.status}
                            </span>
                          ) : data.status == "FAILED" ? (
                            <span className={`bg-red-100 text-red-800`}>
                              {data.status}
                            </span>
                          ):""}
                        </span>
                      </td>
<<<<<<< HEAD
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {data.details}
=======
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={details}>
                        {details}
>>>>>>> 48aee01c18e1def51f2c3d6688e1237b6bc89d06
                      </td>
                    </motion.tr>
                  )}) 
        
              )}
            </tbody>
          </table>
        </div>
<<<<<<< HEAD
      </motion.div>

      </div>
=======
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-semibold text-secondary">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-secondary">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-secondary">{pagination.total}</span> entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="rounded-lg"
              >
                Previous
              </Button>
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                    pagination.page === i + 1
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              )).slice(Math.max(0, pagination.page - 3), Math.min(pagination.pages, pagination.page + 2))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="rounded-lg"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
>>>>>>> 48aee01c18e1def51f2c3d6688e1237b6bc89d06
  );
}
