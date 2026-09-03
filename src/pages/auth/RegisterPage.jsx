import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import PhoneInput from "../../components/PhoneInput";
import Button from "../../components/Button";
import { isValidPhone } from "../../utils/countries";
import eliteLogo from "../../assets/elitepic-logo.png";
import useAuth from "../../hooks/useAuth";

// role_id values MUST match the backend ROLES map: candidate = 1, business = 4.
// (Previously "Candidate" was mis-mapped to value 3, which is the ADMIN role —
// silently granting admin to every self-registered candidate.)
const ROLE_OPTIONS = [
  { value: 1, label: "Client" },
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
    role_id: 1, // candidate (was 3 = admin — privilege-escalation bug)
    address: "",
    addressStartDate: "",
    housingStatus: "Rent",
    landlordName: "",
    landlordContactNumber: "",
    landlordEmail: "",
    landlordAddress: "",
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
    // Mirror the backend strong-password policy (12+ chars with upper, lower,
    // digit and special character) so users see the rule before submitting.
    else if (
      form.password.length < 12 ||
      !/[a-z]/.test(form.password) ||
      !/[A-Z]/.test(form.password) ||
      !/[0-9]/.test(form.password) ||
      !/[^A-Za-z0-9]/.test(form.password)
    )
      errs.password = "Min 12 characters with upper, lower, number & symbol";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!form.country_code.trim()) errs.country_code = "Country code is required";
    if (!form.mobile.trim()) errs.mobile = "Mobile number is required";
    else if (!isValidPhone(form.country_code, form.mobile))
      errs.mobile = "Enter a valid phone number for the selected country";

    if (form.role_id === 1) {
      if (!form.address.trim()) errs.address = "Address is required";
      if (!form.addressStartDate) {
        errs.addressStartDate = "Move-in date is required";
      } else {
        const moveIn = new Date(form.addressStartDate);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (moveIn > today) {
          errs.addressStartDate = "Move-in date cannot be in the future";
        }
      }
      if (form.housingStatus === "Rent") {
        if (!form.landlordName.trim()) {
          errs.landlordName = "Landlord name is required when renting";
        }
        if (!form.landlordContactNumber.trim()) {
          errs.landlordContactNumber = "Landlord contact number is required when renting";
        }
        if (form.landlordEmail.trim()) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.landlordEmail.trim())) {
            errs.landlordEmail = "Please enter a valid landlord email";
          }
        }
      }
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    try {
      const { confirmPassword, ...payload } = form;
      if (form.role_id !== 1) {
        delete payload.address;
        delete payload.addressStartDate;
        delete payload.housingStatus;
        delete payload.landlordName;
        delete payload.landlordContactNumber;
        delete payload.landlordEmail;
        delete payload.landlordAddress;
      }
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

          <PhoneInput
            split
            label="Mobile number"
            dialCode={form.country_code}
            national={form.mobile}
            dialName="country_code"
            nationalName="mobile"
            onChange={handleChange}
            placeholder="7911123456"
            error={errors.mobile}
            required
          />

          {form.role_id === 1 && (
            <>
              <Input
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street address"
                error={errors.address}
                required
              />

              <Input
                label="When did you move into this address? *"
                name="addressStartDate"
                type="date"
                value={form.addressStartDate}
                onChange={handleChange}
                error={errors.addressStartDate}
                max={new Date().toISOString().split("T")[0]}
                required
              />

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1">
                  Housing status
                </label>
                <div className="flex gap-4 mt-2">
                  {["Rent", "Own", "Other"].map((val) => (
                    <label key={val} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="housingStatus"
                        value={val}
                        checked={form.housingStatus === val}
                        onChange={handleChange}
                        className="accent-secondary"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>

              {form.housingStatus === "Rent" && (
                <div className="rounded-xl border border-secondary/20 bg-secondary/[0.02] p-4 space-y-3">
                  <p className="text-xs font-black text-secondary">Landlord Details</p>
                  <Input
                    label="Landlord Name *"
                    name="landlordName"
                    value={form.landlordName}
                    onChange={handleChange}
                    placeholder="Landlord or agency name"
                    error={errors.landlordName}
                    required
                  />
                  <Input
                    label="Landlord Contact Number *"
                    name="landlordContactNumber"
                    value={form.landlordContactNumber}
                    onChange={handleChange}
                    placeholder="e.g. 07123456789"
                    error={errors.landlordContactNumber}
                    required
                  />
                  <Input
                    label="Landlord Email"
                    name="landlordEmail"
                    type="email"
                    value={form.landlordEmail}
                    onChange={handleChange}
                    placeholder="landlord@example.com"
                    error={errors.landlordEmail}
                  />
                  <Input
                    label="Landlord Address"
                    name="landlordAddress"
                    value={form.landlordAddress}
                    onChange={handleChange}
                    placeholder="Landlord physical address"
                  />
                </div>
              )}
            </>
          )}

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 12 characters"
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
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all duration-200 ${form.role_id === r.value
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
