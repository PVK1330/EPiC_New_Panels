import { useCallback, useState } from "react";
import {
  getCandidates,
  getMyApplication as getMyApplicationApi,
  submitApplication as submitApplicationApi,
  saveApplicationDraft as saveApplicationDraftApi,
} from "../services/candidateApi";

export default function useCandidate() {
  // ── Admin: paginated candidate list ────────────────────────────────────────
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCandidates = useCallback(
    async (page, limit, search, status, visaType, paymentStatus) => {
      setLoading(true);
      try {
        const res = await getCandidates(
          page,
          limit,
          search,
          status,
          visaType,
          paymentStatus,
        );
        const payload = res.data?.data;
        setCandidates(payload?.candidates ?? []);
        setPagination(
          payload?.pagination ?? { page, limit, total: 0, pages: 0 },
        );
        return { ok: true };
      } catch (e) {
        setCandidates([]);
        setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
        return { ok: false, error: e };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ── Candidate-facing: own application ──────────────────────────────────────
  const [myApplication, setMyApplication] = useState(null);
  const [applicationLoading, setApplicationLoading] = useState(false);

  /** Load the logged-in candidate's saved/submitted application from the backend. */
  const getMyApplication = useCallback(async () => {
    setApplicationLoading(true);
    try {
      const res = await getMyApplicationApi();
      const application = res.data?.data?.application ?? null;
      setMyApplication(application);
      return { ok: true, application };
    } catch (e) {
      return { ok: false, error: e };
    } finally {
      setApplicationLoading(false);
    }
  }, []);

  /**
   * Submit the completed application.
   * @param {object} data — full form payload (all application fields)
   */
  const submitApplication = useCallback(async (data) => {
    setApplicationLoading(true);
    try {
      const res = await submitApplicationApi(data);
      const application = res.data?.data?.application ?? null;
      setMyApplication(application);
      return { ok: true, application };
    } catch (e) {
      return { ok: false, error: e };
    } finally {
      setApplicationLoading(false);
    }
  }, []);

  /**
   * Save in-progress form data as a draft (does not change submission status).
   * @param {object} data — partial or full form payload
   */
  const saveApplicationDraft = useCallback(async (data) => {
    setApplicationLoading(true);
    try {
      const res = await saveApplicationDraftApi(data);
      const application = res.data?.data?.application ?? null;
      setMyApplication(application);
      return { ok: true, application };
    } catch (e) {
      return { ok: false, error: e };
    } finally {
      setApplicationLoading(false);
    }
  }, []);

  return {
    // admin list
    candidates,
    pagination,
    loading,
    fetchCandidates,

    // candidate's own application
    myApplication,
    applicationLoading,
    getMyApplication,
    submitApplication,
    saveApplicationDraft,
  };
}
