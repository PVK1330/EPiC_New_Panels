import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RiShieldLine, RiLockLine, RiTeamLine, RiLinksLine,
  RiAlertLine, RiRefreshLine, RiCheckboxCircleLine,
  RiBarChartBoxLine,
} from "react-icons/ri";
import { getRbacOverview, getOrphanPermissions, getRolesWithoutPermissions } from "../../services/rbacApi";

// primary = #C8102E, secondary = #004ca5
const STAT_CONFIGS = [
  { key: "totalRoles",         icon: RiShieldLine, label: "Total Roles",            delay: 0 },
  { key: "totalPermissions",   icon: RiLockLine,   label: "Permissions",             delay: 0.06 },
  { key: "totalUsers",         icon: RiTeamLine,   label: "Total Users",             delay: 0.12 },
  { key: "totalRolePermissions", icon: RiLinksLine, label: "Role-Permission Links",  delay: 0.18 },
];

const StatCard = ({ icon: Icon, label, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}
    className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 group hover:shadow-md transition-shadow duration-200"
  >
    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-secondary/5 group-hover:bg-secondary/10 transition-colors" />
    <div className="relative w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0 shadow-md">
      <Icon size={22} className="text-white" />
    </div>
    <div className="relative">
      <p className="text-3xl font-black text-secondary leading-none">{value ?? "—"}</p>
      <p className="text-xs font-bold mt-1 text-primary">{label}</p>
    </div>
  </motion.div>
);

const SectionCard = ({ title, subtitle, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
      <h3 className="text-sm font-black text-secondary">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

const BarRow = ({ label, value, max, variant, delay }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const barClass = variant === "secondary"
    ? "bg-gradient-to-r from-secondary to-secondary-light"
    : "bg-gradient-to-r from-secondary to-primary";
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-bold text-secondary capitalize group-hover:text-primary transition-colors">
          {label}
        </span>
        <span className="text-xs text-gray-400 font-semibold tabular-nums">{value}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay, ease: "easeOut" }}
          className={`h-2 rounded-full ${barClass}`}
        />
      </div>
    </div>
  );
};

const AlertCard = ({ title, count, items, emptyMsg, type }) => {
  const isWarning = type === "warning";
  const hasIssues = count > 0;
  const config = hasIssues
    ? isWarning
      ? { bg: "bg-amber-50", border: "border-amber-200", title: "text-amber-800", icon: "text-amber-500", tag: "bg-amber-100 text-amber-800 border-amber-200" }
      : { bg: "bg-red-50", border: "border-red-200", title: "text-red-800", icon: "text-primary", tag: "bg-red-100 text-red-700 border-red-200" }
    : { bg: "bg-green-50", border: "border-green-200", title: "text-green-800", icon: "text-green-500", tag: "" };

  return (
    <div className={`rounded-2xl border p-5 ${config.bg} ${config.border}`}>
      <div className="flex items-center gap-2.5 mb-3">
        {hasIssues
          ? <RiAlertLine className={`shrink-0 ${config.icon}`} size={18} />
          : <RiCheckboxCircleLine className="shrink-0 text-green-500" size={18} />}
        <div>
          <p className={`text-xs font-black uppercase tracking-wide ${config.title}`}>{title}</p>
          <p className="text-[11px] text-gray-500">{count} found</p>
        </div>
      </div>
      {!hasIssues ? (
        <p className="text-xs text-green-700 font-medium">{emptyMsg}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
          {items.map((item) => (
            <span key={item.id} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${config.tag}`}>
              {item.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const SegregationPanel = () => {
  const [overview, setOverview]     = useState(null);
  const [orphans, setOrphans]       = useState([]);
  const [rolesNoPerms, setRolesNoPerms] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
          <RiRefreshLine className="text-white animate-spin" size={22} />
        </div>
        <p className="text-sm font-semibold text-gray-500">Loading RBAC overview…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
          <RiAlertLine className="text-primary" size={22} />
        </div>
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={fetchAll}
          className="px-4 py-2 rounded-xl bg-secondary text-white text-sm font-bold hover:bg-secondary-dark transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { summary, usersByRole, permissionsByModule, rolePermissions } = overview || {};
  const maxUsers     = Math.max(...(usersByRole?.map((r) => r.userCount) || [1]), 1);
  const maxPerms     = Math.max(...(permissionsByModule?.map((m) => m.count) || [1]), 1);
  const maxRolePerms = Math.max(...(rolePermissions?.map((r) => r.permissionCount) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CONFIGS.map((cfg) => (
          <StatCard key={cfg.key} icon={cfg.icon} label={cfg.label} value={summary?.[cfg.key]} delay={cfg.delay} />
        ))}
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Users by Role" subtitle="Distribution of users across roles" delay={0.1}>
          <div className="space-y-4">
            {usersByRole?.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No role data available</p>
            )}
            {usersByRole?.map((row, i) => (
              <BarRow key={row.roleId} label={row.roleName} value={row.userCount} max={maxUsers} variant="secondary" delay={0.1 + i * 0.05} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Permissions by Module" subtitle="How permissions are distributed across modules" delay={0.15}>
          <div className="space-y-4">
            {permissionsByModule?.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No module data available</p>
            )}
            {permissionsByModule?.map((row, i) => (
              <BarRow key={row.module} label={row.module} value={row.count} max={maxPerms} variant="mixed" delay={0.15 + i * 0.05} />
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Permission Count per Role Table ─────────────────────────────── */}
      <SectionCard title="Permission Count per Role" subtitle="Number of permissions assigned to each role" delay={0.2}>
        <div className="overflow-auto max-h-[360px]">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 rounded-l-xl border-y border-l border-gray-100">Role</th>
                <th className="px-4 py-3 text-center text-[11px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 border-y border-gray-100">Permissions</th>
                <th className="px-4 py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 rounded-r-xl border-y border-r border-gray-100">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {rolePermissions?.map((row, i) => {
                const pct = maxRolePerms > 0 ? Math.round((row.permissionCount / maxRolePerms) * 100) : 0;
                return (
                  <tr key={row.roleId} className="group hover:bg-secondary/5 transition-colors">
                    <td className="px-4 py-3.5 border-b border-gray-50">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-6 rounded-full ${i % 2 === 0 ? "bg-secondary" : "bg-primary"}`} />
                        <span className="font-bold text-secondary text-sm">{row.roleName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center border-b border-gray-50">
                      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-xs font-black ${
                        row.permissionCount === 0
                          ? "bg-red-50 text-primary border border-red-100"
                          : "bg-secondary/10 text-secondary border border-secondary/20"
                      }`}>
                        {row.permissionCount}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-50">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                            className={`h-2 rounded-full ${i % 2 === 0 ? "bg-secondary" : "bg-primary"}`}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-400 w-9 text-right tabular-nums">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rolePermissions?.length && (
            <div className="py-10 text-center">
              <RiBarChartBoxLine className="mx-auto text-gray-200 mb-2" size={32} />
              <p className="text-sm text-gray-400">No role data available</p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Health Alerts ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <AlertCard title="Unassigned Permissions" count={orphans.length} items={orphans} type="warning" emptyMsg="All permissions are assigned to at least one role." />
        <AlertCard title="Roles Without Permissions" count={rolesNoPerms.length} items={rolesNoPerms} type="danger" emptyMsg="All roles have at least one permission assigned." />
      </motion.div>

      {/* ── Refresh ──────────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-secondary transition-colors font-semibold px-3 py-2 rounded-lg hover:bg-secondary/5"
        >
          <RiRefreshLine size={14} /> Refresh Overview
        </button>
      </div>
    </div>
  );
};

export default SegregationPanel;
