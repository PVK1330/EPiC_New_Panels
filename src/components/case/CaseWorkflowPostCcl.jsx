import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import Button from "../Button";
import BiometricBookedModal from "../workflow/BiometricBookedModal";
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
          {availability.preferredTimezone && (
            <p className="text-[10px] font-black uppercase tracking-wide text-primary/80">
              Candidate timezone: {availability.preferredTimezone}
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
    </div>
  );
}
