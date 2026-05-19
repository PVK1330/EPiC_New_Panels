import { useState } from "react";
import Button from "../Button";
import { useToast } from "../../context/ToastContext";
import { confirmBiometricSlot, recordVisaPortalUpdate } from "../../services/workflowApi";

export default function CaseBiometricWorkflow({ caseId, workflowMeta, caseStage, onRefresh }) {
  const { showToast } = useToast();
  const [busy, setBusy] = useState("");
  const [slot, setSlot] = useState({ date: "", time: "", location: "", instructions: "" });
  const [portal, setPortal] = useState({ portalStatus: "", replyFromPortal: "", notes: "" });

  const availability = workflowMeta?.biometricAvailability;
  const booked = workflowMeta?.biometricSlot;
  const visa = workflowMeta?.visaPortal;

  const canBookSlot =
    availability?.status === "submitted" &&
    !booked?.sentToCandidateAt &&
    ["application_submitted", "biometrics_booked"].includes(caseStage);

  const run = async (key, fn) => {
    setBusy(key);
    try {
      await fn();
      showToast({ message: "Saved." });
      onRefresh?.();
    } catch (err) {
      showToast({ variant: "danger", message: err?.response?.data?.message || "Request failed" });
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-800">
        Biometrics & visa portal
      </p>

      {availability?.status === "submitted" && (
        <div className="text-xs font-bold text-gray-700 bg-white rounded-lg p-3 border border-indigo-100">
          <p className="font-black text-indigo-900 mb-1">Candidate availability</p>
          <p>Date: {availability.preferredDate || "—"}</p>
          <p>Time: {availability.preferredTime || "flexible"}</p>
          <p>Location: {availability.location || "—"}</p>
          {availability.notes ? <p className="mt-1 text-gray-500">{availability.notes}</p> : null}
        </div>
      )}

      {canBookSlot && (
        <div className="bg-white rounded-lg p-3 border border-indigo-100 space-y-2">
          <p className="text-xs font-black text-indigo-900">Book slot & send confirmation</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input type="date" value={slot.date} onChange={(e) => setSlot((s) => ({ ...s, date: e.target.value }))} className="rounded-lg border px-2 py-1.5 text-sm font-bold" />
            <input type="time" value={slot.time} onChange={(e) => setSlot((s) => ({ ...s, time: e.target.value }))} className="rounded-lg border px-2 py-1.5 text-sm font-bold" />
            <input type="text" placeholder="Location / centre" value={slot.location} onChange={(e) => setSlot((s) => ({ ...s, location: e.target.value }))} className="sm:col-span-2 rounded-lg border px-2 py-1.5 text-sm font-bold" />
            <textarea rows={2} placeholder="Instructions for candidate" value={slot.instructions} onChange={(e) => setSlot((s) => ({ ...s, instructions: e.target.value }))} className="sm:col-span-2 rounded-lg border px-2 py-1.5 text-sm font-bold" />
          </div>
          <Button size="sm" disabled={!!busy} onClick={() => run("slot", () => confirmBiometricSlot(caseId, slot))}>
            {busy === "slot" ? "Saving…" : "Confirm slot & notify candidate"}
          </Button>
        </div>
      )}

      {booked?.sentToCandidateAt && (
        <p className="text-xs font-bold text-emerald-800">
          Slot sent: {booked.date} {booked.time || ""} — {booked.location}
        </p>
      )}

      {["biometrics_confirmation_sent", "documents_uploaded", "awaiting_decision"].includes(caseStage) && (
        <div className="bg-white rounded-lg p-3 border border-indigo-100 space-y-2">
          <p className="text-xs font-black text-indigo-900">UK Visa Portal — status & reply</p>
          <input type="text" placeholder="Portal status" value={portal.portalStatus} onChange={(e) => setPortal((p) => ({ ...p, portalStatus: e.target.value }))} className="w-full rounded-lg border px-2 py-1.5 text-sm font-bold" />
          <textarea rows={2} placeholder="What reply did you receive from the visa portal?" value={portal.replyFromPortal} onChange={(e) => setPortal((p) => ({ ...p, replyFromPortal: e.target.value }))} className="w-full rounded-lg border px-2 py-1.5 text-sm font-bold" />
          <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run("portal", () => recordVisaPortalUpdate(caseId, portal))}>
            {busy === "portal" ? "Saving…" : "Record portal update"}
          </Button>
          {visa?.updatedAt ? (
            <p className="text-[10px] font-bold text-gray-500">Last: {visa.portalStatus} — {visa.replyFromPortal || "—"}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
