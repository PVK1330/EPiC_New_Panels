import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../store/slices/authSlice";
import Input from "../components/Input";
import Button from "../components/Button";
import eliteLogo from "../assets/elitepic_logo.png";

const VIEWS = {
  login: "login",
  register: "register",
  forgot: "forgot",
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [view, setView] = useState(VIEWS.login);

  const DEMO_CREDENTIALS = {
    candidate: {
      email: "candidate@demo.elitepic.com",
      password: "candidate123",
    },
    caseworker: {
      email: "caseworker@demo.elitepic.com",
      password: "demo123",
    },
    admin: {
      email: "admin@demo.elitepic.com",
      password: "admin123",
    },
    business: {
      email: "business@demo.elitepic.com",
      password: "business123",
    },
  };

  const [form, setForm] = useState({
    email: DEMO_CREDENTIALS.candidate.email,
    password: DEMO_CREDENTIALS.candidate.password,
    role: "candidate",
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [forgotEmail, setForgotEmail] = useState("");

  const roleDisplayName = {
    candidate: "Demo Candidate",
    caseworker: "Demo Caseworker",
    admin: "Demo Admin",
    business: "Demo Business",
  };
  const [errors, setErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [forgotError, setForgotError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const roles = [
    { value: "candidate", label: "Candidate" },
    { value: "caseworker", label: "Caseworker" },
    { value: "admin", label: "Admin" },
    { value: "business", label: "Business" },
  ];

  const applyRole = (role) => {
    const preset = DEMO_CREDENTIALS[role];
    setForm((prev) => ({
      ...prev,
      role,
      email: preset?.email ?? "",
      password: preset?.password ?? "",
    }));
    setErrors({});
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleRegisterChange = (e) => {
    setRegisterForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setRegisterErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const validateRegister = () => {
    const errs = {};
    if (!registerForm.fullName.trim())
      errs.fullName = "Full name is required";
    if (!registerForm.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email))
      errs.email = "Enter a valid email";
    if (!registerForm.password) errs.password = "Password is required";
    else if (registerForm.password.length < 8)
      errs.password = "At least 8 characters";
    if (registerForm.password !== registerForm.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      const { role } = form;
      const name =
        roleDisplayName[role] ?? role.charAt(0).toUpperCase() + role.slice(1);

      dispatch(
        setCredentials({
          user: { name, email: form.email, role },
          token: "demo-token",
        }),
      );

      navigate(`/${role}/dashboard`);
    } catch {
      setErrors({ password: "Invalid credentials" });
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
      await new Promise((r) => setTimeout(r, 400));
      setForm((prev) => ({
        ...prev,
        email: registerForm.email.trim(),
        password: "",
        role: "candidate",
      }));
      setRegisterForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setRegisterErrors({});
      setView(VIEWS.login);
      alert(
        "Candidate account registered (demo). You can sign in with your email and password once the backend is connected.",
      );
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
      await new Promise((r) => setTimeout(r, 500));
      alert(
        `If an account exists for ${forgotEmail.trim()}, password reset instructions would be sent (demo — no email sent).`,
      );
      setForgotEmail("");
      setView(VIEWS.login);
    } finally {
      setForgotLoading(false);
    }
  };

  const shellClass =
    "bg-white rounded-xl shadow-lg p-8 w-full transition-[max-width] duration-200 " +
    (view === VIEWS.login ? "max-w-sm" : "max-w-md");

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

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 block">
                  Login as Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => applyRole(r.value)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all duration-200 ${
                        form.role === r.value
                          ? "bg-primary border-primary text-white shadow-sm shadow-primary/20"
                          : "bg-white border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
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
              <Input
                label="Full name"
                name="fullName"
                value={registerForm.fullName}
                onChange={handleRegisterChange}
                placeholder="Your full name"
                error={registerErrors.fullName}
                required
              />
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
              Enter the email you use for ElitePic. We’ll send reset instructions
              when email is connected (demo shows a message only).
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
      </div>
    </div>
  );
};

export default Login;
