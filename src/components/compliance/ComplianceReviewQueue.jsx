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

  const [detail, setDetail] = useState({ open: false, loading: false, record: null, history: [] });
  const [review, setReview] = useState({ open: false, action: "approve", record: null });
  const [busy, setBusy] = useState(false);

  const cfg = ENTITY_CONFIG[entity];

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = statusFilter === "All" ? {} : { status: statusFilter };
      const res = await listReview(entity, params);
      setRecords(res?.data?.data || []);
    } catch (err) {
      showToast({ message: "Failed to load compliance items", variant: "danger" });
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, statusFilter]);

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

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-0">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              {["Sponsor", "Item", "Status", "Submitted", "Reviewer", "Actions"].map((h) => (
                <th key={h} className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 ${h === "Actions" ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={6} className="px-6 py-6 h-16 bg-gray-50/20" /></tr>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((r) => {
                const status = recordStatus(entity, r);
                const canReview = REVIEWABLE.includes(status);
                return (
                  <tr key={r.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-secondary">{fullName(r.sponsor) || `Sponsor #${r.sponsorId}`}</p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">{r.sponsor?.email}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-secondary">{cfg.title(r)}</p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5 max-w-[240px] truncate">{cfg.subtitle(r)}</p>
                    </td>
                    <td className="px-6 py-5"><ComplianceStatusBadge status={r[cfg.statusField]} /></td>
                    <td className="px-6 py-5 text-xs font-bold text-gray-500">
                      {r.created_at ? formatDateLong(r.created_at, { month: "short" }) : "—"}
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-gray-500">{fullName(r.reviewer) || "—"}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button onClick={() => openHistory(r)} className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100" title="View history">
                          <Eye size={16} />
                        </button>
                        {status === "Submitted" && (
                          <button
                            onClick={() => doReview(r, "review")}
                            disabled={busy}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all text-[9px] font-black uppercase"
                          >
                            <PlayCircle size={14} /> Review
                          </button>
                        )}
                        {canReview && (
                          <>
                            <button onClick={() => setReview({ open: true, action: "approve", record: r })}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all text-[9px] font-black uppercase">
                              <Check size={14} /> Approve
                            </button>
                            <button onClick={() => setReview({ open: true, action: "reject", record: r })}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all text-[9px] font-black uppercase">
                              <X size={14} /> Reject
                            </button>
                            <button onClick={() => setReview({ open: true, action: "request-info", record: r })}
                              className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-all" title="Request information">
                              <MessageSquare size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <AlertCircle className="mx-auto text-gray-200 mb-4" size={48} />
                  <p className="text-sm font-bold text-gray-400">No {cfg.label.toLowerCase()} to review.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
