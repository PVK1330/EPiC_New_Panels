import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import Button from "../../components/Button";
import eliteLogo from "../../assets/elitepic_logo.png";
import { forgotPassword } from "../../services/auth.service";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email");
      return;
    }
    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
      sessionStorage.setItem("pending_reset_email", email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset OTP");
    } finally {
      setIsLoading(false);
    }
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
          Reset password
        </h1>
        <p className="text-center text-xs font-bold text-gray-500 mb-6">
          Enter your email address and we'll send a reset code.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {sent ? (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center font-medium">
              Reset code sent to <span className="font-black">{email}</span>
            </div>
            <Button
              type="button"
              onClick={() => navigate("/verify-reset-otp")}
              className="w-full"
            >
              Enter OTP
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@example.com"
              error={error}
              required
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Sending…" : "Send reset code"}
            </Button>
          </form>
        )}

        <p className="mt-5 text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-xs font-bold text-secondary hover:text-primary hover:underline"
          >
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  );
}
