import { useState, useEffect, useCallback } from "react";
import BiometricBookedModal from "../../../components/workflow/BiometricBookedModal";
import { getCaseAuditLogs } from "../../../services/auditApi";

function CasesAuditLogsTab({
  caseId,
  biometricModalOpen,
  setBiometricModalOpen,
  setPendingBiometricStage,
  confirmBiometricBooking,
  detailCase,
  stageSaving,
}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ dateRange: "last30", status: "all" });

  const fetchAuditLogs = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    try {
      const res = await getCaseAuditLogs(caseId, { page: 1, limit: 20, dateRange: filters.dateRange, status: filters.status });
      if (res.data?.status === "success") setLogs(res.data.data.logs);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [caseId, filters]);

  useEffect(() => { fetchAuditLogs(); }, [fetchAuditLogs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h4 className="text-sm font-black text-secondary uppercase tracking-wide">Case Audit Logs</h4>
        <div className="flex gap-2">
          <select name="dateRange" value={filters.dateRange} onChange={handleFilterChange}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-secondary/30">
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="last90">Last 3 months</option>
            <option value="all">All time</option>
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-secondary/30">
            <option value="all">All status</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Timestamp", "User", "Action", "Resource", "Status", "Details"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading audit logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No audit logs found for this case</td></tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-secondary">{log.initials}</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-secondary">{log.user}</p>
                          <p className="text-[10px] text-gray-500">{log.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${log.actionClass}`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{log.resource}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${log.statusClass}`}>{log.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate" title={log.details}>{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BiometricBookedModal
        open={biometricModalOpen}
        onClose={() => { setBiometricModalOpen(false); setPendingBiometricStage(null); }}
        onConfirm={confirmBiometricBooking}
        caseLabel={detailCase?.caseId}
        loading={stageSaving}
        initialData={detailCase?.workflowState?.biometrics?.availability ? {
          location: detailCase.workflowState.biometrics.availability.preferredLocation,
          date: detailCase.workflowState.biometrics.availability.preferredDate,
          time: detailCase.workflowState.biometrics.availability.preferredTime,
          instructions: detailCase.workflowState.biometrics.availability.notes,
        } : undefined}
      />
    </div>
  );
}

export default CasesAuditLogsTab;
