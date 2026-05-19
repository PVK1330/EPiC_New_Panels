import { useCallback, useEffect, useState } from "react";
import { Calendar, MapPin, Clock, Loader2 } from "lucide-react";
import Button from "../../components/Button";
import { useToast } from "../../context/ToastContext";
import {
  getBiometricAvailability,
  submitBiometricAvailability,
} from "../../services/workflowApi";

export default function CandidateBiometricAvailability() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    preferredDate: "",
    preferredTime: "",
    location: "",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBiometricAvailability();
      const av = data?.availability;
      if (av?.status === "submitted") {
        setSubmitted(true);
        setForm({
          preferredDate: av.preferredDate || "",
          preferredTime: av.preferredTime || "",
          location: av.location || "",
          notes: av.notes || "",
        });
      }
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Could not load availability form",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.preferredDate || !form.location) {
      showToast({ variant: "danger", message: "Preferred date and location are required" });
      return;
    }
    setBusy(true);
    try {
      await submitBiometricAvailability(form);
      setSubmitted(true);
      showToast({ message: "Availability submitted — we will confirm your appointment slot" });
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Could not submit availability",
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-gray-400">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-10">
      <header>
        <h1 className="text-2xl font-black text-secondary tracking-tight">Biometrics availability</h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Tell us when and where you can attend your biometrics appointment.
        </p>
      </header>

      {submitted ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 space-y-2 text-sm font-bold text-emerald-900">
          <p>Thank you — your caseworker will book a slot and send confirmation.</p>
          <p className="text-emerald-800/80">
            Date: {form.preferredDate || "—"} · Time: {form.preferredTime || "flexible"} · Location:{" "}
            {form.location || "—"}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <label className="block">
            <span className="text-xs font-black uppercase text-gray-500 flex items-center gap-1">
              <Calendar size={14} /> Preferred date
            </span>
            <input
              type="date"
              required
              value={form.preferredDate}
              onChange={(e) => setForm((f) => ({ ...f, preferredDate: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase text-gray-500 flex items-center gap-1">
              <Clock size={14} /> Preferred time
            </span>
            <input
              type="time"
              value={form.preferredTime}
              onChange={(e) => setForm((f) => ({ ...f, preferredTime: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase text-gray-500 flex items-center gap-1">
              <MapPin size={14} /> Location / centre
            </span>
            <input
              type="text"
              required
              placeholder="City or visa application centre"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase text-gray-500">Additional notes</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Any constraints or travel limitations"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold"
            />
          </label>
          <Button type="submit" disabled={busy} className="w-full justify-center">
            {busy ? "Submitting…" : "Submit availability"}
          </Button>
        </form>
      )}
    </div>
  );
}
