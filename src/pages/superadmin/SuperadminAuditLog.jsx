import React, { useState } from 'react';
import {
  RiSearchLine,
  RiFilter3Line,
  RiDownload2Line,
  RiShieldUserLine,
  RiOrganizationChart,
  RiMoneyPoundCircleLine,
  RiDatabase2Line,
  RiLoginCircleLine,
} from 'react-icons/ri';
import Button from '../../components/Button';

const SuperadminAuditLog = () => {
  const [activeTab, setActiveTab] = useState('All Events');

  const logs = [
    { id: 1, type: 'Security', action: 'New Admin Login', user: 'admin@elitevisa.com', org: 'Elite Visa', time: '2026-05-08 10:45', status: 'Success', icon: RiLoginCircleLine, color: 'primary' },
    { id: 2, type: 'Org', action: 'Plan Upgraded (Starter → Pro)', user: 'superadmin', org: 'Global Migrate', time: '2026-05-08 09:30', status: 'Success', icon: RiOrganizationChart, color: 'secondary' },
    { id: 3, type: 'Billing', action: 'Payment Processed £349', user: 'System', org: 'Westminster Agency', time: '2026-05-08 00:05', status: 'Success', icon: RiMoneyPoundCircleLine, color: 'green' },
    { id: 4, type: 'Data', action: 'Bulk Upload (540 Records)', user: 'staff@londonlegal.com', org: 'London Legal', time: '2026-05-07 16:20', status: 'Success', icon: RiDatabase2Line, color: 'primary' },
    { id: 5, type: 'Security', action: 'Failed 2FA Attempt', user: 'user@bridgeuk.com', org: 'Bridge UK', time: '2026-05-07 14:15', status: 'Failed', icon: RiShieldUserLine, color: 'red' },
    { id: 6, type: 'Org', action: 'Organization Suspended', user: 'superadmin', org: 'Test Corp', time: '2026-05-07 11:00', status: 'Success', icon: RiFilter3Line, color: 'gray' },
  ];

  const tabs = ['All Events', 'Authentication', 'Org Changes', 'Data Changes', 'Billing'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Events & Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-0.5">Comprehensive monitoring of platform-wide activity and security events.</p>
        </div>
        <Button variant="secondary" className="flex items-center gap-2">
          <RiDownload2Line size={18} /> Export Logs
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-gray-50 p-1 rounded-lg w-fit border border-gray-100 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white text-primary shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by user or org..."
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-gray-400"
            />
          </div>
          <button className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 rounded-lg transition-all shadow-sm">
            <RiFilter3Line size={18} />
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4 text-left">Event Type</th>
                <th className="px-6 py-4 text-left">Action Description</th>
                <th className="px-6 py-4 text-left">Organisation</th>
                <th className="px-6 py-4 text-left">User/System</th>
                <th className="px-6 py-4 text-left">Timestamp</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg border ${
                        log.color === 'primary' ? 'bg-primary/10 text-primary border-primary/20' :
                        log.color === 'secondary' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                        log.color === 'green' ? 'bg-green-50 text-green-600 border-green-100' :
                        log.color === 'red' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        <log.icon size={14} />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{log.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{log.action}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-slate-700 text-[10px] font-black border border-gray-200 uppercase tracking-tight">
                      {log.org}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-bold text-xs">{log.user}</td>
                  <td className="px-6 py-4 text-gray-400 font-bold text-[10px] uppercase tracking-wide">{log.time}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                      log.status === 'Success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page 1 of 42 (248 Total Events)</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-300 transition-all">Previous</button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminAuditLog;
