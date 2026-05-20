import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import {
  getIdentitySettings,
  updateIdentitySettings,
  uploadPlatformLogo,
  uploadPlatformFavicon,
} from "../services/platformSettingsApi";
import { setBranding } from "../store/slices/platformBrandingSlice";

const DEFAULTS = {
  platform_name:     "EPiC CRM",
  support_email:     "",
  default_locale:    "en-GB",
  timezone:          "Europe/London",
  maintenance_mode:  false,
  signups_enabled:   true,
  analytics_enabled: true,
  logo_url:          null,
  favicon_url:       null,
};

export default function usePlatformIdentity() {
  const dispatch = useDispatch();

  const [settings, setSettings]         = useState(DEFAULTS);
  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [uploadingLogo, setUploadingLogo]       = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [error, setError]               = useState(null);

  // Sync branding fields to Redux so sidebar picks them up immediately
  const syncBranding = useCallback((s) => {
    dispatch(setBranding({
      platform_name: s.platform_name,
      logo_url:      s.logo_url    ?? null,
      favicon_url:   s.favicon_url ?? null,
    }));
  }, [dispatch]);

  const fetchIdentitySettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIdentitySettings();
      const s = res.data?.data?.settings;
      if (s) {
        setSettings((prev) => ({ ...prev, ...s }));
        syncBranding({ ...DEFAULTS, ...s });
      }
      return { ok: true };
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load identity settings");
      return { ok: false, error: e };
    } finally {
      setLoading(false);
    }
  }, [syncBranding]);

  const saveIdentitySettings = useCallback(async (data) => {
    setSaving(true);
    setError(null);
    try {
      await updateIdentitySettings(data);
      setSettings((prev) => ({ ...prev, ...data }));
      syncBranding({ ...settings, ...data });
      return { ok: true };
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save identity settings");
      return { ok: false, error: e };
    } finally {
      setSaving(false);
    }
  }, [settings, syncBranding]);

  const uploadLogo = useCallback(async (file) => {
    setUploadingLogo(true);
    setError(null);
    try {
      const res = await uploadPlatformLogo(file);
      const logoUrl = res.data?.data?.logo_url;
      if (logoUrl) {
        setSettings((prev) => ({ ...prev, logo_url: logoUrl }));
        dispatch(setBranding({ logo_url: logoUrl }));
      }
      return { ok: true, logo_url: logoUrl };
    } catch (e) {
      setError(e?.response?.data?.message || "Logo upload failed");
      return { ok: false, error: e };
    } finally {
      setUploadingLogo(false);
    }
  }, [dispatch]);

  const uploadFavicon = useCallback(async (file) => {
    setUploadingFavicon(true);
    setError(null);
    try {
      const res = await uploadPlatformFavicon(file);
      const faviconUrl = res.data?.data?.favicon_url;
      if (faviconUrl) {
        setSettings((prev) => ({ ...prev, favicon_url: faviconUrl }));
        dispatch(setBranding({ favicon_url: faviconUrl }));
      }
      return { ok: true, favicon_url: faviconUrl };
    } catch (e) {
      setError(e?.response?.data?.message || "Favicon upload failed");
      return { ok: false, error: e };
    } finally {
      setUploadingFavicon(false);
    }
  }, [dispatch]);

  return {
    settings,
    setSettings,
    loading,
    saving,
    uploadingLogo,
    uploadingFavicon,
    error,
    fetchIdentitySettings,
    saveIdentitySettings,
    uploadLogo,
    uploadFavicon,
  };
}
