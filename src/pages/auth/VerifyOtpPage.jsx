import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import Button from "../../components/Button";
import eliteLogo from "../../assets/elitepic_logo.png";
import useOtp from "../../hooks/useOtp";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, countdown, isResendDisabled, isLoading, error } = useOtp("register");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const email = sessionStorage.getItem("pending_otp_email") || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      setOtpError("Enter a valid 6-digit OTP");
      return;
    }
    setOtpError("");
    await verifyOtp(otp.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-7 flex flex-col items-center">
          <img
            src={eliteLogo}
            alt="ElitePic Logo"
            className="h-14 w-auto mb-2"
          />
          <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
            Customer Relationship Management
          </p>
        </div>

        <h1 className="text-lg font-black text-secondary text-center mb-1">
          Verify your email
        </h1>
        <p className="text-center text-xs font-bold text-gray-500 mb-6">
          We sent a 6-digit code to{" "}
          <span className="text-secondary">{email || "your email"}</span>.
        </p>

        {(error || otpError) && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
            {error || otpError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Verification code"
            name="otp"
            type="text"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              setOtpError("");
            }}
            placeholder="123456"
            error={otpError}
            required
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Verifying…" : "Verify OTP"}
          </Button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={resendOtp}
            disabled={isResendDisabled}
            className="text-sm font-bold text-secondary hover:text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isResendDisabled ? `Resend in ${countdown}s` : "Resend OTP"}
          </button>
        </div>

        <p className="mt-3 text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-xs font-bold text-gray-500 hover:text-primary hover:underline"
          >
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  );
}
