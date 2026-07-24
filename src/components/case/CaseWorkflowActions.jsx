import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Loader2, X, CheckCircle2, RefreshCw } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import Button from "../Button";
import CclFeeProposalModal from "./CclFeeProposalModal";
import CaseWorkflowPostCcl from "./CaseWorkflowPostCcl";
import { formatDate } from "../../utils/datetime";
import {
  getCaseWorkflowBundle,
  getDataCapture,
  sendDataCaptureRequest,
  reviewDataCapture,
  proposeCclFees,
  reviewCclFees,
  sendCclPaymentRequest,
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

function cclStatusLabel(ccl, caseStage) {
  if (!ccl) return "not started";
  if (ccl.status === "signed") return "Accepted by client ✓";
  if (ccl.status === "issued") return "With client — awaiting acceptance";
  if (ccl.status === "fee_proposed") {
    return "Awaiting admin fee approval";
  }
  if (ccl.status === "fee_rejected") return "Returned by admin — revise proposal";
  return ccl.status;
}

export default function CaseWorkflowActions({ caseId, totalAmount, amountStatus, caseStage, onRefresh }) {
  const { showToast } = useToast();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "admin" || Number(user?.role_id) === 3;

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [bundle, setBundle] = useState(null);
  const [dcsDetail, setDcsDetail] = useState(null);
  const [showResponse, setShowResponse] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [stageError, setStageError] = useState("");
  const [payReqAmount, setPayReqAmount] = useState("");

  const load = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setStageError("");
    try {
      const [bundleRes, dcsRes] = await Promise.all([
        getCaseWorkflowBundle(caseId),
        getDataCapture(caseId).catch(() => null),
      ]);
      setBundle(bundleRes);
      setDcsDetail(dcsRes || null);
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
  const stage = caseStage || bundle?.caseStage;
  const responses = dcsDetail?.candidateResponse || dcs?.responses;
  const fields = dcsDetail?.fields || bundle?.dataCapture?.template?.fields || [];
  // Payment figures: prefer the live bundle (authoritative), fall back to props.
  const totalFee = Number(bundle?.totalAmount ?? totalAmount) || 0;
  const paidAmount = Number(bundle?.paidAmount) || 0;
  const payStatus = String(bundle?.amountStatus ?? amountStatus ?? "").toLowerCase();
  const outstanding = Math.max(0, totalFee - paidAmount);
  const hasPaymentActivity = totalFee > 0 || paidAmount > 0;
  // Settled when the status is explicitly Paid, or there is no remaining balance
  // once any fee/payment exists (covers cases where the fee total is 0 but money
  // has already been received).
  const paid = payStatus === "paid" || (hasPaymentActivity && outstanding <= 0.02);
  const partiallyPaid = !paid && paidAmount > 0 && outstanding > 0.02;
  const noFeeSet = totalFee <= 0 && paidAmount <= 0;

  const canProposeFees =
    !isAdmin &&
    ccl?.status !== "issued" &&
    ccl?.status !== "signed" &&
    ccl?.status !== "fee_proposed" &&
    ([
      "draft_application_review",
      "client_care_letter",
      "application_preparation",
      "document_review",
    ].includes(stage) ||
      ccl?.status === "fee_rejected");

  const adminCanReview = isAdmin && ccl?.status === "fee_proposed";

  // CCL is released to the client but the fee is still outstanding — staff can
  // (re)send the CCL together with a payment request.
  const cclIssuedUnpaid =
    (ccl?.status === "issued" || ccl?.status === "signed") && !paid;
  const paymentReqSent = !!ccl?.paymentRequestSentAt;

  const instalments = ccl?.installmentPlan || ccl?.installment_plan || [];

  return (
    <>
      <div className="rounded-xl border border-primary/15 bg-white p-4 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
          Process actions
        </p>

        {stageError && (
          <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {stageError}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {!dcs ? (
            <Button
              type="button"
              variant="outline"
              disabled={!!busy}
              onClick={() => run("dcs-send", () => sendDataCaptureRequest(caseId))}
            >
              {busy === "dcs-send" ? "Sending…" : "Send Upload Documents"}
            </Button>
          ) : (
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-[11px] font-bold text-green-700">
                <CheckCircle2 size={13} /> Upload Documents sent
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!!busy}
                onClick={() =>
                  run("dcs-send", () => sendDataCaptureRequest(caseId))
                }
              >
                {busy === "dcs-send" ? (
                  "Resending…"
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <RefreshCw size={13} /> Resend
                  </span>
                )}
              </Button>
            </div>
          )}

          {dcs?.status === "submitted" && (
            <>
              <Button
                type="button"
                disabled={!!busy}
                onClick={() =>
                  run("dcs-approve", () =>
                    reviewDataCapture(caseId, { status: "approved" }),
                  )
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
                    reviewDataCapture(caseId, {
                      status: "rejected",
                      reviewNotes: "Please correct and resubmit",
                    }),
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

          {canProposeFees && (
            <Button type="button" disabled={!!busy} onClick={() => setShowFeeModal(true)}>
              {ccl?.status === "fee_rejected" ? "Revise fee proposal" : "Propose CCL fees"}
            </Button>
          )}

          {adminCanReview && (
            <>
              <Button
                type="button"
                disabled={!!busy}
                onClick={() =>
                  run("ccl-approve", () =>
                    reviewCclFees(caseId, { action: "approve", reviewNotes: rejectNotes }),
                  )
                }
              >
                {busy === "ccl-approve" ? "Approving…" : "Approve & send CCL to client"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!!busy}
                onClick={() =>
                  run("ccl-reject", () =>
                    reviewCclFees(caseId, { action: "reject", reviewNotes: rejectNotes }),
                  )
                }
              >
                Return to caseworker
              </Button>
            </>
          )}

          {cclIssuedUnpaid && (
            <div className="flex flex-wrap items-center gap-2">
              {paymentReqSent && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-[11px] font-bold text-green-700">
                  <CheckCircle2 size={13} /> Payment request sent
                  {ccl?.paymentRequestCount > 1
                    ? ` (${ccl.paymentRequestCount}×)`
                    : ""}
                </span>
              )}
              <div className="flex items-center rounded-lg border border-gray-200 bg-white px-2">
                <span className="text-xs font-bold text-gray-400">£</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={payReqAmount}
                  onChange={(e) => setPayReqAmount(e.target.value)}
                  placeholder={outstanding ? outstanding.toFixed(2) : "Amount"}
                  className="w-24 px-1 py-1.5 text-xs font-bold outline-none"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={!!busy}
                onClick={() =>
                  run("ccl-payment-request", async () => {
                    await sendCclPaymentRequest(caseId, {
                      requestedAmount: payReqAmount || undefined,
                    });
                    setPayReqAmount("");
                  })
                }
              >
                {busy === "ccl-payment-request" ? (
                  "Sending…"
                ) : paymentReqSent ? (
                  <span className="inline-flex items-center gap-1">
                    <RefreshCw size={13} /> Resend CCL & payment
                  </span>
                ) : (
                  "Send CCL & payment request"
                )}
              </Button>
            </div>
          )}
        </div>

        {adminCanReview && ccl && (
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs space-y-2">
            <p className="font-black text-amber-900">
              Proposed total: £{Number(ccl.feeAmount || 0).toFixed(2)}
            </p>
            {instalments.length > 0 && (
              <ul className="space-y-1 font-bold text-amber-950">
                {instalments.map((row, i) => (
                  <li key={row.label}>
                    {row.label}: £{Number(row.amount).toFixed(2)}
                    {row.dueDate ? ` — due ${formatDate(row.dueDate)}` : ""}
                  </li>
                ))}
              </ul>
            )}
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Admin notes (optional — shown when returning to caseworker)"
              rows={2}
              className="w-full rounded-lg border border-amber-200 px-2 py-1.5 text-xs resize-none"
            />
          </div>
        )}

        <div className="text-[11px] font-bold text-gray-500 space-y-1.5">
          <p>
            Data Capture:{" "}
            <span className="text-secondary">{dcs?.status || "not started"}</span>
            {dcs?.status === "approved" && (
              <span className="ml-2 text-green-600">DCS Reviewed ✓</span>
            )}
          </p>
          <p className="flex flex-wrap items-center gap-2">
            CCL: <span className="text-secondary">{cclStatusLabel(ccl, stage)}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${
                paid
                  ? "bg-green-100 text-green-700"
                  : partiallyPaid
                    ? "bg-blue-100 text-blue-700"
                    : noFeeSet
                      ? "bg-gray-100 text-gray-600"
                      : "bg-amber-100 text-amber-800"
              }`}
            >
              Payment:{" "}
              {paid
                ? "paid"
                : partiallyPaid
                  ? `part-paid (£${outstanding.toFixed(2)} left)`
                  : noFeeSet
                    ? "no fee set"
                    : "outstanding"}
            </span>
          </p>
        </div>

        <CaseWorkflowPostCcl
          caseId={caseId}
          caseStage={stage}
          workflowState={bundle?.workflowState}
          onRefresh={load}
          ccl={ccl}
          paid={paid}
        />
      </div>

      <CclFeeProposalModal
        open={showFeeModal}
        onClose={() => setShowFeeModal(false)}
        busy={busy === "ccl-propose"}
        initialFee={ccl?.feeAmount}
        initialPlan={instalments}
        initialNotes={ccl?.notes}
        onSubmit={(payload) =>
          run("ccl-propose", async () => {
            await proposeCclFees(caseId, payload);
            setShowFeeModal(false);
          })
        }
      />

      <ResponseModal
        open={showResponse}
        onClose={() => setShowResponse(false)}
        responses={responses}
        fields={fields}
      />
    </>
  );
}
