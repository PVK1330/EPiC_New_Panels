import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import Button from "../Button";
import {
  recordVisaPortalSubmission,
  sendBiometricSlot,
  recordBiometricDocsUploaded,
  recordVisaPortalReply,
} from "../../services/workflowApi";

function apiErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "Request failed";
}

export default function CaseWorkflowPostCcl({
  caseId,
  caseStage,
  workflowState,
  onRefresh,
}) {
  const { showToast } = useToast();
  const [busy, setBusy] = useState("");
  const [visaRef, setVisaRef] = useState(workflowState?.visaPortal?.reference || "");
  const [slot, setSlot] = useState({
    location: workflowState?.biometrics?.bookedSlot?.location || "",
    appointmentDate: workflowState?.biometrics?.bookedSlot?.appointmentDate || "",
    appointmentTime: workflowState?.biometrics?.bookedSlot?.appointmentTime || "",
    instructions: workflowState?.biometrics?.bookedSlot?.instructions || "",
  });
  const [visaReply, setVisaReply] = useState(
    workflowState?.biometrics?.visaPortalReply?.summary || "",
  );

  const ws = workflowState || {};
  const availability = ws.biometrics?.availability;
  const booked = ws.biometrics?.bookedSlot;
  const docsUploaded = ws.biometrics?.documentsUploadedAt;
  const portalReply = ws.biometrics?.visaPortalReply;
  const visaSubmitted = ws.visaPortal?.submittedAt;

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
    ["ccl_payment_received", "ccl_issued"].includes(caseStage) && !visaSubmitted;
  const showBiometricBook =
    ["application_submitted", "biometrics_booked"].includes(caseStage) &&
    availability &&
    !booked?.sentToCandidateAt;
  const showDocsUpload =
    ["biometrics_confirmation_sent", "biometrics_booked"].includes(caseStage) && !docsUploaded;
  const showVisaReply =
    ["documents_uploaded", "awaiting_decision"].includes(caseStage) && !portalReply?.recordedAt;

  if (!showVisaSubmit && !showBiometricBook && !showDocsUpload && !showVisaReply && !availability) {
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
          {availability.notes && (
            <p className="text-gray-500 font-bold">Notes: {availability.notes}</p>
          )}
        </div>
      )}

      {booked?.sentToCandidateAt && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs">
          <p className="font-black text-emerald-800">Slot sent to candidate</p>
          <p className="font-bold text-emerald-900">
            {booked.location} — {booked.appointmentDate} {booked.appointmentTime}
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
            Book slot and send confirmation to candidate
          </p>
          <input
            type="text"
            value={slot.location}
            onChange={(e) => setSlot((s) => ({ ...s, location: e.target.value }))}
            placeholder="Appointment location"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="date"
              value={slot.appointmentDate}
              onChange={(e) => setSlot((s) => ({ ...s, appointmentDate: e.target.value }))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold"
            />
            <input
              type="text"
              value={slot.appointmentTime}
              onChange={(e) => setSlot((s) => ({ ...s, appointmentTime: e.target.value }))}
              placeholder="Time (e.g. 10:30 AM)"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold"
            />
          </div>
          <textarea
            value={slot.instructions}
            onChange={(e) => setSlot((s) => ({ ...s, instructions: e.target.value }))}
            placeholder="Instructions for candidate (optional)"
            rows={2}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold resize-none"
          />
          <Button
            type="button"
            disabled={!!busy}
            onClick={() => run("biometric-slot", () => sendBiometricSlot(caseId, slot))}
          >
            {busy === "biometric-slot" ? "Sending…" : "Send slot to candidate"}
          </Button>
        </div>
      )}

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
    </div>
  );
}
