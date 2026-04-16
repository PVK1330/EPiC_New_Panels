import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ChevronDown } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import eliteLogo from "../assets/elitepic_logo.png";
import { setCredentials } from "../store/slices/authSlice";
import { loginUser, registerUser, forgotPassword, verifyTwoFactor } from "../services/auth.service";
import { ROLE_NAMES, ROLE_ROUTES } from "../utils/constants";

const VIEWS = {
  login: "login",
  register: "register",
  forgot: "forgot",
  twoFactor: "twoFactor",
};

const COUNTRIES = [
  { code: "+44", name: "United Kingdom" },
  { code: "+44", name: "England" },
  { code: "+44", name: "Scotland" },
  { code: "+44", name: "Wales" },
  { code: "+44", name: "Northern Ireland" },
  { code: "+1", name: "United States" },
  { code: "+91", name: "India" },
  { code: "+61", name: "Australia" },
  { code: "+1", name: "Canada" },
  { code: "+49", name: "Germany" },
  { code: "+33", name: "France" },
  { code: "+39", name: "Italy" },
  { code: "+34", name: "Spain" },
  { code: "+31", name: "Netherlands" },
  { code: "+81", name: "Japan" },
  { code: "+86", name: "China" },
  { code: "+82", name: "South Korea" },
  { code: "+65", name: "Singapore" },
  { code: "+971", name: "United Arab Emirates" },
  { code: "+974", name: "Qatar" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+27", name: "South Africa" },
  { code: "+55", name: "Brazil" },
  { code: "+52", name: "Mexico" },
  { code: "+353", name: "Ireland" },
  { code: "+46", name: "Sweden" },
  { code: "+47", name: "Norway" },
  { code: "+358", name: "Finland" },
  { code: "+45", name: "Denmark" },
  { code: "+41", name: "Switzerland" },
  { code: "+43", name: "Austria" },
  { code: "+48", name: "Poland" },
  { code: "+420", name: "Czech Republic" },
  { code: "+36", name: "Hungary" },
  { code: "+40", name: "Romania" },
  { code: "+30", name: "Greece" },
  { code: "+90", name: "Turkey" },
  { code: "+7", name: "Russia" },
  { code: "+380", name: "Ukraine" },
  { code: "+372", name: "Estonia" },
  { code: "+371", name: "Latvia" },
  { code: "+370", name: "Lithuania" },
  { code: "+351", name: "Portugal" },
  { code: "+354", name: "Iceland" },
  { code: "+352", name: "Luxembourg" },
  { code: "+350", name: "Gibraltar" },
  { code: "+44", name: "Isle of Man" },
  { code: "+44", name: "Jersey" },
  { code: "+44", name: "Guernsey" },
];

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [view, setView] = useState(VIEWS.login);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    nationality: "",
  });
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [registerErrors, setRegisterErrors] = useState({});
  const [registerLoading, setRegisterLoading] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleRegisterChange = (e) => {
    setRegisterForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setRegisterErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleCountryCodeChange = (country) => {
    setSelectedCountry(country);
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const validateRegister = () => {
    const errs = {};
    if (!registerForm.firstName.trim()) errs.firstName = "First name is required";
    if (!registerForm.lastName.trim()) errs.lastName = "Last name is required";
    if (!registerForm.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email))
      errs.email = "Enter a valid email";
    if (!registerForm.password) errs.password = "Password is required";
    else if (registerForm.password.length < 8) errs.password = "At least 8 characters";
    if (registerForm.password !== registerForm.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (!registerForm.dob) errs.dob = "Date of birth is required";
    if (!registerForm.phone.trim()) errs.phone = "Phone number is required";
    if (!registerForm.address.trim()) errs.address = "Address is required";
    if (!registerForm.city.trim()) errs.city = "City is required";
    if (!registerForm.state.trim()) errs.state = "State is required";
    if (!registerForm.country.trim()) errs.country = "Country is required";
    if (!registerForm.pincode.trim()) errs.pincode = "Pincode is required";
    if (!registerForm.nationality.trim()) errs.nationality = "Nationality is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      const res = await loginUser({ email: form.email, password: form.password });
      if (res.data?.requires_2fa) {
        setPendingLogin({ email: form.email, password: form.password });
        setView(VIEWS.twoFactor);
      } else {
        const { user: userData, token: jwtToken } = res.data;
        const role = ROLE_NAMES[userData.role_id] || "candidate";
        dispatch(setCredentials({ user: { ...userData, role }, token: jwtToken }));
        navigate(ROLE_ROUTES[userData.role_id] || "/candidate/dashboard");
      }
    } catch (err) {
      setErrors({ password: err.message || "Invalid credentials" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const errs = validateRegister();
    if (Object.keys(errs).length) return setRegisterErrors(errs);
    setRegisterLoading(true);
    try {
      await registerUser({
        first_name: registerForm.firstName.trim(),
        last_name: registerForm.lastName.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
        country_code: selectedCountry.code,
        mobile: registerForm.phone.trim(),
        role_id: 3,
      });
      sessionStorage.setItem("pending_otp_email", registerForm.email.trim());
      navigate("/verify-otp");
    } catch (err) {
      setRegisterErrors({ email: err.message || "Registration failed" });
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError("");
    if (!forgotEmail.trim()) {
      setForgotError("Enter your email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setForgotError("Enter a valid email");
      return;
    }
    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail.trim());
      sessionStorage.setItem("pending_reset_email", forgotEmail.trim());
      navigate("/verify-reset-otp");
    } catch (err) {
      setForgotError(err.message || "Failed to send reset instructions");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setTwoFactorError("Enter a valid 6-digit code");
      return;
    }
    setTwoFactorLoading(true);
    try {
      const res = await verifyTwoFactor({
        email: pendingLogin.email,
        password: pendingLogin.password,
        token: twoFactorCode,
      });
      const { user: userData, token: jwtToken } = res.data;
      const role = ROLE_NAMES[userData.role_id] || "candidate";
      dispatch(setCredentials({ user: { ...userData, role }, token: jwtToken }));
      navigate(ROLE_ROUTES[userData.role_id] || "/candidate/dashboard");
    } catch (err) {
      setTwoFactorError(err.message || "Invalid 2FA code");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setTwoFactorCode("");
    setTwoFactorError("");
    setPendingLogin(null);
    setView(VIEWS.login);
  };

  const shellClass =
    "bg-white rounded-xl shadow-lg p-8 w-full transition-[max-width] duration-200 " +
    (view === VIEWS.login
      ? "max-w-sm"
      : view === VIEWS.register
      ? "max-w-2xl"
      : "max-w-md");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className={shellClass}>
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

        {view === VIEWS.login && (
          <>
            <h1 className="text-lg font-black text-secondary text-center mb-6">
              Sign in
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={errors.password}
                  required
                />
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(form.email);
                      setForgotError("");
                      setView(VIEWS.forgot);
                    }}
                    className="text-xs font-bold text-secondary hover:text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              New candidate?{" "}
              <button
                type="button"
                onClick={() => {
                  setRegisterErrors({});
                  setView(VIEWS.register);
                }}
                className="font-black text-secondary hover:text-primary hover:underline"
              >
                Create an account
              </button>
            </p>
          </>
        )}

        {view === VIEWS.register && (
          <>
            <h1 className="text-lg font-black text-secondary text-center mb-1">
              Candidate registration
            </h1>
            <p className="text-center text-xs font-bold text-gray-500 mb-6">
              Register to access the candidate portal. Caseworkers and admins
              are invited separately.
            </p>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="First name"
                  name="firstName"
                  value={registerForm.firstName}
                  onChange={handleRegisterChange}
                  placeholder="First name"
                  error={registerErrors.firstName}
                  required
                />
                <Input
                  label="Middle name"
                  name="middleName"
                  value={registerForm.middleName}
                  onChange={handleRegisterChange}
                  placeholder="Middle name (optional)"
                />
                <Input
                  label="Last name"
                  name="lastName"
                  value={registerForm.lastName}
                  onChange={handleRegisterChange}
                  placeholder="Last name"
                  error={registerErrors.lastName}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date of birth"
                  name="dob"
                  type="date"
                  value={registerForm.dob}
                  onChange={handleRegisterChange}
                  error={registerErrors.dob}
                  required
                />
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 block">
                    Phone number <span className="text-primary ml-1">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <select
                        value={selectedCountry.code}
                        onChange={(e) => {
                          const country = COUNTRIES.find(
                            (c) => c.code === e.target.value
                          );
                          if (country) handleCountryCodeChange(country);
                        }}
                        className="appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2 pr-8 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30 cursor-pointer"
                      >
                        {COUNTRIES.map((country, i) => (
                          <option key={i} value={country.code}>
                            {country.code}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                      />
                    </div>
                    <Input
                      name="phone"
                      type="tel"
                      value={registerForm.phone}
                      onChange={handleRegisterChange}
                      placeholder="7911123456"
                      error={registerErrors.phone}
                      required
                      className="flex-1"
                    />
                  </div>
                  {registerErrors.phone && (
                    <span className="text-xs text-primary mt-1 block">
                      {registerErrors.phone}
                    </span>
                  )}
                </div>
              </div>

              <Input
                label="Email"
                name="email"
                type="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                placeholder="you@example.com"
                error={registerErrors.email}
                required
              />

              <Input
                label="Address"
                name="address"
                value={registerForm.address}
                onChange={handleRegisterChange}
                placeholder="Your street address"
                error={registerErrors.address}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="City"
                  name="city"
                  value={registerForm.city}
                  onChange={handleRegisterChange}
                  placeholder="Your city"
                  error={registerErrors.city}
                  required
                />
                <Input
                  label="State / Region"
                  name="state"
                  value={registerForm.state}
                  onChange={handleRegisterChange}
                  placeholder="Your state or region"
                  error={registerErrors.state}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Country"
                  name="country"
                  value={registerForm.country}
                  onChange={handleRegisterChange}
                  placeholder="Your country"
                  error={registerErrors.country}
                  required
                />
                <Input
                  label="Pincode / Postal code"
                  name="pincode"
                  value={registerForm.pincode}
                  onChange={handleRegisterChange}
                  placeholder="Your pincode"
                  error={registerErrors.pincode}
                  required
                />
              </div>

              <Input
                label="Nationality"
                name="nationality"
                value={registerForm.nationality}
                onChange={handleRegisterChange}
                placeholder="Your nationality"
                error={registerErrors.nationality}
                required
              />

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-black text-secondary mb-4">
                  Account credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    placeholder="At least 8 characters"
                    error={registerErrors.password}
                    required
                  />
                  <Input
                    label="Confirm password"
                    name="confirmPassword"
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="Repeat password"
                    error={registerErrors.confirmPassword}
                    required
                  />
                </div>
              </div>

              {registerErrors.email && !registerErrors.firstName && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
                  {registerErrors.email}
                </div>
              )}

              <Button
                type="submit"
                disabled={registerLoading}
                className="w-full"
              >
                {registerLoading ? "Creating account…" : "Create candidate account"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setView(VIEWS.login)}
                className="font-black text-secondary hover:text-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          </>
        )}

        {view === VIEWS.forgot && (
          <>
            <h1 className="text-lg font-black text-secondary text-center mb-1">
              Reset password
            </h1>
            <p className="text-center text-xs font-bold text-gray-500 mb-6">
              Enter the email you use for ElitePic and we'll send a reset code.
            </p>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <Input
                label="Email"
                name="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  setForgotError("");
                }}
                placeholder="you@example.com"
                error={forgotError}
                required
              />
              <Button type="submit" disabled={forgotLoading} className="w-full">
                {forgotLoading ? "Sending…" : "Send reset instructions"}
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-gray-600">
              <button
                type="button"
                onClick={() => setView(VIEWS.login)}
                className="font-black text-secondary hover:text-primary hover:underline"
              >
                Back to sign in
              </button>
            </p>
          </>
        )}

        {view === VIEWS.twoFactor && (
          <>
            <h1 className="text-lg font-black text-secondary text-center mb-1">
              Two-factor authentication
            </h1>
            <p className="text-center text-xs font-bold text-gray-500 mb-6">
              Enter the 6-digit code from your authenticator app
            </p>
            <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
              <Input
                label="Authentication code"
                name="twoFactorCode"
                type="text"
                value={twoFactorCode}
                onChange={(e) => {
                  setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setTwoFactorError("");
                }}
                placeholder="123456"
                error={twoFactorError}
                required
              />
              <Button
                type="submit"
                disabled={twoFactorLoading}
                className="w-full"
              >
                {twoFactorLoading ? "Verifying…" : "Verify"}
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-gray-600">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="font-black text-secondary hover:text-primary hover:underline"
              >
                Back to sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
