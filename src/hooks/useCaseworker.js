import { useCallback, useState } from "react";
import { getCaseworkers } from "../services/caseWorker";

export default function useCaseworker() {
  const [caseworkers, setCaseworkers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCaseworkers = useCallback(async (page, limit, search, status, department) => {
    setLoading(true);
    try {
      const res = await getCaseworkers(page, limit, search, status, department);
      const payload = res.data?.data;
      setCaseworkers(payload?.caseworkers ?? []);
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
      setCaseworkers([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
      return { ok: false, error: e };
    } finally {
      setLoading(false);
    }
  }, []);

  return { caseworkers, pagination, loading, fetchCaseworkers };
}
