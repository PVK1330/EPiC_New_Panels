import { useState, useEffect, useCallback, Fragment } from "react";
import {
  FiCheck, FiMinus, FiRefreshCw, FiAlertCircle, FiSave,
} from "react-icons/fi";
import { getRbacMatrix } from "../../services/rbacApi";
import { assignPermissionsToRole } from "../../services/rolesApi";

const humanize = (str) => {
  if (!str) return "";
  let cleaned = str.replace(/^admin\./i, "");
  cleaned = cleaned.replace(/[._]/g, " ");
  return cleaned.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

// ── Cell ─────────────────────────────────────────────────────────────────────
const MatrixCell = ({ has, pending, saving, onClick }) => {
  const isGranted = pending !== undefined ? pending : has;
  const isDirty = pending !== undefined && pending !== has;

  return (
    <div className="flex items-center justify-center h-10">
      <input
        type="checkbox"
        checked={isGranted}
        onChange={onClick}
        disabled={saving}
        className={`w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary/30 transition-all cursor-pointer ${
          isDirty ? "ring-2 ring-amber-400 ring-offset-1" : ""
        }`}
      />
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const ModuleMatrixPanel = () => {
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // pendingChanges: { [roleId]: Set of permissionIds that should be granted }
  const [pendingChanges, setPending] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [filterModule, setFilter] = useState("all");

  const fetchMatrixData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPending({});
    try {
      const res = await getRbacMatrix();
      if (res.data?.status === "success") setMatrixData(res.data.data);
      else setError("Unexpected response from server.");
    } catch {
      setError("Failed to load permission matrix.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMatrixData(); }, [fetchMatrixData]);

  // Determine current effective state for a cell (original + pending overlay)
  const isGranted = (roleId, permId, original) => {
    if (pendingChanges[roleId] !== undefined) {
      return pendingChanges[roleId].has(permId);
    }
    return original;
  };

  const isPending = (roleId, permId, original) => {
    if (pendingChanges[roleId] === undefined) return undefined;
    const newVal = pendingChanges[roleId].has(permId);
    return newVal !== original ? newVal : undefined;
  };

  const toggleCell = (roleId, permId, original) => {
    setPending((prev) => {
      // Initialize this role's set from original if not yet modified
      let roleSet;
      if (prev[roleId] !== undefined) {
        roleSet = new Set(prev[roleId]);
      } else {
        // Seed from original matrix
        const roleData = matrixData.roles.find((r) => r.roleId === roleId);
        roleSet = new Set(
          roleData.permissions.filter((p) => p.hasPermission).map((p) => p.permissionId)
        );
      }
      if (roleSet.has(permId)) roleSet.delete(permId);
      else roleSet.add(permId);
      return { ...prev, [roleId]: roleSet };
    });
  };

  const countDirtyRoles = () => Object.keys(pendingChanges).length;
  const hasDirtyChanges = countDirtyRoles() > 0;

  const handleSaveAll = async () => {
    setSaving(true);
    setSavedMsg("");
    try {
      const promises = Object.entries(pendingChanges).map(([roleId, permSet]) =>
        assignPermissionsToRole(Number(roleId), { permissionIds: Array.from(permSet) })
      );
      await Promise.all(promises);
      setSavedMsg(`Saved changes for ${Object.keys(pendingChanges).length} role(s).`);
      setTimeout(() => setSavedMsg(""), 3000);
      await fetchMatrixData(); // Refresh from server
    } catch {
      setError("Failed to save some changes. Please retry.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3">
        <FiRefreshCw className="text-primary animate-spin" size={24} />
        <p className="text-sm text-gray-500">Loading permission matrix…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3 text-center">
        <FiAlertCircle className="text-red-400" size={24} />
        <p className="text-sm text-gray-600">{error}</p>
        <button onClick={fetchMatrixData} className="text-sm text-primary font-bold hover:underline">Retry</button>
      </div>
    );
  }

  // Build a deduplicated permission list across ALL roles (not just roles[0])
  // The API returns each permission entry per-role, so we use a Map to deduplicate
  const allPermsMap = new Map();
  matrixData?.roles?.forEach((role) => {
    role.permissions.forEach((p) => {
      if (!allPermsMap.has(p.permissionId)) {
        allPermsMap.set(p.permissionId, p);
      }
    });
  });
  const allPerms = Array.from(allPermsMap.values());
  const modules = ["all", ...(matrixData?.modules || [])];
  const visiblePerms = (filterModule === "all"
    ? allPerms
    : allPerms.filter((p) => p.module === filterModule)
  ).map(p => ({ ...p, module: p.module.trim() }));

  const visibleGrouped = Object.entries(
    visiblePerms.reduce((acc, p) => {
      const mod = p.module;
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(p);
      return acc;
    }, {})
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-2.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Filter</label>
          <select
            value={filterModule}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-white font-medium text-secondary"
          >
            {modules.map((m) => (
              <option key={m} value={m}>{m === "all" ? "All Modules" : m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
              ✓ {savedMsg}
            </span>
          )}
          {hasDirtyChanges && (
            <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
              {countDirtyRoles()} role(s) have unsaved changes
            </span>
          )}
          <button
            onClick={fetchMatrixData}
            className="p-2 text-gray-400 hover:text-secondary transition-colors hover:bg-secondary/5 rounded-lg"
            title="Refresh"
          >
            <FiRefreshCw size={15} />
          </button>
          <button
            onClick={handleSaveAll}
            disabled={!hasDirtyChanges || saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${hasDirtyChanges && !saving
                ? "text-white shadow-md shadow-indigo-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            style={hasDirtyChanges && !saving ? {
              background: "var(--color-secondary)",
            } : {}}
          >
            <FiSave size={14} />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-secondary">Module Permissions Matrix</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage permissions across all roles. Use checkboxes to grant/revoke access.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-secondary" />
              Granted
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-amber-400" />
              Pending
            </span>
          </div>
        </div>

        <div className="overflow-auto max-h-[calc(100vh-320px)] custom-scrollbar">
          <table className="w-full text-sm border-separate border-spacing-0" style={{ minWidth: `${200 + (matrixData?.roles?.length || 0) * 100}px` }}>
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky left-0 top-0 bg-gray-50 z-30 border-r border-b border-gray-100 min-w-[200px] text-left">
                  Module & Action
                </th>
                {matrixData?.roles?.map((role) => (
                  <th
                    key={role.roleId}
                    className="px-4 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center sticky top-0 bg-gray-50/95 backdrop-blur-sm z-20 border-b border-gray-100"
                  >
                    <div className="flex flex-col items-center gap-1">
                      {role.roleName}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleGrouped.map(([module, perms]) => (
                <tr key={module} className="hover:bg-gray-50/40 transition-colors group">
                  <td className="px-6 py-5 sticky left-0 bg-white group-hover:bg-gray-50 transition-colors border-r border-gray-100 z-10">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-secondary tracking-tight">{humanize(module)}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{perms.length} Permissions</span>
                    </div>
                  </td>

                  {matrixData?.roles?.map((role) => {
                    const rolePerms = perms.map(p => ({
                      ...p,
                      granted: isGranted(role.roleId, p.permissionId, role.permissions.find(rp => rp.permissionId === p.permissionId)?.hasPermission || false)
                    }));
                    
                    const grantedCount = rolePerms.filter(p => p.granted).length;
                    const totalCount = perms.length;
                    
                    let level = "custom";
                    if (grantedCount === 0) level = "none";
                    else if (grantedCount === totalCount) level = "admin";
                    else {
                      const isViewer = rolePerms.every(p => {
                        if (p.action === "read" || p.action === "view") return p.granted;
                        return !p.granted;
                      });
                      const isEditor = rolePerms.every(p => {
                        if (["read", "view", "write", "update", "edit"].includes(p.action)) return p.granted;
                        if (["delete", "manage", "approve"].includes(p.action)) return !p.granted;
                        return true; 
                      });
                      if (isViewer) level = "viewer";
                      else if (isEditor) level = "editor";
                    }

                    const handleLevelChange = (newLevel) => {
                      perms.forEach(p => {
                        const rolePerm = role.permissions.find(rp => rp.permissionId === p.permissionId);
                        const originalHas = rolePerm?.hasPermission || false;
                        const currentHas = isGranted(role.roleId, p.permissionId, originalHas);
                        
                        let shouldGrant = false;
                        if (newLevel === "admin") shouldGrant = true;
                        else if (newLevel === "viewer") shouldGrant = (p.action === "read" || p.action === "view");
                        else if (newLevel === "editor") shouldGrant = ["read", "view", "write", "update", "edit"].includes(p.action);
                        else if (newLevel === "none") shouldGrant = false;
                        
                        if (currentHas !== shouldGrant) {
                          toggleCell(role.roleId, p.permissionId, originalHas);
                        }
                      });
                    };

                    const isDirty = perms.some(p => {
                      const rolePerm = role.permissions.find(rp => rp.permissionId === p.permissionId);
                      return isPending(role.roleId, p.permissionId, rolePerm?.hasPermission || false) !== undefined;
                    });

                    return (
                      <td key={`${role.roleId}-${module}`} className="px-4 py-5 border-b border-gray-50 text-center">
                        <div className="inline-block relative min-w-[130px]">
                          <select
                            value={level}
                            onChange={(e) => handleLevelChange(e.target.value)}
                            disabled={saving}
                            className={`w-full appearance-none pl-3 pr-8 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/20 ${
                              level === "none" ? "bg-gray-50 text-gray-400 border-gray-100" :
                              level === "viewer" ? "bg-blue-50 text-blue-600 border-blue-100" :
                              level === "editor" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                              level === "admin" ? "bg-secondary text-white border-secondary shadow-sm" :
                              "bg-amber-50 text-amber-700 border-amber-200"
                            } ${isDirty ? "ring-2 ring-amber-400 ring-offset-2" : ""}`}
                          >
                            <option value="none">No Access</option>
                            <option value="viewer">Viewer Only</option>
                            <option value="editor">Editor Access</option>
                            <option value="admin">Full Admin</option>
                            {level === "custom" && <option value="custom">Custom Mix</option>}
                          </select>
                          <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${level === "admin" ? "text-white" : "text-gray-400"}`}>
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                          </div>
                        </div>
                        {isDirty && <div className="text-[9px] font-black text-amber-500 mt-1 uppercase">Pending</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {visiblePerms.length === 0 && (
                <tr>
                  <td colSpan={(matrixData?.roles?.length || 0) + 1} className="px-4 py-8 text-center text-sm text-gray-400">
                    No permissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModuleMatrixPanel;
