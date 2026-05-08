import React from 'react';
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
} from 'react-icons/ri';
import Button from '../../components/Button';

const SuperadminBilling = () => {
  const stats = [
    { title: 'Projected Revenue', value: '£84,250', trend: '+12.5%', icon: RiWallet3Line, color: 'primary' },
    { title: 'Subscription Base', value: '1,240', trend: '+5.1%', icon: RiPieChartLine, color: 'secondary' },
    { title: 'Pending Renewals', value: '42', trend: '-2.4%', icon: RiBillLine, color: 'amber' },
  ];

  const plans = [
    { id: 'starter', title: 'Starter', price: '149', users: '5 Users', cases: '500 Cases', storage: '20GB', color: 'blue', desc: 'Ideal for small agencies' },
    { id: 'pro', title: 'Professional', price: '349', users: '20 Users', cases: '2000 Cases', storage: '100GB', color: 'purple', desc: 'Standard for growing teams' },
    { id: 'enterprise', title: 'Enterprise', price: '799', users: 'Unlimited', cases: 'Unlimited', storage: 'Custom', color: 'primary', desc: 'Full-scale enterprise power' },
  ];

  const orgBilling = [
    { org: 'Elite Visa Solutions', plan: 'Enterprise', amount: '£799', date: '2026-06-12', status: 'Paid' },
    { org: 'Global Migrate Pro', plan: 'Pro', amount: '£349', date: '2026-06-05', status: 'Pending' },
    { org: 'London Legal Partners', plan: 'Starter', amount: '£0', date: '2026-05-28', status: 'Trial' },
    { org: 'Bridge UK Immigration', plan: 'Enterprise', amount: '£799', date: '2026-05-12', status: 'Overdue' },
    { org: 'Westminster Agency', plan: 'Pro', amount: '£349', date: '2026-05-08', status: 'Paid' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-secondary uppercase tracking-widest">Subscription Engine</h1>
          <p className="text-[10px] text-gray-400 mt-1 font-black uppercase tracking-wider">Monitor platform monetization and manage global billing tiers.</p>
        </div>
        <Button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 py-2.5 shadow-lg shadow-primary/20">
          <RiDownload2Line size={16} /> Financial Analytics
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
               <stat.icon size={80} className="rotate-12" />
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`p-2.5 rounded-xl bg-${stat.color === 'primary' ? 'primary/10' : stat.color === 'secondary' ? 'secondary/10' : 'amber-50'} text-${stat.color === 'primary' ? 'primary' : stat.color === 'secondary' ? 'secondary' : 'amber-600'} border border-${stat.color === 'primary' ? 'primary/20' : stat.color === 'secondary' ? 'secondary/20' : 'amber-100'}`}>
                <stat.icon size={22} />
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
                stat.trend.startsWith('+') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] relative z-10">{stat.title}</p>
            <h3 className="text-3xl font-black text-secondary mt-1.5 tracking-tight relative z-10">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Subscription Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative group hover:shadow-xl transition-all flex flex-col">
            <div className="mb-6">
               <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-1">{plan.title}</h3>
               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{plan.desc}</p>
            </div>
            <div className="flex items-baseline gap-1.5 mb-8">
              <span className="text-4xl font-black text-secondary tracking-tighter">£{plan.price}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">/ Month</span>
            </div>
            <div className="space-y-4 mb-10 flex-1">
              {[plan.users, plan.cases, `${plan.storage} Storage`, 'Direct API Access'].map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${plan.color === 'primary' ? 'bg-primary/10 border-primary/20 text-primary shadow-sm shadow-primary/20' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                    <RiCheckDoubleLine size={12} />
                  </div>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-tight">{feat}</span>
                </div>
              ))}
            </div>
            <button className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-gray-100 hover:bg-secondary hover:text-white hover:border-secondary transition-all text-secondary">
              Update Tier Logic
            </button>
          </div>
        ))}
      </div>

      {/* Subscription Registry */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 text-primary shadow-sm">
              <RiBillLine size={20} />
            </div>
            <div>
               <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Revenue Registry</h3>
               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1">Live subscription and invoice monitoring</p>
            </div>
          </div>
          <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View Full Ledger</button>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 text-[10px] uppercase text-gray-400 tracking-[0.15em] font-black">
              <tr>
                <th className="px-8 py-5 text-left">Organization</th>
                <th className="px-8 py-5 text-left">Tier</th>
                <th className="px-8 py-5 text-center">Amount</th>
                <th className="px-8 py-5 text-center">Renewal</th>
                <th className="px-8 py-5 text-left">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orgBilling.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5 font-black text-secondary text-xs uppercase tracking-tight">{item.org}</td>
                  <td className="px-8 py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      item.plan === 'Enterprise' ? 'bg-primary/10 text-primary border-primary/20' :
                      item.plan === 'Pro' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                      {item.plan}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center font-black text-secondary text-xs">{item.amount}</td>
                  <td className="px-8 py-5 text-center text-gray-400 font-bold text-[10px] uppercase tracking-widest">{item.date}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      item.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-100' :
                      item.status === 'Pending' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      item.status === 'Trial' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      <span className={`w-1 h-1 rounded-full mr-2 ${
                         item.status === 'Paid' ? 'bg-green-500' :
                         item.status === 'Pending' ? 'bg-blue-500' :
                         item.status === 'Trial' ? 'bg-purple-500' : 'bg-red-500'
                      }`} />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-gray-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all group-hover:text-secondary">
                      <RiMore2Line size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-gray-50 bg-gray-50/20">
          <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
            <RiInformationLine className="text-primary shrink-0" size={20} />
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.05em] leading-relaxed">
              Global synchronization active. Subscription status and revenue metrics are updated in real-time across the global node.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminBilling;
