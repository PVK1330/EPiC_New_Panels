import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import Button from "../Button";
import {
  getCaseWorkflowBundle,
  sendDataCaptureRequest,
  reviewDataCapture,
  issueCcl,
} from "../../services/workflowApi";

function apiErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "Request failed";
}

export default function CaseWorkflowActions({ caseId, totalAmount, onRefresh }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [bundle, setBundle] = useState(null);

  const load = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    try {
      const res = await getCaseWorkflowBundle(caseId);
      setBundle(res.data?.data);
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
    try {
      await fn();
      showToast({ message: "Done." });
      await load();
      onRefresh?.();
    } catch (e) {
      showToast({ variant: "danger", message: apiErrorMessage(e) });
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

  return (
    <div className="rounded-xl border border-primary/15 bg-white p-4 space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-primary">
        Process actions (docx workflow)
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!!busy}
          onClick={() =>
            run("dcs-send", () => sendDataCaptureRequest(caseId))
          }
        >
          {busy === "dcs-send" ? "Sending…" : "Send Data Capture Sheet"}
        </Button>

        {dcs?.status === "submitted" && (
          <>
            <Button
              type="button"
              disabled={!!busy}
              onClick={() =>
                run("dcs-approve", () => reviewDataCapture(caseId, "approved"))
              }
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

      <div className="text-[11px] font-bold text-gray-500 space-y-1">
        <p>
          Data Capture:{" "}
          <span className="text-secondary">{dcs?.status || "not started"}</span>
        </p>
        <p>
          CCL: <span className="text-secondary">{ccl?.status || "pending"}</span>
        </p>
      </div>
    </div>
  );
}
