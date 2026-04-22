import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RiShieldLine, RiLockLine, RiTeamLine, RiLinksLine,
  RiAlertLine, RiRefreshLine, RiCheckboxCircleLine,
} from "react-icons/ri";
import { getRbacOverview, getOrphanPermissions, getRolesWithoutPermissions } from "../../services/rbacApi";

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-secondary">{value ?? "—"}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </motion.div>
);

const SegregationPanel = () => {
  const [overview, setOverview]         = useState(null);
  const [orphans, setOrphans]           = useState([]);
  const [rolesNoPerms, setRolesNoPerms] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, orphRes, roleRes] = await Promise.all([
        getRbacOverview(),
        getOrphanPermissions(),
        getRolesWithoutPermissions(),
      ]);
      if (ovRes.data?.status === "success")   setOverview(ovRes.data.data);
      if (orphRes.data?.status === "success") setOrphans(orphRes.data.data.permissions || []);
      if (roleRes.data?.status === "success") setRolesNoPerms(roleRes.data.data.roles || []);
    } catch {
      setError("Failed to load RBAC overview data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-3">
        <RiRefreshLine className="text-primary animate-spin" size={28} />
        <p className="text-sm text-gray-500">Loading RBAC overview…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-3 text-center">
        <RiAlertLine className="text-red-400" size={28} />
        <p className="text-sm text-gray-600">{error}</p>
        <button onClick={fetchAll} className="text-sm text-primary font-bold hover:underline">Retry</button>
      </div>
    );
  }

  const { summary, usersByRole, permissionsByModule, rolePermissions } = overview || {};
  const maxUsers = Math.max(...(usersByRole?.map((r) => r.userCount) || [1]), 1);
  const maxPerms = Math.max(...(permissionsByModule?.map((m) => m.count) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={RiShieldLine}  label="Total Roles"       value={summary?.totalRoles}            color="bg-indigo-500"  delay={0} />
        <StatCard icon={RiLockLine}    label="Total Permissions"  value={summary?.totalPermissions}      color="bg-violet-500"  delay={0.05} />
        <StatCard icon={RiTeamLine}    label="Total Users"        value={summary?.totalUsers}            color="bg-sky-500"     delay={0.1} />
        <StatCard icon={RiLinksLine}   label="Role-Permission Links" value={summary?.totalRolePermissions} color="bg-emerald-500" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-black text-secondary">Users by Role</h3>
            <p className="text-xs text-gray-400 mt-0.5">Distribution of users across roles</p>
          </div>
          <div className="p-5 space-y-3">
            {usersByRole?.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No role data available</p>
            )}
            {usersByRole?.map((row) => (
              <div key={row.roleId}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-secondary">{row.roleName}</span>
                  <span className="text-xs text-gray-500">{row.userCount} users</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(row.userCount / maxUsers) * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions by Module */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-black text-secondary">Permissions by Module</h3>
            <p className="text-xs text-gray-400 mt-0.5">How permissions are distributed across modules</p>
          </div>
          <div className="p-5 space-y-3">
            {permissionsByModule?.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No module data available</p>
            )}
            {permissionsByModule?.map((row) => (
              <div key={row.module}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-secondary capitalize">{row.module}</span>
                  <span className="text-xs text-gray-500">{row.count} permissions</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(row.count / maxPerms) * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Permission Summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-black text-secondary">Permission Count per Role</h3>
          <p className="text-xs text-gray-400 mt-0.5">Number of permissions assigned to each role</p>
        </div>
        <div className="overflow-auto max-h-[400px] custom-scrollbar">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="bg-gray-50">
                <th className="px-5 py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-center text-[11px] font-black text-gray-400 uppercase tracking-wider">Permissions</th>
                <th className="px-5 py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {rolePermissions?.map((row) => {
                const maxRolePerms = Math.max(...(rolePermissions.map((r) => r.permissionCount)), 1);
                const pct = summary?.totalPermissions > 0
                  ? Math.round((row.permissionCount / summary.totalPermissions) * 100)
                  : 0;
                return (
                  <tr key={row.roleId} className="hover:bg-gray-50/60 bg-white border-b border-gray-50">
                    <td className="px-5 py-3 font-bold text-secondary border-b border-gray-50">{row.roleName}</td>
                    <td className="px-5 py-3 text-center border-b border-gray-50">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black ${
                        row.permissionCount === 0 ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {row.permissionCount}
                      </span>
                    </td>
                    <td className="px-5 py-3 border-b border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts — Orphan Permissions & Empty Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-xl border p-4 ${orphans.length > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}`}>
          <div className="flex items-center gap-2 mb-2">
            {orphans.length > 0
              ? <RiAlertLine className="text-amber-500 shrink-0" size={16} />
              : <RiCheckboxCircleLine className="text-green-500 shrink-0" size={16} />}
            <p className="text-xs font-black uppercase tracking-wide text-gray-700">
              Unassigned Permissions ({orphans.length})
            </p>
          </div>
          {orphans.length === 0 ? (
            <p className="text-xs text-green-700">All permissions are assigned to at least one role.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {orphans.map((p) => (
                <span key={p.id} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[11px] font-semibold">
                  {p.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={`rounded-xl border p-4 ${rolesNoPerms.length > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
          <div className="flex items-center gap-2 mb-2">
            {rolesNoPerms.length > 0
              ? <RiAlertLine className="text-red-500 shrink-0" size={16} />
              : <RiCheckboxCircleLine className="text-green-500 shrink-0" size={16} />}
            <p className="text-xs font-black uppercase tracking-wide text-gray-700">
              Roles Without Permissions ({rolesNoPerms.length})
            </p>
          </div>
          {rolesNoPerms.length === 0 ? (
            <p className="text-xs text-green-700">All roles have at least one permission.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {rolesNoPerms.map((r) => (
                <span key={r.id} className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[11px] font-semibold">
                  {r.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Refresh */}
      <div className="flex justify-end">
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-primary transition-colors font-semibold"
        >
          <RiRefreshLine size={14} /> Refresh Data
        </button>
      </div>
    </div>
  );
};

export default SegregationPanel;
