import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle,
  User,
  Mail,
  Lock,
  Shield,
  Key,
  Eye,
  EyeOff,
  Settings,
  ArrowRight,
  Save,
  Camera,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import Modal from "../../components/Modal";
import TwoFactorSetup from "../../components/TwoFactorSetup";
import TwoFactorDisable from "../../components/TwoFactorDisable";
import PhoneInput from "../../components/PhoneInput";
import api from "../../services/api";
import { updateUser, setCredentials } from "../../store/slices/authSlice";
import { resolveAssetUrl } from "../../utils/assetUrl";
import { useToast } from "../../context/ToastContext";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const CONFIG_TABS = [
  { id: "profile",  label: "Profile",   icon: User,    color: "text-blue-500",   bg: "bg-blue-50" },
  { id: "password", label: "Password",  icon: Lock,    color: "text-rose-500",   bg: "bg-rose-50" },
  { id: "security", label: "Security",  icon: Shield,  color: "text-violet-500", bg: "bg-violet-50" },
];

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40";

const Label = ({ children, required }) => (
  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const PasswordField = ({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputCls} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
};

const MyAccount = () => {
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState("setup");

  const [phoneValid, setPhoneValid] = useState(true);

  const [formData, setFormData] = useState({
    first_name: user?.name?.split(" ")[0] || "",
    last_name: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    country_code: "+44",
    mobile: "",
    gender: user?.gender || "other",
    profile_pic: null,
  });

  const [passwordForm, setPasswordForm] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    api.get("/api/user/profile")
      .then((res) => {
        const { first_name, last_name, email, country_code, mobile, two_factor_enabled, gender, profile_pic } =
          res.data.data.user;
        setFormData((prev) => ({
          ...prev,
          first_name: first_name || "",
          last_name: last_name || "",
          email: email || "",
          country_code: country_code || "+44",
          mobile: mobile || "",
          gender: gender || "other",
        }));
        setTwoFactorEnabled(two_factor_enabled || false);
        const roleString = res.data.data.user.role?.name?.toLowerCase() || user?.role;
        dispatch(updateUser({ profile_pic, gender, role: roleString }));
      })
      .catch(() => {});
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast({ variant: "danger", message: "Please select an image file." });
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      showToast({ variant: "danger", message: "Image size must be under 2MB." });
      e.target.value = "";
      return;
    }
    setFormData((prev) => ({ ...prev, profile_pic: file }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append("first_name", formData.first_name);
      data.append("last_name", formData.last_name);
      data.append("country_code", formData.country_code);
      data.append("mobile", formData.mobile);
      data.append("gender", formData.gender);
      if (formData.profile_pic) data.append("profile_pic", formData.profile_pic);

      const res = await api.put("/api/user/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const roleString = res.data.data.user.role?.name?.toLowerCase() || user?.role;
      dispatch(setCredentials({ user: { ...user, ...res.data.data.user, role: roleString } }));
      setFormData((prev) => ({ ...prev, profile_pic: null }));
      showToast({ message: "Profile updated successfully." });
    } catch (err) {
      showToast({ variant: "danger", message: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      await api.post("/api/auth/send-password-change-otp");
      setOtpSent(true);
      setOtpError("");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      await api.post("/api/auth/verifyOtpUser", { email: user?.email, otp });
      setOtpVerified(true);
      setOtpError("");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!otpVerified) return setPasswordError("Please verify your email first");
    if (!passwordForm.new_password) return setPasswordError("New password is required");
    if (passwordForm.new_password !== passwordForm.confirm_password) return setPasswordError("Passwords do not match");
    if (passwordForm.new_password.length < 8) return setPasswordError("Password must be at least 8 characters");

    try {
      setLoading(true);
      await api.post("/api/user/change-password", { new_password: passwordForm.new_password });
      setPasswordForm({ new_password: "", confirm_password: "" });
      setOtpSent(false);
      setOtpVerified(false);
      setOtp("");
      setPasswordError("");
      showToast({ message: "Password updated successfully." });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const currentTab = CONFIG_TABS.find((t) => t.id === activeTab);

  const avatarSrc = formData.profile_pic
    ? URL.createObjectURL(formData.profile_pic)
    : user?.profile_pic
    ? resolveAssetUrl(user.profile_pic)
    : null;

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row overflow-hidden font-sans">

      {/* ── Desktop Sidebar ───────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-100 h-screen sticky top-0 shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
              <Settings size={18} />
            </div>
            <h1 className="text-base font-black text-secondary tracking-tight">My Account</h1>
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-black">Account Settings</p>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-6">
          {CONFIG_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${
                  active
                    ? "bg-secondary text-white shadow-xl shadow-secondary/20"
                    : "text-gray-500 hover:bg-gray-50 hover:text-secondary"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${active ? "bg-white/10" : `${tab.bg} ${tab.color}`}`}>
                  <Icon size={15} />
                </div>
                <span className="text-sm font-bold tracking-tight flex-1 text-left">{tab.label}</span>
                {active && (
                  <motion.div layoutId="myAccountIndicator">
                    <ArrowRight size={14} />
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <Link
            to="/caseworker/dashboard"
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-2xl bg-white border border-gray-100 text-primary font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
        </div>
      </aside>

      {/* ── Mobile Nav ────────────────────────────────────────────────────── */}
      <div className="md:hidden bg-white border-b border-gray-100 p-3 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-primary" />
          <h1 className="text-base font-black text-secondary uppercase tracking-tight">My Account</h1>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-gray-50 rounded-xl">
          {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-gray-100 p-3 grid grid-cols-3 gap-2 z-40 fixed top-[52px] left-0 right-0 shadow-2xl"
        >
          {CONFIG_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`p-3 rounded-2xl text-xs font-black flex items-center gap-2 ${
                  activeTab === tab.id ? "bg-secondary text-white" : "bg-gray-50 text-gray-500"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-5">
          <h2 className="text-2xl font-black text-secondary tracking-tight">{currentTab?.label}</h2>
          <div className="flex items-center gap-2 text-gray-400 mt-0.5">
            <span className="text-xs font-medium">My Account</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="text-xs font-medium">{currentTab?.label}</span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "circOut" }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary/40" />

            <div className="p-5 md:p-6">

              {/* ── PROFILE ─────────────────────────────────────────── */}
              {activeTab === "profile" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-xl bg-blue-50 text-blue-500"><User size={16} /></div>
                    <h3 className="text-base font-black text-secondary">Profile Information</h3>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gray-200 border-2 border-white shadow overflow-hidden flex items-center justify-center">
                        {avatarSrc ? (
                          <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle size={36} className="text-gray-400" />
                        )}
                      </div>
                      <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-lg flex items-center justify-center cursor-pointer shadow">
                        <Camera size={12} className="text-white" />
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                    <div>
                      <p className="text-sm font-black text-secondary">
                        {formData.first_name} {formData.last_name}
                      </p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">{formData.email}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wide">
                        Max 2MB · JPG, PNG, GIF
                      </p>
                    </div>
                  </div>

                  {/* Name row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label required>First Name</Label>
                      <div className="relative">
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className={`${inputCls} pr-9`}
                          placeholder="First name"
                        />
                        <User size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <Label required>Last Name</Label>
                      <div className="relative">
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className={`${inputCls} pr-9`}
                          placeholder="Last name"
                        />
                        <User size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Label required>Email Address</Label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`${inputCls} pr-9`}
                        placeholder="you@company.com"
                      />
                      <Mail size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <PhoneInput
                      split
                      dialCode={formData.country_code}
                      national={formData.mobile}
                      dialName="country_code"
                      nationalName="mobile"
                      onChange={handleInputChange}
                      onValidityChange={setPhoneValid}
                      label="Phone Number"
                      placeholder="Phone number"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <Label>Gender</Label>
                    <div className="flex gap-5 mt-1">
                      {["male", "female", "other"].map((g) => (
                        <label key={g} className="flex items-center gap-2 cursor-pointer">
                          <div
                            onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                              formData.gender === g ? "border-primary bg-primary" : "border-gray-300"
                            }`}
                          >
                            {formData.gender === g && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-sm font-bold text-gray-600 capitalize">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white hover:bg-primary/90 disabled:opacity-50 shadow-sm transition"
                    >
                      {loading ? (
                        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save size={13} />
                      )}
                      {loading ? "Saving…" : "Save Profile"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── PASSWORD ────────────────────────────────────────── */}
              {activeTab === "password" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-xl bg-rose-50 text-rose-500"><Lock size={16} /></div>
                    <h3 className="text-base font-black text-secondary">Change Password</h3>
                  </div>

                  {!otpVerified ? (
                    <div className="space-y-4">
                      <div className="px-4 py-3 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-xs font-bold text-blue-800">
                          Verify your email address before changing your password.
                        </p>
                      </div>

                      {!otpSent ? (
                        <button
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white hover:bg-primary/90 disabled:opacity-50 shadow-sm transition"
                        >
                          {loading ? (
                            <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Mail size={13} />
                          )}
                          {loading ? "Sending…" : "Send Verification Code"}
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <Label>Verification Code</Label>
                            <div className="relative">
                              <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="6-digit code"
                                maxLength={6}
                                className={`${inputCls} pr-9`}
                              />
                              <Key size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                            </div>
                          </div>
                          {otpError && <p className="text-xs font-bold text-red-600">{otpError}</p>}
                          <div className="flex gap-2">
                            <button
                              onClick={handleVerifyOtp}
                              disabled={loading || otp.length !== 6}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-black text-white hover:bg-green-700 disabled:opacity-50 shadow-sm transition"
                            >
                              {loading ? "Verifying…" : "Verify Code"}
                            </button>
                            <button
                              onClick={handleSendOtp}
                              disabled={loading}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-black text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
                            >
                              Resend
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="px-4 py-3 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-xs font-bold text-green-800">
                          Email verified — set your new password below.
                        </p>
                      </div>

                      <PasswordField
                        label="New Password"
                        value={passwordForm.new_password}
                        onChange={(e) => {
                          setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }));
                          setPasswordError("");
                        }}
                        placeholder="Enter new password"
                      />
                      <PasswordField
                        label="Confirm New Password"
                        value={passwordForm.confirm_password}
                        onChange={(e) => {
                          setPasswordForm((prev) => ({ ...prev, confirm_password: e.target.value }));
                          setPasswordError("");
                        }}
                        placeholder="Confirm new password"
                      />

                      {passwordError && <p className="text-xs font-bold text-red-600">{passwordError}</p>}

                      <div className="px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="text-[11px] font-bold text-amber-700">
                          Password must be at least 8 characters.
                        </p>
                      </div>

                      <button
                        onClick={handlePasswordUpdate}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white hover:bg-primary/90 disabled:opacity-50 shadow-sm transition"
                      >
                        {loading ? (
                          <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Lock size={13} />
                        )}
                        {loading ? "Updating…" : "Update Password"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── SECURITY ────────────────────────────────────────── */}
              {activeTab === "security" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-xl bg-violet-50 text-violet-500"><Shield size={16} /></div>
                    <h3 className="text-base font-black text-secondary">Security Settings</h3>
                  </div>

                  <div className="flex items-center justify-between px-4 py-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-sm font-black text-secondary">
                        {twoFactorEnabled ? "2FA is enabled" : "2FA is disabled"}
                      </p>
                      <p className="text-[11px] font-bold text-gray-500 mt-0.5">
                        {twoFactorEnabled
                          ? "Your account is protected with two-factor authentication"
                          : "Enable for enhanced account security"}
                      </p>
                    </div>
                    {twoFactorEnabled ? (
                      <button
                        onClick={() => { setTwoFactorMode("disable"); setTwoFactorModalOpen(true); }}
                        className="px-3 py-1.5 rounded-xl text-xs font-black text-red-600 hover:bg-red-50 border border-red-200 transition"
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        onClick={() => { setTwoFactorMode("setup"); setTwoFactorModalOpen(true); }}
                        className="px-3 py-1.5 rounded-xl text-xs font-black text-white bg-primary hover:bg-primary/90 transition shadow-sm"
                      >
                        Enable 2FA
                      </button>
                    )}
                  </div>

                  <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs font-black text-secondary mb-0.5">Session Security</p>
                    <p className="text-[11px] font-bold text-gray-500">
                      Your session is protected. Passwords are hashed and never stored in plain text.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 2FA Modal */}
      <Modal
        open={twoFactorModalOpen}
        onClose={() => setTwoFactorModalOpen(false)}
        title=""
        maxWidthClass="max-w-md"
        bodyClassName="p-0"
        footer={null}
      >
        {twoFactorMode === "setup" ? (
          <TwoFactorSetup
            token={token}
            onSetupComplete={() => { setTwoFactorEnabled(true); setTwoFactorModalOpen(false); }}
            onCancel={() => setTwoFactorModalOpen(false)}
          />
        ) : (
          <TwoFactorDisable
            token={token}
            onDisableComplete={() => { setTwoFactorEnabled(false); setTwoFactorModalOpen(false); }}
            onCancel={() => setTwoFactorModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default MyAccount;
