import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGlobalTimeline } from '../../services/timeline.service';
import { listChangeRequests } from '../../services/changeRequest.service';
import socketService from '../../services/socket.service';

const ActivityCenter = () => {
  const [stats, setStats] = useState({ pendingCRs: 0, highRiskCRs: 0, recentEvents: 0 });
  const [recentTimeline, setRecentTimeline] = useState([]);
  const [recentCRs, setRecentCRs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [timelineRes, crRes, highRiskCrRes] = await Promise.all([
        getGlobalTimeline({ limit: 5 }),
        listChangeRequests({ status: 'SUBMITTED', limit: 5 }),
        listChangeRequests({ status: 'SUBMITTED', riskLevel: 'HIGH', limit: 1 }) // just to get count
      ]);

      setRecentTimeline(timelineRes.data);
      setRecentCRs(crRes.data);
      setStats({
        pendingCRs: crRes.meta?.total || crRes.data.length,
        highRiskCRs: highRiskCrRes.meta?.total || 0,
        recentEvents: timelineRes.data.length // Simplified stat
      });
    } catch (error) {
      console.error('Error fetching activity center data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    socketService.on('timeline:update', fetchData);
    socketService.on('change-request:new', fetchData);
    socketService.on('change-request:approved', fetchData);

    return () => {
      socketService.off('timeline:update', fetchData);
      socketService.off('change-request:new', fetchData);
      socketService.off('change-request:approved', fetchData);
    };
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto dark:text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Activity Center</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border-l-4 border-indigo-500 flex flex-col">
          <span className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Pending Approvals</span>
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats.pendingCRs}</span>
          <Link to="/admin/change-requests" className="text-indigo-500 mt-4 text-sm hover:underline">View all requests &rarr;</Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border-l-4 border-orange-500 flex flex-col">
          <span className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">High Risk Requests</span>
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats.highRiskCRs}</span>
          <Link to="/admin/change-requests" className="text-orange-500 mt-4 text-sm hover:underline">Review urgently &rarr;</Link>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border-l-4 border-green-500 flex flex-col">
          <span className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Recent Timeline Events</span>
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats.recentEvents}+</span>
          <Link to="/admin/timeline-explorer" className="text-green-500 mt-4 text-sm hover:underline">Open Timeline Explorer &rarr;</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Change Requests */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Change Requests</h2>
            <Link to="/admin/change-requests" className="text-sm text-indigo-500">View All</Link>
          </div>
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : recentCRs.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No pending requests</div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentCRs.map(cr => (
                <li key={cr.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{cr.field_name} change</p>
                    <p className="text-xs text-gray-500">{cr.entity_type} • {new Date(cr.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${cr.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {cr.risk_level}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Live Timeline Feed */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Live Timeline Feed</h2>
            <Link to="/admin/timeline-explorer" className="text-sm text-indigo-500">View All</Link>
          </div>
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : recentTimeline.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No events</div>
          ) : (
            <div className="space-y-4">
              {recentTimeline.map(event => (
                <div key={event.id} className="flex gap-4">
                  <div className="mt-1">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="text-xs text-gray-400">{new Date(event.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCenter;
