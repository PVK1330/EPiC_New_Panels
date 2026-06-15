import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mail,
  Bell,
  ChevronLeft,
} from "lucide-react";
import Button from "../Button";
import Input from "../Input";
import DatePicker from "../DatePicker";
import TimePicker from "../TimePicker";
import { formatDateLong } from "../../utils/datetime";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/**
 * Normalise an incoming time value to the TimePicker's "HH:mm" 24-hour contract.
 * Accepts "HH:mm", "h:mm AM/PM", or "10:30 AM"; returns "" when unparseable.
 */
function toHHmm(value) {
  if (!value || typeof value !== "string") return "";
  const v = value.trim();
  const m = v.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return "";
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const period = m[3]?.toUpperCase();
  if (period === "PM" && h < 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  if (h > 23 || min > 59) return "";
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/** Format a "HH:mm" 24-hour string to a friendly 12-hour label ("10:30 AM"). */
function toFriendlyTime(value) {
  const hhmm = toHHmm(value);
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

// Step 1: Fill appointment details
// Step 2: Review & confirm summary before sending

export default function BiometricBookedModal({
  open,
  onClose,
  onConfirm,
  caseLabel,
  initialData,
  loading = false,
}) {
  const [step, setStep] = useState(1); // 1 = form, 2 = confirm
  const [location, setLocation] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentDay, setAppointmentDay] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setLocation(initialData?.location || "");
    setAppointmentDate(initialData?.date || "");
    setAppointmentDay("");
    setAppointmentTime(toHHmm(initialData?.time));
    setInstructions(initialData?.instructions || "");
    setError("");
  }, [open, initialData]);

  // Auto-compute day from date
  useEffect(() => {
    if (!appointmentDate) return;
    const d = new Date(`${appointmentDate}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      setAppointmentDay(DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]);
    }
  }, [appointmentDate]);

  const formattedDate = appointmentDate
    ? formatDateLong(`${appointmentDate}T12:00:00`, { month: "long" })
    : "";

  const handleNext = () => {
    if (!location.trim() || !appointmentDate || !appointmentTime.trim()) {
      setError("Location, date, and time slot are required.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleConfirm = () => {
    onConfirm?.({
      biometricLocation: location.trim(),
      biometricDate: appointmentDate,
      biometricDay: appointmentDay.trim(),
      // Persist a candidate-friendly 12-hour label (shown verbatim in emails,
      // notifications and the candidate dashboard).
      biometricTime: toFriendlyTime(appointmentTime),
      biometricInstructions: instructions.trim() || undefined,
    });
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          initial={{ scale: 0.93, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* ── Header ── */}
          <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="p-2 rounded-xl bg-white/20">
              <Calendar size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-black">
                {step === 1 ? "Book Biometrics Appointment" : "Confirm & Send Notification"}
              </h3>
              <p className="text-xs text-blue-100 truncate">
                {caseLabel || "Case"} — Candidate will be notified by email &amp; in-app
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Step indicator ── */}
          <div className="flex items-center gap-0 border-b border-gray-100">
            <div
              className={`flex-1 py-2.5 text-center text-xs font-bold transition-colors ${
                step === 1
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                  : "text-gray-400"
              }`}
            >
              1 · Appointment Details
            </div>
            <div
              className={`flex-1 py-2.5 text-center text-xs font-bold transition-colors ${
                step === 2
                  ? "bg-green-50 text-green-700 border-b-2 border-green-600"
                  : "text-gray-400"
              }`}
            >
              2 · Review &amp; Confirm
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* ── Form ── */}
                <div className="p-6 space-y-4">
                  <Input
                    label="Appointment Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. UKVCAS London — Croydon, 1 Paton Close"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <DatePicker
                      label="Date"
                      name="appointmentDate"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      placeholder="Select date"
                      required
                    />
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Day <span className="text-gray-400 font-normal">(auto-filled)</span>
                      </label>
                      <select
                        value={appointmentDay}
                        onChange={(e) => setAppointmentDay(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition"
                      >
                        <option value="">Select day</option>
                        {DAYS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <TimePicker
                    label="Time Slot"
                    name="appointmentTime"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    placeholder="Select time slot"
                    required
                  />

                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Instructions{" "}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={3}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition placeholder:text-gray-400"
                      placeholder="What should the candidate bring? e.g. Passport, appointment confirmation letter..."
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                      <AlertCircle size={14} className="text-red-500 shrink-0" />
                      <p className="text-xs font-semibold text-red-600">{error}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleNext}>
                    Review Details →
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* ── Summary ── */}
                <div className="p-6 space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3">
                      Appointment Summary
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                          <MapPin size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Location</p>
                          <p className="text-sm font-bold text-gray-800">{location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                          <Calendar size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Date &amp; Day</p>
                          <p className="text-sm font-bold text-gray-800">
                            {appointmentDay && <span className="text-blue-700">{appointmentDay}, </span>}
                            {formattedDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                          <Clock size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Time</p>
                          <p className="text-sm font-bold text-gray-800">{toFriendlyTime(appointmentTime)}</p>
                        </div>
                      </div>
                      {instructions && (
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-1.5 rounded-lg bg-amber-100 text-amber-600 shrink-0">
                            <AlertCircle size={14} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Instructions</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{instructions}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* What will happen */}
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-green-700 mb-2.5">
                      What happens when you confirm
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                        <p className="text-xs text-green-800 font-medium">
                          Case stage moves to <strong>Biometrics Booked</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Mail size={14} className="text-green-600 shrink-0" />
                        <p className="text-xs text-green-800 font-medium">
                          Candidate receives email with appointment details
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Bell size={14} className="text-green-600 shrink-0" />
                        <p className="text-xs text-green-800 font-medium">
                          In-app notification sent to candidate
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                        <p className="text-xs text-green-800 font-medium">
                          Timeline entry recorded
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft size={14} />
                    Edit Details
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                        Booking…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        Confirm &amp; Notify Candidate
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
