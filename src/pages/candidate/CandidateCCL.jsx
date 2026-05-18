import { useEffect, useState } from "react";
import { FileCheck, Loader2, CheckCircle2 } from "lucide-react";
import Button from "../../components/Button";
import { useToast } from "../../context/ToastContext";
import useCandidate from "../../hooks/useCandidate";
import { acceptCcl } from "../../services/workflowApi";
import { resolveCaseStage } from "../../constants/immigrationCaseProcess";

const FIRM_NAME = import.meta.env.VITE_FIRM_NAME || "Your immigration firm";

export default function CandidateCCL() {
  const { showToast } = useToast();
  const { myApplication, getMyApplication } = useCandidate();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  const caseData = myApplication?._relatedData?.cases?.[0] || {};
  const ccl = myApplication?._relatedData?.cclRecord || null;
  const stageId = resolveCaseStage({
    caseStage: caseData.caseStage,
    status: caseData.status,
  });
  const loading = !myApplication;

  useEffect(() => {
    getMyApplication();
  }, [getMyApplication]);

  const accepted = ccl?.status === "signed";
  const issued = ccl?.status === "issued" || accepted;
  const fee = Number(caseData.totalAmount) || Number(ccl?.feeAmount) || 0;

  const handleAccept = async () => {
    if (!agreed) {
      showToast({ variant: "danger", message: "Please confirm you agree to the terms" });
      return;
    }
    setBusy(true);
    try {
      await acceptCcl();
      showToast({ message: "Client Care Letter accepted" });
      await getMyApplication();
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Could not accept Client Care Letter",
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-bold text-gray-400">Loading Client Care Letter…</p>
      </div>
    );
  }

  if (!issued && !["ccl_issued", "ccl_payment_received", "application_submitted"].includes(stageId)) {
    return (
      <div className="max-w-xl mx-auto rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <FileCheck className="mx-auto text-gray-300 mb-4" size={40} />
        <h1 className="text-xl font-black text-secondary">Client Care Letter</h1>
        <p className="text-sm font-bold text-gray-500 mt-2">
          Your Client Care Letter has not been issued yet. Your caseworker will notify you when it is ready.
        </p>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="max-w-xl mx-auto rounded-2xl border border-green-100 bg-green-50/50 p-8 text-center">
        <CheckCircle2 className="mx-auto text-green-600 mb-4" size={44} />
        <h1 className="text-xl font-black text-secondary">Client Care Letter accepted</h1>
        <p className="text-sm font-bold text-gray-600 mt-2">
          You accepted the Client Care Letter
          {ccl?.signedAt
            ? ` on ${new Date(ccl.signedAt).toLocaleDateString("en-GB")}`
            : ""}
          .
        </p>
        {caseData.amountStatus !== "paid" && fee > 0 && (
          <p className="text-sm font-bold text-amber-700 mt-4">
            Payment is still outstanding. Please complete payment to allow submission of your application.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-black text-secondary tracking-tight">Client Care Letter</h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Review the summary below and confirm acceptance to proceed.
        </p>
      </div>

      <article className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm space-y-4">
        <p className="text-xs font-black uppercase tracking-widest text-primary">
          {FIRM_NAME}
        </p>
        <h2 className="text-lg font-black text-secondary">Client Care Letter summary</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-400 font-bold">Visa type</dt>
            <dd className="font-black text-secondary">{myApplication?.visaType || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-400 font-bold">Total fee</dt>
            <dd className="font-black text-secondary">
              {fee > 0 ? `£${fee.toFixed(2)}` : "As per your care letter"}
            </dd>
          </div>
        </dl>
        <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
          By accepting, you agree to the firm&apos;s terms and authorise the visa application to proceed.
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
