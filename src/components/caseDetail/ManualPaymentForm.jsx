import { useState } from "react";
import { Banknote, CheckCircle2 } from "lucide-react";
import Button from "../Button";
import Input from "../Input";
import { recordManualCasePayment } from "../../services/caseDetailApi";
import { useToast } from "../../context/ToastContext";

const METHODS = [
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Card", label: "Card" },
  { value: "Cheque", label: "Cheque" },
  { value: "Cash", label: "Cash" },
  { value: "Online", label: "Online" },
];

export default function ManualPaymentForm({
  caseId,
  totalAmount = 0,
  paidAmount = 0,
  onSuccess,
  className = "",
}) {
  const { showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank Transfer");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const total = Number(totalAmount) || 0;
  const paid = Number(paidAmount) || 0;
  const balance = Math.max(0, total - paid);
  const isFullyPaid = balance <= 0 && total > 0;

  const handleRecord = async (markFullyPaid = false) => {
    if (!caseId) return;
    setLoading(true);
    try {
      const res = await recordManualCasePayment(caseId, {
        amount: markFullyPaid ? undefined : Number.parseFloat(amount) || 0,
        paymentMethod: method,
        description: description.trim() || undefined,
        markFullyPaid,
      });
      const data = res.data?.data ?? res.data;
      showToast({
        message:
          res.data?.message ||
          (markFullyPaid ? "Case marked as fully paid." : "Payment recorded successfully."),
      });
      setAmount("");
      setDescription("");
      onSuccess?.(data);
    } catch (err) {
      showToast({
        variant: "danger",
        message:
          err?.response?.data?.message || "Failed to record manual payment.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 space-y-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
          <Banknote size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h4 className="text-sm font-black text-secondary">Record manual payment</h4>
          <p className="text-xs font-bold text-gray-500 mt-0.5">
            Mark bank transfer, cheque, or cash as received. Outstanding balance:{" "}
            <span className="text-emerald-700">£{balance.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {isFullyPaid ? (
        <p className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 rounded-xl px-3 py-2">
          This case is fully paid. No further manual payments needed.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="manual-payment-amount" className="block text-xs font-black text-gray-600 mb-1.5">Amount (£)</label>
              <input
                id="manual-payment-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={balance > 0 ? balance.toFixed(2) : "0.00"}
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:border-emerald-500"
              />
            </div>
            <Input
              label="Payment method"
              name="manualMethod"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              options={METHODS}
            />
          </div>
          <div>
            <label htmlFor="manual-payment-notes" className="block text-xs font-black text-gray-600 mb-1.5">Notes (optional)</label>
            <input
              id="manual-payment-notes"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. BACS ref, receipt number"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              variant="primary"
              className="rounded-xl"
              disabled={loading || !amount}
              onClick={() => handleRecord(false)}
            >
              {loading ? "Saving…" : "Record payment"}
            </Button>
            {balance > 0 && (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleRecord(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white text-emerald-800 px-4 py-2 text-xs font-black hover:bg-emerald-50 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 size={15} />
                Mark fully paid (£{balance.toLocaleString()})
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
