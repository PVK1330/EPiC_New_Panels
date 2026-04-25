import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSettings,
  FiUser,
  FiLayers,
  FiFolder,
  FiShield,
  FiMail,
  FiCreditCard,
  FiClock,
  FiArrowRight,
  FiCheckCircle,
  FiMenu,
  FiX
} from "react-icons/fi";

// Components
import Modal from "../../components/Modal";
import TwoFactorSetup from "../../components/TwoFactorSetup";
import TwoFactorDisable from "../../components/TwoFactorDisable";
import Button from "../../components/Button";
import Input from "../../components/Input";

// Settings Sub-components
import AccountSettings from "../../components/admin/settings/AccountSettings";
import VisaSettings from "../../components/admin/settings/VisaSettings";
import EmailSettings from "../../components/admin/settings/EmailSettings";
import PaymentSettings from "../../components/admin/settings/PaymentSettings";
import SLASettings from "../../components/admin/settings/SLASettings";
import DepartmentSettings from "../../components/admin/settings/DepartmentSettings";
import CategorySettings from "../../components/admin/settings/CategorySettings";

// Services
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../../services/caseWorker";
import { useToast } from "../../context/ToastContext";
import {
  getMe,
  updateMe,
  updateMePreferences,
  changePassword,
  getVisaTypes,
  createVisaType,
  updateVisaType,
  deleteVisaType,
  getPetitionTypes,
  createPetitionType,
  updatePetitionType,
  deletePetitionType,
  getCaseCategories,
  createCaseCategory,
  deleteCaseCategory,
  getSlaRules,
  createSlaRule,
  updateSlaRule,
  deleteSlaRule,
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getPaymentSetting,
  updatePaymentSetting,
} from "../../services/settingsService";

const CONFIG_TABS = [
  { id: "account", label: "Account & Profile", icon: <FiUser />, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "visa", label: "Visa & Petitions", icon: <FiLayers />, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: "categories", label: "Case Categories", icon: <FiFolder />, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "departments", label: "Departments", icon: <FiFolder />, color: "text-violet-500", bg: "bg-violet-50" },
  { id: "roles", label: "Role Permissions", icon: <FiShield />, color: "text-amber-500", bg: "bg-amber-50" },
  { id: "email", label: "Email Templates", icon: <FiMail />, color: "text-rose-500", bg: "bg-rose-50" },
  { id: "payment", label: "Payment Config", icon: <FiCreditCard />, color: "text-cyan-500", bg: "bg-cyan-50" },
  { id: "sla", label: "SLA Rules", icon: <FiClock />, color: "text-orange-500", bg: "bg-orange-50" },
];

function getApiError(error) {
  const d = error?.response?.data;
  const m = d?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m) && m.length) return m[0];
  return error?.message || "Something went wrong";
}

export default function AdminSettings() {
  const { showToast } = useToast();
  const [configTab, setConfigTab] = useState("account");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Account States (DYNAMIC)
  const [profile, setProfile] = useState({ first_name: "", last_name: "", email: "", country_code: "", mobile: "", avatar_url: "", role_name: "" });
  const [profileFile, setProfileFile] = useState(null);
  const [preferences, setPreferences] = useState({ two_factor_enabled: false, email_notifications: true, case_updates: true, payment_alerts: false, timezone: "UTC-05:00 Eastern Time", language: "English", date_format: "MM/DD/YYYY", data_collection: false });
  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Shared States
  const [visaTypes, setVisaTypes] = useState([]);
  const [petitionTypes, setPetitionTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [slaRules, setSlaRules] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState({ currency: "GBP", pay_bank: true, pay_card: true, pay_cheque: false, invoice_prefix: "INV-", stripe_public_key: "", stripe_secret_key: "", paypal_client_id: "", paypal_secret: "", razorpay_key_id: "", razorpay_key_secret: "", active_gateway: "stripe" });

  // Modal States
  const [visaModalOpen, setVisaModalOpen] = useState(false);
  const [visaModalMode, setVisaModalMode] = useState("add");
  const [editingVisaId, setEditingVisaId] = useState(null);
  const [visaFormName, setVisaFormName] = useState("");
  const [visaFormError, setVisaFormError] = useState("");

  const [petitionModalOpen, setPetitionModalOpen] = useState(false);
  const [petitionModalMode, setPetitionModalMode] = useState("add");
  const [editingPetitionId, setEditingPetitionId] = useState(null);
  const [petitionFormName, setPetitionFormName] = useState("");
  const [petitionFormError, setPetitionFormError] = useState("");

  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [departmentModalMode, setDepartmentModalMode] = useState("add");
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [departmentFormName, setDepartmentFormName] = useState("");
  const [departmentFormError, setDepartmentFormError] = useState("");

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailModalMode, setEmailModalMode] = useState("add");
  const [editingEmailKey, setEditingEmailKey] = useState(null);
  const [emailFormKey, setEmailFormKey] = useState("");
  const [emailFormSubject, setEmailFormSubject] = useState("");
  const [emailFormBody, setEmailFormBody] = useState("");
  const [emailFormError, setEmailFormError] = useState("");
  const [viewEmailModalOpen, setViewEmailModalOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState(null);

  const [slaModalOpen, setSlaModalOpen] = useState(false);
  const [slaModalMode, setSlaModalMode] = useState("add");
  const [editingSlaId, setEditingSlaId] = useState(null);
  const [slaFormName, setSlaFormName] = useState("");
  const [slaFormDays, setSlaFormDays] = useState("");
  const [slaFormType, setSlaFormType] = useState("Visa");
  const [slaFormError, setSlaFormError] = useState("");

  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState("setup");

  // Load Data based on Tab
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (configTab === "account") {
        const res = await getMe();
        const { profile: p, preferences: pref } = res.data?.data || {};
        if (p) setProfile(p);
        if (pref) setPreferences(pref);
      } else if (configTab === "visa") {
        const [vRes, pRes] = await Promise.all([getVisaTypes(), getPetitionTypes()]);
        setVisaTypes(vRes.data?.data?.visa_types ?? []);
        setPetitionTypes(pRes.data?.data?.petition_types ?? []);
      } else if (configTab === "categories") {
        const res = await getCaseCategories();
        setCategories(res.data?.data?.categories ?? []);
      } else if (configTab === "departments") {
        const res = await getDepartments();
        setDepartments(res.data?.data?.departments ?? []);
      } else if (configTab === "email") {
        const res = await getEmailTemplates();
        setEmailTemplates(res.data?.data?.templates ?? []);
      } else if (configTab === "payment") {
        const res = await getPaymentSetting();
        if (res.data?.data) setPaymentConfig(res.data.data);
      } else if (configTab === "sla") {
        const res = await getSlaRules();
        setSlaRules(res.data?.data?.rules ?? []);
      }
    } catch (e) {
      const msg = getApiError(e);
      setError(msg);
      showToast({ message: msg, variant: "danger" });
    } finally {
      setLoading(false);
    }
  }, [configTab, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Account Handlers (DYNAMIC)
  const handleProfileSave = async () => {
    setSaving(true);
    try {
      let dataToSubmit = profile;
      if (profileFile) {
        dataToSubmit = new FormData();
        Object.keys(profile).forEach(key => {
          if (profile[key] !== null && profile[key] !== undefined) {
            dataToSubmit.append(key, profile[key]);
          }
        });
        dataToSubmit.append('profile_pic', profileFile);
      }
      // Parallel update for performance
      await Promise.all([
        updateMePreferences(preferences),
        updateMe(dataToSubmit)
      ]);
      setProfileFile(null);
      showToast({ message: "Profile and preferences updated successfully." });
      loadData(); // Refresh to ensure sync
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    setPasswordError("");
    try {
      await changePassword({ current_password: security.currentPassword, new_password: security.newPassword });
      showToast({ message: "Password updated successfully." });
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      setPasswordError(getApiError(e));
    } finally {
      setSavingPassword(false);
    }
  };

  // Visa/Petition Handlers
  const submitVisaForm = async (e) => {
    e.preventDefault();
    if (!visaFormName.trim()) return setVisaFormError("Name is required");
    try {
      if (visaModalMode === "add") await createVisaType({ name: visaFormName.trim() });
      else await updateVisaType(editingVisaId, { name: visaFormName.trim() });
      loadData();
      setVisaModalOpen(false);
      showToast({ message: `Visa type ${visaModalMode === "add" ? "added" : "updated"}.` });
    } catch (e) { setVisaFormError(getApiError(e)); }
  };

  const submitPetitionForm = async (e) => {
    e.preventDefault();
    if (!petitionFormName.trim()) return setPetitionFormError("Name is required");
    try {
      if (petitionModalMode === "add") await createPetitionType({ name: petitionFormName.trim() });
      else await updatePetitionType(editingPetitionId, { name: petitionFormName.trim() });
      loadData();
      setPetitionModalOpen(false);
      showToast({ message: `Petition type ${petitionModalMode === "add" ? "added" : "updated"}.` });
    } catch (e) { setPetitionFormError(getApiError(e)); }
  };

  // Department Handlers
  const submitDepartmentForm = async (e) => {
    e.preventDefault();
    if (!departmentFormName.trim()) return setDepartmentFormError("Name is required");
    try {
      if (departmentModalMode === "add") await createDepartment({ name: departmentFormName.trim() });
      else await updateDepartment({ oldName: editingDepartment, newName: departmentFormName.trim() });
      loadData();
      setDepartmentModalOpen(false);
      showToast({ message: `Department ${departmentModalMode === "add" ? "added" : "updated"}.` });
    } catch (e) { setDepartmentFormError(getApiError(e)); }
  };

  // Category Handlers
  const handleCategoryAdd = async (name) => {
    setSaving(true);
    try {
      await createCaseCategory({ category: name });
      loadData();
      showToast({ message: "Category added successfully." });
    } catch (e) { showToast({ message: getApiError(e), variant: "danger" }); }
    finally { setSaving(false); }
  };

  const handleCategoryDelete = async (name) => {
    const res = await Swal.fire({ title: "Delete Category?", text: `Are you sure you want to remove "${name}"?`, icon: "warning", showCancelButton: true });
    if (res.isConfirmed) {
      try {
        await deleteCaseCategory(name);
        loadData();
        showToast({ message: "Category deleted." });
      } catch (e) { showToast({ message: getApiError(e), variant: "danger" }); }
    }
  };

  // Email Handlers
  const submitEmailForm = async (e) => {
    e.preventDefault();
    if (!emailFormKey.trim()) return setEmailFormError("Key is required");
    try {
      const payload = { template_key: emailFormKey.trim(), subject: emailFormSubject.trim(), body: emailFormBody.trim() };
      if (emailModalMode === "add") await createEmailTemplate(payload);
      else await updateEmailTemplate(editingEmailKey, payload);
      loadData();
      setEmailModalOpen(false);
      showToast({ message: "Email template saved." });
    } catch (e) { setEmailFormError(getApiError(e)); }
  };

  // Payment Handlers
  const handlePaymentSave = async () => {
    setSaving(true);
    try {
      await updatePaymentSetting(paymentConfig);
      showToast({ message: "Payment configuration updated." });
    } catch (e) { showToast({ message: getApiError(e), variant: "danger" }); }
    finally { setSaving(false); }
  };

  // SLA Handlers
  const submitSlaForm = async (e) => {
    e.preventDefault();
    if (!slaFormName.trim() || !slaFormDays) return setSlaFormError("Required fields missing");
    try {
      const payload = { name: slaFormName.trim(), days: parseInt(slaFormDays), rule_type: slaFormType };
      if (slaModalMode === "add") await createSlaRule(payload);
      else await updateSlaRule(editingSlaId, payload);
      loadData();
      setSlaModalOpen(false);
      showToast({ message: "SLA rule saved." });
    } catch (e) { setSlaFormError(getApiError(e)); }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-col bg-white border-r border-gray-100 h-screen sticky top-0 shadow-sm">
        <div className="p-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
              <FiSettings size={22} />
            </div>
            <h1 className="text-xl font-black text-secondary tracking-tight">Admin Central</h1>
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">System Preferences</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-8">
          {CONFIG_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setConfigTab(tab.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group relative ${
                configTab === tab.id 
                ? "bg-secondary text-white shadow-xl shadow-secondary/20" 
                : "text-gray-500 hover:bg-gray-50 hover:text-secondary"
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${
                configTab === tab.id ? "bg-white/10" : `${tab.bg} ${tab.color}`
              }`}>
                {tab.icon}
              </div>
              <span className="text-sm font-bold tracking-tight">{tab.label}</span>
              {configTab === tab.id && (
                <motion.div layoutId="activeIndicator" className="ml-auto">
                  <FiArrowRight size={16} />
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50 bg-gray-50/30">
          <Link to="/admin/dashboard" className="flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-white border border-gray-100 text-primary font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all">
            Dashboard <FiArrowRight />
          </Link>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden bg-white border-b border-gray-100 p-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiSettings className="text-primary" />
          <h1 className="text-lg font-black text-secondary uppercase tracking-tighter">Settings</h1>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-gray-50 rounded-xl">
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
      
      {mobileMenuOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="md:hidden bg-white border-b border-gray-100 p-4 grid grid-cols-2 gap-2 z-40 fixed top-16 left-0 right-0 shadow-2xl">
          {CONFIG_TABS.map((tab) => (
            <button key={tab.id} onClick={() => { setConfigTab(tab.id); setMobileMenuOpen(false); }} className={`p-4 rounded-2xl text-xs font-black flex items-center gap-3 ${configTab === tab.id ? "bg-secondary text-white" : "bg-gray-50 text-gray-500"}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-secondary tracking-tight mb-2">
                {CONFIG_TABS.find(t => t.id === configTab)?.label}
              </h2>
              <div className="flex items-center gap-3 text-gray-500">
                <span className="text-sm font-medium">Control Center</span>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium">{configTab.charAt(0).toUpperCase() + configTab.slice(1)}</span>
              </div>
            </div>
            {configTab === "account" && (
              <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 shadow-sm">
                <FiCheckCircle size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Real-time Sync</span>
              </div>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={configTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "circOut" }}
          >
            {configTab === "account" && (
              <AccountSettings 
                profile={profile} 
                profileFile={profileFile}
                preferences={preferences}
                onProfileChange={(e) => setProfile({...profile, [e.target.name]: e.target.value})}
                onProfileFileChange={(f) => setProfileFile(f)}
                onPreferenceChange={(e) => setPreferences({...preferences, [e.target.name]: e.target.value})}
                onPreferenceToggle={(id) => setPreferences({...preferences, [id]: !preferences[id]})}
                onSave={handleProfileSave}
                saving={saving}
                security={security}
                onSecurityChange={(e) => setSecurity({...security, [e.target.name]: e.target.value})}
                onPasswordSubmit={handlePasswordSubmit}
                savingPassword={savingPassword}
                passwordError={passwordError}
                onReset2FA={() => { setTwoFactorMode("setup"); setTwoFactorModalOpen(true); }}
                onDisable2FA={() => { setTwoFactorMode("disable"); setTwoFactorModalOpen(true); }}
              />
            )}

            {configTab === "visa" && (
              <VisaSettings 
                visaTypes={visaTypes}
                petitionTypes={petitionTypes}
                loading={loading}
                onAddVisa={() => { setVisaModalMode("add"); setVisaFormName(""); setVisaModalOpen(true); }}
                onEditVisa={(id) => { const v = visaTypes.find(x => x.id === id); setVisaModalMode("edit"); setEditingVisaId(id); setVisaFormName(v.name); setVisaModalOpen(true); }}
                onDeleteVisa={async (id) => { const r = await Swal.fire({ title: "Delete Visa Type?", icon: "warning", showCancelButton: true }); if (r.isConfirmed) { await deleteVisaType(id); loadData(); } }}
                onAddPetition={() => { setPetitionModalMode("add"); setPetitionFormName(""); setPetitionModalOpen(true); }}
                onEditPetition={(id) => { const p = petitionTypes.find(x => x.id === id); setPetitionModalMode("edit"); setEditingPetitionId(id); setPetitionFormName(p.name); setPetitionModalOpen(true); }}
                onDeletePetition={async (id) => { const r = await Swal.fire({ title: "Delete Petition Type?", icon: "warning", showCancelButton: true }); if (r.isConfirmed) { await deletePetitionType(id); loadData(); } }}
                error={error}
              />
            )}

            {configTab === "categories" && (
              <CategorySettings 
                categories={categories}
                loading={loading}
                onAdd={handleCategoryAdd}
                onDelete={handleCategoryDelete}
                saving={saving}
                error={error}
              />
            )}

            {configTab === "departments" && (
              <DepartmentSettings 
                departments={departments}
                loading={loading}
                onAdd={() => { setDepartmentModalMode("add"); setDepartmentFormName(""); setDepartmentModalOpen(true); }}
                onEdit={(name) => { setDepartmentModalMode("edit"); setEditingDepartment(name); setDepartmentFormName(name); setDepartmentModalOpen(true); }}
                onDelete={async (name) => { const r = await Swal.fire({ title: "Delete Department?", icon: "warning", showCancelButton: true }); if (r.isConfirmed) { await deleteDepartment({ name }); loadData(); } }}
                error={error}
              />
            )}

            {configTab === "roles" && (
              <div className="bg-white p-12 md:p-20 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20 text-center">
                <div className="inline-flex p-8 bg-amber-50 rounded-full mb-8 text-amber-500 shadow-inner">
                  <FiShield size={64} />
                </div>
                <h3 className="text-2xl font-black text-secondary mb-4 tracking-tight">Access Control & Roles</h3>
                <p className="text-gray-500 max-w-xl mx-auto mb-10 text-lg font-medium leading-relaxed">
                  Manage user permissions, define hierarchical roles, and secure your system with granular RBAC settings in the specialized permissions module.
                </p>
                <Link 
                  to="/admin/permissions" 
                  className="inline-flex items-center gap-4 px-10 py-5 bg-secondary text-white rounded-2xl font-black text-sm shadow-2xl shadow-secondary/30 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Configure RBAC Matrix <FiArrowRight />
                </Link>
              </div>
            )}

            {configTab === "email" && (
              <EmailSettings 
                templates={emailTemplates}
                loading={loading}
                onAdd={() => { setEmailModalMode("add"); setEmailFormKey(""); setEmailFormSubject(""); setEmailFormBody(""); setEmailModalOpen(true); }}
                onEdit={(key) => { const t = emailTemplates.find(x => x.template_key === key); setEmailModalMode("edit"); setEditingEmailKey(key); setEmailFormKey(t.template_key); setEmailFormSubject(t.subject); setEmailFormBody(t.body); setEmailModalOpen(true); }}
                onDelete={async (key) => { const r = await Swal.fire({ title: "Delete Template?", icon: "warning", showCancelButton: true }); if (r.isConfirmed) { await deleteEmailTemplate(key); loadData(); } }}
                onView={(key) => { setViewingTemplate(emailTemplates.find(x => x.template_key === key)); setViewEmailModalOpen(true); }}
                error={error}
              />
            )}

            {configTab === "payment" && (
              <PaymentSettings 
                config={paymentConfig}
                onConfigChange={(key, val) => setPaymentConfig({...paymentConfig, [key]: val})}
                onToggle={(key) => setPaymentConfig({...paymentConfig, [key]: !paymentConfig[key]})}
                onSave={handlePaymentSave}
                saving={saving}
                loading={loading}
                error={error}
              />
            )}

            {configTab === "sla" && (
              <SLASettings 
                rules={slaRules}
                loading={loading}
                onAdd={() => { setSlaModalMode("add"); setSlaFormName(""); setSlaFormDays(""); setSlaModalOpen(true); }}
                onEdit={(id) => { const r = slaRules.find(x => x.id === id); setSlaModalMode("edit"); setEditingSlaId(id); setSlaFormName(r.name); setSlaFormDays(r.days); setSlaFormType(r.rule_type); setSlaModalOpen(true); }}
                onDelete={async (id) => { const r = await Swal.fire({ title: "Delete SLA?", icon: "warning", showCancelButton: true }); if (r.isConfirmed) { await deleteSlaRule(id); loadData(); } }}
                error={error}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals */}
      <Modal open={visaModalOpen} onClose={() => setVisaModalOpen(false)} title="Visa Type Configuration">
        <form onSubmit={submitVisaForm} className="space-y-6 p-2">
          <Input label="Visa Designation" value={visaFormName} onChange={(e) => setVisaFormName(e.target.value)} error={visaFormError} placeholder="e.g. EB-1 Extraordinary Ability" autoFocus />
          <Button type="submit" className="w-full rounded-2xl py-4 shadow-xl shadow-primary/20">Save Configuration</Button>
        </form>
      </Modal>

      <Modal open={petitionModalOpen} onClose={() => setPetitionModalOpen(false)} title="Petition Type Setup">
        <form onSubmit={submitPetitionForm} className="space-y-6 p-2">
          <Input label="Petition Identifier" value={petitionFormName} onChange={(e) => setPetitionFormName(e.target.value)} error={petitionFormError} placeholder="e.g. Form I-140" autoFocus />
          <Button type="submit" className="w-full rounded-2xl py-4 shadow-xl shadow-primary/20">Initialize Petition</Button>
        </form>
      </Modal>

      <Modal open={departmentModalOpen} onClose={() => setDepartmentModalOpen(false)} title="Department Management">
        <form onSubmit={submitDepartmentForm} className="space-y-6 p-2">
          <Input label="Department Designation" value={departmentFormName} onChange={(e) => setDepartmentFormName(e.target.value)} error={departmentFormError} placeholder="e.g. Legal Compliance" autoFocus />
          <Button type="submit" className="w-full rounded-2xl py-4 shadow-xl shadow-primary/20">Update Registry</Button>
        </form>
      </Modal>

      <Modal open={emailModalOpen} onClose={() => setEmailModalOpen(false)} title="Template Architect" maxWidthClass="max-w-3xl">
        <form onSubmit={submitEmailForm} className="space-y-6 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Unique Key" value={emailFormKey} onChange={(e) => setEmailFormKey(e.target.value)} disabled={emailModalMode === "edit"} error={emailFormError} placeholder="system_alert" />
            <Input label="Email Subject" value={emailFormSubject} onChange={(e) => setEmailFormSubject(e.target.value)} placeholder="Action Required: Case Update" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Source Code / Body Content</label>
            <textarea value={emailFormBody} onChange={(e) => setEmailFormBody(e.target.value)} rows={12} className="w-full border-2 border-gray-100 rounded-[2rem] px-6 py-5 text-sm font-medium focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none custom-scrollbar" />
          </div>
          <Button type="submit" className="w-full rounded-2xl py-4 shadow-xl shadow-primary/20">Commit Template</Button>
        </form>
      </Modal>

      <Modal open={viewEmailModalOpen} onClose={() => setViewEmailModalOpen(false)} title="Template Visualizer" maxWidthClass="max-w-4xl">
        {viewingTemplate && (
          <div className="space-y-8 p-2">
            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Subject Header</span>
              <div className="text-lg font-black text-secondary">{viewingTemplate.subject}</div>
            </div>
            <div className="p-10 bg-white rounded-[3rem] border-2 border-gray-50 shadow-inner min-h-[400px] whitespace-pre-wrap text-base leading-relaxed text-gray-700 font-medium">
              {viewingTemplate.body}
            </div>
            <Button onClick={() => setViewEmailModalOpen(false)} className="w-full rounded-2xl py-4">Close Visualizer</Button>
          </div>
        )}
      </Modal>

      <Modal open={slaModalOpen} onClose={() => setSlaModalOpen(false)} title="SLA Rule Matrix">
        <form onSubmit={submitSlaForm} className="space-y-6 p-2">
          <Input label="Rule Designation" value={slaFormName} onChange={(e) => setSlaFormName(e.target.value)} placeholder="e.g. Standard Processing" autoFocus />
          <Input label="Target Duration (Days)" type="number" value={slaFormDays} onChange={(e) => setSlaFormDays(e.target.value)} placeholder="45" />
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Policy Scope</label>
            <select className="w-full border-2 border-gray-100 rounded-2xl px-6 py-4 bg-white text-sm font-bold outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all" value={slaFormType} onChange={(e) => setSlaFormType(e.target.value)}>
              <option value="Visa">Visa Type Specific</option>
              <option value="Global">Global Enterprise Policy</option>
            </select>
          </div>
          {slaFormError && <p className="text-xs text-red-500 font-black px-2 flex items-center gap-2"><FiX /> {slaFormError}</p>}
          <Button type="submit" className="w-full rounded-2xl py-4 shadow-xl shadow-primary/20">Enforce Policy</Button>
        </form>
      </Modal>

      <Modal open={twoFactorModalOpen} onClose={() => setTwoFactorModalOpen(false)} title="" maxWidthClass="max-w-md" bodyClassName="p-0" footer={null}>
        {twoFactorMode === "setup" ? (
          <TwoFactorSetup onSetupComplete={() => { setTwoFactorModalOpen(false); loadData(); }} onCancel={() => setTwoFactorModalOpen(false)} />
        ) : (
          <TwoFactorDisable onDisableComplete={() => { setTwoFactorModalOpen(false); loadData(); }} onCancel={() => setTwoFactorModalOpen(false)} />
        )}
      </Modal>
    </div>
  );
}
