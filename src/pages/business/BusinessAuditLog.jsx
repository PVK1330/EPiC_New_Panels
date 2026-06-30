import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../services/api";

const STATUS_COLOUR = {
  Success: "bg-emerald-50 text-emerald-700",
  Failed:  "bg-red-50 text-red-700",
  Pending: "bg-amber-50 text-amber-700",
};

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function BusinessAuditLog() {
  const [logs, setLogs]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);

  const [filters, setFilters] = useState({ search: "", action: "", from: "", to: "" });
  const [applied, setApplied] = useState(filters);

  const LIMIT = 20;

  const load = useCallback((pg, f) => {
    setLoading(true);
    const params = new URLSearchParams({ page: pg, limit: LIMIT });
    if (f.search)  params.set("search", f.search);
    if (f.action)  params.set("action", f.action);
    if (f.from)    params.set("from", f.from);
    if (f.to)      params.set("to", f.to);

    api.get(`/api/business/audit-logs?${params}`)
      .then((r) => {
        setLogs(r.data?.data ?? []);
        setTotal(r.data?.pagination?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get("/api/business/audit-logs/actions")
      .then((r) => setActions(r.data?.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => { load(page, applied); }, [page, applied, load]);

  const applyFilters = () => { setPage(1); setApplied({ ...filters }); };
  const clearFilters = () => {
    const empty = { search: "", action: "", from: "", to: "" };
    setFilters(empty); setApplied(empty); setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-secondary tracking-tight flex items-center gap-2.5">
          <ClipboardList className="text-primary" size={24} />
          Activity & Audit Log
        </h1>
        <p className="text-sm font-bold text-primary mt-0.5">
          Section O — Full audit trail of every action taken on your account.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search action / details…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={filters.action}
            onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Actions</option>
            {actions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={applyFilters}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-black hover:bg-primary/90 transition"
          >
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="font-black text-secondary">No audit records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Timestamp", "Action", "Entity", "Details", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{fmt(log.created_at)}</td>
                    <td className="px-4 py-3 font-semibold text-secondary whitespace-nowrap text-xs">{log.action}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {log.entity_type ?? "—"}
                      {log.entity_id ? <span className="text-gray-400"> #{log.entity_id}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate text-xs" title={log.details ?? ""}>
                      {log.details ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${STATUS_COLOUR[log.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > LIMIT && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-semibold text-secondary px-2">{page} / {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
