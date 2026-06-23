import { useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import Button from "../Button";
import BiometricBookedModal from "../workflow/BiometricBookedModal";
import {
  recordVisaPortalSubmission,
  sendBiometricSlot,
  recordBiometricDocsUploaded,
  recordVisaPortalReply,
  communicateDecision,
} from "../../services/workflowApi";

function apiErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "Request failed";
}

export default function CaseWorkflowPostCcl({
  caseId,
  caseStage,
  workflowState,
  onRefresh,
  ccl,
  paid,
}) {
  const { showToast } = useToast();
  const [busy, setBusy] = useState("");
  const [visaRef, setVisaRef] = useState(workflowState?.visaPortal?.reference || "");
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [visaReply, setVisaReply] = useState(
    workflowState?.biometrics?.visaPortalReply?.summary || "",
  );
  const [decisionOutcome, setDecisionOutcome] = useState("approved");
  const [decisionNotes, setDecisionNotes] = useState("");

  const ws = workflowState || {};
  const availability = ws.biometrics?.availability;
  const booked = ws.biometrics?.bookedSlot;
  const docsUploaded = ws.biometrics?.documentsUploadedAt;
  const portalReply = ws.biometrics?.visaPortalReply;
  const visaSubmitted = ws.visaPortal?.submittedAt;
  const decision = ws.decision;

  const run = async (key, fn) => {
    setBusy(key);
    try {
      await fn();
      showToast({ message: "Saved." });
      onRefresh?.();
    } catch (e) {
      showToast({ variant: "danger", message: apiErrorMessage(e) });
    } finally {
      setBusy("");
    }
  };

  const showVisaSubmit =
    (caseStage === "client_care_letter" || ["ccl_payment_received", "ccl_issued"].includes(caseStage)) &&
    (ccl?.status === "signed" || ccl?.status === "accepted") &&
    paid &&
    !visaSubmitted;
  const showBiometricBook =
    ["application_submitted", "biometrics_booked", "biometrics_confirmation_sent"].includes(
      caseStage,
    ) && !booked?.sentToCandidateAt;
  const showDocsUpload =
    ["biometrics_confirmation_sent", "biometrics_booked"].includes(caseStage) && !docsUploaded;
  const showVisaReply =
    ["documents_uploaded", "awaiting_decision"].includes(caseStage) && !portalReply?.recordedAt;
  const showDecision = caseStage === "awaiting_decision" && !decision?.communicatedAt;
  const showDecisionRecorded = !!decision?.communicatedAt;

  if (
    !showVisaSubmit &&
    !showBiometricBook &&
    !showDocsUpload &&
    !showVisaReply &&
    !showDecision &&
    !showDecisionRecorded &&
    !availability
  ) {
    return null;
  }

  return (
    <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4 space-y-4 mt-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-secondary">
        Visa portal &amp; biometrics
      </p>

      {availability && (
        <div className="rounded-lg bg-white border border-gray-100 p-3 text-xs space-y-1">
          <p className="font-black text-gray-700">Candidate availability</p>
          <p className="font-bold text-gray-600">
            {availability.preferredLocation} — {availability.preferredDate}{" "}
            {availability.preferredTime}
          </p>
          {availability.timezone && (
            <p className="text-[10px] font-black uppercase tracking-wide text-primary/80">
              Candidate timezone: {availability.timezone}
            </p>
          )}
          {availability.notes && (
            <p className="text-gray-500 font-bold">Notes: {availability.notes}</p>
          )}
        </div>
      )}

      {booked?.sentToCandidateAt && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs space-y-1">
          <p className="font-black text-emerald-800">Biometrics booked — candidate notified</p>
          <p className="font-bold text-emerald-900">
            <span className="font-black">Location:</span> {booked.location}
          </p>
          <p className="font-bold text-emerald-900">
            <span className="font-black">Date:</span>{" "}
            {booked.appointmentDay ? `${booked.appointmentDay}, ` : ""}
            {booked.appointmentDate}
          </p>
          <p className="font-bold text-emerald-900">
            <span className="font-black">Time:</span> {booked.appointmentTime}
          </p>
          {booked.instructions && (
            <p className="font-bold text-emerald-800/90">{booked.instructions}</p>
          )}
        </div>
      )}

      {showDecisionRecorded && (
        <div
          className={`rounded-lg border p-3 text-xs space-y-1 ${
            decision.outcome === "approved"
              ? "bg-emerald-50 border-emerald-100"
              : "bg-red-50 border-red-100"
          }`}
        >
          <div className="flex items-center gap-2">
            {decision.outcome === "approved" ? (
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            ) : (
              <XCircle size={14} className="text-red-500 shrink-0" />
            )}
            <p
              className={`font-black ${
                decision.outcome === "approved" ? "text-emerald-800" : "text-red-800"
              }`}
            >
              Decision communicated —{" "}
              {decision.outcome === "approved" ? "Approved ✓" : "Refused"}
            </p>
          </div>
          {decision.notes && (
            <p
              className={`font-bold pl-5 ${
                decision.outcome === "approved" ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {decision.notes}
            </p>
          )}
          <p className="text-gray-400 font-bold pl-5">
            Communicated:{" "}
            {new Date(decision.communicatedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      )}

      {showVisaSubmit && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-600">
            Mark application as submitted on the Visa Portal
          </p>
          <input
            type="text"
            value={visaRef}
            onChange={(e) => setVisaRef(e.target.value)}
            placeholder="Submission reference (optional)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold"
          />
          <Button
            type="button"
            disabled={!!busy}
            onClick={() =>
              run("visa-submit", () =>
                recordVisaPortalSubmission(caseId, { reference: visaRef }),
              )
            }
          >
            {busy === "visa-submit" ? (
              <>
                <Loader2 size={14} className="animate-spin inline mr-1" /> Saving…
              </>
            ) : (
              "Confirm visa portal submission"
            )}
          </Button>
        </div>
      )}

      {showBiometricBook && (
        <div className="space-y-2 border-t border-gray-100 pt-3">
          <p className="text-xs font-bold text-gray-600">
            Book biometrics and send confirmation email to the candidate
          </p>
          <Button type="button" disabled={!!busy} onClick={() => setBiometricModalOpen(true)}>
            Open booking form
          </Button>
        </div>
      )}

      <BiometricBookedModal
        open={biometricModalOpen}
        onClose={() => setBiometricModalOpen(false)}
        caseLabel={caseId}
        loading={busy === "biometric-slot"}
        initialData={availability ? {
          location: availability.preferredLocation,
          date: availability.preferredDate,
          time: availability.preferredTime,
          instructions: availability.notes,
          timezone: availability.timezone,
        } : undefined}
        onConfirm={async (payload) => {
          setBusy("biometric-slot");
          try {
            await sendBiometricSlot(caseId, {
              location: payload.biometricLocation,
              appointmentDate: payload.biometricDate,
              appointmentTime: payload.biometricTime,
              appointmentDay: payload.biometricDay,
              instructions: payload.biometricInstructions,
            });
            showToast({ message: "Biometrics booked — candidate notified." });
            setBiometricModalOpen(false);
            onRefresh?.();
          } catch (e) {
            showToast({ variant: "danger", message: apiErrorMessage(e) });
          } finally {
            setBusy("");
          }
        }}
      />

      {showDocsUpload && (
        <div className="border-t border-gray-100 pt-3">
          <Button
            type="button"
            variant="outline"
            disabled={!!busy}
            onClick={() =>
              run("biometric-docs", () => recordBiometricDocsUploaded(caseId))
            }
          >
            {busy === "biometric-docs"
              ? "Saving…"
              : "Confirm biometric documents uploaded to Visa Portal"}
          </Button>
        </div>
      )}

      {showVisaReply && (
        <div className="space-y-2 border-t border-gray-100 pt-3">
          <p className="text-xs font-bold text-gray-600">
            What reply did you receive from the visa portal?
          </p>
          <textarea
            value={visaReply}
            onChange={(e) => setVisaReply(e.target.value)}
            rows={3}
            placeholder="Paste or summarise the email reply from the visa portal…"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold resize-none"
          />
          <Button
            type="button"
            disabled={!!busy || !visaReply.trim()}
            onClick={() =>
              run("visa-reply", () =>
                recordVisaPortalReply(caseId, { replySummary: visaReply }),
              )
            }
          >
            {busy === "visa-reply" ? "Saving…" : "Record reply & advance to awaiting decision"}
          </Button>
        </div>
      )}

      {showDecision && (
        <div className="space-y-2 border-t border-gray-100 pt-3">
          <p className="text-xs font-black text-gray-700">
            Communicate Home Office decision to candidate
          </p>
          <p className="text-[11px] font-bold text-gray-500">
            Upload decision letter, approval notice, and visa copy to the Documents tab first —
            they will unlock automatically for the candidate once you communicate the decision.
          </p>
          <select
            value={decisionOutcome}
            onChange={(e) => setDecisionOutcome(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold bg-white"
          >
            <option value="approved">Approved</option>
            <option value="refused">Refused</option>
          </select>
          <textarea
            value={decisionNotes}
            onChange={(e) => setDecisionNotes(e.target.value)}
            rows={3}
            placeholder="Optional message for the candidate — e.g. next steps, visa collection instructions, BRP collection details…"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold resize-none"
          />
          <Button
            type="button"
            disabled={!!busy}
            className={
              decisionOutcome === "approved"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }
            onClick={() =>
              run("decision", () =>
                communicateDecision(caseId, { outcome: decisionOutcome, notes: decisionNotes }),
              )
            }
          >
            {busy === "decision" ? (
              <>
                <Loader2 size={14} className="animate-spin inline mr-1" /> Sending…
              </>
            ) : decisionOutcome === "approved" ? (
              "Notify candidate — Approved"
            ) : (
              "Notify candidate — Refused"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
