import { useCallback, useState } from "react";
import { getSponsors } from "../services/sponsorApi";

export default function useSponsor() {
  const [sponsors, setSponsors] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchSponsors = useCallback(async (page, limit, search, status) => {
    setLoading(true);
    try {
      const res = await getSponsors(page, limit, search, status);
      const payload = res.data?.data;
      setSponsors(payload?.sponsors ?? []);
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
      setSponsors([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
      return { ok: false, error: e };
    } finally {
      setLoading(false);
    }
  }, []);

  return { sponsors, pagination, loading, fetchSponsors };
}
