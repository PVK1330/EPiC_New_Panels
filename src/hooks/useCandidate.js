import { useCallback, useState } from "react";
import { getCandidates } from "../services/candidateApi";

export default function useCandidate() {
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCandidates = useCallback(async (page, limit, search, status, visaType, paymentStatus) => {
    setLoading(true);
    try {
      const res = await getCandidates(page, limit, search, status, visaType, paymentStatus);
      const payload = res.data?.data;
      setCandidates(payload?.candidates ?? []);
      setPagination(
        payload?.pagination ?? {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      );
      return { ok: true };
    } catch (e) {
      setCandidates([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
      return { ok: false, error: e };
    } finally {
      setLoading(false);
    }
  }, []);

  return { candidates, pagination, loading, fetchCandidates };
}
