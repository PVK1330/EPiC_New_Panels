import { useCallback, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import Button from "../Button";
import {
  getCaseWorkflowBundle,
  getDataCapture,
  sendDataCaptureRequest,
  reviewDataCapture,
  issueCcl,
} from "../../services/workflowApi";

function apiErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "Request failed";
}

function ResponseModal({ open, onClose, responses, fields }) {
  if (!open) return null;
  const entries = Object.entries(responses || {});
  const labelFor = (key) => {
    const field = (fields || []).find((f) => f.key === key || f.id === key);
    return field?.label || field?.name || key.replace(/_/g, " ");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-black text-secondary">Candidate response</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <dl className="overflow-y-auto p-5 space-y-3 text-sm">
          {entries.length === 0 ? (
            <p className="text-gray-500 font-bold">No responses recorded.</p>
          ) : (
            entries.map(([key, value]) => (
              <div key={key} className="border-b border-gray-50 pb-2">
                <dt className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  {labelFor(key)}
                </dt>
                <dd className="font-bold text-secondary mt-0.5">{String(value ?? "—")}</dd>
              </div>
            ))
          )}
        </dl>
      </div>
    </div>
  );
}

export default function CaseWorkflowActions({ caseId, totalAmount, amountStatus, onRefresh }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [bundle, setBundle] = useState(null);
  const [dcsDetail, setDcsDetail] = useState(null);
  const [showResponse, setShowResponse] = useState(false);
  const [stageError, setStageError] = useState("");

  const load = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setStageError("");
    try {
      const [bundleRes, dcsRes] = await Promise.all([
        getCaseWorkflowBundle(caseId),
        getDataCapture(caseId).catch(() => null),
      ]);
      setBundle(bundleRes.data?.data);
      setDcsDetail(dcsRes?.data?.data || null);
    } catch (e) {
      showToast({ variant: "danger", message: apiErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }, [caseId, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (key, fn) => {
    setBusy(key);
    setStageError("");
    try {
      await fn();
      showToast({ message: "Done." });
      await load();
      onRefresh?.();
    } catch (e) {
      const msg = apiErrorMessage(e);
      if (e?.response?.status === 400) setStageError(msg);
      showToast({ variant: "danger", message: msg });
    } finally {
      setBusy("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 py-2">
        <Loader2 size={14} className="animate-spin" /> Loading workflow actions…
      </div>
    );
  }

  const dcs = bundle?.dataCapture?.submission;
  const ccl = bundle?.ccl;
  const responses = dcsDetail?.candidateResponse || dcs?.responses;
  const fields = dcsDetail?.fields || bundle?.dataCapture?.template?.fields || [];
  const paid =
    amountStatus === "paid" ||
    (Number(totalAmount) > 0 && Number(bundle?.paidAmount) >= Number(totalAmount));

  return (
    <>
      <div className="rounded-xl border border-primary/15 bg-white p-4 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Process actions (docx workflow)
        </p>

        {stageError && (
          <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            Cannot advance: {stageError}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!!busy}
            onClick={() => run("dcs-send", () => sendDataCaptureRequest(caseId))}
          >
            {busy === "dcs-send" ? "Sending…" : "Send Data Capture Sheet"}
          </Button>

          {dcs?.status === "submitted" && (
            <>
              <Button
                type="button"
                disabled={!!busy}
                onClick={() => run("dcs-approve", () => reviewDataCapture(caseId, "approved"))}
              >
                Approve DCS
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!!busy}
                onClick={() =>
                  run("dcs-reject", () =>
                    reviewDataCapture(caseId, "rejected", "Please correct and resubmit"),
                  )
                }
              >
                Reject DCS
              </Button>
            </>
          )}

          {(dcs?.status === "submitted" || dcs?.status === "approved") && responses && (
            <Button type="button" variant="outline" onClick={() => setShowResponse(true)}>
              View candidate response
            </Button>
          )}

          <Button
            type="button"
            disabled={!!busy || ccl?.status === "issued" || ccl?.status === "signed"}
            onClick={() =>
              run("ccl-issue", () =>
                issueCcl(caseId, {
                  feeAmount: totalAmount != null ? Number(totalAmount) : undefined,
                }),
              )
            }
          >
            {busy === "ccl-issue" ? "Issuing…" : "Issue Client Care Letter"}
          </Button>
        </div>

        <div className="text-[11px] font-bold text-gray-500 space-y-1.5">
          <p>
            Data Capture:{" "}
            <span className="text-secondary">{dcs?.status || "not started"}</span>
            {dcs?.status === "approved" && (
              <span className="ml-2 text-green-600">DCS Reviewed ✓</span>
            )}
          </p>
          <p className="flex flex-wrap items-center gap-2">
            CCL:{" "}
            {ccl?.status === "signed" ? (
              <span className="text-green-600">Accepted ✓</span>
            ) : ccl?.status === "issued" ? (
              <span className="text-amber-600">Awaiting candidate acceptance</span>
            ) : (
              <span className="text-secondary">{ccl?.status || "pending"}</span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${
                paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"
              }`}
            >
              Payment: {paid ? "received" : "outstanding"}
            </span>
          </p>
        </div>
      </div>

      <ResponseModal
        open={showResponse}
        onClose={() => setShowResponse(false)}
        responses={responses}
        fields={fields}
      />
    </>
  );
}
