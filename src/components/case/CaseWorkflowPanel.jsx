import { useState, useEffect } from "react";
import CaseWorkflowProgress from "./CaseWorkflowProgress";
import CaseStageSelect from "./CaseStageSelect";
import CaseWorkflowBadge from "./CaseWorkflowBadge";
import { resolveCaseStage } from "../../constants/immigrationCaseProcess";
import Button from "../Button";

/**
 * Workflow step display + change control for case detail pages.
 */
export default function CaseWorkflowPanel({
  caseRecord,
  onStageChange,
  saving = false,
}) {
  const [stage, setStage] = useState(() => resolveCaseStage(caseRecord));
  const resolved = resolveCaseStage(caseRecord);

  useEffect(() => {
    setStage(resolveCaseStage(caseRecord));
  }, [caseRecord?.caseStage, caseRecord?.status]);

  const handleSave = () => {
    if (stage && stage !== resolved && onStageChange) {
      onStageChange(stage);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-primary">
            Immigration workflow
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Standard 16-step case process</p>
        </div>
        <CaseWorkflowBadge caseRecord={caseRecord} />
      </div>
      <CaseWorkflowProgress caseRecord={{ ...caseRecord, caseStage: resolved }} compact />
      {onStageChange && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 block">
              Move to step
            </label>
            <CaseStageSelect value={stage} onChange={setStage} disabled={saving} />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !stage || stage === resolved}
              className="whitespace-nowrap"
            >
              {saving ? "Saving…" : "Update stage"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
