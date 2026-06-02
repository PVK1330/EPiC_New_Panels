import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
 RiBillLine,
 RiPieChartLine,
 RiWallet3Line,
 RiPulseLine,
 RiEyeLine,
 RiFileDownloadLine,
 RiSearchLine,
 RiFilter3Line,
 RiSecurePaymentLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Modal from '../../components/common/Modal';
import PageHero, { HeroButton } from '../../components/superadmin/PageHero';
import useBilling from '../../hooks/useBilling';
import useDownloads from '../../hooks/useDownloads';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/datetime';

const SuperadminBilling = () => {
 const [searchTerm, setSearchTerm] = useState('');
 const [currentPage, setCurrentPage] = useState(1);
 const [selectedInvoice, setSelectedInvoice] = useState(null);
 const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

 const {
   invoices,
   invoicesLoading,
   fetchInvoices,
   fetchInvoiceById,
   dashboardStats,
   statsLoading,
   fetchDashboardStats,
 } = useBilling();
 const { exportSuperadminFinancials } = useDownloads();

 useEffect(() => {
   fetchInvoices();
   fetchDashboardStats();
 }, [fetchInvoices, fetchDashboardStats]);

 const stats = [
 { title: 'Monthly Recurring (MRR)', value: `£${dashboardStats?.mrr || '0'}`, icon: RiPulseLine, color: 'primary' },
 { title: 'Annual Recurring (ARR)', value: `£${dashboardStats?.arr || '0'}`, icon: RiWallet3Line, color: 'secondary' },
 { title: 'Churn Rate', value: `${dashboardStats?.churnRate || '0'}%`, icon: RiPieChartLine, color: 'amber' },
 { title: 'Active Subscriptions', value: dashboardStats?.activeSubscriptions || '0', icon: RiBillLine, color: 'green' },
 ];

 const filteredBilling = invoices.filter(item => 
 item.organisation?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 item.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const handleAction = async (type, invoice) => {
 if (type === 'View') {
 try {
 const res = await fetchInvoiceById(invoice.id);
 if (res.ok) {
 setSelectedInvoice(res.data);
 setIsInvoiceModalOpen(true);
 }
 } catch (e) {
 toast.error('Failed to load invoice details');
 }
 } else if (type === 'Download') {
 toast.success(`Download initiated for ${invoice.invoice_number}`);
 }
 };

 const handleGlobalAction = async (type) => {
 if (type === 'Export') {
 const result = await exportSuperadminFinancials();
 if (result.ok) {
 toast.success('Financials exported successfully');
 } else {
 toast.error(result.message || 'Failed to export financials');
 }
 }
 };

 return (
  <div className="space-y-4 pb-4">
    <PageHero
      icon={RiBillLine}
      title="Billing & Revenue"
      subtitle="Monitor platform monetization, subscription health, and revenue analytics."
    >
   <HeroButton onClick={() => handleGlobalAction('Export')}>
     <RiFileDownloadLine size={16} /> Export Financials
   </HeroButton>
    </PageHero>

 <motion.div 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ staggerChildren: 0.1 }}
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
 >
 {statsLoading ? (
 <div className="col-span-4 text-center py-10 text-gray-400">Loading stats...</div>
 ) : (
 stats.map((stat, idx) => {
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
  <span className="text-2xl font-black text-secondary tracking-tight">{stat.value}</span>
 </div>
 </div>
 </motion.div>
 );
 })
 )}
 </motion.div>

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
 {invoicesLoading ? (
 <tr>
 <td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading invoices...</td>
 </tr>
 ) : filteredBilling.length === 0 ? (
 <tr>
 <td colSpan={7} className="px-4 py-10 text-center text-gray-400">No invoices found</td>
 </tr>
 ) : (
 filteredBilling.map((item, idx) => (
 <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
 <td className="px-4 py-3">
 <span className="text-sm font-semibold text-secondary bg-gray-50 px-2 py-0.5 rounded border border-gray-100 group-hover:text-primary transition-all">
 {item.invoice_number}
 </span>
 </td>
 <td className="px-4 py-3">
 <p className="font-bold text-secondary text-xs">{item.organisation?.name || '—'}</p>
 <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border bg-gray-50 text-gray-600 border-gray-200">{item.payment_method || 'N/A'}</span>
 </td>
 <td className="px-4 py-3">
 <span className={`px-2 py-0.5 rounded text-sm font-bold tracking-wider border ${
 item.subscription?.plan?.name === 'Enterprise' ? 'bg-primary/5 text-primary border-primary/10' : 'bg-gray-50 text-gray-400 border-gray-100'
 }`}>
 {item.subscription?.plan?.name || '—'}
 </span>
 </td>
 <td className="px-5 py-3 text-center font-semibold text-secondary text-xs">£{item.amount}</td>
 <td className="px-5 py-3 text-center text-gray-400 font-bold text-sm">{item.due_at ? formatDate(item.due_at) : '—'}</td>
 <td className="px-4 py-3">
 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-bold tracking-wider border ${
 item.status === 'paid' ? 'bg-green-50 text-green-700 border-green-100' :
 item.status === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-100' :
 item.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'
 }`}>
 {item.status}
 </span>
 </td>
 <td className="px-4 py-3 text-right">
 <div className="flex items-center justify-end gap-1">
 <button 
 onClick={() => handleAction('View', item)}
 className="p-1.5 text-gray-500 hover:text-secondary hover:bg-gray-100 rounded-lg transition-all"
 title="View Invoice"
 >
 <RiEyeLine size={16} />
 </button>
 <button 
 onClick={() => handleAction('Download', item)}
 className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
 title="Download PDF"
 >
 <RiFileDownloadLine size={16} />
 </button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>

 <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
 <p className="text-sm font-bold text-gray-400">Page {currentPage} of {Math.ceil(filteredBilling.length / 10)}</p>
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
 disabled={currentPage >= Math.ceil(filteredBilling.length / 10)}
 className="px-3 py-1 rounded-lg text-sm font-bold bg-white border border-gray-200 text-secondary hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
 >
 Next
 </button>
 </div>
 </div>
 </div>

 <Modal
 isOpen={isInvoiceModalOpen}
 onClose={() => setIsInvoiceModalOpen(false)}
 title={`Invoice ${selectedInvoice?.invoice_number}`}
 subtitle="Transaction details and payment audit."
 maxWidth="max-w-md"
 footer={
 <div className="flex justify-end gap-2 w-full">
 <Button variant="secondary"onClick={() => setIsInvoiceModalOpen(false)} className="px-5 py-2 text-sm font-bold">Close</Button>
 <Button onClick={() => handleAction('Download', selectedInvoice)} className="px-6 py-2 text-sm font-bold shadow-sm">
 Download PDF
 </Button>
 </div>
 }
 >
 {selectedInvoice && (
 <div className="space-y-6 py-2">
 <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 p-4 mb-2">
 <div className="flex justify-between items-start mb-4">
 <div>
 <span className="text-sm font-semibold text-gray-400">{selectedInvoice.invoice_number}</span>
 <h4 className="text-sm font-semibold text-secondary mt-1">{selectedInvoice.organisation?.name}</h4>
 </div>
 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
 selectedInvoice.status === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
 }`}>{selectedInvoice.status}</span>
 </div>
 <div className="flex justify-between items-end border-t border-gray-200 pt-3">
 <div>
 <p className="text-sm text-gray-500 font-bold">Tier: {selectedInvoice.subscription?.plan?.name || '—'}</p>
 <p className="text-sm text-gray-500 font-bold">{selectedInvoice.due_at ? formatDate(selectedInvoice.due_at) : '—'}</p>
 </div>
 <div className="text-right">
 <p className="text-sm font-bold text-gray-400 mb-0.5">Amount</p>
 <h4 className="text-xl font-semibold text-primary">£{selectedInvoice.amount}</h4>
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
 <p className="text-sm text-gray-400 font-bold">{selectedInvoice.payment_method || 'Standard Card'}</p>
 </div>
 </div>
 <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
 selectedInvoice.status === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
 }`}>{selectedInvoice.status}</span>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="p-3 border border-gray-50 rounded-xl">
 <p className="text-xs font-bold text-gray-400 mb-1">Gateway ID</p>
 <p className="text-sm font-mono font-bold text-secondary truncate">{selectedInvoice.stripe_invoice_id || 'N/A'}</p>
 </div>
 <div className="p-3 border border-gray-50 rounded-xl">
 <p className="text-xs font-bold text-gray-400 mb-1">Currency</p>
 <p className="text-sm font-bold text-secondary">{selectedInvoice.currency}</p>
 </div>
 </div>
 </div>

 <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
 <p className="text-sm text-primary font-bold leading-relaxed">
 This invoice was generated automatically by the EPiC Billing Engine. All amounts are inclusive of VAT where applicable.
 </p>
 </div>
 </div>
 )}
 </Modal>
 </div>
 );
};

export default SuperadminBilling;
