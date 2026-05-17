import { useCallback, useState } from "react";
import { getAdmins } from "../services/adminService";
import {
  getApplicationFieldSettings,
  toggleApplicationFieldVisibilityById,
  getApplicationCustomFields,
  createApplicationCustomField,
  deleteApplicationCustomField,
} from "../services/adminService";

export default function useAdmin() {
  const [admins, setAdmins] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);

  const [applicationFieldSettings, setApplicationFieldSettings] = useState([]);
  const [applicationCustomFields, setApplicationCustomFields] = useState([]);
  const [applicationFieldsLoading, setApplicationFieldsLoading] = useState(false);

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

  const fetchApplicationFieldSettings = useCallback(async () => {
    setApplicationFieldsLoading(true);
    try {
      const res = await getApplicationFieldSettings();
      const rows = res.data?.data ?? [];
      setApplicationFieldSettings(Array.isArray(rows) ? rows : []);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e };
    } finally {
      setApplicationFieldsLoading(false);
    }
  }, []);

  const toggleBuiltinFieldVisibilityById = useCallback(async (id, is_visible) => {
    try {
      await toggleApplicationFieldVisibilityById(id, is_visible);
      await fetchApplicationFieldSettings();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e };
    }
  }, [fetchApplicationFieldSettings]);

  const fetchApplicationCustomFields = useCallback(async () => {
    setApplicationFieldsLoading(true);
    try {
      const res = await getApplicationCustomFields();
      const rows = res.data?.data ?? [];
      setApplicationCustomFields(Array.isArray(rows) ? rows : []);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e };
    } finally {
      setApplicationFieldsLoading(false);
    }
  }, []);

  const addApplicationCustomField = useCallback(
    async ({ label, field_type }) => {
      try {
        await createApplicationCustomField({ label, field_type });
        await fetchApplicationCustomFields();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e };
      }
    },
    [fetchApplicationCustomFields],
  );

  const removeApplicationCustomField = useCallback(
    async (id) => {
      try {
        await deleteApplicationCustomField(id);
        await fetchApplicationCustomFields();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e };
      }
    },
    [fetchApplicationCustomFields],
  );

  return {
    admins,
    pagination,
    loading,
    fetchAdmins,
    applicationFieldSettings,
    applicationCustomFields,
    applicationFieldsLoading,
    fetchApplicationFieldSettings,
    toggleBuiltinFieldVisibilityById,
    fetchApplicationCustomFields,
    addApplicationCustomField,
    removeApplicationCustomField,
  };
}
