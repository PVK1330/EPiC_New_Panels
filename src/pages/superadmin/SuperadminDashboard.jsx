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
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-100 rounded-2xl p-8 text-white shadow-lg border border-white/10 overflow-hidden relative"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <h1 className="text-2xl font-black text-red-800 mb-2">Platform Overview</h1>
                   <p className="text-sm text-gray-500  tracking-widest">Consolidated business intelligence and organisational performance metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                   <motion.div
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                   >
                     <Button 
                       
  
                        className="px-6 py-3 text-[11px] font-black uppercase tracking-widest border bg-blue-950 border-white/30 text-gray-600 shadow-lg backdrop-blur-sm"
                     >
                        <RiShieldUserLine size={16} className="inline mr-2" />Generate Report
                     </Button>
                   </motion.div>
                   <motion.div
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                   >
                     <Button 
                     
                        className="px-6 py-3 text-[11px] font-black uppercase tracking-widest bg-blue-950 border border-white/30 text-white shadow-lg backdrop-blur-sm"
                     >
                        <RiAddLine size={18} /> Add Organisation
                     </Button>
                   </motion.div>
                </div>
              </div>
            </motion.div>

      {/* Core Business KPIs */}
        <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    transition={{ duration: 0.3 }}
                    className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50 shadow-sm flex items-center gap-4 hover:border-blue-300/80 cursor-pointer group overflow-hidden relative"
                  >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full blur-2xl" />
                      <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                        <RiMoneyPoundCircleLine size={24} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Total MRR</p>
                        <h4 className="text-m font-black text-blue-900 tracking-tight">£84,250</h4>
                        <h4 className="text-m font-black text-blue-900 tracking-tight">+12.5%</h4>

                      </div>
                  </motion.div>
      
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200/50 shadow-sm flex items-center gap-4 hover:border-green-300/80 cursor-pointer group overflow-hidden relative"
                  >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full blur-2xl" />
                      <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                        <RiOrganizationChart size={24} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Active Tenants</p>
                        <h4 className="text-m font-black text-green-900 tracking-tight">124</h4>
                        <h4 className="text-m font-black text-green-900 tracking-tight">+5.2%</h4>
                      </div>
                  </motion.div>
      
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200/50 shadow-sm flex items-center gap-4 hover:border-purple-300/80 cursor-pointer group overflow-hidden relative"
                  >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full blur-2xl" />
                      <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                        <RiGroupLine size={24} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Platform Users</p>
                        <h4 className="text-m font-black text-purple-900 tracking-tight">4.2k</h4>
                        <h4 className="text-m font-black text-purple-900 tracking-tight">+8.4%</h4>
                      </div>
                  </motion.div>
      
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200/50 shadow-sm flex items-center gap-4 hover:border-amber-300/80 cursor-pointer group overflow-hidden relative"
                  >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/30 rounded-full blur-2xl" />
                      <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                        <RiBarChartLine size={24} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Net Retention</p>
                        <h4 className="text-m font-black text-amber-900 tracking-tight">104.2%</h4>
                        <h4 className="text-m font-black text-amber-900 tracking-tight">+2.1%</h4>
                      </div>
                  </motion.div>
                </motion.div>

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

      {/* Top Organisations Ledger */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h3 className="text-[10px] font-black text-secondary uppercase tracking-widest">Top Performing Organisations</h3>
          <button className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest">View All Organisations</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white text-[9px] uppercase text-gray-400 tracking-widest font-black border-b border-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">Organisation</th>
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
                     <button className="p-1.5 text-gray-400 hover:text-secondary hover:bg-gray-100 rounded-lg transition-all" title="Manage Organisation">
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
