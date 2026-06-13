import { useState, useEffect } from "react";
import { useToast } from "../../../context/ToastContext";
import CclFeeProposalModal from "../../../components/case/CclFeeProposalModal";
import { updateCaseFinance } from "../../../services/caseDetailApi";
import { proposeCclFees, getCclStatus } from "../../../services/workflowApi";
import { formatDateLong } from "../../../utils/datetime";

const STATUS_COLORS = {
  "Not Submitted": "bg-gray-100 text-gray-700 border-gray-200",
  "Pending Approval": "bg-amber-50 text-amber-800 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Paid: "bg-blue-50 text-blue-800 border-blue-200",
  Rejected: "bg-red-50 text-red-800 border-red-200",
};

function CasesPaymentsTab({ caseDetail, onUpdate }) {
  const { showToast } = useToast();
  const [totalAmount, setTotalAmount] = useState(caseDetail?.totalAmount || 0);
  const [amountNotes, setAmountNotes] = useState(caseDetail?.amountNotes || "");
  const [loading, setLoading] = useState(false);
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [cclMeta, setCclMeta] = useState(null);

  const caseRef = caseDetail?.caseId || caseDetail?.id;

  useEffect(() => {
    setTotalAmount(caseDetail?.totalAmount || caseDetail?.proposedAmount || cclMeta?.feeAmount || 0);
    setAmountNotes(caseDetail?.amountNotes || cclMeta?.notes || "");
  }, [caseDetail, cclMeta]);

  useEffect(() => {
    if (!caseRef) return;
    getCclStatus(caseRef)
      .then((data) => setCclMeta(data?.ccl || null))
      .catch(() => setCclMeta(null));
  }, [caseRef, caseDetail?.amountStatus, caseDetail?.caseStage]);

  const handleSaveDraft = async () => {
    if (!caseDetail?.id) return;
    setLoading(true);
    try {
      const payload = { totalAmount: parseFloat(totalAmount) || 0, amountNotes };
      await updateCaseFinance(caseDetail.id, payload);
      onUpdate?.(payload);
      showToast({ message: "Financial details saved successfully." });
    } catch (err) {
      console.error("Finance update error:", err);
      showToast({ variant: "danger", message: err?.response?.data?.message || "Failed to update financial details." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async (payload) => {
    if (!caseRef) return;
    setLoading(true);
    try {
      await proposeCclFees(caseRef, payload);
      setFeeModalOpen(false);
      const cclRes = await getCclStatus(caseRef).catch(() => null);
      if (cclRes?.ccl) setCclMeta(cclRes.ccl);
      onUpdate?.({ totalAmount: payload.feeAmount, amountNotes: payload.notes, amountStatus: "Pending Approval", caseStage: "client_care_letter" });
      showToast({ message: "Fee proposal submitted. Admins have been notified and a review task was created." });
    } catch (err) {
      console.error("CCL propose error:", err);
      const apiMsg = err?.response?.data?.message;
      showToast({
        variant: "danger",
        message: apiMsg?.includes("Fees can only be proposed")
          ? `${apiMsg} Ask admin to open the case and set workflow step to "CCL Fee Proposal" (or complete draft review first). You can also change stage on the Overview tab.`
          : apiMsg || "Failed to submit fee proposal for approval.",
      });
    } finally {
      setLoading(false);
    }
  };

  let currentStatus = caseDetail?.amountStatus || "Not Submitted";
  if (currentStatus === "Not Submitted" && cclMeta?.status) {
    const cclStatusMap = { fee_proposed: "Pending Approval", fee_rejected: "Rejected", issued: "Approved", signed: "Approved" };
    currentStatus = cclStatusMap[cclMeta.status] || currentStatus;
  }

  const paid = parseFloat(caseDetail?.paidAmount) || 0;
  const total = parseFloat(caseDetail?.totalAmount) || parseFloat(caseDetail?.proposedAmount) || parseFloat(cclMeta?.feeAmount) || 0;
  const outstanding = Math.max(0, total - paid);
  const stage = caseDetail?.caseStage || "";
  const awaitingAdmin = currentStatus === "Pending Approval" || cclMeta?.status === "fee_proposed";
  const feesLocked = currentStatus === "Approved" || currentStatus === "Paid" || cclMeta?.status === "issued" || cclMeta?.status === "signed";
  const canSubmit = !feesLocked && !awaitingAdmin && currentStatus !== "Pending Approval";
  const canProposeByStage = ["draft_application_review", "client_care_letter", "application_preparation", "document_review"].includes(stage) || cclMeta?.status === "fee_rejected";
  const showStageHint = stage && !["draft_application_review", "client_care_letter", "application_preparation", "document_review"].includes(stage) && cclMeta?.status !== "fee_rejected" && canSubmit;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-secondary/10 bg-gradient-to-r from-secondary/[0.03] to-secondary/[0.08] p-5 shadow-sm">
        <div>
          <h3 className="text-base font-black text-secondary tracking-tight">Financial Request & Approval</h3>
          <p className="text-xs font-bold text-gray-500 mt-0.5">Propose case amounts to be authorized by Admin before requesting payment from Candidate.</p>
        </div>
        <div className="shrink-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border shadow-xs ${STATUS_COLORS[currentStatus] || STATUS_COLORS["Not Submitted"]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 mr-1.5 animate-pulse" />
            {currentStatus}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Caseworker Proposal Form</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-gray-600 mb-1.5">Proposed Total Amount (£)</label>
            <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)}
              disabled={feesLocked || loading} placeholder="e.g. 2400"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:border-secondary focus:bg-white transition-all disabled:opacity-60" />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-600 mb-1.5">Paid Amount (£)</label>
            <input type="number" value={paid} disabled
              className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-bold text-gray-500 outline-none cursor-not-allowed" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-600 mb-1.5">Notes / Pricing Breakdown</label>
          <textarea rows={3} value={amountNotes} onChange={(e) => setAmountNotes(e.target.value)}
            disabled={feesLocked || loading}
            placeholder="Itemize application fees, legal assistance, or IHS surcharge coverage..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-800 outline-none focus:border-secondary focus:bg-white transition-all resize-none disabled:opacity-60" />
        </div>
        {awaitingAdmin && (
          <p className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            Awaiting admin approval. Admins have been notified and a review task was created.
          </p>
        )}
        {currentStatus === "Paid" && (
          <p className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
            Payment has been received. Only an administrator can update payment records.
          </p>
        )}
        {currentStatus === "Approved" && !awaitingAdmin && (
          <p className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            Fees approved — the candidate can pay via their portal. You cannot change amounts here.
          </p>
        )}
        {showStageHint && (
          <p className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            Current workflow step: <span className="font-mono">{stage}</span>. You can still submit fees for admin approval; consider moving the case to <strong>CCL Fee Proposal</strong> on the Overview tab if admin requests it.
          </p>
        )}
        {canSubmit && (
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-gray-50">
            <button type="button" onClick={handleSaveDraft} disabled={loading}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-black text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Save Draft
            </button>
            <button type="button" onClick={() => setFeeModalOpen(true)} disabled={loading || !totalAmount}
              className="rounded-xl bg-secondary px-4 py-2 text-xs font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90 transition-all disabled:opacity-50">
              {cclMeta?.status === "fee_rejected" || currentStatus === "Rejected"
                ? "Resubmit CCL fees for approval"
                : "Submit CCL fees for approval"}
            </button>
          </div>
        )}
      </div>

      <CclFeeProposalModal
        open={feeModalOpen} onClose={() => setFeeModalOpen(false)} busy={loading}
        initialFee={totalAmount || cclMeta?.feeAmount}
        initialPlan={cclMeta?.installmentPlan || cclMeta?.installment_plan}
        initialNotes={amountNotes || cclMeta?.notes}
        onSubmit={handleSubmitProposal} />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total fee", value: `£${total.toLocaleString()}`, color: "text-secondary" },
          { label: "Paid", value: `£${paid.toLocaleString()}`, color: "text-emerald-600" },
          { label: "Outstanding", value: `£${outstanding.toLocaleString()}`, color: "text-amber-600" },
        ].map((b) => (
          <div key={b.label} className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{b.label}</p>
            <p className={`text-base sm:text-lg font-black mt-0.5 tabular-nums ${b.color}`}>{b.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm overflow-x-auto">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Recorded Client Payments</p>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider font-black">
              <th className="py-2 pr-2">Date</th>
              <th className="py-2 pr-2">Description</th>
              <th className="py-2 text-right">Amount</th>
              <th className="py-2 pl-3">Status</th>
            </tr>
          </thead>
          <tbody className="font-bold text-gray-700 divide-y divide-gray-50">
            {paid > 0 ? (
              <tr>
                <td className="py-2.5 pr-2 whitespace-nowrap">{formatDateLong(new Date(), { month: "short" })}</td>
                <td className="py-2.5 pr-2 text-gray-600">Initial retainer coverage</td>
                <td className="py-2.5 text-right tabular-nums text-emerald-600 font-black">£{paid.toLocaleString()}</td>
                <td className="py-2.5 pl-3">
                  <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 text-[10px] font-black">Completed</span>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={4} className="py-5 text-center text-gray-400 font-medium">No successful payments recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CasesPaymentsTab;
