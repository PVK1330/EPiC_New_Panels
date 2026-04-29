import { useState, useEffect } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiPlus,
  FiDownload,
  FiUpload,
  FiCheck,
  FiEye,
  FiChevronDown,
  FiFolder,
  FiChevronUp,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";
import useCandidate from "../../hooks/useCandidate";
import { useToast } from "../../context/ToastContext";
import CandidateApplicationForm from "../../components/CandidateApplicationForm/CandidateApplicationForm";
import {
  APPLICATION_FIELD_LABELS,
  getInitialApplicationFormData,
  loadFieldVisibilityFromStorage,
  saveFieldVisibilityToStorage,
  loadCustomFieldDefinitionsFromStorage,
  saveCustomFieldDefinitionsToStorage,
  createCustomFieldDefinition,
  CUSTOM_FIELD_TYPE_OPTIONS,
} from "../../components/CandidateApplicationForm/initialFormState";
import {
  mapApplicationToCandidateRow,
  candidateRowToApplicationForm,
  pruneCustomResponsesToDefinitions,
} from "../../components/CandidateApplicationForm/applicationFormMapping";
import {
  createCandidate,
  updateCandidate,
  toggleCandidateStatus,
  deleteCandidate,
  bulkImportCandidates,
  exportCandidates,
  getCandidateById,
} from "../../services/candidateApi";

const PASSWORD_MIN = 6;

const ROLE_CHIPS = {
  candidate: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
};

const CASE_CHIPS = {
  "On Track": "bg-green-100 text-green-700",
  "Due Soon": "bg-yellow-100 text-yellow-700",
  "Overdue": "bg-red-100 text-red-600",
  "In Review": "bg-blue-100 text-blue-700",
  "Completed": "bg-gray-100 text-gray-600",
  "On Hold": "bg-orange-100 text-orange-600",
};

const PAYMENT_CHIPS = {
  "Paid": "bg-green-100 text-green-700",
  "Partial": "bg-yellow-100 text-yellow-700",
  "Outstanding": "bg-red-100 text-red-600",
  "Waived": "bg-gray-100 text-gray-500",
};

const VISA_CHIPS = {
  "Skilled Worker": "bg-blue-100 text-blue-700",
  "Student Visa": "bg-purple-100 text-purple-700",
  "ILR": "bg-indigo-100 text-indigo-700",
  "Graduate Visa": "bg-yellow-100 text-yellow-700",
  "Sponsor Licence": "bg-teal-100 text-teal-700",
  "Global Talent": "bg-cyan-100 text-cyan-700",
  "Family Visa": "bg-pink-100 text-pink-700",
  "Youth Mobility": "bg-lime-100 text-lime-700",
  "Visitor Visa": "bg-orange-100 text-orange-700",
};

const STATUS_CHIPS = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
};

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
];

const ROLE_OPTIONS = [{ value: "3", label: "Candidate" }];

const VISA_TYPE_OPTIONS = [
  { value: "Skilled Worker", label: "Skilled Worker" },
  { value: "Student Visa", label: "Student Visa" },
  { value: "ILR", label: "ILR — Indefinite Leave to Remain" },
  { value: "Graduate Visa", label: "Graduate Visa" },
  { value: "Sponsor Licence", label: "Sponsor Licence" },
  { value: "Global Talent", label: "Global Talent Visa" },
  { value: "Family Visa", label: "Family Visa" },
  { value: "Youth Mobility", label: "Youth Mobility Scheme" },
  { value: "Visitor Visa", label: "Visitor Visa" },
  { value: "Other", label: "Other" },
];

const CASE_STATUS_OPTIONS = [
  { value: "On Track", label: "On Track" },
  { value: "Due Soon", label: "Due Soon" },
  { value: "Overdue", label: "Overdue" },
  { value: "In Review", label: "In Review" },
  { value: "Completed", label: "Completed" },
  { value: "On Hold", label: "On Hold" },
];

const PAYMENT_OPTIONS = [
  { value: "Paid", label: "Paid in Full" },
  { value: "Partial", label: "Partial Payment" },
  { value: "Outstanding", label: "Outstanding" },
  { value: "Waived", label: "Waived" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "All", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const EDIT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const EMPTY_CREATE = {
  first_name: "",
  last_name: "",
  email: "",
  country_code: "+44",
  mobile: "",
  role_id: "3",
  password: "",
  confirm_password: "",
};


function getApiError(error) {
  const d = error?.response?.data;
  const m = d?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m) && m.length) return m[0];
  return error?.message || "Something went wrong";
}

function displayRoleName(row) {
  const n = row?.Role?.name;
  if (!n) return "Candidate";
  return n.charAt(0).toUpperCase() + n.slice(1);
}

function formatStatusLabel(status) {
  if (status === "active") return "Active";
  if (status === "inactive") return "Inactive";
  return status || "—";
}

function initialsFrom(row) {
  const a = (row.first_name || "").trim().charAt(0);
  const b = (row.last_name || "").trim().charAt(0);
  const s = `${a}${b}`.toUpperCase();
  return s || "?";
}

function fullName(row) {
  return `${row.first_name || ""} ${row.last_name || ""}`.trim() || "—";
}

function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminCandidates() {
  const { showToast } = useToast();
  const { candidates, pagination, loading, fetchCandidates } = useCandidate();

  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [visaFilter, setVisaFilter] = useState("All");
  const [payFilter, setPayFilter] = useState("All");

  const [modal, setModal] = useState({ type: null, data: null });
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [editForm, setEditForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [detailTab, setDetailTab] = useState("overview");
  const [applicationForm, setApplicationForm] = useState(getInitialApplicationFormData);
  const [fieldVisibility, setFieldVisibility] = useState(loadFieldVisibilityFromStorage);
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState(
    loadCustomFieldDefinitionsFromStorage
  );
  const [fieldPanelOpen, setFieldPanelOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toggleId, setToggleId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { saveFieldVisibilityToStorage(fieldVisibility); }, [fieldVisibility]);
  useEffect(() => { saveCustomFieldDefinitionsToStorage(customFieldDefinitions); }, [customFieldDefinitions]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, visaFilter, payFilter]);

  const statusParam = statusFilter === "All" ? "" : statusFilter;
  const visaParam = visaFilter === "All" ? "" : visaFilter;
  const payParam = payFilter === "All" ? "" : payFilter;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetchCandidates(
        page,
        limit,
        debouncedSearch.trim(),
        statusParam,
        visaParam,
        payParam,
      );
      if (cancelled) return;
      if (!r.ok) {
        showToast({ message: getApiError(r.error), variant: "danger" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    page,
    debouncedSearch,
    statusFilter,
    visaFilter,
    payFilter,
    fetchCandidates,
    showToast,
    statusParam,
    visaParam,
    payParam,
  ]);

  const toggleFieldVisibility = (key) =>
    setFieldVisibility((prev) => ({ ...prev, [key]: prev[key] === false }));

  const addCustomFieldRow = () =>
    setCustomFieldDefinitions((prev) => [...prev, createCustomFieldDefinition()]);

  const updateCustomFieldRow = (id, patch) =>
    setCustomFieldDefinitions((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const removeCustomFieldRow = (id) =>
    setCustomFieldDefinitions((prev) => prev.filter((d) => d.id !== id));

  const closeModal = () => {
    setModal({ type: null, data: null });
    setCreateForm(EMPTY_CREATE);
    setEditForm(null);
    setErrors({});
    setDetailTab("overview");
  };

  const openCreate = () => {
    setApplicationForm(getInitialApplicationFormData());
    setErrors({});
    setModal({ type: "create", data: null });
  };

  const openEdit = async (row) => {
    try {
      console.log("Edit candidate data:", row);
      
      // Fetch complete candidate data with application details
      const res = await getCandidateById(row.id);
      const candidateData = res.data?.data?.candidate;
      
      if (candidateData) {
        console.log("Fetched candidate data:", candidateData);
        const mappedForm = candidateRowToApplicationForm(candidateData);
        console.log("Mapped form data:", mappedForm);
        setApplicationForm(mappedForm);
        setErrors({});
        setModal({ type: "edit", data: candidateData });
      } else {
        showToast({ message: "Failed to load candidate data", variant: "danger" });
      }
    } catch (error) {
      console.error("Error fetching candidate data:", error);
      showToast({ message: getApiError(error), variant: "danger" });
    }
  };

  const openView = async (row) => {
    try {
      console.log("View candidate data:", row);
      
      // Fetch complete candidate data with application details
      const res = await getCandidateById(row.id);
      const candidateData = res.data?.data?.candidate;
      
      if (candidateData) {
        console.log("Fetched candidate data for view:", candidateData);
        const mappedForm = candidateRowToApplicationForm(candidateData);
        setApplicationForm(mappedForm);
        setErrors({});
        setModal({ type: "view", data: candidateData });
      } else {
        showToast({ message: "Failed to load candidate data", variant: "danger" });
      }
    } catch (error) {
      console.error("Error fetching candidate data for view:", error);
      showToast({ message: getApiError(error), variant: "danger" });
    }
  };

  const openDelete = (row) => {
    setModal({ type: "delete", data: row });
  };


  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };


  const validateCreate = () => {
    const errs = {};
    if (!createForm.first_name.trim()) errs.first_name = "First name is required";
    if (!createForm.last_name.trim()) errs.last_name = "Last name is required";
    if (!createForm.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(createForm.email))
      errs.email = "Enter a valid email";
    if (!createForm.country_code.trim())
      errs.country_code = "Country code is required";
    if (!createForm.mobile.trim()) errs.mobile = "Mobile is required";
    if (!createForm.password) errs.password = "Password is required";
    else if (createForm.password.length < PASSWORD_MIN)
      errs.password = `Password must be at least ${PASSWORD_MIN} characters`;
    if (!createForm.confirm_password)
      errs.confirm_password = "Please confirm password";
    else if (createForm.password !== createForm.confirm_password)
      errs.confirm_password = "Passwords do not match";
    return errs;
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.first_name.trim()) errs.first_name = "First name is required";
    if (!editForm.last_name.trim()) errs.last_name = "Last name is required";
    if (!editForm.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(editForm.email))
      errs.email = "Enter a valid email";
    if (!editForm.country_code.trim())
      errs.country_code = "Country code is required";
    if (!editForm.mobile.trim()) errs.mobile = "Mobile is required";
    return errs;
  };

  const validateApplication = (payload) => {
    const errs = [];
    if (!payload.firstName?.toString().trim()) errs.push("First name is required");
    if (!payload.lastName?.toString().trim()) errs.push("Last name is required");
    if (!payload.email?.toString().trim()) errs.push("Email is required");
    else if (!/\S+@\S+\.\S+/.test(payload.email)) errs.push("Enter a valid email");
    return errs;
  };

  const handleApplicationSave = (payload) => {
    const errs = validateApplication(payload);
    if (errs.length) { alert(errs.join("\n")); return; }

    const rowExtras = modal.type === "edit" && modal.data
      ? {
          caseStatus:      modal.data.cases?.[0]?.status || "On Track",
          paymentStatus:   modal.data.cases?.[0]?.paymentStatus || "Outstanding",
        }
      : {};

    const payloadClean = pruneCustomResponsesToDefinitions(payload, customFieldDefinitions);
    const mapped  = mapApplicationToCandidateRow(payloadClean, { 
      ...rowExtras, 
      isNewApplication: modal.type === "create" 
    });
    
    // Use the mapped fields - now separated into user data and application data
    const backendData = {
      // Core user fields
      first_name: mapped.userData.first_name,
      last_name: mapped.userData.last_name,
      email: mapped.userData.email,
      country_code: mapped.userData.country_code || "+44",
      mobile: mapped.userData.mobile,
      role_id: 3,
      password: payload.password || "",
      confirm_password: payload.confirmPassword || "",
      
      // Legacy/CRM fields for compatibility
      phone: mapped.userData.phone,
      passportExpiry: mapped.userData.passportExpiry,
      visaExpiry: mapped.userData.visaExpiry,
      countryOfBirth: mapped.userData.countryOfBirth,
      
      // Case-related fields
      caseStatus: mapped.userData.caseStatus,
      rightToWork: mapped.userData.rightToWork,
      jobTitle: mapped.userData.jobTitle,
      linkedBusiness: mapped.userData.linkedBusiness,
      employmentStart: mapped.userData.employmentStart,
      paymentStatus: mapped.userData.paymentStatus,
      feeAmount: mapped.userData.feeAmount,
      city: mapped.userData.city,
      postcode: mapped.userData.postcode,
      country: mapped.userData.country,
      
      // Store complete application data as backup
      applicationData: mapped.userData.applicationData,
      
      // Application data for child table
      application: mapped.applicationData,
    };

    if (modal.type === "create") {
      handleCreateWithApplication(backendData);
    } else if (modal.type === "edit" && modal.data) {
      handleUpdateWithApplication(modal.data.id, backendData);
    }
  };

  const handleCreateWithApplication = async (data) => {
    setSaving(true);
    try {
      // Debug: Log the data being sent
      console.log("Sending to API:", data);
      
      const res = await createCandidate(data);
      showToast({
        message: res.data?.message || "Candidate created successfully",
        variant: "success",
      });
      closeModal();
      if (page !== 1) setPage(1);
      else {
        const r = await fetchCandidates(
          1,
          limit,
          debouncedSearch.trim(),
          statusParam,
          visaParam,
          payParam,
        );
        if (!r.ok) {
          showToast({ message: getApiError(r.error), variant: "danger" });
        }
      }
    } catch (e) {
      console.error("API Error:", e);
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateWithApplication = async (id, data) => {
    setSaving(true);
    try {
      console.log("Updating candidate with data:", data);
      const res = await updateCandidate(id, data);
      showToast({
        message: res.data?.message || "Candidate updated successfully",
        variant: "success",
      });
      closeModal();
      const r = await fetchCandidates(
        page,
        limit,
        debouncedSearch.trim(),
        statusParam,
        visaParam,
        payParam,
      );
      if (!r.ok) {
        showToast({ message: getApiError(r.error), variant: "danger" });
      }
    } catch (e) {
      console.error("Update error:", e);
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setSaving(false);
    }
  };


  const handleToggle = async (row) => {
    setToggleId(row.id);
    try {
      const res = await toggleCandidateStatus(row.id);
      showToast({
        message: res.data?.message || "Status updated",
        variant: "success",
      });
      {
        const r = await fetchCandidates(
          page,
          limit,
          debouncedSearch.trim(),
          statusParam,
        );
        if (!r.ok) {
          showToast({ message: getApiError(r.error), variant: "danger" });
        }
      }
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setToggleId(null);
    }
  };


  const handleDelete = async () => {
    setDeleteId(modal.data.id);
    try {
      const res = await deleteCandidate(modal.data.id);
      showToast({
        message: res.data?.message || "Candidate removed",
        variant: "success",
      });
      closeModal();
      const nextPage =
        candidates.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      else {
        const r = await fetchCandidates(
          nextPage,
          limit,
          debouncedSearch.trim(),
          statusParam,
        );
        if (!r.ok) {
          showToast({ message: getApiError(r.error), variant: "danger" });
        }
      }
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setDeleteId(null);
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) {
      showToast({ message: "Please select a CSV file", variant: "danger" });
      return;
    }

    setImporting(true);
    try {
      const res = await bulkImportCandidates(importFile);
      const { successful, failed, total_processed, results } = res.data?.data || {};
      
      showToast({
        message: `Bulk import completed: ${successful} successful, ${failed} failed out of ${total_processed}`,
        variant: successful > 0 ? "success" : "danger",
      });
      
      // Refresh the list
      const r = await fetchCandidates(
        page,
        limit,
        debouncedSearch.trim(),
        statusParam,
      );
      if (!r.ok) {
        showToast({ message: getApiError(r.error), variant: "danger" });
      }
      
      setImportFile(null);
      closeModal();
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = [
      'first_name,last_name,email,country_code,mobile',
      'John,Doe,john.doe@example.com,+1,5551234567',
      'Jane,Smith,jane.smith@example.com,+1,5559876543',
      'Michael,Johnson,michael.j@example.com,+44,2079460123',
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_candidates_import.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportCandidates({
        search: debouncedSearch.trim(),
        status: statusParam,
        visaType: visaParam,
        paymentStatus: payParam,
      });
      
      // Create a blob from the response
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidates_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast({
        message: "Candidates exported successfully",
        variant: "success",
      });
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setExporting(false);
    }
  };

  const isFormModal = modal.type === "create" || modal.type === "edit";
  const totalPages = pagination.pages || 1;
  const startIdx =
    pagination.total === 0 ? 0 : (page - 1) * pagination.limit + 1;
  const endIdx = Math.min(page * pagination.limit, pagination.total);

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-[#004ca5] tracking-tight">Clients / Candidates</h1>
          <p className="text-sm text-gray-500 mt-0.5">All registered clients and their case details</p>
        </div>
        <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setFieldPanelOpen((o) => !o)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            Application form fields
            {fieldPanelOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button 
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FiDownload size={14} />
              )}
              Export
            </button>
            <button
              type="button"
              onClick={() => setModal({ type: "import" })}
              disabled={importing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#c8102e] rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FiUpload size={14} />
              )}
              Import Data
            </button>
            <Button onClick={openCreate} className="rounded-xl shadow-sm bg-[#c8102e] hover:bg-[#a50d26]">
              <FiPlus size={14} />
              Add Client
            </Button>
          </div>
        </div>
      </div>

      {/* Field Visibility Panel */}
      {fieldPanelOpen && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-6">
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">
              Choose which built-in application inputs are visible to candidates (and in the admin stepper). Preferences are saved in this browser.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[min(50vh,28rem)] overflow-y-auto pr-1">
              {Object.entries(APPLICATION_FIELD_LABELS).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-indigo-600 shrink-0"
                    checked={fieldVisibility[key] !== false}
                    onChange={() => toggleFieldVisibility(key)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-bold text-gray-800 mb-1">Custom fields</p>
            <p className="text-xs text-gray-500 mb-3">
              Add extra questions (short text, long text, date, or number). They appear under "Additional information" on the last step.
            </p>
            <div className="space-y-2">
              {customFieldDefinitions.map((def) => (
                <div
                  key={def.id}
                  className="flex flex-col sm:flex-row sm:flex-wrap gap-2 items-stretch sm:items-end rounded-xl border border-gray-100 bg-gray-50/80 p-3"
                >
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Question label</label>
                    <input
                      type="text"
                      value={def.label}
                      onChange={(e) => updateCustomFieldRow(def.id, { label: e.target.value })}
                      placeholder="e.g. Previous UK employer name"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div className="w-full sm:w-40">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Input type</label>
                    <select
                      value={def.type}
                      onChange={(e) => updateCustomFieldRow(def.id, { type: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      {CUSTOM_FIELD_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomFieldRow(def.id)}
                    className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addCustomFieldRow}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-black text-indigo-600 hover:bg-indigo-100"
            >
              <FiPlus size={16} />
              Add another field
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Total Clients</p>
          <p className="text-3xl font-black text-blue-600">{pagination.total || 0}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Active Cases</p>
          <p className="text-3xl font-black text-green-600">{candidates.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Visa Expiry Alerts</p>
          <p className="text-3xl font-black text-red-500">0</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Outstanding Fees</p>
          <p className="text-3xl font-black text-yellow-600">£0</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, nationality…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={visaFilter} onChange={(e) => setVisaFilter(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-600">
              <option value="All">All Visa Types</option>
              {VISA_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-600">
              <option value="All">All Status</option>
              {STATUS_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={payFilter} onChange={(e) => setPayFilter(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-600">
              <option value="All">All Payment Status</option>
              {PAYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[200px] relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <Loader2 className="w-10 h-10 animate-spin text-secondary" />
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Name","Status","DOB","Nationality","Linked Business","Visa Type","Case Status","Visa Expiry","Payment","Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && candidates.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-sm text-gray-400">
                    No clients match your search.
                  </td>
                </tr>
              ) : (
                candidates.map((c, idx) => {
                  // Use application data from CandidateApplication table
                  const app = c.application || {};
                  const dob = app.dob ? formatDate(app.dob) : c.dob ? formatDate(c.dob) : '—';
                  const visaType = app.visaType || c.cases?.[0]?.visaType || '—';
                  const caseStatus = c.cases?.[0]?.status || '—';
                  const visaExpiry = app.visaEndDate || c.cases?.[0]?.visaExpiry ? formatDate(app.visaEndDate || c.cases[0].visaExpiry) : '—';
                  const paymentStatus = c.cases?.[0]?.paymentStatus || '—';
                  const linkedBusiness = c.cases?.[0]?.businessName || '—';
                  const nationality = app.nationality || c.nationality || '—';
                  
                  return (
                    <tr key={`${c.id}-${idx}`} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                            {initialsFrom(c)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">{fullName(c)}</p>
                            <p className="text-[11px] text-gray-400 whitespace-nowrap">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggle(c)}
                          className={`relative z-10 px-2.5 py-1 rounded-full text-[11px] font-black cursor-pointer hover:opacity-80 transition-opacity ${STATUS_CHIPS[c.status] ?? "bg-gray-100 text-gray-500"}`}
                          title={`Click to ${c.status === 'active' ? 'deactivate' : 'activate'} candidate`}
                        >
                          {formatStatusLabel(c.status)}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap font-mono">{dob}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{nationality}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{linkedBusiness}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${VISA_CHIPS[visaType] ?? "bg-gray-100 text-gray-500"}`}>
                          {visaType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${CASE_CHIPS[caseStatus] ?? "bg-gray-100 text-gray-500"}`}>
                          {caseStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono whitespace-nowrap text-gray-500">{visaExpiry}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${PAYMENT_CHIPS[paymentStatus] ?? "bg-gray-100 text-gray-500"}`}>
                          {paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 relative z-10">
                          <button onClick={() => openView(c)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">  <FiEye    size={14} /></button>
                          <button onClick={() => openEdit(c)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">  <FiEdit2  size={14} /></button>
                          <button onClick={() => openDelete(c)} className="p-2 text-gray-400 hover:text-red-500   hover:bg-red-50    rounded-lg transition-colors" title="Delete"><FiTrash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            Showing <span className="font-bold text-indigo-600">{candidates.length}</span> of{" "}
            <span className="font-bold text-indigo-600">{pagination.total}</span> clients
          </p>
        </div>
      </div>

      <Modal
        open={isFormModal}
        onClose={closeModal}
        title={modal.type === "create" ? "Add New Client" : "Edit Client"}
        maxWidthClass="max-w-5xl"
        bodyClassName="px-4 py-4 sm:px-6 sm:py-5"
      >
        {isFormModal && (
          <CandidateApplicationForm
            key={modal.type === "create" ? "create" : String(modal.data?.id)}
            variant="admin"
            embedded
            fieldVisibility={fieldVisibility}
            customFieldDefinitions={customFieldDefinitions}
            formData={applicationForm}
            setFormData={setApplicationForm}
            onAdminSubmit={handleApplicationSave}
            onAdminCancel={closeModal}
          />
        )}
      </Modal>

      <Modal
        open={modal.type === "view"}
        onClose={() => { closeModal(); setDetailTab("overview"); }}
        title={modal.data ? `Client — ${fullName(modal.data)}` : ""}
        maxWidthClass="max-w-4xl"
        bodyClassName="p-0"
      >
        {modal.data && (() => {
          const c = modal.data;
          const app = c.application || {};
          const dob = formatDate(app.dob || c.dob);
          const visaType = app.visaType || c.cases?.[0]?.visaType || '—';
          const caseStatus = c.cases?.[0]?.status || '—';
          const paymentStatus = c.cases?.[0]?.paymentStatus || '—';
          return (
            <>
              <div className="shrink-0 border-b border-gray-100 px-4 sm:px-6 py-4 bg-gray-50/80 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-black text-gray-900">{fullName(c)}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${CASE_CHIPS[caseStatus] ?? "bg-gray-100 text-gray-500"}`}>{caseStatus}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${PAYMENT_CHIPS[paymentStatus] ?? "bg-gray-100 text-gray-500"}`}>{paymentStatus}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-50"
                >
                  Edit client
                </button>
              </div>

              <div className="shrink-0 flex gap-0 overflow-x-auto border-b border-gray-100 bg-gray-50/50 px-2 no-scrollbar">
                {[
                  { id: "overview",       label: "Overview"      },
                  { id: "documents",      label: "Documents"     },
                  { id: "immigration",    label: "Immigration"   },
                  { id: "employment",     label: "Employment"    },
                  { id: "address",        label: "Address"       },
                  { id: "timeline",       label: "Timeline"      },
                  { id: "communications", label: "Communication" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDetailTab(t.id)}
                    className={`shrink-0 border-b-2 px-3 sm:px-4 py-3 text-xs font-black transition-colors whitespace-nowrap ${
                      detailTab === t.id
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
                {detailTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-wide mb-3">Personal Information</h4>
                        <div className="space-y-3">
                          {[
                            ["Full Name",    fullName(c)],
                            ["Date of Birth", dob],
                            ["Email",        c.email],
                            ["Mobile",       `${c.country_code} ${c.mobile}`],
                          ].map(([lbl, val]) => (
                            <div key={lbl}>
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{lbl}</p>
                              <p className="text-sm font-semibold text-gray-800">{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-wide mb-3">Case Information</h4>
                        <div className="space-y-3">
                          {[
                            ["Visa Type",      visaType],
                            ["Case Status",    caseStatus],
                            ["Payment Status", paymentStatus],
                          ].map(([lbl, val]) => (
                            <div key={lbl}>
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{lbl}</p>
                              <p className="text-sm font-semibold text-gray-800">{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {detailTab !== "overview" && (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-500">This tab is under development</p>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </Modal>

      <Modal
        open={modal.type === "delete"}
        onClose={closeModal}
        title="Delete Candidate"
        maxWidthClass="max-w-sm"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={deleteId != null}
              onClick={handleDelete}
              className="rounded-xl"
            >
              {deleteId != null ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <FiTrash2 size={16} className="text-red-600" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-black text-secondary">
              {modal.data ? fullName(modal.data) : ""}
            </span>
            ? This will deactivate the account.
          </p>
        </div>
      </Modal>

      <Modal
        open={modal.type === "import"}
        onClose={closeModal}
        title="Bulk Import Candidates"
        maxWidthClass="max-w-md"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={importing || !importFile}
              onClick={handleBulkImport}
              className="rounded-xl"
            >
              {importing ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-2" />
                  Importing…
                </>
              ) : (
                "Import Candidates"
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <FiDownload size={18} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">Download Sample CSV</p>
              <p className="text-xs text-gray-500 mt-0.5">Use this template for bulk import</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadSampleCSV}
              className="rounded-lg text-blue-600 hover:bg-blue-100"
            >
              Download
            </Button>
          </div>
          
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files[0])}
              className="hidden"
              id="import-file-input"
            />
            <label
              htmlFor="import-file-input"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <FiUpload size={20} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {importFile ? importFile.name : "Click to upload CSV file"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Maximum file size: 5MB
                </p>
              </div>
            </label>
          </div>

          {importFile && (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
              <div className="flex items-center gap-2">
                <FiCheck size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-700">File selected</span>
              </div>
              <button
                type="button"
                onClick={() => setImportFile(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </Modal>
    </motion.div>
  );
}
