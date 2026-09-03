import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import Button from "../Button";
import DatePicker from "../DatePicker";

const emptyRow = () => ({ label: "", amount: "", dueDate: "" });

export default function CclFeeProposalModal({
  open,
  onClose,
  onSubmit,
  busy,
  initialFee,
  initialPlan,
  initialNotes,
}) {
  const [feeAmount, setFeeAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState([emptyRow()]);
  // BUG-032: instalments are optional — the default is one single full payment.
  const [useInstalments, setUseInstalments] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFeeAmount(initialFee != null ? String(initialFee) : "");
    setNotes(initialNotes || "");
    setRows(
      initialPlan?.length
        ? initialPlan.map((r) => ({
            label: r.label || "",
            amount: r.amount != null ? String(r.amount) : "",
            dueDate: r.dueDate ? String(r.dueDate).slice(0, 10) : "",
          }))
        : [emptyRow()],
    );
    // A saved plan that is just one "Full fee" row equals a single payment.
    const fee = Number.parseFloat(initialFee) || 0;
    const isSinglePayment =
      !initialPlan?.length ||
      (initialPlan.length === 1 &&
        Math.abs((Number.parseFloat(initialPlan[0].amount) || 0) - fee) <= 0.02);
    setUseInstalments(!isSinglePayment);
  }, [open, initialFee, initialPlan, initialNotes]);

  const total = Number.parseFloat(feeAmount) || 0;
  const instalmentSum = useMemo(
    () => rows.reduce((s, r) => s + (Number.parseFloat(r.amount) || 0), 0),
    [rows],
  );
  const instalmentCount = useMemo(
    () => rows.filter((r) => r.label || r.amount).length,
    [rows],
  );
  const sumMismatch = total > 0 && Math.abs(instalmentSum - total) > 0.02;

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      feeAmount: total,
      // No schedule = a single full payment (the server records it as "Full fee").
      installments: useInstalments
        ? rows
            .filter((r) => r.label || r.amount)
            .map((r) => ({
              label: r.label,
              amount: Number.parseFloat(r.amount) || 0,
              dueDate: r.dueDate || null,
            }))
        : [],
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-black text-secondary">Propose CCL fees &amp; instalments</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500">
            Admin must approve fees before the Client Care Letter is sent to the candidate.
          </p>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1">
              Total fee (£)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-black text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useInstalments}
                onChange={(e) => setUseInstalments(e.target.checked)}
                className="accent-secondary"
              />
              Offer payment in instalments (optional)
            </label>
            {!useInstalments && (
              <p className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mt-2">
                Single payment{total > 0 ? ` of £${total.toFixed(2)}` : ""} — no instalment schedule needed.
              </p>
            )}
          </div>

          {useInstalments && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-gray-500">
                Instalment schedule
              </label>
              <button
                type="button"
                onClick={() => setRows((prev) => [...prev, emptyRow()])}
                className="text-xs font-black text-primary flex items-center gap-1"
              >
                <Plus size={14} /> Add row
              </button>
            </div>
            <div className="space-y-2">
              {rows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <input
                    placeholder="Label"
                    value={row.label}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...next[idx], label: e.target.value };
                      setRows(next);
                    }}
                    className="col-span-4 rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-bold"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={row.amount}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...next[idx], amount: e.target.value };
                      setRows(next);
                    }}
                    className="col-span-3 rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-bold"
                  />
                  <div className="col-span-4">
                    <DatePicker
                      name="dueDate"
                      value={row.dueDate}
                      onChange={(e) => {
                        const next = [...rows];
                        next[idx] = { ...next[idx], dueDate: e.target.value };
                        setRows(next);
                      }}
                      placeholder="Select date"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setRows((prev) => prev.filter((_, i) => i !== idx))}
                    className="col-span-1 p-1.5 text-gray-400 hover:text-red-500"
                    disabled={rows.length <= 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            {/* BUG-033: always confirm how many instalments are set up */}
            <p
              className={`text-xs font-bold mt-2 ${
                sumMismatch || instalmentCount === 0 ? "text-amber-700" : "text-emerald-700"
              }`}
            >
              {instalmentCount} instalment{instalmentCount === 1 ? "" : "s"} set up · £
              {instalmentSum.toFixed(2)} of £{total.toFixed(2)}
              {!sumMismatch && instalmentCount > 0 ? " ✓" : ""}
            </p>
            {sumMismatch && (
              <p className="text-xs font-bold text-amber-700 mt-1">
                Instalments (£{instalmentSum.toFixed(2)}) must equal total (£{total.toFixed(2)})
              </p>
            )}
          </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1">
              Notes for admin (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end px-5 py-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={busy || total <= 0 || (useInstalments && (sumMismatch || instalmentCount === 0))}
          >
            {busy ? "Submitting…" : "Submit for admin approval"}
          </Button>
        </div>
      </form>
    </div>
  );
}
