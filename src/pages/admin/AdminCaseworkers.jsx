import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiPlus,
  FiDownload,
  FiUpload,
  FiCheck,
  FiEye,
  FiBarChart2,
  FiUserPlus,
  FiRefreshCw,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";
import useCaseworker from "../../hooks/useCaseworker";
import useDownloads from "../../hooks/useDownloads";
import { useToast } from "../../context/ToastContext";
import {
  createCaseworker,
  updateCaseworker,
  deleteCaseworker,
  exportCaseworkers,
  bulkImportCaseworkers,
  getDepartments,
  getCaseworkerById,
} from "../../services/caseWorker";
import { getOrganisationSlugFromHost } from "../../utils/organisationHost";

import { RoleBadge, StatusBadge } from "../../components/common/Badge";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
];

const ROLE_OPTIONS = [{ value: "2", label: "Caseworker" }];

const STATUS_FILTER_OPTIONS = [
  { value: "All", label: "All" },
  { value: "active", label: "Active" },
  { value: "high load", label: "High Load" },
  { value: "on leave", label: "On Leave" },
  { value: "inactive", label: "Inactive" },
];

const EDIT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "high load", label: "High Load" },
  { value: "on leave", label: "On Leave" },
  { value: "inactive", label: "Inactive" },
];

const EMPTY_CREATE = {
  first_name: "",
  last_name: "",
  email: "",
  country_code: "+44",
  mobile: "",
  role_id: "2",
  department: "",
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
  if (!n) return "Caseworker";
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

function departmentLabel(row) {
  const d = row?.caseworkerProfile?.department;
  return d && String(d).trim() ? d : "—";
}

function getStageProgress(stage, status) {
  const s = status || "";
  if (["Completed", "Approved", "Closed"].includes(s)) {
    return { percent: 100, color: "hsl(142, 71%, 45%)", label: "Completed" };
  }
  if (s === "Drafting" || stage === "draft_application_review") {
    return { percent: 40, color: "hsl(217, 91%, 60%)", label: s || "Drafting" };
  }
  if (["Pending", "Docs Pending", "Lead"].includes(s)) {
    return { percent: 20, color: "hsl(38, 92%, 50%)", label: s || "Pending" };
  }
  if (s === "Overdue") {
    return { percent: 85, color: "hsl(0, 84%, 60%)", label: "Overdue" };
  }
  if (["In Progress", "Under Review", "Submitted"].includes(s)) {
    return { percent: 60, color: "hsl(217, 91%, 60%)", label: s || "In Progress" };
  }
  return { percent: 40, color: "hsl(217, 91%, 55%)", label: s || stage || "In progress" };
}

function candidateDisplayName(candidate) {
  if (!candidate) return "—";
  const name = `${candidate.first_name || ""} ${candidate.last_name || ""}`.trim();
  return name || "—";
}

function formatTargetDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function AdminCaseworkers() {
  const { showToast } = useToast();
  const authUser = useSelector((state) => state.auth.user);
  const orgLabel =
    authUser?.organisation_name ||
    getOrganisationSlugFromHost() ||
    (authUser?.organisation_id ? `Organisation #${authUser.organisation_id}` : null);
  const { caseworkers, pagination, loading, fetchCaseworkers } =
    useCaseworker();

  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [departments, setDepartments] = useState([]);

  const [modal, setModal] = useState({ type: null, data: null });
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [editForm, setEditForm] = useState(null);
  const [errors, setErrors] = useState({});

  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [caseSearch, setCaseSearch] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      if (res.data?.status === "success") {
        const deptList = res.data.data.departments || [];
        setDepartments(deptList.map((d) => ({ value: d, label: d })));
      }
    } catch (e) {
      console.error("Failed to fetch departments:", e);
      showToast({ message: "Failed to fetch departments", variant: "danger" });
    }
  };

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, deptFilter]);

  const statusParam = statusFilter === "All" ? "" : statusFilter;
  const deptParam = deptFilter === "All" ? "" : deptFilter;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetchCaseworkers(
        page,
        limit,
        debouncedSearch.trim(),
        statusParam,
        deptParam,
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
    deptFilter,
    fetchCaseworkers,
    showToast,
    statusParam,
    deptParam,
  ]);

  const closeModal = () => {
    setModal({ type: null, data: null });
    setViewingDetails(null);
    setLoadingDetails(false);
    setCaseSearch("");
    setCreateForm(EMPTY_CREATE);
    setEditForm(null);
    setErrors({});
  };

  const openCreate = () => {
    setCreateForm(EMPTY_CREATE);
    setErrors({});
    setModal({ type: "create", data: null });
  };

  const openEdit = (row) => {
    setEditForm({
      first_name: row.first_name || "",
      last_name: row.last_name || "",
      email: row.email || "",
      country_code: row.country_code || "+1",
      mobile: row.mobile || "",
      role_id: String(row.role_id ?? 2),
      department: row?.caseworkerProfile?.department || "",
      status: row.status === "inactive" ? "inactive" : "active",
    });
    setErrors({});
    setModal({ type: "edit", data: row });
  };

  const openView = async (row) => {
    setModal({ type: "view", data: row });
    setViewingDetails(row);
    setCaseSearch("");
    setLoadingDetails(true);
    try {
      const res = await getCaseworkerById(row.id);
      const payload = res.data?.data;
      if (payload?.caseworker) {
        setViewingDetails({
          ...payload.caseworker,
          metrics: payload.metrics,
          candidates: payload.candidates || [],
          cases: payload.cases || [],
          performance: payload.metrics || payload.caseworker.performance,
        });
      }
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setLoadingDetails(false);
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

  const handleToggleStatus = async (row) => {
    const newStatus = row.status === "active" ? "inactive" : "active";
    try {
      const res = await updateCaseworker(row.id, {
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        country_code: row.country_code,
        mobile: row.mobile,
        role_id: row.role_id,
        department: row?.caseworkerProfile?.department || "",
        status: newStatus,
      });
      showToast({
        message: `Status changed to ${newStatus}`,
        variant: "success",
      });
      const r = await fetchCaseworkers(
        page,
        limit,
        debouncedSearch.trim(),
        statusParam,
        deptParam,
      );
      if (!r.ok) {
        showToast({ message: getApiError(r.error), variant: "danger" });
      }
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    }
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
    else if (createForm.password.length < 8)
      errs.password = "Password must be at least 8 characters";
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

  const handleCreate = async () => {
    const errs = validateCreate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const res = await createCaseworker({
        first_name: createForm.first_name.trim(),
        last_name: createForm.last_name.trim(),
        email: createForm.email.trim(),
        country_code: createForm.country_code.trim(),
        mobile: createForm.mobile.trim(),
        role_id: Number(createForm.role_id),
        department: createForm.department,
        password: createForm.password,
        confirm_password: createForm.confirm_password,
      });
      showToast({
        message: res.data?.message || "Caseworker created successfully",
        variant: "success",
      });
      closeModal();
      if (page !== 1) setPage(1);
      else {
        const r = await fetchCaseworkers(
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
      const res = await updateCaseworker(modal.data.id, {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        email: editForm.email.trim(),
        country_code: editForm.country_code.trim(),
        mobile: editForm.mobile.trim(),
        role_id: Number(editForm.role_id),
        department: editForm.department,
        status: editForm.status,
      });
      showToast({
        message: res.data?.message || "Caseworker updated successfully",
        variant: "success",
      });
      closeModal();
      {
        const r = await fetchCaseworkers(
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

  const handleDelete = async () => {
    setDeleteId(modal.data.id);
    try {
      const res = await deleteCaseworker(modal.data.id);
      showToast({
        message: res.data?.message || "Caseworker removed",
        variant: "success",
      });
      closeModal();
      const nextPage =
        caseworkers.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      else {
        const r = await fetchCaseworkers(
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
      const res = await bulkImportCaseworkers(importFile);
      const { successful, failed, total_processed, results } = res.data?.data || {};
      
      showToast({
        message: `Bulk import completed: ${successful} successful, ${failed} failed out of ${total_processed}`,
        variant: successful > 0 ? "success" : "danger",
      });
      
      // Refresh the list
      const r = await fetchCaseworkers(
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
      'first_name,last_name,email,country_code,mobile,department',
      'John,Doe,john.doe@example.com,+1,5551234567,Immigration',
      'Jane,Smith,jane.smith@example.com,+1,5559876543,Housing',
      'Michael,Johnson,michael.j@example.com,+44,2079460123,Employment',
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_caseworkers_import.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportCaseworkers({
        search: debouncedSearch.trim(),
        status: statusParam,
        department: deptParam,
      });
      
      // Create a blob from the response
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `caseworkers_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast({
        message: "Caseworkers exported successfully",
        variant: "success",
      });
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setExporting(false);
    }
  };

  const aggregateMetrics = (caseworkers || []).reduce(
    (acc, cw) => {
      const p = cw.performance || {};
      acc.totalActive += p.inProgressCases || 0;
      acc.totalOverdue += p.overdueCases || 0;
      acc.totalCompleted += p.completedCases || 0;
      return acc;
    },
    { totalActive: 0, totalOverdue: 0, totalCompleted: 0 },
  );
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
            Case Workers
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Team performance and case assignment overview
            {orgLabel ? (
              <span className="text-primary font-bold"> · {orgLabel}</span>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <FiBarChart2 size={14} />
            Performance Report
          </button>
          <Button
            onClick={() => setModal({ type: "import" })}
            className="rounded-xl shadow-sm"
          >
            <FiUpload size={14} />
            Import Data
          </Button>
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
            Add Caseworker
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Total Caseworkers</p>
          <p className="text-3xl font-black text-secondary">{pagination.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Active Cases</p>
          <p className="text-3xl font-black text-blue-600">{aggregateMetrics.totalActive}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Overdue/Pending</p>
          <p className="text-3xl font-black text-red-500">{aggregateMetrics.totalOverdue}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Total Completed</p>
          <p className="text-3xl font-black text-green-600">{aggregateMetrics.totalCompleted}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <p className="text-sm font-black text-secondary">All Caseworkers</p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <FiSearch
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search caseworkers…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-gray-50 w-48 placeholder:text-gray-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 text-gray-600"
            >
              <option value="All">All Status</option>
              <option value="active">Active</option>
              <option value="high load">High Load</option>
              <option value="on leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 text-gray-600"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
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
                {[
                  "Name",
                  "Email",
                  "Department",
                  "Candidates",
                  "Active Cases",
                  "Overdue",
                  "Completed",
                  "Performance",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && caseworkers.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-12 text-center text-sm text-gray-400"
                  >
                    No caseworkers match your search.
                  </td>
                </tr>
              ) : (
                caseworkers.map((user, idx) => {
                  const perf = user.performance || {};
                  const candidateCount = perf.assignedCandidates ?? 0;
                  const activeCases = perf.inProgressCases || 0;
                  const overdue = perf.overdueCases || 0;
                  const completed = perf.completedCases || 0;
                  const performanceRate = parseFloat(perf.completionRate || 0);
                  
                  const perfColor = performanceRate >= 85 ? { bar: "bg-green-500", text: "text-green-600" } : performanceRate >= 70 ? { bar: "bg-yellow-500", text: "text-yellow-600" } : { bar: "bg-red-500", text: "text-red-500" };
                  
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
                          >
                            {initialsFrom(user)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">{fullName(user)}</p>
                            <RoleBadge role={displayRoleName(user)} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{user.email}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">{departmentLabel(user)}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-violet-100 text-violet-700">
                          {candidateCount}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${activeCases >= 20 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"}`}>
                          {activeCases}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${overdue >= 6 ? "bg-red-100 text-red-600" : overdue >= 3 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                          {overdue}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-700 whitespace-nowrap">{completed}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${perfColor.bar}`} style={{ width: `${performanceRate}%` }} />
                          </div>
                          <span className={`text-xs font-black ${perfColor.text}`}>{performanceRate}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={formatStatusLabel(user.status)} onClick={() => handleToggleStatus(user)} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openView(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                            <FiEye size={14} />
                          </button>
                          <button onClick={() => openEdit(user)} className="p-2 text-gray-400 hover:text-secondary hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <FiEdit2 size={14} />
                          </button>
                          <button onClick={() => openDelete(user)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <FiTrash2 size={14} />
                          </button>
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
            Showing <span className="font-bold text-secondary">{caseworkers.length}</span> of{" "}
            <span className="font-bold text-secondary">{pagination.total}</span> caseworkers
          </p>
        </div>
      </div>

      <Modal
        open={isFormModal}
        onClose={closeModal}
        title={
          modal.type === "create"
            ? "Add Caseworker"
            : "Edit Caseworker"
        }
        maxWidthClass="max-w-lg"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">Cancel</Button>
            <Button
              variant="primary"
              onClick={modal.type === "create" ? handleCreate : handleUpdate}
              className="rounded-xl"
            >
              {modal.type === "create" ? "Create Caseworker" : "Update Caseworker"}
            </Button>
          </>
        }
      >
        {modal.type === "create" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={createForm.first_name}
              onChange={handleCreateChange}
              required
              error={errors.first_name}
            />
            <Input
              label="Last Name"
              name="last_name"
              value={createForm.last_name}
              onChange={handleCreateChange}
              required
              error={errors.last_name}
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={createForm.email}
              onChange={handleCreateChange}
              required
              error={errors.email}
            />
            <Input
              label="Country Code"
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
              label="Role"
              name="role_id"
              value={createForm.role_id}
              onChange={handleCreateChange}
              options={ROLE_OPTIONS}
              required
            />
            <Input
              label="Department"
              name="department"
              value={createForm.department}
              onChange={handleCreateChange}
              options={departments}
              required
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
              label="Confirm Password"
              name="confirm_password"
              type="password"
              value={createForm.confirm_password}
              onChange={handleCreateChange}
              required
              error={errors.confirm_password}
            />
          </div>
        )}
        {modal.type === "edit" && editForm && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={editForm.first_name}
              onChange={handleEditChange}
              required
              error={errors.first_name}
            />
            <Input
              label="Last Name"
              name="last_name"
              value={editForm.last_name}
              onChange={handleEditChange}
              required
              error={errors.last_name}
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={editForm.email}
              onChange={handleEditChange}
              required
              error={errors.email}
            />
            <Input
              label="Country Code"
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
              label="Department"
              name="department"
              value={editForm.department}
              onChange={handleEditChange}
              options={departments}
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
        onClose={closeModal}
        title="Caseworker Details"
        maxWidthClass="max-w-4xl"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <Button variant="ghost" onClick={closeModal} className="rounded-xl">Close</Button>
        }
      >
        {viewingDetails && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-sm">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 ${AVATAR_COLORS[(viewingDetails.id || 0) % AVATAR_COLORS.length]}`}>
                {initialsFrom(viewingDetails)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-secondary truncate">{fullName(viewingDetails)}</h3>
                <p className="text-sm text-gray-600">
                  {displayRoleName(viewingDetails)} · {departmentLabel(viewingDetails)}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {viewingDetails.email} · {viewingDetails.country_code} {viewingDetails.mobile}
                </p>
              </div>
              <div className="text-right shrink-0">
                <StatusBadge status={formatStatusLabel(viewingDetails.status)} />
              </div>
            </div>

            {loadingDetails ? (
              <div className="space-y-4 animate-pulse">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-gray-100/80 border border-gray-100" />
                  ))}
                </div>
                <div className="h-10 rounded-xl bg-gray-100/80 border border-gray-100" />
                <div className="space-y-3 max-h-[350px]">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 rounded-xl bg-gray-100/80 border border-gray-100" />
                  ))}
                </div>
                <div className="flex items-center justify-center py-2 gap-2 text-gray-400">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm font-semibold">Loading assigned cases…</span>
                </div>
              </div>
            ) : (
              <>
                {(viewingDetails.metrics || viewingDetails.performance) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: "Total cases",
                        value: viewingDetails.metrics?.totalCases ?? viewingDetails.performance?.totalCases ?? 0,
                        className: "bg-blue-50/80 border-blue-100 text-blue-700",
                      },
                      {
                        label: "In progress",
                        value: viewingDetails.metrics?.inProgressCases ?? viewingDetails.performance?.inProgressCases ?? 0,
                        className: "bg-indigo-50/80 border-indigo-100 text-indigo-700",
                      },
                      {
                        label: "Overdue",
                        value: viewingDetails.metrics?.overdueCases ?? viewingDetails.performance?.overdueCases ?? 0,
                        className: "bg-red-50/80 border-red-100 text-red-700",
                      },
                      {
                        label: "Completion",
                        value: `${parseFloat(viewingDetails.metrics?.completionRate ?? viewingDetails.performance?.completionRate ?? 0).toFixed(0)}%`,
                        className: "bg-emerald-50/80 border-emerald-100 text-emerald-700",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className={`text-center p-3 rounded-xl border backdrop-blur-sm ${stat.className}`}
                      >
                        <p className="text-2xl font-black">{stat.value}</p>
                        <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {(viewingDetails.candidates?.length > 0 ||
                  (viewingDetails.metrics?.assignedCandidates ?? 0) > 0) && (
                  <div className="rounded-xl border border-violet-100/80 bg-violet-50/40 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-violet-800 mb-3">
                      Assigned candidates (
                      {viewingDetails.candidates?.length ??
                        viewingDetails.metrics?.assignedCandidates ??
                        0}
                      )
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {(viewingDetails.candidates || []).map((cand) => (
                        <div
                          key={cand.id}
                          className="inline-flex flex-col px-3 py-2 rounded-xl bg-white border border-violet-100 shadow-sm min-w-[140px]"
                        >
                          <span className="text-xs font-black text-secondary">
                            {candidateDisplayName(cand)}
                          </span>
                          <span className="text-[10px] text-gray-500 truncate max-w-[200px]">
                            {cand.email || "—"}
                          </span>
                          {cand.caseCount > 1 && (
                            <span className="text-[10px] font-bold text-violet-600 mt-0.5">
                              {cand.caseCount} cases
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-gray-100/80 bg-white/60 backdrop-blur-sm p-3">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="search"
                      value={caseSearch}
                      onChange={(e) => setCaseSearch(e.target.value)}
                      placeholder="Search by candidate, case ID, visa type, or status…"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white/80 text-sm font-medium text-secondary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                    />
                  </div>
                </div>

                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Assigned cases
                </p>

                {(() => {
                  const q = caseSearch.trim().toLowerCase();
                  const allCases = viewingDetails.cases || [];
                  const filteredCases = !q
                    ? allCases
                    : allCases.filter((c) => {
                        const candidateName = candidateDisplayName(c.candidate).toLowerCase();
                        const email = (c.candidate?.email || "").toLowerCase();
                        const caseRef = (c.caseId || "").toLowerCase();
                        const visa = (c.visaType?.name || "").toLowerCase();
                        const status = (c.status || "").toLowerCase();
                        const stage = (c.caseStage || "").toLowerCase();
                        return (
                          candidateName.includes(q) ||
                          email.includes(q) ||
                          caseRef.includes(q) ||
                          visa.includes(q) ||
                          status.includes(q) ||
                          stage.includes(q)
                        );
                      });

                  if (filteredCases.length === 0) {
                    return (
                      <div className="py-10 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-500">
                          {allCases.length === 0
                            ? "No active cases assigned to this caseworker."
                            : "No cases match your search."}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3">
                      {filteredCases.map((c) => {
                        const finished = ["Completed", "Approved", "Closed"].includes(c.status);
                        const showOverdue =
                          c.isOverdue ||
                          (c.targetSubmissionDate &&
                            new Date(c.targetSubmissionDate) < new Date() &&
                            !finished);
                        const progress = getStageProgress(
                          c.caseStage,
                          showOverdue ? "Overdue" : c.status,
                        );

                        return (
                          <div
                            key={c.id}
                            className="p-4 rounded-xl border border-gray-100/90 bg-white/75 backdrop-blur-sm shadow-sm hover:border-primary/20 hover:shadow-md transition-all"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-secondary/10 text-secondary text-xs font-black tracking-wide">
                                {c.caseId || `CASE-${c.id}`}
                              </span>
                              <div className="flex flex-wrap items-center gap-2">
                                {showOverdue && (
                                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-200">
                                    Overdue
                                  </span>
                                )}
                                <span className="text-[11px] font-bold text-gray-500">
                                  Due {formatTargetDate(c.targetSubmissionDate)}
                                </span>
                              </div>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm font-semibold text-secondary">
                                {candidateDisplayName(c.candidate)}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 truncate">
                                {c.candidate?.email || "—"}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <span className="text-xs font-bold text-gray-600">
                                {c.visaType?.name || "Visa not set"}
                              </span>
                              <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">
                                {progress.label}
                              </span>
                            </div>

                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden border border-gray-100/80">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${progress.percent}%`,
                                  backgroundColor: progress.color,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={modal.type === "delete"}
        onClose={closeModal}
        title="Delete Caseworker"
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
        title="Bulk Import Caseworkers"
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
                "Import Caseworkers"
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
