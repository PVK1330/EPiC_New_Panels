import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollText,
  Download,
  Search,
  Filter,
  X,
  ArrowDown,
  Loader2,
} from "lucide-react";
import Button from "../../components/Button";
import DatePicker from "../../components/DatePicker";
import { getAuditLogs, exportAuditLogs } from "../../services/audit.service";
import { formatDateTime } from "../../utils/datetime";

const ENTITY_OPTIONS = [
  { value: "", label: "All Entities" },
  { value: "CandidateApplication", label: "Candidate Profile" },
  { value: "SponsorProfile", label: "Sponsor Profile" },
  { value: "User", label: "User Account" },
  { value: "Case", label: "Case" },
];

const TABLE_COLS = ["Timestamp", "User", "Entity", "Field", "Change", "IP"];

const fmtTs = (ts) => formatDateTime(ts, { fallback: ts || "—" });

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [meta, setMeta] = useState({ page: 1, total: 0, pages: 1 });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    startDate: "",
    endDate: "",
    entityType: "",
    action: "",
  });

  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAuditLogs(filters);
      setLogs(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error("Error fetching audit logs", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleQuickDate = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setFilters((prev) => ({
      ...prev,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      page: 1,
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAuditLogs({ ...filters, page: undefined, limit: undefined });
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tight flex items-center gap-3">
            <ScrollText className="text-primary" size={30} />
            Audit Logs
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track every change made across candidates, sponsors, users, and cases
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
            className="rounded-xl"
          >
            {exporting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm font-black text-secondary">Filters</span>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">Entity Type</label>
            <select
              name="entityType"
              value={filters.entityType}
              onChange={handleFilterChange}
              className="min-w-[170px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/30"
            >
              {ENTITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">Action</label>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                placeholder="e.g. APPROVED"
                className="min-w-[170px] rounded-lg border border-gray-300 bg-white pl-8 pr-3 py-2.5 text-sm font-bold text-gray-800 placeholder:font-normal placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
          </div>

          <DatePicker
            label="Start Date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            placeholder="Any date"
            className="min-w-[160px]"
          />
          <DatePicker
            label="End Date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            min={filters.startDate || undefined}
            placeholder="Any date"
            className="min-w-[160px]"
          />

          <div className="flex items-center gap-2">
            {[
              { label: "Today", days: 0 },
              { label: "Last 7", days: 7 },
              { label: "Last 30", days: 30 },
            ].map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => handleQuickDate(q.days)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-600 hover:border-secondary/40 hover:text-secondary transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[200px] relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <Loader2 className="w-10 h-10 animate-spin text-secondary" />
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                {TABLE_COLS.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_COLS.length}
                    className="px-5 py-12 text-center text-sm text-gray-400"
                  >
                    No audit logs found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-gray-50/70 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono text-gray-500">
                      {fmtTs(log.timestamp)}
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <div className="font-semibold text-gray-800">
                        {log.userName}
                      </div>
                      <div className="text-xs text-gray-500">{log.role}</div>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-700 whitespace-nowrap">
                      {log.entity_type}{" "}
                      <span className="text-xs font-mono text-gray-400">
                        #{log.entity_id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-gray-600">
                      {log.field_name}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 max-w-xs truncate">
                      {log.old_value && (
                        <span className="line-through text-red-400 mr-2">
                          {typeof log.old_value === "object"
                            ? "Object"
                            : String(log.old_value)}
                        </span>
                      )}
                      {log.new_value && (
                        <span className="text-green-600 font-semibold">
                          {typeof log.new_value === "object"
                            ? "Object"
                            : String(log.new_value)}
                        </span>
                      )}
                      {!log.old_value && !log.new_value && (
                        <span className="inline-flex rounded-full bg-secondary/10 text-secondary px-2.5 py-0.5 text-[11px] font-black">
                          {log.action}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono text-gray-500">
                      {log.ip}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-gray-400">
            Showing page{" "}
            <span className="font-bold text-secondary">{meta.page}</span> of{" "}
            <span className="font-bold text-secondary">{meta.pages || 1}</span>{" "}
            <span className="text-gray-400">({meta.total} total)</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              disabled={meta.page <= 1 || loading}
              onClick={() =>
                setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
              }
              className="rounded-xl text-xs"
            >
              Previous
            </Button>
            <span className="text-xs text-gray-500 font-semibold">
              Page {meta.page} / {Math.max(1, meta.pages || 1)}
            </span>
            <Button
              variant="ghost"
              disabled={meta.page >= (meta.pages || 1) || loading}
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  page: Math.min(meta.pages || 1, p.page + 1),
                }))
              }
              className="rounded-xl text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Detail slide-over */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div
            className="fixed inset-0 z-50 overflow-hidden"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelectedLog(null)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <div className="p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-secondary">
                      Audit Record Details
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Full before/after snapshot for this change
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        Timestamp
                      </span>
                      <div className="font-mono text-sm text-gray-800 mt-1">
                        {fmtTs(selectedLog.timestamp)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        IP Address
                      </span>
                      <div className="font-mono text-sm text-gray-800 mt-1">
                        {selectedLog.ip}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        User
                      </span>
                      <div className="text-sm font-semibold text-gray-800 mt-1">
                        {selectedLog.userName}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        Role
                      </span>
                      <div className="text-sm text-gray-700 mt-1">
                        {selectedLog.role}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                          Entity Type
                        </span>
                        <div className="font-bold mt-1 text-secondary">
                          {selectedLog.entity_type}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                          Entity ID
                        </span>
                        <div className="font-bold mt-1 text-gray-800">
                          #{selectedLog.entity_id}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        Field Name
                      </span>
                      <div className="font-mono text-sm text-gray-800 mt-1">
                        {selectedLog.field_name}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">
                        Old Value
                      </span>
                      <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap break-all">
                        {typeof selectedLog.old_value === "object"
                          ? JSON.stringify(selectedLog.old_value, null, 2)
                          : String(selectedLog.old_value || "None")}
                      </pre>
                    </div>

                    <div className="flex justify-center text-gray-300">
                      <ArrowDown size={20} />
                    </div>

                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <span className="text-[10px] font-black text-green-600 uppercase tracking-wider">
                        New Value
                      </span>
                      <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap break-all">
                        {typeof selectedLog.new_value === "object"
                          ? JSON.stringify(selectedLog.new_value, null, 2)
                          : String(selectedLog.new_value || "None")}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminAuditLogs;
