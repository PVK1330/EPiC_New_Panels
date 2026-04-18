import { useState, useEffect } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiPlus,
  FiDownload,
  FiEye,
  FiRefreshCw,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";
import useCandidate from "../../hooks/useCandidate";
import { useToast } from "../../context/ToastContext";
import {
  createCandidate,
  updateCandidate,
  toggleCandidateStatus,
  resetCandidatePassword,
  deleteCandidate,
} from "../../services/candidateApi";

const PASSWORD_MIN = 6;

const ROLE_CHIPS = {
  candidate: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
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
  role_id: "3",
  password: "",
  confirm_password: "",
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

export default function AdminCandidates() {
  const { showToast } = useToast();
  const { candidates, pagination, loading, fetchCandidates } = useCandidate();

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

  const [saving, setSaving] = useState(false);
  const [toggleId, setToggleId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

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
      const r = await fetchCandidates(
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
    fetchCandidates,
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
      role_id: String(row.role_id ?? 3),
      status: row.status === "inactive" ? "inactive" : "active",
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
      const res = await createCandidate({
        first_name: createForm.first_name.trim(),
        last_name: createForm.last_name.trim(),
        email: createForm.email.trim(),
        country_code: createForm.country_code.trim(),
        mobile: createForm.mobile.trim(),
        role_id: Number(createForm.role_id),
        password: createForm.password,
        confirm_password: createForm.confirm_password,
      });
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
      const res = await updateCandidate(modal.data.id, {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        email: editForm.email.trim(),
        country_code: editForm.country_code.trim(),
        mobile: editForm.mobile.trim(),
        role_id: Number(editForm.role_id),
        status: editForm.status,
      });
      showToast({
        message: res.data?.message || "Candidate updated successfully",
        variant: "success",
      });
      closeModal();
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

  const handleResetSubmit = async () => {
    const errs = validateReset();
    if (Object.keys(errs).length) {
      setResetErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const res = await resetCandidatePassword(modal.data.id, {
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
            Candidates
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage candidate accounts and portal access
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FiDownload size={14} />
            Export
          </button>
          <Button onClick={openCreate} className="rounded-xl shadow-sm">
            <FiPlus size={14} />
            Add Candidate
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
              placeholder="Search candidates…"
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
                {["Name", "Email", "Mobile", "Role", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && candidates.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-gray-400"
                  >
                    No candidates found.
                  </td>
                </tr>
              ) : (
                candidates.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
                        >
                          {initialsFrom(user)}
                        </div>
                        <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                          {fullName(user)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                      {user.country_code} {user.mobile}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                          ROLE_CHIPS[
                            (user.Role?.name || "candidate").toLowerCase()
                          ] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {displayRoleName(user)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={toggleId === user.id}
                        onClick={() => handleToggle(user)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black transition-opacity hover:opacity-90 disabled:opacity-50 ${
                          STATUS_CHIPS[user.status] ??
                          "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {toggleId === user.id
                          ? "…"
                          : formatStatusLabel(user.status)}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
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
                          onClick={() => openReset(user)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Reset password"
                        >
                          <FiRefreshCw size={14} />
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
                ))
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
          modal.type === "create" ? "Create Candidate" : "Edit Candidate"
        }
        maxWidthClass="max-w-lg"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              label="Role"
              name="role_id"
              value={createForm.role_id}
              onChange={handleCreateChange}
              options={ROLE_OPTIONS}
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
              label="Confirm password"
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
        onClose={closeModal}
        title="View Candidate"
        maxWidthClass="max-w-md"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <Button variant="ghost" onClick={closeModal} className="rounded-xl">
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0 ${AVATAR_COLORS[(modal.data?.id || 0) % AVATAR_COLORS.length]}`}
            >
              {modal.data ? initialsFrom(modal.data) : ""}
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">
                {modal.data ? fullName(modal.data) : ""}
              </h3>
              <p className="text-sm text-gray-500">{modal.data?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                Mobile
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {modal.data?.country_code} {modal.data?.mobile}
              </p>
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                Role
              </p>
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-black ${
                  ROLE_CHIPS[
                    (modal.data?.Role?.name || "candidate").toLowerCase()
                  ] ?? "bg-gray-100 text-gray-500"
                }`}
              >
                {modal.data ? displayRoleName(modal.data) : ""}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                Status
              </p>
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-black ${
                  STATUS_CHIPS[modal.data?.status] ??
                  "bg-gray-100 text-gray-500"
                }`}
              >
                {modal.data ? formatStatusLabel(modal.data.status) : ""}
              </span>
            </div>
          </div>
        </div>
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
    </motion.div>
  );
}
