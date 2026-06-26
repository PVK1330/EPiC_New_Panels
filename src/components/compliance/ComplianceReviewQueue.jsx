import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  Search,
  Eye,
  Check,
  X,
  MessageSquare,
  PlayCircle,
  AlertCircle,
  History,
  Loader2,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import useNotifications from "../../hooks/useNotifications";
import { formatDateLong } from "../../utils/datetime";
import {
  ENTITY_CONFIG,
  REVIEWER_ENTITIES,
  recordStatus,
  listReview,
  getReviewDetail,
  reviewAction,
} from "../../services/complianceReviewApi";
import ComplianceStatusBadge from "./ComplianceStatusBadge";
import ComplianceReviewModal from "./ComplianceReviewModal";
import ComplianceTimeline from "./ComplianceTimeline";
import Pagination from "../common/Pagination";

const STATUS_FILTERS = ["All", "Submitted", "Under Review", "Information Requested", "Approved", "Rejected"];
const REVIEWABLE = ["Submitted", "Under Review"];

const fullName = (u) =>
  u ? `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email : null;

export default function ComplianceReviewQueue({ title = "Compliance Review", subtitle }) {
  const { showToast } = useToast();
  const { loadUnreadCount } = useNotifications({ autoFetch: false, autoFetchUnreadCount: false, pollingInterval: 0 });

  const [entity, setEntity] = useState("worker-events");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });

  const [detail, setDetail] = useState({ open: false, loading: false, record: null, history: [] });
  const [review, setReview] = useState({ open: false, action: "approve", record: null });
  const [busy, setBusy] = useState(false);

  const cfg = ENTITY_CONFIG[entity];

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = { page, limit: pagination.limit };
      if (statusFilter !== "All") params.status = statusFilter;
      const res = await listReview(entity, params);
      const rows = res?.data?.data || [];
      setRecords(rows);
      const meta = res?.data?.pagination;
      // The generic compliance-review engine paginates server-side; the
      // compliance-documents engine does not return pagination meta — fall back
      // to a single page so the control simply hides itself.
      setPagination(
        meta || { total: rows.length, page: 1, limit: pagination.limit, totalPages: 1 }
      );
    } catch (err) {
      showToast({ message: "Failed to load compliance items", variant: "danger" });
      setRecords([]);
      setPagination({ total: 0, page: 1, limit: pagination.limit, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Reset to the first page whenever the entity or status filter changes.
  useEffect(() => {
    setPage(1);
  }, [entity, statusFilter]);

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, statusFilter, page]);

  const refreshAll = () => {
    fetchRecords();
    try { loadUnreadCount(); } catch { /* best effort */ }
  };

  const openHistory = async (record) => {
    setDetail({ open: true, loading: true, record, history: [] });
    try {
      const { record: full, history } = await getReviewDetail(entity, record.id);
      setDetail({ open: true, loading: false, record: full || record, history });
    } catch (err) {
      setDetail({ open: true, loading: false, record, history: [] });
      showToast({ message: "Failed to load history", variant: "danger" });
    }
  };

  const doReview = async (record, action, body = {}) => {
    try {
      setBusy(true);
      await reviewAction(entity, record.id, action, body);
      showToast({ message: `Item ${action === "request-info" ? "returned for information" : action + "d"}`, variant: "success" });
      setReview({ open: false, action: "approve", record: null });
      refreshAll();
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Action failed", variant: "danger" });
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => {
      const sponsor = (fullName(r.sponsor) || "").toLowerCase();
      const t = (cfg.title(r) || "").toLowerCase();
      const sub = (cfg.subtitle(r) || "").toLowerCase();
      return sponsor.includes(q) || t.includes(q) || sub.includes(q);
    });
  }, [records, search, cfg]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-secondary flex items-center gap-3">
          <ClipboardCheck className="text-primary" size={32} />
          {title}
        </h1>
        <p className="text-gray-500 font-bold text-sm mt-1">
          {subtitle || "Review sponsor compliance submissions: approve, reject or request more information."}
        </p>
      </div>

      {/* Entity tabs */}
      <div className="flex flex-wrap gap-2 bg-white rounded-3xl border border-gray-100 p-2 shadow-sm">
        {REVIEWER_ENTITIES.map((key) => (
          <button
            key={key}
            onClick={() => { setEntity(key); setSearch(""); }}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              entity === key ? "bg-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {ENTITY_CONFIG[key].label}
          </button>
        ))}
      </div>

      {/* Filter + search */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-gray-300" size={18} />
          <input
            type="text"
            placeholder="Search by sponsor or item..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 transition-all text-sm font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-xs font-black text-secondary outline-none cursor-pointer py-1"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table & Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 p-6 h-24"></div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-auto max-h-[68vh]">
              <table className="w-full min-w-0 text-left table-auto">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Sr No</th>
                    {["Sponsor", "Item", "Status", "Submitted", "Reviewer", "Actions"].map((h) => (
                      <th key={h} className={`px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400 ${h === "Actions" ? "text-right" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r, idx) => {
                    const status = recordStatus(entity, r);
                    const canReview = REVIEWABLE.includes(status);
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-black text-gray-500 tabular-nums">
                            {(page - 1) * pagination.limit + idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                        <p className="text-sm font-black text-secondary group-hover:text-primary transition-colors">
                          {fullName(r.sponsor) || `Sponsor #${r.sponsorId}`}
                        </p>
                        <p className="text-xs font-bold text-gray-400 mt-0.5">{r.sponsor?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-secondary">{cfg.title(r)}</p>
                        <p className="text-xs font-bold text-gray-400 mt-0.5 max-w-[240px] truncate">{cfg.subtitle(r)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <ComplianceStatusBadge status={r[cfg.statusField]} />
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">
                        {r.created_at ? formatDateLong(r.created_at, { month: "short" }) : "—"}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">
                        {fullName(r.reviewer) || <span className="text-gray-300 italic">Unreviewed</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openHistory(r)}
                            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-primary rounded-xl transition-all border border-gray-100"
                            title="View history"
                          >
                            <Eye size={16} />
                          </button>
                          {status === "Submitted" && (
                            <button
                              onClick={() => doReview(r, "review")}
                              disabled={busy}
                              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-indigo-100"
                            >
                              <PlayCircle size={14} /> Review
                            </button>
                          )}
                          {canReview && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setReview({ open: true, action: "approve", record: r })}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-emerald-100"
                              >
                                <Check size={14} /> Approve
                              </button>
                              <button
                                onClick={() => setReview({ open: true, action: "reject", record: r })}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-red-100"
                              >
                                <X size={14} /> Reject
                              </button>
                              <button
                                onClick={() => setReview({ open: true, action: "request-info", record: r })}
                                className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl transition-all border border-orange-100"
                                title="Request information"
                              >
                                <MessageSquare size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {filtered.map((r) => {
              const status = recordStatus(entity, r);
              const canReview = REVIEWABLE.includes(status);
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-black text-secondary">
                        {fullName(r.sponsor) || `Sponsor #${r.sponsorId}`}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">{r.sponsor?.email}</p>
                    </div>
                    <ComplianceStatusBadge status={r[cfg.statusField]} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-50 text-xs">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Item Title</p>
                      <p className="font-bold text-secondary mt-0.5">{cfg.title(r)}</p>
                      <p className="text-gray-400 truncate mt-0.5">{cfg.subtitle(r)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Submitted At</p>
                      <p className="font-bold text-secondary mt-0.5">
                        {r.created_at ? formatDateLong(r.created_at, { month: "short" }) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Reviewer</p>
                      <p className="font-bold text-secondary mt-0.5">
                        {fullName(r.reviewer) || <span className="text-gray-300 italic">Unreviewed</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openHistory(r)}
                      className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition-all border border-gray-100"
                      title="View history"
                    >
                      <Eye size={16} />
                    </button>
                    {status === "Submitted" && (
                      <button
                        onClick={() => doReview(r, "review")}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-indigo-100"
                      >
                        <PlayCircle size={14} /> Review
                      </button>
                    )}
                    {canReview && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setReview({ open: true, action: "approve", record: r })}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-emerald-100"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => setReview({ open: true, action: "reject", record: r })}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-red-100"
                        >
                          <X size={14} /> Reject
                        </button>
                        <button
                          onClick={() => setReview({ open: true, action: "request-info", record: r })}
                          className="p-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl transition-all border border-orange-100"
                          title="Request information"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Server-side pagination (generic compliance-review entities) */}
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto text-gray-200 mb-4" size={48} />
          <p className="text-sm font-bold text-gray-400">No {cfg.label.toLowerCase()} to review.</p>
        </div>
      )}

      {/* Review modal */}
      <ComplianceReviewModal
        open={review.open}
        action={review.action}
        itemTitle={review.record ? `${cfg.label} · ${cfg.title(review.record)}` : ""}
        busy={busy}
        onClose={() => setReview({ open: false, action: "approve", record: null })}
        onSubmit={(body) => review.record && doReview(review.record, review.action, body)}
      />

      {/* History / detail slide-over */}
      <AnimatePresence>
        {detail.open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
            onClick={() => setDetail({ open: false, loading: false, record: null, history: [] })}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/5 rounded-2xl text-primary"><History size={22} /></div>
                  <div>
                    <h3 className="text-xl font-black text-secondary">Review History</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {cfg.label}{detail.record ? ` · ${cfg.title(detail.record)}` : ""}
                    </p>
                  </div>
                </div>
                <button onClick={() => setDetail({ open: false, loading: false, record: null, history: [] })} className="text-gray-400 hover:text-secondary">
                  <X size={24} />
                </button>
              </div>

              {detail.record && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    ["Sponsor", fullName(detail.record.sponsor) || `#${detail.record.sponsorId}`],
                    ["Status", recordStatus(entity, detail.record)],
                    ["Reviewer", fullName(detail.record.reviewer) || "—"],
                    ["Detail", cfg.subtitle(detail.record)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-2xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{k}</p>
                      <p className="text-sm font-black text-secondary mt-0.5 truncate">{v}</p>
                    </div>
                  ))}
                </div>
              )}

              {detail.record?.reviewNotes && (
                <div className="mb-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Latest Reviewer Comment</p>
                  <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                    <p className="text-sm font-bold text-amber-900 italic">"{detail.record.reviewNotes}"</p>
                  </div>
                </div>
              )}

              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Timeline</p>
              {detail.loading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <ComplianceTimeline history={detail.history} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
