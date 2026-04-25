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
  Loader2,
} from "lucide-react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import useCandidate from "../../hooks/useCandidate";

const STAGES = [
  { name: "Started", key: "started" },
  { name: "Application", key: "submitted" },
  { name: "Review", key: "under_review" },
  { name: "Decision", key: "decision" },
  { name: "Closed", key: "closed" },
];

const getStatusColor = (status) => {
  const map = {
    Lead: "text-blue-600 bg-blue-50 border-blue-100",
    Pending: "text-amber-600 bg-amber-50 border-amber-100",
    "Docs Pending": "text-red-600 bg-red-50 border-red-100",
    "In Progress": "text-indigo-600 bg-indigo-50 border-indigo-100",
    Completed: "text-green-600 bg-green-50 border-green-100",
    Approved: "text-green-600 bg-green-50 border-green-100",
    Rejected: "text-red-600 bg-red-50 border-red-100",
  };
  return map[status] || "text-gray-600 bg-gray-50 border-gray-100";
};

const CandidateDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const { myApplication, applicationLoading, getMyApplication } = useCandidate();

  useEffect(() => {
    getMyApplication();
  }, [getMyApplication]);

  if (applicationLoading && !myApplication) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-secondary" />
        <p className="text-sm font-bold text-gray-400">Loading your dashboard...</p>
      </div>
    );
  }

  const appStatus = myApplication?.status || "draft";
  const caseData = myApplication?._relatedData?.cases?.[0] || {};
  const caseStatus = caseData.status || (appStatus === "submitted" ? "Pending" : "Draft");

  // Determine current step index
  let currentIndex = 0;
  if (appStatus === "submitted") currentIndex = 1;
  if (["under_review", "under review"].includes(appStatus.toLowerCase())) currentIndex = 2;
  if (["approved", "rejected", "decision"].includes(appStatus.toLowerCase())) currentIndex = 3;
  if (["closed", "completed"].includes(appStatus.toLowerCase())) currentIndex = 4;

  const widgets = [
    {
      label: "Visa Type",
      value: myApplication?.visaType || "Not specified",
      sub: "Primary application route",
      Icon: FileText,
      valueClass: "text-secondary",
      valueSize: "text-lg md:text-xl leading-snug",
    },
    {
      label: "Case Status",
      value: caseStatus,
      sub: caseData.updatedAt ? `Updated ${new Date(caseData.updatedAt).toLocaleDateString()}` : "Form submission pending",
      Icon: ClipboardCheck,
      valueClass: "text-primary",
      valueSize: "text-xl md:text-2xl",
    },
    {
      label: "Reference",
      value: caseData.caseId || "N/A",
      sub: "Use for correspondence",
      Icon: FileText,
      valueClass: "text-gray-800",
      valueSize: "text-xl",
    },
    {
      label: "Next Deadline",
      value: caseData.targetSubmissionDate ? new Date(caseData.targetSubmissionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "TBD",
      sub: "Action required soon",
      Icon: Clock3,
      valueClass: "text-secondary",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tight">
          Welcome back, <span className="text-primary">{user?.first_name || "Guest"}</span>
        </h1>
        <p className="text-gray-500 font-bold text-sm mt-1">
          Track your UK visa application progress and pending tasks.
        </p>
      </div>

      <section className="rounded-2xl border border-primary/15 bg-gradient-to-r from-secondary/[0.08] via-white to-primary/[0.06] p-4 md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="shrink-0">
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
              Current Stage
            </p>
            <p className="text-xl md:text-2xl font-black text-secondary mt-1">
              {STAGES[currentIndex].name}
            </p>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1 sm:gap-2 overflow-x-auto pb-2">
              {STAGES.map((step, idx) => {
                const done = idx < currentIndex;
                const current = idx === currentIndex;
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
                    {idx < STAGES.length - 1 && (
                      <div
                        className={`mt-3 h-0.5 flex-1 min-w-3 ${
                          done ? "bg-primary" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <span className={`shrink-0 self-start xl:self-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${getStatusColor(caseStatus)}`}>
            {caseStatus}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
              className={`mt-2 font-black tracking-tight ${valueSize} ${valueClass} truncate`}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-secondary">Pending Actions</h2>
            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
              {myApplication?._relatedData?.documents?.filter(d => d.status === 'Pending').length || 0} Required
            </span>
          </div>
          <div className="space-y-3">
            {myApplication?._relatedData?.documents?.filter(d => d.status === 'Pending').slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-3"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-800">{doc.documentType?.name || "Document Upload"}</p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">Required for {myApplication.visaType}</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-[11px] font-black text-primary hover:bg-primary/15"
                  >
                    <Upload size={13} />
                    Upload
                  </button>
                </div>
              </div>
            )) || (
              <p className="text-sm font-bold text-gray-400 py-4 text-center">No pending document actions.</p>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col">
          <h2 className="text-base font-black text-secondary mb-4">Feedback & Support</h2>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-12 h-12 rounded-2xl bg-secondary/5 flex items-center justify-center mb-4">
              <MessageSquareMore className="text-secondary" />
            </div>
            <p className="text-sm font-black text-gray-800">Need help with your application?</p>
            <p className="text-xs font-bold text-gray-500 mt-1 mb-4">
              Our caseworkers are here to guide you through the process.
            </p>
            <button className="bg-secondary text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-lg shadow-secondary/15 hover:bg-secondary-dark transition-all">
              Chat with Support
            </button>
          </div>
        </article>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => window.location.href = '/candidate/application'}
          className="inline-flex items-center gap-1 text-primary text-sm font-black hover:gap-2 transition-all"
        >
          {appStatus === 'draft' ? "Continue your application" : "View submitted application"} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default CandidateDashboard;
