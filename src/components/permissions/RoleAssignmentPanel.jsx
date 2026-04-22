import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiShieldLine, RiEditLine, RiDeleteBinLine, RiFileCopyLine,
  RiArrowDownSLine, RiArrowUpSLine, RiRefreshLine, RiAlertLine,
  RiCheckLine, RiCloseLine,
} from "react-icons/ri";
import Modal from "../Modal";
import Button from "../Button";
import Input from "../Input";
import { getAllRoles, updateRole, deleteRole, cloneRolePermissions, getRoleWithPermissions } from "../../services/rolesApi";

const SYSTEM_ROLE_IDS = [1, 2, 3, 4];

const EMPTY_EDIT_FORM = { name: "", description: "" };

const RoleAssignmentPanel = () => {
  const [roles, setRoles]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [expandedRole, setExpanded]     = useState(null);
  const [rolePerms, setRolePerms]       = useState({});      // { roleId: Permission[] }
  const [loadingPerms, setLoadingPerms] = useState({});

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
      const res = await getAllRoles();
      if (res.data?.status === "success") setRoles(res.data.data);
      else setError("Unexpected response from server.");
    } catch {
      setError("Failed to load roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-secondary">Role Management</h2>
          <p className="text-xs text-gray-400 mt-0.5">View, edit, delete and clone roles. System roles (1–4) are protected.</p>
        </div>
        <button onClick={fetchRoles} className="text-gray-400 hover:text-primary transition-colors" title="Refresh">
          <RiRefreshLine size={16} />
        </button>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[500px] custom-scrollbar">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-center text-[11px] font-black text-gray-400 uppercase tracking-wider">Users</th>
                <th className="px-5 py-3 text-center text-[11px] font-black text-gray-400 uppercase tracking-wider">Permissions</th>
                <th className="px-5 py-3 text-right text-[11px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
            {roles.map((role) => (
              <>
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
                        className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
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
                      <td colSpan={4} className="px-5 pb-4 bg-indigo-50/30 border-b border-gray-50">
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="pt-2">
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide mb-2">
                              Permissions assigned to {role.name}
                            </p>
                            {loadingPerms[role.id] ? (
                              <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                                <RiRefreshLine className="animate-spin" size={14} />
                                Loading permissions…
                              </div>
                            ) : rolePerms[role.id]?.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">No permissions assigned.</p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {rolePerms[role.id]?.map((p) => (
                                  <span key={p.id} className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-semibold">
                                    {p.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </>
            ))}
          </tbody>
        </table>
        {roles.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-gray-400">No roles found.</div>
        )}
        </div>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title={`Edit Role — ${editTarget?.name}`}
        maxWidthClass="max-w-md"
        bodyClassName="px-5 py-5"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditModal(false)} disabled={editSaving}>Cancel</Button>
            <Button variant="primary" onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? "Saving…" : "Save Changes"}
            </Button>
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
            placeholder="What this role is allowed to do"
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
            <Button variant="ghost" onClick={() => setDeleteModal(false)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Yes, Delete"}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <RiAlertLine className="text-red-500 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-gray-700">
            Are you sure you want to delete the role <strong className="text-secondary">"{deleteTarget?.name}"</strong>?
            This action cannot be undone.
          </p>
        </div>
      </Modal>

      {/* ── Clone Modal ─────────────────────────────────────────────────────── */}
      <Modal
        open={cloneModal}
        onClose={() => setCloneModal(false)}
        title={`Clone Permissions from "${cloneSource?.name}"`}
        maxWidthClass="max-w-sm"
        bodyClassName="px-5 py-5"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCloneModal(false)} disabled={cloning}>Cancel</Button>
            <Button variant="primary" onClick={handleClone} disabled={cloning || !cloneTarget}>
              {cloning ? "Cloning…" : "Clone Permissions"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            This will <strong>replace</strong> the target role's permissions with those from <strong>{cloneSource?.name}</strong>.
          </p>
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1.5">Target Role</label>
            <select
              value={cloneTarget}
              onChange={(e) => setCloneTarget(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select a role…</option>
              {roles
                .filter((r) => r.id !== cloneSource?.id)
                .map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoleAssignmentPanel;
