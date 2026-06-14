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

  const [historyRequest, setHistoryRequest] = useState(null);
  const [review, setReview] = useState({ open: false, request: null, action: "approve" });
  const [assign, setAssign] = useState({ open: false, request: null, ids: [] });
  const [busy, setBusy] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = statusFilter === "All" ? {} : { status: statusFilter };
      const res = await loadRequests(params);
      setRequests(res?.data?.data || []);
    } catch (err) {
      showToast({ message: "Failed to load CoS requests", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

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

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              {["Sponsor", "Visa Type", "Requested", "Approved", "Status", "Requested Date", "Reviewer", "Actions"].map((h) => (
                <th key={h} className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 ${h === "Actions" ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={8} className="px-6 py-6 h-16 bg-gray-50/20"></td>
                </tr>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((r) => {
                const canReview = REVIEWABLE.includes(r.status);
                return (
                  <tr key={r.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-secondary">{fullName(r.sponsor) || `Sponsor #${r.sponsorId}`}</p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">{r.sponsor?.email}</p>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-secondary">{r.visaType || "—"}</td>
                    <td className="px-6 py-5 text-sm font-black text-primary">{r.requestedAmount}</td>
                    <td className="px-6 py-5 text-sm font-black text-emerald-600">
                      {r.approvedAmount != null ? r.approvedAmount : "—"}
                    </td>
                    <td className="px-6 py-5"><CosStatusBadge status={r.status} /></td>
                    <td className="px-6 py-5 text-xs font-bold text-gray-500">
                      {r.created_at ? formatDateLong(r.created_at, { month: "short" }) : "—"}
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-gray-500">{fullName(r.reviewer) || "—"}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button
                          onClick={() => setHistoryRequest(r)}
                          className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-all"
                          title="View history"
                        >
                          <Eye size={16} />
                        </button>
                        {showAssign && canReview && (
                          <button
                            onClick={() => setAssign({ open: true, request: r, ids: r.assignedCaseworkerIds || [] })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[9px] font-black uppercase"
                          >
                            <UserPlus size={14} /> Assign
                          </button>
                        )}
                        {canReview && (
                          <>
                            {requestInfoRequest && (
                              <button
                                onClick={() => setReview({ open: true, request: r, action: "requestInfo" })}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[9px] font-black uppercase"
                              >
                                <MessageSquare size={14} /> Info
                              </button>
                            )}
                            <button
                              onClick={() => setReview({ open: true, request: r, action: "approve" })}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all text-[9px] font-black uppercase"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => setReview({ open: true, request: r, action: "reject" })}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all text-[9px] font-black uppercase"
                            >
                              <X size={14} /> Reject
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
                <td colSpan={8} className="px-6 py-12 text-center">
                  <AlertCircle className="mx-auto text-gray-200 mb-4" size={48} />
                  <p className="text-sm font-bold text-gray-400">No CoS requests found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-secondary/40 backdrop-blur-md p-4"
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
            className="fixed inset-0 z-[70] flex items-center justify-center bg-secondary/40 backdrop-blur-md p-4"
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
