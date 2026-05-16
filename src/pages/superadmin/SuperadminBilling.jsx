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
  <div className="space-y-4 pb-4">
    {/* Modern Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
      <div>
        <h1 className="text-xl font-black text-secondary tracking-tight">Billing & Revenue</h1>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">Monitor platform monetization, subscription health, and revenue analytics.</p>
      </div>
  <div className="flex items-center gap-2">
   <Button variant="primary" onClick={() => handleGlobalAction('Export')} className="text-xs font-bold">
     <RiFileDownloadLine size={16} className="inline mr-1"/> Export Financials
   </Button>
  </div>
 </div>

 {/* Primary KPI Grid */}
 <motion.div 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ staggerChildren: 0.1 }}
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
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
   initial={{ opacity: 0, scale: 0.95 }}
   animate={{ opacity: 1, scale: 1 }}
   transition={{ duration: 0.3, delay: idx * 0.05 }}
   className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 group hover:shadow-md transition-shadow"
  >
 <div className="flex items-center justify-between">
 <div className={`p-2 bg-gradient-to-br ${colors.icon} bg-opacity-10 text-white rounded-lg shadow-sm`}>
 <stat.icon size={20} />
 </div>
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-400 mb-1">{stat.title}</p>
 <div className="flex items-center">
  <span className="text-2xl font-black text-secondary tracking-tight">£{stat.value.replace('£', '')}</span>
  <span className={`ml-2 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${stat.trend.startsWith('+') ? 'text-green-600 bg-green-50 border border-green-100' : 'text-red-600 bg-red-50 border border-red-100'}`}>
  {stat.trend}
  </span>
 </div>
 </div>
 </motion.div>
 );
 })}
 </motion.div>



   {/* Financial Ledger */}
   <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-4 py-2.5 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
     <div className="flex items-center gap-3">
      <h3 className="text-xs font-black text-secondary uppercase tracking-widest">Revenue Ledger</h3>
      <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest rounded shadow-sm">Live</span>
     </div>
 <div className="flex items-center gap-2">
 <div className="relative">
 <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"size={14} />
 <input
 type="text"
 placeholder="Search invoice..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-9 pr-4 py-1.5 bg-white border border-gray-100 rounded-lg text-sm font-bold text-secondary w-full md:w-48 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-300"
 />
 </div>
 <button className="p-1.5 bg-white border border-gray-100 text-gray-400 hover:text-secondary rounded-lg transition-all shadow-sm">
 <RiFilter3Line size={16} />
 </button>
 </div>
 </div>
 <div className="overflow-x-auto no-scrollbar">
    <table className="w-full text-sm">
     <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black border-b border-gray-100 uppercase tracking-widest">
      <tr>
       <th className="px-4 py-3 text-left">Invoice ID</th>
       <th className="px-4 py-3 text-left">Organisation</th>
       <th className="px-4 py-3 text-left">Tier</th>
       <th className="px-4 py-3 text-center">Amount</th>
       <th className="px-4 py-3 text-center">Renewal</th>
       <th className="px-4 py-3 text-left">Status</th>
       <th className="px-4 py-3 text-right">Action</th>
      </tr>
     </thead>
 <tbody className="divide-y divide-gray-50/50">
 {filteredBilling.map((item, idx) => (
 <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
 <td className="px-4 py-3">
 <span className="text-sm font-semibold text-secondary bg-gray-50 px-2 py-0.5 rounded border border-gray-100 group-hover:text-primary transition-all">
 {item.id}
 </span>
 </td>
 <td className="px-4 py-3">
 <p className="font-bold text-secondary text-xs">{item.org}</p>
 {item.method === 'Stripe' && <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border bg-violet-50 text-violet-700 border-violet-100">Stripe</span>}
 {item.method === 'PayPal' && <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-100">PayPal</span>}
 {item.method === 'Bank' && <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border bg-gray-50 text-gray-600 border-gray-200">Bank Transfer</span>}
 {item.method === '-' && <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border bg-gray-50 text-gray-400 border-gray-100">None</span>}
 </td>
 <td className="px-4 py-3">
 <span className={`px-2 py-0.5 rounded text-sm font-bold tracking-wider border ${
 item.plan === 'Enterprise' ? 'bg-primary/5 text-primary border-primary/10' : 'bg-gray-50 text-gray-400 border-gray-100'
 }`}>
 {item.plan}
 </span>
 </td>
 <td className="px-5 py-3 text-center font-semibold text-secondary text-xs">{item.amount}</td>
 <td className="px-5 py-3 text-center text-gray-400 font-bold text-sm">{item.date}</td>
 <td className="px-4 py-3">
 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-bold tracking-wider border ${
 item.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-100' :
 item.status === 'Pending' ? 'bg-blue-50 text-blue-700 border-blue-100' :
 item.status === 'Trial' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-red-50 text-red-700 border-red-100'
 }`}>
 {item.status}
 </span>
 </td>
 <td className="px-4 py-3 text-right">
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
 <p className="text-sm font-bold text-gray-400">Page {currentPage} of 14</p>
 <div className="flex gap-2">
 <button 
 onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
 disabled={currentPage === 1}
 className="px-3 py-1 rounded-lg text-sm font-bold bg-white border border-gray-200 text-gray-300 disabled:opacity-50"
 >
 Previous
 </button>
 <button 
 onClick={() => setCurrentPage(currentPage + 1)}
 className="px-3 py-1 rounded-lg text-sm font-bold bg-white border border-gray-200 text-secondary hover:bg-gray-50 transition-all shadow-sm"
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
 <Button variant="secondary"onClick={() => setIsInvoiceModalOpen(false)} className="px-5 py-2 text-sm font-bold">Close</Button>
 <Button onClick={() => handleAction('Download', selectedInvoice?.id)} className="px-6 py-2 text-sm font-bold shadow-sm">
 Download PDF
 </Button>
 </div>
 }
 >
 <div className="space-y-6 py-2">
 <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 p-4 mb-2">
 <div className="flex justify-between items-start mb-4">
 <div>
 <span className="text-sm font-semibold text-gray-400">{selectedInvoice?.id}</span>
 <h4 className="text-sm font-semibold text-secondary mt-1">{selectedInvoice?.org}</h4>
 </div>
 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
 selectedInvoice?.status === 'Paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
 }`}>{selectedInvoice?.status}</span>
 </div>
 <div className="flex justify-between items-end border-t border-gray-200 pt-3">
 <div>
 <p className="text-sm text-gray-500 font-bold">Tier: {selectedInvoice?.plan}</p>
 <p className="text-sm text-gray-500 font-bold">{selectedInvoice?.date}</p>
 </div>
 <div className="text-right">
 <p className="text-sm font-bold text-gray-400 mb-0.5">Amount</p>
 <h4 className="text-xl font-semibold text-primary">{selectedInvoice?.amount}</h4>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-white rounded-lg border border-gray-100 text-secondary">
 <RiSecurePaymentLine size={18} />
 </div>
 <div>
 <p className="text-sm font-bold text-secondary">Payment Method</p>
 <p className="text-sm text-gray-400 font-bold">{selectedInvoice?.method || 'Standard Card'}</p>
 </div>
 </div>
 <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
 selectedInvoice?.status === 'Paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
 }`}>{selectedInvoice?.status}</span>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="p-3 border border-gray-50 rounded-xl">
 <p className="text-xs font-bold text-gray-400 mb-1">Gateway ID</p>
 <p className="text-sm font-mono font-bold text-secondary truncate">txn_3M2q9uL9xZ0k...</p>
 </div>
 <div className="p-3 border border-gray-50 rounded-xl">
 <p className="text-xs font-bold text-gray-400 mb-1">Service Node</p>
 <p className="text-sm font-bold text-secondary">UK-PRIMARY-01</p>
 </div>
 </div>
 </div>

 <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
 <p className="text-sm text-primary font-bold leading-relaxed">
 This invoice was generated automatically by the EPiC Billing Engine. All amounts are inclusive of VAT where applicable.
 </p>
 </div>
 </div>
 </Modal>
 </div>
 );
};

export default SuperadminBilling;
