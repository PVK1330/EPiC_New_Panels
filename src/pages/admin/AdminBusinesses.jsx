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
  FiRefreshCw,
  FiFolder,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";
import useSponsor from "../../hooks/useSponsor";
import { useToast } from "../../context/ToastContext";
import {
  createSponsor,
  updateSponsor,
  toggleSponsorStatus,
  resetSponsorPassword,
  deleteSponsor,
  exportSponsors,
  bulkImportSponsors,
} from "../../services/sponsorApi";

const PASSWORD_MIN = 6;

const ROLE_CHIPS = {
  sponsor: "bg-emerald-100 text-emerald-800",
  admin: "bg-purple-100 text-purple-700",
};

const STATUS_CHIPS = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
};

const LICENCE_CHIPS = {
  Active: "bg-green-100 text-green-700",
  Expiring: "bg-yellow-100 text-yellow-700",
  Suspended: "bg-orange-100 text-orange-600",
  Revoked: "bg-red-100 text-red-600",
};

const RISK_CHIPS = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-orange-100 text-orange-600",
  Critical: "bg-red-100 text-red-600",
};

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-pink-500",
];

const ROLE_OPTIONS = [{ value: "4", label: "Sponsor" }];

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
  country_code: "+1",
  mobile: "",
  role_id: "4",
  password: "",
  confirm_password: "",
  companyName: "",
  tradingName: "",
  companiesHouseNumber: "",
  sector: "Technology & IT",
  sponsorLicenceNumber: "",
  licenceStatus: "Active",
  licenceExpiry: "",
  address: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  annualCosAllocation: "",
  activeCases: "",
  sponsoredWorkers: "",
  riskLevel: "Low",
  riskPct: "20",
  outstanding: "",
  notes: "",
};

const EMPTY_RESET = {
  new_password: "",
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
  if (!n) return "Sponsor";
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

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
};

export default function AdminBusinesses() {
  const { showToast } = useToast();
  const { sponsors, pagination, loading, fetchSponsors } = useSponsor();

  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modal, setModal] = useState({ type: null, data: null });
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [editForm, setEditForm] = useState(null);
  const [resetForm, setResetForm] = useState(EMPTY_RESET);
  const [errors, setErrors] = useState({});
  const [resetErrors, setResetErrors] = useState({});
  const [detailTab, setDetailTab] = useState("overview");

  const [saving, setSaving] = useState(false);
  const [toggleId, setToggleId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const statusParam = statusFilter === "All" ? "" : statusFilter;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetchSponsors(
        page,
        limit,
        debouncedSearch.trim(),
        statusParam,
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
    fetchSponsors,
    showToast,
    statusParam,
  ]);

  const closeModal = () => {
    setModal({ type: null, data: null });
    setCreateForm(EMPTY_CREATE);
    setEditForm(null);
    setResetForm(EMPTY_RESET);
    setErrors({});
    setResetErrors({});
    setDetailTab("overview");
  };

  const openCreate = () => {
    setCreateForm(EMPTY_CREATE);
    setErrors({});
    setModal({ type: "create", data: null });
  };

  const openEdit = (row) => {
    const profile = row.sponsorProfile || {};
    setEditForm({
      first_name: row.first_name || "",
      last_name: row.last_name || "",
      email: row.email || "",
      country_code: row.country_code || "+1",
      mobile: row.mobile || "",
      role_id: String(row.role_id ?? 4),
      status: row.status === "inactive" ? "inactive" : "active",
      companyName: profile.companyName || "",
      tradingName: profile.tradingName || "",
      companiesHouseNumber: profile.registrationNumber || "",
      sector: profile.industrySector || "",
      sponsorLicenceNumber: profile.sponsorLicenceNumber || "",
      licenceStatus: profile.licenceStatus || "",
      licenceExpiry: profile.licenceExpiryDate || "",
      address: profile.registeredAddress || "",
      city: profile.city || "",
      postcode: profile.postalCode || "",
      country: profile.country || "",
      contactName: profile.authorisingName || "",
      contactEmail: profile.authorisingEmail || "",
      contactPhone: profile.authorisingPhone || "",
      annualCosAllocation: profile.cosAllocation || "",
      activeCases: profile.activeCases || "",
      sponsoredWorkers: profile.sponsoredWorkers || "",
      riskLevel: profile.riskLevel || "",
      riskPct: profile.riskPct || "",
      outstanding: profile.outstandingBalance || "",
      notes: profile.notes || "",
    });
    setErrors({});
    setModal({ type: "edit", data: row });
  };

  const openView = (row) => {
    setModal({ type: "view", data: row });
  };

  const openDelete = (row) => {
    setModal({ type: "delete", data: row });
  };

  const openReset = (row) => {
    setResetForm(EMPTY_RESET);
    setResetErrors({});
    setModal({ type: "reset", data: row });
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

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetForm((p) => ({ ...p, [name]: value }));
    if (resetErrors[name]) setResetErrors((p) => ({ ...p, [name]: "" }));
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
    if (!createForm.companyName.trim()) errs.companyName = "Company name is required";
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
    if (!editForm.companyName.trim()) errs.companyName = "Company name is required";
    return errs;
  };

  const validateReset = () => {
    const errs = {};
    if (!resetForm.new_password) errs.new_password = "Password is required";
    else if (resetForm.new_password.length < PASSWORD_MIN)
      errs.new_password = `Password must be at least ${PASSWORD_MIN} characters`;
    if (!resetForm.confirm_password)
      errs.confirm_password = "Please confirm password";
    else if (resetForm.new_password !== resetForm.confirm_password)
      errs.confirm_password = "Passwords do not match";
    return errs;
  };

  const handleCreate = async () => {
    const errs = validateCreate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const res = await createSponsor({
        first_name: createForm.first_name.trim(),
        last_name: createForm.last_name.trim(),
        email: createForm.email.trim(),
        country_code: createForm.country_code.trim(),
        mobile: createForm.mobile.trim(),
        role_id: Number(createForm.role_id),
        password: createForm.password,
        confirm_password: createForm.confirm_password,
        companyName: createForm.companyName?.trim() || null,
        tradingName: createForm.tradingName?.trim() || null,
        registrationNumber: createForm.companiesHouseNumber?.trim() || null,
        industrySector: createForm.sector?.trim() || null,
        sponsorLicenceNumber: createForm.sponsorLicenceNumber?.trim() || null,
        licenceStatus: createForm.licenceStatus || null,
        licenceExpiryDate: createForm.licenceExpiry || null,
        registeredAddress: createForm.address?.trim() || null,
        city: createForm.city?.trim() || null,
        postalCode: createForm.postcode?.trim() || null,
        country: createForm.country?.trim() || null,
        authorisingName: createForm.contactName?.trim() || null,
        authorisingEmail: createForm.contactEmail?.trim() || null,
        authorisingPhone: createForm.contactPhone?.trim() || null,
        cosAllocation: createForm.annualCosAllocation || null,
        activeCases: createForm.activeCases || null,
        sponsoredWorkers: createForm.sponsoredWorkers || null,
        riskLevel: createForm.riskLevel || null,
        riskPct: createForm.riskPct || null,
        outstandingBalance: createForm.outstanding || null,
        notes: createForm.notes?.trim() || null,
      });
      showToast({
        message: res.data?.message || "Sponsor created successfully",
        variant: "success",
      });
      closeModal();
      if (page !== 1) setPage(1);
      else {
        const r = await fetchSponsors(
          1,
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
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    const errs = validateEdit();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const res = await updateSponsor(modal.data.id, {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        email: editForm.email.trim(),
        country_code: editForm.country_code.trim(),
        mobile: editForm.mobile.trim(),
        role_id: Number(editForm.role_id),
        status: editForm.status,
        companyName: editForm.companyName?.trim() || null,
        tradingName: editForm.tradingName?.trim() || null,
        registrationNumber: editForm.companiesHouseNumber?.trim() || null,
        industrySector: editForm.sector?.trim() || null,
        sponsorLicenceNumber: editForm.sponsorLicenceNumber?.trim() || null,
        licenceStatus: editForm.licenceStatus || null,
        licenceExpiryDate: editForm.licenceExpiry || null,
        registeredAddress: editForm.address?.trim() || null,
        city: editForm.city?.trim() || null,
        postalCode: editForm.postcode?.trim() || null,
        country: editForm.country?.trim() || null,
        authorisingName: editForm.contactName?.trim() || null,
        authorisingEmail: editForm.contactEmail?.trim() || null,
        authorisingPhone: editForm.contactPhone?.trim() || null,
        cosAllocation: editForm.annualCosAllocation || null,
        activeCases: editForm.activeCases || null,
        sponsoredWorkers: editForm.sponsoredWorkers || null,
        riskLevel: editForm.riskLevel || null,
        riskPct: editForm.riskPct || null,
        outstandingBalance: editForm.outstanding || null,
        notes: editForm.notes?.trim() || null,
      });
      showToast({
        message: res.data?.message || "Sponsor updated successfully",
        variant: "success",
      });
      closeModal();
      {
        const r = await fetchSponsors(
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
      setSaving(false);
    }
  };

  const handleToggle = async (row) => {
    setToggleId(row.id);
    try {
      const res = await toggleSponsorStatus(row.id);
      showToast({
        message: res.data?.message || "Status updated",
        variant: "success",
      });
      {
        const r = await fetchSponsors(
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

  const handleResetSubmit = async () => {
    const errs = validateReset();
    if (Object.keys(errs).length) {
      setResetErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const res = await resetSponsorPassword(modal.data.id, {
        new_password: resetForm.new_password,
        confirm_password: resetForm.confirm_password,
      });
      showToast({
        message: res.data?.message || "Password reset successfully",
        variant: "success",
      });
      closeModal();
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleteId(modal.data.id);
    try {
      const res = await deleteSponsor(modal.data.id);
      showToast({
        message: res.data?.message || "Sponsor removed",
        variant: "success",
      });
      closeModal();
      const nextPage =
        sponsors.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      else {
        const r = await fetchSponsors(
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

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportSponsors({
        search: debouncedSearch.trim(),
        status: statusParam,
      });
      
      // Create a blob from the response
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sponsors_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast({
        message: "Sponsors exported successfully",
        variant: "success",
      });
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setExporting(false);
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) {
      showToast({ message: "Please select a CSV file", variant: "danger" });
      return;
    }

    setImporting(true);
    try {
      const res = await bulkImportSponsors(importFile);
      const { successful, failed, total_processed, results } = res.data?.data || {};
      
      showToast({
        message: `Bulk import completed: ${successful} successful, ${failed} failed out of ${total_processed}`,
        variant: successful > 0 ? "success" : "danger",
      });
      
      // Refresh the list
      const r = await fetchSponsors(
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
      'first_name,last_name,email,country_code,mobile,companyName,licenceStatus,riskLevel',
      'Tech,Innovations,info@techinnovations.com,+1,5551234567,Tech Innovations Ltd,Active,Low',
      'Global,Trade Solutions,contact@globaltrade.com,+44,2079460123,Global Trade Solutions,Active,Medium',
      'Digital,Ventures,hello@digitalventures.io,+1,4159876543,Digital Ventures,Active,Low',
      'Smart,Business Group,info@smartbusiness.co,+91,9876543210,Smart Business Group,Pending,Low',
      'Enterprise,Connect,team@enterpriseconnect.net,+1,2125550199,Enterprise Connect,Active,Medium',
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_sponsors_import.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
          <h1 className="text-3xl font-black text-secondary tracking-tight">
            Businesses
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage sponsor accounts and business portal access
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setModal({ type: "import" })}
            disabled={importing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FiUpload size={14} />
            )}
            Import
          </button>
          <button
            type="button"
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
          <Button onClick={openCreate} className="rounded-xl shadow-sm">
            <FiPlus size={14} />
            Add Sponsor
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <FiSearch
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search sponsors…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-gray-50 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 text-gray-600"
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label === "All" ? "All status" : o.label}
                </option>
              ))}
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
                {["Company", "User Name", "Status", "Licence Status", "Licence Expiry", "Active Cases", "Sponsored Workers", "Risk Score", "Outstanding", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && sponsors.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-sm text-gray-400"
                  >
                    No sponsors found.
                  </td>
                </tr>
              ) : (
                sponsors.map((user, idx) => {
                  const profile = user.sponsorProfile || {};
                  const companyName = profile.companyName || "—";
                  const userName = `${user.first_name} ${user.last_name}`;
                  const initials = profile.companyName ? profile.companyName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : initialsFrom(user);
                  const licenceStatus = profile.licenceStatus || "—";
                  const licenceExpiry = profile.licenceExpiryDate ? new Date(profile.licenceExpiryDate).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
                  const activeCases = profile.activeCases ?? 0;
                  const sponsoredWorkers = profile.sponsoredWorkers ?? 0;
                  const riskLevel = profile.riskLevel || "—";
                  const riskPct = profile.riskPct ?? 20;
                  const outstanding = profile.outstandingBalance ? `£${Number(profile.outstandingBalance).toLocaleString("en-GB", { maximumFractionDigits: 0 })}` : "£0";

                  const riskBarColor = riskLevel === 'Low' ? 'bg-green-500' : riskLevel === 'Medium' ? 'bg-yellow-500' : riskLevel === 'High' ? 'bg-red-500' : 'bg-gray-400';
                  const riskTextColor = riskLevel === 'Low' ? 'text-green-600' : riskLevel === 'Medium' ? 'text-yellow-600' : riskLevel === 'High' ? 'text-red-500' : 'text-gray-500';

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
                          >
                            {initials}
                          </div>
                          <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                            {companyName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                        {userName}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggle(user)}
                          disabled={toggleId === user.id}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-black cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
                            user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {toggleId === user.id ? '...' : formatStatusLabel(user.status)}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                            licenceStatus === 'Active' ? 'bg-green-100 text-green-700' :
                            licenceStatus === 'Suspended' ? 'bg-orange-100 text-orange-700' :
                            licenceStatus === 'Expired' ? 'bg-red-100 text-red-700' :
                            licenceStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {licenceStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono whitespace-nowrap">
                        {licenceExpiry}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-bold text-secondary whitespace-nowrap">
                        {activeCases}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-bold text-secondary whitespace-nowrap">
                        {sponsoredWorkers}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${riskBarColor}`} style={{ width: `${riskPct}%` }} />
                          </div>
                          <span className={`text-xs font-black ${riskTextColor}`}>{riskLevel}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-mono font-bold text-red-500 whitespace-nowrap">
                        {outstanding}
                      </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openView(user)}
                          className="p-2 text-gray-400 hover:text-secondary hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <FiEye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="p-2 text-gray-400 hover:text-secondary hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(user)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-gray-400">
            Showing{" "}
            <span className="font-bold text-secondary">
              {pagination.total === 0 ? 0 : startIdx}
            </span>
            –
            <span className="font-bold text-secondary">{endIdx}</span> of{" "}
            <span className="font-bold text-secondary">
              {pagination.total}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl text-xs"
            >
              Previous
            </Button>
            <span className="text-xs text-gray-500 font-semibold">
              Page {page} / {Math.max(1, totalPages)}
            </span>
            <Button
              variant="ghost"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={isFormModal}
        onClose={closeModal}
        title={
          modal.type === "create" ? "Create Sponsor" : "Edit Sponsor"
        }
        maxWidthClass="max-w-2xl"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={saving}
              onClick={modal.type === "create" ? handleCreate : handleUpdate}
              className="rounded-xl"
            >
              {saving
                ? "Saving…"
                : modal.type === "create"
                  ? "Create"
                  : "Update"}
            </Button>
          </>
        }
      >
        {modal.type === "create" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Company</p>
            </div>
            <Input
              label="Legal Company Name"
              name="companyName"
              value={createForm.companyName}
              onChange={handleCreateChange}
              placeholder="TechNova Ltd"
              required
              error={errors.companyName}
              className="sm:col-span-2"
            />
            <Input
              label="Trading Name"
              name="tradingName"
              value={createForm.tradingName}
              onChange={handleCreateChange}
              placeholder="TechNova"
            />
            <Input
              label="Companies House Number"
              name="companiesHouseNumber"
              value={createForm.companiesHouseNumber}
              onChange={handleCreateChange}
              placeholder="08472931"
            />
            <Input
              label="Sector / Industry"
              name="sector"
              value={createForm.sector}
              onChange={handleCreateChange}
              options={[
                { value: "Technology & IT", label: "Technology & IT" },
                { value: "Recruitment & HR", label: "Recruitment & HR" },
                { value: "Management Consulting", label: "Management Consulting" },
                { value: "Financial Services", label: "Financial Services" },
                { value: "Healthcare", label: "Healthcare" },
                { value: "Education", label: "Education" },
                { value: "Manufacturing", label: "Manufacturing" },
                { value: "Other", label: "Other" },
              ]}
              className="sm:col-span-2"
            />

            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Sponsor Licence</p>
            </div>
            <Input
              label="Sponsor Licence Number"
              name="sponsorLicenceNumber"
              value={createForm.sponsorLicenceNumber}
              onChange={handleCreateChange}
              placeholder="ABC123456"
              required
              error={errors.sponsorLicenceNumber}
            />
            <Input
              label="Licence Status"
              name="licenceStatus"
              value={createForm.licenceStatus}
              onChange={handleCreateChange}
              options={[
                { value: "Active", label: "Active" },
                { value: "Expiring", label: "Expiring" },
                { value: "Suspended", label: "Suspended" },
                { value: "Revoked", label: "Revoked" },
              ]}
            />
            <Input
              label="Licence Expiry Date"
              name="licenceExpiry"
              type="date"
              value={createForm.licenceExpiry}
              onChange={handleCreateChange}
              required
              error={errors.licenceExpiry}
            />

            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Registered Address</p>
            </div>
            <Input
              label="Street Address"
              name="address"
              value={createForm.address}
              onChange={handleCreateChange}
              placeholder="1 Canary Wharf"
              className="sm:col-span-2"
            />
            <Input
              label="City"
              name="city"
              value={createForm.city}
              onChange={handleCreateChange}
              placeholder="London"
            />
            <Input
              label="Postcode"
              name="postcode"
              value={createForm.postcode}
              onChange={handleCreateChange}
              placeholder="E14 5AB"
            />
            <Input
              label="Country"
              name="country"
              value={createForm.country}
              onChange={handleCreateChange}
              placeholder="United Kingdom"
              className="sm:col-span-2"
            />

            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Primary Contact (User Account)</p>
            </div>
            <Input
              label="First name"
              name="first_name"
              value={createForm.first_name}
              onChange={handleCreateChange}
              required
              error={errors.first_name}
            />
            <Input
              label="Last name"
              name="last_name"
              value={createForm.last_name}
              onChange={handleCreateChange}
              required
              error={errors.last_name}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={createForm.email}
              onChange={handleCreateChange}
              required
              error={errors.email}
            />
            <Input
              label="Country code"
              name="country_code"
              value={createForm.country_code}
              onChange={handleCreateChange}
              required
              error={errors.country_code}
            />
            <Input
              label="Mobile"
              name="mobile"
              value={createForm.mobile}
              onChange={handleCreateChange}
              required
              error={errors.mobile}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={createForm.password}
              onChange={handleCreateChange}
              required
              error={errors.password}
            />
            <Input
              label="Confirm password"
              name="confirm_password"
              type="password"
              value={createForm.confirm_password}
              onChange={handleCreateChange}
              required
              error={errors.confirm_password}
            />

            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Compliance & Metrics</p>
            </div>
            <Input
              label="Annual CoS Allocation"
              name="annualCosAllocation"
              value={createForm.annualCosAllocation}
              onChange={handleCreateChange}
              type="number"
              placeholder="50"
            />
            <Input
              label="Active Cases"
              name="activeCases"
              value={createForm.activeCases}
              onChange={handleCreateChange}
              type="number"
              placeholder="12"
            />
            <Input
              label="Sponsored Workers"
              name="sponsoredWorkers"
              value={createForm.sponsoredWorkers}
              onChange={handleCreateChange}
              type="number"
              placeholder="28"
            />
            <Input
              label="Risk Level"
              name="riskLevel"
              value={createForm.riskLevel}
              onChange={handleCreateChange}
              options={[
                { value: "Low", label: "Low" },
                { value: "Medium", label: "Medium" },
                { value: "High", label: "High" },
              ]}
            />
            <Input
              label="Risk Score %"
              name="riskPct"
              value={createForm.riskPct}
              onChange={handleCreateChange}
              type="number"
              placeholder="20"
            />
            <Input
              label="Outstanding Fees (£)"
              name="outstanding"
              value={createForm.outstanding}
              onChange={handleCreateChange}
              type="number"
              step="0.01"
              placeholder="12400"
            />

            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Notes</p>
            </div>
            <Input
              label="Internal Notes"
              name="notes"
              value={createForm.notes}
              onChange={handleCreateChange}
              rows={3}
              placeholder="Compliance notes, renewal deadlines…"
              className="sm:col-span-2"
            />
          </div>
        )}
        {modal.type === "edit" && editForm && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Company</p>
            </div>
            <Input
              label="Legal Company Name"
              name="companyName"
              value={editForm.companyName || ""}
              onChange={handleEditChange}
              className="sm:col-span-2"
            />
            <Input
              label="Trading Name"
              name="tradingName"
              value={editForm.tradingName || ""}
              onChange={handleEditChange}
            />
            <Input
              label="Companies House Number"
              name="companiesHouseNumber"
              value={editForm.companiesHouseNumber || ""}
              onChange={handleEditChange}
            />
            <Input
              label="Sector / Industry"
              name="sector"
              value={editForm.sector || ""}
              onChange={handleEditChange}
              options={[
                { value: "Technology & IT", label: "Technology & IT" },
                { value: "Recruitment & HR", label: "Recruitment & HR" },
                { value: "Management Consulting", label: "Management Consulting" },
                { value: "Financial Services", label: "Financial Services" },
                { value: "Healthcare", label: "Healthcare" },
                { value: "Education", label: "Education" },
                { value: "Manufacturing", label: "Manufacturing" },
                { value: "Other", label: "Other" },
              ]}
              className="sm:col-span-2"
            />

            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Sponsor Licence</p>
            </div>
            <Input
              label="Sponsor Licence Number"
              name="sponsorLicenceNumber"
              value={editForm.sponsorLicenceNumber || ""}
              onChange={handleEditChange}
            />
            <Input
              label="Licence Status"
              name="licenceStatus"
              value={editForm.licenceStatus || ""}
              onChange={handleEditChange}
              options={[
                { value: "Active", label: "Active" },
                { value: "Expiring", label: "Expiring" },
                { value: "Suspended", label: "Suspended" },
                { value: "Revoked", label: "Revoked" },
              ]}
            />
            <Input
              label="Licence Expiry Date"
              name="licenceExpiry"
              type="date"
              value={editForm.licenceExpiry || ""}
              onChange={handleEditChange}
            />

            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Registered Address</p>
            </div>
            <Input
              label="Street Address"
              name="address"
              value={editForm.address || ""}
              onChange={handleEditChange}
              className="sm:col-span-2"
            />
            <Input
              label="City"
              name="city"
              value={editForm.city || ""}
              onChange={handleEditChange}
            />
            <Input
              label="Postcode"
              name="postcode"
              value={editForm.postcode || ""}
              onChange={handleEditChange}
            />
            <Input
              label="Country"
              name="country"
              value={editForm.country || ""}
              onChange={handleEditChange}
              className="sm:col-span-2"
            />

            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Primary Contact</p>
            </div>
            <Input
              label="Contact Name"
              name="contactName"
              value={editForm.contactName || ""}
              onChange={handleEditChange}
              className="sm:col-span-2"
            />
            <Input
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={editForm.contactEmail || ""}
              onChange={handleEditChange}
            />
            <Input
              label="Contact Phone"
              name="contactPhone"
              type="tel"
              value={editForm.contactPhone || ""}
              onChange={handleEditChange}
            />

            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Compliance & Metrics</p>
            </div>
            <Input
              label="Annual CoS Allocation"
              name="annualCosAllocation"
              value={editForm.annualCosAllocation || ""}
              onChange={handleEditChange}
              type="number"
            />
            <Input
              label="Active Cases"
              name="activeCases"
              value={editForm.activeCases || ""}
              onChange={handleEditChange}
              type="number"
            />
            <Input
              label="Sponsored Workers"
              name="sponsoredWorkers"
              value={editForm.sponsoredWorkers || ""}
              onChange={handleEditChange}
              type="number"
            />
            <Input
              label="Risk Level"
              name="riskLevel"
              value={editForm.riskLevel || ""}
              onChange={handleEditChange}
              options={[
                { value: "Low", label: "Low" },
                { value: "Medium", label: "Medium" },
                { value: "High", label: "High" },
              ]}
            />
            <Input
              label="Risk Score %"
              name="riskPct"
              value={editForm.riskPct || ""}
              onChange={handleEditChange}
              type="number"
            />
            <Input
              label="Outstanding Fees (£)"
              name="outstanding"
              value={editForm.outstanding || ""}
              onChange={handleEditChange}
              type="number"
              step="0.01"
            />

            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Notes</p>
            </div>
            <Input
              label="Internal Notes"
              name="notes"
              value={editForm.notes || ""}
              onChange={handleEditChange}
              rows={3}
              className="sm:col-span-2"
            />

            <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">User Account Status</p>
            </div>
            <Input
              label="First name"
              name="first_name"
              value={editForm.first_name}
              onChange={handleEditChange}
              required
              error={errors.first_name}
            />
            <Input
              label="Last name"
              name="last_name"
              value={editForm.last_name}
              onChange={handleEditChange}
              required
              error={errors.last_name}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={editForm.email}
              onChange={handleEditChange}
              required
              error={errors.email}
            />
            <Input
              label="Country code"
              name="country_code"
              value={editForm.country_code}
              onChange={handleEditChange}
              required
              error={errors.country_code}
            />
            <Input
              label="Mobile"
              name="mobile"
              value={editForm.mobile}
              onChange={handleEditChange}
              required
              error={errors.mobile}
            />
            <Input
              label="Role"
              name="role_id"
              value={editForm.role_id}
              onChange={handleEditChange}
              options={ROLE_OPTIONS}
              required
            />
            <Input
              label="Status"
              name="status"
              value={editForm.status}
              onChange={handleEditChange}
              options={EDIT_STATUS_OPTIONS}
              required
              className="sm:col-span-2"
            />
          </div>
        )}
      </Modal>

      <Modal
        open={modal.type === "view"}
        onClose={() => { closeModal(); setDetailTab("overview"); }}
        title={modal.data ? `Sponsor ${modal.data.sponsorProfile?.companyName || fullName(modal.data)}` : ""}
        maxWidthClass="max-w-4xl"
        bodyClassName="p-0"
      >
        {modal.data && (() => {
          const b = modal.data;
          const profile = b.sponsorProfile || {};
          return (
            <>
              <div className="shrink-0 border-b border-gray-100 px-4 sm:px-6 py-4 bg-gray-50/80 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-black text-gray-900">
                    {profile.companyName || fullName(b)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${LICENCE_CHIPS[profile.licenceStatus] ?? "bg-gray-100 text-gray-500"}`}>
                      {profile.licenceStatus || "—"}
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${RISK_CHIPS[profile.riskLevel] ?? "bg-gray-100 text-gray-500"}`}>
                      {profile.riskLevel || "—"} Risk
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(b)}
                  className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-secondary hover:bg-secondary/5"
                >
                  Edit sponsor
                </button>
              </div>

              <div className="shrink-0 flex gap-0 overflow-x-auto border-b border-gray-100 bg-gray-50/50 px-2 no-scrollbar">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "licence", label: "Sponsor Licence" },
                  { id: "contact", label: "Contact" },
                  { id: "metrics", label: "Metrics" },
                  { id: "documents", label: "Documents" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDetailTab(t.id)}
                    className={`shrink-0 border-b-2 px-3 sm:px-4 py-3 text-xs font-black transition-colors whitespace-nowrap ${detailTab === t.id
                        ? "border-secondary text-secondary"
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
                        <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Company Information</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Legal Name</p>
                            <p className="text-sm font-bold text-gray-900">{profile.companyName || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Trading Name</p>
                            <p className="text-sm font-bold text-gray-900">{profile.tradingName || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Companies House Number</p>
                            <p className="text-sm font-bold text-gray-900">{profile.registrationNumber || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Sector</p>
                            <p className="text-sm font-bold text-gray-900">{profile.industrySector || "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Address Information</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Street Address</p>
                            <p className="text-sm font-bold text-gray-900">{profile.registeredAddress || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">City</p>
                            <p className="text-sm font-bold text-gray-900">{profile.city || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Postcode</p>
                            <p className="text-sm font-bold text-gray-900">{profile.postalCode || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Country</p>
                            <p className="text-sm font-bold text-gray-900">{profile.country || "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {profile.notes && (
                      <div>
                        <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Notes</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">{profile.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {detailTab === "licence" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Licence Number</p>
                        <p className="text-sm font-bold text-gray-900">{profile.sponsorLicenceNumber || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Status</p>
                        <p className="text-sm font-bold text-gray-900">{profile.licenceStatus || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Expiry Date</p>
                        <p className="text-sm font-bold text-gray-900">{fmtDate(profile.licenceExpiryDate)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Annual CoS Allocation</p>
                        <p className="text-sm font-bold text-gray-900">{profile.cosAllocation || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === "contact" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Contact Name</p>
                        <p className="text-sm font-bold text-gray-900">{profile.authorisingName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-bold text-gray-900">{profile.authorisingEmail || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Phone</p>
                        <p className="text-sm font-bold text-gray-900">{profile.authorisingPhone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">User Email</p>
                        <p className="text-sm font-bold text-gray-900">{b.email || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === "metrics" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Active Cases</p>
                        <p className="text-sm font-bold text-gray-900">{profile.activeCases || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Sponsored Workers</p>
                        <p className="text-sm font-bold text-gray-900">{profile.sponsoredWorkers || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Risk Level</p>
                        <p className="text-sm font-bold text-gray-900">{profile.riskLevel || "Not provided"} ({profile.riskPct || 0}%)</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Outstanding Balance</p>
                        <p className="text-sm font-bold text-gray-900">{profile.outstandingBalance ? `£${profile.outstandingBalance}` : "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === "documents" && (
                  <div className="text-center py-8">
                    <FiFolder size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No documents uploaded yet</p>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </Modal>

      <Modal
        open={modal.type === "reset"}
        onClose={closeModal}
        title="Reset password"
        maxWidthClass="max-w-md"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={saving}
              onClick={handleResetSubmit}
              className="rounded-xl"
            >
              {saving ? "Saving…" : "Reset password"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="New password"
            name="new_password"
            type="password"
            value={resetForm.new_password}
            onChange={handleResetChange}
            required
            error={resetErrors.new_password}
          />
          <Input
            label="Confirm password"
            name="confirm_password"
            type="password"
            value={resetForm.confirm_password}
            onChange={handleResetChange}
            required
            error={resetErrors.confirm_password}
          />
        </div>
      </Modal>

      <Modal
        open={modal.type === "delete"}
        onClose={closeModal}
        title="Delete Sponsor"
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
        title="Bulk Import Sponsors"
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
                "Import Sponsors"
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
