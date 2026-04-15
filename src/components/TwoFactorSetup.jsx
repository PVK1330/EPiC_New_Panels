import { useState, useEffect } from "react";
import Input from "./Input";
import Button from "./Button";
import eliteLogo from "../assets/elitepic_logo.png";

const TwoFactorSetup = ({ token, onSetupComplete, onCancel }) => {
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState("setup"); // setup, verify, complete

  const handleSetup = async () => {
    setLoading(true);
    setError("");
    // Demo mode - simulate API call with mock data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock QR code data (using a placeholder QR code)
    setQrCode("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/EPiC:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=EPiC");
    setSecret("JBSWY3DPEHPK3PXP");
    setBackupCodes(["ABCD1234", "EFGH5678", "IJKL9012", "MNOP3456", "QRST7890", "UVWX2345"]);
    setStep("verify");
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Enter a valid 6-digit code");
      return;
    }

    setVerifying(true);
    setError("");
    // Demo mode - simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setStep("complete");
    setVerifying(false);
    if (onSetupComplete) onSetupComplete({ success: true });
  };

  useEffect(() => {
    handleSetup();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <img src={eliteLogo} alt="EPiC Logo" className="h-12 w-auto mx-auto mb-3" />
        <h2 className="text-xl font-black text-secondary">Two-Factor Authentication Setup</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm font-bold">
          {error}
        </div>
      )}

      {step === "setup" && loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-gray-600 font-bold">Generating QR code...</p>
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
                <code className="text-sm font-mono text-secondary bg-white px-3 py-2 rounded border block">
                  {secret}
                </code>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                label="Enter the 6-digit code from your app"
                name="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value);
                  setError("");
                }}
                placeholder="123456"
                maxLength={6}
                error={error}
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
            <h4 className="text-sm font-black text-yellow-800 mb-2">⚠️ Save Your Backup Codes</h4>
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

          <Button onClick={onCancel} className="w-full">
            Done
          </Button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
