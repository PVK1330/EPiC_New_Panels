import { useState, useEffect, useCallback } from "react";
import Input from "./Input";
import Button from "./Button";
import eliteLogo from "../assets/elitepic_logo.png";
import { setup2fa, verify2faSetup } from "../services/auth2faService";

function getApiError(error) {
  const d = error?.response?.data;
  const m = d?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m) && m.length) return m[0];
  return error?.message || "Something went wrong";
}

const TwoFactorSetup = ({ onSetupComplete, onCancel }) => {
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState("loading");

  const runSetup = useCallback(async () => {
    setLoading(true);
    setError("");
    setStep("loading");
    try {
      const res = await setup2fa();
      const d = res.data?.data;
      if (!d) {
        setError("Invalid server response");
        setStep("error");
        return;
      }
      setQrCode(d.qrCode);
      setSecret(d.secret || "");
      setBackupCodes(Array.isArray(d.backupCodes) ? d.backupCodes : []);
      setStep("verify");
    } catch (e) {
      setError(getApiError(e));
      setStep("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSetup();
  }, [runSetup]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = verificationCode.trim();
    if (!code || code.length !== 6) {
      setError("Enter a valid 6-digit code");
      return;
    }

    setVerifying(true);
    setError("");
    try {
      await verify2faSetup({
        token: code,
        backupCodes,
      });
      setStep("complete");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <img src={eliteLogo} alt="EPiC Logo" className="h-12 w-auto mx-auto mb-3" />
        <h2 className="text-xl font-black text-secondary">Two-Factor Authentication Setup</h2>
      </div>

      {error && step !== "verify" && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm font-bold">{error}</div>
      )}

      {step === "loading" && loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-gray-600 font-bold">Generating QR code...</p>
        </div>
      )}

      {step === "error" && !loading && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-bold">{error}</div>
          <Button type="button" className="w-full" onClick={runSetup}>
            Try again
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-bold text-secondary hover:text-primary hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === "verify" && (
        <>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm font-bold text-gray-700 mb-4">
                Scan the QR code with your authenticator app (Google Authenticator, Microsoft Authenticator, etc.)
              </p>
              {qrCode && (
                <div className="bg-white p-4 rounded-xl inline-block shadow-sm">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              )}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-bold text-gray-600 mb-1">Manual entry code:</p>
                <code className="text-sm font-mono text-secondary bg-white px-3 py-2 rounded border block break-all">
                  {secret}
                </code>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-bold">{error}</div>
              )}
              <Input
                label="Enter the 6-digit code from your app"
                name="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                placeholder="123456"
                maxLength={6}
                required
                className="text-center text-2xl tracking-widest"
              />
              <Button type="submit" disabled={verifying} className="w-full">
                {verifying ? "Verifying..." : "Verify and Enable 2FA"}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-sm font-bold text-secondary hover:text-primary hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {step === "complete" && (
        <div className="text-center space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-black text-green-700 mb-2">2FA Enabled Successfully!</h3>
            <p className="text-sm text-green-600 font-bold">
              Your account is now protected with two-factor authentication.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left">
            <h4 className="text-sm font-black text-yellow-800 mb-2">Save Your Backup Codes</h4>
            <p className="text-xs text-yellow-700 mb-3">
              Store these codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <code key={index} className="text-xs font-mono bg-white px-2 py-1 rounded border text-yellow-900">
                  {code}
                </code>
              ))}
            </div>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={() => {
              if (onSetupComplete) onSetupComplete({ success: true });
            }}
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
