import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiShieldLine, RiEditLine, RiDeleteBinLine, RiFileCopyLine,
  RiArrowDownSLine, RiArrowUpSLine, RiRefreshLine, RiAlertLine,
  RiCheckLine, RiCloseLine,
} from "react-icons/ri";
import Modal from "../Modal";
import Button from "../Button";
import Input from "../Input";
import { getAllRoles, createRole, updateRole, deleteRole, cloneRolePermissions, getRoleWithPermissions, assignPermissionsToRole } from "../../services/rolesApi";
import { getAllPermissions } from "../../services/permissionsApi";

const SYSTEM_ROLE_IDS = [1, 2, 3, 4];

const EMPTY_EDIT_FORM = { name: "", description: "" };

const humanize = (str) => {
  if (!str) return "";
  let cleaned = str.replace(/^admin\./i, "");
  cleaned = cleaned.replace(/[._]/g, " ");
  return cleaned.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

const RoleAssignmentPanel = () => {
  const [roles, setRoles]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [expandedRole, setExpanded]     = useState(null);
  const [rolePerms, setRolePerms]       = useState({});      // { roleId: Permission[] }
  const [loadingPerms, setLoadingPerms] = useState({});
  const [allPermissions, setAllPermissions] = useState([]); // For the create modal
  const [modules, setModules] = useState([]);
  const [createAccess, setCreateAccess] = useState({}); // { moduleName: level }

  // Create modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm]   = useState(EMPTY_EDIT_FORM);
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating]       = useState(false);

  // Edit modal
  const [editModal, setEditModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]     = useState(EMPTY_EDIT_FORM);
  const [editErrors, setEditErrors] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteConfirmModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting]           = useState(false);

  // Clone modal
  const [cloneModal, setCloneModal]   = useState(false);
  const [cloneSource, setCloneSource] = useState(null);
  const [cloneTarget, setCloneTarget] = useState("");
  const [cloning, setCloning]         = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roleRes, permRes] = await Promise.all([
        getAllRoles(),
        getAllPermissions()
      ]);
      
      if (roleRes.data?.status === "success") setRoles(roleRes.data.data);
      if (permRes.data?.status === "success") {
        // Flatten permissions from grouped object if necessary
        const grouped = permRes.data.data.permissions || {};
        const flat = Object.values(grouped).flat();
        setAllPermissions(flat);
        setModules(permRes.data.data.modules || []);
      }
    } catch {
      setError("Failed to load roles and permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.name.trim()) { setCreateErrors({ name: "Role name is required" }); return; }
    setCreating(true);
    try {
      const res = await createRole({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
      });
      
      if (res.data?.status === "success") {
        const newRoleId = res.data.data.role.id;
        
        // Collect permission IDs based on selected access levels
        const permissionIds = [];
        Object.entries(createAccess).forEach(([modName, level]) => {
          if (level === "none") return;
          
          const modPerms = allPermissions.filter(p => p.module.trim() === modName);
          modPerms.forEach(p => {
            let shouldAdd = false;
            if (level === "admin") shouldAdd = true;
            else if (level === "viewer") shouldAdd = (p.action === "read" || p.action === "view");
            else if (level === "editor") shouldAdd = ["read", "view", "write", "update", "edit"].includes(p.action);
            
            if (shouldAdd) permissionIds.push(p.id);
          });
        });
        
        // If any permissions selected, assign them
        if (permissionIds.length > 0) {
          await assignPermissionsToRole(newRoleId, { permissionIds });
        }

        showToast(`Role "${createForm.name}" created with module access.`);
        setCreateModal(false);
        setCreateForm(EMPTY_EDIT_FORM);
        setCreateAccess({});
        fetchRoles();
      } else {
        setCreateErrors({ submit: res.data?.message || "Create failed." });
      }
    } catch (err) {
      setCreateErrors({ submit: err.response?.data?.message || "Failed to create role." });
    } finally {
      setCreating(false);
    }
  };

  const toggleExpand = async (roleId) => {
    if (expandedRole === roleId) {
      setExpanded(null);
      return;
    }
    setExpanded(roleId);
    if (rolePerms[roleId]) return; // already loaded
    setLoadingPerms((p) => ({ ...p, [roleId]: true }));
    try {
      const res = await getRoleWithPermissions(roleId);
      if (res.data?.status === "success") {
        setRolePerms((p) => ({ ...p, [roleId]: res.data.data.permissions || [] }));
      }
    } catch {
      setRolePerms((p) => ({ ...p, [roleId]: [] }));
    } finally {
      setLoadingPerms((p) => ({ ...p, [roleId]: false }));
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (role) => {
    setEditTarget(role);
    setEditForm({ name: role.name, description: role.description || "" });
    setEditErrors({});
    setEditModal(true);
  };

  const handleEditSave = async () => {
    const errs = {};
    if (!editForm.name.trim()) errs.name = "Role name is required";
    if (Object.keys(errs).length) { setEditErrors(errs); return; }
    setEditSaving(true);
    try {
      const res = await updateRole(editTarget.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
      });
      if (res.data?.status === "success") {
        showToast(`Role "${editForm.name}" updated.`);
        setEditModal(false);
        fetchRoles();
      } else {
        setEditErrors({ submit: res.data?.message || "Update failed." });
      }
    } catch (err) {
      setEditErrors({ submit: err.response?.data?.message || "Failed to update role." });
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const openDelete = (role) => {
    setDeleteTarget(role);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteRole(deleteTarget.id);
      if (res.data?.status === "success") {
        showToast(`Role "${deleteTarget.name}" deleted.`, "success");
        setDeleteModal(false);
        fetchRoles();
      } else {
        showToast(res.data?.message || "Delete failed.", "error");
        setDeleteModal(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete role.", "error");
      setDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  // ── Clone ──────────────────────────────────────────────────────────────────
  const openClone = (role) => {
    setCloneSource(role);
    setCloneTarget("");
    setCloneModal(true);
  };

  const handleClone = async () => {
    if (!cloneTarget) return;
    setCloning(true);
    try {
      const res = await cloneRolePermissions({ sourceRoleId: cloneSource.id, targetRoleId: Number(cloneTarget) });
      if (res.data?.status === "success") {
        showToast(`Cloned permissions from "${cloneSource.name}" to "${res.data.data.targetRole}".`);
        setCloneModal(false);
        fetchRoles();
      } else {
        showToast(res.data?.message || "Clone failed.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to clone permissions.", "error");
    } finally {
      setCloning(false);
    }
  };

  const getRoleBadgeColor = (roleId) => {
    const colors = ["bg-indigo-100 text-indigo-700", "bg-violet-100 text-violet-700", "bg-sky-100 text-sky-700", "bg-emerald-100 text-emerald-700"];
    return colors[(roleId - 1) % colors.length];
  };

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3">
        <RiRefreshLine className="text-primary animate-spin" size={24} />
        <p className="text-sm text-gray-500">Loading roles…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3 text-center">
        <RiAlertLine className="text-red-400" size={24} />
        <p className="text-sm text-gray-600">{error}</p>
        <button onClick={fetchRoles} className="text-sm text-primary font-bold hover:underline">Retry</button>
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
              toast.type === "error"
                ? "bg-red-600 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            {toast.type === "error" ? <RiAlertLine size={16} /> : <RiCheckLine size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0 shadow-lg shadow-secondary/20">
            <RiShieldLine size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-secondary tracking-tight">Role Management</h2>
            <p className="text-xs text-gray-400 mt-0.5">Configure system-wide roles and their descriptions.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRoles}
            className="p-2.5 text-gray-400 hover:text-secondary hover:bg-gray-100 rounded-xl transition-colors"
            title="Refresh"
          >
            <RiRefreshLine size={18} />
          </button>
          <button
            onClick={() => { setCreateForm(EMPTY_EDIT_FORM); setCreateErrors({}); setCreateModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-md shadow-secondary/10 hover:opacity-90 transition-all"
          >
            <RiShieldLine size={16} />
            Create New Role
          </button>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[500px] custom-scrollbar">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 bg-gray-50 z-10 border-b border-gray-100">Role & Description</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 bg-gray-50 z-10 border-b border-gray-100">Users</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 bg-gray-50 z-10 border-b border-gray-100">Permissions</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 bg-gray-50 z-10 border-b border-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
            {roles.map((role) => (
              <Fragment key={role.id}>
                <tr
                  key={role.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors bg-white ${expandedRole === role.id ? "bg-indigo-50/30" : ""}`}
                >
                  <td className="px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                        <RiShieldLine size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-secondary">{role.name}</span>
                          {SYSTEM_ROLE_IDS.includes(role.id) && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black bg-gray-100 text-gray-500 rounded uppercase tracking-wide">System</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{role.description || "No description"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center border-b border-gray-50">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${getRoleBadgeColor(role.id)}`}>
                      {role.userCount ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center border-b border-gray-50">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700">
                      {role.permissionCount ?? 0} perms
                    </span>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleExpand(role.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-secondary transition-colors"
                        title="View permissions"
                      >
                        {expandedRole === role.id ? <RiArrowUpSLine size={16} /> : <RiArrowDownSLine size={16} />}
                      </button>
                      <button
                        onClick={() => openEdit(role)}
                        className="p-2 rounded-lg hover:bg-secondary/5 text-gray-400 hover:text-secondary transition-colors"
                        title="Edit role"
                      >
                        <RiEditLine size={16} />
                      </button>
                      <button
                        onClick={() => openClone(role)}
                        className="p-2 rounded-lg hover:bg-sky-50 text-gray-400 hover:text-sky-600 transition-colors"
                        title="Clone permissions to another role"
                      >
                        <RiFileCopyLine size={16} />
                      </button>
                      {!SYSTEM_ROLE_IDS.includes(role.id) && (
                        <button
                          onClick={() => openDelete(role)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete role"
                        >
                          <RiDeleteBinLine size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expanded Permissions Row */}
                <AnimatePresence>
                  {expandedRole === role.id && (
                    <tr key={`${role.id}-expanded`} className="bg-white">
                      <td colSpan={4} className="px-5 pb-4 bg-gray-50/50 border-b border-gray-50">
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="pt-4 px-2">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                Role Access Summary — {role.name}
                              </p>
                              <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-blue-400" /> View</span>
                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-indigo-400" /> Edit</span>
                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-secondary" /> Admin</span>
                              </div>
                            </div>

                            {loadingPerms[role.id] ? (
                              <div className="flex items-center justify-center py-10 gap-3 text-sm text-gray-400">
                                <RiRefreshLine className="animate-spin text-secondary" size={20} />
                                Analyzing role permissions...
                              </div>
                            ) : !rolePerms[role.id] || rolePerms[role.id].length === 0 ? (
                              <div className="py-8 text-center text-sm text-gray-400 italic bg-white rounded-2xl border border-dashed border-gray-200">
                                No permissions assigned to this role yet.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {Object.entries(
                                  rolePerms[role.id].reduce((acc, p) => {
                                    const mod = p.module.trim();
                                    if (!acc[mod]) acc[mod] = [];
                                    acc[mod].push(p);
                                    return acc;
                                  }, {})
                                ).sort().map(([modName, perms]) => {
                                  // Determine level
                                  const totalModPerms = allPermissions.filter(p => p.module.trim() === modName).length;
                                  const grantedCount = perms.length;
                                  
                                  let level = "custom";
                                  let color = "bg-amber-50 text-amber-600 border-amber-100";
                                  let label = "Custom Mix";
                                  
                                  if (grantedCount === 0) { level = "none"; label = "No Access"; color = "bg-gray-100 text-gray-400 border-gray-200"; }
                                  else if (grantedCount === totalModPerms) { level = "admin"; label = "Full Admin"; color = "bg-secondary text-white border-secondary"; }
                                  else {
                                    const isViewer = perms.every(p => p.action === "read" || p.action === "view");
                                    const isEditor = perms.every(p => ["read", "view", "write", "update", "edit"].includes(p.action));
                                    if (isViewer) { level = "viewer"; label = "Viewer Only"; color = "bg-blue-50 text-blue-600 border-blue-100"; }
                                    else if (isEditor) { level = "editor"; label = "Editor Access"; color = "bg-indigo-50 text-indigo-600 border-indigo-100"; }
                                  }

                                  return (
                                    <div key={modName} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-secondary/20 transition-colors">
                                      <span className="text-xs font-bold text-secondary">{modName}</span>
                                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${color}`}>
                                        {label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </Fragment>
            ))}
          </tbody>
        </table>
        {roles.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-gray-400">No roles found.</div>
        )}
        </div>
      </div>

      {/* ── Create Modal ───────────────────────────────────────────────────── */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create New Role"
        maxWidthClass="max-w-2xl"
        bodyClassName="px-5 py-5"
        footer={
          <>
            <button
              onClick={() => setCreateModal(false)}
              className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-secondary transition-colors"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-6 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-md shadow-secondary/10 hover:opacity-90 transition-all disabled:opacity-50"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Role"}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {createErrors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{createErrors.submit}</div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Input
                label="Role Name"
                name="name"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                error={createErrors.name}
                placeholder="e.g. Content Manager"
                required
              />
              <Input
                label="Description"
                name="description"
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                placeholder="Briefly describe what this role does"
              />
            </div>
            
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Initial Module Access</label>
              <div className="space-y-2 max-h-[220px] overflow-auto custom-scrollbar pr-2">
                {modules.map(mod => (
                  <div key={mod} className="flex items-center justify-between gap-3 bg-white p-2 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-secondary">{mod}</span>
                    <select
                      value={createAccess[mod] || "none"}
                      onChange={(e) => setCreateAccess(prev => ({ ...prev, [mod]: e.target.value }))}
                      className="text-[10px] font-black uppercase tracking-wider bg-transparent border-none focus:ring-0 cursor-pointer text-secondary"
                    >
                      <option value="none">None</option>
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title={`Edit Role — ${editTarget?.name}`}
        maxWidthClass="max-w-md"
        bodyClassName="px-5 py-5"
        footer={
          <>
            <button
              onClick={() => setEditModal(false)}
              className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-secondary transition-colors"
              disabled={editSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              className="px-6 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-md shadow-secondary/10 hover:opacity-90 transition-all disabled:opacity-50"
              disabled={editSaving}
            >
              {editSaving ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {editErrors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{editErrors.submit}</div>
          )}
          <Input
            label="Role Name"
            name="name"
            value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            error={editErrors.name}
            required
          />
          <Input
            label="Description"
            name="description"
            value={editForm.description}
            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
          />
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ────────────────────────────────────────────── */}
      <Modal
        open={deleteConfirmModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Role"
        maxWidthClass="max-w-sm"
        bodyClassName="px-5 py-5"
        footer={
          <>
            <button
              onClick={() => setDeleteModal(false)}
              className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-secondary transition-colors"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold shadow-md shadow-red-100 hover:bg-red-700 transition-all disabled:opacity-50"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <RiAlertLine className="text-red-500 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-gray-700">
            Are you sure you want to delete the role <strong className="text-secondary">"{deleteTarget?.name}"</strong>?
          </p>
        </div>
      </Modal>

      {/* ── Clone Modal ─────────────────────────────────────────────────────── */}
      <Modal
        open={cloneModal}
        onClose={() => setCloneModal(false)}
        title="Clone Permissions"
        maxWidthClass="max-w-sm"
        bodyClassName="px-5 py-5"
        footer={
          <>
            <button
              onClick={() => setCloneModal(false)}
              className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-secondary transition-colors"
              disabled={cloning}
            >
              Cancel
            </button>
            <button
              onClick={handleClone}
              className="px-6 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-md shadow-secondary/10 hover:opacity-90 transition-all disabled:opacity-50"
              disabled={cloning || !cloneTarget}
            >
              {cloning ? "Cloning..." : "Clone Now"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Copy permissions from <strong className="text-secondary">{cloneSource?.name}</strong> to:
          </p>
          <select
            value={cloneTarget}
            onChange={(e) => setCloneTarget(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
          >
            <option value="">Select target role…</option>
            {roles
              .filter((r) => r.id !== cloneSource?.id)
              .map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
          </select>
        </div>
      </Modal>
    </div>
  );
};

export default RoleAssignmentPanel;
