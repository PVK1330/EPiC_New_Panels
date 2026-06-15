import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  Settings,
  User,
  Bell,
  Shield,
  Building2,
  ChevronRight,
  Save,
  Lock,
} from "lucide-react";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import TwoFactorSetup from "../../components/TwoFactorSetup";
import TwoFactorDisable from "../../components/TwoFactorDisable";
import {
  getBusinessProfile,
  updateBusinessProfile,
  changeBusinessPassword,
} from "../../services/businessProfileApi";
import { useToast } from "../../context/ToastContext";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 bg-white";

const Label = ({ children }) => (
  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">
    {children}
  </label>
);

const ToggleRow = ({ label, defaultChecked }) => (
  <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
    <span className="text-sm font-bold text-gray-700">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
      <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
    </label>
  </div>
);

const BusinessSettings = () => {
  const token = useSelector((state) => state.auth.token);
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState("setup");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({ user: {}, profile: {} });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "company", label: "Company", icon: Building2 },
  ];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getBusinessProfile();
        if (res.data.status === "success") setProfileData(res.data.data);
      } catch {
        showToast({ message: "Failed to load profile data", variant: "danger" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [name]: value },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updateBusinessProfile({
        ...profileData.user,
        ...profileData.profile,
      });
      if (res.data.status === "success") {
        showToast({ message: "Settings saved!", variant: "success" });
        setProfileData(res.data.data);
      }
    } catch (err) {
      showToast({
        message: err.response?.data?.message || "Failed to save settings",
        variant: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return showToast({ message: "Passwords do not match", variant: "warning" });
    }
    try {
      setSaving(true);
      const res = await changeBusinessPassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      if (res.data.status === "success") {
        showToast({ message: "Password updated!", variant: "success" });
        setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      }
    } catch (err) {
      showToast({
        message: err.response?.data?.message || "Failed to update password",
        variant: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
          <Settings className="text-primary shrink-0" size={26} />
          Settings
        </h1>
        <p className="text-primary font-bold text-sm mt-0.5">
          Manage your account and business preferences.
        </p>
      </motion.div>

      {/* Layout */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-4 gap-4"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-2.5 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors mb-1 last:mb-0 ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-sm"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <tab.icon size={15} />
                <span className="text-xs font-black">{tab.label}</span>
                {activeTab === tab.id && (
                  <ChevronRight size={13} className="ml-auto opacity-80" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Top colour accent */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />

            <div className="p-5">
              {/* ── Account ──────────────────────────────────────────── */}
              {activeTab === "account" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-secondary flex items-center gap-2">
                      <User size={18} className="text-primary" />
                      Account Settings
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>First Name</Label>
                      <input
                        type="text"
                        name="first_name"
                        value={profileData.user?.first_name || ""}
                        onChange={(e) => handleInputChange(e, "user")}
                        className={inputCls}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <input
                        type="text"
                        name="last_name"
                        value={profileData.user?.last_name || ""}
                        onChange={(e) => handleInputChange(e, "user")}
                        className={inputCls}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Email Address</Label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.user?.email || ""}
                      onChange={(e) => handleInputChange(e, "user")}
                      className={inputCls}
                      placeholder="you@company.com"
                    />
                  </div>

                  <div>
                    <Label>Phone Number</Label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profileData.profile?.phoneNumber || ""}
                      onChange={(e) => handleInputChange(e, "profile")}
                      className={inputCls}
                      placeholder="+44 7700 000000"
                    />
                  </div>

                  <div>
                    <Label>Timezone</Label>
                    <select defaultValue="UTC+0" className={inputCls}>
                      <option value="UTC+0">UTC+0 — London</option>
                      <option value="UTC+1">UTC+1 — Central European</option>
                      <option value="UTC-5">UTC-5 — Eastern Time</option>
                      <option value="UTC-8">UTC-8 — Pacific Time</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white transition hover:bg-primary-dark disabled:opacity-50 shadow-sm"
                    >
                      {saving ? (
                        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save size={13} />
                      )}
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Notifications ─────────────────────────────────────── */}
              {activeTab === "notifications" && (
                <div className="space-y-4">
                  <h2 className="text-base font-black text-secondary flex items-center gap-2">
                    <Bell size={18} className="text-primary" />
                    Notification Preferences
                  </h2>

                  <div className="space-y-2">
                    {[
                      { label: "Email — visa expirations", on: true },
                      { label: "Email — compliance updates", on: true },
                      { label: "Email — payment reminders", on: true },
                      { label: "SMS — urgent alerts", on: false },
                      { label: "Push — system updates", on: false },
                    ].map((item) => (
                      <ToggleRow key={item.label} label={item.label} defaultChecked={item.on} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Security ──────────────────────────────────────────── */}
              {activeTab === "security" && (
                <div className="space-y-4">
                  <h2 className="text-base font-black text-secondary flex items-center gap-2">
                    <Shield size={18} className="text-primary" />
                    Security Settings
                  </h2>

                  {/* Password */}
                  <div className="space-y-3">
                    <Input
                      label="Current Password"
                      name="current_password"
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, current_password: e.target.value })
                      }
                      placeholder="Enter current password"
                    />
                    <Input
                      label="New Password"
                      name="new_password"
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, new_password: e.target.value })
                      }
                      placeholder="Enter new password"
                    />
                    <Input
                      label="Confirm New Password"
                      name="confirm_password"
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                      }
                      placeholder="Confirm new password"
                    />

                    <div className="px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-[11px] font-bold text-amber-700">
                        Recommended: change your password every 90 days.
                      </p>
                    </div>

                    <button
                      onClick={handlePasswordChange}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white transition hover:bg-primary-dark disabled:opacity-50 shadow-sm"
                    >
                      <Lock size={13} />
                      {saving ? "Updating…" : "Change Password"}
                    </button>
                  </div>

                  {/* 2FA */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-black text-secondary mb-2">
                      Two-Factor Authentication
                    </p>
                    <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-sm font-black text-secondary">
                          {twoFactorEnabled ? "2FA enabled" : "2FA disabled"}
                        </p>
                        <p className="text-[11px] font-bold text-gray-500 mt-0.5">
                          {twoFactorEnabled
                            ? "Your account is protected with 2FA"
                            : "Enable for enhanced security"}
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
                          className="px-3 py-1.5 rounded-xl text-xs font-black text-white bg-primary hover:bg-primary-dark transition shadow-sm"
                        >
                          Enable 2FA
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Company ───────────────────────────────────────────── */}
              {activeTab === "company" && (
                <div className="space-y-4">
                  <h2 className="text-base font-black text-secondary flex items-center gap-2">
                    <Building2 size={18} className="text-primary" />
                    Company Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <Label>Company Name</Label>
                      <input
                        type="text"
                        name="companyName"
                        value={profileData.profile?.companyName || ""}
                        onChange={(e) => handleInputChange(e, "profile")}
                        className={inputCls}
                        placeholder="Acme Ltd"
                      />
                    </div>
                    <div>
                      <Label>Registration Number</Label>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={profileData.profile?.registrationNumber || ""}
                        onChange={(e) => handleInputChange(e, "profile")}
                        className={inputCls}
                        placeholder="12345678"
                      />
                    </div>
                    <div>
                      <Label>VAT Number</Label>
                      <input
                        type="text"
                        name="vatNumber"
                        defaultValue="GB123456789"
                        className={inputCls}
                        placeholder="GB123456789"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Business Address</Label>
                      <input
                        type="text"
                        name="address"
                        value={profileData.profile?.address || ""}
                        onChange={(e) => handleInputChange(e, "profile")}
                        className={inputCls}
                        placeholder="123 Business Street, London"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white transition hover:bg-primary-dark disabled:opacity-50 shadow-sm"
                    >
                      {saving ? (
                        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save size={13} />
                      )}
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

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

export default BusinessSettings;
