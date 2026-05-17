import { useState, useEffect, useMemo, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiLockLine, RiAddLine, RiEditLine, RiDeleteBinLine,
  RiRefreshLine, RiAlertLine, RiCheckLine, RiSearchLine,
  RiArrowDownSLine, RiArrowUpSLine, RiFilter3Line, RiCloseLine,
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
  <div className="space-y-4">
    <Input
      label="Technical Name (e.g. users.create)"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
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

const humanize = (str) => {
  if (!str) return "";
  // Remove "admin." prefix if exists
  let cleaned = str.replace(/^admin\./i, "");
  // Replace dots and underscores with spaces
  cleaned = cleaned.replace(/[._]/g, " ");
  // Title case
  return cleaned.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

const PermissionManagementPanel = () => {
  const [grouped, setGrouped] = useState({});
  const [allModules, setAllModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("all");

  // Create modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editErrors, setEditErrors] = useState({});
  const [editing, setEditing] = useState(false);

  // Delete confirm
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const [collapsed, setCollapsed] = useState({});
  const toggleCollapse = (mod) => setCollapsed(prev => ({ ...prev, [mod]: !prev[mod] }));
  const expandAll = () => setCollapsed({});
  const collapseAll = () => {
    const all = {};
    Object.keys(visibleGrouped).forEach(m => all[m] = true);
    setCollapsed(all);
  };

  useEffect(() => { fetchPermissions(); }, []);

  // Filtered view — client-side filter runs on top of whatever the API returned
  const visibleGrouped = useMemo(() => {
    const result = {};
    Object.entries(grouped).forEach(([module, perms]) => {
      const normalizedModule = module.trim();
      if (filterModule !== "all" && normalizedModule !== filterModule) return;
      
      const filtered = perms.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description || "").toLowerCase().includes(search.toLowerCase()) ||
          p.action.toLowerCase().includes(search.toLowerCase()) ||
          p.module.toLowerCase().includes(search.toLowerCase())
      );
      
      if (filtered.length > 0) {
        if (!result[normalizedModule]) result[normalizedModule] = [];
        result[normalizedModule].push(...filtered);
      }
    });
    return result;
  }, [grouped, search, filterModule]);

  const totalVisible = Object.values(visibleGrouped).reduce((s, a) => s + a.length, 0);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = (form) => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Permission name is required";
    if (!form.module.trim()) errs.module = "Module is required";
    if (!form.action.trim()) errs.action = "Action is required";
    return errs;
  };

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    const errs = validateForm(createForm);
    if (Object.keys(errs).length) { setCreateErrors(errs); return; }
    setCreating(true);
    try {
      const res = await createPermission({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        module: createForm.module.trim(),
        action: createForm.action.trim(),
        resource: createForm.resource.trim() || null,
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
      name: perm.name,
      description: perm.description || "",
      module: perm.module,
      action: perm.action,
      resource: perm.resource || "",
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
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        module: editForm.module.trim(),
        action: editForm.action.trim(),
        resource: editForm.resource.trim() || null,
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
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-sm font-black tracking-tight text-white ${
              toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
            }`}
          >
            {toast.type === "error" ? <RiAlertLine size={20} /> : <RiCheckLine size={20} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0 shadow-lg shadow-secondary/20">
            <RiLockLine size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-secondary tracking-tight">Permissions Repository</h2>
            <p className="text-xs text-gray-400 mt-0.5">Define granular access points and map them to system modules.</p>
          </div>
        </div>
        
        <button
          onClick={() => { setCreateForm(EMPTY_FORM); setCreateErrors({}); setCreateModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary/10 hover:opacity-90 transition-all hover:-translate-y-0.5"
        >
          <RiAddLine size={18} />
          Create New Permission
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, action or description..."
              className="w-full pl-12 pr-4 py-3 text-sm bg-gray-50/50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 placeholder:text-gray-400 font-medium"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50/50 px-3 py-1.5 rounded-xl border border-transparent hover:border-gray-100 transition-colors">
            <RiFilter3Line className="text-gray-400" size={16} />
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="bg-transparent text-sm border-none focus:ring-0 font-bold text-secondary cursor-pointer min-w-[120px]"
            >
              <option value="all">All Modules</option>
              {allModules.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2">
          <button onClick={expandAll} className="text-[10px] font-black text-gray-400 hover:text-secondary uppercase tracking-widest px-2 py-1 transition-colors">Expand All</button>
          <div className="w-[1px] h-3 bg-gray-200" />
          <button onClick={collapseAll} className="text-[10px] font-black text-gray-400 hover:text-secondary uppercase tracking-widest px-2 py-1 transition-colors">Collapse All</button>
          <button
            onClick={() => fetchPermissions()}
            className={`p-2.5 rounded-xl transition-all ${loading ? 'text-secondary bg-secondary/5' : 'text-gray-400 hover:bg-gray-100 hover:text-secondary'}`}
            title="Refresh list"
          >
            <RiRefreshLine size={18} className={loading ? "animate-spin" : ""} />
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
                className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-gray-50 transition-colors sticky top-0 z-20 group border-b border-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isCollapsed ? 'bg-gray-100 text-gray-400' : 'bg-secondary/10 text-secondary'}`}>
                    <RiLockLine size={18} />
                  </div>
                  <div className="text-left">
                    <span className="text-base font-black text-secondary tracking-tight block">
                      {humanize(module)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{perms.length} Permissions Defined</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${isCollapsed ? 'bg-gray-200' : 'bg-secondary animate-pulse'}`} />
                   <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
                     {isCollapsed ? <RiArrowDownSLine size={20} className="text-gray-400" /> : <RiArrowUpSLine size={20} className="text-gray-400" />}
                   </div>
                </div>
              </button>

              {/* Ultra-Simplified Permission Pills */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gray-50/20 p-5"
                  >
                    <div className="flex flex-wrap gap-2">
                      {perms.map((perm) => (
                        <div
                          key={perm.id}
                          className="group relative"
                        >
                          <button
                            onClick={() => openEdit(perm)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-secondary shadow-sm hover:border-secondary/30 hover:shadow-md transition-all active:scale-95"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary/40 group-hover:bg-secondary animate-pulse" />
                            {humanize(perm.name)}
                          </button>
                          
                          {/* Floating Delete - Small & Discreet */}
                          <button
                            onClick={(e) => { e.stopPropagation(); openDelete(perm); }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                          >
                            <RiCloseLine size={10} />
                          </button>
                        </div>
                      ))}
                      
                      {/* Quick Add Pill */}
                      <button
                        onClick={() => { setCreateForm({ ...EMPTY_FORM, module: module }); setCreateErrors({}); setCreateModal(true); }}
                        className="px-4 py-2 border border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:border-secondary hover:text-secondary transition-all flex items-center gap-2"
                      >
                        <RiAddLine size={14} />
                        New
                      </button>
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
