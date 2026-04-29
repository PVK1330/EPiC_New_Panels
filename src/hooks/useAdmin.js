import { useCallback, useState } from "react";
import { getAdmins } from "../services/adminService";

export default function useAdmin() {
  const [admins, setAdmins] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAdmins = useCallback(async (page, limit, search, status) => {
    setLoading(true);
    try {
      const res = await getAdmins(page, limit, search, status);
      const payload = res.data?.data;
      setAdmins(payload?.admins ?? []);
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
      setAdmins([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
      return { ok: false, error: e };
    } finally {
      setLoading(false);
    }
  }, []);

  return { admins, pagination, loading, fetchAdmins };
}
