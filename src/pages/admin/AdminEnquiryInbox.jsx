import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, CheckCircle, UserPlus, XCircle, Search, Clock, Archive, Filter } from "lucide-react";
import Button from "../../components/Button";
import { useToast } from "../../context/ToastContext";
import { getCases, updatePipelineStage } from "../../services/caseApi";
import CaseWorkflowBadge from "../../components/case/CaseWorkflowBadge";
import AssignCaseworkerModal from "../../components/admin/AssignCaseworkerModal";
import { formatDateLong } from "../../utils/datetime";

function formatDate(value) {
  if (!value) return "—";
  return formatDateLong(value, { month: "short" });
}

function enquiryFromCase(c) {
  const candidate = c.candidate || {};
  return {
    id: c.id,
    caseId: c.caseId || `CAS-${c.id}`,
    candidateName: `${candidate.first_name || ""} ${candidate.last_name || ""}`.trim() || "Unknown",
    visaType: c.visaType?.name || "—",
    nationality: c.nationality || "—",
    enquiryNotes: c.notes || "",
    submittedAt: c.created_at || c.submitted,
    caseStage: c.caseStage,
    status: c.status || "Lead",
    proposedAmount: c.proposedAmount ?? null,
    caseworkerIds: Array.isArray(c.assignedcaseworkerId)
      ? c.assignedcaseworkerId
      : c.assignedcaseworkerId
        ? [c.assignedcaseworkerId]
        : [],
  };
}

export default function AdminEnquiryInbox() {
  const { showToast } = useToast();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignCaseRow, setAssignCaseRow] = useState(null);
  
  // Backend pagination & search & filter states
  const [activeTab, setActiveTab] = useState("all"); // "all", "new", "assigned", "closed"
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
      };

      if (activeTab === "new") {
        params.caseStage = "client_enquiry";
      } else if (activeTab === "assigned") {
        params.caseStage = "assigned";
      } else if (activeTab === "closed") {
        params.caseStage = "case_closure";
      }

      const res = await getCases(params);
      const list = res.data?.data?.cases || [];
      const pag = res.data?.data?.pagination || { total: list.length, pages: 1 };
      
      setEnquiries(list.map(enquiryFromCase));
      setTotalPages(pag.pages);
      setTotalItems(pag.total);
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Failed to load enquiries",
      });
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }, [showToast, currentPage, pageSize, searchTerm, activeTab]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const openAssign = (item) => {
    setAssignCaseRow({
      caseId: item.caseId,
      candidate: item.candidateName,
      proposedAmount: item.proposedAmount,
      caseworkerIds: item.caseworkerIds,
    });
    setAssignModalOpen(true);
  };

  const handleReject = async (item) => {
    if (!window.confirm(`Are you sure you want to reject enquiry ${item.caseId}?`)) return;
    try {
      await updatePipelineStage(item.id, "case_closure", { status: "Rejected" });
      showToast({ message: "Enquiry rejected and closed successfully", variant: "success" });
      load();
    } catch (err) {
      showToast({ message: "Failed to reject enquiry", variant: "danger" });
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tight flex items-center gap-3">
            <Inbox className="text-primary" size={28} />
            Enquiry Inbox
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-1">
            Review client visa enquiries, assign caseworkers, and approve or reject submissions in real-time.
          </p>
        </div>
      </div>

      {/* Tabs, Search & Page Size */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100/50">
            {[
              { id: "all", label: "All Enquiries", icon: Filter },
              { id: "new", label: "New Enquiries", icon: Inbox },
              { id: "assigned", label: "Assigned / Active", icon: Clock },
              { id: "closed", label: "Closed / Rejected", icon: Archive },
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
                placeholder="Search enquiries..."
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

      {/* Table view */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 p-6 h-24 shadow-sm"></div>
          ))}
        </div>
      ) : enquiries.length === 0 ? (
        <motion.div
          className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CheckCircle className="mx-auto text-green-500 mb-3" size={44} />
          <p className="text-lg font-black text-secondary">No enquiries found</p>
          <p className="text-sm font-bold text-gray-500 mt-1">
            No client enquiries match the selected filters or search terms.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Ref / Candidate</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Visa / Nationality</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Submitted</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Assignment</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">CCL Fee</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enquiries.map((item) => {
                  const isClosed = ["Closed", "Rejected", "Cancelled"].includes(item.status) || item.caseStage === "case_closure";
                  const isNew = item.caseStage === "client_enquiry";
                  return (
                    <tr key={item.caseId} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-[10px] font-mono font-bold text-primary">{item.caseId}</p>
                          <p className="text-sm font-black text-secondary group-hover:text-primary transition-colors mt-0.5">{item.candidateName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-secondary">{item.visaType}</p>
                        <p className="text-xs font-bold text-gray-400 mt-0.5">{item.nationality}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-500">
                        {formatDate(item.submittedAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        {item.caseworkerIds.length > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/50">Assigned</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200/50">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {isNew && !isClosed && (
                            <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                              New
                            </span>
                          )}
                          <CaseWorkflowBadge caseRecord={{ caseStage: item.caseStage }} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-secondary">
                        {item.proposedAmount != null && Number(item.proposedAmount) > 0 ? (
                          <span>£{Number(item.proposedAmount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>
                        ) : (
                          <span className="text-gray-300 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isClosed ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openAssign(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all text-[10px] font-black uppercase shadow-md shadow-primary/10"
                            >
                              <UserPlus size={12} /> {item.caseworkerIds.length > 0 ? "Reassign" : "Assign"}
                            </button>
                            <button
                              onClick={() => handleReject(item)}
                              className="p-1.5 bg-red-50 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all border border-red-100"
                              title="Reject Enquiry"
                            >
                              <XCircle size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-gray-300 italic">No actions</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="block md:hidden space-y-4">
            {enquiries.map((item) => {
              const isClosed = ["Closed", "Rejected", "Cancelled"].includes(item.status) || item.caseStage === "case_closure";
              const isNew = item.caseStage === "client_enquiry";
              return (
                <div key={item.caseId} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-mono font-bold text-primary">{item.caseId}</p>
                      <h3 className="text-base font-black text-secondary mt-0.5">{item.candidateName}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isNew && !isClosed && (
                        <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                          New
                        </span>
                      )}
                      <CaseWorkflowBadge caseRecord={{ caseStage: item.caseStage }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-50 text-xs">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Visa Type</p>
                      <p className="font-bold text-secondary mt-0.5">{item.visaType}</p>
                      <p className="text-gray-400 truncate mt-0.5">{item.nationality}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Submitted</p>
                      <p className="font-bold text-secondary mt-0.5">{formatDate(item.submittedAt)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Assignment</p>
                      <p className={`font-bold mt-0.5 ${item.caseworkerIds.length > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                        {item.caseworkerIds.length > 0 ? "Assigned" : "Unassigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">CCL Fee</p>
                      <p className="font-bold text-secondary mt-0.5">
                        {item.proposedAmount != null && Number(item.proposedAmount) > 0 ? `£${Number(item.proposedAmount).toLocaleString()}` : "—"}
                      </p>
                    </div>
                  </div>

                  {!isClosed ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button className="flex-1 text-[11px] py-2" onClick={() => openAssign(item)}>
                        <UserPlus size={14} className="mr-1.5 inline" />
                        {item.caseworkerIds.length > 0 ? "Reassign" : "Approve & Assign"}
                      </Button>
                      <button
                        onClick={() => handleReject(item)}
                        className="px-3 py-2 bg-red-50 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all border border-red-100 text-xs font-black flex items-center gap-1 shrink-0"
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-xs font-bold text-gray-300 italic">No actions available</div>
                  )}
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

      <AssignCaseworkerModal
        open={assignModalOpen}
        caseRow={assignCaseRow}
        onClose={() => {
          setAssignModalOpen(false);
          setAssignCaseRow(null);
        }}
        onSuccess={() => load()}
      />
    </div>
  );
}
