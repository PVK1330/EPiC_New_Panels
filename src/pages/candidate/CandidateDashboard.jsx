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
  Bell,
  MessageSquare,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useCandidate from "../../hooks/useCandidate";
import { getNotifications } from "../../services/notificationApi";
import messagingApi from "../../services/messagingApi";
import {
  extractConversationsFromResponse,
  formatLastMessagePreview,
  sortConversationsByRecent,
} from "../../utils/messagingConversations";
import { MOCK_NOTIFICATIONS } from "../../data/adminDashboardMock";
import CaseWorkflowProgress from "../../components/case/CaseWorkflowProgress";
import Button from "../../components/Button";
import { Link } from "react-router-dom";
import {
  resolveCaseStage,
  getStepById,
  DEFAULT_CASE_STAGE,
  getCandidateNextAction,
} from "../../constants/immigrationCaseProcess";
import {
  getCandidateWorkflowProcess,
  markBiometricAttended,
} from "../../services/workflowApi";
import { useToast } from "../../context/ToastContext";
import { formatDate, formatDateLong, formatDateTime } from "../../utils/datetime";

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
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = useSelector((state) => state.auth.user);
  const { myApplication, applicationLoading, getMyApplication } = useCandidate();
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [workflowProcess, setWorkflowProcess] = useState(null);
  const [markingBiometric, setMarkingBiometric] = useState(false);

  const refreshWorkflow = () => {
    getCandidateWorkflowProcess()
      .then((data) => setWorkflowProcess(data))
      .catch(() => setWorkflowProcess(null));
  };

  useEffect(() => {
    getMyApplication();
    refreshWorkflow();
    getNotifications({ limit: 4 })
      .then((res) => {
        const list = res?.data?.data?.notifications || res?.data?.data || [];
        setNotifications(Array.isArray(list) && list.length > 0 ? list : MOCK_NOTIFICATIONS);
      })
      .catch(() => setNotifications(MOCK_NOTIFICATIONS));
    messagingApi
      .getConversations()
      .then((res) => {
        const list = sortConversationsByRecent(
          extractConversationsFromResponse(res),
        ).slice(0, 4);
        setMessages(list);
      })
      .catch(() => setMessages([]));
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
  const caseStatus = caseData.status || (appStatus === "submitted" ? "Lead" : "Draft");
  const caseStage = resolveCaseStage({
    caseStage: workflowProcess?.caseStage || caseData.caseStage,
    status: caseStatus,
  });
  const proposedAmount =
    workflowProcess?.proposedAmount ?? caseData.proposedAmount;
  const biometricLocation =
    workflowProcess?.biometricLocation || caseData.biometricLocation;
  const biometricDate =
    workflowProcess?.biometricsDate || caseData.biometricsDate;
  const biometricTime =
    workflowProcess?.biometricTime || caseData.biometricTime;
  const biometricDay = workflowProcess?.biometricDay || caseData.biometricDay;
  const biometricAttended =
    workflowProcess?.workflowState?.biometrics?.attendedAt;
  const hasBiometricAppointment =
    workflowProcess?.hasBiometricAppointment ??
    Boolean(
      workflowProcess?.workflowState?.biometrics?.bookedSlot ||
        biometricLocation ||
        biometricDate,
    );
  const canMarkBiometricAttended =
    workflowProcess?.canMarkBiometricAttended ??
    (hasBiometricAppointment &&
      !biometricAttended &&
      !["awaiting_decision", "decision_communicated", "case_closure"].includes(caseStage));

  const handleMarkBiometricAttended = async () => {
    setMarkingBiometric(true);
    try {
      await markBiometricAttended();
      showToast({
        message: "Thank you — your caseworker has been notified.",
        variant: "success",
      });
      refreshWorkflow();
      getMyApplication();
    } catch (err) {
      showToast({
        message: err?.response?.data?.message || "Could not update status",
        variant: "danger",
      });
    } finally {
      setMarkingBiometric(false);
    }
  };
  const currentStep = getStepById(caseStage) || getStepById(DEFAULT_CASE_STAGE);
  const nextAction = getCandidateNextAction(caseStage);
  const needsEnquiry = appStatus === "draft" && !myApplication?.visaType;

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
      label: "Workflow step",
      value: currentStep?.shortTitle || currentStep?.title || caseStatus,
      sub: caseData.updatedAt ? `Updated ${formatDate(caseData.updatedAt)}` : "Form submission pending",
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
      value: caseData.targetSubmissionDate ? formatDateLong(caseData.targetSubmissionDate, { month: 'short' }) : "TBD",
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

      {needsEnquiry && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-amber-800">Step 1 — Client enquiry</p>
            <p className="text-sm font-bold text-amber-950 mt-1">Submit your visa enquiry to begin the 16-step process.</p>
          </div>
          <Button onClick={() => navigate("/candidate/visa-enquiry")}>Start visa enquiry</Button>
        </section>
      )}

      <section className="rounded-2xl border border-primary/15 bg-gradient-to-r from-secondary/[0.08] via-white to-primary/[0.06] p-4 md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="shrink-0">
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
              Standard process
            </p>
            <p className="text-xl md:text-2xl font-black text-secondary mt-1">
              {currentStep?.title || "Client Enquiry"}
            </p>
          </div>

          <div className="flex-1 min-w-0 w-full">
            <CaseWorkflowProgress caseRecord={{ caseStage }} />
          </div>

          <span className={`shrink-0 self-start xl:self-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${getStatusColor(caseStatus)}`}>
            {caseStatus}
          </span>
        </div>
      </section>

      {proposedAmount != null && Number(proposedAmount) > 0 && (
        (() => {
          const cclStatus = myApplication?._relatedData?.cclRecord?.status;
          const isCclReady =
            cclStatus === "issued" ||
            cclStatus === "signed" ||
            ["Approved", "Paid"].includes(caseData.amountStatus);

            return (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <BadgePoundSterling className="text-emerald-700 shrink-0 mt-0.5" size={22} />
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-emerald-800">
                      Client Care Letter (CCL) fee — {["paid", "Paid"].includes(caseData?.amountStatus) ? "PAID" : "amount due"}
                    </p>
                  <p className="text-2xl font-black text-emerald-950 mt-1">
                    £{Number(proposedAmount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs font-bold text-emerald-800/80 mt-0.5">
                    {["paid", "Paid"].includes(caseData?.amountStatus) ? (
                      "Your fee has been paid successfully. Thank you!"
                    ) : (
                      <>
                        This is the fee your administrator set. Review your Client Care Letter and pay from
                        Payments when you are ready.
                        {!isCclReady && (
                          <span className="block mt-1 text-amber-600">
                            Please wait for your caseworker to send the official CCL before reviewing or paying.
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button variant="outline" onClick={() => navigate("/candidate/tasks")}>
                  View task
                </Button>
                <Button variant="outline" onClick={() => navigate("/candidate/ccl")} disabled={!isCclReady}>
                  Review CCL
                </Button>
                {!["paid", "Paid"].includes(caseData?.amountStatus) && (
                  <Button onClick={() => navigate("/candidate/payments")} disabled={!isCclReady}>
                    Pay now
                  </Button>
                )}
              </div>
            </section>
          );
        })()
      )}

      {canMarkBiometricAttended && (biometricLocation || biometricDate) && (
        <section className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-2">
            Pending task — biometrics
          </p>
          <p className="text-base font-black text-secondary leading-snug">
            Attend biometrics at{" "}
            <span className="text-primary">{biometricLocation || "your appointment centre"}</span>
            {biometricDate && (
              <>
                {" "}
                on{" "}
                <span className="text-primary">
                  {biometricDay ? `${biometricDay}, ` : ""}
                  {formatDateLong(biometricDate, { month: "long" })}
                </span>
              </>
            )}
            {biometricTime && (
              <>
                {" "}
                at <span className="text-primary">{biometricTime}</span>
              </>
            )}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <MapPin size={16} className="text-gray-400" />
            <Button
              onClick={handleMarkBiometricAttended}
              disabled={markingBiometric}
              className="inline-flex items-center gap-2"
            >
              {markingBiometric ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {markingBiometric ? "Updating…" : "Mark as done / Biometric attended"}
            </Button>
          </div>
        </section>
      )}

      {!needsEnquiry && (
        <section className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
            Next step for you
          </p>
          {nextAction.calm ? (
            <p className="text-sm font-bold text-gray-600 mt-2">{nextAction.text}</p>
          ) : (
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm font-black text-secondary">{nextAction.text}</p>
              {nextAction.to && (
                <Link
                  to={nextAction.to}
                  className="inline-flex items-center gap-1 text-xs font-black text-primary hover:underline shrink-0"
                >
                  Go <ArrowRight size={14} />
                </Link>
              )}
            </div>
          )}
        </section>
      )}

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
              {myApplication?._relatedData?.documents?.filter(d => d.status === 'missing').length || 0} Required
            </span>
          </div>
          <div className="space-y-3">
            {myApplication?._relatedData?.documents?.filter(d => d.status === 'rejected').slice(0, 2).map((doc) => (
              <div
                key={`rej-${doc.id}`}
                className="rounded-xl border border-red-200 bg-red-50/70 px-3 py-3"
              >
                <div className="flex items-start gap-3">
                  <FileWarning size={18} className="text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-red-900">{doc.documentType?.name || doc.userFileName || "Document"}</p>
                    <p className="text-xs font-bold text-red-800 mt-1">
                      Rejected: {doc.rejectionReason || doc.reviewNotes || "Please re-upload with corrections."}
                    </p>
                  </div>
                  <Link
                    to="/candidate/documents"
                    className="text-[11px] font-black text-red-700 hover:underline shrink-0"
                  >
                    Fix →
                  </Link>
                </div>
              </div>
            ))}
            {myApplication?._relatedData?.documents?.filter(d => d.status === 'missing').slice(0, 3).map((doc) => (
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
            <button type="button" onClick={() => navigate('/candidate/messages')} className="bg-secondary text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-lg shadow-secondary/15 hover:bg-secondary-dark transition-all">
              Chat with Support
            </button>
          </div>
        </article>
      </section>

      {/* Messages & Notifications Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-secondary flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" /> Recent Messages
            </h2>
            <button
              type="button"
              onClick={() => navigate('/candidate/messages')}
              className="text-xs font-bold text-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/50 mb-4 rounded-xl">
            <div className="flex gap-2" onClick={() => navigate('/candidate/messages')}>
              <input
                type="text"
                readOnly
                placeholder="Type a message..."
                className="flex-1 cursor-pointer rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="button"
                className="rounded-xl bg-primary p-2.5 sm:p-3 text-white shadow-md shadow-primary/20 hover:bg-primary-dark transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {messages.map((item) => {
              const otherUser = item.user || {};
              const lastMsg = item.lastMessage || {};
              const name = `${otherUser.first_name || ""} ${otherUser.last_name || ""}`.trim() || "Caseworker";
              const preview = formatLastMessagePreview(
                typeof lastMsg === "object" ? lastMsg?.content : lastMsg,
              );
              const time = String(lastMsg.createdAt || item.lastMessageTime || "").split("T")[0];
              return (
                <div
                  key={item.id || Math.random()}
                  onClick={() => navigate('/candidate/messages')}
                  className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-secondary truncate">{name}</h4>
                    {time && <span className="text-[9px] font-bold text-gray-400 shrink-0">{time}</span>}
                  </div>
                  <p className="text-xs text-gray-600 truncate mt-0.5">{preview || "Open conversation"}</p>
                </div>
              );
            })}
            {messages.length === 0 && (
              <p className="text-xs font-bold text-gray-400 text-center py-6">No recent messages.</p>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-secondary flex items-center gap-2">
              <Bell size={18} className="text-primary" /> Notifications
            </h2>
            <button
              type="button"
              onClick={() => navigate('/candidate/notifications')}
              className="text-xs font-bold text-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-3 flex-1">
            {notifications.slice(0, 4).map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-secondary truncate">{item.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{item.message}</p>
                    <p className="text-[9px] font-bold text-gray-400 mt-1">
                      {item.createdAt ? formatDateTime(item.createdAt) : "Recent"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-xs font-bold text-gray-400 text-center py-6">No notifications yet.</p>}
          </div>
        </article>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/candidate/application')}
          className="inline-flex items-center gap-1 text-primary text-sm font-black hover:gap-2 transition-all"
        >
          {appStatus === 'draft' ? "Continue your application" : "View submitted application"} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default CandidateDashboard;
