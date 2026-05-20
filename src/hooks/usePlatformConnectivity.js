import { useCallback, useState } from "react";
import {
  getConnectivitySettings,
  updateConnectivitySettings,
  testSmtpConnection,
} from "../services/platformSettingsApi";

const SMTP_DEFAULTS = {
  host:       "",
  username:   "",
  password:   "",
  port:       "587",
  encryption: "tls",
};

const S3_DEFAULTS = {
  bucket_name: "",
  region:      "",
  access_key:  "",
  secret_key:  "",
  endpoint:    "",
};

export default function usePlatformConnectivity() {
  const [smtp, setSmtp]         = useState(SMTP_DEFAULTS);
  const [s3, setS3]             = useState(S3_DEFAULTS);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [testing, setTesting]   = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok, error? }
  const [error, setError]       = useState(null);

  // Dirty flags — prevent sending the mask string back to the server
  const [dirtyFields, setDirtyFields] = useState({
    smtp_password: false,
    s3_access_key: false,
    s3_secret_key: false,
  });

  const markDirty = useCallback((field) => {
    setDirtyFields((prev) => ({ ...prev, [field]: true }));
  }, []);

  const resetDirtyFlags = useCallback(() => {
    setDirtyFields({ smtp_password: false, s3_access_key: false, s3_secret_key: false });
  }, []);

  const fetchConnectivitySettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getConnectivitySettings();
      const s = res.data?.data?.settings;
      if (s?.smtp) setSmtp((prev) => ({ ...prev, ...s.smtp }));
      if (s?.s3)   setS3((prev)   => ({ ...prev, ...s.s3   }));
      return { ok: true };
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load connectivity settings");
      return { ok: false, error: e };
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConnectivitySettings = useCallback(async ({ smtp: smtpData, s3: s3Data }) => {
    setSaving(true);
    setError(null);
    setTestResult(null);

    // Strip masked / unchanged sensitive fields before sending
    const MASK = "••••••••";
    const smtpPayload = { ...smtpData };
    if (!dirtyFields.smtp_password || smtpPayload.password === MASK) {
      delete smtpPayload.password;
    }

    const s3Payload = { ...s3Data };
    if (!dirtyFields.s3_access_key || s3Payload.access_key === MASK) {
      delete s3Payload.access_key;
    }
    if (!dirtyFields.s3_secret_key || s3Payload.secret_key === MASK) {
      delete s3Payload.secret_key;
    }

    try {
      await updateConnectivitySettings({ smtp: smtpPayload, s3: s3Payload });
      // Optimistically sync local state (keep masked values as-is for secrets)
      setSmtp((prev) => ({ ...prev, ...smtpData }));
      setS3((prev)   => ({ ...prev, ...s3Data   }));
      resetDirtyFlags();
      return { ok: true };
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save connectivity settings");
      return { ok: false, error: e };
    } finally {
      setSaving(false);
    }
  }, [dirtyFields, resetDirtyFlags]);

  const runSmtpTest = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSmtpConnection();
      const result = res.data?.data ?? { ok: false, error: "No response" };
      setTestResult(result);
      return { ok: result.ok, error: result.error };
    } catch (e) {
      const msg = e?.response?.data?.message || "SMTP test failed";
      setTestResult({ ok: false, error: msg });
      return { ok: false, error: msg };
    } finally {
      setTesting(false);
    }
  }, []);

  return {
    smtp,
    setSmtp,
    s3,
    setS3,
    loading,
    saving,
    testing,
    testResult,
    error,
    dirtyFields,
    markDirty,
    fetchConnectivitySettings,
    saveConnectivitySettings,
    runSmtpTest,
  };
}
