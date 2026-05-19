import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ShieldAlert, ShieldCheck, FileText } from "lucide-react";
import Input from "../Input";
import Button from "../Button";
import { updateCaseFinance } from "../../services/caseDetailApi";
import { reviewCclFees, getCclStatus } from "../../services/workflowApi";
import { useToast } from "../../context/ToastContext";

const METHODS = [
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Card", label: "Card" },
  { value: "Cheque", label: "Cheque" },
];

const CaseDetailPayments = ({ payments, onReload }) => {
  const { showToast } = useToast();
  const [method, setMethod] = useState("Card");
  const [loading, setLoading] = useState(false);
  const [ccl, setCcl] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const caseRef = payments?.caseId;
  const caseStage = payments?.caseStage;

  useEffect(() => {
    if (!caseRef) return;
    getCclStatus(caseRef)
      .then((data) => setCcl(data?.ccl || null))
      .catch(() => setCcl(null));
  }, [caseRef, payments?.amountStatus, caseStage]);

  const currentStatus = payments?.amountStatus || "Not Submitted";
  const cclPending =
    ccl?.status === "fee_proposed" ||
    caseStage === "ccl_fee_admin_review" ||
    currentStatus === "Pending Approval";

  const instalments = ccl?.installmentPlan || ccl?.installment_plan || [];

  const handleCclReview = async (action) => {
    if (!caseRef) return;
    setLoading(true);
    try {
      await reviewCclFees(caseRef, {
        action,
        reviewNotes: reviewNotes.trim() || undefined,
      });
      showToast({
        message:
          action === "approve"
            ? "Fees approved — Client Care Letter sent to candidate."
            : "Proposal returned to caseworker.",
      });
      setReviewNotes("");
      onReload?.();
    } catch (err) {
      console.error("CCL review error:", err);
      showToast({
        variant: "danger",
        message:
          err?.response?.data?.message ||
          `Failed to ${action === "approve" ? "approve" : "reject"} fee proposal.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLegacyApproval = async (approved) => {
    if (!payments?.caseId) return;
    setLoading(true);
    const targetStatus = approved ? "Approved" : "Rejected";
    try {
      await updateCaseFinance(payments.caseId, { amountStatus: targetStatus });
      showToast({ message: `Financial request has been ${targetStatus.toLowerCase()}.` });
      onReload?.();
    } catch (err) {
      console.error("Approval action error:", err);
      showToast({
        variant: "danger",
        message: `Failed to ${approved ? "approve" : "reject"} financial request.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    "Not Submitted": "bg-gray-100 text-gray-700 border-gray-200",
    "Pending Approval": "bg-amber-50 text-amber-800 border-amber-200",
    Approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Paid: "bg-blue-50 text-blue-800 border-blue-200",
    Rejected: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-secondary/15 bg-gradient-to-br from-secondary/[0.04] to-secondary/[0.01] p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100/80">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                currentStatus === "Approved"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : cclPending
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              {currentStatus === "Approved" ? (
                <ShieldCheck size={22} strokeWidth={2.5} />
              ) : cclPending ? (
                <ShieldAlert size={22} strokeWidth={2.5} />
              ) : (
                <FileText size={22} strokeWidth={2.5} />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 tracking-tight">
                CCL fee proposal — admin review
              </h3>
              <p className="text-xs font-bold text-gray-500 mt-0.5">
                Approve to release the Client Care Letter and payment schedule to the candidate.
              </p>
            </div>
            </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border shadow-2xs ${
              statusColors[currentStatus] || statusColors["Not Submitted"]
            }`}
          >
            {cclPending ? "Awaiting your approval" : currentStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="rounded-xl bg-white/80 border border-gray-100 p-3.5">
            <span className="block text-[10px] font-black uppercase text-gray-400">
              Proposed Total Fee
            </span>
            <span className="block text-xl font-black text-secondary mt-0.5 tabular-nums">
              {ccl?.feeAmount != null
                ? `£${Number(ccl.feeAmount).toLocaleString()}`
                : payments.total}
            </span>
          </div>
          <div className="md:col-span-2 rounded-xl bg-white/80 border border-gray-100 p-3.5">
            <span className="block text-[10px] font-black uppercase text-gray-400 mb-1">
              Instalment plan
            </span>
            {instalments.length > 0 ? (
              <ul className="text-xs font-bold text-gray-700 space-y-1">
                {instalments.map((row, i) => (
                  <li key={i}>
                    {row.label}: £{Number(row.amount).toFixed(2)}
                    {row.dueDate
                      ? ` — due ${new Date(row.dueDate).toLocaleDateString("en-GB")}`
                      : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs font-bold text-gray-700 italic">
                {payments?.amountNotes
                  ? `"${payments.amountNotes}"`
                  : "No instalment breakdown provided."}
              </p>
            )}
          </div>
        </div>

        {cclPending && (
          <div className="pt-4 mt-4 border-t border-gray-100/80 space-y-3">
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Admin notes (optional — shown to caseworker if returned)"
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold resize-none"
            />
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link
                to="/admin/ccl-fee-approvals"
                className="text-xs font-black text-primary hover:underline mr-auto"
              >
                View all pending approvals →
              </Link>
              <button
                type="button"
                onClick={() => handleCclReview("reject")}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-xs font-black hover:bg-red-100 transition-all disabled:opacity-50"
              >
                <XCircle size={15} strokeWidth={2.5} />
                Return to caseworker
              </button>
              <button
                type="button"
                onClick={() => handleCclReview("approve")}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-5 py-2 text-xs font-black shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                <CheckCircle2 size={15} strokeWidth={2.5} />
                {loading ? "Processing…" : "Approve & send CCL to client"}
              </button>
            </div>
          </div>
        )}

        {!cclPending && currentStatus === "Pending Approval" && !ccl && (
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100/80">
            <button
              type="button"
              onClick={() => handleLegacyApproval(false)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-xs font-black hover:bg-red-100 transition-all disabled:opacity-50"
            >
              <XCircle size={15} strokeWidth={2.5} />
              Reject Proposal
            </button>
            <button
              type="button"
              onClick={() => handleLegacyApproval(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-5 py-2 text-xs font-black shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              <CheckCircle2 size={15} strokeWidth={2.5} />
              Authorize (legacy)
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-black text-secondary mb-4 pb-2 border-b border-gray-100">
            Payment Summary
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Fee</p>
              <p className="text-xl font-black text-secondary">{payments.total}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-green-50 border border-green-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Paid</p>
              <p className="text-xl font-black text-green-600">{payments.paid}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Balance</p>
              <p className="text-xl font-black text-green-600">{payments.balance}</p>
            </div>
          </div>
          <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
            Payment History
          </h4>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Date", "Amount", "Method", "Invoice"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(payments?.history?.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">
                      No payment records yet.
                    </td>
                  </tr>
                ) : (
                  (payments?.history || []).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/80">
                      <td className="px-4 py-2.5 text-gray-600">{row.date}</td>
                      <td className="px-4 py-2.5 text-green-600 font-bold">{row.amount}</td>
                      <td className="px-4 py-2.5 text-gray-600">{row.method}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{row.invoice}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-fit">
          <h3 className="text-sm font-black text-secondary mb-4 pb-2 border-b border-gray-100">
            Invoice Details
          </h3>
          <Input
            label="Invoice ID"
            name="inv"
            value={payments.invoiceId}
            onChange={() => {}}
            readOnly
            className="mb-3"
          />
          <Input
            label="Payment Method"
            name="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            options={METHODS}
          />
          <Button type="button" variant="primary" className="rounded-xl w-full mt-4">
            Generate Invoice PDF
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CaseDetailPayments;
