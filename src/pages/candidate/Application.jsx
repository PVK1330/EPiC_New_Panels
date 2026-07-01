import CandidateApplicationForm from "../../components/CandidateApplicationForm/CandidateApplicationForm";

// The draft-review prompt, form locking, and "No — I need to make changes"
// unlock flow are all handled inside CandidateApplicationForm (single source of
// truth). A previous outer <fieldset disabled> + DraftReviewBanner wrapper here
// double-locked the form: clicking "No" on the inner prompt unlocked the form's
// own state but left the outer fieldset disabled, so the candidate could never
// edit. Rendering the form directly resolves that.
const Application = () => {
  return (
    <div className="pb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <CandidateApplicationForm />
    </div>
  );
};

export default Application;
