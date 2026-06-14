import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FileCheck,
  Loader2,
  CheckCircle2,
  Download,
  PoundSterling,
  Clock,
  XCircle,
  Circle,
} from "lucide-react";
import Button from "../../components/Button";
import { useToast } from "../../context/ToastContext";
import useCandidate from "../../hooks/useCandidate";
import { acceptCcl, getCandidateCcl } from "../../services/workflowApi";
import useDownloads from "../../hooks/useDownloads";
import { resolveCaseStage, getStepById } from "../../constants/immigrationCaseProcess";
import { formatDate, formatDateLong } from "../../utils/datetime";

const FIRM_NAME = import.meta.env.VITE_FIRM_NAME || "Your immigration firm";
const CCL_VISIBLE_MIN_ORDER = 10;

function isPaidCase(caseData) {
  const total = Number(caseData?.totalAmount) || 0;
  const paid = Number(caseData?.paidAmount) || 0;
  return (
    ["paid", "Paid"].includes(caseData?.amountStatus) ||
    (total > 0 && paid >= total - 0.02)
  );
}

function formatStepDate(value) {
  if (!value) return null;
  return formatDateLong(value, { month: "short" });
}

function StepIcon({ status }) {
  if (status === "completed") {
    return <CheckCircle2 className="text-green-600 shrink-0" size={20} />;
  }
  if (status === "rejected") {
    return <XCircle className="text-red-500 shrink-0" size={20} />;
  }
  if (status === "in_progress") {
    return <Clock className="text-amber-500 shrink-0" size={20} />;
  }
  return <Circle className="text-gray-300 shrink-0" size={20} />;
}

function CclApprovalTimeline({ steps = [] }) {
  if (!steps.length) return null;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">
        Approval status
      </h2>
      <ol className="space-y-4">
        {steps.map((step) => (
          <li key={step.id} className="flex gap-3">
            <StepIcon status={step.status} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-secondary">{step.label}</p>
              {step.at && (
                <p className="text-xs font-bold text-gray-400 mt-0.5">{formatStepDate(step.at)}</p>
              )}
              {step.detail && (
                <p
                  className={`text-xs font-bold mt-1 ${
                    step.status === "rejected" ? "text-red-700" : "text-gray-500"
                  }`}
                >
                  {step.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function CclLetterCard({ templateMeta, caseData, issuedDocument, onDownload }) {
  const fileLabel =
    issuedDocument?.userFileName ||
    issuedDocument?.documentName ||
    templateMeta?.fileName;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p className="text-sm font-bold text-secondary">
          Your Client Care Letter
          {templateMeta?.label ? ` (${templateMeta.label})` : ""}
          {caseData?.visaTypeName ? ` — ${caseData.visaTypeName}` : ""}
        </p>
        <p className="text-xs font-bold text-gray-500 mt-1">
          {fileLabel ? `File: ${fileLabel}` : "Download a copy for your records."}
        </p>
      </div>
      <button
        type="button"
        onClick={onDownload}
        className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-xs font-black text-white shrink-0"
      >
        <Download size={16} />
        Download letter
      </button>
    </div>
  );
}

export default function CandidateCCL() {
  const { showToast } = useToast();
  const { myApplication, getMyApplication } = useCandidate();
  const { downloadCandidateCclLetter } = useDownloads();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cclBundle, setCclBundle] = useState(null);
  const [loadingCcl, setLoadingCcl] = useState(true);

  const caseFromApp = myApplication?._relatedData?.cases?.[0] || {};
  const cclFromApp = myApplication?._relatedData?.cclRecord || null;

  const caseData = cclBundle?.case || caseFromApp;
  const ccl = cclBundle?.ccl || cclFromApp;
  const issuedDocument = cclBundle?.issuedDocument || null;
  const templateMeta = cclBundle?.template || null;
  const approvalSteps = cclBundle?.approvalSteps || [];

  const stageId = resolveCaseStage({
    caseStage: caseData.caseStage,
    status: caseData.status,
  });
  const stageOrder = getStepById(stageId)?.order ?? 0;

  const loadCcl = useCallback(async () => {
    setLoadingCcl(true);
    try {
      const data = await getCandidateCcl();
      setCclBundle(data);
    } catch (err) {
      console.error("getCandidateCcl:", err);
    } finally {
      setLoadingCcl(false);
    }
  }, []);

  useEffect(() => {
    getMyApplication();
    loadCcl();
  }, [getMyApplication, loadCcl]);

  const accepted = ccl?.status === "signed" || ccl?.status === "accepted";
  const feesApproved =
    caseData.amountStatus === "Approved" || caseData.amountStatus === "Paid";
  const fee = Number(caseData.totalAmount) || Number(ccl?.feeAmount) || 0;
  const issuedToClient =
    cclBundle?.releasedToClient === true ||
    cclBundle?.stageVisible === true ||
    stageOrder >= CCL_VISIBLE_MIN_ORDER ||
    ccl?.status === "issued" ||
    accepted ||
    (feesApproved && fee > 0);
  const awaitingAdmin =
    stageId === "client_care_letter" && ccl?.status === "fee_proposed";
  const instalments = ccl?.installmentPlan || ccl?.installment_plan || [];
  const paid = isPaidCase(caseData);
  const balance = Math.max(0, fee - (Number(caseData.paidAmount) || 0));

  const handleAccept = async () => {
    if (!agreed) {
      showToast({ variant: "danger", message: "Please confirm you agree to the terms" });
      return;
    }
    setBusy(true);
    try {
      await acceptCcl();
      showToast({ message: "Client Care Letter accepted" });
      await Promise.all([getMyApplication(), loadCcl()]);
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Could not accept Client Care Letter",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadLetter = async () => {
    const result = await downloadCandidateCclLetter();
    if (!result.ok) {
      showToast({ variant: "danger", message: result.message || "Could not download Client Care Letter" });
    }
  };

  if (loadingCcl && !myApplication) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-bold text-gray-400">Loading Client Care Letter…</p>
      </div>
    );
  }

  if (!issuedToClient) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pb-10">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <FileCheck className="mx-auto text-gray-300 mb-4" size={40} />
          <h1 className="text-xl font-black text-secondary">Client Care Letter</h1>
          <p className="text-sm font-bold text-gray-500 mt-2">
            {awaitingAdmin
              ? "Your fee proposal is being reviewed by the firm. You will receive your Client Care Letter and payment schedule once approved."
              : "Your Client Care Letter has not been issued yet. Your caseworker will notify you when it is ready."}
          </p>
        </div>
        <CclApprovalTimeline steps={approvalSteps} />
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-10">
        <div className="rounded-2xl border border-green-100 bg-green-50/50 p-8 text-center">
          <CheckCircle2 className="mx-auto text-green-600 mb-4" size={44} />
          <h1 className="text-xl font-black text-secondary">Client Care Letter accepted</h1>
          <p className="text-sm font-bold text-gray-600 mt-2">
            You accepted the Client Care Letter
            {ccl?.signedAt
              ? ` on ${formatDate(ccl.signedAt)}`
              : ""}
            .
          </p>
          {!paid && fee > 0 && (
            <p className="text-sm font-bold text-amber-700 mt-4">
              Payment is still outstanding (£{balance.toLocaleString()}). Please complete payment
              to allow submission of your application.
            </p>
          )}
        </div>

        <CclLetterCard
          templateMeta={templateMeta}
          caseData={caseData}
          issuedDocument={issuedDocument}
          onDownload={handleDownloadLetter}
        />

        <CclApprovalTimeline steps={approvalSteps} />

        {!paid && fee > 0 && (
          <Link
            to="/candidate/payments"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white shadow-md"
          >
            <PoundSterling size={18} />
            Pay £{balance.toLocaleString()}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-black text-secondary tracking-tight">Client Care Letter</h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Review the summary below, accept the terms, then pay your approved fees.
        </p>
      </div>

      <CclApprovalTimeline steps={approvalSteps} />

      <CclLetterCard
        templateMeta={templateMeta}
        caseData={caseData}
        issuedDocument={issuedDocument}
        onDownload={handleDownloadLetter}
      />

      {!paid && fee > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm font-bold text-amber-950">
            Outstanding balance: <strong>£{balance.toLocaleString()}</strong>
          </p>
          <Link
            to="/candidate/payments"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white shrink-0"
          >
            <PoundSterling size={16} />
            Pay now
          </Link>
        </div>
      )}

      <article className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm space-y-4">
        <p className="text-xs font-black uppercase tracking-widest text-primary">{FIRM_NAME}</p>
        <h2 className="text-lg font-black text-secondary">Client Care Letter summary</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-400 font-bold">Case reference</dt>
            <dd className="font-black text-secondary">{caseData.caseId || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-400 font-bold">Total fee</dt>
            <dd className="font-black text-secondary">
              {fee > 0 ? `£${fee.toFixed(2)}` : "As per your care letter"}
            </dd>
          </div>
        </dl>

        {instalments.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
              Payment instalments
            </p>
            <ul className="space-y-2 text-sm">
              {instalments.map((row, i) => (
                <li
                  key={row.label}
                  className="flex justify-between gap-2 font-bold text-secondary border-b border-gray-50 pb-2"
                >
                  <span>{row.label}</span>
                  <span>
                    £{Number(row.amount).toFixed(2)}
                    {row.dueDate
                      ? ` · due ${formatDate(row.dueDate)}`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
          By accepting, you agree to the firm&apos;s terms and authorise the visa application to
          proceed.
          {ccl?.notes && (
            <span className="block mt-2 font-medium text-gray-700">{ccl.notes}</span>
          )}
        </p>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-bold text-gray-700">
            I have read and agree to the terms of this Client Care Letter.
          </span>
        </label>

        <Button className="w-full sm:w-auto" disabled={busy} onClick={handleAccept}>
          {busy ? "Confirming…" : "Accept & Confirm"}
        </Button>
      </article>
    </div>
  );
}
