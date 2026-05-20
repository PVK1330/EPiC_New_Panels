import { useCallback, useState } from "react";
import {
  getSecuritySettings,
  updateSecuritySettings,
} from "../services/platformSettingsApi";

const DEFAULTS = {
  mfa_enforced:               true,
  ip_whitelist_enabled:       false,
  session_persistence:        true,
  inactivity_timeout_minutes: 30,
};

export default function usePlatformSecurity() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);

  const fetchSecuritySettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSecuritySettings();
      const s = res.data?.data?.settings;
      if (s) setSettings((prev) => ({ ...prev, ...s }));
      return { ok: true };
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load security settings");
      return { ok: false, error: e };
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSecuritySettings = useCallback(async (data) => {
    // Validate timeout before hitting the API
    const timeout = parseInt(data.inactivity_timeout_minutes, 10);
    if (!Number.isFinite(timeout) || timeout < 1) {
      return { ok: false, error: "Inactivity timeout must be a positive number" };
    }

    setSaving(true);
    setError(null);
    try {
      await updateSecuritySettings({ ...data, inactivity_timeout_minutes: timeout });
      setSettings((prev) => ({ ...prev, ...data, inactivity_timeout_minutes: timeout }));
      return { ok: true };
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save security settings");
      return { ok: false, error: e };
    } finally {
      setSaving(false);
    }
  }, []);

  const toggleSetting = useCallback((key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return {
    settings,
    setSettings,
    loading,
    saving,
    error,
    fetchSecuritySettings,
    saveSecuritySettings,
    toggleSetting,
  };
}
