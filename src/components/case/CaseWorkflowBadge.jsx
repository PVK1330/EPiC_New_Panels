import { getStepTitle, resolveCaseStage } from "../../constants/immigrationCaseProcess";

/** Pill showing current workflow step title. */
export default function CaseWorkflowBadge({ caseRecord, className = "" }) {
  const title = getStepTitle(caseRecord);
  const stageId = resolveCaseStage(caseRecord);
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black bg-primary/10 text-primary border border-primary/20 ${className}`}
      title={stageId}
    >
      {title}
    </span>
  );
}
