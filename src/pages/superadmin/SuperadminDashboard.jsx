import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiOrganizationChart,
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

const StatCard = ({ title, value, icon: Icon, trend, color, delay }) => (
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
      {trend && (
        <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
          trend.startsWith('+') ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'
        }`}>
          {trend}
        </div>
      )}
    </div>
    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-black text-secondary tracking-tight">{value}</h3>
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
    Churn: [2, 1, 3, 2, 1, 4, 2, 1, 2, 3, 1, 2]
  };

  const distribution = [
    { name: 'Enterprise', value: 45, color: 'bg-primary' },
    { name: 'Professional', value: 35, color: 'bg-secondary' },
    { name: 'Starter', value: 20, color: 'bg-amber-400' }
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Platform Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-xl font-bold text-secondary uppercase tracking-tight mb-1">Platform Overview</h1>
           <p className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">Consolidated business intelligence and organizational performance metrics.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" className="text-[10px] font-bold uppercase tracking-widest px-6 py-2 bg-white border-gray-100 shadow-sm hover:border-primary/20">
              Generate Report
           </Button>
           <Button className="text-[10px] font-bold uppercase tracking-widest px-8 py-2 shadow-sm transition-all hover:scale-[1.02]">
              Add Organization
           </Button>
        </div>
      </div>

      {/* Core Business KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total MRR" value="£84,250" icon={RiMoneyPoundCircleLine} trend="+12.5%" color="primary" delay={0.1} />
        <StatCard title="Active Tenants" value="124" icon={RiOrganizationChart} trend="+5.2%" color="primary" delay={0.2} />
        <StatCard title="Platform Users" value="4.2k" icon={RiGroupLine} trend="+8.4%" color="primary" delay={0.3} />
        <StatCard title="Net Retention" value="104.2%" icon={RiBarChartLine} trend="+2.1%" color="primary" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Growth Analytics */}
        <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">{activeTab} Performance</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">Platform growth trajectory for the current fiscal year.</p>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
               <button 
                 onClick={() => setActiveTab('Revenue')}
                 className={`px-4 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === 'Revenue' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-secondary'}`}
               >
                  Revenue
               </button>
               <button 
                 onClick={() => setActiveTab('Churn')}
                 className={`px-4 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === 'Churn' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-secondary'}`}
               >
                  Churn
               </button>
            </div>
          </div>
          
          <div className="flex-1 min-h-[220px] flex items-end justify-between gap-3 pt-2">
             {chartData[activeTab].map((h, i) => (
                <div key={i} className="flex-1 group relative flex flex-col justify-end h-full">
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${activeTab === 'Revenue' ? h / 2 : h * 10}%` }}
                     transition={{ delay: i * 0.05, duration: 0.8 }}
                     className="w-full bg-primary/10 rounded-t-lg group-hover:bg-primary transition-all cursor-pointer relative"
                   >
                      <div className="absolute top-0 inset-x-0 h-0.5 bg-primary group-hover:bg-white rounded-full opacity-50" />
                   </motion.div>
                </div>
             ))}
          </div>
          <div className="flex justify-between mt-6 px-1 border-t border-gray-50 pt-4">
             {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(m => (
                <span key={m} className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{m}</span>
             ))}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Plan Distribution</h3>
              <RiPieChart2Line className="text-primary" size={20} />
           </div>

           <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center mb-10">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="88" cy="88" r="75" fill="transparent" stroke="#f3f4f6" strokeWidth="18" />
                    <circle cx="88" cy="88" r="75" fill="transparent" stroke="var(--primary)" strokeWidth="18" strokeDasharray="471" strokeDashoffset="260" strokeLinecap="round" />
                    <circle cx="88" cy="88" r="75" fill="transparent" stroke="var(--secondary)" strokeWidth="18" strokeDasharray="471" strokeDashoffset="400" strokeLinecap="round" transform="rotate(162 88 88)" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-secondary tracking-tight">124</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tenants</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 w-full gap-3">
                 {distribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/30">
                       <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.name}</span>
                       </div>
                       <span className="text-[10px] font-black text-secondary uppercase">{item.value}%</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Top Organizations Ledger */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h3 className="text-[10px] font-black text-secondary uppercase tracking-widest">Top Performing Organizations</h3>
          <button className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest">View All Organizations</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white text-[9px] uppercase text-gray-400 tracking-widest font-black border-b border-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">Organization</th>
                <th className="px-6 py-4 text-left">Subscription Tier</th>
                <th className="px-6 py-4 text-center">User Quota</th>
                <th className="px-6 py-4 text-right">Monthly Revenue</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {orgs.map((org) => (
                <tr key={org.name} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 text-secondary font-black text-[10px] group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                           {org.name.charAt(0)}
                        </div>
                        <span className="font-bold text-secondary text-xs uppercase tracking-tight">{org.name}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                      org.plan === 'Enterprise' ? 'bg-primary/5 text-primary border-primary/10' :
                      org.plan === 'Pro' ? 'bg-secondary/5 text-secondary border-secondary/10' : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-secondary">{org.users} / 50</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-black text-secondary tracking-tight">{org.revenue}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="p-1.5 text-gray-400 hover:text-secondary hover:bg-gray-100 rounded-lg transition-all" title="Manage Organization">
                        <RiArrowRightSLine size={20} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperadminDashboard;
