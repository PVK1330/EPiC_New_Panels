import { getStageGuidance, resolveCaseStage, getStepById } from "../../constants/immigrationCaseProcess";

/**
 * Caseworker checklist for the current workflow step (per Standard Immigration Case Process).
 */
export default function CaseWorkflowGuidance({ caseRecord, className = "" }) {
  const stageId = resolveCaseStage(caseRecord);
  const step = getStepById(stageId);
  const { actions, docs } = getStageGuidance(stageId);

  if (!step) return null;

  return (
    <div className={`rounded-xl border border-gray-100 bg-gray-50/80 p-4 space-y-4 ${className}`}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          Step {step.order} guidance
        </p>
        <p className="text-sm font-bold text-secondary mt-0.5">{step.title}</p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.description}</p>
      </div>
      {actions.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
            Caseworker actions
          </p>
          <ul className="space-y-1.5">
            {actions.map((action) => (
              <li
                key={action}
                className="flex items-start gap-2 text-xs font-semibold text-gray-700"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
      {docs.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
            Documents
          </p>
          <ul className="space-y-1.5">
            {docs.map((doc) => (
              <li
                key={doc}
                className="flex items-start gap-2 text-xs font-semibold text-gray-700"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
