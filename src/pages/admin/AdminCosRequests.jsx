import { useEffect, useState } from "react";
import CosReviewQueue from "../../components/cos/CosReviewQueue";
import {
  getAdminCosRequests,
  approveCosRequestAdmin,
  rejectCosRequestAdmin,
  assignCosRequestCaseworker,
} from "../../services/cosReviewApi";
import { getCaseworkers } from "../../services/caseWorker";

export default function AdminCosRequests() {
  const [caseworkers, setCaseworkers] = useState([]);

  useEffect(() => {
    getCaseworkers(1, 100)
      .then((res) => setCaseworkers(res?.data?.data?.caseworkers || []))
      .catch(() => {});
  }, []);

  return (
    <CosReviewQueue
      title="CoS Requests"
      subtitle="Review, assign, approve or reject sponsor Certificate of Sponsorship requests."
      loadRequests={getAdminCosRequests}
      approveRequest={approveCosRequestAdmin}
      rejectRequest={rejectCosRequestAdmin}
      assignRequest={assignCosRequestCaseworker}
      caseworkers={caseworkers}
      showAssign
    />
  );
}
