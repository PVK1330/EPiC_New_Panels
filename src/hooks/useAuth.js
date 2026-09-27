import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials, logout } from "../store/slices/authSlice";
import { setOrgSettings } from "../store/slices/orgSettingsSlice";
import { loginUser, registerUser, logoutUser } from "../services/auth.service";
import { getAuthUserAndToken, getDashboardRouteForUser, resolveLoginRole } from "../utils/authResponse";

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res?.data?.requires_2fa || res?.requires_2fa || res?.data?.data?.requires_2fa) {
        // BUG-003: never persist the plaintext password. The /2fa/verify endpoint
        // only needs { email, token }, so the email alone carries the pending step.
        sessionStorage.setItem("pending_2fa_email", email);
        navigate("/2fa");
        return { twoFactorRequired: true };
      }
      const { user: userData, allowedModules } = getAuthUserAndToken(res);
      if (!userData) {
        throw new Error(res?.message || "Invalid login response");
      }
      const role = resolveLoginRole(userData);
      const user = {
        ...userData,
        role,
        organisation_id: userData.organisation_id ?? null,
      };
      dispatch(setCredentials({ user, allowedModules }));
      if (userData.organisation) {
        dispatch(setOrgSettings(userData.organisation));
      }
      navigate(getDashboardRouteForUser(user));
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data) => {
    setIsLoading(true);
    try {
      const res = await registerUser(data);
      sessionStorage.setItem("pending_otp_email", data.email);
      // Prefer the organisation the backend resolved (a firm code such as
      // "EPIC2026" from a registration link becomes its numeric id), matching
      // the login page, so OTP verification hits the same tenant.
      const resolvedOrgId =
        res?.data?.organisation_id || res?.organisation_id || data.organisation_id || "";
      if (resolvedOrgId) {
        sessionStorage.setItem("pending_otp_org_id", String(resolvedOrgId));
      } else {
        sessionStorage.removeItem("pending_otp_org_id");
      }
      navigate("/verify-otp");
      return { success: true };
    } finally {
      // BUG-009: `finally` guarantees the loading spinner always clears, even when
      // registerUser throws. The error intentionally propagates to the caller
      // (RegisterPage's try/catch surfaces it) — no swallowing here.
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    dispatch(logout());
    navigate("/login");
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout: handleLogout,
  };
};

export default useAuth;
