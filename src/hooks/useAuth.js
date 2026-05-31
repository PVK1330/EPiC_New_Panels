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
        sessionStorage.setItem("pending_2fa_email", email);
        sessionStorage.setItem("pending_2fa_password", password);
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
      await registerUser(data);
      sessionStorage.setItem("pending_otp_email", data.email);
      if (data.organisation_id) {
        sessionStorage.setItem("pending_otp_org_id", data.organisation_id);
      }
      navigate("/verify-otp");
      return { success: true };
    } finally {
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
