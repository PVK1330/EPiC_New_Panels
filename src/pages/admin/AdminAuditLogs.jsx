import React, { useState, useEffect, useCallback } from 'react';
import { getAuditLogs, exportAuditLogs } from '../../services/audit.service';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, total: 0, pages: 1 });
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    startDate: '',
    endDate: '',
    entityType: '',
    action: ''
  });

  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAuditLogs(filters);
      setLogs(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error('Error fetching audit logs', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleQuickDate = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setFilters(prev => ({ 
      ...prev, 
      startDate: start.toISOString().split('T')[0], 
      endDate: end.toISOString().split('T')[0],
      page: 1
    }));
  };

  const handleExport = async () => {
    try {
      await exportAuditLogs({ ...filters, page: undefined, limit: undefined });
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export data');
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-medium">
          Export Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end border border-gray-200 dark:border-gray-700">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Entity Type</label>
          <select name="entityType" value={filters.entityType} onChange={handleFilterChange} className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 min-w-[150px]">
            <option value="">All Entities</option>
            <option value="CandidateApplication">Candidate Profile</option>
            <option value="SponsorProfile">Sponsor Profile</option>
            <option value="User">User Account</option>
            <option value="Case">Case</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
          <input type="text" name="action" value={filters.action} onChange={handleFilterChange} placeholder="e.g. APPROVED" className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 min-w-[150px]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleQuickDate(0)} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 rounded">Today</button>
          <button onClick={() => handleQuickDate(7)} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 rounded">Last 7</button>
          <button onClick={() => handleQuickDate(30)} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 rounded">Last 30</button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && logs.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading records...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No audit logs found matching criteria.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} onClick={() => setSelectedLog(log)} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-slate-900 dark:text-white">{log.userName}</div>
                    <div className="text-xs text-gray-500">{log.role}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {log.entity_type} <span className="text-xs text-gray-400">#{log.entity_id}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono text-xs">{log.field_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                    {log.old_value && <span className="line-through text-red-400 mr-2">{typeof log.old_value === 'object' ? 'Object' : String(log.old_value)}</span>}
                    {log.new_value && <span className="text-green-500">{typeof log.new_value === 'object' ? 'Object' : String(log.new_value)}</span>}
                    {!log.old_value && !log.new_value && <span>{log.action}</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">{log.ip}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500">
            Showing Page <span className="font-medium">{meta.page}</span> of <span className="font-medium">{meta.pages || 1}</span> ({meta.total} total)
          </div>
          <div className="flex gap-2">
            <button onClick={() => setFilters(p => ({ ...p, page: Math.max(1, p.page - 1)}))} disabled={meta.page <= 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Previous</button>
            <button onClick={() => setFilters(p => ({ ...p, page: Math.min(meta.pages, p.page + 1)}))} disabled={meta.page >= meta.pages} className="px-3 py-1 border rounded text-sm disabled:opacity-50 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Next</button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedLog(null)}></div>
          <div className="fixed inset-y-0 right-0 max-w-lg w-full flex bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
            <div className="p-6 w-full flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
                <h2 className="text-xl font-bold">Audit Record Details</h2>
                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-500"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</span> <div className="font-mono text-sm mt-1">{selectedLog.timestamp}</div></div>
                  <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">IP Address</span> <div className="font-mono text-sm mt-1">{selectedLog.ip}</div></div>
                  <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">User</span> <div className="text-sm font-medium mt-1">{selectedLog.userName}</div></div>
                  <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</span> <div className="text-sm mt-1">{selectedLog.role}</div></div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Entity Type</span> <div className="font-medium mt-1 text-indigo-600 dark:text-indigo-400">{selectedLog.entity_type}</div></div>
                    <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Entity ID</span> <div className="font-medium mt-1">#{selectedLog.entity_id}</div></div>
                  </div>
                  <div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Field Name</span> <div className="font-mono text-sm mt-1">{selectedLog.field_name}</div></div>
                </div>

                <div className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100">
                    <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Old Value</span>
                    <pre className="mt-2 text-sm whitespace-pre-wrap break-all">{typeof selectedLog.old_value === 'object' ? JSON.stringify(selectedLog.old_value, null, 2) : String(selectedLog.old_value || 'None')}</pre>
                  </div>
                  
                  <div className="flex justify-center text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100">
                    <span className="text-xs font-bold text-green-500 uppercase tracking-wider">New Value</span>
                    <pre className="mt-2 text-sm whitespace-pre-wrap break-all">{typeof selectedLog.new_value === 'object' ? JSON.stringify(selectedLog.new_value, null, 2) : String(selectedLog.new_value || 'None')}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
