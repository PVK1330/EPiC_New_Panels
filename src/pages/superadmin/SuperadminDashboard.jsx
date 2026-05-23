import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
 RiOrganizationChart,
 RiShieldUserLine,
 RiAddLine,
 RiGroupLine,
 RiBriefcaseLine,
 RiMoneyPoundCircleLine,
 RiTimeLine,
 RiArrowRightUpLine,
 RiPieChart2Line,
 RiSearchLine,
 RiArrowRightSLine,
 RiBarChartLine,
 RiExchangeLine,
 RiUserStarLine,
} from 'react-icons/ri';
import Button from '../../components/Button';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay, duration: 0.3 }}
 className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm group hover:border-primary/20 transition-all"
 >
 <div className="flex items-start justify-between mb-3">
 <div className={`p-2.5 rounded-lg bg-primary/5 text-primary border border-primary/10`}>
 <Icon size={20} />
 </div>
 </div>
 <p className="text-gray-400 text-sm font-bold mb-1">{title}</p>
 <h3 className="text-2xl font-semibold text-secondary">{value}</h3>
 </motion.div>
);

const SuperadminDashboard = () => {
 const [activeTab, setActiveTab] = useState('Revenue');

 const orgs = [
 { name: 'Elite Visa Solutions', plan: 'Enterprise', users: 45, revenue: '£12,400', status: 'Active' },
 { name: 'Global Migrate Pro', plan: 'Pro', users: 12, revenue: '£4,500', status: 'Active' },
 { name: 'London Legal Partners', plan: 'Starter', users: 4, revenue: '£1,200', status: 'Trial' },
 { name: 'Bridge UK Immigration', plan: 'Enterprise', users: 38, revenue: '£9,800', status: 'Active' },
 { name: 'Westminster Agency', plan: 'Pro', users: 15, revenue: '£3,100', status: 'Active' },
 ];

 const chartData = {
 Revenue: [45, 62, 58, 75, 90, 82, 95, 110, 105, 120, 140, 165],
 Cancellations: [2, 1, 3, 2, 1, 4, 2, 1, 2, 3, 1, 2]
 };

 const distribution = [
 { name: 'Enterprise', value: 45, color: 'bg-primary' },
 { name: 'Professional', value: 35, color: 'bg-secondary' },
 { name: 'Starter', value: 20, color: 'bg-amber-400' }
 ];

 return (
 <div className="space-y-6 pb-6">
 {/* Platform Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
 <div>
 <h1 className="text-xl font-semibold text-secondary">Platform Overview</h1>
 <p className="text-sm text-gray-400 mt-0.5 font-medium">Summary of platform growth and organisation performance.</p>
 </div>

 </div>

 {/* Core Business KPIs */}
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ staggerChildren: 0.1 }}
 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
 >
 <motion.div 
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.3 }}
 className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 group"
 >
 <div className="flex items-center justify-between">
 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
 <RiMoneyPoundCircleLine size={20} />
 </div>
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-400 mb-1">Monthly Revenue</p>
 <div className="flex items-center">
 <span className="text-2xl font-semibold text-secondary">£84,250</span>
 </div>
 </div>
 </motion.div>
 
 <motion.div 
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.3, delay: 0.1 }}
 className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 group"
 >
 <div className="flex items-center justify-between">
 <div className="p-2 bg-green-50 text-green-600 rounded-lg border border-green-100">
 <RiOrganizationChart size={20} />
 </div>
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-400 mb-1">Active Tenants</p>
 <div className="flex items-center">
 <span className="text-2xl font-semibold text-secondary">124</span>
 </div>
 </div>
 </motion.div>
 
 <motion.div 
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.3, delay: 0.2 }}
 className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 group"
 >
 <div className="flex items-center justify-between">
 <div className="p-2 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
 <RiGroupLine size={20} />
 </div>
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-400 mb-1">Platform Users</p>
 <div className="flex items-center">
 <span className="text-2xl font-semibold text-secondary">4.2k</span>
 </div>
 </div>
 </motion.div>
 
 <motion.div 
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.3, delay: 0.3 }}
 className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 group"
 >
 <div className="flex items-center justify-between">
 <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
 <RiBarChartLine size={20} />
 </div>
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-400 mb-1">Client Retention</p>
 <div className="flex items-center">
 <span className="text-2xl font-semibold text-secondary">104.2%</span>
 </div>
 </div>
 </motion.div>
 </motion.div>

 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
 {/* Growth Analytics */}
 <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h3 className="text-xs font-bold text-secondary">{activeTab} Performance</h3>
 <p className="text-sm text-gray-400 font-bold mt-0.5">Platform growth trajectory for the current fiscal year.</p>
 </div>
 <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
 <button 
 onClick={() => setActiveTab('Revenue')}
 className={`px-4 py-1.5 rounded text-sm font-bold transition-all ${activeTab === 'Revenue' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-secondary'}`}
 >
 Revenue
 </button>
 <button 
 onClick={() => setActiveTab('Cancellations')}
 className={`px-4 py-1.5 rounded text-sm font-bold transition-all ${activeTab === 'Cancellations' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-secondary'}`}
 >
 Cancellations
 </button>
 </div>
 </div>
 
 <div className="flex-1 min-h-[220px] flex gap-3 pt-6 relative pr-2">
 {/* Y-axis Labels */}
 <div className="absolute left-0 top-6 bottom-8 w-10 flex flex-col justify-between text-sm font-bold text-gray-400">
 <span>150k</span>
 <span>100k</span>
 <span>50k</span>
 <span>0</span>
 </div>
 <div className="flex-1 flex items-end justify-between ml-12 border-b border-gray-100 pb-2">
 {chartData[activeTab].map((h, i) => (
 <div key={i} className="flex-1 group relative flex flex-col justify-end h-full px-1">
 <motion.div 
 initial={{ height: 0 }}
 animate={{ height: `${activeTab === 'Revenue' ? (h / 165) * 100 : (h / 4) * 100}%` }}
 transition={{ delay: i * 0.05, duration: 0.8 }}
 className="w-full bg-primary/10 rounded-t group-hover:bg-primary transition-all cursor-pointer relative"
 >
 <div className="absolute top-0 inset-x-0 h-0.5 bg-primary group-hover:bg-white rounded-full opacity-50"/>
 <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-bold py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
 {activeTab === 'Revenue' ? `£${h}k` : `${h}%`}
 </div>
 </motion.div>
 </div>
 ))}
 </div>
 </div>
 <div className="flex justify-between mt-2 pl-12 pr-2">
 {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(m => (
 <span key={m} className="text-sm font-semibold text-gray-400 flex-1 text-center">{m}</span>
 ))}
 </div>
 </div>

 {/* Plan Distribution */}
 <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
 <div className="flex items-center justify-between mb-8">
 <h3 className="text-xs font-bold text-secondary">Plan Distribution</h3>
 <RiPieChart2Line className="text-primary"size={20} />
 </div>

 <div className="flex-1 flex flex-col items-center justify-center">
 <div className="relative w-44 h-44 flex items-center justify-center mb-10">
 <svg className="w-full h-full transform -rotate-90">
 <circle cx="88"cy="88"r="75"fill="transparent"stroke="#f3f4f6"strokeWidth="18"/>
 <circle cx="88"cy="88"r="75"fill="transparent"stroke="var(--primary)"strokeWidth="18"strokeDasharray="471"strokeDashoffset="260"strokeLinecap="round"/>
 <circle cx="88"cy="88"r="75"fill="transparent"stroke="var(--secondary)"strokeWidth="18"strokeDasharray="471"strokeDashoffset="400"strokeLinecap="round"transform="rotate(162 88 88)"/>
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="text-3xl font-semibold text-secondary">124</span>
 <span className="text-sm font-bold text-gray-400">Tenants</span>
 </div>
 </div>

 <div className="grid grid-cols-1 w-full gap-3">
 {distribution.map((item) => (
 <div key={item.name} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/30">
 <div className="flex items-center gap-3">
 <div className={`w-2 h-2 rounded-full ${item.color}`} />
 <span className="text-sm font-bold text-gray-500">{item.name}</span>
 </div>
 <span className="text-sm font-semibold text-secondary">{item.value}%</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 {/* Bottom Grid */}
 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
  {/* Top Organisations Ledger */}
  <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
 <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
 <h3 className="text-sm font-semibold text-secondary">Top Performing Organisations</h3>
 <button className="text-sm font-bold text-primary hover:underline">View All Organisations</button>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-white border-b border-gray-100">
 <tr>
 <th className="px-5 py-3 text-left text-sm font-semibold text-gray-400">Organisation</th>
 <th className="px-5 py-3 text-left text-sm font-semibold text-gray-400">Subscription Tier</th>
 <th className="px-5 py-3 text-center text-sm font-semibold text-gray-400">User Quota</th>
 <th className="px-5 py-3 text-right text-sm font-semibold text-gray-400">Monthly Revenue</th>
 <th className="px-5 py-3 text-right text-sm font-semibold text-gray-400">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {orgs.map((org) => (
 <tr key={org.name} className="hover:bg-gray-50/60 transition-colors group">
 <td className="px-5 py-3.5">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shadow-sm">
 {org.name.charAt(0)}
 </div>
 <span className="font-bold text-secondary text-xs">{org.name}</span>
 </div>
 </td>
 <td className="px-5 py-3.5">
 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-semibold border ${
 org.plan === 'Enterprise' ? 'bg-primary/5 text-primary border-primary/10' :
 org.plan === 'Pro' ? 'bg-secondary/5 text-secondary border-secondary/10' : 'bg-gray-50 text-gray-400 border-gray-100'
 }`}>
 {org.plan}
 </span>
 </td>
 <td className="px-5 py-3.5 text-center">
 <span className="text-xs font-medium text-secondary">{org.users} / 50</span>
 </td>
 <td className="px-5 py-3.5 text-right">
 <span className="text-xs font-semibold text-secondary">{org.revenue}</span>
 </td>
 <td className="px-5 py-3.5 text-right">
 <button className="text-sm font-bold text-primary hover:underline">
 Manage &rarr;
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 
  {/* Recent Notifications */}
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
      <h3 className="text-sm font-semibold text-secondary">Recent Notifications</h3>
      <a href="/superadmin/notifications" className="text-xs font-semibold text-primary hover:underline">View All</a>
    </div>
    <div className="p-4 flex-1 flex flex-col gap-3">
      {[
        { title: 'New Organisation Signed Up', desc: 'Acme Corp just completed registration.', time: '2 mins ago', type: 'success' },
        { title: 'Server Load Alert', desc: 'Database cluster CPU usage > 85%.', time: '1 hour ago', type: 'warning' },
        { title: 'Payment Failed', desc: 'Subscription renewal failed for tenant X.', time: '3 hours ago', type: 'error' },
        { title: 'Platform Update', desc: 'System maintenance scheduled for v2.4.', time: '1 day ago', type: 'info' }
      ].map((notif, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <div className={`shrink-0 w-2 h-2 mt-1.5 rounded-full ${
            notif.type === 'success' ? 'bg-green-500' :
            notif.type === 'warning' ? 'bg-amber-500' :
            notif.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          }`} />
          <div>
            <h4 className="text-sm font-semibold text-secondary">{notif.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.desc}</p>
            <span className="text-[10px] font-medium text-gray-400 mt-1 block">{notif.time}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
 </div>
 </div>
 );
};

export default SuperadminDashboard;
