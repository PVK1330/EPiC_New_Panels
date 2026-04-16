import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import Button from "../../components/Button";
import eliteLogo from "../../assets/elitepic_logo.png";
import useAuth from "../../hooks/useAuth";

const ROLE_OPTIONS = [
  { value: 3, label: "Candidate" },
  { value: 4, label: "Business" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country_code: "+44",
    mobile: "",
    role_id: 3,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "role_id" ? Number(value) : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = "First name is required";
    if (!form.last_name.trim()) errs.last_name = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "At least 8 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!form.country_code.trim()) errs.country_code = "Country code is required";
    if (!form.mobile.trim()) errs.mobile = "Mobile number is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
    } catch (err) {
      setApiError(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
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
          Create an account
        </h1>
        <p className="text-center text-xs font-bold text-gray-500 mb-6">
          Caseworkers and admins are invited separately.
        </p>

        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="John"
              error={errors.first_name}
              required
            />
            <Input
              label="Last name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Doe"
              error={errors.last_name}
              required
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={errors.email}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Country code"
              name="country_code"
              value={form.country_code}
              onChange={handleChange}
              placeholder="+44"
              error={errors.country_code}
              required
            />
            <div className="col-span-2">
              <Input
                label="Mobile number"
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                placeholder="7911123456"
                error={errors.mobile}
                required
              />
            </div>
          </div>

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            error={errors.password}
            required
          />

          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat password"
            error={errors.confirmPassword}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block">
              Register as
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role_id: r.value }))}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all duration-200 ${
                    form.role_id === r.value
                      ? "bg-primary border-primary text-white shadow-sm shadow-primary/20"
                      : "bg-white border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-black text-secondary hover:text-primary hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
