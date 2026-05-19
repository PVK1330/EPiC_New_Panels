import { useCallback, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  BarChart3,
  Clock3,
  CircleCheck,
  ClipboardList,
  Check,
  Loader2,
} from "lucide-react";
import useCandidate from "../../hooks/useCandidate";
import CaseWorkflowProgress from "../../components/case/CaseWorkflowProgress";
import {
  buildStepStates,
  resolveCaseStage,
  getStepById,
} from "../../constants/immigrationCaseProcess";

const TABS = [
  { id: "status", label: "Application status", icon: BarChart3 },
  { id: "timeline", label: "Timeline", icon: Clock3 },
  { id: "actions", label: "Pending actions", icon: CircleCheck },
];

const ApplicationStatus = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { myApplication, applicationLoading, getMyApplication } = useCandidate();

  useEffect(() => {
    getMyApplication();
  }, [getMyApplication]);

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

  const caseData = myApplication?._relatedData?.cases?.[0] || {};
  const caseRecord = {
    caseStage: caseData.caseStage,
    status: caseData.status || "Lead",
  };
  const stageId = resolveCaseStage(caseRecord);
  const currentStep = getStepById(stageId);
  const stepStates = useMemo(() => buildStepStates(caseRecord), [caseData.caseStage, caseData.status]);

  const docs = myApplication?._relatedData?.documents || [];
  const docSettings = myApplication?._relatedData?.documentSettings || [];
  const dcsStatus = myApplication?._relatedData?.dataCaptureSubmission?.status;
  const cclStatus = myApplication?._relatedData?.cclRecord?.status;
  const workflowState = caseData.workflowState;
  const draftReviewPending =
    stageId === "draft_application_review" &&
    workflowState?.draftReview?.confirmed === null;
  const biometricAvailabilityNeeded =
    ["application_submitted", "biometrics_booked"].includes(stageId) &&
    !workflowState?.biometrics?.availability;

  const PENDING_ACTIONS = [
    ...(draftReviewPending
      ? [
          {
            prio: "high",
            title: "Review your draft application",
            tag: "Draft review",
            due: "Yes or No required",
            cta: { label: "Open application", to: "/candidate/application" },
          },
        ]
      : []),
    ...(biometricAvailabilityNeeded
      ? [
          {
            prio: "high",
            title: "Provide biometrics appointment availability",
            tag: "Biometrics",
            due: "Location, date & time",
            cta: { label: "Submit availability", to: "/candidate/biometric-availability" },
          },
        ]
      : []),
    ...(stageId === "data_capture_initial_docs" &&
    (!dcsStatus || dcsStatus === "draft" || dcsStatus === "rejected")
      ? [
          {
            prio: "high",
            title: "Complete Data Capture Sheet",
            tag: "Required",
            due: "Action Required",
            cta: { label: "Open checklist", to: "/candidate/document-checklist" },
          },
        ]
      : []),
    ...((cclStatus === "issued" ||
      (["Approved", "Paid"].includes(caseData.amountStatus) &&
        ["ccl_issued", "ccl_payment_received"].includes(stageId))) &&
    !["ccl_fee_proposal", "ccl_fee_admin_review"].includes(stageId)
      ? [
          {
            prio: "high",
            title: "Review and accept your Client Care Letter",
            tag: "CCL",
            due: "Required to proceed",
            cta: { label: "Review CCL", to: "/candidate/ccl" },
          },
        ]
      : []),
    ...(cclStatus !== "signed" &&
    ["Approved", "Paid"].includes(caseData.amountStatus) &&
    ["ccl_issued", "ccl_payment_received"].includes(stageId) &&
    !["paid", "Paid"].includes(caseData.amountStatus) &&
    Number(caseData.totalAmount) > 0 &&
    (Number(caseData.paidAmount) || 0) < Number(caseData.totalAmount) - 0.02
      ? [
          {
            prio: "high",
            title: "Pay your approved case fees",
            tag: "Payment",
            due: "Required to proceed",
            cta: { label: "Pay now", to: "/candidate/payments" },
          },
        ]
      : []),
    ...docSettings
      .filter((s) => s.is_required && !docs.some((d) => d.documentType === s.field_key))
      .map((s) => ({
        prio: "high",
        title: `Upload ${s.field_label}`,
        tag: "Required",
        due: "Action Required",
        cta: { label: "Upload now", to: "/candidate/upload-documents" },
      })),
    ...docs
      .filter((d) => d.status === "rejected")
      .map((d) => {
        const s = docSettings.find((set) => set.field_key === d.documentType);
        return {
          prio: "high",
          title: `Re-upload ${s?.field_label || d.documentType}`,
          tag: "Rejected",
          due: "Correction Needed",
          cta: {
            label: "Re-upload",
            to: `/candidate/upload-documents?documentType=${encodeURIComponent(d.documentType || "")}&documentName=${encodeURIComponent(d.documentName || s?.field_label || "")}`,
          },
        };
      }),
    ...(Number(caseData.totalAmount) > Number(caseData.paidAmount)
      ? [
          {
            prio: "med",
            title: `Pay remaining balance — £${Number(caseData.totalAmount) - Number(caseData.paidAmount)}`,
            tag: "Payment",
            due: "Pending Payment",
            cta: { label: "Pay now", to: "/candidate/payments" },
          },
        ]
      : []),
  ];

  const TIMELINE = (caseData.timeline || []).map((entry) => ({
    dot: entry.actionType?.includes("rejected")
      ? "bg-primary"
      : entry.actionType?.includes("approved")
        ? "bg-emerald-500"
        : "bg-secondary",
    title: entry.description,
    time: new Date(entry.actionDate).toLocaleString(),
    desc: entry.metadata?.notes || null,
  }));

  if (applicationLoading && !myApplication) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-secondary" />
        <p className="text-sm font-bold text-gray-400">Loading your case status...</p>
      </div>
    );
  }

  const visaName = caseData.visaType?.name || myApplication?.visaType || "Application in progress";

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <header>
        <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tight">
          Case tracking
        </h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Case reference:{" "}
          <span className="text-secondary font-black">{caseData.caseId || "TBD"}</span>
          <span className="mx-2 text-gray-300">·</span>
          {visaName}
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
        <div className="space-y-6 max-w-4xl">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border border-secondary/20 bg-gradient-to-r from-secondary/[0.08] to-primary/[0.06] mb-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm text-2xl">
                <ClipboardList className="text-secondary" size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                  Step {currentStep?.order ?? 1} of 16
                </p>
                <h2 className="text-xl font-black text-secondary tracking-tight">
                  {currentStep?.title ?? "In progress"}
                </h2>
                <p className="text-sm font-bold text-gray-500 mt-1">
                  {currentStep?.description}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-800">
                {currentStep?.shortTitle ?? "Active"}
              </span>
            </div>

            <CaseWorkflowProgress caseRecord={caseRecord} compact />
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6">
              Standard immigration process
            </h3>
            <div className="space-y-0">
              {stepStates.map((stage, idx) => {
                const isLast = idx === stepStates.length - 1;
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
                    <span className="text-xs font-black text-gray-500">{stage.order}</span>
                  );
                  dotClass = "bg-white border-gray-300 text-gray-500";
                }
                const connectorClass =
                  stage.state === "done" ? "bg-emerald-500" : "bg-gray-200";
                return (
                  <div key={stage.id} className="flex gap-4">
                    <div className="flex flex-col items-center w-10 shrink-0">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 z-10 ${dotClass}`}
                      >
                        {dotContent}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 flex-1 min-h-[28px] ${connectorClass}`} />
                      )}
                    </div>
                    <div className={`pb-8 pt-0.5 flex-1 ${isLast ? "pb-0" : ""}`}>
                      <p className={`text-sm font-black ${nameClass}`}>{stage.title}</p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">
                        {stage.state === "done"
                          ? "Completed"
                          : stage.state === "current"
                            ? "In progress"
                            : "Pending"}
                      </p>
                      {stage.state === "current" && stage.description ? (
                        <p className="text-xs font-bold text-gray-500 mt-2 leading-relaxed">
                          {stage.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-8 shadow-sm max-w-4xl space-y-0">
          {TIMELINE.length > 0 ? (
            TIMELINE.map((entry, i) => (
              <div key={`${entry.title}-${entry.time}`} className="flex gap-4">
                <div className="flex flex-col items-center w-10 shrink-0">
                  <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${entry.dot}`} />
                  {i < TIMELINE.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-[16px] bg-gray-200" />
                  )}
                </div>
                <div className="pb-6 flex-1">
                  <p className="text-sm font-black text-gray-900">{entry.title}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">{entry.time}</p>
                  {entry.desc ? (
                    <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600">
                      {entry.desc}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <Clock3 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm font-bold text-gray-400">No timeline entries yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "actions" && (
        <div className="max-w-4xl space-y-3">
          {PENDING_ACTIONS.length > 0 ? (
            PENDING_ACTIONS.map((a, idx) => (
              <div
                key={`${a.title}-${idx}`}
                className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm"
              >
                <span className="h-2 w-2 rounded-full shrink-0 bg-primary" />
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
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <CircleCheck className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
              <p className="text-sm font-bold text-gray-400">
                No pending actions. You&apos;re all caught up!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationStatus;
