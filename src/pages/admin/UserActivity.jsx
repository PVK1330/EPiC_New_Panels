import React, { useState, useEffect, useCallback } from 'react';
import { getAuditLogs } from '../../services/audit.service';
import socketService from '../../services/socket.service';

const UserActivity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, total: 0, pages: 1 });
  const [stats, setStats] = useState({ activeUsers: 0, topUser: '-', totalActivities: 0, crCount: 0 });
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 25,
    action: '' // We want non-login events mostly, but can be filtered by user
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch general activity
      const res = await getAuditLogs(filters);
      
      // Filter out raw auth events for this specific view on the client side if not strictly queried
      // Or we can rely on the user to filter.
      const activityLogs = res.data.filter(l => !['LOGIN', 'LOGOUT', 'FAILED_LOGIN'].includes(l.action));
      
      setLogs(activityLogs);
      setMeta(res.meta);

      // Basic KPI calculation from current page (for demo purposes)
      // In a real app, these would be separate API endpoints
      const uniqueUsers = new Set(activityLogs.map(l => l.userName)).size;
      const userCounts = {};
      activityLogs.forEach(l => {
        userCounts[l.userName] = (userCounts[l.userName] || 0) + 1;
      });
      const topUser = Object.keys(userCounts).sort((a,b) => userCounts[b] - userCounts[a])[0] || '-';
      
      setStats({
        activeUsers: uniqueUsers,
        topUser: topUser,
        totalActivities: res.meta.total,
        crCount: activityLogs.filter(l => l.entity_type === 'ChangeRequest').length
      });

    } catch (err) {
      console.error('Error fetching user activity', err);
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
      <h1 className="text-2xl font-bold mb-6">User Activity</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-sm text-gray-500">Total Activities</div>
          <div className="text-2xl font-bold mt-1">{stats.totalActivities}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-sm text-gray-500">Active Users (View)</div>
          <div className="text-2xl font-bold mt-1">{stats.activeUsers}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="text-sm text-gray-500">Most Active User</div>
          <div className="text-lg font-bold mt-1 truncate">{stats.topUser}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-sm text-gray-500">Change Requests</div>
          <div className="text-2xl font-bold mt-1">{stats.crCount}</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && logs.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">No recent activity.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-slate-900 dark:text-white">{log.userName}</div>
                    <div className="text-xs text-gray-500">{log.role}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {log.entity_type} {log.entity_id !== '-' ? `#${log.entity_id}` : ''}
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

export default UserActivity;
