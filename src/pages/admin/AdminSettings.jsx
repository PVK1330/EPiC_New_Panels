import { useState, useEffect } from "react";
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
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiArrowRight,
} from "react-icons/fi";
import { RiSettings3Line } from "react-icons/ri";
import Button from "../../components/Button";
import Input from "../../components/Input";
import SegmentedTabBar from "../../components/admin/SegmentedTabBar";
import Modal from "../../components/Modal";
import TwoFactorSetup from "../../components/TwoFactorSetup";
import TwoFactorDisable from "../../components/TwoFactorDisable";
import { useSelector } from "react-redux";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../../services/caseWorker";

const timezones = ["UTC-05:00 Eastern Time", "UTC-06:00 Central Time", "UTC-07:00 Mountain Time", "UTC-08:00 Pacific Time"];
const languages = ["English", "Spanish", "French", "German"];
const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];
const roles = ["Administrator", "Caseworker", "Manager"];

const CONFIG_TABS = [
  { id: "account", label: "Your account", icon: <FiUser size={16} /> },
  { id: "visa", label: "Visa types", icon: <FiLayers size={16} /> },
  { id: "categories", label: "Case categories", icon: <FiFolder size={16} /> },
  { id: "departments", label: "Departments", icon: <FiFolder size={16} /> },
  { id: "roles", label: "Role permissions", icon: <FiShield size={16} /> },
  { id: "email", label: "Email templates", icon: <FiMail size={16} /> },
  { id: "payment", label: "Payment config", icon: <FiCreditCard size={16} /> },
  { id: "sla", label: "SLA rules", icon: <FiClock size={16} /> },
];

const INITIAL_VISA_TYPES = [
  { id: "visa-1", name: "Skilled Worker Visa" },
  { id: "visa-2", name: "Indefinite Leave to Remain (ILR)" },
  { id: "visa-3", name: "Graduate Visa" },
  { id: "visa-4", name: "Student Visa" },
  { id: "visa-5", name: "Sponsor Licence" },
];

const VISA_FORM_ID = "settings-visa-type-form";

const EMAIL_TEMPLATE_OPTIONS = [
  { value: "payment", label: "Payment reminder" },
  { value: "doc", label: "Document request" },
  { value: "opened", label: "Case opened" },
  { value: "expiry", label: "Visa expiry alert" },
  { value: "welcome", label: "Welcome email" },
];

const CURRENCY_OPTIONS = [
  { value: "GBP", label: "GBP (£)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "USD", label: "USD ($)" },
];

const selectClass =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30";

function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 ${
        on ? "bg-primary" : "bg-gray-200"
      }`}
      aria-pressed={on}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

const panelMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.2 },
};

export default function AdminSettings() {
  const token = useSelector((state) => state.auth.token);
  const [configTab, setConfigTab] = useState("account");
  const [visaTypes, setVisaTypes] = useState(INITIAL_VISA_TYPES);
  const [visaModalOpen, setVisaModalOpen] = useState(false);
  const [visaModalMode, setVisaModalMode] = useState("add");
  const [departments, setDepartments] = useState([]);
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [departmentModalMode, setDepartmentModalMode] = useState("add");
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [departmentFormName, setDepartmentFormName] = useState("");
  const [departmentFormError, setDepartmentFormError] = useState("");
  const [editingVisaId, setEditingVisaId] = useState(null);
  const [visaFormName, setVisaFormName] = useState("");
  const [visaFormError, setVisaFormError] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [categories, setCategories] = useState(["Urgent", "VIP", "Standard"]);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState("setup"); // setup or disable

  useEffect(() => {
    if (configTab === "departments") {
      fetchDepartments();
    }
  }, [configTab]);

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      if (res.data?.status === "success") {
        setDepartments(res.data.data.departments || []);
      }
    } catch (e) {
      console.error("Failed to fetch departments:", e);
    }
  };

  const openDepartmentModalAdd = () => {
    setDepartmentModalMode("add");
    setEditingDepartment(null);
    setDepartmentFormName("");
    setDepartmentFormError("");
    setDepartmentModalOpen(true);
  };

  const openDepartmentModalEdit = (department) => {
    setDepartmentModalMode("edit");
    setEditingDepartment(department);
    setDepartmentFormName(department);
    setDepartmentFormError("");
    setDepartmentModalOpen(true);
  };

  const closeDepartmentModal = () => {
    setDepartmentModalOpen(false);
    setDepartmentFormName("");
    setDepartmentFormError("");
    setEditingDepartment(null);
  };

  const submitDepartmentForm = async (e) => {
    e.preventDefault();
    const trimmed = departmentFormName.trim();
    if (!trimmed) {
      setDepartmentFormError("Name is required");
      return;
    }
    try {
      if (departmentModalMode === "add") {
        await createDepartment({ name: trimmed });
      } else if (editingDepartment) {
        await updateDepartment({ oldName: editingDepartment, newName: trimmed });
      }
      closeDepartmentModal();
      fetchDepartments();
    } catch (e) {
      console.error("Failed to save department:", e);
      setDepartmentFormError(e.response?.data?.message || "Failed to save department");
    }
  };

  const removeDepartment = async (department) => {
    const result = await Swal.fire({
      title: "Delete Department",
      text: `Are you sure you want to delete "${department}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await deleteDepartment({ name: department });
        fetchDepartments();
        Swal.fire({
          title: "Deleted!",
          text: `Department "${department}" has been deleted.`,
          icon: "success"
        });
      } catch (e) {
        console.error("Failed to delete department:", e);
        Swal.fire({
          title: "Error",
          text: e.response?.data?.message || "Failed to delete department",
          icon: "error"
        });
      }
    }
  };

  const [emailTemplate, setEmailTemplate] = useState("payment");
  const [emailSubject, setEmailSubject] = useState("[VisaFlow] Action Required: Outstanding Payment");
  const [emailBody, setEmailBody] = useState(
    `Dear {{client_name}},

We wanted to remind you that your outstanding balance of {{amount}} is now {{days_overdue}} days overdue.

Please arrange payment at your earliest convenience.

Best regards,
VisaFlow Team`,
  );

  const [currency, setCurrency] = useState("GBP");
  const [payBank, setPayBank] = useState(true);
  const [payCard, setPayCard] = useState(true);
  const [payCheque, setPayCheque] = useState(false);
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");

  const [slaSkilled, setSlaSkilled] = useState("45");
  const [slaIlr, setSlaIlr] = useState("30");
  const [slaStudent, setSlaStudent] = useState("60");
  const [slaEscalation, setSlaEscalation] = useState("3");
  const [slaMissingDocs, setSlaMissingDocs] = useState("7");

  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    role: "Administrator",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [twoFA, setTwoFA] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifications: true,
    caseUpdates: true,
    paymentAlerts: false,
  });

  const [system, setSystem] = useState({
    timezone: "UTC-05:00 Eastern Time",
    language: "English",
    dateFormat: "MM/DD/YYYY",
  });
  const [dataCollection, setDataCollection] = useState(false);

  const handleProfile = (e) => setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSecurity = (e) => setSecurity((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSystem = (e) => setSystem((p) => ({ ...p, [e.target.name]: e.target.value }));
  const toggleNotif = (key) => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    console.log("Settings saved", {
      profile,
      security: { ...security, currentPassword: "***", newPassword: "***", confirmPassword: "***" },
      notifPrefs,
      system,
      twoFA,
      dataCollection,
      configTab,
      visaTypes,
      categories,
      email: { emailTemplate, emailSubject },
      payment: { currency, payBank, payCard, payCheque, invoicePrefix },
      sla: { slaSkilled, slaIlr, slaStudent, slaEscalation, slaMissingDocs },
    });
  };

  const handleCancel = () => {
    setProfile({ firstName: "John", lastName: "Doe", email: "john.doe@company.com", phone: "+1 (555) 123-4567", role: "Administrator" });
    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setSystem({ timezone: "UTC-05:00 Eastern Time", language: "English", dateFormat: "MM/DD/YYYY" });
    setVisaTypes(INITIAL_VISA_TYPES);
    setCategories(["Urgent", "VIP", "Standard"]);
    setCategoryInput("");
    setEmailSubject("[VisaFlow] Action Required: Outstanding Payment");
    setCurrency("GBP");
    setPayBank(true);
    setPayCard(true);
    setPayCheque(false);
    setInvoicePrefix("INV-");
    setSlaSkilled("45");
    setSlaIlr("30");
    setSlaStudent("60");
    setSlaEscalation("3");
    setSlaMissingDocs("7");
  };

  const openVisaModalAdd = () => {
    setVisaModalMode("add");
    setEditingVisaId(null);
    setVisaFormName("");
    setVisaFormError("");
    setVisaModalOpen(true);
  };

  const openVisaModalEdit = (id) => {
    const row = visaTypes.find((v) => v.id === id);
    if (!row) return;
    setVisaModalMode("edit");
    setEditingVisaId(id);
    setVisaFormName(row.name);
    setVisaFormError("");
    setVisaModalOpen(true);
  };

  const closeVisaModal = () => {
    setVisaModalOpen(false);
    setVisaFormName("");
    setVisaFormError("");
    setEditingVisaId(null);
  };

  const submitVisaForm = (e) => {
    e.preventDefault();
    const trimmed = visaFormName.trim();
    if (!trimmed) {
      setVisaFormError("Name is required");
      return;
    }
    const duplicate = visaTypes.some((v) => v.name.toLowerCase() === trimmed.toLowerCase() && v.id !== editingVisaId);
    if (duplicate) {
      setVisaFormError("A visa type with this name already exists");
      return;
    }
    if (visaModalMode === "add") {
      setVisaTypes((prev) => [...prev, { id: `visa-${Date.now()}`, name: trimmed }]);
    } else if (editingVisaId) {
      setVisaTypes((prev) => prev.map((v) => (v.id === editingVisaId ? { ...v, name: trimmed } : v)));
    }
    closeVisaModal();
  };

  const removeVisa = (id) => setVisaTypes((v) => v.filter((x) => x.id !== id));
  const addCategory = () => {
    const t = categoryInput.trim();
    if (t && !categories.includes(t)) {
      setCategories((c) => [...c, t]);
      setCategoryInput("");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 max-w-[1400px] mx-auto w-full">
      <motion.div
        className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2 sm:gap-3">
            <RiSettings3Line className="text-primary shrink-0" size={32} />
            <span className="truncate">Settings</span>
          </h1>
          <p className="text-primary font-bold text-sm mt-1">System configuration and preferences</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button type="button" className="rounded-xl shadow-sm inline-flex items-center gap-2" onClick={handleSave}>
            <FiSettings size={16} aria-hidden />
            Save changes
          </Button>
        </div>
      </motion.div>

      <div className="space-y-3">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider px-0.5">Settings</h2>
        <SegmentedTabBar tabs={CONFIG_TABS} activeId={configTab} onChange={setConfigTab} layoutId="admin-settings-config-tab" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[200px]">
        <AnimatePresence mode="wait">
          {configTab === "account" && (
            <motion.div key="account" className="p-5 sm:p-6 space-y-8" {...panelMotion}>
              <div>
                <h3 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Profile settings</h3>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                      <span className="text-2xl font-black text-secondary">JD</span>
                    </div>
                    <div>
                      <Button type="button" className="rounded-xl">
                        Change avatar
                      </Button>
                      <p className="mt-1 text-xs text-gray-500">JPG, GIF or PNG. Max size of 2MB</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="First name" name="firstName" value={profile.firstName} onChange={handleProfile} />
                    <Input label="Last name" name="lastName" value={profile.lastName} onChange={handleProfile} />
                  </div>
                  <Input label="Email address" name="email" type="email" value={profile.email} onChange={handleProfile} />
                  <Input label="Phone number" name="phone" type="tel" value={profile.phone} onChange={handleProfile} />
                  <div className="flex flex-col gap-1">
                    <label htmlFor="profile-role" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      Role
                    </label>
                    <select id="profile-role" name="role" value={profile.role} onChange={handleProfile} className={selectClass}>
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Security settings</h3>
                <div className="space-y-6">
                  <Input label="Current password" name="currentPassword" type="password" value={security.currentPassword} onChange={handleSecurity} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="New password" name="newPassword" type="password" value={security.newPassword} onChange={handleSecurity} />
                    <Input label="Confirm new password" name="confirmPassword" type="password" value={security.confirmPassword} onChange={handleSecurity} />
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-black text-secondary">Two-factor authentication</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {twoFA ? "2FA is enabled" : "2FA is disabled"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {twoFA ? "Your account is protected with 2FA" : "Enable 2FA for enhanced security"}
                        </p>
                      </div>
                      {twoFA ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="rounded-xl text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setTwoFactorMode("disable");
                            setTwoFactorModalOpen(true);
                          }}
                        >
                          Disable 2FA
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="rounded-xl"
                          onClick={() => {
                            setTwoFactorMode("setup");
                            setTwoFactorModalOpen(true);
                          }}
                        >
                          Enable 2FA
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Notification preferences</h3>
                <div className="space-y-5">
                  {[
                    { key: "emailNotifications", label: "Email notifications", desc: "Receive notifications via email" },
                    { key: "caseUpdates", label: "Case updates", desc: "Get notified about case status changes" },
                    { key: "paymentAlerts", label: "Payment alerts", desc: "Receive payment due and overdue notifications" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-secondary">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                      <Toggle on={notifPrefs[key]} onToggle={() => toggleNotif(key)} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">System settings</h3>
                <div className="space-y-6">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="sys-tz" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      Time zone
                    </label>
                    <select id="sys-tz" name="timezone" value={system.timezone} onChange={handleSystem} className={selectClass}>
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="sys-lang" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      Language
                    </label>
                    <select id="sys-lang" name="language" value={system.language} onChange={handleSystem} className={selectClass}>
                      {languages.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="sys-df" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      Date format
                    </label>
                    <select id="sys-df" name="dateFormat" value={system.dateFormat} onChange={handleSystem} className={selectClass}>
                      {dateFormats.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-black text-secondary">Data privacy</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Data collection</p>
                        <p className="text-xs text-gray-500 mt-0.5">Allow collection of usage data for improvement</p>
                      </div>
                      <Toggle on={dataCollection} onToggle={() => setDataCollection((v) => !v)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2 border-t border-gray-100">
                <Button type="button" variant="ghost" className="rounded-xl w-full sm:w-auto" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="button" className="rounded-xl w-full sm:w-auto" onClick={handleSave}>
                  Save changes
                </Button>
              </div>
            </motion.div>
          )}

          {configTab === "visa" && (
            <motion.div key="visa" className="p-5 sm:p-6" {...panelMotion}>
              <h3 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Visa types</h3>
              <div className="flex flex-col gap-2.5 mb-5">
                {visaTypes.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <span className="text-sm font-semibold text-secondary">{row.name}</span>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                        onClick={() => openVisaModalEdit(row.id)}
                      >
                        <FiEdit2 size={14} aria-hidden />
                        Edit
                      </Button>
                      <Button type="button" variant="danger" className="rounded-xl text-xs px-3 py-1.5 inline-flex items-center gap-1.5" onClick={() => removeVisa(row.id)}>
                        <FiTrash2 size={14} aria-hidden />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" className="rounded-xl inline-flex items-center gap-2" onClick={openVisaModalAdd}>
                <FiPlus size={16} aria-hidden />
                Add visa type
              </Button>
            </motion.div>
          )}

          {configTab === "categories" && (
            <motion.div key="categories" className="p-5 sm:p-6" {...panelMotion}>
              <h3 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Case categories</h3>
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <Input label="Add category" name="category" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} placeholder="e.g. Urgent, VIP, Government…" className="flex-1" />
                <div className="sm:pt-6">
                  <Button type="button" className="rounded-xl w-full sm:w-auto" onClick={addCategory}>
                    Add
                  </Button>
                </div>
              </div>
              {categories.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <li key={c} className="px-3 py-1.5 rounded-full text-xs font-bold bg-secondary/10 text-secondary border border-secondary/20">
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}

          {configTab === "departments" && (
            <motion.div key="departments" className="p-5 sm:p-6" {...panelMotion}>
              <h3 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Departments</h3>
              <div className="flex flex-col gap-2.5 mb-5">
                {departments.map((department) => (
                  <div
                    key={department}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <span className="text-sm font-semibold text-secondary">{department}</span>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                        onClick={() => openDepartmentModalEdit(department)}
                      >
                        <FiEdit2 size={14} aria-hidden />
                        Edit
                      </Button>
                      <Button type="button" variant="danger" className="rounded-xl text-xs px-3 py-1.5 inline-flex items-center gap-1.5" onClick={() => removeDepartment(department)}>
                        <FiTrash2 size={14} aria-hidden />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" className="rounded-xl inline-flex items-center gap-2" onClick={openDepartmentModalAdd}>
                <FiPlus size={16} aria-hidden />
                Add department
              </Button>
            </motion.div>
          )}

          {configTab === "roles" && (
            <motion.div key="roles" className="p-5 sm:p-6" {...panelMotion}>
              <h3 className="text-sm font-black text-secondary pb-3 mb-2 border-b border-gray-100">Role permissions</h3>
              <p className="text-sm text-gray-500 mb-5 max-w-2xl leading-relaxed">
                Configure role-level defaults. Use the permissions area for the full RBAC matrix.
              </p>
              <Link
                to="/admin/permissions"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                Go to permissions &amp; RBAC
                <FiArrowRight size={16} aria-hidden />
              </Link>
            </motion.div>
          )}

          {configTab === "email" && (
            <motion.div key="email" className="p-5 sm:p-6 space-y-4" {...panelMotion}>
              <h3 className="text-sm font-black text-secondary pb-3 mb-2 border-b border-gray-100">Email templates</h3>
              <Input
                label="Template"
                name="emailTemplate"
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                options={EMAIL_TEMPLATE_OPTIONS}
              />
              <Input label="Subject" name="emailSubject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
              <div className="flex flex-col gap-1">
                <label htmlFor="email-body" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Body
                </label>
                <textarea
                  id="email-body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-y min-h-[160px]"
                />
              </div>
              <Button type="button" className="rounded-xl">
                Save template
              </Button>
            </motion.div>
          )}

          {configTab === "payment" && (
            <motion.div key="payment" className="p-5 sm:p-6 space-y-5" {...panelMotion}>
              <h3 className="text-sm font-black text-secondary pb-3 mb-2 border-b border-gray-100">Payment configuration</h3>
              <Input label="Default payment currency" name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} options={CURRENCY_OPTIONS} />
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Payment methods accepted</p>
                <div className="space-y-3">
                  <label className="flex items-center justify-between gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/80 cursor-pointer">
                    <span className="text-sm font-medium text-gray-800">Bank transfer</span>
                    <Toggle on={payBank} onToggle={() => setPayBank((v) => !v)} />
                  </label>
                  <label className="flex items-center justify-between gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/80 cursor-pointer">
                    <span className="text-sm font-medium text-gray-800">Credit / debit card</span>
                    <Toggle on={payCard} onToggle={() => setPayCard((v) => !v)} />
                  </label>
                  <label className="flex items-center justify-between gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/80 cursor-pointer">
                    <span className="text-sm font-medium text-gray-800">Cheque</span>
                    <Toggle on={payCheque} onToggle={() => setPayCheque((v) => !v)} />
                  </label>
                </div>
              </div>
              <Input label="Invoice prefix" name="invoicePrefix" value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} />
              <Button type="button" className="rounded-xl">
                Save config
              </Button>
            </motion.div>
          )}

          {configTab === "sla" && (
            <motion.div key="sla" className="p-5 sm:p-6 space-y-4" {...panelMotion}>
              <h3 className="text-sm font-black text-secondary pb-3 mb-2 border-b border-gray-100">SLA rules</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                <Input label="Skilled worker — target days" name="slaSkilled" type="number" value={slaSkilled} onChange={(e) => setSlaSkilled(e.target.value)} />
                <Input label="ILR — target days" name="slaIlr" type="number" value={slaIlr} onChange={(e) => setSlaIlr(e.target.value)} />
                <Input label="Student visa — target days" name="slaStudent" type="number" value={slaStudent} onChange={(e) => setSlaStudent(e.target.value)} />
                <Input label="Escalation trigger (days stuck)" name="slaEscalation" type="number" value={slaEscalation} onChange={(e) => setSlaEscalation(e.target.value)} />
                <Input label="Missing docs escalation (days)" name="slaMissingDocs" type="number" value={slaMissingDocs} onChange={(e) => setSlaMissingDocs(e.target.value)} />
              </div>
              <Button type="button" className="rounded-xl">
                Save SLA rules
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal
        open={visaModalOpen}
        onClose={closeVisaModal}
        title={visaModalMode === "add" ? "Add visa type" : "Edit visa type"}
        footer={
          <>
            <Button type="button" variant="ghost" className="rounded-xl" onClick={closeVisaModal}>
              Cancel
            </Button>
            <Button type="button" className="rounded-xl" onClick={submitVisaForm}>
              {visaModalMode === "add" ? "Add" : "Save"}
            </Button>
          </>
        }
      >
        <form id={VISA_FORM_ID} onSubmit={submitVisaForm} className="space-y-4">
          <Input
            label="Visa type name"
            name="name"
            value={visaFormName}
            onChange={(e) => setVisaFormName(e.target.value)}
            error={visaFormError}
            placeholder="e.g. Skilled Worker Visa"
          />
        </form>
      </Modal>

      <Modal
        open={departmentModalOpen}
        onClose={closeDepartmentModal}
        title={departmentModalMode === "add" ? "Add department" : "Edit department"}
        footer={
          <div className="flex gap-3 pt-4 mt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" className="rounded-xl flex-1" onClick={closeDepartmentModal}>
              Cancel
            </Button>
            <Button type="button" className="rounded-xl flex-1" onClick={submitDepartmentForm}>
              {departmentModalMode === "add" ? "Add" : "Save"}
            </Button>
          </div>
        }
      >
        <form onSubmit={submitDepartmentForm} className="p-2">
          <div className="mb-4">
            <label htmlFor="department-name" className="block text-sm font-bold text-gray-700 mb-2">
              Department name
            </label>
            <input
              id="department-name"
              type="text"
              value={departmentFormName}
              onChange={(e) => setDepartmentFormName(e.target.value)}
              placeholder="e.g. Immigration"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm"
              autoFocus
            />
            {departmentFormError && (
              <p className="mt-2 text-xs text-red-500 font-medium">{departmentFormError}</p>
            )}
          </div>
        </form>
      </Modal>

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
              setTwoFA(true);
              setTwoFactorModalOpen(false);
            }}
            onCancel={() => setTwoFactorModalOpen(false)}
          />
        ) : (
          <TwoFactorDisable
            token={token}
            onDisableComplete={() => {
              setTwoFA(false);
              setTwoFactorModalOpen(false);
            }}
            onCancel={() => setTwoFactorModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}
