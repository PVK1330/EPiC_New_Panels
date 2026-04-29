import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import eliteLogo from "../assets/elitepic_logo.png";
import { disable2fa } from "../services/auth2faService";

function getApiError(error) {
  const d = error?.response?.data;
  const m = d?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m) && m.length) return m[0];
  return error?.message || "Something went wrong";
}

const TwoFactorDisable = ({ onDisableComplete, onCancel }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDisable = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await disable2fa({ password });
      if (onDisableComplete) onDisableComplete({ success: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <img src={eliteLogo} alt="EPiC Logo" className="h-12 w-auto mx-auto mb-3" />
        <h2 className="text-xl font-black text-secondary">Disable Two-Factor Authentication</h2>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-bold text-yellow-800">
          Disabling 2FA will make your account less secure. You can re-enable it at any time from your settings.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleDisable} className="space-y-4">
        <Input
          label="Enter your password to confirm"
          name="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder="••••••••"
          required
        />
        <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? "Disabling..." : "Disable 2FA"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-bold text-secondary hover:text-primary hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TwoFactorDisable;
