import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp, verifyResetOtp } from "../services/auth.service";

const useOtp = (type = "register") => {
  const navigate = useNavigate();
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
        await verifyOtp({ email, otp });
        sessionStorage.removeItem("pending_otp_email");
        navigate("/login");
      } else {
        const res = await verifyResetOtp({ email, otp });
        console.log("Verify Reset OTP Response:", res);
        const token = res?.data?.reset_token || res?.reset_token;
        if (token) {
          sessionStorage.setItem("reset_token", token);
          console.log("Token stored in sessionStorage");
        } else {
          console.error("No token found in response:", res);
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
