import { useState, useEffect } from "react";
import { CheckCircle2, PoundSterling } from "lucide-react";
import { updateCaseFinance, recordManualCasePayment } from "../../services/caseDetailApi";
import { useToast } from "../../context/ToastContext";

const STATUS_OPTIONS = [
  { value: "Not Submitted", label: "Not submitted" },
  { value: "Pending Approval", label: "Pending approval" },
  { value: "Approved", label: "Approved (fees authorised)" },
  { value: "Paid", label: "Paid (fully received)" },
  { value: "Rejected", label: "Rejected" },
];

export default function AdminPaymentStatusControl({
  caseId,
  amountStatus = "Not Submitted",
  totalAmount = 0,
  paidAmount = 0,
  onSuccess,
}) {
  const { showToast } = useToast();
  const [status, setStatus] = useState(amountStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus(amountStatus);
  }, [amountStatus]);

  const total = Number(totalAmount) || 0;
  const paid = Number(paidAmount) || 0;
  const balance = Math.max(0, total - paid);
  const isPaid = status === "Paid" || (total > 0 && paid >= total - 0.02);

  const handleApplyStatus = async () => {
    if (!caseId) return;
    setLoading(true);
    try {
      if (status === "Paid") {
        await recordManualCasePayment(caseId, {
          markFullyPaid: true,
          paymentMethod: "Bank Transfer",
          description: "Marked as paid by administrator",
        });
        showToast({ message: "Case marked as fully paid." });
      } else {
        await updateCaseFinance(caseId, { amountStatus: status });
        showToast({ message: `Payment status updated to ${status}.` });
      }
      onSuccess?.();
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Failed to update payment status.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
          <PoundSterling size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h4 className="text-sm font-black text-secondary">Admin — payment status</h4>
          <p className="text-xs font-bold text-gray-500 mt-0.5">
            Set fee approval or mark the case as fully paid. Outstanding:{" "}
            <span className="text-indigo-700">£{balance.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {isPaid && (
        <p className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2">
          <CheckCircle2 size={16} />
          This case is recorded as fully paid.
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-black text-gray-600 mb-1.5">Payment status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:border-indigo-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={loading || status === amountStatus}
          onClick={handleApplyStatus}
          className="shrink-0 rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-xs font-black shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : status === "Paid" ? "Mark as paid" : "Apply status"}
        </button>
      </div>
    </div>
  );
}
