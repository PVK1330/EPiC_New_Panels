import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useBilling from '../../hooks/useBilling';
import {
 RiMoneyPoundCircleLine,
 RiArrowUpLine,
 RiArrowDownLine,
 RiDownload2Line,
 RiFilter3Line,
 RiSearchLine,
 RiBankCardLine,
 RiExchangeLine,
 RiFileDownloadLine,
 RiShieldCheckLine,
 RiInformationLine,
 RiEyeLine,
 RiPulseLine,
 RiSecurePaymentLine,
 RiMastercardLine,
 RiVisaLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/Input';
import PageHero, { HeroButton, HeroGhostButton } from '../../components/superadmin/PageHero';
import { formatDate, formatDateTime } from '../../utils/datetime';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md group"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-lg bg-${color === 'amber' ? 'amber-50 text-amber-600 border-amber-100' : 'primary/5 text-primary border-primary/10'} border transition-all group-hover:scale-110`}>
        <Icon size={20} />
      </div>
    </div>
    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
    <h3 className="text-2xl font-black text-secondary mt-1 tracking-tight group-hover:text-primary transition-colors">{value}</h3>
  </motion.div>
);

const SuperadminPayments = () => {
 const [activeTab, setActiveTab] = useState('Transactions');
 const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
 const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState(false);
 const [selectedTransaction, setSelectedTransaction] = useState(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [gatewayConfig, setGatewayConfig] = useState({
   publishable_key: '',
   secret_key: '',
   webhook_secret: '',
 });

 const {
   transactions,
   transactionsLoading,
   fetchTransactions,
   fetchTransactionById,
   gatewayStatus,
   gatewayLoading,
   fetchGatewayStatus,
   saveGatewayConfig,
   dashboardStats,
   statsLoading,
   fetchDashboardStats,
 } = useBilling();

 useEffect(() => {
   fetchTransactions();
   fetchGatewayStatus();
   fetchDashboardStats();
 }, [fetchTransactions, fetchGatewayStatus, fetchDashboardStats]);

 const stats = [
    { title: 'Gross Volume', value: `£${dashboardStats?.grossVolume || '0'}`, icon: RiMoneyPoundCircleLine, color: 'primary' },
    { title: 'Net Revenue', value: `£${dashboardStats?.netRevenue || '0'}`, icon: RiPulseLine, color: 'primary' },
    { title: 'Success Rate', value: `${dashboardStats?.successRate || '0'}%`, icon: RiShieldCheckLine, color: 'green' },
    { title: 'Refund Rate', value: `${dashboardStats?.refundRate || '0'}%`, icon: RiExchangeLine, color: 'amber' },
 ];

  const currentData = transactions.filter(t => {
    if (activeTab === 'Transactions') return t.status !== 'refunded';
    if (activeTab === 'Payouts') return false;
    if (activeTab === 'Refunds') return t.status === 'refunded';
    return true;
  });

  const handleViewTransaction = async (txn) => {
    try {
      const res = await fetchTransactionById(txn.id);
      if (res.ok) {
        setSelectedTransaction(res.data);
        setIsTransactionDetailOpen(true);
      }
    } catch (e) {
      toast.error('Failed to load transaction details');
    }
  };

  const handleSaveGatewayConfig = async () => {
    try {
      await saveGatewayConfig(gatewayConfig);
      toast.success('Gateway configuration saved');
      setIsGatewayModalOpen(false);
      fetchGatewayStatus();
    } catch (e) {
      toast.error('Failed to save gateway configuration');
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <PageHero
        icon={RiMoneyPoundCircleLine}
        title="Financial Hub"
        subtitle="Real-time transaction monitoring"
      >
        <HeroGhostButton>
          <RiFileDownloadLine size={16} /> Export
        </HeroGhostButton>
        <HeroButton onClick={() => setIsGatewayModalOpen(true)}>
          <RiExchangeLine size={16} /> Configure
        </HeroButton>
      </PageHero>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {statsLoading ? (
          <div className="col-span-4 text-center py-10 text-gray-400">Loading stats...</div>
        ) : (
          stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} delay={idx * 0.05} />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payment Ledger */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/30">
            <div className="flex bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
              {['Transactions', 'Payouts', 'Refunds'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? 'bg-secondary text-white shadow-md'
                      : 'text-gray-400 hover:text-secondary hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
 
 <div className="flex items-center gap-2">
 <div className="relative">
 <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"size={14} />
 <input
 type="text"
 placeholder="Search ledger..."
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

          <div className="overflow-x-auto no-scrollbar flex-1">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black border-b border-gray-100 uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3 text-left">Reference</th>
                  <th className="px-4 py-3 text-left">Organisation</th>
                  <th className="px-4 py-3 text-center">Amount</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
 <tbody className="divide-y divide-gray-50/50">
 {transactionsLoading ? (
 <tr>
 <td colSpan={6} className="px-4 py-10 text-center text-gray-400">Loading transactions...</td>
 </tr>
 ) : currentData.length === 0 ? (
 <tr>
 <td colSpan={6} className="px-4 py-10 text-center text-gray-400">No transactions found</td>
 </tr>
 ) : (
 currentData.map((tr) => (
 <tr key={tr.id} className="hover:bg-gray-50 transition-all group cursor-pointer">
 <td className="px-4 py-2.5">
 <motion.span 
 className="font-bold text-secondary text-sm bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 group-hover:text-primary group-hover:bg-primary/10 transition-all cursor-pointer"
 whileHover={{ scale: 1.05 }}
 >
 {tr.reference}
 </motion.span>
 </td>
 <td className="px-4 py-2.5">
 <p className="font-bold text-secondary text-sm block leading-tight mb-1">{tr.organisation?.name || '—'}</p>
 <p className="text-sm text-gray-500 font-semibold">{formatDate(tr.createdAt)}</p>
 </td>
 <td className="px-4 py-2.5 text-center">
 <motion.span 
 className="font-semibold text-secondary text-base"
 whileHover={{ scale: 1.1 }}
 >
 £{tr.amount}
 </motion.span>
 </td>
 <td className="px-4 py-2.5">
 <motion.div 
 className="flex items-center gap-2 group-hover:scale-105 transition-all"
 whileHover={{ scale: 1.08 }}
 >
 <motion.div 
 className="w-8 h-8 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-secondary group-hover:border-primary group-hover:bg-primary/10"
 whileHover={{ rotate: 10 }}
 >
 <RiBankCardLine size={16} />
 </motion.div>
 <div>
 <p className="text-sm font-bold text-secondary">{tr.gateway || 'N/A'}</p>
 <p className="text-sm text-gray-600 font-semibold">{tr.payment_method || 'Card'}</p>
 </div>
 </motion.div>
 </td>
 <td className="px-4 py-2.5 text-center">
 <span 
 className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold border ${
 tr.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
 tr.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
 tr.status === 'refunded' ? 'bg-amber-50 text-amber-700 border-amber-100' :
 'bg-red-50 text-red-700 border-red-100'
 }`}
 >
 {tr.status}
 </span>
 </td>
 <td className="px-4 py-2.5 text-right">
 <button
 onClick={() => handleViewTransaction(tr)}
 className="p-1.5 text-gray-400 hover:text-secondary hover:bg-gray-100 rounded-lg transition-all"
 title="View Details"
 >
 <RiEyeLine size={16} />
 </button>
 <button
 onClick={() => toast.success('Downloading receipt for ' + tr.reference)}
 className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all"
 title="Download Receipt"
 >
 <RiDownload2Line size={16} />
 </button>
 </td>
 </tr>
 ))
 )}
 </tbody>

 </table>
 </div>
 
          <div className="px-4 py-2.5 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors">&larr; Prev</button>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page 1 of 12</p>
            <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors">Next &rarr;</button>
          </div>
 </div>

        {/* Gateway Integrity Status */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-secondary uppercase tracking-widest">🔌 Gateway Status</h3>
            <RiPulseLine className="text-primary animate-pulse" size={18} />
          </div>

          <div className="space-y-3 flex-1">
            {gatewayLoading ? (
              <div className="text-center py-10 text-gray-400">Loading gateway status...</div>
            ) : gatewayStatus ? (
              <div 
                className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 group transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <RiSecurePaymentLine size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-secondary tracking-tight">{gatewayStatus.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Card / ACH</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                    gatewayStatus.status === 'Connected' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    {gatewayStatus.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                  <span>Last Sync</span>
                  <span className="text-secondary">{gatewayStatus.lastSync ? formatDateTime(gatewayStatus.lastSync) : 'Never'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">No gateway configured</div>
            )}
          </div>
  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-3">
    <div className={`h-full ${gatewayStatus?.status === 'Connected' ? 'bg-green-500' : 'bg-red-500'} w-full`} />
  </div>


 <div className="mt-6 pt-5 border-t border-gray-200">

 <button 
  onClick={() => setIsGatewayModalOpen(true)}
  className="w-full py-2 bg-secondary text-white rounded-lg text-xs font-bold shadow-md hover:bg-secondary/90 transition-all"
 >
   Configure Gateway
 </button>
 </div>
 </div>
 </div>

 {/* Transaction Detail Modal */}
 <Modal
 isOpen={isTransactionDetailOpen}
 onClose={() => {
 setIsTransactionDetailOpen(false);
 setSelectedTransaction(null);
 }}
 title="Transaction Details"
 subtitle="Complete transaction information and receipt"
 maxWidth="max-w-2xl"
 footer={
 <div className="flex items-center justify-between w-full">
 <motion.button
 onClick={() => {
 if (selectedTransaction) {
 alert('Downloading receipt for ' + selectedTransaction.id);
 }
 }}
 className="flex items-center gap-2 px-6 py-2.5 text-base font-bold text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-all border border-primary/20 group"
 whileHover={{ scale: 1.08, y: -2 }}
 whileTap={{ scale: 0.96 }}
 >
 <RiFileDownloadLine size={18} className="group-hover:rotate-12 transition-transform"/> Download Receipt
 </motion.button>
 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
 <Button variant="secondary"onClick={() => {
 setIsTransactionDetailOpen(false);
 setSelectedTransaction(null);
 }} className="px-6 py-2.5 text-base font-bold rounded-lg hover:shadow-md transition-all">
 Close
 </Button>
 </motion.div>
 </div>
 }
 >
 {selectedTransaction && (
 <div className="space-y-6 py-4">
 {/* Status Overview */}
 <div className={`p-4 rounded-xl border flex items-center justify-between ${
 selectedTransaction.status === 'Completed' ? 'bg-green-50 border-green-100' :
 selectedTransaction.status === 'Processing' ? 'bg-blue-50 border-blue-100' :
 'bg-red-50 border-red-100'
 }`}>
 <div>
 <p className="text-sm font-bold text-gray-400">Transaction Status</p>
 <p className={`text-lg font-semibold ${
 selectedTransaction.status === 'Completed' ? 'text-green-700' :
 selectedTransaction.status === 'Processing' ? 'text-blue-700' :
 'text-red-700'
 }`}>{selectedTransaction.status}</p>
 </div>
 <div className="text-right">
 <p className="text-sm font-bold text-gray-400">Amount</p>
 <p className="text-2xl font-semibold text-secondary">{selectedTransaction.amount}</p>
 </div>
 </div>

 {/* Transaction Information Grid */}
 <div className="grid grid-cols-2 gap-4">
 <motion.div 
 className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
 whileHover={{ y: -3, scale: 1.02 }}
 >
 <p className="text-sm font-bold text-gray-500 mb-2">📍 Reference ID</p>
 <p className="text-base font-semibold text-secondary">{selectedTransaction.id}</p>
 </motion.div>
 <motion.div 
 className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
 whileHover={{ y: -3, scale: 1.02 }}
 >
 <p className="text-sm font-bold text-gray-500 mb-2">🔑 Transaction ID</p>
 <p className="text-xs font-bold text-secondary font-mono truncate">{selectedTransaction.transactionId}</p>
 </motion.div>
 <motion.div 
 className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
 whileHover={{ y: -3, scale: 1.02 }}
 >
 <p className="text-sm font-bold text-gray-500 mb-2">🏢 Organisation Name</p>
 <p className="text-base font-semibold text-secondary">{selectedTransaction.org}</p>
 </motion.div>
 <motion.div 
 className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
 whileHover={{ y: -3, scale: 1.02 }}
 >
 <p className="text-sm font-bold text-gray-500 mb-2">💳 Payment Method</p>
 <p className="text-base font-semibold text-secondary">{selectedTransaction.method}</p>
 </motion.div>
 <motion.div 
 className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
 whileHover={{ y: -3, scale: 1.02 }}
 >
 <p className="text-sm font-bold text-gray-500 mb-2">🎫 Card Type</p>
 <div className="flex items-center gap-2 mt-2">
 {selectedTransaction.provider === 'Visa' ? <RiVisaLine size={22} className="text-blue-600"/> : <RiMastercardLine size={22} className="text-red-600"/>}
 <div>
 <p className="text-base font-semibold text-secondary">{selectedTransaction.provider}</p>
 <p className="text-sm text-gray-400 font-bold">•••• {selectedTransaction.cardLast4}</p>
 </div>
 </div>
 </motion.div>
 <motion.div 
 className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
 whileHover={{ y: -3, scale: 1.02 }}
 >
 <p className="text-sm font-bold text-gray-500 mb-2">⚙️ Payment Gateway</p>
 <p className="text-base font-semibold text-secondary">{selectedTransaction.method}</p>
 </motion.div>
 </div>

 {/* Date & Time */}
 <div className="grid grid-cols-2 gap-4">
 <motion.div 
 className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all"
 whileHover={{ y: -3, scale: 1.02 }}
 >
 <p className="text-sm font-bold text-blue-600 mb-2">📅 Date</p>
 <p className="text-base font-semibold text-secondary">{selectedTransaction.date}</p>
 </motion.div>
 <motion.div 
 className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all"
 whileHover={{ y: -3, scale: 1.02 }}
 >
 <p className="text-sm font-bold text-purple-600 mb-2">⏰ Time</p>
 <p className="text-base font-semibold text-secondary">{selectedTransaction.time}</p>
 </motion.div>
 </div>

 {/* Sender & Receiver Info */}
 <div className="grid grid-cols-2 gap-4">
 <motion.div 
 className="bg-gradient-to-br from-blue-100 to-blue-50 p-5 rounded-xl border border-blue-200 hover:shadow-md transition-all"
 whileHover={{ y: -3, scale: 1.02 }}
 >
 <div className="flex items-center gap-3 mb-3">
 <motion.div 
 className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white"
 whileHover={{ rotate: 10 }}
 >
 <RiArrowDownLine size={18} />
 </motion.div>
 <p className="text-sm font-bold text-blue-700">Sender</p>
 </div>
 <p className="text-base font-semibold text-secondary">{selectedTransaction.sender}</p>
 </motion.div>
 <motion.div 
 className="bg-gradient-to-br from-green-100 to-green-50 p-5 rounded-xl border border-green-200 hover:shadow-md transition-all"
 whileHover={{ y: -3, scale: 1.02 }}
 >
 <div className="flex items-center gap-3 mb-3">
 <motion.div 
 className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white"
 whileHover={{ rotate: -10 }}
 >
 <RiArrowUpLine size={18} />
 </motion.div>
 <p className="text-sm font-bold text-green-700">Receiver</p>
 </div>
 <p className="text-base font-semibold text-secondary">{selectedTransaction.receiver}</p>
 </motion.div>
 </div>

 {/* Notes and Remarks */}
 <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
 <p className="text-sm font-bold text-amber-600 mb-2">Notes & Remarks</p>
 <p className="text-sm text-amber-900 font-semibold leading-relaxed">{selectedTransaction.notes}</p>
 </div>
 </div>
 )}
 </Modal>

 {/* Stripe Modal */}
 <Modal
 isOpen={isGatewayModalOpen}
 onClose={() => setIsGatewayModalOpen(false)}
 title="Stripe Configuration"
 subtitle="Secure API authentication for production payments."
 maxWidth="max-w-md"
 footer={
 <div className="flex justify-end gap-2 w-full">
 <Button variant="secondary"onClick={() => setIsGatewayModalOpen(false)} className="px-5 py-2 text-sm font-bold">Close</Button>
 <Button onClick={handleSaveGatewayConfig} className="px-6 py-2 text-sm font-bold shadow-sm">Save Changes</Button>
 </div>
 }
 >
 <div className="space-y-6 py-2">
 <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
 <div className="flex items-center justify-between mb-5">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-primary">
 <RiSecurePaymentLine size={24} />
 </div>
 <div>
 <h4 className="text-sm font-semibold text-secondary">Stripe API</h4>
 <p className="text-sm text-green-600 font-bold">Production Environment</p>
 </div>
 </div>
 </div>
 <div className="space-y-4">
 <Input 
 label="Publishable Key"
 value={gatewayConfig.publishable_key}
 onChange={(e) => setGatewayConfig({...gatewayConfig, publishable_key: e.target.value})}
 className="font-mono text-sm"
 />
 <Input 
 label="Secret Key"
 type="password"
 value={gatewayConfig.secret_key}
 onChange={(e) => setGatewayConfig({...gatewayConfig, secret_key: e.target.value})}
 className="font-mono text-sm"
 />
 <Input 
 label="Webhook Secret"
 type="password"
 value={gatewayConfig.webhook_secret}
 onChange={(e) => setGatewayConfig({...gatewayConfig, webhook_secret: e.target.value})}
 className="font-mono text-sm"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-sm font-bold text-gray-400 ml-1">Default Currency</label>
 <select className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none appearance-none">
 <option>GBP (£)</option>
 <option>USD ($)</option>
 </select>
 </div>
 <Input label="Platform Fee (%)"type="number"defaultValue="2.5"/>
 </div>

 <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
 <RiInformationLine size={20} className="text-amber-600 shrink-0"/>
 <p className="text-sm text-amber-700 font-bold leading-relaxed">
 These keys are used for platform-level billing. Changing them will affect all active subscriptions. Use caution when updating production credentials.
 </p>
 </div>
 </div>
 </Modal>
 </div>
 );
};

export default SuperadminPayments;
