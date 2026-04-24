import { useState, useEffect, useMemo, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiTeamLine, RiShieldLine, RiSearchLine, RiRefreshLine,
  RiAlertLine, RiCheckLine, RiArrowDownSLine, RiArrowUpSLine,
} from "react-icons/ri";
import Modal from "../Modal";
import Button from "../Button";
import { getUsersWithRolesAndPermissions, updateUserRole } from "../../services/rbacApi";
import { getAllRoles } from "../../services/rolesApi";

const UserRolePanel = () => {
  const [users, setUsers]           = useState([]);
  const [roles, setRoles]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  
  const [search, setSearch]         = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [expandedUser, setExpanded] = useState(null);

  // Update Role Modal
  const [updateModal, setUpdateModal] = useState(false);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [updating, setUpdating]       = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        getUsersWithRolesAndPermissions(),
        getAllRoles(),
      ]);
      
      if (usersRes.data?.status === "success") {
        setUsers(usersRes.data.data.users);
      }
      if (rolesRes.data?.status === "success") {
        setRoles(rolesRes.data.data);
      }
    } catch {
      setError("Failed to load users and roles data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const visibleUsers = useMemo(() => {
    return users.filter((u) => {
      if (filterRole !== "all" && u.role?.id !== Number(filterRole)) return false;
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        u.first_name.toLowerCase().includes(term) ||
        u.last_name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    });
  }, [users, search, filterRole]);

  const toggleExpand = (userId) => {
    setExpanded(expandedUser === userId ? null : userId);
  };

  const openUpdateRole = (user) => {
    setUpdateTarget(user);
    setSelectedRoleId(user.role?.id || "");
    setUpdateModal(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedRoleId) return;
    setUpdating(true);
    try {
      const res = await updateUserRole(updateTarget.id, Number(selectedRoleId));
      if (res.data?.status === "success") {
        showToast(`Updated role for ${updateTarget.first_name} ${updateTarget.last_name}.`);
        setUpdateModal(false);
        fetchData();
      } else {
        showToast(res.data?.message || "Update failed.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update user role.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "inactive": return "bg-gray-100 text-gray-700";
      case "suspended": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3">
        <RiRefreshLine className="text-primary animate-spin" size={24} />
        <p className="text-sm text-gray-500">Loading user roles…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3 text-center">
        <RiAlertLine className="text-red-400" size={24} />
        <p className="text-sm text-gray-600">{error}</p>
        <button onClick={fetchData} className="text-sm text-primary font-bold hover:underline">Retry</button>
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
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <RiShieldLine className="text-gray-400" size={15} />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 max-w-[150px] truncate"
            >
              <option value="all">All Roles</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <span className="text-xs text-gray-400 font-semibold">{visibleUsers.length} users</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="text-gray-400 hover:text-primary transition-colors" title="Refresh">
            <RiRefreshLine size={16} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[500px] custom-scrollbar">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-5 py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Current Role</th>
                <th className="px-5 py-3 text-center text-[11px] font-black text-gray-400 uppercase tracking-wider hidden md:table-cell">Permissions</th>
                <th className="px-5 py-3 text-right text-[11px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
            {visibleUsers.map((user) => (
              <Fragment key={user.id}>
                <tr
                  key={user.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors bg-white ${expandedUser === user.id ? "bg-indigo-50/30" : ""}`}
                >
                  <td className="px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white uppercase">
                          {user.first_name[0]}{user.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-secondary">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[150px] sm:max-w-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell border-b border-gray-50">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-50">
                    {user.role ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold">
                        <RiShieldLine size={12} />
                        {user.role.name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No Role Assigned</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center hidden md:table-cell border-b border-gray-50">
                    <span className="text-xs font-semibold text-gray-500">
                      {user.totalPermissions || 0}
                    </span>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleExpand(user.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-secondary transition-colors text-xs font-semibold flex items-center gap-1"
                      >
                        {expandedUser === user.id ? "Hide Perms" : "View Perms"}
                        {expandedUser === user.id ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
                      </button>
                      <button
                        onClick={() => openUpdateRole(user)}
                        className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-primary hover:text-white text-secondary border border-gray-200 transition-colors text-xs font-bold shadow-sm"
                      >
                        Change Role
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Effective Permissions */}
                <AnimatePresence>
                  {expandedUser === user.id && (
                    <tr key={`${user.id}-expanded`} className="bg-white">
                      <td colSpan={5} className="px-5 pb-4 bg-indigo-50/30 border-b border-gray-50">
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="pt-2">
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                              <RiShieldLine size={14} />
                              Effective Permissions for {user.first_name} ({user.totalPermissions || 0} total)
                            </p>
                            {!user.role || user.totalPermissions === 0 ? (
                              <p className="text-xs text-gray-500 italic">User has no permissions via their current role.</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(user.permissions || {}).map(([module, perms]) => (
                                  <div key={module} className="bg-white rounded-lg p-2.5 shadow-sm border border-indigo-100">
                                    <div className="text-[10px] font-black text-indigo-800 uppercase tracking-wide mb-1.5 border-b border-indigo-50 pb-1">
                                      {module}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {perms.map(p => (
                                        <span key={p.id} className="text-[10px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-100 font-semibold" title={p.description}>
                                          {p.action}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
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
        {visibleUsers.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
            {search || filterRole !== "all" ? "No users match your filters." : "No users found."}
          </div>
        )}
        </div>
      </div>

      {/* ── Update Role Modal ──────────────────────────────────────────────── */}
      <Modal
        open={updateModal}
        onClose={() => setUpdateModal(false)}
        title="Change User Role"
        maxWidthClass="max-w-sm"
        bodyClassName="px-5 py-5"
        footer={
          <>
            <Button variant="ghost" onClick={() => setUpdateModal(false)} disabled={updating}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdateRole} disabled={updating || !selectedRoleId}>
              {updating ? "Saving…" : "Save Role"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-sm font-bold text-white uppercase">
                {updateTarget?.first_name?.[0]}{updateTarget?.last_name?.[0]}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-secondary truncate">{updateTarget?.first_name} {updateTarget?.last_name}</p>
              <p className="text-xs text-gray-500 truncate">{updateTarget?.email}</p>
            </div>
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1.5">Assign Role</label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="" disabled>Select a role…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name} {r.id === updateTarget?.role?.id ? "(Current)" : ""}</option>
              ))}
            </select>
          </div>
          
          {selectedRoleId && roles.find(r => r.id === Number(selectedRoleId)) && (
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800">
              User will inherit <strong>{roles.find(r => r.id === Number(selectedRoleId)).permissionCount || 0} permissions</strong> from this role.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default UserRolePanel;
