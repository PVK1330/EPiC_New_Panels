import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyOtp, resendOtp, verifyResetOtp, forgotPassword } from "../services/auth.service";
import { setCredentials } from "../store/slices/authSlice";
import { ROLE_NAMES, ROLE_ROUTES } from "../utils/constants";
import { getAuthUserAndToken, getPasswordResetToken } from "../utils/authResponse";

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
        const res = await verifyOtp({ email, otp });
        sessionStorage.removeItem("pending_otp_email");
        const { user: userData, token: jwtToken } = getAuthUserAndToken(res);
        if (userData && jwtToken) {
          const role = ROLE_NAMES[userData.role_id] || "candidate";
          dispatch(
            setCredentials({
              user: {
                ...userData,
                role,
                organisation_id: userData.organisation_id ?? null,
              },
              token: jwtToken,
            }),
          );
          navigate(ROLE_ROUTES[userData.role_id] || "/candidate/dashboard");
        } else {
          navigate("/login");
        }
      } else {
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const res = await verifyResetOtp({ email: normalizedEmail, otp });
        const token = getPasswordResetToken(res);
        if (token) {
          sessionStorage.setItem("reset_token", token);
          sessionStorage.setItem("pending_reset_email", normalizedEmail);
        }
        navigate("/set-password");
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
        await resendOtp(email);
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
