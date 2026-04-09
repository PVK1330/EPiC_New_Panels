import {
  CircleCheck,
  Clock3,
  FileWarning,
  MessageSquareMore,
  BadgePoundSterling,
  FileText,
  ClipboardCheck,
  Upload,
  Eye,
  CreditCard,
  Send,
  ArrowRight,
} from "lucide-react";
import { useSelector } from "react-redux";

const steps = [
  { name: "Started", state: "done" },
  { name: "Docs", state: "current" },
  { name: "Review", state: "todo" },
  { name: "Draft", state: "todo" },
  { name: "Submit", state: "todo" },
  { name: "Decision", state: "todo" },
  { name: "Closed", state: "todo" },
];

const widgets = [
  {
    label: "Visa Type",
    value: "Skilled Worker Visa",
    sub: "Primary application route",
    Icon: FileText,
    valueClass: "text-secondary",
    valueSize: "text-lg md:text-xl leading-snug",
  },
  {
    label: "Case Status",
    value: "Under Review",
    sub: "Caseworker is reviewing your file",
    Icon: ClipboardCheck,
    valueClass: "text-primary",
    valueSize: "text-xl md:text-2xl",
  },
  {
    label: "Pending Actions",
    value: "3",
    sub: "2 high priority",
    Icon: CircleCheck,
    valueClass: "text-amber-600",
  },
  {
    label: "Missing Documents",
    value: "5",
    sub: "Upload required",
    Icon: FileWarning,
    valueClass: "text-primary",
  },
  {
    label: "Next Deadline",
    value: "Apr 18",
    sub: "Passport upload",
    Icon: Clock3,
    valueClass: "text-secondary",
  },
  {
    label: "Payment Status",
    value: "Partial",
    sub: "GBP 800 remaining",
    Icon: BadgePoundSterling,
    valueClass: "text-amber-600",
  },
  {
    label: "Unread Messages",
    value: "2",
    sub: "From caseworker",
    Icon: MessageSquareMore,
    valueClass: "text-secondary",
  },
  {
    label: "Case Reference",
    value: "VT-2024-0841",
    sub: "Tier 2 Skilled Worker",
    Icon: FileText,
    valueClass: "text-gray-800",
  },
];

const actions = [
  {
    text: "Upload Passport Copy",
    due: "Due: Apr 18, 2026",
    priorityClass: "bg-primary",
    cta: "Upload",
    Icon: Upload,
  },
  {
    text: "Confirm Employment Details",
    due: "Due: Apr 20, 2026",
    priorityClass: "bg-primary",
    cta: "Review",
    Icon: Eye,
  },
  {
    text: "Pay Remaining Balance",
    due: "Due: Apr 25, 2026",
    priorityClass: "bg-amber-500",
    cta: "Pay now",
    Icon: CreditCard,
  },
];

const messages = [
  {
    from: "Sarah Wilson",
    initials: "SW",
    text: "Please upload your latest bank statements for final review.",
    time: "2h ago",
    unread: true,
  },
  {
    from: "Sarah Wilson",
    initials: "SW",
    text: "Your application has been updated. Next step is document review.",
    time: "Yesterday",
    unread: true,
  },
  {
    from: "System",
    initials: "SY",
    text: "Reminder: Document checklist deadline is approaching.",
    time: "Apr 10",
    unread: false,
  },
];

const CandidateDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const currentIndex = steps.findIndex((s) => s.state === "current");

  return (
    <div className="space-y-6 pb-10">
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tight">
          Good morning, <span className="text-primary">{user?.name || "Arjun"}</span>
        </h1>
        <p className="text-gray-500 font-bold text-sm mt-1">
          Here is your visa application overview for today.
        </p>
      </div>

      <section className="rounded-2xl border border-primary/15 bg-gradient-to-r from-secondary/[0.08] via-white to-primary/[0.06] p-4 md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="shrink-0">
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
              Current Stage
            </p>
            <p className="text-xl md:text-2xl font-black text-secondary mt-1">
              Documents Pending
            </p>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1 sm:gap-2 overflow-x-auto pb-2">
              {steps.map((step, idx) => {
                const done = step.state === "done";
                const current = step.state === "current";
                const linkDone = idx < currentIndex;
                return (
                  <div key={step.name} className="flex items-start flex-1 min-w-[72px]">
                    <div className="flex flex-col items-center w-full">
                      <div
                        className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-[11px] font-black ${
                          done
                            ? "bg-primary border-primary text-white"
                            : current
                              ? "bg-amber-400 border-amber-400 text-white"
                              : "bg-white border-gray-300 text-gray-400"
                        }`}
                      >
                        {done ? "✓" : idx + 1}
                      </div>
                      <span className="mt-1 text-[10px] font-bold text-gray-500 text-center leading-tight">
                        {step.name}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`mt-3 h-0.5 flex-1 min-w-3 ${
                          linkDone ? "bg-primary" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <span className="shrink-0 self-start xl:self-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-700">
            In Progress
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {widgets.map(
          ({ label, value, sub, Icon, valueClass, valueSize = "text-3xl" }) => (
          <article
            key={label}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                {label}
              </p>
              <Icon size={22} className="text-gray-300 shrink-0" />
            </div>
            <p
              className={`mt-2 font-black tracking-tight ${valueSize} ${valueClass}`}
            >
              {value}
            </p>
            <p className="mt-1 text-xs font-bold text-gray-500">{sub}</p>
          </article>
          ),
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-black text-secondary mb-4">Pending Actions</h2>
          <div className="space-y-3">
            {actions.map(({ text, due, priorityClass, cta, Icon }) => (
              <div
                key={text}
                className="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-3"
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1 h-2 w-2 rounded-full ${priorityClass}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-800">{text}</p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">{due}</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-[11px] font-black text-primary hover:bg-primary/15"
                  >
                    <Icon size={13} />
                    {cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col">
          <h2 className="text-base font-black text-secondary mb-4">Recent Messages</h2>
          <div className="space-y-3 flex-1">
            {messages.map((m) => (
              <div
                key={`${m.from}-${m.time}-${m.text}`}
                className="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-secondary text-white text-xs font-black flex items-center justify-center shrink-0">
                    {m.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-gray-800 truncate">{m.from}</p>
                      <span className="ml-auto text-[11px] font-bold text-gray-400 shrink-0">
                        {m.time}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">{m.text}</p>
                  </div>
                  {m.unread && <span className="mt-1 h-2 w-2 rounded-full bg-primary" />}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              className="rounded-xl bg-primary p-3 text-white shadow-md shadow-primary/20 hover:bg-primary-dark"
            >
              <Send size={18} />
            </button>
          </div>
        </article>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-primary text-sm font-black hover:gap-2 transition-all"
        >
          View full timeline <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default CandidateDashboard;
