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

    // Organization & Company Management
    { id: 7, category: 'Organization', action: 'Organization Created', user: 'superadmin', org: 'New Tech Solutions', time: '2026-05-08 13:00', status: 'Success', description: 'New organization registered in system' },
    { id: 8, category: 'Organization', action: 'Organization Deleted', user: 'superadmin', org: 'Test Corp', time: '2026-05-07 11:00', status: 'Success', description: 'Organization removed from system' },
    { id: 9, category: 'Organization', action: 'User Added to Organization', user: 'admin@elitevisa.com', org: 'Elite Visa', time: '2026-05-07 09:15', status: 'Success', description: 'New team member added to organization' },
    { id: 10, category: 'Organization', action: 'Organization Settings Updated', user: 'superadmin', org: 'Global Migrate', time: '2026-05-06 16:30', status: 'Success', description: 'Updated organization configuration' },
    { id: 11, category: 'Organization', action: 'User Removed from Organization', user: 'admin@westminster.com', org: 'Westminster Agency', time: '2026-05-06 12:45', status: 'Success', description: 'User access revoked from organization' },
    { id: 12, category: 'Organization', action: 'Organization Plan Changed', user: 'superadmin', org: 'London Legal', time: '2026-05-05 10:00', status: 'Success', description: 'Organization tier upgraded' },

    // Billing & Payments
    { id: 13, category: 'Billing', action: 'Payment Processed', user: 'System', org: 'Westminster Agency', time: '2026-05-08 00:05', status: 'Success', description: 'Monthly subscription charge $499.00' },
    { id: 14, category: 'Billing', action: 'Plan Upgraded', user: 'admin@elitevisa.com', org: 'Elite Visa', time: '2026-05-08 09:30', status: 'Success', description: 'Upgraded to Professional Plan - $799/mo' },
    { id: 15, category: 'Billing', action: 'Invoice Generated', user: 'System', org: 'London Legal', time: '2026-05-07 00:00', status: 'Success', description: 'Monthly invoice INV-2026-05-001' },
    { id: 16, category: 'Billing', action: 'Payment Failed', user: 'System', org: 'Bridge UK', time: '2026-05-05 02:30', status: 'Failed', description: 'Card declined - insufficient funds' },
    { id: 17, category: 'Billing', action: 'Refund Processed', user: 'superadmin', org: 'Global Migrate', time: '2026-05-05 10:15', status: 'Success', description: 'Partial refund of $250.00 issued' },
    { id: 18, category: 'Billing', action: 'Subscription Cancelled', user: 'admin@globalm.com', org: 'Global Migrate', time: '2026-05-04 15:45', status: 'Success', description: 'Organization subscription cancelled' },

    // System & Backend Operations
    { id: 19, category: 'System', action: 'Database Backup', user: 'System', org: 'Global System', time: '2026-05-08 02:00', status: 'Success', description: 'Automatic database backup completed' },
    { id: 20, category: 'System', action: 'System Update Deployed', user: 'superadmin', org: 'Global System', time: '2026-05-07 23:00', status: 'Success', description: 'Version 2.5.1 deployed to production' },
    { id: 21, category: 'System', action: 'Bulk Case Import', user: 'staff@londonlegal.com', org: 'London Legal', time: '2026-05-07 16:20', status: 'Success', description: 'Imported 150 case records successfully' },
    { id: 22, category: 'System', action: 'API Rate Limit Triggered', user: 'System', org: 'Bridge UK', time: '2026-05-06 15:45', status: 'Failed', description: 'Rate limit exceeded for API endpoint' },
    { id: 23, category: 'System', action: 'Cache Cleared', user: 'superadmin', org: 'Global System', time: '2026-05-06 08:30', status: 'Success', description: 'System cache flushed successfully' },
    { id: 24, category: 'System', action: 'Data Export Completed', user: 'admin@elitevisa.com', org: 'Elite Visa', time: '2026-05-05 14:00', status: 'Success', description: 'Exported 500 records in CSV format' },
  ];

  const categories = ['All', 'Authentication', 'Organization', 'Billing', 'System'];

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
      'Organization': <RiOrganizationChart size={14} />,
      'Billing': <RiMoneyPoundCircleLine size={14} />,
      'System': <RiHistoryLine size={14} />,
    };
    return icons[category] || null;
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Authentication': 'bg-blue-50 text-blue-700 border-blue-100',
      'Organization': 'bg-purple-50 text-purple-700 border-purple-100',
      'Billing': 'bg-amber-50 text-amber-700 border-amber-100',
      'System': 'bg-slate-50 text-slate-700 border-slate-100',
    };
    return colors[category] || 'bg-gray-50 text-gray-700 border-gray-100';
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Modern Header with Gradient Background */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-secondary via-primary to-blue-600 rounded-2xl p-8 text-white shadow-lg border border-white/10 overflow-hidden relative"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-2xl font-black text-white  mb-2">Audit Logs</h1>
             <p className="text-sm text-white/80 font-medium">Complete record of all system activities and administrative operations across all modules</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="secondary" className="px-6 py-3 text-[11px] font-black uppercase tracking-widest bg-white/20 border border-white/30 text-white hover:bg-white/30 shadow-lg backdrop-blur-sm">
              <RiFileDownloadLine size={16} /> Download CSV
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex flex-col"
      >
        {/* Enhanced Filter Bar */}
        <div className="p-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-gray-50/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
              {categories.map((cat, idx) => (
                <motion.button
                  key={cat}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(cat)}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-2 flex items-center gap-2 ${
                    activeTab === cat
                      ? 'bg-secondary text-white border-secondary shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary'
                  }`}
                >
                  {cat !== 'All' && getCategoryIcon(cat)}
                  {cat}
                </motion.button>
              ))}
            </div>
            
            {/* Search Input */}
            <div className="relative min-w-max">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-secondary w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all placeholder:text-gray-400 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto flex-1">
          {filteredLogs.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Activity</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Category</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Initiated By</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Organization</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Timestamp</span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Status</span>
                  </th>
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
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-bold text-secondary text-sm uppercase tracking-tight">{log.action}</p>
                        <p className="text-xs text-gray-500 font-medium">{log.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${getCategoryColor(log.category)}`}>
                        {getCategoryIcon(log.category)}
                        {log.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <RiUser3Line className="text-gray-400" size={14} />
                        <span className="text-xs font-semibold text-gray-700 truncate">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 inline-block">
                        {log.org}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-600 font-semibold">{log.time}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <motion.span 
                        whileHover={{ scale: 1.05 }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
                          log.status === 'Success' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {log.status === 'Success' ? (
                          <RiCheckLine size={14} />
                        ) : (
                          <RiCloseLine size={14} />
                        )}
                        {log.status}
                      </motion.span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <RiHistoryLine size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 font-semibold uppercase tracking-widest mb-1">No activities found</p>
              <p className="text-gray-400 text-xs">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiHistoryLine className="text-gray-400" size={14} />
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
              Showing {filteredLogs.length} of {logs.length} entries
            </p>
          </div>
          <div className="flex gap-2">
            <button disabled className="px-5 py-2 rounded-lg text-xs font-bold uppercase bg-white border border-gray-200 text-gray-300 hover:bg-gray-50 transition-all cursor-not-allowed">
              ← Previous
            </button>
            <button className="px-5 py-2 rounded-lg text-xs font-bold uppercase bg-white border border-gray-200 text-secondary hover:bg-secondary/5 transition-all shadow-sm">
              Next →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SuperadminAuditLog;
