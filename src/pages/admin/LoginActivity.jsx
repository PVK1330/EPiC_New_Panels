import React, { useState, useEffect, useCallback } from 'react';
import { getAuditLogs } from '../../services/audit.service';
import socketService from '../../services/socket.service';

const LoginActivity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, total: 0, pages: 1 });
  const [stats, setStats] = useState({ failedLogins: 0, lockedAccounts: 0, totalLogins: 0 });
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    action: '' // We will filter locally for auth events to ensure we catch variations
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch audit logs. In a real scenario, we might pass ?action=LOGIN
      // but to capture FAILED_LOGIN, SESSION_TIMEOUT, etc., we fetch all and filter,
      // or we update the API to support multiple actions. We will filter client side for demo.
      const res = await getAuditLogs(filters);
      
      const authActions = ['LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'SESSION_TIMEOUT', 'ACCOUNT_LOCKED', 'PASSWORD_RESET'];
      const loginLogs = res.data.filter(l => authActions.some(a => l.action?.toUpperCase().includes(a)));
      
      setLogs(loginLogs);
      setMeta(res.meta);

      setStats({
        failedLogins: loginLogs.filter(l => l.action === 'FAILED_LOGIN' || l.status === 'Failed').length,
        lockedAccounts: loginLogs.filter(l => l.action === 'ACCOUNT_LOCKED').length,
        totalLogins: loginLogs.filter(l => l.action === 'LOGIN').length
      });

    } catch (err) {
      console.error('Error fetching login activity', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();

    const handleUpdate = () => {
      if (filters.page === 1) fetchLogs();
    };

    socketService.on('dashboard:update', handleUpdate);
    
    return () => {
      socketService.off('dashboard:update', handleUpdate);
    };
  }, [fetchLogs, filters.page]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto dark:text-white">
      <h1 className="text-2xl font-bold mb-6">Login & Security Activity</h1>

      {/* Security Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-indigo-500">
          <div className="text-sm text-gray-500">Successful Logins (View)</div>
          <div className="text-2xl font-bold mt-1">{stats.totalLogins}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="text-sm text-red-600 dark:text-red-400 font-bold">Failed Attempts</div>
          <div className="text-2xl font-bold mt-1 text-red-700 dark:text-red-300">{stats.failedLogins}</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg shadow border-l-4 border-orange-500">
          <div className="text-sm text-orange-600 dark:text-orange-400 font-bold">Locked Accounts</div>
          <div className="text-2xl font-bold mt-1 text-orange-700 dark:text-orange-300">{stats.lockedAccounts}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-gray-500">
          <div className="text-sm text-gray-500">Suspicious Activity</div>
          <div className="text-2xl font-bold mt-1 text-gray-400">0</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && logs.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No login activity.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-slate-900 dark:text-white">{log.userName}</div>
                    <div className="text-xs text-gray-500">{log.role}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">{log.ip}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                     <span className={`px-2 py-1 text-xs rounded-full ${log.status === 'Failed' || log.action === 'FAILED_LOGIN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {log.action === 'FAILED_LOGIN' ? 'Failed' : log.status}
                     </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoginActivity;
