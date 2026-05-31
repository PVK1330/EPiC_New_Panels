import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Inbox, CheckCircle, UserPlus } from "lucide-react";
import Button from "../../components/Button";
import { useToast } from "../../context/ToastContext";
import { getPipelineCases } from "../../services/caseApi";
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const pipeRes = await getPipelineCases();
      const pipeline = pipeRes.data?.data || {};
      const list = pipeline.client_enquiry || [];
      setEnquiries(list.map(enquiryFromCase));
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Failed to load enquiries",
      });
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

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

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-start justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
            <Inbox className="text-primary" size={36} />
            Enquiry Inbox
          </h1>
          <p className="text-primary font-bold text-sm mt-1">
            New visa enquiries awaiting review and caseworker assignment
          </p>
        </motion.div>
        {!loading && (
          <span className="rounded-full bg-primary/10 text-primary text-xs font-black px-3 py-1">
            {enquiries.length} open
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm font-bold text-gray-400">Loading enquiries…</p>
      ) : enquiries.length === 0 ? (
        <motion.div
          className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CheckCircle className="mx-auto text-green-500 mb-3" size={40} />
          <p className="text-lg font-black text-secondary">No new enquiries</p>
          <p className="text-sm font-bold text-gray-500 mt-1">
            All client enquiries have been assigned.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {enquiries.map((item) => (
            <article
              key={item.caseId}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <motion.div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-[11px] font-mono font-bold text-primary">{item.caseId}</p>
                  <p className="text-base font-black text-secondary mt-0.5">{item.candidateName}</p>
                </div>
                <CaseWorkflowBadge caseRecord={{ caseStage: item.caseStage }} />
              </motion.div>
              <dl className="space-y-1.5 text-xs font-bold text-gray-600">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400">Visa</dt>
                  <dd className="text-secondary text-right">{item.visaType}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400">Nationality</dt>
                  <dd className="text-secondary">{item.nationality}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400">Submitted</dt>
                  <dd className="text-secondary">{formatDate(item.submittedAt)}</dd>
                </div>
              </dl>
              {item.enquiryNotes && (
                <p className="mt-3 text-xs text-gray-600 line-clamp-3 border-t border-gray-50 pt-3">
                  {item.enquiryNotes}
                </p>
              )}
              {item.proposedAmount != null && Number(item.proposedAmount) > 0 && (
                <p className="mt-2 text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1">
                  CCL fee: £{Number(item.proposedAmount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                </p>
              )}
              <Button className="w-full mt-4" onClick={() => openAssign(item)}>
                <UserPlus size={16} className="mr-2 inline" />
                Review &amp; Assign
              </Button>
            </article>
          ))}
        </div>
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
