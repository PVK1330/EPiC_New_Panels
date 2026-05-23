import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, MapPin, Calendar, Clock } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
  getCandidateWorkflowProcess,
  submitBiometricAvailability,
} from "../../services/workflowApi";

export default function BiometricAvailability() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [caseRef, setCaseRef] = useState("");
  const [caseStage, setCaseStage] = useState("");
  const [candidateTimezone, setCandidateTimezone] = useState("UTC");
  const [visaPortalSubmitted, setVisaPortalSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [form, setForm] = useState({
    preferredLocation: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getCandidateWorkflowProcess();
        setCaseRef(data?.caseId || "");
        setCaseStage(data?.caseStage || "");
        setCandidateTimezone(data?.timezone || "UTC");
        setVisaPortalSubmitted(Boolean(data?.workflowState?.visaPortal?.submittedAt));
        if (data?.workflowState?.biometrics?.availability) {
          setAlreadySubmitted(true);
          const a = data.workflowState.biometrics.availability;
          setForm({
            preferredLocation: a.preferredLocation || "",
            preferredDate: a.preferredDate || "",
            preferredTime: a.preferredTime || "",
            notes: a.notes || "",
          });
        }
      } catch {
        showToast({ variant: "danger", message: "Could not load your case." });
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submitBiometricAvailability(form);
      showToast({ message: "Availability submitted. Your caseworker will book your slot." });
      navigate("/candidate/application-status");
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Submission failed",
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-secondary" />
      </div>
    );
  }

  const pastBiometricsAvailabilityWindow = [
    "biometrics_confirmation_sent",
    "documents_uploaded",
    "awaiting_decision",
    "decision_communicated",
    "case_closure",
  ].includes(caseStage);

  const maySubmitAvailability =
    !pastBiometricsAvailabilityWindow &&
    (visaPortalSubmitted ||
      ["application_submitted", "biometrics_booked"].includes(caseStage));

  const waitForCaseworkerStep =
    !alreadySubmitted &&
    !pastBiometricsAvailabilityWindow &&
    !maySubmitAvailability;

  const availabilityStepClosed =
    !alreadySubmitted && pastBiometricsAvailabilityWindow;

  const timeValue = (() => {
    const t = (form.preferredTime || "").trim();
    const m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return "";
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (!Number.isFinite(h) || !Number.isFinite(min) || h > 23 || min > 59) return "";
    return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  })();

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-black text-secondary">Biometrics availability &amp; location</h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Case {caseRef || "—"}
        </p>
        <p className="text-xs font-black uppercase tracking-wide text-primary/80 mt-2">
          Times shown in your timezone: {candidateTimezone || "UTC"}
        </p>
        <p className="text-sm font-bold text-gray-600 mt-2 leading-relaxed">
          {caseStage === "application_submitted"
            ? "Your application has been submitted on the visa portal. Use this form to tell us which centre or city you prefer and when you can attend your biometrics appointment. Your caseworker will use this to book your slot."
            : caseStage === "biometrics_booked"
              ? "We still need your preferred location and availability to finalise your biometrics booking. Complete the form below."
              : "Tell us your preferred location and when you can attend your biometrics appointment so your caseworker can book your slot."}
        </p>
      </header>

      {alreadySubmitted ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
          You have already submitted your availability. Your caseworker will contact you
          with a confirmed slot.
          <Link
            to="/candidate/application-status"
            className="mt-3 block text-secondary underline"
          >
            Back to case tracking
          </Link>
        </div>
      ) : availabilityStepClosed ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-700">
          This case has moved past the biometrics availability step. If you still need to share
          preferences with your caseworker, contact them directly.
          <Link
            to="/candidate/application-status"
            className="mt-3 block text-secondary underline font-black"
          >
            Back to case tracking
          </Link>
        </div>
      ) : waitForCaseworkerStep ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-950">
          Your caseworker must confirm visa portal submission first. Once that is recorded, you will
          be able to submit your preferred biometrics centre and appointment time here.
          <Link
            to="/candidate/application-status"
            className="mt-3 block text-secondary underline font-black"
          >
            Back to case tracking
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <label className="block">
            <span className="flex items-center gap-2 text-xs font-black uppercase text-gray-500 mb-1">
              <MapPin size={14} /> Preferred location
            </span>
            <input
              required
              value={form.preferredLocation}
              onChange={(e) => setForm((f) => ({ ...f, preferredLocation: e.target.value }))}
              placeholder="e.g. TLS Contact London"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold"
            />
          </label>
          <label className="block">
            <span className="flex items-center gap-2 text-xs font-black uppercase text-gray-500 mb-1">
              <Calendar size={14} /> Preferred date
            </span>
            <input
              type="date"
              required
              value={form.preferredDate}
              onChange={(e) => setForm((f) => ({ ...f, preferredDate: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold"
            />
          </label>
          <label className="block">
            <span className="flex items-center gap-2 text-xs font-black uppercase text-gray-500 mb-1">
              <Clock size={14} /> Preferred time
            </span>
            <input
              type="time"
              step={300}
              required
              value={timeValue}
              onChange={(e) => setForm((f) => ({ ...f, preferredTime: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold [&::-webkit-calendar-picker-indicator]:opacity-100"
            />
            <span className="text-[11px] font-bold text-gray-400 block mt-1">
              Use the time picker — saved in your timezone ({candidateTimezone || "UTC"}). Add wider
              ranges (e.g. mornings only) in notes if needed.
            </span>
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase text-gray-500 mb-1 block">
              Additional notes (optional)
            </span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold resize-none"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-secondary py-3 text-sm font-black text-white shadow-md disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit availability"}
          </button>
        </form>
      )}
    </div>
  );
}
