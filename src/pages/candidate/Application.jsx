import { useCallback, useEffect, useState } from "react";
import CandidateApplicationForm from "../../components/CandidateApplicationForm/CandidateApplicationForm";
import DraftReviewBanner from "../../components/candidate/DraftReviewBanner";
import { getDraftReviewState } from "../../services/workflowApi";

const Application = () => {
  const [formLocked, setFormLocked] = useState(false);

  const refreshLock = useCallback(async () => {
    try {
      const data = await getDraftReviewState();
      setFormLocked(Boolean(data?.showDraftReviewPrompt));
    } catch {
      setFormLocked(false);
    }
  }, []);

  useEffect(() => {
    refreshLock();
  }, [refreshLock]);

  return (
    <div className="pb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <DraftReviewBanner onUnlocked={() => setFormLocked(false)} onResponded={refreshLock} />
      <fieldset disabled={formLocked} className={formLocked ? "opacity-90 pointer-events-none" : ""}>
        <CandidateApplicationForm />
      </fieldset>
    </div>
  );
};

export default Application;
