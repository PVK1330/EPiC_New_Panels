import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ShieldAlert, ShieldCheck, FileText, Send, RefreshCw } from "lucide-react";
import Input from "../Input";
import Button from "../Button";
import { updateCaseFinance, exportCaseInvoicePDF } from "../../services/caseDetailApi";
import { reviewCclFees, getCclStatus, sendCclPaymentRequest } from "../../services/workflowApi";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/datetime";

const METHODS = [
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Card", label: "Card" },
  { value: "Cheque", label: "Cheque" },
];

const CaseDetailPayments = ({ payments, onReload }) => {
  const { showToast } = useToast();
  const [method, setMethod] = useState("Card");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [ccl, setCcl] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [payReqAmount, setPayReqAmount] = useState("");

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
    ccl?.status === "fee_proposed" || currentStatus === "Pending Approval";

  const instalments = ccl?.installmentPlan || ccl?.installment_plan || [];

  // CCL released to the client but the fee is still outstanding → staff can
  // (re)send the CCL with a payment request.
  const _total = Number(payments?.totalAmount) || 0;
  const _paid = Number(payments?.paidAmount) || 0;
  const _outstanding = Math.max(0, _total - _paid);
  const paidInFull =
    String(currentStatus).toLowerCase() === "paid" ||
    ((_total > 0 || _paid > 0) && _outstanding <= 0.02);
  const cclIssuedUnpaid =
    (ccl?.status === "issued" || ccl?.status === "signed") && !paidInFull;
  const paymentReqSent = !!ccl?.paymentRequestSentAt;
  const outstanding = Math.max(
    0,
    (Number(payments?.totalAmount) || 0) - (Number(payments?.paidAmount) || 0),
  );

  const handleSendPaymentRequest = async () => {
    if (!caseRef) return;
    setLoading(true);
    try {
      await sendCclPaymentRequest(caseRef, {
        requestedAmount: payReqAmount || undefined,
      });
      showToast({ message: "Client Care Letter and payment request sent to client." });
      setPayReqAmount("");
      onReload?.();
    } catch (err) {
      showToast({
        variant: "danger",
        message:
          err?.response?.data?.message || "Failed to send payment request.",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleGenerateInvoice = async () => {
    if (!caseRef) {
      showToast({ variant: "danger", message: "Case reference unavailable." });
      return;
    }
    setGenerating(true);
    try {
      const res = await exportCaseInvoicePDF(caseRef);
      const cd = res.headers?.["content-disposition"] || "";
      const match = /filename="?([^";]+)"?/i.exec(cd);
      const filename = match ? match[1].trim() : `Invoice_${caseRef}.pdf`;
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast({ message: "Invoice downloaded." });
    } catch (err) {
      let message = "Failed to generate invoice PDF.";
      const blob = err?.response?.data;
      if (blob instanceof Blob) {
        try {
          const parsed = JSON.parse(await blob.text());
          if (parsed?.message) message = parsed.message;
        } catch {
          /* keep default */
        }
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      }
      showToast({ variant: "danger", message });
    } finally {
      setGenerating(false);
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
                  <li key={row.label}>
                    {row.label}: £{Number(row.amount).toFixed(2)}
                    {row.dueDate
                      ? ` — due ${formatDate(row.dueDate)}`
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

        {cclIssuedUnpaid && (
          <div className="pt-4 mt-4 border-t border-gray-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-bold text-gray-500 space-y-1">
              <p>
                CCL issued — payment still outstanding
                {outstanding > 0 ? ` (£${outstanding.toFixed(2)})` : ""}.
                {paymentReqSent ? " Resend" : " Send"} the Client Care Letter with
                a payment request to the client.
              </p>
              {paymentReqSent && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-[11px] font-bold text-green-700">
                  <CheckCircle2 size={13} strokeWidth={2.5} /> Payment request sent
                  {ccl?.paymentRequestCount > 1
                    ? ` (${ccl.paymentRequestCount}×)`
                    : ""}
                  {ccl?.paymentRequestSentAt
                    ? ` — ${formatDate(ccl.paymentRequestSentAt)}`
                    : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center rounded-xl border border-gray-200 bg-white px-2">
                <span className="text-xs font-black text-gray-400">£</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={payReqAmount}
                  onChange={(e) => setPayReqAmount(e.target.value)}
                  placeholder={outstanding ? outstanding.toFixed(2) : "Amount"}
                  className="w-24 px-1 py-2 text-xs font-bold outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSendPaymentRequest}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-secondary text-white px-5 py-2 text-xs font-black shadow-md shadow-secondary/20 hover:bg-secondary-dark transition-all disabled:opacity-50"
              >
                {paymentReqSent ? (
                  <RefreshCw size={15} strokeWidth={2.5} />
                ) : (
                  <Send size={15} strokeWidth={2.5} />
                )}
                {loading
                  ? "Sending…"
                  : paymentReqSent
                    ? "Resend CCL & payment"
                    : "Send CCL & payment request"}
              </button>
            </div>
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
          <div className="overflow-auto max-h-[68vh] rounded-xl border border-gray-100">
            <table className="w-full min-w-0 text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 text-left">
                  {["Sr No", "Date", "Amount", "Method", "Invoice"].map((h) => (
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
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">
                      No payment records yet.
                    </td>
                  </tr>
                ) : (
                  (payments?.history || []).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/80">
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-black text-gray-500 tabular-nums">
                          {i + 1}
                        </span>
                      </td>
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
          <Button
            type="button"
            variant="primary"
            onClick={handleGenerateInvoice}
            disabled={generating}
            className="rounded-xl w-full mt-4"
          >
            {generating ? "Generating…" : "Generate Invoice PDF"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CaseDetailPayments;
