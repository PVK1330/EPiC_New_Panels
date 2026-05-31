import React, { useState, useEffect, useCallback } from 'react';
import { listChangeRequests, approveChangeRequest, rejectChangeRequest } from '../../services/changeRequest.service';
import socketService from '../../services/socket.service';
import { formatDate } from '../../utils/datetime';

const ChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('SUBMITTED');
  const [selectedReq, setSelectedReq] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listChangeRequests({ status: activeTab, limit: 50 });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRequests();
    
    const handleCRUpdate = () => fetchRequests();
    socketService.on('change-request:new', handleCRUpdate);
    socketService.on('change-request:approved', handleCRUpdate);
    socketService.on('change-request:rejected', handleCRUpdate);
    
    return () => {
      socketService.off('change-request:new', handleCRUpdate);
      socketService.off('change-request:approved', handleCRUpdate);
      socketService.off('change-request:rejected', handleCRUpdate);
    };
  }, [fetchRequests]);

  const handleAction = async (action) => {
    if (!selectedReq) return;
    try {
      if (action === 'approve') await approveChangeRequest(selectedReq.id);
      if (action === 'reject') await rejectChangeRequest(selectedReq.id);
      setSelectedReq(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const tabs = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ESCALATED', 'COMPLETED'];

  return (
    <div className="p-6 dark:text-white">
      <h1 className="text-2xl font-bold mb-6">Change Request Management</h1>
      
      <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No requests found for {activeTab.replace('_', ' ')}.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{req.entity_type} ({req.entity_id})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{req.change_category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{req.field_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${req.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' : req.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                      {req.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(req.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => setSelectedReq(req)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Drawer / Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedReq(null)}></div>
          <div className="fixed inset-y-0 right-0 max-w-md w-full flex bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
            <div className="p-6 w-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Review Change Request</h2>
                <button onClick={() => setSelectedReq(null)} className="text-gray-400 hover:text-gray-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <div><span className="text-gray-500 text-sm">Entity:</span> <div className="font-medium">{selectedReq.entity_type} ({selectedReq.entity_id})</div></div>
                <div><span className="text-gray-500 text-sm">Field to Change:</span> <div className="font-bold text-lg">{selectedReq.field_name}</div></div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-100">
                    <div className="text-xs text-red-500 font-bold uppercase mb-1">Old Value</div>
                    <div className="break-all">{JSON.stringify(selectedReq.old_value) || 'Empty'}</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-100">
                    <div className="text-xs text-green-500 font-bold uppercase mb-1">Requested Value</div>
                    <div className="break-all">{JSON.stringify(selectedReq.requested_value)}</div>
                  </div>
                </div>

                <div className="mt-4"><span className="text-gray-500 text-sm">Reason:</span> <p className="italic bg-gray-50 dark:bg-gray-700 p-3 rounded">{selectedReq.reason}</p></div>
              </div>

              {(activeTab === 'SUBMITTED' || activeTab === 'UNDER_REVIEW') && (
                <div className="flex gap-4 mt-6 pt-6 border-t dark:border-gray-700">
                  <button onClick={() => handleAction('approve')} className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium shadow">Approve</button>
                  <button onClick={() => handleAction('reject')} className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium shadow">Reject</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeRequests;
