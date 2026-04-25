import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import Button from "../../components/Button";
import eliteLogo from "../../assets/elitepic_logo.png";
import { setNewPassword } from "../../services/auth.service";

export default function SetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const email = sessionStorage.getItem("pending_reset_email") || "";
  const [token, setToken] = useState(sessionStorage.getItem("reset_token") || "");

  useEffect(() => {
    if (!sessionStorage.getItem("reset_token")) {
      setApiError("Reset session expired. Please verify OTP again.");
    }
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "At least 8 characters";
    if (!form.confirmPassword) errs.confirmPassword = "Confirm your password";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setIsLoading(true);
    try {
      console.log("Submitting password reset with token:", token ? "Exists" : "MISSING");
      await setNewPassword({
        email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        resetToken: token,
      });
      sessionStorage.removeItem("pending_reset_email");
      sessionStorage.removeItem("reset_token");
      navigate("/login");
    } catch (err) {
      setApiError(err.message || "Failed to set new password");
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
          Set new password
        </h1>
        <p className="text-center text-xs font-bold text-gray-500 mb-6">
          Choose a strong password for your account.
        </p>

        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            error={errors.password}
            required
          />
          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat password"
            error={errors.confirmPassword}
            required
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving…" : "Set new password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
