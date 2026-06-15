import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Check,
  X,
  UserPlus,
  Loader2,
  AlertCircle,
  Clock,
  ClipboardList,
  CheckCircle2,
  MessageSquare,
  Eye,
  History,
  Search,
} from "lucide-react";
import CosStatusBadge from "../../components/cos/CosStatusBadge";
import CosReviewModal from "../../components/cos/CosReviewModal";
import CosHistoryPanel from "../../components/cos/CosHistoryPanel";
import { useToast } from "../../context/ToastContext";
import { formatDateLong } from "../../utils/datetime";
import {
  getAdminCosRequests,
  approveCosRequestAdmin,
  rejectCosRequestAdmin,
  requestInfoCosRequestAdmin,
  assignCosRequestCaseworker,
} from "../../services/cosReviewApi";
import { getCaseworkers } from "../../services/caseWorker";

const fullName = (u) =>
  u ? `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email : null;

const TABS = [
  { key: "pending", label: "Pending CoS Requests", icon: Clock, color: "amber" },
  { key: "review", label: "Assigned CoS Requests", icon: ClipboardList, color: "blue" },
  { key: "approved", label: "Approved CoS Requests", icon: CheckCircle2, color: "emerald" },
];

const TAB_COLORS = {
  amber: { active: "bg-amber-500 text-white shadow-amber-200", inactive: "bg-amber-50 text-amber-700 border border-amber-200", badge: "bg-amber-200 text-amber-800" },
  blue: { active: "bg-blue-500 text-white shadow-blue-200", inactive: "bg-blue-50 text-blue-700 border border-blue-200", badge: "bg-blue-200 text-blue-800" },
  emerald: { active: "bg-emerald-500 text-white shadow-emerald-200", inactive: "bg-emerald-50 text-emerald-700 border border-emerald-200", badge: "bg-emerald-200 text-emerald-800" },
};

export default function AdminCosRequests() {
  const { showToast } = useToast();
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [caseworkers, setCaseworkers] = useState([]);
  const [search, setSearch] = useState("");

  const [review, setReview] = useState({ open: false, request: null, action: "approve" });
  const [assign, setAssign] = useState({ open: false, request: null, ids: [] });
  const [historyRequest, setHistoryRequest] = useState(null);
  const [busy, setBusy] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getAdminCosRequests();
      setAllRequests(res?.data?.data || []);
    } catch {
      showToast({ message: "Failed to load CoS requests", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    getCaseworkers(1, 100)
      .then((res) => setCaseworkers(res?.data?.data?.caseworkers || []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allRequests;
    return allRequests.filter((r) => {
      const sponsor = (fullName(r.sponsor) || "").toLowerCase();
      const email = (r.sponsor?.email || "").toLowerCase();
      const visa = (r.visaType || "").toLowerCase();
      return sponsor.includes(q) || email.includes(q) || visa.includes(q);
    });
  }, [allRequests, search]);

  const pending = filtered.filter((r) => r.status === "Pending");
  const underReview = filtered.filter((r) => r.status === "Under Review");
  const completed = filtered.filter((r) => r.status === "Approved" || r.status === "Allocated" || r.status === "Rejected");

  const sectionMap = { pending, review: underReview, approved: completed };

  const counts = {
    total: allRequests.length,
    pending: allRequests.filter((r) => r.status === "Pending").length,
    review: allRequests.filter((r) => r.status === "Under Review").length,
    allocated: allRequests.filter((r) => r.status === "Allocated").length,
    rejected: allRequests.filter((r) => r.status === "Rejected").length,
  };

  const handleReview = async (payload) => {
    const { request, action } = review;
    if (!request) return;
    try {
      setBusy(true);
      if (action === "approve") {
        await approveCosRequestAdmin(request.id, payload);
        showToast({ message: "CoS request approved and allocated", variant: "success" });
      } else if (action === "reject") {
        await rejectCosRequestAdmin(request.id, payload);
        showToast({ message: "CoS request rejected", variant: "success" });
      } else if (action === "requestInfo") {
        await requestInfoCosRequestAdmin(request.id, payload);
        showToast({ message: "Information requested from sponsor", variant: "success" });
      }
      setReview({ open: false, request: null, action: "approve" });
      fetchRequests();
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Action failed", variant: "danger" });
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async () => {
    if (!assign.request || !assign.ids.length) {
      showToast({ message: "Select at least one caseworker", variant: "warning" });
      return;
    }
    try {
      setBusy(true);
      await assignCosRequestCaseworker(assign.request.id, { caseworkerIds: assign.ids });
      showToast({ message: "CoS request assigned successfully", variant: "success" });
      setAssign({ open: false, request: null, ids: [] });
      fetchRequests();
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Assignment failed", variant: "danger" });
    } finally {
      setBusy(false);
    }
  };

  const requests = sectionMap[activeTab] || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-secondary flex items-center gap-3">
          <ShieldCheck className="text-primary" size={32} />
          CoS Requests
        </h1>
        <p className="text-gray-500 font-bold text-sm mt-1">
          Review, assign, approve or reject sponsor Certificate of Sponsorship requests.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: counts.total, color: "text-secondary" },
          { label: "Pending", value: counts.pending, color: "text-amber-600" },
          { label: "Under Review", value: counts.review, color: "text-blue-600" },
          { label: "Allocated", value: counts.allocated, color: "text-violet-600" },
          { label: "Rejected", value: counts.rejected, color: "text-red-600" },
        ].map((s, i) => (
          <div key={s.label} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
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
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-3">
        {TABS.map((tab) => {
          const tabCount = sectionMap[tab.key]?.length ?? 0;
          const isActive = activeTab === tab.key;
          const { active, inactive, badge } = TAB_COLORS[tab.color];
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all shadow-sm ${
                isActive ? `${active} shadow-lg` : inactive
              }`}
            >
              <Icon size={16} />
              {tab.label}
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[9px] font-black ${isActive ? "bg-white/30 text-white" : badge}`}>
                {allRequests.filter((r) =>
                  tab.key === "pending"
                    ? r.status === "Pending"
                    : tab.key === "review"
                    ? r.status === "Under Review"
                    : ["Approved", "Allocated", "Rejected"].includes(r.status)
                ).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              {["Sponsor", "Visa Type", "Requested", "Approved", "Status", "Date", "Reviewer", "Actions"].map((h) => (
                <th
                  key={h}
                  className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 ${h === "Actions" ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={8} className="px-6 py-6 h-16 bg-gray-50/20" />
                </tr>
              ))
            ) : requests.length > 0 ? (
              requests.map((r) => {
                const isPending = r.status === "Pending";
                const isReviewable = isPending || r.status === "Under Review";
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
                        {isPending && (
                          <button
                            onClick={() => setAssign({ open: true, request: r, ids: r.assignedCaseworkerIds || [] })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[9px] font-black uppercase"
                          >
                            <UserPlus size={14} /> Assign
                          </button>
                        )}
                        {isReviewable && (
                          <>
                            <button
                              onClick={() => setReview({ open: true, request: r, action: "requestInfo" })}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[9px] font-black uppercase"
                            >
                              <MessageSquare size={14} /> Info
                            </button>
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
                  <p className="text-sm font-bold text-gray-400">No requests in this section.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review / Request Info modal */}
      <CosReviewModal
        open={review.open}
        request={review.request}
        action={review.action}
        busy={busy}
        onClose={() => setReview({ open: false, request: null, action: "approve" })}
        onSubmit={handleReview}
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

      {/* Assign caseworker modal */}
      <AnimatePresence>
        {assign.open && (
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
                        selected
                          ? "bg-primary/5 border-primary text-primary"
                          : "bg-gray-50 border-gray-100 text-secondary hover:border-gray-200"
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
