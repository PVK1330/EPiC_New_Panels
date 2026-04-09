import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
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

const stats = [
  {
    label: "Total activities",
    value: "1,234",
    bg: "bg-blue-100",
    color: "text-blue-600",
    Icon: FiClipboard,
  },
  {
    label: "Successful",
    value: "1,198",
    bg: "bg-green-100",
    color: "text-green-600",
    Icon: FiCheckCircle,
  },
  {
    label: "Failed",
    value: "36",
    bg: "bg-red-100",
    color: "text-red-600",
    Icon: FiXCircle,
  },
  {
    label: "Today",
    value: "89",
    bg: "bg-purple-100",
    color: "text-purple-600",
    Icon: FiClock,
  },
];

const auditLogs = [
  {
    timestamp: "2024-01-20 14:35:22",
    initials: "JD",
    user: "John Doe",
    role: "Administrator",
    action: "Case Created",
    actionClass: "bg-blue-100 text-blue-800",
    resource: "Case #CAS-045",
    ip: "192.168.1.100",
    status: "Success",
    statusClass: "bg-green-100 text-green-800",
    details: "H-1B visa case created for Tech Solutions Ltd",
  },
  {
    timestamp: "2024-01-20 14:28:15",
    initials: "EM",
    user: "Emily Martinez",
    role: "Caseworker",
    action: "Case Updated",
    actionClass: "bg-green-100 text-green-800",
    resource: "Case #CAS-042",
    ip: "192.168.1.105",
    status: "Success",
    statusClass: "bg-green-100 text-green-800",
    details: 'Status changed to "Approved"',
  },
  {
    timestamp: "2024-01-20 14:15:33",
    initials: "JD",
    user: "John Doe",
    role: "Administrator",
    action: "Login",
    actionClass: "bg-purple-100 text-purple-800",
    resource: "System",
    ip: "192.168.1.100",
    status: "Success",
    statusClass: "bg-green-100 text-green-800",
    details: "User logged in successfully",
  },
  {
    timestamp: "2024-01-20 13:45:12",
    initials: "JD",
    user: "John Doe",
    role: "Administrator",
    action: "Payment Processed",
    actionClass: "bg-yellow-100 text-yellow-800",
    resource: "Invoice #INV-023",
    ip: "192.168.1.100",
    status: "Success",
    statusClass: "bg-green-100 text-green-800",
    details: "Payment of £5,000 processed for Tech Solutions Ltd",
  },
  {
    timestamp: "2024-01-20 13:30:45",
    initials: "SW",
    user: "Sophia Wilson",
    role: "Caseworker",
    action: "Login Failed",
    actionClass: "bg-red-100 text-red-800",
    resource: "System",
    ip: "192.168.1.108",
    status: "Failed",
    statusClass: "bg-red-100 text-red-800",
    details: "Invalid password - 3rd attempt",
  },
  {
    timestamp: "2024-01-20 12:15:20",
    initials: "JD",
    user: "John Doe",
    role: "Administrator",
    action: "User Created",
    actionClass: "bg-indigo-100 text-indigo-800",
    resource: "User: james.davis@company.com",
    ip: "192.168.1.100",
    status: "Success",
    statusClass: "bg-green-100 text-green-800",
    details: "New caseworker account created",
  },
];

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
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "last90", label: "Last 3 months" },
  { value: "last365", label: "Last year" },
  { value: "custom", label: "Custom range" },
];

const ACTION_OPTIONS = [
  { value: "all", label: "All actions" },
  { value: "login", label: "Login / logout" },
  { value: "Case Created", label: "Case created" },
  { value: "Case Updated", label: "Case updated" },
  { value: "Payment Processed", label: "Payment processed" },
  { value: "user_mgmt", label: "User management" },
];

const USER_OPTIONS = [
  { value: "all", label: "All users" },
  { value: "John Doe", label: "John Doe" },
  { value: "Emily Martinez", label: "Emily Martinez" },
  { value: "James Davis", label: "James Davis" },
  { value: "Sophia Wilson", label: "Sophia Wilson" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "Success", label: "Success" },
  { value: "Failed", label: "Failed" },
  { value: "Pending", label: "Pending" },
];

function matchesAction(filter, action) {
  if (filter === "all") return true;
  if (filter === "login") return action.includes("Login");
  if (filter === "user_mgmt") return action.includes("User");
  return action === filter;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminAuditLogs() {
  const [filters, setFilters] = useState({
    dateRange: "last7",
    actionType: "all",
    user: "all",
    status: "all",
  });
  const [lastRunAt, setLastRunAt] = useState(null);

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((row) => {
      if (!matchesAction(filters.actionType, row.action)) return false;
      if (filters.user !== "all" && row.user !== filters.user) return false;
      if (filters.status !== "all" && row.status !== filters.status)
        return false;
      return true;
    });
  }, [filters]);

  const runAudit = useCallback(() => {
    setLastRunAt(new Date());
  }, []);

  const exportAudit = useCallback(() => {
    const headers = TABLE_COLS.join(",");
    const lines = filteredLogs.map((row) =>
      [
        row.timestamp,
        `"${row.user}"`,
        `"${row.action}"`,
        `"${row.resource}"`,
        row.ip,
        row.status,
        `"${row.details.replace(/"/g, '""')}"`,
      ].join(","),
    );
    const csv = [headers, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredLogs]);

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
            >
              <FiDownload size={16} aria-hidden />
              Export audit
            </Button>
            <Button
              type="button"
              className="rounded-xl inline-flex items-center gap-2"
              onClick={runAudit}
            >
              <FiPlay size={16} aria-hidden />
              Run audit
            </Button>
          </div>
        </div>
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
              {ACTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="audit-user"
              className="text-xs font-bold text-gray-600 uppercase tracking-wide"
            >
              User
            </label>
            <select
              id="audit-user"
              name="user"
              value={filters.user}
              onChange={handleFilter}
              className={selectClass}
            >
              {USER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
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
          Showing{" "}
          <span className="font-bold text-secondary">
            {filteredLogs.length}
          </span>{" "}
          of {auditLogs.length} entries (mock data).
          {lastRunAt && (
            <span className="ml-2">
              · Last audit run:{" "}
              <span className="font-semibold text-gray-600">
                {lastRunAt.toLocaleString()}
              </span>
            </span>
          )}
        </p>
      </motion.div>

      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-secondary">Recent activity</h3>
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
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-gray-400"
                  >
                    No entries match the current filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(
                  (
                    {
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
                      key={`${timestamp}-${user}-${action}-${index}`}
                      className="hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 + index * 0.06 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                        {timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-secondary">
                              {initials}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-secondary">
                              {user}
                            </p>
                            <p className="text-xs text-gray-500">{role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${actionClass}`}
                        >
                          {action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {resource}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                        {ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusClass}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {details}
                      </td>
                    </motion.tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map(({ label, value, bg, color, Icon }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`p-3 ${bg} rounded-lg shrink-0`}>
              <Icon className={`${color} h-6 w-6`} aria-hidden />
            </div>
            <div>
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-2xl font-black text-secondary">{value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
