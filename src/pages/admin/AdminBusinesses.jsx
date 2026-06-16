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
import PhoneInput from "../../components/PhoneInput";
import Button from "../../components/Button";
import { isValidPhone } from "../../utils/countries";
import { getApiError } from "../../utils/apiError";
import useSponsor from "../../hooks/useSponsor";
import { useToast } from "../../context/ToastContext";
import {
  createSponsor,
  updateSponsor,
  toggleSponsorStatus,
  resetSponsorPassword,
  exportSponsors,
  bulkImportSponsors,
} from "../../services/sponsorApi";

const PASSWORD_MIN = 6;

import { RoleBadge, StatusBadge } from "../../components/common/Badge";
import { formatDateLong } from "../../utils/datetime";
import { AVATAR_COLORS, initialsFrom, fullName, fmtDate } from "./adminHelpers";

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

const STATUS_FILTER_OPTIONS = [
  { value: "All", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const EDIT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// Sponsors are created with only the basic information needed to register a
// login. A temporary password is generated server-side and emailed to the
// sponsor; all other company/compliance details are managed later on the
// sponsor profile. (Sending licenceStatus here is also rejected by the backend.)
const EMPTY_CREATE = {
  first_name: "",
  last_name: "",
  email: "",
  country_code: "+1",
  mobile: "",
  role_id: "4",
  companyName: "",
};

const EMPTY_RESET = {
  new_password: "",
  confirm_password: "",
};

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

  const statusParam = statusFilter === "All" ? "all" : statusFilter;

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
    else if (!isValidPhone(createForm.country_code, createForm.mobile))
      errs.mobile = "Enter a valid phone number for the selected country";
    if (!createForm.companyName.trim()) errs.companyName = "Company name is required";
    // Password is generated server-side and emailed to the sponsor — not collected here.
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
    else if (!isValidPhone(editForm.country_code, editForm.mobile))
      errs.mobile = "Enter a valid phone number for the selected country";
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
        companyName: createForm.companyName?.trim() || null,
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
    const row = modal.data;
    if (row.status === "inactive") {
      showToast({ message: "Account is already deactivated", variant: "success" });
      closeModal();
      return;
    }
    setDeleteId(row.id);
    try {
      const res = await toggleSponsorStatus(row.id);
      showToast({
        message: res.data?.message || "Sponsor deactivated",
        variant: "success",
      });
      closeModal();
      const r = await fetchSponsors(
        page,
        limit,
        debouncedSearch.trim(),
        statusParam,
      );
      if (!r.ok) {
        showToast({ message: getApiError(r.error), variant: "danger" });
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
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sponsors_export_${new Date().toISOString().split('T')[0]}.xlsx`;
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
    // Basic-info-only import: a temporary password is generated and emailed per
    // row; licence status / risk are managed later (licenceStatus is owned by the
    // activation workflow), so they are intentionally not part of the template.
    const csvContent = [
      'first_name,last_name,email,country_code,mobile,companyName',
      'Tech,Innovations,info@techinnovations.com,+1,5551234567,Tech Innovations Ltd',
      'Global,Trade Solutions,contact@globaltrade.com,+44,2079460123,Global Trade Solutions',
      'Digital,Ventures,hello@digitalventures.io,+1,4159876543,Digital Ventures',
      'Smart,Business Group,info@smartbusiness.co,+91,9876543210,Smart Business Group',
      'Enterprise,Connect,team@enterpriseconnect.net,+1,2125550199,Enterprise Connect',
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
      className="space-y-4 pb-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-secondary tracking-tight">
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
        <div className="px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
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
          <table className="w-full min-w-[600px]">
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
                    className="px-4 py-8 text-center text-sm text-gray-400"
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
                  const licenceExpiry = profile.licenceExpiryDate ? formatDateLong(profile.licenceExpiryDate, { month: "short" }) : "—";
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
                        <div className="flex flex-col">
                          <span>{userName}</span>
                          <RoleBadge role="Sponsor" />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={formatStatusLabel(user.status)} onClick={() => handleToggle(user)} />
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
            <Input
              label="First name"
              name="first_name"
              value={createForm.first_name}
              onChange={handleCreateChange}
              placeholder="John"
              required
              error={errors.first_name}
            />
            <Input
              label="Last name"
              name="last_name"
              value={createForm.last_name}
              onChange={handleCreateChange}
              placeholder="Smith"
              required
              error={errors.last_name}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={createForm.email}
              onChange={handleCreateChange}
              placeholder="name@company.com"
              required
              error={errors.email}
              className="sm:col-span-2"
            />
            <PhoneInput
              split
              label="Mobile"
              dialCode={createForm.country_code}
              national={createForm.mobile}
              dialName="country_code"
              nationalName="mobile"
              onChange={handleCreateChange}
              required
              error={errors.mobile}
              className="sm:col-span-2"
            />
            <Input
              label="Company Name"
              name="companyName"
              value={createForm.companyName}
              onChange={handleCreateChange}
              placeholder="TechNova Ltd"
              required
              error={errors.companyName}
              className="sm:col-span-2"
            />
            <div className="sm:col-span-2 rounded-xl bg-indigo-50 border border-indigo-100 p-3 mt-1">
              <p className="text-xs text-indigo-700 font-semibold">
                A temporary password is generated automatically and emailed to the sponsor with their login link — no password needs to be set here. Other company &amp; compliance details can be added later from the sponsor profile.
              </p>
            </div>
          </div>
        )}
        {modal.type === "edit" && editForm && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <Input
              label="First name"
              name="first_name"
              value={editForm.first_name}
              onChange={handleEditChange}
              placeholder="John"
              required
              error={errors.first_name}
            />
            <Input
              label="Last name"
              name="last_name"
              value={editForm.last_name}
              onChange={handleEditChange}
              placeholder="Smith"
              required
              error={errors.last_name}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={editForm.email}
              onChange={handleEditChange}
              placeholder="name@company.com"
              required
              error={errors.email}
              className="sm:col-span-2"
            />
            <PhoneInput
              split
              label="Mobile"
              dialCode={editForm.country_code}
              national={editForm.mobile}
              dialName="country_code"
              nationalName="mobile"
              onChange={handleEditChange}
              required
              error={errors.mobile}
              className="sm:col-span-2"
            />
            <Input
              label="Company Name"
              name="companyName"
              value={editForm.companyName || ""}
              onChange={handleEditChange}
              required
              error={errors.companyName}
              className="sm:col-span-2"
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

              <div className="flex-1 p-4 sm:p-6">
                {detailTab === "overview" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        title="Deactivate Sponsor"
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
              {deleteId != null ? "Deactivating…" : "Deactivate"}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <FiTrash2 size={16} className="text-red-600" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to deactivate{" "}
            <span className="font-black text-secondary">
              {modal.data ? fullName(modal.data) : ""}
            </span>
            ? The account will be set to inactive.
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
