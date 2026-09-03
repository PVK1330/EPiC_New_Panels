import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PoundSterling,
  Loader2,
  CheckCircle,
  XCircle,
  Search,
  Clock,
  Archive,
  Filter,
  Eye,
  FileText,
  X,
  Check
} from "lucide-react";
import Button from "../../components/Button";
import { useToast } from "../../context/ToastContext";
import { getPendingCclFeeApprovals, reviewCclFees } from "../../services/workflowApi";
import { formatDateLong } from "../../utils/datetime";

function formatDate(value) {
  if (!value) return "—";
  return formatDateLong(value, { month: "short" });
}

export default function AdminCclFeeApprovals() {
  const { showToast } = useToast();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  
  // Pagination, search, and tab states
  const [activeTab, setActiveTab] = useState("pending"); // "pending", "approved", "rejected", "all"
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPendingCclFeeApprovals({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        tab: activeTab,
      });
      setCases(res?.cases || []);
      const pag = res?.pagination || { total: (res?.cases || []).length, pages: 1 };
      setTotalPages(pag.pages);
      setTotalItems(pag.total);
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Failed to load fee approvals",
      });
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [showToast, currentPage, pageSize, searchTerm, activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReview = async (caseRef, action) => {
    setBusyId(caseRef);
    try {
      await reviewCclFees(caseRef, {
        action,
        reviewNotes: adminNotes,
      });
      showToast({
        variant: "success",
        message:
          action === "approve"
            ? "Fees approved — CCL sent to client"
            : "Returned to caseworker for revision",
      });
      setReviewModalOpen(false);
      setSelectedCase(null);
      setAdminNotes("");
      load();
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Action failed",
      });
    } finally {
      setBusyId(null);
    }
  };

  const openReviewModal = (c) => {
    setSelectedCase(c);
    setAdminNotes(c.cclRecord?.adminReviewNotes || "");
    setReviewModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tight flex items-center gap-3">
            <PoundSterling className="text-primary" size={28} />
            CCL Fee Approvals
          </h1>
          <p className="text-xs font-bold text-gray-400 mt-1">
            Review caseworker fee proposals before the Client Care Letter is released to clients.
          </p>
        </div>
      </div>

      {/* Tabs, Search & Page Size */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100/50">
            {[
              { id: "pending", label: "Pending Approvals", icon: Clock },
              { id: "approved", label: "Approved / Sent", icon: CheckCircle },
              { id: "rejected", label: "Returned / Revised", icon: XCircle },
              { id: "all", label: "All Approvals", icon: Filter },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                    isActive
                      ? "bg-white text-primary shadow-sm border border-gray-100"
                      : "text-gray-500 hover:text-secondary hover:bg-gray-100/50"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search and Limit Controls */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-4 top-3 text-gray-300" size={16} />
              <input
                type="text"
                placeholder="Search clients / refs..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 transition-all text-xs font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-gray-50 border border-transparent rounded-2xl px-4 py-2.5 text-xs font-black text-secondary outline-none cursor-pointer"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / Page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main List / Table */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 p-6 h-24 shadow-sm"></div>
          ))}
        </div>
      ) : cases.length === 0 ? (
        <motion.div
          className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CheckCircle className="mx-auto text-green-500 mb-3" size={44} />
          <p className="text-lg font-black text-secondary">No fee approvals found</p>
          <p className="text-sm font-bold text-gray-500 mt-1">
            No fee proposals match the selected filters or search terms.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Ref / Candidate</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Visa Type</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Proposed Fee</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Instalments</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cases.map((c) => {
                  const ccl = c.cclRecord || {};
                  const plan = ccl.installmentPlan || ccl.installment_plan || [];
                  const isPending = ccl.status === "fee_proposed" || c.amountStatus === "Pending Approval";
                  const candidateName = c.candidate
                    ? `${c.candidate.first_name || ""} ${c.candidate.last_name || ""}`.trim()
                    : "Unknown";

                  return (
                    <tr key={c.caseId} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-[10px] font-mono font-bold text-primary">{c.caseId}</p>
                          <p className="text-sm font-black text-secondary group-hover:text-primary transition-colors mt-0.5">{candidateName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-secondary">
                        {c.visaType?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-secondary">
                        £{Number(ccl.feeAmount || c.proposedAmount || 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">
                        {plan.length > 0 ? `${plan.length} Instalment(s)` : "Single Payment"}
                      </td>
                      <td className="px-6 py-4">
                        {isPending ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200/50">
                            Awaiting Review
                          </span>
                        ) : ccl.status === "issued" || ccl.status === "signed" || c.amountStatus === "Approved" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-red-50 text-red-700 border border-red-200/50">
                            Returned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => openReviewModal(c)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all text-[10px] font-black uppercase shadow-sm ${
                              isPending
                                ? "bg-primary hover:bg-primary-dark text-white shadow-primary/10"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                          >
                            <Eye size={12} /> {isPending ? "Review" : "Details"}
                          </button>
                          <Link
                            to={`/admin/case-detail/${encodeURIComponent(String(c.caseId).replace(/^#/, ""))}`}
                            className="text-[10px] font-black text-primary hover:underline"
                          >
                            Open Case
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden space-y-4">
            {cases.map((c) => {
              const ccl = c.cclRecord || {};
              const plan = ccl.installmentPlan || ccl.installment_plan || [];
              const isPending = ccl.status === "fee_proposed" || c.amountStatus === "Pending Approval";
              const candidateName = c.candidate
                ? `${c.candidate.first_name || ""} ${c.candidate.last_name || ""}`.trim()
                : "Unknown";

              return (
                <div key={c.caseId} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-mono font-bold text-primary">{c.caseId}</p>
                      <h3 className="text-base font-black text-secondary mt-0.5">{candidateName}</h3>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">{c.visaType?.name || "—"}</p>
                    </div>
                    <div>
                      {isPending ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200/50">
                          Awaiting Review
                        </span>
                      ) : ccl.status === "issued" || ccl.status === "signed" || c.amountStatus === "Approved" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-red-50 text-red-700 border border-red-200/50">
                          Returned
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-50 text-xs">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Proposed Fee</p>
                      <p className="font-bold text-secondary mt-0.5">
                        £{Number(ccl.feeAmount || c.proposedAmount || 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Instalments</p>
                      <p className="font-bold text-secondary mt-0.5">
                        {plan.length > 0 ? `${plan.length} Payments` : "Single Payment"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 text-[11px] py-2" onClick={() => openReviewModal(c)}>
                      <Eye size={14} className="mr-1.5 inline" />
                      {isPending ? "Review Details" : "View Details"}
                    </Button>
                    <Link
                      to={`/admin/case-detail/${encodeURIComponent(String(c.caseId).replace(/^#/, ""))}`}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition-all text-xs font-black"
                    >
                      Open Case
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-xs font-bold text-gray-500">
              <p>
                Showing Page {currentPage} of {totalPages} ({totalItems} total entries)
              </p>
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl disabled:opacity-40 transition-all border border-gray-100"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3.5 py-2 rounded-xl transition-all border ${
                        currentPage === p
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/10"
                          : "bg-gray-50 hover:bg-gray-100 border-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl disabled:opacity-40 transition-all border border-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModalOpen && selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setReviewModalOpen(false)} aria-hidden />
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-black text-secondary">
                    {(selectedCase.cclRecord?.status === "fee_proposed" || selectedCase.amountStatus === "Pending Approval") ? "Review CCL Fee Proposal" : "CCL Fee Details"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedCase.caseId} — {selectedCase.candidate ? `${selectedCase.candidate.first_name || ""} ${selectedCase.candidate.last_name || ""}`.trim() : "Unknown"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Proposed Fee Block */}
                <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Proposed Total Fee</span>
                  <span className="text-4xl font-black text-secondary mt-1 block">
                    £{Number(selectedCase.cclRecord?.feeAmount || selectedCase.proposedAmount || 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Installments Plan */}
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5">Installment Structure</h4>
                  {(selectedCase.cclRecord?.installmentPlan || selectedCase.cclRecord?.installment_plan || []).length > 0 ? (
                    <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 overflow-hidden">
                      {(selectedCase.cclRecord?.installmentPlan || selectedCase.cclRecord?.installment_plan).map((row, i) => (
                        <div key={i} className="flex justify-between items-center p-3 text-xs font-bold text-gray-700">
                          <span className="font-black text-secondary">{row.label}</span>
                          <div className="text-right">
                            <span className="block font-black text-secondary">£{Number(row.amount).toFixed(2)}</span>
                            {row.dueDate && (
                              <span className="block text-[9px] text-gray-400 font-bold mt-0.5">Due: {formatDate(row.dueDate)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-gray-500 italic p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                      Single full payment requested upon CCL acceptance.
                    </p>
                  )}
                </div>

                {/* Caseworker Notes */}
                {selectedCase.cclRecord?.notes && (
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">Caseworker Notes</h4>
                    <p className="text-xs text-gray-600 bg-amber-50/50 border border-amber-100/30 rounded-xl p-3 leading-relaxed">
                      "{selectedCase.cclRecord.notes}"
                    </p>
                  </div>
                )}

                {/* Admin review Notes */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
                    Admin Notes
                  </label>
                  {(selectedCase.cclRecord?.status === "fee_proposed" || selectedCase.amountStatus === "Pending Approval") ? (
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add any feedback or approval notes here (optional)"
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-secondary focus:ring-2 focus:ring-secondary/30 outline-none transition-all resize-none"
                    />
                  ) : (
                    <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-xl p-3 italic">
                      {selectedCase.cclRecord?.adminReviewNotes || "No notes recorded."}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <Button variant="ghost" onClick={() => setReviewModalOpen(false)} disabled={busyId != null}>
                  Close
                </Button>

                {(selectedCase.cclRecord?.status === "fee_proposed" || selectedCase.amountStatus === "Pending Approval") && (
                  <>
                    <Button
                      variant="outline"
                      disabled={busyId != null}
                      onClick={() => handleReview(selectedCase.caseId, "reject")}
                    >
                      <XCircle size={14} className="mr-1.5 inline" />
                      Return
                    </Button>
                    <Button
                      disabled={busyId != null}
                      onClick={() => handleReview(selectedCase.caseId, "approve")}
                    >
                      {busyId != null ? (
                        "Saving…"
                      ) : (
                        <>
                          <CheckCircle size={14} className="mr-1.5 inline" />
                          Approve
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
