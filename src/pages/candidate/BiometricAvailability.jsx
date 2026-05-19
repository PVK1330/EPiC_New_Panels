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

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-black text-secondary">Biometrics availability</h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Case {caseRef || "—"} · Tell us when and where you can attend your appointment
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
              required
              value={form.preferredTime}
              onChange={(e) => setForm((f) => ({ ...f, preferredTime: e.target.value }))}
              placeholder="e.g. Morning, or 10:00–12:00"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold"
            />
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
