import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials, logout } from "../store/slices/authSlice";
import { loginUser, registerUser, logoutUser } from "../services/auth.service";
import { ROLE_NAMES, ROLE_ROUTES } from "../utils/constants";

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.data?.requires_2fa) {
        sessionStorage.setItem("pending_2fa_email", email);
        sessionStorage.setItem("pending_2fa_password", password);
        navigate("/2fa");
        return { twoFactorRequired: true };
      }
      const { user: userData, token: jwtToken } = res.data;
      const role = ROLE_NAMES[userData.role_id] || "candidate";
      dispatch(
        setCredentials({ user: { ...userData, role }, token: jwtToken }),
      );
      navigate(ROLE_ROUTES[userData.role_id] || "/candidate/dashboard");
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
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout: handleLogout,
  };
};

export default useAuth;
