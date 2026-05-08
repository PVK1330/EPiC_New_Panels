import React from 'react';
import { motion } from 'framer-motion';
import {
  RiOrganizationChart,
  RiGroupLine,
  RiBriefcaseLine,
  RiMoneyPoundCircleLine,
  RiTimeLine,
  RiErrorWarningLine,
  RiArrowRightUpLine,
  RiGlobalLine,
  RiHistoryLine,
  RiShieldCheckLine,
} from 'react-icons/ri';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 rounded-lg bg-primary/10 text-primary`}>
        <Icon size={20} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase tracking-tight">
          <RiArrowRightUpLine size={12} />
          {trend}
        </div>
      )}
    </div>
    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">{title}</p>
    <h3 className="text-2xl font-black text-secondary tracking-tight">{value}</h3>
  </motion.div>
);

const SuperadminDashboard = () => {
  const orgs = [
    { name: 'Elite Visa Solutions', plan: 'Enterprise', users: 45, cases: 1240, status: 'Active' },
    { name: 'Global Migrate Pro', plan: 'Pro', users: 12, cases: 450, status: 'Active' },
    { name: 'London Legal Partners', plan: 'Starter', users: 4, cases: 85, status: 'Trial' },
    { name: 'Bridge UK Immigration', plan: 'Enterprise', users: 38, cases: 980, status: 'Suspended' },
    { name: 'Westminster Agency', plan: 'Pro', users: 15, cases: 310, status: 'Active' },
  ];

  const auditEvents = [
    { id: 1, type: 'Auth', desc: 'New Admin login', org: 'Elite Visa', time: '2 mins ago' },
    { id: 2, type: 'Billing', desc: 'Plan upgraded to Enterprise', org: 'Global Migrate', time: '15 mins ago' },
    { id: 3, type: 'Data', desc: 'Bulk import of 500 cases', org: 'London Legal', time: '1 hour ago' },
    { id: 4, type: 'System', desc: 'New organization onboarded', org: 'System', time: '3 hours ago' },
    { id: 5, type: 'Security', desc: 'Failed login attempt', org: 'Bridge UK', time: '5 hours ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight uppercase tracking-wider">System Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">Global platform metrics and organization control center.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-lg shadow-sm">
            <RiGlobalLine size={16} className="text-primary" />
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Global Node</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Organizations" value="124" icon={RiOrganizationChart} trend="+12%" />
        <StatCard title="Total Users" value="2,840" icon={RiGroupLine} trend="+5.4%" />
        <StatCard title="Active Cases" value="15,200" icon={RiBriefcaseLine} trend="+8.2%" />
        <StatCard title="Total Revenue" value="£84,250" icon={RiMoneyPoundCircleLine} trend="+15%" />
        <StatCard title="Overdue" value="42" icon={RiErrorWarningLine} />
        <StatCard title="Pending" value="8" icon={RiTimeLine} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organisations Table Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-secondary uppercase tracking-widest">Recent Organizations</h3>
            <button className="text-[10px] font-black text-primary hover:opacity-80 transition-colors uppercase tracking-widest">View All</button>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4 text-left">Organization</th>
                  <th className="px-6 py-4 text-left">Plan</th>
                  <th className="px-6 py-4 text-center">Users</th>
                  <th className="px-6 py-4 text-center">Cases</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orgs.map((org) => (
                  <tr key={org.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-secondary">{org.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                        org.plan === 'Enterprise' ? 'bg-primary/10 text-primary border border-primary/20' :
                        org.plan === 'Pro' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 font-bold">{org.users}</td>
                    <td className="px-6 py-4 text-center text-gray-600 font-bold">{org.cases}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                        org.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' :
                        org.status === 'Trial' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[10px] font-black text-primary hover:opacity-80 uppercase tracking-widest">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-secondary uppercase tracking-widest">Activity Timeline</h3>
            <button className="text-[10px] font-black text-primary hover:opacity-80 uppercase tracking-widest">See All</button>
          </div>
          <div className="p-4 space-y-4 no-scrollbar overflow-y-auto">
            {auditEvents.map((event) => (
              <div key={event.id} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  event.type === 'Auth' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  event.type === 'Billing' ? 'bg-green-50 text-green-600 border-green-100' :
                  event.type === 'Data' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                }`}>
                  <RiHistoryLine size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{event.type}</span>
                    <span className="text-[10px] font-bold text-gray-400">{event.time}</span>
                  </div>
                  <p className="text-xs font-bold text-secondary truncate mt-0.5">{event.desc}</p>
                  <p className="text-[10px] font-black text-primary uppercase mt-1 tracking-widest">{event.org}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-5 border-t border-gray-50 bg-gray-50/50 rounded-b-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Distribution</h4>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100">
              <div className="w-[45%] bg-primary" />
              <div className="w-[35%] bg-secondary" />
              <div className="w-[20%] bg-gray-300" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ENT</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">PRO</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">STR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SystemHealthSection />
    </div>
  );
};

// --- NEW COMPONENT: SYSTEM HEALTH SECTION ---
const SystemHealthSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Activity Trend */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Growth Analytics</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">Platform-wide usage and adoption rates.</p>
          </div>
          <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
             <button className="px-3 py-1 bg-white shadow-sm rounded-md text-[9px] font-black text-primary uppercase tracking-widest">Revenue</button>
             <button className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors">Users</button>
          </div>
        </div>
        <div className="h-64 flex items-end justify-between gap-2 pt-4">
           {[45, 62, 58, 75, 90, 82, 95, 110, 105, 120, 140, 165].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/10 rounded-t-lg group relative transition-all hover:bg-primary/30">
                 <div style={{ height: `${h}%` }} className="w-full bg-primary rounded-t-lg transition-all group-hover:scale-y-105 shadow-[0_-4px_12px_rgba(99,102,241,0.2)]" />
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {h}% Growth
                 </div>
              </div>
           ))}
        </div>
        <div className="flex justify-between mt-4 px-1">
           {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
              <span key={m} className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{m}</span>
           ))}
        </div>
      </div>

      {/* Infrastructure Health */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-sm font-black text-secondary uppercase tracking-widest">System Status</h3>
           <RiShieldCheckLine className="text-green-500" size={20} />
        </div>
        <div className="space-y-5">
           <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">API Latency</span>
                 <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Optimal</span>
              </div>
              <div className="flex items-end gap-1 mb-1">
                 <span className="text-xl font-black text-secondary tracking-tighter">124</span>
                 <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">ms</span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                 <div className="w-[85%] h-full bg-green-500" />
              </div>
           </div>

           <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Server Load</span>
                 <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Normal</span>
              </div>
              <div className="flex items-end gap-1 mb-1">
                 <span className="text-xl font-black text-secondary tracking-tighter">42</span>
                 <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">%</span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                 <div className="w-[42%] h-full bg-amber-500" />
              </div>
           </div>

           <div className="pt-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Service Status</p>
              <div className="space-y-2">
                 <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-gray-500">Database Cluster</span>
                    <span className="text-green-600">Online</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-gray-500">Redis Cache</span>
                    <span className="text-green-600">Online</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-gray-500">SMTP Gateway</span>
                    <span className="text-green-600">Online</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminDashboard;
