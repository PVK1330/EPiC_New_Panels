import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PoundSterling, Loader2, CheckCircle, XCircle } from "lucide-react";
import Button from "../../components/Button";
import { useToast } from "../../context/ToastContext";
import { getPendingCclFeeApprovals, reviewCclFees } from "../../services/workflowApi";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminCclFeeApprovals() {
  const { showToast } = useToast();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [notes, setNotes] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPendingCclFeeApprovals();
      setCases(res.data?.data?.cases || []);
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Failed to load pending approvals",
      });
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReview = async (caseRef, action) => {
    setBusyId(caseRef);
    try {
      await reviewCclFees(caseRef, {
        action,
        reviewNotes: notes[caseRef] || "",
      });
      showToast({
        message:
          action === "approve"
            ? "Fees approved — CCL sent to client"
            : "Returned to caseworker for revision",
      });
      await load();
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Action failed",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black text-secondary tracking-tight flex items-center gap-3">
          <PoundSterling className="text-primary" size={32} />
          CCL fee approvals
        </h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Review caseworker fee proposals before the Client Care Letter is released to candidates.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
          <Loader2 className="animate-spin" size={18} /> Loading…
        </div>
      ) : cases.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-3" size={40} />
          <p className="font-black text-secondary">No pending fee approvals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => {
            const ccl = c.cclRecord || {};
            const plan = ccl.installmentPlan || ccl.installment_plan || [];
            const caseRef = c.caseId;
            const candidate = c.candidate
              ? `${c.candidate.first_name || ""} ${c.candidate.last_name || ""}`.trim()
              : "Unknown";

            return (
              <article
                key={caseRef}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-mono font-bold text-primary">{caseRef}</p>
                    <p className="text-lg font-black text-secondary">{candidate}</p>
                    <p className="text-xs font-bold text-gray-500">{c.visaType?.name || "—"}</p>
                  </div>
                  <p className="text-2xl font-black text-secondary">
                    £{Number(ccl.feeAmount || 0).toFixed(2)}
                  </p>
                </div>

                {plan.length > 0 && (
                  <ul className="text-sm font-bold text-gray-700 space-y-1 border-t border-gray-50 pt-3">
                    {plan.map((row, i) => (
                      <li key={i} className="flex justify-between gap-2">
                        <span>{row.label}</span>
                        <span>
                          £{Number(row.amount).toFixed(2)}
                          {row.dueDate ? ` · ${formatDate(row.dueDate)}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {ccl.notes && (
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">{ccl.notes}</p>
                )}

                <textarea
                  value={notes[caseRef] || ""}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [caseRef]: e.target.value }))}
                  placeholder="Admin notes (optional)"
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
                />

                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={busyId === caseRef}
                    onClick={() => handleReview(caseRef, "approve")}
                  >
                    {busyId === caseRef ? "Working…" : (
                      <>
                        <CheckCircle size={16} className="mr-1.5 inline" />
                        Approve &amp; send CCL
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busyId === caseRef}
                    onClick={() => handleReview(caseRef, "reject")}
                  >
                    <XCircle size={16} className="mr-1.5 inline" />
                    Return to caseworker
                  </Button>
                  <Link
                    to={`/admin/case-detail/${encodeURIComponent(String(caseRef).replace(/^#/, ""))}`}
                    className="text-xs font-black text-primary hover:underline self-center ml-auto"
                  >
                    Open case
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
