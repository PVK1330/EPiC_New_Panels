import { useState } from "react";
import {
  CalendarClock,
  User,
  Mail,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

const InputField = ({
  label,
  type = "text",
  icon: Icon,
  placeholder,
  required,
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
      {label} {required && <span className="text-primary">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
      />
      {Icon && (
        <Icon
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
        />
      )}
    </div>
  </div>
);

const RescheduleForm = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-8 pb-10">
        <div>
          <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
            <CalendarClock className="text-primary" size={36} />
            Reschedule form
          </h1>
          <p className="text-primary font-bold text-sm mt-1">
            Process or submit appointment reschedule requests
          </p>
        </div>
        <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 max-w-lg flex flex-col items-center text-center">
          <CheckCircle2 size={56} className="text-green-500 mb-4" />
          <h2 className="text-2xl font-black text-secondary mb-2">
            Request Submitted!
          </h2>
          <p className="text-sm font-bold text-gray-400 mb-6">
            Your rescheduling request has been sent. You'll receive a
            confirmation shortly.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-primary hover:opacity-90 text-white font-black text-sm px-6 py-3 rounded-xl transition-all"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <CalendarClock className="text-primary" size={36} />
          Reschedule form
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Process or submit appointment reschedule requests
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-7xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              label="First Name"
              icon={User}
              placeholder="Enter first name"
              required
            />
            <InputField
              label="Last Name"
              icon={User}
              placeholder="Enter last name"
              required
            />
          </div>

          {/* Email */}
          <InputField
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="your@email.com"
            required
          />

          {/* Date + Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              label="New Appointment Date"
              type="date"
              icon={Calendar}
              required
            />
            <InputField
              label="New Appointment Time"
              type="time"
              icon={Clock}
              required
            />
          </div>

          {/* Reason Textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <MessageSquare size={12} className="text-gray-300" />
              Reason for Rescheduling <span className="text-primary">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="Briefly explain why you need to reschedule..."
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 active:scale-95 text-white font-black text-sm px-8 py-3 rounded-full transition-all shadow-lg shadow-green-500/20"
            >
              Submit Request
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.history.back();
              }}
              className="border border-gray-200 hover:border-gray-300 text-gray-500 font-black text-sm px-6 py-3 rounded-full transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleForm;
