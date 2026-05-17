import React, { useState, useMemo } from 'react';
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
 RiCheckLine,
 RiCloseLine,
 RiAddLine,
} from 'react-icons/ri';
import Button from '../../components/Button';

const SuperadminAuditLog = () => {
 const [searchTerm, setSearchTerm] = useState('');
 const [activeTab, setActiveTab] = useState('All');

 const logs = [
 // Authentication & Security
 { id: 1, category: 'Authentication', action: 'Admin Login', user: 'admin@elitevisa.com', org: 'Elite Visa', time: '2026-05-08 10:45', status: 'Success', description: 'Successful admin login' },
 { id: 2, category: 'Authentication', action: 'Failed 2FA', user: 'user@bridgeuk.com', org: 'Bridge UK', time: '2026-05-07 14:15', status: 'Failed', description: 'Invalid 2FA code attempted' },
 { id: 3, category: 'Authentication', action: 'Password Reset', user: 'staff@londonlegal.com', org: 'London Legal', time: '2026-05-07 08:30', status: 'Success', description: 'Password reset completed' },
 { id: 4, category: 'Authentication', action: 'Session Timeout', user: 'manager@bridgeuk.com', org: 'Bridge UK', time: '2026-05-06 18:45', status: 'Success', description: 'Session expired after inactivity' },
 { id: 5, category: 'Authentication', action: 'Multi-Factor Auth Enabled', user: 'admin@westminster.com', org: 'Westminster Agency', time: '2026-05-06 14:20', status: 'Success', description: 'User enabled 2FA authentication' },
 { id: 6, category: 'Authentication', action: 'Unauthorized Access Attempt', user: 'unknown@external.com', org: 'External', time: '2026-05-05 22:10', status: 'Failed', description: 'Access denied - invalid credentials' },

 // Organisation & Company Management
 { id: 7, category: 'Organisation', action: 'Organisation Created', user: 'superadmin', org: 'New Tech Solutions', time: '2026-05-08 13:00', status: 'Success', description: 'New organisation registered in system' },
 { id: 8, category: 'Organisation', action: 'Organisation Deleted', user: 'superadmin', org: 'Test Corp', time: '2026-05-07 11:00', status: 'Success', description: 'Organisation removed from system' },
 { id: 9, category: 'Organisation', action: 'User Added to Organisation', user: 'admin@elitevisa.com', org: 'Elite Visa', time: '2026-05-07 09:15', status: 'Success', description: 'New team member added to organisation' },
 { id: 10, category: 'Organisation', action: 'Organisation Settings Updated', user: 'superadmin', org: 'Global Migrate', time: '2026-05-06 16:30', status: 'Success', description: 'Updated organisation configuration' },
 { id: 11, category: 'Organisation', action: 'User Removed from Organisation', user: 'admin@westminster.com', org: 'Westminster Agency', time: '2026-05-06 12:45', status: 'Success', description: 'User access revoked from organisation' },
 { id: 12, category: 'Organisation', action: 'Organisation Plan Changed', user: 'superadmin', org: 'London Legal', time: '2026-05-05 10:00', status: 'Success', description: 'Organisation tier upgraded' },

 // Billing & Payments
 { id: 13, category: 'Billing', action: 'Payment Processed', user: 'System', org: 'Westminster Agency', time: '2026-05-08 00:05', status: 'Success', description: 'Monthly subscription charge $499.00' },
 { id: 14, category: 'Billing', action: 'Plan Upgraded', user: 'admin@elitevisa.com', org: 'Elite Visa', time: '2026-05-08 09:30', status: 'Success', description: 'Upgraded to Professional Plan - $799/mo' },
 { id: 15, category: 'Billing', action: 'Invoice Generated', user: 'System', org: 'London Legal', time: '2026-05-07 00:00', status: 'Success', description: 'Monthly invoice INV-2026-05-001' },
 { id: 16, category: 'Billing', action: 'Payment Failed', user: 'System', org: 'Bridge UK', time: '2026-05-05 02:30', status: 'Failed', description: 'Card declined - insufficient funds' },
 { id: 17, category: 'Billing', action: 'Refund Processed', user: 'superadmin', org: 'Global Migrate', time: '2026-05-05 10:15', status: 'Success', description: 'Partial refund of $250.00 issued' },
 { id: 18, category: 'Billing', action: 'Subscription Cancelled', user: 'admin@globalm.com', org: 'Global Migrate', time: '2026-05-04 15:45', status: 'Success', description: 'Organisation subscription cancelled' },

 // System & Backend Operations
 { id: 19, category: 'System', action: 'Database Backup', user: 'System', org: 'Global System', time: '2026-05-08 02:00', status: 'Success', description: 'Automatic database backup completed' },
 { id: 20, category: 'System', action: 'System Update Deployed', user: 'superadmin', org: 'Global System', time: '2026-05-07 23:00', status: 'Success', description: 'Version 2.5.1 deployed to production' },
 { id: 21, category: 'System', action: 'Bulk Case Import', user: 'staff@londonlegal.com', org: 'London Legal', time: '2026-05-07 16:20', status: 'Success', description: 'Imported 150 case records successfully' },
 { id: 22, category: 'System', action: 'API Rate Limit Triggered', user: 'System', org: 'Bridge UK', time: '2026-05-06 15:45', status: 'Failed', description: 'Rate limit exceeded for API endpoint' },
 { id: 23, category: 'System', action: 'Cache Cleared', user: 'superadmin', org: 'Global System', time: '2026-05-06 08:30', status: 'Success', description: 'System cache flushed successfully' },
 { id: 24, category: 'System', action: 'Data Export Completed', user: 'admin@elitevisa.com', org: 'Elite Visa', time: '2026-05-05 14:00', status: 'Success', description: 'Exported 500 records in CSV format' },
 ];

 const categories = ['All', 'Authentication', 'Organisation', 'Billing', 'System'];

 // Filter logs based on active tab and search term
 const filteredLogs = useMemo(() => {
 let filtered = logs;

 // Filter by category
 if (activeTab !== 'All') {
 filtered = filtered.filter(log => log.category === activeTab);
 }

 // Filter by search term
 if (searchTerm) {
 const lowerSearch = searchTerm.toLowerCase();
 filtered = filtered.filter(log =>
 log.action.toLowerCase().includes(lowerSearch) ||
 log.user.toLowerCase().includes(lowerSearch) ||
 log.org.toLowerCase().includes(lowerSearch) ||
 log.description.toLowerCase().includes(lowerSearch)
 );
 }

 return filtered;
 }, [activeTab, searchTerm]);

 // Get category icon
 const getCategoryIcon = (category) => {
 const icons = {
 'Authentication': <RiShieldLine size={14} />,
 'Organisation': <RiOrganizationChart size={14} />,
 'Billing': <RiMoneyPoundCircleLine size={14} />,
 'System': <RiHistoryLine size={14} />,
 };
 return icons[category] || null;
 };

 // Get category color
 const getCategoryColor = (category) => {
 const colors = {
 'Authentication': 'bg-blue-50 text-blue-700 border-blue-100',
 'Organisation': 'bg-purple-50 text-purple-700 border-purple-100',
 'Billing': 'bg-amber-50 text-amber-700 border-amber-100',
 'System': 'bg-slate-50 text-slate-700 border-slate-100',
 };
 return colors[category] || 'bg-gray-50 text-gray-700 border-gray-100';
 };

 return (
    <div className="space-y-4 pb-4">
 {/* Modern Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <h1 className="text-xl font-black text-secondary tracking-tight">Audit Logs</h1>
        <p className="text-xs text-gray-400 mt-0.5 font-medium uppercase tracking-widest">Complete record of system activities</p>
 <div className="flex items-center gap-2">
 <Button variant="outline"className="text-xs font-bold">
 <RiFileDownloadLine size={16} className="inline mr-1"/> Download CSV
 </Button>
 </div>
 </div>

 {/* Main Card */}
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
    >
 {/* Enhanced Filter Bar */}
      <div className="px-4 py-2 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/30">
        <div className="flex bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === cat
                  ? 'bg-secondary text-white shadow-md'
                  : 'text-gray-400 hover:text-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
 
 <div className="flex items-center gap-2">
 <div className="relative">
 <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"size={14} />
 <input
 type="text"
 placeholder="Search activities..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-9 pr-4 py-1.5 bg-white border border-gray-100 rounded-lg text-sm font-bold text-secondary w-full md:w-56 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-300"
 />
 </div>
 </div>
 </div>

 {/* Table Section */}
 <div className="overflow-x-auto flex-1">
 {filteredLogs.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black border-b border-gray-100 uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3 text-left">Activity</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Initiator</th>
                <th className="px-4 py-3 text-left">Organisation</th>
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
 <tbody className="divide-y divide-gray-100">
 {filteredLogs.map((log, idx) => (
 <motion.tr 
 key={log.id}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: idx * 0.02 }}
 className="hover:bg-gray-50/60 transition-all group border-l-4 border-l-transparent hover:border-l-secondary"
 >
 <td className="px-4 py-2.5">
 <div className="space-y-1">
 <p className="font-bold text-secondary text-xs">{log.action}</p>
 <p className="text-sm text-gray-500 font-medium truncate max-w-[200px] xl:max-w-xs">{log.description}</p>
 </div>
 </td>
 <td className="px-4 py-2.5">
 <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${getCategoryColor(log.category)}`}>
 {getCategoryIcon(log.category)}
 {log.category}
 </span>
 </td>
 <td className="px-4 py-2.5">
 <div className="flex items-center gap-2">
 <RiUser3Line className="text-gray-400"size={14} />
 <span className="text-xs font-semibold text-gray-700 truncate">{log.user}</span>
 </div>
 </td>
 <td className="px-4 py-2.5">
 <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 inline-block">
 {log.org}
 </span>
 </td>
 <td className="px-4 py-2.5">
 <span className="text-xs text-gray-600 font-semibold">{log.time}</span>
 </td>
 <td className="px-4 py-2.5 text-center">
 <span 
 className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-semibold border transition-all ${
 log.status === 'Success' 
 ? 'bg-green-50 text-green-700 border-green-100' 
 : 'bg-red-50 text-red-700 border-red-100'
 }`}
 >
 {log.status}
 </span>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 ) : (
 <div className="flex flex-col items-center justify-center py-16">
 <RiHistoryLine size={48} className="text-gray-300 mb-4"/>
 <p className="text-gray-500 font-semibold mb-1">No activities found</p>
 <p className="text-gray-400 text-xs">Try adjusting your search or filter criteria</p>
 </div>
 )}
 </div>

 {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
        <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors">&larr; Prev</button>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page 1 of 12</p>
        <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors">Next &rarr;</button>
      </div>
 </motion.div>
 </div>
 );
};

export default SuperadminAuditLog;
