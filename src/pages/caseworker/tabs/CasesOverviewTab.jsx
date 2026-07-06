import { Check } from "lucide-react";
import CaseWorkflowPanel from "../../../components/case/CaseWorkflowPanel";
import CaseWorkflowGuidance from "../../../components/case/CaseWorkflowGuidance";
import CaseWorkflowActions from "../../../components/case/CaseWorkflowActions";
import PrintClientApplicationButton from "../../../components/CandidateApplicationForm/PrintClientApplicationButton";
import {
  IMMIGRATION_CASE_STEPS,
  resolveCaseStage,
  getStepById,
} from "../../../constants/immigrationCaseProcess";
import { badgeStatus, badgePriority, priorityLabel, formatTarget } from "../casesHelpers.jsx";

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </p>
      <div className="text-sm font-bold text-gray-900">{children}</div>
    </div>
  );
}

function CasesOverviewTab({ c, userName, onStageChange, stageSaving, onRefresh }) {
  const st = badgeStatus(c.status);
  const caseRecord = {
    caseStage: c.caseStage,
    status: c.legacyStatus || c.status,
  };

  const stageId = resolveCaseStage(caseRecord);
  const currentStep = getStepById(stageId);
  const currentOrder = currentStep?.order ?? 1;

  return (
    <div className="space-y-6">
      {c.candidateId ? (
        <div className="flex justify-end">
          <PrintClientApplicationButton
            candidateId={c.candidateId}
            label="Print / PDF application"
          />
        </div>
      ) : null}
      <CaseWorkflowPanel
        caseRecord={caseRecord}
        onStageChange={onStageChange}
        saving={stageSaving}
      />
      <CaseWorkflowGuidance caseRecord={caseRecord} />
      <CaseWorkflowActions
        caseId={c.caseId}
        totalAmount={c.totalAmount}
        amountStatus={c.amountStatus}
        caseStage={c.caseStage}
        onRefresh={onRefresh}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Case ID">
          <span className="font-mono text-secondary">{c.caseId}</span>
        </Field>
        <Field label="Candidate name">{c.candidate}</Field>
        <Field label="Sponsor name">{c.business}</Field>
        <Field label="Visa type">{c.visa}</Field>
        <Field label="Case status">
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-black ${st.className}`}
          >
            {st.label}
          </span>
        </Field>
        <Field label="Assigned to">{c.caseworker || `${userName} (You)`}</Field>
        <Field label="Start date">
          {c.created_at ? (
            formatTarget(String(c.created_at).slice(0, 10))
          ) : (
            <span className="text-gray-500">—</span>
          )}
        </Field>
        <Field label="Target submission">{formatTarget(c.target)}</Field>
        <Field label="Decision date">
          {c.decisionDate ? (
            formatTarget(String(c.decisionDate).slice(0, 10))
          ) : (
            <span className="text-gray-500">Pending</span>
          )}
        </Field>
        <Field label="Priority">
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-black ${badgePriority(c.priority)}`}
          >
            {priorityLabel(c.priority)}
          </span>
        </Field>
        {c.proposedAmount != null && Number(c.proposedAmount) > 0 && (
          <div className="sm:col-span-2 mt-2 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800 mb-1">
              Admin CCL fee (proposed amount)
            </p>
            <p className="text-lg font-black text-emerald-950">
              £
              {Number(c.proposedAmount).toLocaleString("en-GB", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-[10px] font-bold text-emerald-800/80 mt-0.5">
              Client Care Letter fee set at assignment — this is what the candidate must pay.
            </p>
          </div>
        )}
      </div>
      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-3">
          Case progress
        </p>
        {/* 16 steps don't fit the modal width — scroll the strip inside the
            card instead of letting the columns punch through its border. */}
        <div className="overflow-x-auto pb-1 [scrollbar-width:thin]">
          <div className="flex justify-between text-center gap-1">
          {IMMIGRATION_CASE_STEPS.map((step, i) => {
            const done = step.order < currentOrder;
            const current = step.order === currentOrder;
            return (
              <div key={step.id} className="flex-1 min-w-[64px] relative">
                {i > 0 && (
                  <div
                    className={`absolute left-0 right-1/2 top-[14px] h-0.5 -translate-x-1/2 ${
                      i < currentOrder ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                    style={{ width: "50%" }}
                  />
                )}
                <div
                  className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black ${
                    done
                      ? "bg-emerald-500 text-white"
                      : current
                        ? "border-2 border-secondary bg-secondary/15 text-secondary"
                        : "border-2 border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {done ? <Check size={14} /> : current ? "●" : ""}
                </div>
                <p
                  className={`mt-1 text-[10px] font-bold ${
                    current ? "text-secondary" : "text-gray-500"
                  }`}
                >
                  {step.shortTitle}
                </p>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CasesOverviewTab;
