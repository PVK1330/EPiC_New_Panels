import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiSearchLine,
  RiFilter3Line,
  RiHistoryLine,
  RiFileDownloadLine,
  RiArrowRightSLine,
  RiUser3Line,
  RiOrganizationChart,
  RiShieldLine,
  RiMoneyPoundCircleLine,
} from 'react-icons/ri';
import Button from '../../components/Button';

const SuperadminAuditLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const logs = [
    { id: 1, type: 'Security', action: 'Admin Login', user: 'admin@elitevisa.com', org: 'Elite Visa', time: '2026-05-08 10:45', status: 'Success' },
    { id: 2, type: 'System', action: 'Plan Upgraded', user: 'superadmin', org: 'Global Migrate', time: '2026-05-08 09:30', status: 'Success' },
    { id: 3, type: 'Billing', action: 'Payment Processed', user: 'System', org: 'Westminster Agency', time: '2026-05-08 00:05', status: 'Success' },
    { id: 4, type: 'Data', action: 'Bulk Case Import', user: 'staff@londonlegal.com', org: 'London Legal', time: '2026-05-07 16:20', status: 'Success' },
    { id: 5, type: 'Security', action: 'Failed 2FA', user: 'user@bridgeuk.com', org: 'Bridge UK', time: '2026-05-07 14:15', status: 'Failed' },
    { id: 6, type: 'System', action: 'Org Deleted', user: 'superadmin', org: 'Test Corp', time: '2026-05-07 11:00', status: 'Success' },
  ];

  const categories = ['All', 'Authentication', 'Organization', 'Billing', 'System'];

  return (
    <div className="space-y-5 pb-6">
      {/* Simple Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-xl font-bold text-secondary uppercase tracking-tight mb-1">Audit Logs</h1>
           <p className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">Standard record of administrative and system activities.</p>
        </div>
        <Button variant="secondary" className="flex items-center gap-2 px-5 py-2 text-[10px] font-bold uppercase tracking-widest bg-white border-gray-100 shadow-sm">
           <RiFileDownloadLine size={16} /> Download CSV
        </Button>
      </div>

      {/* Main Ledger */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/30">
          <div className="flex bg-white p-1 rounded-lg border border-gray-100 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === cat
                    ? 'bg-secondary text-white shadow-sm'
                    : 'text-gray-400 hover:text-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-secondary w-full md:w-56 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-300 uppercase"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto no-scrollbar flex-1">
          <table className="w-full text-sm">
            <thead className="bg-white text-[9px] uppercase text-gray-400 tracking-widest font-black border-b border-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">Activity</th>
                <th className="px-6 py-4 text-left">Initiated By</th>
                <th className="px-6 py-4 text-left">Organization</th>
                <th className="px-6 py-4 text-left">Timestamp</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-6 py-4">
                     <div>
                        <p className="font-bold text-secondary text-xs block leading-none mb-1 uppercase tracking-tight">{log.action}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{log.type}</p>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <RiUser3Line className="text-gray-400" size={12} />
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-tight">{log.user}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-[10px] font-black text-secondary uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        {log.org}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-[10px] text-gray-400 font-bold uppercase">{log.time}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      log.status === 'Success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Showing last 100 entries</p>
           <div className="flex gap-2">
             <button disabled className="px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-white border border-gray-200 text-gray-300">Previous</button>
             <button className="px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-white border border-gray-200 text-secondary hover:bg-gray-50 transition-all shadow-sm">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminAuditLog;
