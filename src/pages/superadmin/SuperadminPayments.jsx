import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'react-icons/ri';
import Button from '../../components/Button';

const SuperadminPayments = () => {
  const [activeTab, setActiveTab] = useState('Transactions');

  const stats = [
    { title: 'Gross Revenue', value: '£142,500', trend: '+12.5%', icon: RiMoneyPoundCircleLine, color: 'primary' },
    { title: 'Pending Payouts', value: '£12,400', trend: '-2.4%', icon: RiHandCoinLine, color: 'secondary' },
    { title: 'Active Subscriptions', value: '1,240', trend: '+5.1%', icon: RiBankCardLine, color: 'green' },
  ];

  const transactions = [
    { id: '#TR-8921', org: 'Elite Visa Solutions', date: '2026-05-08', amount: '£799', status: 'Completed', method: 'Stripe' },
    { id: '#TR-8920', org: 'Global Migrate Pro', date: '2026-05-07', amount: '£349', status: 'Completed', method: 'PayPal' },
    { id: '#TR-8919', org: 'London Legal Partners', date: '2026-05-07', amount: '£149', status: 'Failed', method: 'Stripe' },
    { id: '#TR-8918', org: 'Westminster Agency', date: '2026-05-06', amount: '£349', status: 'Completed', method: 'Bank Transfer' },
    { id: '#TR-8917', org: 'Bridge UK Immigration', date: '2026-05-06', amount: '£799', status: 'Processing', method: 'Stripe' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Payments & Revenue</h1>
          <p className="text-sm text-slate-500 mt-0.5">Monitor platform income, payouts, and transaction history.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="flex items-center gap-2">
            <RiDownload2Line size={16} /> Export CSV
          </Button>
          <Button className="flex items-center gap-2">
             Configure Gateway
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
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
              <div className={`p-2 rounded-lg bg-${stat.color}/10 text-${stat.color} border border-${stat.color}/20`}>
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

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-gray-50 p-1 rounded-lg w-fit border border-gray-100">
            {['Transactions', 'Payouts', 'Refunds'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white text-primary shadow-sm border border-gray-100'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search payments..."
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>
            <button className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 rounded-lg transition-all shadow-sm">
              <RiFilter3Line size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4 text-left">Transaction ID</th>
                <th className="px-6 py-4 text-left">Organisation</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Amount</th>
                <th className="px-6 py-4 text-left">Method</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tr) => (
                <tr key={tr.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-600 uppercase tracking-tight">{tr.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{tr.org}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{tr.date}</td>
                  <td className="px-6 py-4 font-black text-slate-900">{tr.amount}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200">
                      {tr.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                      tr.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-100' :
                      tr.status === 'Processing' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {tr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing 5 of 142 transactions</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-300 transition-all">Previous</button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminPayments;
