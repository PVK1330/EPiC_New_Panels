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
} from 'react-icons/ri';
import Button from '../../components/Button';

const SuperadminBilling = () => {
  const stats = [
    { title: 'Monthly Revenue', value: '£24,500', trend: '+12.5%', icon: RiExchangeLine, color: 'primary' },
    { title: 'Active Plans', value: '1,240', trend: '+5.1%', icon: RiBillLine, color: 'secondary' },
    { title: 'Pending Renewals', value: '18', trend: '-2.4%', icon: RiArrowRightUpLine, color: 'amber' },
  ];

  const plans = [
    { id: 'starter', title: 'Starter', price: '149', users: '5 Users', cases: '500 Cases', storage: '20GB', color: 'blue' },
    { id: 'pro', title: 'Professional', price: '349', users: '20 Users', cases: '2000 Cases', storage: '100GB', color: 'purple' },
    { id: 'enterprise', title: 'Enterprise', price: '799', users: 'Unlimited', cases: 'Unlimited', storage: 'Custom', color: 'primary' },
  ];

  const orgBilling = [
    { org: 'Elite Visa Solutions', plan: 'Enterprise', amount: '£799', date: '2026-06-12', status: 'Paid' },
    { org: 'Global Migrate Pro', plan: 'Pro', amount: '£349', date: '2026-06-05', status: 'Pending' },
    { org: 'London Legal Partners', plan: 'Starter', amount: '£0', date: '2026-05-28', status: 'Trial' },
    { org: 'Bridge UK Immigration', plan: 'Enterprise', amount: '£799', date: '2026-05-12', status: 'Overdue' },
    { org: 'Westminster Agency', plan: 'Pro', amount: '£349', date: '2026-05-08', status: 'Paid' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Billing & Subscriptions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Define platform tiers, monitor revenue, and manage invoicing.</p>
        </div>
        <Button className="flex items-center gap-2">
          <RiDownload2Line size={18} /> Financial Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-${stat.color === 'primary' ? 'primary/10' : stat.color === 'secondary' ? 'secondary/10' : 'amber-50'} text-${stat.color === 'primary' ? 'primary' : stat.color === 'secondary' ? 'secondary' : 'amber-600'} border border-${stat.color === 'primary' ? 'primary/20' : stat.color === 'secondary' ? 'secondary/20' : 'amber-100'}`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                stat.trend.startsWith('+') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Tier Configuration Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{plan.title} Plan</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-black text-slate-900">£{plan.price}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">/month</span>
            </div>
            <div className="space-y-3 mb-6">
              {[plan.users, plan.cases, `${plan.storage} Storage`].map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${plan.color === 'primary' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                    <RiCheckDoubleLine size={10} />
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{feat}</span>
                </div>
              ))}
            </div>
            <button className="w-full py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all text-slate-600">
              Modify Tier
            </button>
          </div>
        ))}
      </div>

      {/* Organisation Status Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <RiBillLine size={18} />
            </div>
            <h3 className="font-bold text-slate-900 tracking-tight">Active Subscriptions</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4 text-left">Organisation</th>
                <th className="px-6 py-4 text-left">Plan</th>
                <th className="px-6 py-4 text-left">Monthly</th>
                <th className="px-6 py-4 text-left">Renewal</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orgBilling.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{item.org}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight ${
                      item.plan === 'Enterprise' ? 'bg-primary/10 text-primary border border-primary/20' :
                      item.plan === 'Pro' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {item.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 uppercase tracking-tighter text-xs">{item.amount}</td>
                  <td className="px-6 py-4 text-gray-400 font-bold text-[10px] uppercase tracking-wide">{item.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                      item.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-100' :
                      item.status === 'Pending' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      item.status === 'Trial' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                      <RiMore2Line size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <RiInformationLine className="text-blue-500 shrink-0" size={18} />
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">
              Invoices are automatically dispatched on the 1st of every month via Stripe integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminBilling;
