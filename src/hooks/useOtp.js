import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyOtp, resendOtp, verifyResetOtp, forgotPassword } from "../services/auth.service";
import { setCredentials } from "../store/slices/authSlice";
import { getAuthUserAndToken, getPasswordResetToken, getDashboardRouteForUser, resolveLoginRole } from "../utils/authResponse";

const useOtp = (type = "register") => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const verifyOtpHandler = async (otp) => {
    setIsLoading(true);
    setError("");
    try {
      const email =
        type === "register"
          ? sessionStorage.getItem("pending_otp_email")
          : sessionStorage.getItem("pending_reset_email");
      if (type === "register") {
        const organisationId = sessionStorage.getItem("pending_otp_org_id");
        const payload = { email, otp };
        if (organisationId) payload.organisation_id = organisationId;
        const res = await verifyOtp(payload);
        sessionStorage.removeItem("pending_otp_email");
        sessionStorage.removeItem("pending_otp_org_id");
        const { user: userData, allowedModules } = getAuthUserAndToken(res);
        if (userData) {
          const role = resolveLoginRole(userData);
          const user = {
            ...userData,
            role,
            organisation_id: userData.organisation_id ?? null,
          };
          dispatch(setCredentials({ user, allowedModules }));
          navigate(getDashboardRouteForUser(user));
        } else {
          navigate("/login");
        }
      } else {
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const res = await verifyResetOtp({ email: normalizedEmail, otp });
        const token = getPasswordResetToken(res);
        // BUG-020: only advance to /set-password when verification actually
        // succeeded (a reset token was issued). Otherwise surface the error and
        // stay on the OTP screen.
        if (token) {
          sessionStorage.setItem("reset_token", token);
          sessionStorage.setItem("pending_reset_email", normalizedEmail);
          navigate("/set-password");
        } else {
          setError(res?.message || "Invalid or expired code. Please try again.");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtpHandler = async () => {
    if (countdown > 0) return;
    setError("");
    try {
      const email =
        type === "register"
          ? sessionStorage.getItem("pending_otp_email")
          : sessionStorage.getItem("pending_reset_email");
      
      if (type === "register") {
        const organisationId = sessionStorage.getItem("pending_otp_org_id");
        const payload = { email };
        if (organisationId) payload.organisation_id = organisationId;
        await resendOtp(payload.email, organisationId);
      } else {
        await forgotPassword(email);
      }
      startCountdown();
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    verifyOtp: verifyOtpHandler,
    resendOtp: resendOtpHandler,
    countdown,
    isResendDisabled: countdown > 0,
    isLoading,
    error,
  };
};

export default useOtp;
