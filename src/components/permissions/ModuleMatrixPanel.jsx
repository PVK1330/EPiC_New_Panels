import { useState, useEffect, useCallback } from "react";
import {
  FiCheck, FiMinus, FiRefreshCw, FiAlertCircle, FiSave,
} from "react-icons/fi";
import { getRbacMatrix } from "../../services/rbacApi";
import { assignPermissionsToRole } from "../../services/rolesApi";

// ── Cell ─────────────────────────────────────────────────────────────────────
const MatrixCell = ({ has, pending, saving, onClick }) => {
  const isGranted  = pending !== undefined ? pending : has;
  const isDirty    = pending !== undefined && pending !== has;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      title={isGranted ? "Revoke permission" : "Grant permission"}
      className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary ${
        isGranted
          ? isDirty
            ? "border-amber-400 bg-amber-50 text-amber-600"
            : "border-green-400 bg-green-50 text-green-600"
          : isDirty
          ? "border-amber-300 bg-amber-50 text-amber-400"
          : "border-gray-200 bg-white text-gray-200 hover:border-gray-300 hover:text-gray-300"
      }`}
    >
      {isGranted ? (
        <FiCheck size={13} strokeWidth={3} />
      ) : (
        <FiMinus size={13} strokeWidth={2} />
      )}
    </button>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const ModuleMatrixPanel = () => {
  const [matrixData, setMatrixData]  = useState(null);
  const [loading, setLoading]        = useState(true);
  const [error, setError]            = useState(null);
  // pendingChanges: { [roleId]: Set of permissionIds that should be granted }
  const [pendingChanges, setPending] = useState({});
  const [saving, setSaving]          = useState(false);
  const [savedMsg, setSavedMsg]      = useState("");
  const [filterModule, setFilter]    = useState("all");

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

  // Build distinct list of all permissions from roles[0] (they're all the same set)
  const allPerms = matrixData?.roles?.[0]?.permissions || [];
  const modules  = ["all", ...(matrixData?.modules || [])];
  const visiblePerms = filterModule === "all"
    ? allPerms
    : allPerms.filter((p) => p.module === filterModule);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Module</label>
          <select
            value={filterModule}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {modules.map((m) => (
              <option key={m} value={m}>{m === "all" ? "All Modules" : m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="text-xs font-bold text-green-600">{savedMsg}</span>
          )}
          {hasDirtyChanges && (
            <span className="text-xs text-amber-600 font-semibold">
              {countDirtyRoles()} role(s) have unsaved changes
            </span>
          )}
          <button
            onClick={fetchMatrixData}
            className="text-gray-400 hover:text-primary transition-colors"
            title="Refresh"
          >
            <FiRefreshCw size={15} />
          </button>
          <button
            onClick={handleSaveAll}
            disabled={!hasDirtyChanges || saving}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              hasDirtyChanges && !saving
                ? "bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FiSave size={14} />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-secondary">Module Permissions Matrix</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Click any cell to toggle. Green = granted · Amber = pending change · Grey = denied
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-green-50 border-2 border-green-400 inline-block" />
              Granted
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-amber-50 border-2 border-amber-400 inline-block" />
              Pending
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-white border-2 border-gray-200 inline-block" />
              Denied
            </span>
          </div>
        </div>

        <div className="overflow-auto max-h-[calc(100vh-320px)] border-t border-gray-100 custom-scrollbar">
          <table className="w-full text-sm border-separate border-spacing-0" style={{ minWidth: `${180 + (matrixData?.roles?.length || 0) * 90}px` }}>
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-wider sticky left-0 top-0 bg-gray-50 z-30 border-r border-b border-gray-100 min-w-[180px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  Permission
                </th>
                {matrixData?.roles?.map((role) => (
                  <th
                    key={role.roleId}
                    className="px-2 py-3 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center whitespace-nowrap sticky top-0 bg-gray-50 z-20 border-b border-gray-100"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>{role.roleName}</span>
                      {pendingChanges[role.roleId] !== undefined && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-black">
                          UNSAVED
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visiblePerms.map((perm) => (
                <tr key={perm.permissionId} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-4 py-2.5 sticky left-0 bg-white group-hover:bg-gray-50/90 border-r border-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <div className="text-[10px] font-bold text-primary uppercase tracking-wide">{perm.module}</div>
                    <div className="text-xs font-semibold text-secondary capitalize">{perm.action}</div>
                    {perm.permissionName && (
                      <div className="text-[10px] text-gray-400 truncate max-w-[160px]">{perm.permissionName}</div>
                    )}
                  </td>
                  {matrixData?.roles?.map((role) => {
                    const rolePerm = role.permissions.find((p) => p.permissionId === perm.permissionId);
                    const originalHas = rolePerm?.hasPermission || false;
                    const pendingVal  = isPending(role.roleId, perm.permissionId, originalHas);
                    return (
                      <td key={`${role.roleId}-${perm.permissionId}`} className="px-2 py-2.5 text-center border-b border-gray-50">
                        <MatrixCell
                          has={originalHas}
                          pending={pendingVal}
                          saving={saving}
                          onClick={() => toggleCell(role.roleId, perm.permissionId, originalHas)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              {visiblePerms.length === 0 && (
                <tr>
                  <td colSpan={(matrixData?.roles?.length || 0) + 1} className="px-4 py-8 text-center text-sm text-gray-400">
                    No permissions found for the selected module.
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
