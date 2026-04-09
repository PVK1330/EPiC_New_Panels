import { useCallback, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  BarChart3,
  Clock3,
  CircleCheck,
  ClipboardList,
  Check,
} from "lucide-react";

const TABS = [
  { id: "status", label: "Application status", icon: BarChart3 },
  { id: "timeline", label: "Timeline", icon: Clock3 },
  { id: "actions", label: "Pending actions", icon: CircleCheck },
];

const STAGES = [
  {
    state: "done",
    name: "Application started",
    date: "5 Apr 2026",
    desc: "Application successfully created and initial setup completed.",
  },
  {
    state: "current",
    name: "Documents pending",
    date: "Since 8 Apr 2026",
    desc: "5 documents still required. Upload passport, bank statements, and CoS to proceed.",
  },
  {
    state: "pending",
    name: "Under review",
    date: "Pending",
    desc: "Caseworker will review all submitted documents.",
  },
  {
    state: "pending",
    name: "Drafting",
    date: "Pending",
    desc: "Application forms and supporting letters drafted.",
  },
  {
    state: "pending",
    name: "Submitted to UKVI",
    date: "Pending",
    desc: "Application formally submitted to UK Visas & Immigration.",
  },
  {
    state: "pending",
    name: "Decision pending",
    date: "Pending",
    desc: "Awaiting decision from UKVI. Typical processing: 3–8 weeks.",
  },
  {
    state: "pending",
    name: "Approved / refused",
    date: "Pending",
    desc: "",
  },
  {
    state: "pending",
    name: "Case closed",
    date: "Pending",
    desc: "",
  },
];

const TIMELINE = [
  {
    dot: "bg-primary",
    title: "Document rejected — bank statement",
    time: "11 Apr 2026 · 10:32am",
    desc: 'Caseworker: "Balance requirement not met for 28-day period. Please resubmit March statement."',
  },
  {
    dot: "bg-secondary",
    title: "Message from caseworker",
    time: "10 Apr 2026 · 3:15pm",
    desc: '"Please upload your latest bank statements for the past 3 months as we need to verify your finances."',
  },
  {
    dot: "bg-emerald-500",
    title: "Document approved — employment contract",
    time: "9 Apr 2026 · 4:00pm",
    desc: null,
  },
  {
    dot: "bg-amber-500",
    title: "Document uploaded — employment contract",
    time: "9 Apr 2026 · 11:20am",
    desc: null,
  },
  {
    dot: "bg-emerald-500",
    title: "Document approved — passport",
    time: "8 Apr 2026 · 2:00pm",
    desc: null,
  },
  {
    dot: "bg-secondary",
    title: "Application started",
    time: "5 Apr 2026 · 9:00am",
    desc: "Case VT-2024-0841 created. Caseworker Sarah Wilson assigned.",
  },
];

const PENDING_ACTIONS = [
  {
    prio: "high",
    title: "Upload passport copy",
    tag: "Identity",
    due: "Due: 18 Apr 2026",
    cta: { label: "Upload now", to: "/candidate/upload-documents" },
  },
  {
    prio: "high",
    title: "Re-upload bank statement (March)",
    tag: "Finance",
    due: "Due: 20 Apr 2026",
    cta: { label: "Re-upload", to: "/candidate/upload-documents" },
  },
  {
    prio: "med",
    title: "Upload certificate of sponsorship",
    tag: "Employment",
    due: "Due: 25 Apr 2026",
    cta: { label: "Upload now", to: "/candidate/upload-documents" },
  },
  {
    prio: "med",
    title: "Pay remaining balance — £800",
    tag: "Payment",
    due: "Due: 30 Apr 2026",
    cta: { label: "Pay now", to: "/candidate/payments" },
  },
  {
    prio: "low",
    title: "Confirm employment start date",
    tag: "Details",
    due: "No deadline set",
    cta: { label: "Review", to: "/candidate/application" },
  },
];

function prioDotClass(prio) {
  if (prio === "high") return "bg-primary";
  if (prio === "med") return "bg-amber-500";
  return "bg-emerald-500";
}

const ApplicationStatus = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = useMemo(() => {
    const t = searchParams.get("tab");
    if (t === "timeline" || t === "actions") return t;
    return "status";
  }, [searchParams]);

  const setTab = useCallback(
    (id) => {
      if (id === "status") {
        setSearchParams({}, { replace: true });
      } else {
        setSearchParams({ tab: id }, { replace: true });
      }
    },
    [setSearchParams],
  );

  const stagesFinal = STAGES.map((stage, idx) => {
    const isLast = idx === STAGES.length - 1;
    let dotContent = null;
    let dotClass = "";
    let nameClass = "text-gray-400";
    if (stage.state === "done") {
      dotContent = <Check size={16} className="text-white" />;
      dotClass = "bg-emerald-500 border-emerald-500 text-white";
      nameClass = "text-emerald-700";
    } else if (stage.state === "current") {
      dotContent = <span className="text-sm font-black text-white">●</span>;
      dotClass =
        "bg-amber-400 border-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.25)]";
      nameClass = "text-amber-700";
    } else {
      dotContent = (
        <span className="text-xs font-black text-gray-500">{idx + 1}</span>
      );
      dotClass = "bg-white border-gray-300 text-gray-500";
      nameClass = "text-gray-400";
    }
    return {
      ...stage,
      idx,
      isLast,
      dotContent,
      dotClass,
      nameClass,
    };
  });

  const stagesWithConnectors = stagesFinal.map((s) => ({
    ...s,
    connectorClass: s.state === "done" ? "bg-emerald-500" : "bg-gray-200",
  }));

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <header>
        <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tight">
          Case tracking
        </h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Case reference:{" "}
          <span className="text-secondary font-black">VT-2024-0841</span>
          <span className="mx-2 text-gray-300">·</span>
          Skilled Worker visa
        </p>
      </header>

      <div className="flex flex-wrap gap-1 p-1 rounded-xl border border-gray-200 bg-gray-50/80">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-wide transition-all ${
                isActive
                  ? "bg-secondary text-white shadow-md shadow-secondary/20"
                  : "text-gray-500 hover:text-primary hover:bg-white"
              }`}
            >
              <Icon size={16} className={isActive ? "text-white" : ""} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "status" && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-8 shadow-sm max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border border-secondary/20 bg-gradient-to-r from-secondary/[0.08] to-primary/[0.06] mb-8">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm text-2xl">
              <ClipboardList className="text-secondary" size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-secondary tracking-tight">
                Documents pending
              </h2>
              <p className="text-sm font-bold text-gray-500 mt-1">
                Your caseworker is waiting for 5 documents. Please upload them
                to proceed.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-800">
              In progress
            </span>
          </div>

          <div className="space-y-0">
            {stagesWithConnectors.map((stage, i) => (
              <div key={stage.name} className="flex gap-4">
                <div className="flex flex-col items-center w-10 shrink-0">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 z-10 ${stage.dotClass}`}
                  >
                    {stage.dotContent}
                  </div>
                  {!stage.isLast && (
                    <div
                      className={`w-0.5 flex-1 min-h-[28px] ${stage.connectorClass}`}
                    />
                  )}
                </div>
                <div className={`pb-8 pt-0.5 flex-1 ${stage.isLast ? "pb-0" : ""}`}>
                  <p className={`text-sm font-black ${stage.nameClass}`}>
                    {stage.name}
                  </p>
                  <p className="text-xs font-bold text-gray-400 mt-0.5">
                    {stage.date}
                  </p>
                  {stage.desc ? (
                    <p className="text-xs font-bold text-gray-500 mt-2 leading-relaxed">
                      {stage.desc}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-8 shadow-sm max-w-4xl space-y-0">
          {TIMELINE.map((entry, i) => (
            <div key={`${entry.title}-${entry.time}`} className="flex gap-4">
              <div className="flex flex-col items-center w-10 shrink-0">
                <div
                  className={`mt-1 h-3 w-3 rounded-full shrink-0 ${entry.dot}`}
                />
                {i < TIMELINE.length - 1 && (
                  <div className="w-0.5 flex-1 min-h-[16px] bg-gray-200" />
                )}
              </div>
              <div className="pb-6 flex-1">
                <p className="text-sm font-black text-gray-900">{entry.title}</p>
                <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                  {entry.time}
                </p>
                {entry.desc ? (
                  <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600">
                    {entry.desc}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "actions" && (
        <div className="max-w-4xl space-y-3">
          {PENDING_ACTIONS.map((a) => (
            <div
              key={a.title}
              className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm"
            >
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${prioDotClass(a.prio)}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 capitalize">
                  {a.title}{" "}
                  <span className="text-[10px] font-black text-gray-400 border border-gray-200 rounded-full px-2 py-0.5 ml-1 uppercase">
                    {a.tag}
                  </span>
                </p>
                <p className="text-xs font-bold text-gray-500 mt-0.5">{a.due}</p>
              </div>
              <Link
                to={a.cta.to}
                className="shrink-0 inline-flex justify-center rounded-lg bg-secondary px-4 py-2.5 text-xs font-black text-white hover:bg-secondary-dark shadow-md shadow-secondary/20"
              >
                {a.cta.label}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationStatus;
