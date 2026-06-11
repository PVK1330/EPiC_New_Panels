import CosReviewQueue from "../../components/cos/CosReviewQueue";
import {
  getCaseworkerCosRequests,
  approveCosRequestCaseworker,
  rejectCosRequestCaseworker,
} from "../../services/cosReviewApi";

export default function CaseworkerCosRequests() {
  return (
    <CosReviewQueue
      title="Assigned CoS Requests"
      subtitle="Review the Certificate of Sponsorship requests assigned to you."
      loadRequests={getCaseworkerCosRequests}
      approveRequest={approveCosRequestCaseworker}
      rejectRequest={rejectCosRequestCaseworker}
    />
  );
}
