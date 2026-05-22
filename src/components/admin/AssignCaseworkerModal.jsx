import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import Button from "../Button";
import Input from "../Input";
import { assignCase, getCaseworkers } from "../../services/caseApi";
import { useToast } from "../../context/ToastContext";

export default function AssignCaseworkerModal({
  open,
  onClose,
  caseRow,
  onSuccess,
}) {
  const { showToast } = useToast();
  const [caseworkers, setCaseworkers] = useState([]);
  const [assignTo, setAssignTo] = useState([]);
  const [reason, setReason] = useState("");
  const [proposedAmount, setProposedAmount] = useState("");
  const [reasonErr, setReasonErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFetching(true);
    getCaseworkers({ limit: 999 })
      .then((res) => {
        const data = res?.data?.data;
        const list =
          data?.caseworker ||
          data?.caseworkers ||
          (Array.isArray(data) ? data : []);
        setCaseworkers(
          list.filter((u) => u.status !== "inactive" && u.status !== "suspended"),
        );
      })
      .catch(() => setCaseworkers([]))
      .finally(() => setFetching(false));

    const ids = Array.isArray(caseRow?.caseworkerIds)
      ? caseRow.caseworkerIds
      : caseRow?.assignedcaseworkerId
        ? Array.isArray(caseRow.assignedcaseworkerId)
          ? caseRow.assignedcaseworkerId
          : [caseRow.assignedcaseworkerId]
        : [];
    setAssignTo(ids.map(Number).filter(Boolean));
    setReason("");
    setProposedAmount(
      caseRow?.proposedAmount != null ? String(caseRow.proposedAmount) : "",
    );
    setReasonErr("");
  }, [open, caseRow]);

  const toggleWorker = (id) => {
    setAssignTo((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const currentNames = useMemo(() => {
    if (!caseRow) return "";
    if (caseRow.caseworker && !caseRow.caseworker.includes("assigned")) {
      return caseRow.caseworker;
    }
    return assignTo
      .map((id) => {
        const w = caseworkers.find((c) => Number(c.id) === Number(id));
        return w ? `${w.first_name} ${w.last_name}` : null;
      })
      .filter(Boolean)
      .join(", ");
  }, [caseRow, assignTo, caseworkers]);

  const submit = async () => {
    if (!caseRow?.caseId) return;
    if (assignTo.length === 0) {
      setReasonErr("Select at least one caseworker (max 2)");
      return;
    }
    if (!reason.trim()) {
      setReasonErr("Assignment reason is required");
      return;
    }
    setReasonErr("");
    setLoading(true);
    try {
      const assignToNames = caseworkers
        .filter((cw) => assignTo.includes(cw.id))
        .map((cw) => `${cw.first_name} ${cw.last_name}`)
        .join(", ");

      await assignCase(caseRow.caseId, {
        assignTo,
        assignToName: assignToNames,
        reason: reason.trim(),
        proposedAmount: proposedAmount !== "" ? parseFloat(proposedAmount) : undefined,
      });

      showToast({ message: "Caseworker(s) assigned successfully", variant: "success" });
      onSuccess?.();
      onClose();
    } catch (error) {
      showToast({
        message: error?.response?.data?.message || "Failed to assign caseworkers",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
        <motion.div
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-black text-secondary">Assign Caseworker</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {caseRow?.caseId} — {caseRow?.candidate || "Case"}
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-sm">
              <span className="font-bold text-gray-500">Currently: </span>
              <span className="font-bold text-secondary">{currentNames || "Unassigned"}</span>
            </div>

            <p className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              Select up to 2 active caseworkers. The CCL fee you enter is issued to the candidate
              immediately — they must pay this amount via the Client Care Letter and Payments area.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-100 rounded-xl p-2">
              {fetching && (
                <p className="text-sm text-gray-400 text-center py-4">Loading caseworkers…</p>
              )}
              {!fetching && caseworkers.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No caseworkers available</p>
              )}
              {caseworkers.map((worker) => {
                const checked = assignTo.includes(worker.id);
                const disabled = !checked && assignTo.length >= 2;
                return (
                  <label
                    key={worker.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? "border-secondary bg-secondary/5"
                        : disabled
                          ? "opacity-40 cursor-not-allowed border-gray-100"
                          : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleWorker(worker.id)}
                      className="accent-secondary"
                    />
                    <span className="text-sm font-bold text-gray-800">
                      {worker.first_name} {worker.last_name}
                    </span>
                    {checked && <Check size={16} className="ml-auto text-secondary" />}
                  </label>
                );
              })}
            </div>

            <Input
              label="CCL fee (£) — amount candidate must pay"
              type="number"
              min="0"
              step="0.01"
              value={proposedAmount}
              onChange={(e) => setProposedAmount(e.target.value)}
              placeholder="e.g. 1500.00"
            />

            <div>
              <label className="text-sm font-medium text-gray-700">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Why is this caseworker being assigned?"
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none resize-none"
              />
              {reasonErr && (
                <p className="text-xs text-red-500 mt-1">{reasonErr}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={loading || fetching}>
              {loading ? "Saving…" : "Assign"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
