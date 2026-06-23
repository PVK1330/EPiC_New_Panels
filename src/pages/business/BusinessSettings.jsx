import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import {
  Settings,
  User,
  Bell,
  Shield,
  Building2,
  ArrowRight,
  Save,
  Lock,
  Menu,
  X,
  LayoutDashboard,
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

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 bg-white";

const Label = ({ children }) => (
  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">
    {children}
  </label>
);

const DEFAULT_NOTIF = {
  emailVisaExpirations: true,
  emailComplianceUpdates: true,
  emailPaymentReminders: true,
  smsUrgentAlerts: false,
  pushSystemUpdates: false,
};

const ToggleRow = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
    <span className="text-sm font-bold text-gray-700">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
    </label>
  </div>
);

const CONFIG_TABS = [
  { id: "account",       label: "Account",        icon: User,      color: "text-blue-500",   bg: "bg-blue-50" },
  { id: "notifications", label: "Notifications",  icon: Bell,      color: "text-amber-500",  bg: "bg-amber-50" },
  { id: "security",      label: "Security",       icon: Shield,    color: "text-rose-500",   bg: "bg-rose-50" },
  { id: "company",       label: "Company",        icon: Building2, color: "text-violet-500", bg: "bg-violet-50" },
];

const NOTIF_ROWS = [
  { key: "emailVisaExpirations",   label: "Email — visa expirations" },
  { key: "emailComplianceUpdates", label: "Email — compliance updates" },
  { key: "emailPaymentReminders",  label: "Email — payment reminders" },
  { key: "smsUrgentAlerts",        label: "SMS — urgent alerts" },
  { key: "pushSystemUpdates",      label: "Push — system updates" },
];

const BusinessSettings = () => {
  const token = useSelector((state) => state.auth.token);
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState("setup");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

  const [profileData, setProfileData] = useState({ user: {}, profile: {} });
  const [notifPrefs, setNotifPrefs] = useState(DEFAULT_NOTIF);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getBusinessProfile();
        if (res.data.status === "success") {
          const data = res.data.data;
          setProfileData(data);
          if (data.user?.twoFactorEnabled != null) {
            setTwoFactorEnabled(!!data.user.twoFactorEnabled);
          }
          if (data.profile?.notificationPreferences) {
            setNotifPrefs({ ...DEFAULT_NOTIF, ...data.profile.notificationPreferences });
          }
        }
      } catch {
        showToast({ message: "Failed to load profile data", variant: "danger" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updateBusinessProfile({ ...profileData.user, ...profileData.profile });
      if (res.data.status === "success") {
        showToast({ message: "Settings saved!", variant: "success" });
        setProfileData(res.data.data);
      }
    } catch (err) {
      showToast({ message: err.response?.data?.message || "Failed to save settings", variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSavingNotif(true);
      await updateBusinessProfile({
        ...profileData.user,
        ...profileData.profile,
        notificationPreferences: notifPrefs,
      });
      showToast({ message: "Notification preferences saved!", variant: "success" });
    } catch (err) {
      showToast({ message: err.response?.data?.message || "Failed to save notification preferences", variant: "danger" });
    } finally {
      setSavingNotif(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return showToast({ message: "Passwords do not match", variant: "warning" });
    }
    if (passwordForm.new_password.length < 8) {
      return showToast({ message: "New password must be at least 8 characters", variant: "warning" });
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
      showToast({ message: err.response?.data?.message || "Failed to update password", variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const switchTab = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const currentTab = CONFIG_TABS.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row overflow-hidden font-sans">

      {/* ── Desktop Sidebar ───────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-100 h-screen sticky top-0 shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
              <Settings size={18} />
            </div>
            <h1 className="text-base font-black text-secondary tracking-tight">Settings</h1>
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-black">Account Preferences</p>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-6">
          {CONFIG_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group ${
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
                  <motion.div layoutId="businessSettingsIndicator">
                    <ArrowRight size={14} />
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <Link
            to="/business/dashboard"
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
          <h1 className="text-base font-black text-secondary uppercase tracking-tight">Settings</h1>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-gray-50 rounded-xl">
          {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-gray-100 p-3 grid grid-cols-2 gap-2 z-40 fixed top-[52px] left-0 right-0 shadow-2xl"
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
            <span className="text-xs font-medium">Settings</span>
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

              {/* ── Account ─────────────────────────────────────────── */}
              {activeTab === "account" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-xl bg-blue-50 text-blue-500"><User size={16} /></div>
                    <h3 className="text-base font-black text-secondary">Account Settings</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>First Name</Label>
                      <input type="text" name="first_name" value={profileData.user?.first_name || ""} onChange={(e) => handleInputChange(e, "user")} className={inputCls} placeholder="First name" />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <input type="text" name="last_name" value={profileData.user?.last_name || ""} onChange={(e) => handleInputChange(e, "user")} className={inputCls} placeholder="Last name" />
                    </div>
                  </div>

                  <div>
                    <Label>Email Address</Label>
                    <input type="email" name="email" value={profileData.user?.email || ""} onChange={(e) => handleInputChange(e, "user")} className={inputCls} placeholder="you@company.com" />
                  </div>

                  <div>
                    <Label>Phone Number</Label>
                    <input type="tel" name="phoneNumber" value={profileData.profile?.phoneNumber || ""} onChange={(e) => handleInputChange(e, "profile")} className={inputCls} placeholder="+44 7700 000000" />
                  </div>

                  <div>
                    <Label>Timezone</Label>
                    <select name="timezone" value={profileData.profile?.timezone || "UTC+0"} onChange={(e) => handleInputChange(e, "profile")} className={inputCls}>
                      <option value="UTC+0">UTC+0 — London</option>
                      <option value="UTC+1">UTC+1 — Central European</option>
                      <option value="UTC-5">UTC-5 — Eastern Time</option>
                      <option value="UTC-8">UTC-8 — Pacific Time</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white hover:bg-primary/90 disabled:opacity-50 shadow-sm transition">
                      {saving ? <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={13} />}
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Notifications ───────────────────────────────────── */}
              {activeTab === "notifications" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-xl bg-amber-50 text-amber-500"><Bell size={16} /></div>
                    <h3 className="text-base font-black text-secondary">Notification Preferences</h3>
                  </div>

                  <div className="space-y-2">
                    {NOTIF_ROWS.map((item) => (
                      <ToggleRow
                        key={item.key}
                        label={item.label}
                        checked={notifPrefs[item.key]}
                        onChange={(e) => setNotifPrefs((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                      />
                    ))}
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button onClick={handleSaveNotifications} disabled={savingNotif} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white hover:bg-primary/90 disabled:opacity-50 shadow-sm transition">
                      {savingNotif ? <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={13} />}
                      {savingNotif ? "Saving…" : "Save Preferences"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Security ────────────────────────────────────────── */}
              {activeTab === "security" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-xl bg-rose-50 text-rose-500"><Shield size={16} /></div>
                    <h3 className="text-base font-black text-secondary">Security Settings</h3>
                  </div>

                  <div className="space-y-3">
                    <Input
                      label="Current Password"
                      name="current_password"
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <Input
                      label="New Password"
                      name="new_password"
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      placeholder="Enter new password"
                    />
                    <Input
                      label="Confirm New Password"
                      name="confirm_password"
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
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
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white hover:bg-primary/90 disabled:opacity-50 shadow-sm transition"
                    >
                      <Lock size={13} />
                      {saving ? "Updating…" : "Change Password"}
                    </button>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-black text-secondary mb-2">Two-Factor Authentication</p>
                    <div className="flex items-center justify-between px-3 py-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-sm font-black text-secondary">
                          {twoFactorEnabled ? "2FA enabled" : "2FA disabled"}
                        </p>
                        <p className="text-[11px] font-bold text-gray-500 mt-0.5">
                          {twoFactorEnabled ? "Your account is protected with 2FA" : "Enable for enhanced security"}
                        </p>
                      </div>
                      {twoFactorEnabled ? (
                        <button onClick={() => { setTwoFactorMode("disable"); setTwoFactorModalOpen(true); }} className="px-3 py-1.5 rounded-xl text-xs font-black text-red-600 hover:bg-red-50 border border-red-200 transition">
                          Disable
                        </button>
                      ) : (
                        <button onClick={() => { setTwoFactorMode("setup"); setTwoFactorModalOpen(true); }} className="px-3 py-1.5 rounded-xl text-xs font-black text-white bg-primary hover:bg-primary/90 transition shadow-sm">
                          Enable 2FA
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Company ─────────────────────────────────────────── */}
              {activeTab === "company" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-xl bg-violet-50 text-violet-500"><Building2 size={16} /></div>
                    <h3 className="text-base font-black text-secondary">Company Information</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <Label>Company Name</Label>
                      <input type="text" name="companyName" value={profileData.profile?.companyName || ""} onChange={(e) => handleInputChange(e, "profile")} className={inputCls} placeholder="Acme Ltd" />
                    </div>
                    <div>
                      <Label>Registration Number</Label>
                      <input type="text" name="registrationNumber" value={profileData.profile?.registrationNumber || ""} onChange={(e) => handleInputChange(e, "profile")} className={inputCls} placeholder="12345678" />
                    </div>
                    <div>
                      <Label>VAT Number</Label>
                      <input type="text" name="vatNumber" value={profileData.profile?.vatNumber || ""} onChange={(e) => handleInputChange(e, "profile")} className={inputCls} placeholder="GB123456789" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Business Address</Label>
                      <input type="text" name="address" value={profileData.profile?.address || ""} onChange={(e) => handleInputChange(e, "profile")} className={inputCls} placeholder="123 Business Street, London" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white hover:bg-primary/90 disabled:opacity-50 shadow-sm transition">
                      {saving ? <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={13} />}
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
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

export default BusinessSettings;
