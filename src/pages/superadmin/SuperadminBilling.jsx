import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiBillLine,
  RiDownload2Line,
  RiInformationLine,
  RiMore2Line,
  RiExchangeLine,
  RiCheckDoubleLine,
  RiArrowRightUpLine,
  RiPieChartLine,
  RiWallet3Line,
  RiPulseLine,
  RiEyeLine,
  RiFileDownloadLine,
  RiEditLine,
  RiHistoryLine,
  RiSearchLine,
  RiFilter3Line,
  RiSecurePaymentLine,
  RiCloseLine,
  RiAddLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Modal from '../../components/common/Modal';

const SuperadminBilling = () => {
  const [activeMetric, setActiveMetric] = useState('MRR');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const stats = [
    { title: 'Monthly Recurring (MRR)', value: '£42,840', trend: '+12.5%', icon: RiPulseLine, color: 'primary' },
    { title: 'Annual Recurring (ARR)', value: '£514,080', trend: '+15.2%', icon: RiWallet3Line, color: 'secondary' },
    { title: 'Churn Rate', value: '1.2%', trend: '-0.4%', icon: RiPieChartLine, color: 'amber' },
    { title: 'Active Subscriptions', value: '1,240', trend: '+5.1%', icon: RiBillLine, color: 'green' },
  ];

  const orgBilling = [
    { id: '#INV-8921', org: 'Elite Visa Solutions', plan: 'Enterprise', amount: '£799', date: '2026-06-12', status: 'Paid', method: 'Stripe' },
    { id: '#INV-8920', org: 'Global Migrate Pro', plan: 'Pro', amount: '£349', date: '2026-06-05', status: 'Pending', method: 'PayPal' },
    { id: '#INV-8919', org: 'London Legal Partners', plan: 'Starter', amount: '£0', date: '2026-05-28', status: 'Trial', method: '-' },
    { id: '#INV-8918', org: 'Bridge UK Immigration', plan: 'Enterprise', amount: '£799', date: '2026-05-12', status: 'Overdue', method: 'Stripe' },
    { id: '#INV-8917', org: 'Westminster Agency', plan: 'Pro', amount: '£349', date: '2026-05-08', status: 'Paid', method: 'Bank' },
  ];

  const mrrData = [45, 52, 48, 61, 70, 65, 78, 85, 82, 95, 110, 124];
  const churnData = [2.1, 1.8, 1.9, 1.5, 1.2, 1.4, 1.1, 0.9, 1.2, 1.0, 0.8, 0.7];

  const filteredBilling = orgBilling.filter(item => 
    item.org.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (type, id) => {
    if (type === 'View') {
      const invoice = orgBilling.find(inv => inv.id === id);
      setSelectedInvoice(invoice);
      setIsInvoiceModalOpen(true);
    } else {
      alert(`${type} initiated for ${id}. File generation in progress...`);
    }
  };

  const handleGlobalAction = (type) => {
    alert(`${type} workflow started. Redirecting to secure ${type === 'Export' ? 'data stream' : 'audit logs'}...`);
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Modern Header with Gradient Background */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-100 rounded-2xl p-8 text-white shadow-lg border border-white/10 overflow-hidden relative"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl font-black text-red-700  mb-2">Billing & Revenue</h1>
             <p className="text-sm text-gray-600 font-medium">Monitor platform monetization, subscription health, and revenue analytics.</p>
          </div>
          <div className="flex items-center gap-3">
             <motion.div
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
             >
               <Button 
                  onClick={() => handleGlobalAction('Export')}
                  className="px-6 py-3 text-[11px] font-black uppercase tracking-widest bg-blue-950 border border-white/30 text-white shadow-lg backdrop-blur-sm"
               >
                  <RiFileDownloadLine size={16} className="inline mr-2" />Export Financials
               </Button>
             </motion.div>
             <motion.div
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
             >
               <Button 
               
                  onClick={() => handleGlobalAction('Audit')}
                   className="px-6 py-3 text-[11px] font-black uppercase tracking-widest bg-blue-950 border border-white/30 text-white 
                    shadow-lg backdrop-blur-sm" >
                  <RiHistoryLine size={18} /> Audit Billing
               </Button>
             </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Primary KPI Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, idx) => {
          const colorMap = {
            'primary': { bg: 'from-blue-50 to-blue-100/50', border: 'border-blue-200/50', icon: 'from-blue-500 to-blue-600', label: 'text-blue-600', value: 'text-blue-900' },
            'secondary': { bg: 'from-green-50 to-green-100/50', border: 'border-green-200/50', icon: 'from-green-500 to-green-600', label: 'text-green-600', value: 'text-green-900' },
            'amber': { bg: 'from-amber-50 to-amber-100/50', border: 'border-amber-200/50', icon: 'from-amber-500 to-amber-600', label: 'text-amber-600', value: 'text-amber-900' },
            'green': { bg: 'from-purple-50 to-purple-100/50', border: 'border-purple-200/50', icon: 'from-purple-500 to-purple-600', label: 'text-purple-600', value: 'text-purple-900' },
          };
          const colors = colorMap[stat.color] || colorMap.primary;
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className={`p-6 bg-linear-to-br ${colors.bg} rounded-2xl border ${colors.border} shadow-sm flex items-start gap-4 hover:border-opacity-80 cursor-pointer group overflow-hidden relative`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/30 rounded-full blur-2xl" />
              <div className="relative z-10 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 bg-linear-to-br ${colors.icon} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-200`}>
                    <stat.icon size={24} />
                  </div>
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                    stat.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
                <p className={`text-[9px] font-black ${colors.label} uppercase tracking-widest`}>{stat.title}</p>
                <h3 className={`text-3xl font-black ${colors.value} mt-2 tracking-tight`}>{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* MRR Growth Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">{activeMetric} Performance</h3>
                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{activeMetric === 'MRR' ? 'Monthly Recurring Revenue growth over 12 months.' : 'Customer churn percentage trends over 12 months.'}</p>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                 <button 
                   onClick={() => setActiveMetric('MRR')}
                   className={`px-4 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${activeMetric === 'MRR' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-secondary'}`}
                 >
                    MRR
                 </button>
                 <button 
                   onClick={() => setActiveMetric('Churn')}
                   className={`px-4 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${activeMetric === 'Churn' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-secondary'}`}
                 >
                    Churn
                 </button>
              </div>
           </div>

           <div className="h-48 flex items-end justify-between gap-3 pt-2">
              {(activeMetric === 'MRR' ? mrrData : churnData).map((h, i) => (
                 <div key={i} className="flex-1 group relative flex flex-col justify-end h-full">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: activeMetric === 'MRR' ? `${h}%` : `${h * 30}%` }}
                      transition={{ delay: i * 0.05, duration: 0.8 }}
                      className={`w-full rounded-t-lg transition-all cursor-pointer relative ${activeMetric === 'MRR' ? 'bg-primary/10 group-hover:bg-primary/20' : 'bg-amber-400/10 group-hover:bg-amber-400/20'}`}
                    >
                       <div className={`absolute top-0 inset-x-0 h-0.5 rounded-full ${activeMetric === 'MRR' ? 'bg-primary' : 'bg-amber-400'}`} />
                       <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-secondary text-white text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all shadow-lg pointer-events-none">
                          {activeMetric === 'MRR' ? `£${h}k` : `${h}%`}
                       </div>
                    </motion.div>
                 </div>
              ))}
           </div>
           <div className="flex justify-between mt-6 px-1 border-t border-gray-50 pt-3">
              {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => (
                 <span key={i} className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{m}</span>
              ))}
           </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
           <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-6">Subscription Mix</h3>
           <div className="space-y-5 flex-1 flex flex-col justify-center">
              {[
                { name: 'Enterprise', percentage: 45, color: 'bg-primary' },
                { name: 'Professional', percentage: 35, color: 'bg-secondary' },
                { name: 'Starter', percentage: 20, color: 'bg-amber-400' },
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                   <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-gray-500">{item.name}</span>
                      <span className="text-secondary">{item.percentage}%</span>
                   </div>
                   <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        className={`h-full ${item.color}`}
                      />
                   </div>
                </div>
              ))}
           </div>
           <div className="mt-8 pt-5 border-t border-gray-50">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight leading-relaxed">
                 Enterprise accounts contribute to 68% of the platform's total gross volume.
              </p>
           </div>
        </div>
      </div>

      {/* Financial Ledger */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
           <div className="flex items-center gap-3">
              <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest">Revenue Ledger</h3>
              <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[8px] font-black uppercase tracking-widest rounded border border-green-100">Real-time</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-secondary w-full md:w-48 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-300 uppercase"
                />
              </div>
              <button className="p-1.5 bg-white border border-gray-100 text-gray-400 hover:text-secondary rounded-lg transition-all shadow-sm">
                <RiFilter3Line size={16} />
              </button>
           </div>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-white text-[9px] uppercase text-gray-400 tracking-widest font-bold border-b border-gray-50">
              <tr>
                <th className="px-5 py-3 text-left">Invoice ID</th>
                <th className="px-5 py-3 text-left">Organisation</th>
                <th className="px-5 py-3 text-left">Tier</th>
                <th className="px-5 py-3 text-center">Amount</th>
                <th className="px-5 py-3 text-center">Renewal</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {filteredBilling.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-5 py-3">
                     <span className="text-[9px] font-black text-secondary bg-gray-50 px-2 py-0.5 rounded border border-gray-100 group-hover:text-primary transition-all">
                        {item.id}
                     </span>
                  </td>
                  <td className="px-5 py-3">
                     <p className="font-bold text-secondary text-xs">{item.org}</p>
                     <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{item.method}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                       item.plan === 'Enterprise' ? 'bg-primary/5 text-primary border-primary/10' : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                      {item.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center font-black text-secondary text-xs tracking-tight">{item.amount}</td>
                  <td className="px-5 py-3 text-center text-gray-400 font-bold text-[9px] uppercase">{item.date}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      item.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-100' :
                      item.status === 'Pending' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      item.status === 'Trial' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                       <button 
                         onClick={() => handleAction('View', item.id)}
                         className="p-1.5 text-gray-500 hover:text-secondary hover:bg-gray-100 rounded-lg transition-all" 
                         title="View Invoice"
                       >
                          <RiEyeLine size={16} />
                       </button>
                       <button 
                         onClick={() => handleAction('Download', item.id)}
                         className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" 
                         title="Download PDF"
                       >
                          <RiFileDownloadLine size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Page {currentPage} of 14</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg text-[9px] font-bold uppercase bg-white border border-gray-200 text-gray-300 disabled:opacity-50"
            >
               Previous
            </button>
            <button 
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 rounded-lg text-[9px] font-bold uppercase bg-white border border-gray-200 text-secondary hover:bg-gray-50 transition-all shadow-sm"
            >
               Next
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Details Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title={`Invoice ${selectedInvoice?.id}`}
        subtitle="Transaction details and payment audit."
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsInvoiceModalOpen(false)} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest">Close</Button>
            <Button onClick={() => handleAction('Download', selectedInvoice?.id)} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
               Download PDF
            </Button>
          </div>
        }
      >
        <div className="space-y-6 py-2">
           <div className="flex justify-between items-start border-b border-gray-50 pb-5">
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Billed To</p>
                 <h4 className="text-sm font-black text-secondary uppercase tracking-tight">{selectedInvoice?.org}</h4>
                 <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Tier: {selectedInvoice?.plan}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Amount Paid</p>
                 <h4 className="text-lg font-black text-primary tracking-tight">{selectedInvoice?.amount}</h4>
                 <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">{selectedInvoice?.date}</p>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-gray-100 text-secondary">
                       <RiSecurePaymentLine size={18} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Payment Method</p>
                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{selectedInvoice?.method || 'Standard Card'}</p>
                    </div>
                 </div>
                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                    selectedInvoice?.status === 'Paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                 }`}>{selectedInvoice?.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 border border-gray-50 rounded-xl">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gateway ID</p>
                    <p className="text-[9px] font-mono font-bold text-secondary truncate">txn_3M2q9uL9xZ0k...</p>
                 </div>
                 <div className="p-3 border border-gray-50 rounded-xl">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Service Node</p>
                    <p className="text-[9px] font-bold text-secondary uppercase">UK-PRIMARY-01</p>
                 </div>
              </div>
           </div>

           <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-[9px] text-primary font-bold uppercase tracking-widest leading-relaxed">
                 This invoice was generated automatically by the EPiC Billing Engine. All amounts are inclusive of VAT where applicable.
              </p>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuperadminBilling;
