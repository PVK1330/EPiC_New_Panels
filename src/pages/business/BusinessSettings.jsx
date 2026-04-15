import { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  User,
  Bell,
  Shield,
  Building2,
  Moon,
  Sun,
  ChevronRight,
  Save,
} from "lucide-react";
import Modal from "../../components/Modal";
import TwoFactorSetup from "../../components/TwoFactorSetup";
import TwoFactorDisable from "../../components/TwoFactorDisable";

const BusinessSettings = () => {
  const token = useSelector((state) => state.auth.token);
  const [activeTab, setActiveTab] = useState("account");
  const [darkMode, setDarkMode] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState("setup"); // setup or disable

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const tabs = [
    { id: "account", label: "Account Settings", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "company", label: "Company Info", icon: Building2 },
    { id: "appearance", label: "Appearance", icon: Moon },
  ];

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Settings
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Manage your account and business preferences.
        </p>
      </motion.div>

      {/* Settings Container */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <tab.icon size={18} />
                <span className="text-sm font-black">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <motion.div
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Account Settings */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-secondary flex items-center gap-2">
                  <User size={24} className="text-primary" />
                  Account Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="john.doe@company.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      defaultValue="+44 20 7123 4567"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      defaultValue="UTC+0"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    >
                      <option value="UTC+0">UTC+0 (London)</option>
                      <option value="UTC+1">UTC+1 (Central European)</option>
                      <option value="UTC-5">UTC-5 (Eastern Time)</option>
                      <option value="UTC-8">UTC-8 (Pacific Time)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-secondary flex items-center gap-2">
                  <Bell size={24} className="text-primary" />
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  {[
                    "Email notifications for visa expirations",
                    "Email notifications for compliance updates",
                    "Email notifications for payment reminders",
                    "SMS alerts for urgent notifications",
                    "Push notifications for system updates",
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <span className="text-sm font-bold text-gray-700">{item}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={index < 3} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-secondary flex items-center gap-2">
                  <Shield size={24} className="text-primary" />
                  Security Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    />
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-xs font-bold text-amber-700">
                      Last password change: 30 days ago. We recommend changing your password every 90 days.
                    </p>
                  </div>

                  <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark">
                    Change Password
                  </button>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-black text-secondary mb-3">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-secondary">
                          {twoFactorEnabled ? "2FA is enabled" : "2FA is disabled"}
                        </p>
                        <p className="text-xs font-bold text-gray-500 mt-0.5">
                          {twoFactorEnabled ? "Your account is protected with 2FA" : "Enable 2FA for enhanced security"}
                        </p>
                      </div>
                      {twoFactorEnabled ? (
                        <button
                          onClick={() => {
                            setTwoFactorMode("disable");
                            setTwoFactorModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition"
                        >
                          Disable 2FA
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setTwoFactorMode("setup");
                            setTwoFactorModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl text-sm font-black text-white bg-primary hover:bg-primary-dark transition"
                        >
                          Enable 2FA
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Company Settings */}
            {activeTab === "company" && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-secondary flex items-center gap-2">
                  <Building2 size={24} className="text-primary" />
                  Company Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      defaultValue="TechCorp Ltd"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      defaultValue="REG123456789"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Business Address
                    </label>
                    <input
                      type="text"
                      defaultValue="123 Business Street, London, UK"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      VAT Number
                    </label>
                    <input
                      type="text"
                      defaultValue="GB123456789"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-secondary flex items-center gap-2">
                  <Moon size={24} className="text-primary" />
                  Appearance
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Sun size={20} className="text-amber-500" />
                      <div>
                        <p className="text-sm font-black text-secondary">Dark Mode</p>
                        <p className="text-xs font-bold text-gray-500">Switch between light and dark themes</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      defaultValue="en"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select
                      defaultValue="dd/mm/yyyy"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    >
                      <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                      <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-primary-dark"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

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
            onSetupComplete={() => {
              setTwoFactorEnabled(true);
              setTwoFactorModalOpen(false);
            }}
            onCancel={() => setTwoFactorModalOpen(false)}
          />
        ) : (
          <TwoFactorDisable
            token={token}
            onDisableComplete={() => {
              setTwoFactorEnabled(false);
              setTwoFactorModalOpen(false);
            }}
            onCancel={() => setTwoFactorModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default BusinessSettings;
