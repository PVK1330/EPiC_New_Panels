// Stabilized modular component
import { useState } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiGlobe, FiBell, FiShield, FiSave, FiRefreshCw, FiCreditCard, FiLayers } from "react-icons/fi";
import Button from "../../Button";
import Input from "../../Input";

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const timezones = ["UTC-05:00 Eastern Time", "UTC-06:00 Central Time", "UTC-07:00 Mountain Time", "UTC-08:00 Pacific Time"];
const languages = ["English", "Spanish", "French", "German"];
const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];

export default function AccountSettings({ 
  profile, 
  preferences, 
  onProfileChange, 
  onPreferenceChange, 
  onPreferenceToggle,
  onSave,
  saving,
  security,
  onSecurityChange,
  onPasswordSubmit,
  savingPassword,
  passwordError,
  onReset2FA,
  onDisable2FA
}) {
  return (
    <motion.div {...panelMotion} className="space-y-8">
      {/* Profile Section */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <FiUser size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary">Personal Profile</h3>
              <p className="text-xs text-gray-500">Manage your basic information and avatar</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="First Name" 
              name="first_name" 
              value={profile.first_name} 
              onChange={onProfileChange}
              placeholder="Enter first name"
            />
            <Input 
              label="Last Name" 
              name="last_name" 
              value={profile.last_name} 
              onChange={onProfileChange}
              placeholder="Enter last name"
            />
            <Input 
              label="Email Address" 
              name="email" 
              type="email"
              value={profile.email} 
              onChange={onProfileChange}
              placeholder="email@example.com"
            />
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <Input 
                label="Code" 
                name="country_code" 
                value={profile.country_code} 
                onChange={onProfileChange}
                placeholder="+1"
              />
              <Input 
                label="Mobile Number" 
                name="mobile" 
                value={profile.mobile} 
                onChange={onProfileChange}
                placeholder="1234567890"
              />
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-50 flex justify-end">
            <Button 
              onClick={onSave} 
              disabled={saving}
              className="rounded-2xl px-6 py-2.5 flex items-center gap-2"
            >
              {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
              {saving ? "Saving..." : "Update Profile"}
            </Button>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <FiShield size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary">Account Security</h3>
              <p className="text-xs text-gray-500">Secure your account with 2FA and password management</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Password Change */}
            <form onSubmit={onPasswordSubmit} className="space-y-4">
              <h4 className="text-sm font-black text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                <FiLock size={14} /> Change Password
              </h4>
              <Input 
                label="Current Password" 
                name="currentPassword" 
                type="password"
                value={security.currentPassword} 
                onChange={onSecurityChange}
                placeholder="••••••••"
              />
              <Input 
                label="New Password" 
                name="newPassword" 
                type="password"
                value={security.newPassword} 
                onChange={onSecurityChange}
                placeholder="Minimum 8 characters"
              />
              <Input 
                label="Confirm New Password" 
                name="confirmPassword" 
                type="password"
                value={security.confirmPassword} 
                onChange={onSecurityChange}
                placeholder="Re-type new password"
              />
              {passwordError && (
                <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 italic">
                  {passwordError}
                </p>
              )}
              <Button 
                type="submit"
                disabled={savingPassword}
                variant="secondary"
                className="rounded-2xl w-full py-3"
              >
                {savingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>

            {/* Two-Factor Authentication */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                <FiShield size={14} /> Two-Factor Authentication
              </h4>
              <div className={`p-5 rounded-3xl border transition-all ${
                preferences.two_factor_enabled 
                ? "bg-green-50 border-green-100" 
                : "bg-amber-50 border-amber-100"
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${
                    preferences.two_factor_enabled ? "bg-green-500 text-white" : "bg-amber-500 text-white"
                  }`}>
                    <FiLock size={24} />
                  </div>
                  <div className="flex-1">
                    <h5 className={`text-sm font-bold ${
                      preferences.two_factor_enabled ? "text-green-800" : "text-amber-800"
                    }`}>
                      2FA is {preferences.two_factor_enabled ? "Enabled" : "Disabled"}
                    </h5>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      preferences.two_factor_enabled ? "text-green-700" : "text-amber-700"
                    }`}>
                      {preferences.two_factor_enabled 
                        ? "Your account is protected by an additional security layer. You need an authenticator app to log in."
                        : "Add an extra layer of security to your account. Once enabled, you'll need to provide a code from your authenticator app."
                      }
                    </p>
                    <div className="mt-4">
                      {preferences.two_factor_enabled ? (
                        <button 
                          onClick={onDisable2FA}
                          className="text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-4"
                        >
                          Disable 2FA Protection
                        </button>
                      ) : (
                        <Button 
                          onClick={onReset2FA}
                          className="rounded-xl px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white border-none shadow-sm"
                        >
                          Enable 2FA Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <FiGlobe size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary">System Preferences</h3>
              <p className="text-xs text-gray-500">Localization and notification settings</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Language</label>
              <select 
                name="language"
                value={preferences.language}
                onChange={onPreferenceChange}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {languages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Timezone</label>
              <select 
                name="timezone"
                value={preferences.timezone}
                onChange={onPreferenceChange}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {timezones.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Date Format</label>
              <select 
                name="date_format"
                value={preferences.date_format}
                onChange={onPreferenceChange}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {dateFormats.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: "email_notifications", label: "Email Notifications", desc: "Receive updates via your registered email", icon: <FiMail /> },
              { id: "case_updates", label: "Real-time Case Updates", desc: "Get browser alerts for status changes", icon: <FiBell /> },
              { id: "payment_alerts", label: "Billing & Payment Alerts", desc: "Notifications for invoices and payments", icon: <FiCreditCard /> },
              { id: "data_collection", label: "Usage Data Analysis", desc: "Help us improve by sharing anonymous data", icon: <FiLayers /> },
            ].map((pref) => (
              <div 
                key={pref.id}
                onClick={() => onPreferenceToggle(pref.id)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group ${
                  preferences[pref.id] 
                  ? "bg-primary/5 border-primary/20" 
                  : "bg-gray-50/50 border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-2xl transition-colors ${
                    preferences[pref.id] ? "bg-primary text-white" : "bg-gray-200 text-gray-500 group-hover:bg-gray-300"
                  }`}>
                    {pref.icon}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-secondary leading-none mb-1">{pref.label}</h5>
                    <p className="text-[11px] text-gray-500">{pref.desc}</p>
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${
                  preferences[pref.id] ? "bg-primary" : "bg-gray-300"
                }`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    preferences[pref.id] ? "right-1" : "left-1"
                  }`} />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
            <Button 
              onClick={onSave} 
              disabled={saving}
              className="rounded-2xl px-8 py-3 flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
              {saving ? "Saving Changes..." : "Save All Preferences"}
            </Button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
