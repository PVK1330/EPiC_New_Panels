import { useState, useEffect, useMemo, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiLockLine, RiAddLine, RiEditLine, RiDeleteBinLine,
  RiRefreshLine, RiAlertLine, RiCheckLine, RiSearchLine,
  RiArrowDownSLine, RiArrowUpSLine, RiFilter3Line,
} from "react-icons/ri";
import Modal from "../Modal";
import Button from "../Button";
import Input from "../Input";
import {
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../../services/permissionsApi";
import { MODULE_ACTION_OPTIONS, DEFAULT_MODULES } from "./permissionsData";

const EMPTY_FORM = {
  name: "",
  description: "",
  module: "",
  action: "",
  resource: "",
};

const MODULE_COLORS = [
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-sky-100 text-sky-700 border-sky-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-teal-100 text-teal-700 border-teal-200",
  "bg-orange-100 text-orange-700 border-orange-200",
];

const getModuleColor = (module, allModules) => {
  const idx = allModules.indexOf(module);
  return MODULE_COLORS[idx % MODULE_COLORS.length] || MODULE_COLORS[0];
};

// ── PermissionForm lifted outside to prevent remount on parent re-renders ──
const PermissionForm = ({ form, setForm, errors }) => (
  <div className="space-y-3">
    {errors.submit && (
      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{errors.submit}</div>
    )}
    <Input
      label="Permission Name"
      name="name"
      value={form.name}
      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      placeholder="e.g. cases.read"
      error={errors.name}
      required
    />
    <Input
      label="Description"
      name="description"
      value={form.description}
      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      rows={2}
      placeholder="What this permission allows"
    />
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">
          Module <span className="text-primary">*</span>
        </label>
        <input
          list="module-list"
          value={form.module}
          onChange={(e) => setForm((f) => ({ ...f, module: e.target.value }))}
          placeholder="e.g. Cases"
          className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 ${errors.module ? "border-red-400" : "border-gray-200"}`}
        />
        <datalist id="module-list">
          {DEFAULT_MODULES.map((m) => <option key={m} value={m} />)}
        </datalist>
        {errors.module && <span className="text-xs text-red-500 mt-0.5">{errors.module}</span>}
      </div>
      <div>
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">
          Action <span className="text-primary">*</span>
        </label>
        <input
          list="action-list"
          value={form.action}
          onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
          placeholder="e.g. read"
          className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 ${errors.action ? "border-red-400" : "border-gray-200"}`}
        />
        <datalist id="action-list">
          {MODULE_ACTION_OPTIONS.map((a) => <option key={a.value} value={a.value} />)}
        </datalist>
        {errors.action && <span className="text-xs text-red-500 mt-0.5">{errors.action}</span>}
      </div>
    </div>
    <Input
      label="Resource (optional)"
      name="resource"
      value={form.resource}
      onChange={(e) => setForm((f) => ({ ...f, resource: e.target.value }))}
      placeholder="e.g. own, all, assigned"
    />
  </div>
);

const PermissionManagementPanel = () => {
  const [grouped, setGrouped]           = useState({});
  const [allModules, setAllModules]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [collapsed, setCollapsed]       = useState({});

  // Create modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm]   = useState(EMPTY_FORM);
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating]       = useState(false);

  // Edit modal
  const [editModal, setEditModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [editForm, setEditForm]       = useState(EMPTY_FORM);
  const [editErrors, setEditErrors]   = useState({});
  const [editing, setEditing]         = useState(false);

  // Delete confirm
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPermissions = async (q = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = q ? { search: q } : {};
      const res = await getAllPermissions(params);
      if (res.data?.status === "success") {
        setGrouped(res.data.data.permissions);
        const mods = res.data.data.modules || [];
        setAllModules(mods);
        // Init collapsed state — preserve existing collapsed prefs
        const initCollapsed = {};
        mods.forEach((m) => { initCollapsed[m] = false; });
        setCollapsed((prev) => ({ ...initCollapsed, ...prev }));
      } else {
        setError("Unexpected response.");
      }
    } catch {
      setError("Failed to load permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPermissions(); }, []);

  // Filtered view — client-side filter runs on top of whatever the API returned
  const visibleGrouped = useMemo(() => {
    const result = {};
    Object.entries(grouped).forEach(([module, perms]) => {
      if (filterModule !== "all" && module !== filterModule) return;
      const filtered = perms.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description || "").toLowerCase().includes(search.toLowerCase()) ||
          p.action.toLowerCase().includes(search.toLowerCase()) ||
          p.module.toLowerCase().includes(search.toLowerCase())
      );
      if (filtered.length > 0) result[module] = filtered;
    });
    return result;
  }, [grouped, search, filterModule]);

  const totalVisible = Object.values(visibleGrouped).reduce((s, a) => s + a.length, 0);

  const toggleCollapse = (mod) =>
    setCollapsed((p) => ({ ...p, [mod]: !p[mod] }));

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = (form) => {
    const errs = {};
    if (!form.name.trim())   errs.name   = "Permission name is required";
    if (!form.module.trim()) errs.module  = "Module is required";
    if (!form.action.trim()) errs.action  = "Action is required";
    return errs;
  };

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    const errs = validateForm(createForm);
    if (Object.keys(errs).length) { setCreateErrors(errs); return; }
    setCreating(true);
    try {
      const res = await createPermission({
        name:        createForm.name.trim(),
        description: createForm.description.trim(),
        module:      createForm.module.trim(),
        action:      createForm.action.trim(),
        resource:    createForm.resource.trim() || null,
      });
      if (res.data?.status === "success") {
        showToast(`Permission "${createForm.name}" created.`);
        setCreateModal(false);
        setCreateForm(EMPTY_FORM);
        fetchPermissions();
      } else {
        setCreateErrors({ submit: res.data?.message || "Create failed." });
      }
    } catch (err) {
      setCreateErrors({ submit: err.response?.data?.message || "Failed to create permission." });
    } finally {
      setCreating(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = (perm) => {
    setEditTarget(perm);
    setEditForm({
      name:        perm.name,
      description: perm.description || "",
      module:      perm.module,
      action:      perm.action,
      resource:    perm.resource || "",
    });
    setEditErrors({});
    setEditModal(true);
  };

  const handleEdit = async () => {
    const errs = validateForm(editForm);
    if (Object.keys(errs).length) { setEditErrors(errs); return; }
    setEditing(true);
    try {
      const res = await updatePermission(editTarget.id, {
        name:        editForm.name.trim(),
        description: editForm.description.trim(),
        module:      editForm.module.trim(),
        action:      editForm.action.trim(),
        resource:    editForm.resource.trim() || null,
      });
      if (res.data?.status === "success") {
        showToast(`Permission "${editForm.name}" updated.`);
        setEditModal(false);
        fetchPermissions();
      } else {
        setEditErrors({ submit: res.data?.message || "Update failed." });
      }
    } catch (err) {
      setEditErrors({ submit: err.response?.data?.message || "Failed to update permission." });
    } finally {
      setEditing(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const openDelete = (perm) => {
    setDeleteTarget(perm);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await deletePermission(deleteTarget.id);
      if (res.data?.status === "success") {
        showToast(`Permission "${deleteTarget.name}" deleted.`);
        setDeleteModal(false);
        fetchPermissions();
      } else {
        showToast(res.data?.message || "Delete failed.", "error");
        setDeleteModal(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete permission.", "error");
      setDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3">
        <RiRefreshLine className="text-primary animate-spin" size={24} />
        <p className="text-sm text-gray-500">Loading permissions…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3 text-center">
        <RiAlertLine className="text-red-400" size={24} />
        <p className="text-sm text-gray-600">{error}</p>
        <button onClick={() => fetchPermissions()} className="text-sm text-primary font-bold hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${
              toast.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"
            }`}
          >
            {toast.type === "error" ? <RiAlertLine size={16} /> : <RiCheckLine size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-xs">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search permissions…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <RiFilter3Line className="text-gray-400" size={15} />
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All Modules</option>
              {allModules.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <span className="text-xs text-gray-400 font-semibold">{totalVisible} permissions</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => fetchPermissions()} className="text-gray-400 hover:text-primary transition-colors" title="Refresh">
            <RiRefreshLine size={16} />
          </button>
          <button
            onClick={() => { setCreateForm(EMPTY_FORM); setCreateErrors({}); setCreateModal(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
          >
            <RiAddLine size={15} />
            New Permission
          </button>
        </div>
      </div>

      {/* Grouped Permissions */}
      {Object.keys(visibleGrouped).length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
          <RiLockLine className="mx-auto text-gray-300 mb-2" size={28} />
          <p className="text-sm text-gray-400">
            {search || filterModule !== "all" ? "No permissions match your filters." : "No permissions found."}
          </p>
        </div>
      ) : (
        Object.entries(visibleGrouped).map(([module, perms]) => {
          const colorClass = getModuleColor(module, allModules);
          const isCollapsed = collapsed[module];
          return (
            <div key={module} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Module Header (Sticky) */}
              <button
                type="button"
                onClick={() => toggleCollapse(module)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-100 hover:bg-gray-100/60 transition-colors sticky top-0 z-20"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${colorClass}`}>
                    {module}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">{perms.length} permissions</span>
                </div>
                {isCollapsed ? <RiArrowDownSLine size={18} className="text-gray-400" /> : <RiArrowUpSLine size={18} className="text-gray-400" />}
              </button>

              {/* Permission Rows */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white"
                  >
                    <div className="overflow-auto max-h-[400px] custom-scrollbar">
                      <table className="w-full text-sm border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10 bg-white">
                          <tr className="border-b border-gray-50 bg-white">
                            <th className="px-5 py-2.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-5 py-2.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider hidden sm:table-cell">Action</th>
                            <th className="px-5 py-2.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider hidden md:table-cell">Resource</th>
                            <th className="px-5 py-2.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider hidden lg:table-cell">Description</th>
                            <th className="px-5 py-2.5 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                        {perms.map((perm) => (
                          <tr key={perm.id} className="hover:bg-gray-50/60 transition-colors bg-white">
                            <td className="px-5 py-3 border-b border-gray-50">
                              <div className="flex items-center gap-2">
                                <RiLockLine size={13} className="text-gray-300 shrink-0" />
                                <span className="font-semibold text-secondary text-xs">{perm.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 border-b border-gray-50 hidden sm:table-cell">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[11px] font-bold capitalize">
                                {perm.action}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs text-gray-400 border-b border-gray-50 hidden md:table-cell">
                              {perm.resource || <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-5 py-3 text-xs text-gray-400 truncate max-w-xs border-b border-gray-50 hidden lg:table-cell">
                              {perm.description || <span className="text-gray-300">No description</span>}
                            </td>
                            <td className="px-5 py-3 border-b border-gray-50">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEdit(perm)}
                                  className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                                  title="Edit permission"
                                >
                                  <RiEditLine size={14} />
                                </button>
                                <button
                                  onClick={() => openDelete(perm)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                  title="Delete permission"
                                >
                                  <RiDeleteBinLine size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}

      {/* ── Create Modal ─────────────────────────────────────────────────────── */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Permission"
        maxWidthClass="max-w-lg"
        bodyClassName="px-5 py-5"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateModal(false)} disabled={creating}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} disabled={creating}>
              {creating ? "Creating…" : "Create Permission"}
            </Button>
          </>
        }
      >
        <PermissionForm form={createForm} setForm={setCreateForm} errors={createErrors} />
      </Modal>

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title={`Edit Permission — ${editTarget?.name}`}
        maxWidthClass="max-w-lg"
        bodyClassName="px-5 py-5"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditModal(false)} disabled={editing}>Cancel</Button>
            <Button variant="primary" onClick={handleEdit} disabled={editing}>
              {editing ? "Saving…" : "Save Changes"}
            </Button>
          </>
        }
      >
        <PermissionForm form={editForm} setForm={setEditForm} errors={editErrors} />
      </Modal>

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Permission"
        maxWidthClass="max-w-sm"
        bodyClassName="px-5 py-5"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Yes, Delete"}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <RiAlertLine className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm text-gray-700 mb-1">
              Delete permission <strong className="text-secondary">"{deleteTarget?.name}"</strong>?
            </p>
            <p className="text-xs text-gray-500">This will remove it from all roles that currently use it.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PermissionManagementPanel;
