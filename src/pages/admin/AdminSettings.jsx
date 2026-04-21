import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
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
import { Loader2 } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import SegmentedTabBar from "../../components/admin/SegmentedTabBar";
import Modal from "../../components/Modal";
import TwoFactorSetup from "../../components/TwoFactorSetup";
import TwoFactorDisable from "../../components/TwoFactorDisable";
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
  getSla,
  updateSla,
  getEmailTemplates,
  updateEmailTemplate,
} from "../../services/settingsService";

const timezones = ["UTC-05:00 Eastern Time", "UTC-06:00 Central Time", "UTC-07:00 Mountain Time", "UTC-08:00 Pacific Time"];
const languages = ["English", "Spanish", "French", "German"];
const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];

const CONFIG_TABS = [
  { id: "account", label: "Your account", icon: <FiUser size={16} /> },
  { id: "visa", label: "Visa types", icon: <FiLayers size={16} /> },
  { id: "categories", label: "Case categories", icon: <FiFolder size={16} /> },
  { id: "roles", label: "Role permissions", icon: <FiShield size={16} /> },
  { id: "email", label: "Email templates", icon: <FiMail size={16} /> },
  { id: "payment", label: "Payment config", icon: <FiCreditCard size={16} /> },
  { id: "sla", label: "SLA rules", icon: <FiClock size={16} /> },
];

const VISA_FORM_ID = "settings-visa-type-form";
const PETITION_FORM_ID = "settings-petition-type-form";

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

const SLA_KEYS = [
  "skilled_worker_days",
  "ilr_days",
  "student_visa_days",
  "escalation_stuck_days",
  "missing_docs_escalation_days",
];

function getApiError(error) {
  const d = error?.response?.data;
  const m = d?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m) && m.length) return m[0];
  return error?.message || "Something went wrong";
}

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

function PanelLoader() {
  return (
    <div className="flex min-h-[200px] items-center justify-center py-16">
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
    </div>
  );
}

const emptyProfile = () => ({
  first_name: "",
  last_name: "",
  email: "",
  country_code: "",
  mobile: "",
  avatar_url: "",
  role_name: "",
});

const emptyPreferences = () => ({
  two_factor_enabled: false,
  email_notifications: true,
  case_updates: true,
  payment_alerts: false,
  timezone: timezones[0],
  language: languages[0],
  date_format: dateFormats[0],
  data_collection: false,
});

const emptySlaForm = () => ({
  skilled_worker_days: "",
  ilr_days: "",
  student_visa_days: "",
  escalation_stuck_days: "",
  missing_docs_escalation_days: "",
});

const emptyEmailDrafts = () => {
  const o = {};
  EMAIL_TEMPLATE_OPTIONS.forEach((opt) => {
    o[opt.value] = { subject: "", body: "" };
  });
  return o;
};

export default function AdminSettings() {
  const { showToast } = useToast();
  const slaBaselineRef = useRef(null);

  const [configTab, setConfigTab] = useState("account");

  const [loadingMe, setLoadingMe] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountError, setAccountError] = useState("");

  const [profile, setProfile] = useState(emptyProfile);
  const [preferences, setPreferences] = useState(emptyPreferences);

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [loadingVisaTab, setLoadingVisaTab] = useState(false);
  const [visaTypes, setVisaTypes] = useState([]);
  const [visaModalOpen, setVisaModalOpen] = useState(false);
  const [visaModalMode, setVisaModalMode] = useState("add");
  const [editingVisaId, setEditingVisaId] = useState(null);
  const [visaFormName, setVisaFormName] = useState("");
  const [visaFormError, setVisaFormError] = useState("");
  const [visaTabError, setVisaTabError] = useState("");

  const [petitionTypes, setPetitionTypes] = useState([]);
  const [petitionModalOpen, setPetitionModalOpen] = useState(false);
  const [petitionModalMode, setPetitionModalMode] = useState("add");
  const [editingPetitionId, setEditingPetitionId] = useState(null);
  const [petitionFormName, setPetitionFormName] = useState("");
  const [petitionFormError, setPetitionFormError] = useState("");
  const [petitionTabError, setPetitionTabError] = useState("");

  const [categoryInput, setCategoryInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryTabError, setCategoryTabError] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);

  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState("setup");

  const [emailTemplateKey, setEmailTemplateKey] = useState("payment");
  const [emailDrafts, setEmailDrafts] = useState(emptyEmailDrafts);
  const [loadingEmailTab, setLoadingEmailTab] = useState(false);
  const [emailTabError, setEmailTabError] = useState("");
  const [savingEmailTemplate, setSavingEmailTemplate] = useState(false);

  const [currency, setCurrency] = useState("GBP");
  const [payBank, setPayBank] = useState(true);
  const [payCard, setPayCard] = useState(true);
  const [payCheque, setPayCheque] = useState(false);
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");

  const [slaForm, setSlaForm] = useState(emptySlaForm);
  const [loadingSlaTab, setLoadingSlaTab] = useState(false);
  const [slaTabError, setSlaTabError] = useState("");
  const [savingSla, setSavingSla] = useState(false);

  const applyMeFromPayload = useCallback((data) => {
    if (!data) return;
    const { profile: p, preferences: pref } = data;
    if (p) {
      setProfile({
        first_name: p.first_name ?? "",
        last_name: p.last_name ?? "",
        email: p.email ?? "",
        country_code: p.country_code ?? "",
        mobile: p.mobile ?? "",
        avatar_url: p.avatar_url ?? "",
        role_name: p.role_name ?? "",
      });
    }
    if (pref) {
      setPreferences((prev) => ({
        ...prev,
        two_factor_enabled: !!pref.two_factor_enabled,
        email_notifications: !!pref.email_notifications,
        case_updates: !!pref.case_updates,
        payment_alerts: !!pref.payment_alerts,
        timezone: pref.timezone ?? prev.timezone,
        language: pref.language ?? prev.language,
        date_format: pref.date_format ?? prev.date_format,
        data_collection: !!pref.data_collection,
      }));
    }
  }, []);

  const loadMe = useCallback(async () => {
    setLoadingMe(true);
    setAccountError("");
    try {
      const res = await getMe();
      applyMeFromPayload(res.data?.data);
    } catch (e) {
      setAccountError(getApiError(e));
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setLoadingMe(false);
    }
  }, [applyMeFromPayload, showToast]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    if (configTab !== "visa") return;
    let alive = true;
    const run = async () => {
      setLoadingVisaTab(true);
      setVisaTabError("");
      setPetitionTabError("");
      try {
        const [vRes, pRes] = await Promise.all([getVisaTypes(), getPetitionTypes()]);
        if (!alive) return;
        setVisaTypes(vRes.data?.data?.visa_types ?? []);
        setPetitionTypes(pRes.data?.data?.petition_types ?? []);
      } catch (e) {
        if (!alive) return;
        const msg = getApiError(e);
        setVisaTabError(msg);
        setPetitionTabError(msg);
        showToast({ message: msg, variant: "danger" });
      } finally {
        if (alive) setLoadingVisaTab(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [configTab, showToast]);

  useEffect(() => {
    if (configTab !== "categories") return;
    let alive = true;
    const run = async () => {
      setLoadingCategories(true);
      setCategoryTabError("");
      try {
        const res = await getCaseCategories();
        if (!alive) return;
        setCategories(res.data?.data?.categories ?? []);
      } catch (e) {
        if (!alive) return;
        const msg = getApiError(e);
        setCategoryTabError(msg);
        showToast({ message: msg, variant: "danger" });
      } finally {
        if (alive) setLoadingCategories(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [configTab, showToast]);

  useEffect(() => {
    if (configTab !== "sla") return;
    let alive = true;
    const run = async () => {
      setLoadingSlaTab(true);
      setSlaTabError("");
      try {
        const res = await getSla();
        if (!alive) return;
        const s = res.data?.data?.sla;
        if (s) {
          slaBaselineRef.current = { ...s };
          setSlaForm({
            skilled_worker_days: String(s.skilled_worker_days ?? ""),
            ilr_days: String(s.ilr_days ?? ""),
            student_visa_days: String(s.student_visa_days ?? ""),
            escalation_stuck_days: String(s.escalation_stuck_days ?? ""),
            missing_docs_escalation_days: String(s.missing_docs_escalation_days ?? ""),
          });
        }
      } catch (e) {
        if (!alive) return;
        const msg = getApiError(e);
        setSlaTabError(msg);
        showToast({ message: msg, variant: "danger" });
      } finally {
        if (alive) setLoadingSlaTab(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [configTab, showToast]);

  useEffect(() => {
    if (configTab !== "email") return;
    let alive = true;
    const run = async () => {
      setLoadingEmailTab(true);
      setEmailTabError("");
      try {
        const res = await getEmailTemplates();
        if (!alive) return;
        const rows = res.data?.data?.templates ?? [];
        const next = emptyEmailDrafts();
        rows.forEach((t) => {
          if (t?.key) next[t.key] = { subject: t.subject ?? "", body: t.body ?? "" };
        });
        setEmailDrafts(next);
      } catch (e) {
        if (!alive) return;
        const msg = getApiError(e);
        setEmailTabError(msg);
        showToast({ message: msg, variant: "danger" });
      } finally {
        if (alive) setLoadingEmailTab(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [configTab, showToast]);

  const handleProfile = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleSecurity = (e) => {
    const { name, value } = e.target;
    setSecurity((p) => ({ ...p, [name]: value }));
  };

  const handlePreferenceSelect = (e) => {
    const { name, value } = e.target;
    setPreferences((p) => ({ ...p, [name]: value }));
  };

  const togglePreference = (key) => {
    setPreferences((p) => ({ ...p, [key]: !p[key] }));
  };

  const saveProfile = async () => {
    setSavingAccount(true);
    setAccountError("");
    try {
      await updateMePreferences({
        two_factor_enabled: preferences.two_factor_enabled,
        email_notifications: preferences.email_notifications,
        case_updates: preferences.case_updates,
        payment_alerts: preferences.payment_alerts,
        timezone: preferences.timezone,
        language: preferences.language,
        date_format: preferences.date_format,
        data_collection: preferences.data_collection,
        avatar_url: profile.avatar_url.trim() ? profile.avatar_url.trim() : null,
      });
      const profilePayload = {
        first_name: profile.first_name.trim(),
        last_name: profile.last_name.trim(),
        email: profile.email.trim(),
      };
      const cc = profile.country_code.trim();
      const mob = profile.mobile.trim();
      if (cc) profilePayload.country_code = cc;
      if (mob) profilePayload.mobile = mob;
      const profRes = await updateMe(profilePayload);
      applyMeFromPayload(profRes.data?.data);
      showToast({ message: profRes.data?.message || "Settings updated." });
    } catch (e) {
      const msg = getApiError(e);
      setAccountError(msg);
      showToast({ message: msg, variant: "danger" });
      await loadMe();
    } finally {
      setSavingAccount(false);
    }
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    if (security.newPassword !== security.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await changePassword({
        current_password: security.currentPassword,
        new_password: security.newPassword,
      });
      showToast({ message: res.data?.message || "Password updated successfully." });
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = getApiError(err);
      setPasswordError(msg);
      showToast({ message: msg, variant: "danger" });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleHeaderSave = async () => {
    if (configTab === "account") await saveProfile();
    else if (configTab === "sla") await saveSlaRules();
    else if (configTab === "email") await saveCurrentEmailTemplate();
    else if (configTab === "payment") {
      showToast({ message: "Payment configuration is not synced to the server.", variant: "warning" });
    } else {
      showToast({ message: "Use the actions in this section to save changes.", variant: "warning" });
    }
  };

  const saveSlaRules = async () => {
    setSlaTabError("");
    const base = slaBaselineRef.current || {};
    const payload = {};
    for (const k of SLA_KEYS) {
      const raw = slaForm[k];
      const n = parseInt(raw, 10);
      if (Number.isNaN(n) || raw === "") {
        setSlaTabError("Enter a valid number for each SLA field.");
        showToast({ message: "Enter a valid number for each SLA field.", variant: "danger" });
        return;
      }
      if (base[k] === undefined || n !== base[k]) {
        payload[k] = n;
      }
    }
    if (Object.keys(payload).length === 0) {
      showToast({ message: "No SLA changes to save.", variant: "warning" });
      return;
    }
    setSavingSla(true);
    try {
      await updateSla(payload);
      const res = await getSla();
      const s = res.data?.data?.sla;
      if (s) {
        slaBaselineRef.current = { ...s };
        setSlaForm({
          skilled_worker_days: String(s.skilled_worker_days ?? ""),
          ilr_days: String(s.ilr_days ?? ""),
          student_visa_days: String(s.student_visa_days ?? ""),
          escalation_stuck_days: String(s.escalation_stuck_days ?? ""),
          missing_docs_escalation_days: String(s.missing_docs_escalation_days ?? ""),
        });
      }
      showToast({ message: res.data?.message || "SLA settings saved." });
    } catch (e) {
      const msg = getApiError(e);
      setSlaTabError(msg);
      showToast({ message: msg, variant: "danger" });
    } finally {
      setSavingSla(false);
    }
  };

  const saveCurrentEmailTemplate = async () => {
    const draft = emailDrafts[emailTemplateKey] || { subject: "", body: "" };
    setSavingEmailTemplate(true);
    setEmailTabError("");
    try {
      const res = await updateEmailTemplate(emailTemplateKey, {
        subject: draft.subject,
        body: draft.body,
      });
      const t = res.data?.data?.template;
      if (t?.key) {
        setEmailDrafts((prev) => ({
          ...prev,
          [t.key]: { subject: t.subject ?? "", body: t.body ?? "" },
        }));
      }
      showToast({ message: res.data?.message || "Email template saved." });
    } catch (e) {
      const msg = getApiError(e);
      setEmailTabError(msg);
      showToast({ message: msg, variant: "danger" });
    } finally {
      setSavingEmailTemplate(false);
    }
  };

  const handleCancelAccount = async () => {
    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError("");
    await loadMe();
  };

  const refreshVisaTypes = async () => {
    const res = await getVisaTypes();
    setVisaTypes(res.data?.data?.visa_types ?? []);
  };

  const refreshPetitionTypes = async () => {
    const res = await getPetitionTypes();
    setPetitionTypes(res.data?.data?.petition_types ?? []);
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

  const submitVisaForm = async (e) => {
    e.preventDefault();
    const trimmed = visaFormName.trim();
    if (!trimmed) {
      setVisaFormError("Name is required");
      return;
    }
    setVisaFormError("");
    try {
      if (visaModalMode === "add") {
        await createVisaType({ name: trimmed });
        showToast({ message: "Visa type created." });
      } else if (editingVisaId != null) {
        await updateVisaType(editingVisaId, { name: trimmed });
        showToast({ message: "Visa type updated." });
      }
      await refreshVisaTypes();
      closeVisaModal();
    } catch (err) {
      setVisaFormError(getApiError(err));
      showToast({ message: getApiError(err), variant: "danger" });
    }
  };

  const removeVisa = async (id) => {
    if (!window.confirm("Delete this visa type?")) return;
    try {
      await deleteVisaType(id);
      await refreshVisaTypes();
      showToast({ message: "Visa type deleted." });
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    }
  };

  const openPetitionModalAdd = () => {
    setPetitionModalMode("add");
    setEditingPetitionId(null);
    setPetitionFormName("");
    setPetitionFormError("");
    setPetitionModalOpen(true);
  };

  const openPetitionModalEdit = (id) => {
    const row = petitionTypes.find((v) => v.id === id);
    if (!row) return;
    setPetitionModalMode("edit");
    setEditingPetitionId(id);
    setPetitionFormName(row.name);
    setPetitionFormError("");
    setPetitionModalOpen(true);
  };

  const closePetitionModal = () => {
    setPetitionModalOpen(false);
    setPetitionFormName("");
    setPetitionFormError("");
    setEditingPetitionId(null);
  };

  const submitPetitionForm = async (e) => {
    e.preventDefault();
    const trimmed = petitionFormName.trim();
    if (!trimmed) {
      setPetitionFormError("Name is required");
      return;
    }
    setPetitionFormError("");
    try {
      if (petitionModalMode === "add") {
        await createPetitionType({ name: trimmed });
        showToast({ message: "Petition type created." });
      } else if (editingPetitionId != null) {
        await updatePetitionType(editingPetitionId, { name: trimmed });
        showToast({ message: "Petition type updated." });
      }
      await refreshPetitionTypes();
      closePetitionModal();
    } catch (err) {
      setPetitionFormError(getApiError(err));
      showToast({ message: getApiError(err), variant: "danger" });
    }
  };

  const removePetition = async (id) => {
    if (!window.confirm("Delete this petition type?")) return;
    try {
      await deletePetitionType(id);
      await refreshPetitionTypes();
      showToast({ message: "Petition type deleted." });
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    }
  };

  const addCategory = async () => {
    const t = categoryInput.trim();
    if (!t) return;
    setCategorySaving(true);
    setCategoryTabError("");
    try {
      await createCaseCategory({ name: t });
      setCategoryInput("");
      const res = await getCaseCategories();
      setCategories(res.data?.data?.categories ?? []);
      showToast({ message: "Category added." });
    } catch (e) {
      const msg = getApiError(e);
      setCategoryTabError(msg);
      showToast({ message: msg, variant: "danger" });
    } finally {
      setCategorySaving(false);
    }
  };

  const removeCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteCaseCategory(id);
      const res = await getCaseCategories();
      setCategories(res.data?.data?.categories ?? []);
      showToast({ message: "Category deleted." });
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    }
  };

  const headerSaveDisabled =
    (configTab === "account" && (savingAccount || loadingMe)) ||
    (configTab === "sla" && (savingSla || loadingSlaTab)) ||
    (configTab === "email" && (savingEmailTemplate || loadingEmailTab));

  const profileInitials = `${(profile.first_name || "").trim().charAt(0)}${(profile.last_name || "").trim().charAt(0)}`.toUpperCase() || "?";

  const currentEmailDraft = emailDrafts[emailTemplateKey] || { subject: "", body: "" };

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
          <Button
            type="button"
            className="rounded-xl shadow-sm inline-flex items-center gap-2"
            onClick={handleHeaderSave}
            disabled={headerSaveDisabled}
          >
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
              {loadingMe ? (
                <PanelLoader />
              ) : (
                <>
                  {accountError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{accountError}</div>
                  )}
                  <div>
                    <h3 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Profile settings</h3>
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-2xl font-black text-secondary">{profileInitials}</span>
                          )}
                        </div>
                        <div>
                          <Button
                            type="button"
                            className="rounded-xl"
                            onClick={() => document.getElementById("avatar_url")?.focus?.()}
                          >
                            Change avatar
                          </Button>
                          <p className="mt-1 text-xs text-gray-500">JPG, GIF or PNG. Max size of 2MB</p>
                        </div>
                      </div>
                      <Input
                        label="Avatar URL"
                        name="avatar_url"
                        value={profile.avatar_url}
                        onChange={handleProfile}
                        placeholder="https://…"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="First name" name="first_name" value={profile.first_name} onChange={handleProfile} />
                        <Input label="Last name" name="last_name" value={profile.last_name} onChange={handleProfile} />
                      </div>
                      <Input label="Email address" name="email" type="email" value={profile.email} onChange={handleProfile} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Country code" name="country_code" value={profile.country_code} onChange={handleProfile} placeholder="+1" />
                        <Input label="Mobile" name="mobile" value={profile.mobile} onChange={handleProfile} />
                      </div>
                      <Input label="Role" name="role_name" value={profile.role_name} onChange={() => {}} readOnly />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Security settings</h3>
                    <form onSubmit={submitPasswordChange} className="space-y-6">
                      {passwordError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{passwordError}</div>
                      )}
                      <Input
                        label="Current password"
                        name="currentPassword"
                        type="password"
                        value={security.currentPassword}
                        onChange={handleSecurity}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="New password" name="newPassword" type="password" value={security.newPassword} onChange={handleSecurity} />
                        <Input label="Confirm new password" name="confirmPassword" type="password" value={security.confirmPassword} onChange={handleSecurity} />
                      </div>
                      <Button type="submit" className="rounded-xl" disabled={savingPassword}>
                        {savingPassword ? "Updating…" : "Update password"}
                      </Button>
                    </form>
                    <div className="space-y-3 mt-8 pt-6 border-t border-gray-100">
                      <p className="text-sm font-black text-secondary">Two-factor authentication</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {preferences.two_factor_enabled ? "2FA is enabled" : "2FA is disabled"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {preferences.two_factor_enabled ? "Your account is protected with 2FA" : "Enable 2FA for enhanced security"}
                          </p>
                        </div>
                        {preferences.two_factor_enabled ? (
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

                  <div>
                    <h3 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Notification preferences</h3>
                    <div className="space-y-5">
                      {[
                        { key: "email_notifications", label: "Email notifications", desc: "Receive notifications via email" },
                        { key: "case_updates", label: "Case updates", desc: "Get notified about case status changes" },
                        { key: "payment_alerts", label: "Payment alerts", desc: "Receive payment due and overdue notifications" },
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-secondary">{label}</p>
                            <p className="text-xs text-gray-500">{desc}</p>
                          </div>
                          <Toggle on={preferences[key]} onToggle={() => togglePreference(key)} />
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
                        <select
                          id="sys-tz"
                          name="timezone"
                          value={preferences.timezone}
                          onChange={handlePreferenceSelect}
                          className={selectClass}
                        >
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
                        <select
                          id="sys-lang"
                          name="language"
                          value={preferences.language}
                          onChange={handlePreferenceSelect}
                          className={selectClass}
                        >
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
                        <select
                          id="sys-df"
                          name="date_format"
                          value={preferences.date_format}
                          onChange={handlePreferenceSelect}
                          className={selectClass}
                        >
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
                          <Toggle on={preferences.data_collection} onToggle={() => togglePreference("data_collection")} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2 border-t border-gray-100">
                    <Button type="button" variant="ghost" className="rounded-xl w-full sm:w-auto" onClick={handleCancelAccount} disabled={loadingMe}>
                      Cancel
                    </Button>
                    <Button type="button" className="rounded-xl w-full sm:w-auto" onClick={saveProfile} disabled={savingAccount || loadingMe}>
                      {savingAccount ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {configTab === "visa" && (
            <motion.div key="visa" className="p-5 sm:p-6 space-y-10" {...panelMotion}>
              {loadingVisaTab ? (
                <PanelLoader />
              ) : (
                <>
                  {(visaTabError || petitionTabError) && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{visaTabError || petitionTabError}</div>
                  )}
                  <div>
                    <h3 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Visa types</h3>
                    <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto] gap-2 text-[11px] font-black uppercase tracking-wide text-gray-400 px-1 mb-2">
                      <span>Name</span>
                      <span className="text-center">Sort</span>
                      <span className="text-right">Actions</span>
                    </div>
                    <div className="flex flex-col gap-2.5 mb-5">
                      {visaTypes.map((row) => (
                        <div
                          key={row.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100"
                        >
                          <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4 min-w-0 flex-1">
                            <span className="text-sm font-semibold text-secondary truncate">{row.name}</span>
                            <span className="text-xs font-bold text-gray-500 sm:text-center">{row.sort_order ?? "—"}</span>
                          </div>
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
                            <Button
                              type="button"
                              variant="danger"
                              className="rounded-xl text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                              onClick={() => removeVisa(row.id)}
                            >
                              <FiTrash2 size={14} aria-hidden />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                      {visaTypes.length === 0 && <p className="text-sm text-gray-500">No visa types yet.</p>}
                    </div>
                    <Button type="button" className="rounded-xl inline-flex items-center gap-2" onClick={openVisaModalAdd}>
                      <FiPlus size={16} aria-hidden />
                      Add visa type
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Petition types</h3>
                    <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto] gap-2 text-[11px] font-black uppercase tracking-wide text-gray-400 px-1 mb-2">
                      <span>Name</span>
                      <span className="text-center">Sort</span>
                      <span className="text-right">Actions</span>
                    </div>
                    <div className="flex flex-col gap-2.5 mb-5">
                      {petitionTypes.map((row) => (
                        <div
                          key={row.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100"
                        >
                          <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4 min-w-0 flex-1">
                            <span className="text-sm font-semibold text-secondary truncate">{row.name}</span>
                            <span className="text-xs font-bold text-gray-500 sm:text-center">{row.sort_order ?? "—"}</span>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              className="rounded-xl text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                              onClick={() => openPetitionModalEdit(row.id)}
                            >
                              <FiEdit2 size={14} aria-hidden />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              className="rounded-xl text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                              onClick={() => removePetition(row.id)}
                            >
                              <FiTrash2 size={14} aria-hidden />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                      {petitionTypes.length === 0 && <p className="text-sm text-gray-500">No petition types yet.</p>}
                    </div>
                    <Button type="button" className="rounded-xl inline-flex items-center gap-2" onClick={openPetitionModalAdd}>
                      <FiPlus size={16} aria-hidden />
                      Add petition type
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {configTab === "categories" && (
            <motion.div key="categories" className="p-5 sm:p-6" {...panelMotion}>
              {loadingCategories ? (
                <PanelLoader />
              ) : (
                <>
                  <h3 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Case categories</h3>
                  {categoryTabError && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{categoryTabError}</div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                    <Input
                      label="Add category"
                      name="category"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      placeholder="e.g. Urgent, VIP, Government…"
                      className="flex-1"
                    />
                    <div className="sm:pt-6">
                      <Button type="button" className="rounded-xl w-full sm:w-auto" onClick={addCategory} disabled={categorySaving}>
                        {categorySaving ? "Adding…" : "Add"}
                      </Button>
                    </div>
                  </div>
                  {categories.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <li
                          key={c.id}
                          className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-xs font-bold bg-secondary/10 text-secondary border border-secondary/20"
                        >
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() => removeCategory(c.id)}
                            className="rounded-full p-1 text-red-600 hover:bg-red-50"
                            aria-label={`Delete ${c.name}`}
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </motion.div>
          )}

          {configTab === "roles" && (
            <motion.div key="roles" className="p-5 sm:p-6" {...panelMotion}>
              <h3 className="text-sm font-black text-secondary pb-3 mb-2 border-b border-gray-100">Role permissions</h3>
              <p className="text-sm text-gray-500 mb-5 max-w-2xl leading-relaxed">
                Configure role-level defaults. Use the permissions area for the full RBAC matrix.
              </p>
              <Link to="/admin/permissions" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                Go to permissions &amp; RBAC
                <FiArrowRight size={16} aria-hidden />
              </Link>
            </motion.div>
          )}

          {configTab === "email" && (
            <motion.div key="email" className="p-5 sm:p-6 space-y-4" {...panelMotion}>
              {loadingEmailTab ? (
                <PanelLoader />
              ) : (
                <>
                  <h3 className="text-sm font-black text-secondary pb-3 mb-2 border-b border-gray-100">Email templates</h3>
                  {emailTabError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{emailTabError}</div>
                  )}
                  <Input
                    label="Template"
                    name="emailTemplate"
                    value={emailTemplateKey}
                    onChange={(e) => setEmailTemplateKey(e.target.value)}
                    options={EMAIL_TEMPLATE_OPTIONS}
                  />
                  <Input
                    label="Subject"
                    name="emailSubject"
                    value={currentEmailDraft.subject}
                    onChange={(e) =>
                      setEmailDrafts((prev) => ({
                        ...prev,
                        [emailTemplateKey]: { ...currentEmailDraft, subject: e.target.value },
                      }))
                    }
                  />
                  <div className="flex flex-col gap-1">
                    <label htmlFor="email-body" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      Body
                    </label>
                    <textarea
                      id="email-body"
                      value={currentEmailDraft.body}
                      onChange={(e) =>
                        setEmailDrafts((prev) => ({
                          ...prev,
                          [emailTemplateKey]: { ...currentEmailDraft, body: e.target.value },
                        }))
                      }
                      rows={8}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-y min-h-[160px]"
                    />
                  </div>
                  <Button type="button" className="rounded-xl" onClick={saveCurrentEmailTemplate} disabled={savingEmailTemplate}>
                    {savingEmailTemplate ? "Saving…" : "Save template"}
                  </Button>
                </>
              )}
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
              {loadingSlaTab ? (
                <PanelLoader />
              ) : (
                <>
                  <h3 className="text-sm font-black text-secondary pb-3 mb-2 border-b border-gray-100">SLA rules</h3>
                  {slaTabError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{slaTabError}</div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                    <Input
                      label="Skilled worker — target days"
                      name="slaSkilled"
                      type="number"
                      value={slaForm.skilled_worker_days}
                      onChange={(e) => setSlaForm((f) => ({ ...f, skilled_worker_days: e.target.value }))}
                    />
                    <Input
                      label="ILR — target days"
                      name="slaIlr"
                      type="number"
                      value={slaForm.ilr_days}
                      onChange={(e) => setSlaForm((f) => ({ ...f, ilr_days: e.target.value }))}
                    />
                    <Input
                      label="Student visa — target days"
                      name="slaStudent"
                      type="number"
                      value={slaForm.student_visa_days}
                      onChange={(e) => setSlaForm((f) => ({ ...f, student_visa_days: e.target.value }))}
                    />
                    <Input
                      label="Escalation trigger (days stuck)"
                      name="slaEscalation"
                      type="number"
                      value={slaForm.escalation_stuck_days}
                      onChange={(e) => setSlaForm((f) => ({ ...f, escalation_stuck_days: e.target.value }))}
                    />
                    <Input
                      label="Missing docs escalation (days)"
                      name="slaMissingDocs"
                      type="number"
                      value={slaForm.missing_docs_escalation_days}
                      onChange={(e) => setSlaForm((f) => ({ ...f, missing_docs_escalation_days: e.target.value }))}
                    />
                  </div>
                  <Button type="button" className="rounded-xl" onClick={saveSlaRules} disabled={savingSla}>
                    {savingSla ? "Saving…" : "Save SLA rules"}
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal
        open={visaModalOpen}
        onClose={closeVisaModal}
        title={visaModalMode === "add" ? "Add visa type" : "Edit visa type"}
        maxWidthClass="max-w-md"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button type="button" variant="ghost" className="rounded-xl" onClick={closeVisaModal}>
              Cancel
            </Button>
            <Button type="submit" form={VISA_FORM_ID} className="rounded-xl">
              {visaModalMode === "add" ? "Add" : "Save"}
            </Button>
          </>
        }
      >
        <form id={VISA_FORM_ID} onSubmit={submitVisaForm} className="space-y-4">
          <Input
            label="Visa type name"
            name="visaName"
            value={visaFormName}
            onChange={(e) => {
              setVisaFormName(e.target.value);
              if (visaFormError) setVisaFormError("");
            }}
            placeholder="e.g. Skilled Worker Visa"
            required
            error={visaFormError}
          />
        </form>
      </Modal>

      <Modal
        open={petitionModalOpen}
        onClose={closePetitionModal}
        title={petitionModalMode === "add" ? "Add petition type" : "Edit petition type"}
        maxWidthClass="max-w-md"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button type="button" variant="ghost" className="rounded-xl" onClick={closePetitionModal}>
              Cancel
            </Button>
            <Button type="submit" form={PETITION_FORM_ID} className="rounded-xl">
              {petitionModalMode === "add" ? "Add" : "Save"}
            </Button>
          </>
        }
      >
        <form id={PETITION_FORM_ID} onSubmit={submitPetitionForm} className="space-y-4">
          <Input
            label="Petition type name"
            name="petitionName"
            value={petitionFormName}
            onChange={(e) => {
              setPetitionFormName(e.target.value);
              if (petitionFormError) setPetitionFormError("");
            }}
            placeholder="e.g. I-129 Petition"
            required
            error={petitionFormError}
          />
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
            onSetupComplete={() => {
              setTwoFactorModalOpen(false);
              loadMe();
            }}
            onCancel={() => setTwoFactorModalOpen(false)}
          />
        ) : (
          <TwoFactorDisable
            onDisableComplete={() => {
              setTwoFactorModalOpen(false);
              loadMe();
            }}
            onCancel={() => setTwoFactorModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}
