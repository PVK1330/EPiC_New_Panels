import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiMoneyPoundCircleLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiDownload2Line,
  RiFilter3Line,
  RiSearchLine,
  RiTimeLine,
  RiBankCardLine,
  RiHandCoinLine,
  RiExchangeLine,
  RiFileDownloadLine,
  RiArrowRightSLine,
  RiShieldCheckLine,
  RiInformationLine,
  RiArrowDownSLine,
  RiEyeLine,
  RiMore2Line,
  RiPulseLine,
  RiSecurePaymentLine,
  RiCloseLine,
  RiMastercardLine,
  RiVisaLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/Input';

const StatCard = ({ title, value, icon: Icon, trend, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 group"
  >
    <div className="flex items-center justify-between mb-4">
      <motion.div 
        className={`p-3 rounded-lg bg-${color === 'amber' ? 'amber-50 text-amber-600 border-amber-100' : 'primary/5 text-primary border-primary/10'} border transition-all group-hover:scale-110`}
        whileHover={{ rotate: 5 }}
      >
        <Icon size={24} />
      </motion.div>
      {trend && (
        <motion.span 
          className={`text-[11px] font-bold px-3 py-1 rounded-full border uppercase tracking-tight ${
            trend.startsWith('+') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}
          whileHover={{ scale: 1.1 }}
        >
          {trend}
        </motion.span>
      )}
    </div>
    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
    <h3 className="text-3xl font-black text-secondary mt-2 tracking-tight group-hover:text-primary transition-colors">{value}</h3>
  </motion.div>
);

const SuperadminPayments = () => {
  const [activeTab, setActiveTab] = useState('Transactions');
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    { title: 'Gross Volume', value: '£142,500', trend: '+12.5%', icon: RiMoneyPoundCircleLine, color: 'primary' },
    { title: 'Net Revenue', value: '£128,400', trend: '+10.2%', icon: RiPulseLine, color: 'primary' },
    { title: 'Success Rate', value: '99.4%', trend: '+0.2%', icon: RiShieldCheckLine, color: 'green' },
    { title: 'Refund Rate', value: '0.8%', trend: '-0.1%', icon: RiExchangeLine, color: 'amber' },
  ];

  const transactions = [
    {
      id: '#TR-8921',
      transactionId: 'ch_1ABC123DEF456GHI789JKL',
      org: 'Elite Visa Solutions',
      date: '2026-05-08',
      time: '14:32:15',
      amount: '£799',
      status: 'Completed',
      method: 'Stripe',
      provider: 'Visa',
      cardLast4: '4242',
      sender: 'Elite Visa Solutions Ltd',
      receiver: 'Elite Pic CMS Account',
      notes: 'Visa application processing fee - Payment ID: APP-2024-00521'
    },
    {
      id: '#TR-8920',
      transactionId: 'ch_1XYZ789ABC123DEF456GHI',
      org: 'Global Migrate Pro',
      date: '2026-05-07',
      time: '10:15:43',
      amount: '£349',
      status: 'Completed',
      method: 'Stripe',
      provider: 'Mastercard',
      cardLast4: '5555',
      sender: 'Global Migrate Pro Inc',
      receiver: 'Elite Pic CMS Account',
      notes: 'Immigration consultation fee - Ref: CONS-2024-00892'
    },
    {
      id: '#TR-8919',
      transactionId: 'ch_1DEF456GHI789ABC123XYZ',
      org: 'London Legal Partners',
      date: '2026-05-07',
      time: '09:45:22',
      amount: '£149',
      status: 'Failed',
      method: 'Stripe',
      provider: 'Visa',
      cardLast4: '4111',
      sender: 'London Legal Partners LLP',
      receiver: 'Elite Pic CMS Account',
      notes: 'Transaction declined - Insufficient funds'
    },
    {
      id: '#TR-8918',
      transactionId: 'ch_1GHI789ABC123DEF456XYZ',
      org: 'Westminster Agency',
      date: '2026-05-06',
      time: '16:22:08',
      amount: '£349',
      status: 'Completed',
      method: 'Stripe',
      provider: 'Visa',
      cardLast4: '4242',
      sender: 'Westminster Agency Ltd',
      receiver: 'Elite Pic CMS Account',
      notes: 'Visa sponsorship documentation fee - Doc ID: DOC-2024-05612'
    },
    {
      id: '#TR-8917',
      transactionId: 'ch_1JKL012MNO345PQR678STU',
      org: 'Bridge UK Immigration',
      date: '2026-05-06',
      time: '11:05:51',
      amount: '£799',
      status: 'Processing',
      method: 'Stripe',
      provider: 'Mastercard',
      cardLast4: '5555',
      sender: 'Bridge UK Immigration Services',
      receiver: 'Elite Pic CMS Account',
      notes: 'Premium visa application package - Order ID: ORD-2024-09876'
    },
  ];

  const payouts = [
    {
      id: '#PO-7821',
      payoutId: 'po_1ABC123DEF456GHI789JKL',
      org: 'Elite Visa Solutions',
      date: '2026-05-08',
      time: '14:32:15',
      amount: '£12,450',
      status: 'Completed',
      method: 'Bank Transfer',
      bankName: 'HSBC UK',
      accountLast4: '8842',
      sender: 'Elite Pic CMS Account',
      receiver: 'Elite Visa Solutions Ltd',
      notes: 'Monthly revenue payout - Period: May 2026'
    },
    {
      id: '#PO-7820',
      payoutId: 'po_1XYZ789ABC123DEF456GHI',
      org: 'Global Migrate Pro',
      date: '2026-05-07',
      time: '10:15:43',
      amount: '£8,320',
      status: 'Completed',
      method: 'Bank Transfer',
      bankName: 'Barclays UK',
      accountLast4: '5521',
      sender: 'Elite Pic CMS Account',
      receiver: 'Global Migrate Pro Inc',
      notes: 'Monthly revenue payout - Period: May 2026'
    },
    {
      id: '#PO-7819',
      payoutId: 'po_1DEF456GHI789ABC123XYZ',
      org: 'London Legal Partners',
      date: '2026-05-07',
      time: '09:45:22',
      amount: '£5,670',
      status: 'Pending',
      method: 'Bank Transfer',
      bankName: 'Lloyds Bank',
      accountLast4: '3345',
      sender: 'Elite Pic CMS Account',
      receiver: 'London Legal Partners LLP',
      notes: 'Monthly revenue payout - Period: May 2026 - Awaiting bank confirmation'
    },
    {
      id: '#PO-7818',
      payoutId: 'po_1GHI789ABC123DEF456XYZ',
      org: 'Westminster Agency',
      date: '2026-05-06',
      time: '16:22:08',
      amount: '£9,890',
      status: 'Completed',
      method: 'Bank Transfer',
      bankName: 'NatWest',
      accountLast4: '7763',
      sender: 'Elite Pic CMS Account',
      receiver: 'Westminster Agency Ltd',
      notes: 'Monthly revenue payout - Period: April 2026'
    },
    {
      id: '#PO-7817',
      payoutId: 'po_1JKL012MNO345PQR678STU',
      org: 'Bridge UK Immigration',
      date: '2026-05-06',
      time: '11:05:51',
      amount: '£15,230',
      status: 'Processing',
      method: 'Bank Transfer',
      bankName: 'HSBC UK',
      accountLast4: '8842',
      sender: 'Elite Pic CMS Account',
      receiver: 'Bridge UK Immigration Services',
      notes: 'Monthly revenue payout - Period: May 2026 - Processing'
    },
  ];

  const refunds = [
    {
      id: '#RF-6521',
      refundId: 're_1ABC123DEF456GHI789JKL',
      org: 'Elite Visa Solutions',
      date: '2026-05-08',
      time: '14:32:15',
      amount: '£799',
      status: 'Completed',
      method: 'Stripe',
      provider: 'Visa',
      cardLast4: '4242',
      sender: 'Elite Pic CMS Account',
      receiver: 'Elite Visa Solutions Ltd',
      reason: 'Service cancellation - Refund requested by customer',
      originalTransactionId: '#TR-8921'
    },
    {
      id: '#RF-6520',
      refundId: 're_1XYZ789ABC123DEF456GHI',
      org: 'Global Migrate Pro',
      date: '2026-05-07',
      time: '10:15:43',
      amount: '£349',
      status: 'Completed',
      method: 'Stripe',
      provider: 'Mastercard',
      cardLast4: '5555',
      sender: 'Elite Pic CMS Account',
      receiver: 'Global Migrate Pro Inc',
      reason: 'Duplicate payment - Refund processed automatically',
      originalTransactionId: '#TR-8920'
    },
    {
      id: '#RF-6519',
      refundId: 're_1DEF456GHI789ABC123XYZ',
      org: 'London Legal Partners',
      date: '2026-05-07',
      time: '09:45:22',
      amount: '£149',
      status: 'Pending',
      method: 'Stripe',
      provider: 'Visa',
      cardLast4: '4111',
      sender: 'Elite Pic CMS Account',
      receiver: 'London Legal Partners LLP',
      reason: 'Service not delivered - Awaiting approval',
      originalTransactionId: '#TR-8919'
    },
    {
      id: '#RF-6518',
      refundId: 're_1GHI789ABC123DEF456XYZ',
      org: 'Westminster Agency',
      date: '2026-05-06',
      time: '16:22:08',
      amount: '£349',
      status: 'Failed',
      method: 'Stripe',
      provider: 'Visa',
      cardLast4: '4242',
      sender: 'Elite Pic CMS Account',
      receiver: 'Westminster Agency Ltd',
      reason: 'Card expired - Refund failed',
      originalTransactionId: '#TR-8918'
    },
    {
      id: '#RF-6517',
      refundId: 're_1JKL012MNO345PQR678STU',
      org: 'Bridge UK Immigration',
      date: '2026-05-06',
      time: '11:05:51',
      amount: '£799',
      status: 'Processing',
      method: 'Stripe',
      provider: 'Mastercard',
      cardLast4: '5555',
      sender: 'Elite Pic CMS Account',
      receiver: 'Bridge UK Immigration Services',
      reason: 'Customer dispute - Under review',
      originalTransactionId: '#TR-8917'
    },
  ];

  const currentData =
  activeTab === 'Transactions'
    ? transactions
    : activeTab === 'Payouts'
    ? payouts
    : refunds;

  const gateways = [
    { name: 'Stripe Connect', status: 'Connected', lastSync: '2 mins ago', icon: RiSecurePaymentLine, type: 'Card / ACH' },
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* Financial Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <motion.h1 
                className="text-2xl font-black text-red-700 uppercase tracking-tight"
                whileHover={{ scale: 1.05 }}
              >
                💰 Financial Hub
              </motion.h1>
              <motion.span 
                className="px-3 py-1 bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/20 flex items-center gap-2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Stripe Live
              </motion.span>
           </div>
           <p className="text-[12px] text-gray-600 font-semibold uppercase tracking-tight">Real-time transaction monitoring & payment integrity</p>
        </div>
        <div className="flex items-center gap-3">
           <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
             <Button variant="secondary" className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all rounded-lg">
                <RiFileDownloadLine size={18} /> Export
             </Button>
           </motion.div>
           <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
             <Button 
               onClick={() => setIsGatewayModalOpen(true)}
               className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest shadow-md hover:shadow-lg transition-all rounded-lg"
             >
                <RiExchangeLine size={18} /> Configure
             </Button>
           </motion.div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} delay={idx * 0.1} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Payment Ledger */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/30">
            <div className="flex bg-white p-1 rounded-lg border border-gray-100">
              {['Transactions', 'Payouts', 'Refunds'].map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? 'bg-secondary text-white shadow-md'
                      : 'text-gray-500 hover:text-secondary hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab}
                </motion.button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search ledger..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-secondary w-full md:w-56 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-gray-400 uppercase hover:border-gray-300"
                />
              </div>
              <motion.button 
                className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-secondary hover:border-primary rounded-lg transition-all shadow-sm"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <RiFilter3Line size={18} />
              </motion.button>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar flex-1">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-50 text-[10px] uppercase text-gray-600 tracking-widest font-bold border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Reference</th>
                  <th className="px-6 py-4 text-left font-bold">Organisation</th>
                  <th className="px-6 py-4 text-center font-bold">Amount</th>
                  <th className="px-6 py-4 text-left font-bold">Method</th>
                  <th className="px-6 py-4 text-center font-bold">Status</th>
                  <th className="px-6 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {currentData.map((tr) => (
                  <tr key={tr.id} className="hover:bg-gray-50 transition-all group cursor-pointer">
                    <td className="px-6 py-4">
                       <motion.span 
                         className="font-bold text-secondary uppercase tracking-widest text-[10px] bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 group-hover:text-primary group-hover:bg-primary/10 transition-all cursor-pointer"
                         whileHover={{ scale: 1.05 }}
                       >
                          {tr.id}
                       </motion.span>
                    </td>
                    <td className="px-6 py-4">
                       <p className="font-bold text-secondary text-sm block leading-tight mb-1">{tr.org}</p>
                       <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-tight">{tr.date}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <motion.span 
                         className="font-black text-secondary text-base tracking-tight"
                         whileHover={{ scale: 1.1 }}
                       >
                         {tr.amount}
                       </motion.span>
                    </td>
                    <td className="px-6 py-4">
                      <motion.div 
                        className="flex items-center gap-2 group-hover:scale-105 transition-all"
                        whileHover={{ scale: 1.08 }}
                      >
                         <motion.div 
                           className="w-8 h-8 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-secondary group-hover:border-primary group-hover:bg-primary/10"
                           whileHover={{ rotate: 10 }}
                         >
                            {tr.provider === 'Visa' ? <RiVisaLine size={16} /> : tr.provider === 'Mastercard' ? <RiMastercardLine size={16} /> : <RiBankCardLine size={16} />}
                         </motion.div>
                         <div>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-tight">{tr.method || 'N/A'}</p>
                            <p className="text-[9px] text-gray-600 font-semibold uppercase">{tr.provider || 'Card'}</p>
                         </div>
                      </motion.div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <motion.span 
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${
                          tr.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' :
                          tr.status === 'Processing' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          tr.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {tr.status}
                      </motion.span>
                    </td>
                    <td className="px-5 py-4 text-right flex">
                      <button
                        onClick={() => {
                          setSelectedTransaction(tr);
                          setIsTransactionDetailOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-secondary hover:bg-gray-100 rounded-lg transition-all"
                        title="View Details"
                      >
                        <RiEyeLine size={16} />
                      </button>
                      <button
                        onClick={() => alert('Downloading receipt for ' + tr.id)}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all"
                        title="Download Receipt"
                      >
                        <RiDownload2Line size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
          
          <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Page 1 of 12</p>
            <div className="flex gap-2">
              <motion.button 
                disabled 
                className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase bg-white border border-gray-200 text-gray-300"
                whileHover={{ scale: 0.98 }}
              >
                Previous
              </motion.button>
              <motion.button 
                className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase bg-white border border-gray-200 text-secondary hover:bg-blue-50 hover:border-primary transition-all shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </motion.button>
            </div>
          </div>
        </div>

        {/* Gateway Integrity Status */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <motion.h3 
                className="text-lg font-black text-secondary uppercase tracking-tight"
                whileHover={{ scale: 1.05 }}
              >
                🔌 Gateway Status
              </motion.h3>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity }}>
                <RiPulseLine className="text-primary" size={20} />
              </motion.div>
           </div>

           <div className="space-y-4 flex-1">
              {gateways.map((gw) => (
                 <motion.div 
                   key={gw.name} 
                   className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 group hover:border-primary/40 hover:shadow-md transition-all"
                   whileHover={{ scale: 1.02, y: -2 }}
                 >
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <motion.div 
                            className="w-10 h-10 bg-primary/10 rounded-lg border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20"
                            whileHover={{ rotate: 10, scale: 1.1 }}
                          >
                             <gw.icon size={22} />
                          </motion.div>
                          <div>
                             <p className="text-[12px] font-bold text-secondary uppercase tracking-tight">{gw.name}</p>
                             <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-tight">{gw.type}</p>
                          </div>
                       </div>
                       <motion.span 
                         className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                            gw.status === 'Connected' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                         }`}
                         whileHover={{ scale: 1.1 }}
                       >
                         {gw.status}
                       </motion.span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                       <span className="text-[10px] font-bold text-gray-500 uppercase">Last Sync</span>
                       <motion.span 
                         className="text-[10px] font-black text-secondary uppercase"
                         whileHover={{ scale: 1.1 }}
                       >
                         {gw.lastSync}
                       </motion.span>
                    </div>
                    <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden mt-3">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: "100%" }}
                         transition={{ duration: 1.5 }}
                         className="h-full bg-gradient-to-r from-green-400 to-green-600" 
                       />
                    </div>
                 </motion.div>
              ))}
           </div>

           <div className="mt-6 pt-5 border-t border-gray-200">
              <motion.div 
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 mb-4 hover:shadow-md transition-all"
                whileHover={{ y: -2 }}
              >
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">🌍 Active Region</p>
                 <p className="text-[13px] font-black text-secondary uppercase">United Kingdom (GBP)</p>
              </motion.div>
              <motion.button 
                onClick={() => setIsGatewayModalOpen(true)}
                className="w-full py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest shadow-md hover:shadow-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                 ⚙️ Manage Stripe Keys
              </motion.button>
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
              className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-bold uppercase tracking-tight text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-all border border-primary/20 group"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              <RiFileDownloadLine size={18} className="group-hover:rotate-12 transition-transform" /> Download Receipt
            </motion.button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="secondary" onClick={() => {
                setIsTransactionDetailOpen(false);
                setSelectedTransaction(null);
              }} className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-tight rounded-lg hover:shadow-md transition-all">
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
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Transaction Status</p>
                <p className={`text-lg font-black uppercase tracking-tight ${
                  selectedTransaction.status === 'Completed' ? 'text-green-700' :
                  selectedTransaction.status === 'Processing' ? 'text-blue-700' :
                  'text-red-700'
                }`}>{selectedTransaction.status}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Amount</p>
                <p className="text-2xl font-black text-secondary">{selectedTransaction.amount}</p>
              </div>
            </div>

            {/* Transaction Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight mb-2">📍 Reference ID</p>
                <p className="text-base font-black text-secondary">{selectedTransaction.id}</p>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight mb-2">🔑 Transaction ID</p>
                <p className="text-xs font-bold text-secondary font-mono truncate">{selectedTransaction.transactionId}</p>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight mb-2">🏢 Organisation Name</p>
                <p className="text-base font-black text-secondary">{selectedTransaction.org}</p>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight mb-2">💳 Payment Method</p>
                <p className="text-base font-black text-secondary">{selectedTransaction.method}</p>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight mb-2">🎫 Card Type</p>
                <div className="flex items-center gap-2 mt-2">
                  {selectedTransaction.provider === 'Visa' ? <RiVisaLine size={22} className="text-blue-600" /> : <RiMastercardLine size={22} className="text-red-600" />}
                  <div>
                    <p className="text-base font-black text-secondary">{selectedTransaction.provider}</p>
                    <p className="text-[9px] text-gray-400 font-bold">•••• {selectedTransaction.cardLast4}</p>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight mb-2">⚙️ Payment Gateway</p>
                <p className="text-base font-black text-secondary">{selectedTransaction.method}</p>
              </motion.div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all"
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight mb-2">📅 Date</p>
                <p className="text-base font-black text-secondary">{selectedTransaction.date}</p>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all"
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-tight mb-2">⏰ Time</p>
                <p className="text-base font-black text-secondary">{selectedTransaction.time}</p>
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
                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">Sender</p>
                </div>
                <p className="text-base font-black text-secondary">{selectedTransaction.sender}</p>
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
                  <p className="text-[10px] font-bold text-green-700 uppercase tracking-tight">Receiver</p>
                </div>
                <p className="text-base font-black text-secondary">{selectedTransaction.receiver}</p>
              </motion.div>
            </div>

            {/* Notes and Remarks */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-2">Notes & Remarks</p>
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
            <Button variant="secondary" onClick={() => setIsGatewayModalOpen(false)} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest">Close</Button>
            <Button onClick={() => setIsGatewayModalOpen(false)} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">Save Changes</Button>
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
                       <h4 className="text-sm font-black text-secondary tracking-tight uppercase">Stripe API</h4>
                       <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest">Production Environment</p>
                    </div>
                 </div>
              </div>
              <div className="space-y-4">
                 <Input label="Publishable Key" defaultValue="pk_live_..." className="font-mono text-[10px]" />
                 <Input label="Secret Key" type="password" defaultValue="sk_live_..." className="font-mono text-[10px]" />
                 <Input label="Webhook Secret" type="password" defaultValue="whsec_..." className="font-mono text-[10px]" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Default Currency</label>
                <select className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none appearance-none">
                   <option>GBP (£)</option>
                   <option>USD ($)</option>
                </select>
              </div>
              <Input label="Platform Fee (%)" type="number" defaultValue="2.5" />
           </div>

           <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
              <RiInformationLine size={20} className="text-amber-600 shrink-0" />
              <p className="text-[9px] text-amber-700 font-bold uppercase tracking-tight leading-relaxed">
                 These keys are used for platform-level billing. Changing them will affect all active subscriptions. Use caution when updating production credentials.
              </p>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuperadminPayments;
