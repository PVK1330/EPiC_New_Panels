import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
 RiSearchLine,
 RiHistoryLine,
 RiFileDownloadLine,
 RiUser3Line,
 RiOrganizationChart,
 RiShieldLine,
 RiMoneyPoundCircleLine,
} from 'react-icons/ri';
import PageHero, { HeroButton } from '../../components/superadmin/PageHero';
import { fetchPlatformAuditLogs } from '../../services/superadminAudit.service';
import useDownloads from '../../hooks/useDownloads';
import { formatDateTime } from '../../utils/datetime';
const SuperadminAuditLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const { exportPlatformAuditLogs } = useDownloads();

  const categories = ['All', 'Authentication', 'Organisation', 'Billing', 'System'];

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPlatformAuditLogs({
        category: activeTab,
        search: searchTerm,
        page: currentPage,
        limit: 10
      });
      const data = res.data?.data || {};
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalLogs(data.pagination?.total || 0);
    } catch (e) {
      console.error("Failed to load platform audit logs:", e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, currentPage]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    setCurrentPage(1);
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

  const handleDownloadCsv = async () => {
    const result = await exportPlatformAuditLogs();
    if (!result.ok) {
      console.error("CSV download failed:", result.error);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <PageHero
        icon={RiHistoryLine}
        title="Audit Logs"
        subtitle="Complete record of system activities"
      >
        <HeroButton onClick={handleDownloadCsv}>
          <RiFileDownloadLine size={16} /> Download Excel
        </HeroButton>
      </PageHero>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]"
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
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading platform logs...</p>
            </div>
          ) : logs.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black border-b border-gray-100 uppercase tracking-widest">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">Activity</th>
                  <th scope="col" className="px-4 py-3 text-left">Category</th>
                  <th scope="col" className="px-4 py-3 text-left">Initiator</th>
                  <th scope="col" className="px-4 py-3 text-left">Organisation</th>
                  <th scope="col" className="px-4 py-3 text-left">Timestamp</th>
                  <th scope="col" className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log, idx) => (
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
                        <RiUser3Line className="text-gray-400" size={14} />
                        <span className="text-xs font-semibold text-gray-700 truncate">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 inline-block">
                        {log.org}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-gray-600 font-semibold">
                        {log.created_at ? formatDateTime(log.created_at) : "N/A"}
                      </span>
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
            <div className="flex flex-col items-center justify-center py-24">
              <RiHistoryLine size={48} className="text-gray-300 mb-4"/>
              <p className="text-gray-500 font-semibold mb-1">No activities found</p>
              <p className="text-gray-400 text-xs">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors disabled:opacity-30 disabled:hover:text-gray-400"
          >
            &larr; Prev
          </button>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages} ({totalLogs} total)
          </p>
          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(p => p + 1)}
            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors disabled:opacity-30 disabled:hover:text-gray-400"
          >
            Next &rarr;
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SuperadminAuditLog;
