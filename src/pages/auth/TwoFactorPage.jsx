import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import Button from "../../components/Button";
import eliteLogo from "../../assets/elitepic_logo.png";
import useTwoFactor from "../../hooks/useTwoFactor";

export default function TwoFactorPage() {
  const navigate = useNavigate();
  const { verifyLoginTwoFactor, isLoading, error } = useTwoFactor();
  const [token, setToken] = useState("");
  const [tokenError, setTokenError] = useState("");

  const email = sessionStorage.getItem("pending_2fa_email") || "";
  const password = sessionStorage.getItem("pending_2fa_password") || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim() || token.length !== 6) {
      setTokenError("Enter a valid 6-digit authenticator code");
      return;
    }
    setTokenError("");
    await verifyLoginTwoFactor(email, password, token.trim());
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
          Two-factor authentication
        </h1>
        <p className="text-center text-xs font-bold text-gray-500 mb-6">
          Enter the 6-digit code from your authenticator app.
        </p>

        {(error || tokenError) && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
            {error || tokenError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Authenticator code"
            name="token"
            type="text"
            value={token}
            onChange={(e) => {
              setToken(e.target.value.replace(/\D/g, "").slice(0, 6));
              setTokenError("");
            }}
            placeholder="123456"
            error={tokenError}
            required
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Verifying…" : "Verify"}
          </Button>
        </form>

        <p className="mt-5 text-center">
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
