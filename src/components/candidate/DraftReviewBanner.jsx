import { useCallback, useEffect, useState } from "react";
import { getCandidateWorkflowProcess, submitDraftReview } from "../../services/workflowApi";
import { useToast } from "../../context/ToastContext";
import Button from "../Button";

export default function DraftReviewBanner({ onUnlocked, onResponded }) {
  const { showToast } = useToast();
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getCandidateWorkflowProcess();
      const inDraftReview = data?.caseStage === "draft_application_review";
      const confirmed = data?.workflowState?.draftReview?.confirmed;
      setState({
        showDraftReviewPrompt: inDraftReview && confirmed === null,
      });
    } catch {
      setState(null);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const respond = async (approved) => {
    setBusy(true);
    try {
      const data = await submitDraftReview(approved);
      const inDraftReview = data?.caseStage === "draft_application_review";
      const confirmed = data?.workflowState?.draftReview?.confirmed;
      setState({
        showDraftReviewPrompt: inDraftReview && confirmed === null,
      });
      if (!approved) onUnlocked?.();
      showToast({
        message: approved
          ? "Thank you — your caseworker will proceed with the Client Care Letter."
          : "You can edit your application and resubmit when ready.",
      });
      await onResponded?.();
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Could not save your response",
      });
    } finally {
      setBusy(false);
    }
  };

  if (!state?.showDraftReviewPrompt) return null;

  return (
    <div className="mb-6 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
      <h2 className="text-lg font-black text-amber-900">Draft application review</h2>
      <p className="mt-2 text-sm font-bold text-amber-800">
        Your caseworker has sent your draft for review. The form below is read-only until you
        confirm. Is the draft correct?
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button disabled={busy} onClick={() => respond(true)}>
          Yes — draft is correct
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => respond(false)}>
          No — I need to make changes
        </Button>
      </div>
    </div>
  );
}
