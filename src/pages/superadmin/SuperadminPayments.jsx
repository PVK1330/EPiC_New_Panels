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
    className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-primary/20 group"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2.5 rounded-lg bg-${color === 'amber' ? 'amber-50 text-amber-600 border-amber-100' : 'primary/5 text-primary border-primary/10'} border`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${
          trend.startsWith('+') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
    <h3 className="text-2xl font-black text-secondary mt-1 tracking-tight">{value}</h3>
  </motion.div>
);

const SuperadminPayments = () => {
  const [activeTab, setActiveTab] = useState('Transactions');
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    { title: 'Gross Volume', value: '£142,500', trend: '+12.5%', icon: RiMoneyPoundCircleLine, color: 'primary' },
    { title: 'Net Revenue', value: '£128,400', trend: '+10.2%', icon: RiPulseLine, color: 'primary' },
    { title: 'Success Rate', value: '99.4%', trend: '+0.2%', icon: RiShieldCheckLine, color: 'green' },
    { title: 'Refund Rate', value: '0.8%', trend: '-0.1%', icon: RiExchangeLine, color: 'amber' },
  ];

  const transactions = [
    { id: '#TR-8921', org: 'Elite Visa Solutions', date: '2026-05-08', amount: '£799', status: 'Completed', method: 'Stripe', provider: 'Visa' },
    { id: '#TR-8920', org: 'Global Migrate Pro', date: '2026-05-07', amount: '£349', status: 'Completed', method: 'Stripe', provider: 'Mastercard' },
    { id: '#TR-8919', org: 'London Legal Partners', date: '2026-05-07', amount: '£149', status: 'Failed', method: 'Stripe', provider: 'Visa' },
    { id: '#TR-8918', org: 'Westminster Agency', date: '2026-05-06', amount: '£349', status: 'Completed', method: 'Stripe', provider: 'Visa' },
    { id: '#TR-8917', org: 'Bridge UK Immigration', date: '2026-05-06', amount: '£799', status: 'Processing', method: 'Stripe', provider: 'Mastercard' },
  ];

  const gateways = [
    { name: 'Stripe Connect', status: 'Connected', lastSync: '2 mins ago', icon: RiSecurePaymentLine, type: 'Card / ACH' },
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* Financial Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-secondary uppercase tracking-tight">Financial Hub</h1>
              <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-[9px] font-black uppercase tracking-widest rounded border border-green-500/20 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Stripe Operational
              </span>
           </div>
           <p className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">Real-time Stripe revenue monitoring and transaction integrity.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" className="flex items-center gap-2 px-5 py-2 text-[10px] font-bold uppercase tracking-widest bg-white border-gray-100 shadow-sm">
              <RiFileDownloadLine size={16} /> Export Financials
           </Button>
           <Button 
             onClick={() => setIsGatewayModalOpen(true)}
             className="flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all hover:scale-[1.02]"
           >
              <RiExchangeLine size={16} /> Configure Stripe
           </Button>
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
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? 'bg-secondary text-white shadow-sm'
                      : 'text-gray-400 hover:text-secondary'
                  }`}
                >
                  {tab}
                </button>
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
                  className="pl-9 pr-4 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-secondary w-full md:w-48 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-300 uppercase"
                />
              </div>
              <button className="p-1.5 bg-white border border-gray-100 text-gray-400 hover:text-secondary rounded-lg transition-all shadow-sm">
                <RiFilter3Line size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar flex-1">
            <table className="w-full text-sm">
              <thead className="bg-white text-[9px] uppercase text-gray-400 tracking-widest font-black border-b border-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left">Reference</th>
                  <th className="px-5 py-4 text-left">Organization</th>
                  <th className="px-5 py-4 text-left text-center">Amount</th>
                  <th className="px-5 py-4 text-left">Method</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {transactions.map((tr) => (
                  <tr key={tr.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-5 py-4">
                       <span className="font-black text-secondary uppercase tracking-widest text-[9px] bg-gray-50 px-2 py-0.5 rounded border border-gray-100 group-hover:text-primary transition-all">
                          {tr.id}
                       </span>
                    </td>
                    <td className="px-5 py-4">
                       <p className="font-bold text-secondary text-xs block leading-none mb-1">{tr.org}</p>
                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{tr.date}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                       <span className="font-black text-secondary text-sm tracking-tight">{tr.amount}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-gray-50 rounded border border-gray-100 flex items-center justify-center text-secondary">
                            {tr.provider === 'Visa' ? <RiVisaLine size={14} /> : <RiMastercardLine size={14} />}
                         </div>
                         <div>
                            <p className="text-[9px] font-bold text-secondary uppercase tracking-tight">{tr.method}</p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase">{tr.provider}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        tr.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' :
                        tr.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {tr.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-secondary hover:bg-gray-100 rounded-lg transition-all" title="View Details">
                        <RiEyeLine size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Page 1 of 12</p>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1 rounded-lg text-[9px] font-bold uppercase bg-white border border-gray-200 text-gray-300">Previous</button>
              <button className="px-3 py-1 rounded-lg text-[9px] font-bold uppercase bg-white border border-gray-200 text-secondary hover:bg-gray-50 transition-all shadow-sm">Next</button>
            </div>
          </div>
        </div>

        {/* Gateway Integrity Status */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Gateway Status</h3>
              <RiPulseLine className="text-primary" size={16} />
           </div>

           <div className="space-y-4 flex-1">
              {gateways.map((gw) => (
                 <div key={gw.name} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 group hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-primary">
                             <gw.icon size={18} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{gw.name}</p>
                             <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tight">{gw.type}</p>
                          </div>
                       </div>
                       <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          gw.status === 'Connected' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                       }`}>{gw.status}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                       <span className="text-[9px] font-bold text-gray-400 uppercase">Last Sync</span>
                       <span className="text-[9px] font-black text-secondary uppercase">{gw.lastSync}</span>
                    </div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mt-2">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: "100%" }}
                         className="h-full bg-green-500" 
                       />
                    </div>
                 </div>
              ))}
           </div>

           <div className="mt-6 pt-5 border-t border-gray-50">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                 <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-1">Active Region</p>
                 <p className="text-[10px] font-black text-secondary uppercase">United Kingdom (GBP)</p>
              </div>
              <button 
                onClick={() => setIsGatewayModalOpen(true)}
                className="w-full py-2 bg-secondary text-white rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-lg hover:bg-secondary/90 transition-all"
              >
                 Manage Stripe Keys
              </button>
           </div>
        </div>
      </div>

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
