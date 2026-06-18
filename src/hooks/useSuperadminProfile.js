import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import {
  getSuperadminProfile,
  updateSuperadminProfile,
  uploadSuperadminAvatar,
  changeSuperadminPassword,
  setup2FAForSuperadmin,
  verify2FASetupForSuperadmin,
  disable2FAForSuperadmin,
} from '../services/superadminProfileApi';

function extractError(e) {
  const d = e?.response?.data;
  if (typeof d?.message === 'string' && d.message.trim()) return d.message;
  return e?.message || 'Something went wrong';
}

export default function useSuperadminProfile() {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const currentAllowedModules = useSelector((state) => state.auth.allowedModules);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSuperadminProfile();
      const user = res.data?.data?.user;
      if (user) setProfile(user);
      return { ok: true, user };
    } catch (e) {
      setError(extractError(e));
      return { ok: false, error: extractError(e) };
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (data) => {
    setSaving(true);
    setError(null);
    try {
      const res = await updateSuperadminProfile(data);
      const updated = res.data?.data?.user;
      if (updated) {
        setProfile(updated);
        dispatch(setCredentials({
          user: { ...authUser, ...updated },
          allowedModules: currentAllowedModules,
        }));
      }
      return { ok: true };
    } catch (e) {
      setError(extractError(e));
      return { ok: false, error: extractError(e) };
    } finally {
      setSaving(false);
    }
  }, [authUser, currentAllowedModules, dispatch]);

  const uploadAvatar = useCallback(async (file) => {
    setUploadingAvatar(true);
    setError(null);
    try {
      const res = await uploadSuperadminAvatar(file);
      const profilePic = res.data?.data?.profile_pic;
      if (profilePic) {
        setProfile((prev) => prev ? { ...prev, profile_pic: profilePic } : prev);
        dispatch(setCredentials({
          user: { ...authUser, profile_pic: profilePic },
          allowedModules: currentAllowedModules,
        }));
      }
      return { ok: true, profile_pic: profilePic };
    } catch (e) {
      setError(extractError(e));
      return { ok: false, error: extractError(e) };
    } finally {
      setUploadingAvatar(false);
    }
  }, [authUser, currentAllowedModules, dispatch]);

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    setChangingPassword(true);
    setError(null);
    try {
      await changeSuperadminPassword({ currentPassword, newPassword });
      return { ok: true };
    } catch (e) {
      setError(extractError(e));
      return { ok: false, error: extractError(e) };
    } finally {
      setChangingPassword(false);
    }
  }, []);

  const initiate2FASetup = useCallback(async () => {
    setTwoFactorLoading(true);
    setError(null);
    try {
      const res = await setup2FAForSuperadmin();
      return { ok: true, data: res.data?.data };
    } catch (e) {
      setError(extractError(e));
      return { ok: false, error: extractError(e) };
    } finally {
      setTwoFactorLoading(false);
    }
  }, []);

  const confirm2FASetup = useCallback(async (token) => {
    setTwoFactorLoading(true);
    setError(null);
    try {
      await verify2FASetupForSuperadmin({ token });
      setProfile((prev) => prev ? { ...prev, two_factor_enabled: true } : prev);
      return { ok: true };
    } catch (e) {
      setError(extractError(e));
      return { ok: false, error: extractError(e) };
    } finally {
      setTwoFactorLoading(false);
    }
  }, []);

  const disable2FA = useCallback(async ({ token, password }) => {
    setTwoFactorLoading(true);
    setError(null);
    try {
      await disable2FAForSuperadmin({ token, password });
      setProfile((prev) => prev ? { ...prev, two_factor_enabled: false } : prev);
      return { ok: true };
    } catch (e) {
      setError(extractError(e));
      return { ok: false, error: extractError(e) };
    } finally {
      setTwoFactorLoading(false);
    }
  }, []);

  return {
    profile,
    loading,
    saving,
    uploadingAvatar,
    changingPassword,
    twoFactorLoading,
    error,
    setError,
    fetchProfile,
    saveProfile,
    uploadAvatar,
    changePassword,
    initiate2FASetup,
    confirm2FASetup,
    disable2FA,
  };
}
