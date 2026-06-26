import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Search,
  Eye,
  Check,
  X,
  UserPlus,
  AlertCircle,
  Loader2,
  History,
  MessageSquare,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import useNotifications from "../../hooks/useNotifications";
import { formatDateLong } from "../../utils/datetime";
import CosStatusBadge from "./CosStatusBadge";
import CosReviewModal from "./CosReviewModal";
import CosHistoryPanel from "./CosHistoryPanel";
import Pagination from "../common/Pagination";

const STATUS_FILTERS = ["All", "Pending", "Under Review", "Approved", "Allocated", "Rejected"];
const REVIEWABLE = ["Pending", "Under Review"];

const fullName = (u) =>
  u ? `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email : null;

/**
 * Shared CoS review queue used by both the Admin and Caseworker pages.
 * Role differences are injected via props (the API functions + whether the
 * Assign action is available).
 */
export default function CosReviewQueue({
  title,
  subtitle,
  loadRequests,          // (params) => Promise<axiosRes>  — list endpoint
  approveRequest,        // (id, payload) => Promise
  rejectRequest,         // (id, payload) => Promise
  requestInfoRequest,    // (id, payload) => Promise   (optional — caseworker "request info")
  assignRequest,         // (id, { caseworkerIds }) => Promise   (optional)
  caseworkers = [],
  showAssign = false,
}) {
  const { showToast } = useToast();
  const { loadUnreadCount } = useNotifications({ autoFetch: false, autoFetchUnreadCount: false, pollingInterval: 0 });

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

  const [historyRequest, setHistoryRequest] = useState(null);
  const [review, setReview] = useState({ open: false, request: null, action: "approve" });
  const [assign, setAssign] = useState({ open: false, request: null, ids: [] });
  const [busy, setBusy] = useState(false);

  const fetchRequests = async (targetPage = page) => {
    try {
      setLoading(true);
      const params = { page: targetPage, limit: pagination.limit };
      if (statusFilter !== "All") params.status = statusFilter;
      const res = await loadRequests(params);
      setRequests(res?.data?.data || []);
      const meta = res?.data?.pagination;
      if (meta) {
        setPagination((prev) => ({
          total: meta.total ?? prev.total,
          page: meta.page ?? targetPage,
          limit: meta.limit ?? prev.limit,
          totalPages: meta.totalPages ?? prev.totalPages,
        }));
      }
    } catch (err) {
      showToast({ message: "Failed to load CoS requests", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  // Reset to the first page whenever the status filter changes.
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const refreshAll = () => {
    fetchRequests();
    try { loadUnreadCount(); } catch { /* notification refresh is best-effort */ }
  };

  const handleReviewSubmit = async (payload) => {
    const { request, action } = review;
    if (!request) return;
    try {
      setBusy(true);
      if (action === "approve") {
        await approveRequest(request.id, payload);
        showToast({ message: "CoS request approved and allocated", variant: "success" });
      } else if (action === "reject") {
        await rejectRequest(request.id, payload);
        showToast({ message: "CoS request rejected", variant: "success" });
      } else if (action === "requestInfo") {
        await requestInfoRequest(request.id, payload);
        showToast({ message: "Information requested from sponsor", variant: "success" });
      }
      setReview({ open: false, request: null, action: "approve" });
      refreshAll();
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Action failed", variant: "danger" });
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async () => {
    if (!assign.request) return;
    if (!assign.ids.length) {
      showToast({ message: "Select at least one caseworker", variant: "warning" });
      return;
    }
    try {
      setBusy(true);
      await assignRequest(assign.request.id, { caseworkerIds: assign.ids });
      showToast({ message: "CoS request assigned", variant: "success" });
      setAssign({ open: false, request: null, ids: [] });
      refreshAll();
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Assignment failed", variant: "danger" });
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) => {
      const sponsor = (fullName(r.sponsor) || "").toLowerCase();
      const email = (r.sponsor?.email || "").toLowerCase();
      const visa = (r.visaType || "").toLowerCase();
      return sponsor.includes(q) || email.includes(q) || visa.includes(q);
    });
  }, [requests, search]);

  const counts = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === "Pending").length,
      allocated: requests.filter((r) => r.status === "Allocated").length,
      rejected: requests.filter((r) => r.status === "Rejected").length,
    }),
    [requests]
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-secondary flex items-center gap-3">
          <ShieldCheck className="text-primary" size={32} />
          {title}
        </h1>
        <p className="text-gray-500 font-bold text-sm mt-1">{subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total", value: counts.total, color: "text-secondary" },
          { label: "Pending", value: counts.pending, color: "text-amber-600" },
          { label: "Allocated", value: counts.allocated, color: "text-violet-600" },
          { label: "Rejected", value: counts.rejected, color: "text-red-600" },
        ].map((s, i) => (
          <div key={s.label} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-gray-300" size={18} />
          <input
            type="text"
            placeholder="Search by sponsor or visa type..."
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
                    {["Sr No", "Sponsor", "Visa Type", "Requested / Approved", "Status", "Requested Date", "Reviewer", "Actions"].map((h) => (
                      <th key={h} className={`px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400 ${h === "Actions" ? "text-right" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r, idx) => {
                    const canReview = REVIEWABLE.includes(r.status);
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
                      <td className="px-6 py-4 text-sm font-bold text-secondary">{r.visaType || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-primary" title="Requested">
                            {r.requestedAmount} Req
                          </span>
                          <span className="text-xs text-gray-300">/</span>
                          <span className="text-sm font-black text-emerald-600" title="Approved">
                            {r.approvedAmount != null ? `${r.approvedAmount} Alloc` : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <CosStatusBadge status={r.status} />
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
                            onClick={() => setHistoryRequest(r)}
                            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-primary rounded-xl transition-all border border-gray-100"
                            title="View history"
                          >
                            <Eye size={16} />
                          </button>
                          {showAssign && canReview && (
                            <button
                              onClick={() => setAssign({ open: true, request: r, ids: r.assignedCaseworkerIds || [] })}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-blue-100"
                              title="Assign caseworker"
                            >
                              <UserPlus size={14} /> Assign
                            </button>
                          )}
                          {canReview && (
                            <div className="flex items-center gap-1">
                              {requestInfoRequest && (
                                <button
                                  onClick={() => setReview({ open: true, request: r, action: "requestInfo" })}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-blue-100"
                                >
                                  <MessageSquare size={14} /> Info
                                </button>
                              )}
                              <button
                                onClick={() => setReview({ open: true, request: r, action: "approve" })}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-emerald-100"
                              >
                                <Check size={14} /> Approve
                              </button>
                              <button
                                onClick={() => setReview({ open: true, request: r, action: "reject" })}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-red-100"
                              >
                                <X size={14} /> Reject
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
              const canReview = REVIEWABLE.includes(r.status);
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-black text-secondary">
                        {fullName(r.sponsor) || `Sponsor #${r.sponsorId}`}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">{r.sponsor?.email}</p>
                    </div>
                    <CosStatusBadge status={r.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-50 text-xs">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Visa Type</p>
                      <p className="font-bold text-secondary mt-0.5">{r.visaType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Allocation</p>
                      <div className="flex items-center gap-1.5 mt-0.5 font-black">
                        <span className="text-primary">{r.requestedAmount} Req</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-emerald-600">{r.approvedAmount != null ? `${r.approvedAmount} Alloc` : "—"}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Requested At</p>
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
                      onClick={() => setHistoryRequest(r)}
                      className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition-all border border-gray-100"
                      title="View history"
                    >
                      <Eye size={16} />
                    </button>
                    {showAssign && canReview && (
                      <button
                        onClick={() => setAssign({ open: true, request: r, ids: r.assignedCaseworkerIds || [] })}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-blue-100"
                      >
                        <UserPlus size={14} /> Assign
                      </button>
                    )}
                    {canReview && (
                      <div className="flex items-center gap-1.5">
                        {requestInfoRequest && (
                          <button
                            onClick={() => setReview({ open: true, request: r, action: "requestInfo" })}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-blue-100"
                          >
                            <MessageSquare size={14} /> Info
                          </button>
                        )}
                        <button
                          onClick={() => setReview({ open: true, request: r, action: "approve" })}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-emerald-100"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => setReview({ open: true, request: r, action: "reject" })}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-red-100"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination (shared by both desktop table and mobile cards) */}
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto text-gray-200 mb-4" size={48} />
          <p className="text-sm font-bold text-gray-400">No CoS requests found.</p>
        </div>
      )}

      {/* Review modal (approve / reject) */}
      <CosReviewModal
        open={review.open}
        request={review.request}
        action={review.action}
        busy={busy}
        onClose={() => setReview({ open: false, request: null, action: "approve" })}
        onSubmit={handleReviewSubmit}
      />

      {/* History slide-over */}
      <AnimatePresence>
        {historyRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
            onClick={() => setHistoryRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/5 rounded-2xl text-primary"><History size={22} /></div>
                  <div>
                    <h3 className="text-xl font-black text-secondary">CoS Request History</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#REQ-{historyRequest.id}</p>
                  </div>
                </div>
                <button onClick={() => setHistoryRequest(null)} className="text-gray-400 hover:text-secondary">
                  <X size={24} />
                </button>
              </div>

              {/* Summary fields */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  ["Sponsor", fullName(historyRequest.sponsor) || `#${historyRequest.sponsorId}`],
                  ["Visa Type", historyRequest.visaType || "—"],
                  ["Requested", historyRequest.requestedAmount],
                  ["Approved", historyRequest.approvedAmount != null ? historyRequest.approvedAmount : "—"],
                  ["Status", historyRequest.status],
                  ["Reviewer", fullName(historyRequest.reviewer) || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-gray-50 border border-gray-100 p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{k}</p>
                    <p className="text-sm font-black text-secondary mt-0.5">{v}</p>
                  </div>
                ))}
              </div>

              <CosHistoryPanel request={historyRequest} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign modal (admin only) */}
      <AnimatePresence>
        {showAssign && assign.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-secondary">Assign Caseworker</h3>
                <button onClick={() => setAssign({ open: false, request: null, ids: [] })}><X size={24} /></button>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1 mb-6">
                {caseworkers.length === 0 && (
                  <p className="text-xs font-bold text-gray-400 text-center py-4">No caseworkers available.</p>
                )}
                {caseworkers.map((cw) => {
                  const selected = assign.ids.includes(cw.id);
                  return (
                    <button
                      key={cw.id}
                      onClick={() =>
                        setAssign((a) => ({
                          ...a,
                          ids: selected ? a.ids.filter((id) => id !== cw.id) : [...a.ids, cw.id],
                        }))
                      }
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        selected ? "bg-primary/5 border-primary text-primary" : "bg-gray-50 border-gray-100 text-secondary hover:border-gray-200"
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-black">{cw.first_name} {cw.last_name}</p>
                        <p className="text-[10px] opacity-70 font-bold">{cw.email}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "bg-primary border-primary" : "border-gray-200"}`}>
                        {selected && <Check size={12} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleAssign}
                  disabled={busy}
                  className="flex-[2] bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="animate-spin" /> : <><UserPlus size={18} /> Confirm Assignment</>}
                </button>
                <button
                  onClick={() => setAssign({ open: false, request: null, ids: [] })}
                  className="flex-1 bg-gray-50 text-gray-500 font-black py-4 rounded-2xl"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
