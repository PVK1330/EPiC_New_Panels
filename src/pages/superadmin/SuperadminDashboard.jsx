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
  RiServerLine,
  RiDatabase2Line,
  RiPulseLine,
  RiFlashlightLine,
  RiMegaphoneLine,
  RiNotification4Line,
} from 'react-icons/ri';
import Button from '../../components/Button';

const StatCard = ({ title, value, icon: Icon, trend, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: "easeOut" }}
    className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all"
  >
    <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
       <Icon size={80} className="rotate-12" />
    </div>
    <div className="flex items-start justify-between mb-4 relative z-10">
      <div className={`p-3 rounded-2xl bg-${color === 'amber' ? 'amber-50 text-amber-600 border-amber-100' : 'primary/5 text-primary border-primary/10'} border shadow-inner`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-600 text-[10px] font-black uppercase tracking-widest bg-green-50 px-2 py-1 rounded-lg border border-green-100">
          <RiArrowRightUpLine size={12} />
          {trend}
        </div>
      )}
    </div>
    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 relative z-10">{title}</p>
    <h3 className="text-3xl font-black text-secondary tracking-tighter relative z-10">{value}</h3>
  </motion.div>
);

const SuperadminDashboard = () => {
  const orgs = [
    { name: 'Elite Visa Solutions', plan: 'Enterprise', users: 45, cases: 1240, status: 'Active', growth: '+12.5%' },
    { name: 'Global Migrate Pro', plan: 'Pro', users: 12, cases: 450, status: 'Active', growth: '+5.2%' },
    { name: 'London Legal Partners', plan: 'Starter', users: 4, cases: 85, status: 'Trial', growth: '+2.1%' },
    { name: 'Bridge UK Immigration', plan: 'Enterprise', users: 38, cases: 980, status: 'Suspended', growth: '0%' },
    { name: 'Westminster Agency', plan: 'Pro', users: 15, cases: 310, status: 'Active', growth: '+8.4%' },
  ];

  const auditEvents = [
    { id: 1, type: 'Auth', desc: 'New Admin login detected', org: 'Elite Visa', time: '2 mins ago', severity: 'low' },
    { id: 2, type: 'Billing', desc: 'Plan upgraded to Enterprise', org: 'Global Migrate', time: '15 mins ago', severity: 'medium' },
    { id: 3, type: 'Data', desc: 'Bulk import of 500 cases', org: 'London Legal', time: '1 hour ago', severity: 'low' },
    { id: 4, type: 'System', desc: 'New organization onboarded', org: 'EPiC System', time: '3 hours ago', severity: 'medium' },
    { id: 5, type: 'Security', desc: 'MFA reset requested', org: 'Bridge UK', time: '5 hours ago', severity: 'high' },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-black text-secondary uppercase tracking-[0.05em]">Platform Engine</h1>
              <span className="px-3 py-1 bg-green-500/10 text-green-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-green-500/20 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Global Live
              </span>
           </div>
           <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">Enterprise control center for multi-tenant SaaS operations.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="secondary" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-white border-gray-100 shadow-sm hover:shadow-md">
              <RiMegaphoneLine size={18} /> System Broadcast
           </Button>
           <Button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest px-8 py-2.5 shadow-xl shadow-primary/20">
              <RiFlashlightLine size={18} /> Rapid Audit
           </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Global Organizations" value="124" icon={RiOrganizationChart} trend="+12.5%" color="primary" delay={0.1} />
        <StatCard title="Monetized Revenue" value="£84,250" icon={RiMoneyPoundCircleLine} trend="+15.2%" color="primary" delay={0.2} />
        <StatCard title="Platform Load" value="42%" icon={RiPulseLine} color="amber" delay={0.3} />
        <StatCard title="System Alerts" value="08" icon={RiNotification4Line} color="amber" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Growth & Analytics Canvas */}
        <div className="xl:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-secondary uppercase tracking-[0.2em]">Growth Architecture</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">Real-time platform adoption and monetization vectors.</p>
            </div>
            <div className="flex bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
               <button className="px-5 py-2 bg-white shadow-xl shadow-gray-200/50 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest transition-all">Revenue</button>
               <button className="px-5 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-all">Expansion</button>
            </div>
          </div>
          
          <div className="h-72 flex items-end justify-between gap-3 pt-6 relative">
             {/* Grid Lines */}
             <div className="absolute inset-0 flex flex-col justify-between opacity-[0.03] pointer-events-none">
                {[...Array(6)].map((_, i) => <div key={i} className="w-full h-px bg-secondary" />)}
             </div>
             
             {[45, 62, 58, 75, 90, 82, 95, 110, 105, 120, 140, 165].map((h, i) => (
                <div key={i} className="flex-1 group relative flex flex-col justify-end h-full">
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${h}%` }}
                     transition={{ delay: i * 0.05, duration: 1, ease: "circOut" }}
                     className="w-full bg-primary/10 rounded-t-2xl group-hover:bg-primary/20 transition-all cursor-pointer relative"
                   >
                      <div className="absolute top-0 inset-x-0 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-secondary text-white text-[9px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl z-20 pointer-events-none">
                         £{(h * 1250).toLocaleString()}
                      </div>
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

        {/* System Node Status */}
        <div className="bg-secondary p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-24 -mt-24 blur-3xl" />
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Node Integrity</h3>
                 <RiServerLine className="text-primary animate-pulse" size={24} />
              </div>
              
              <div className="space-y-5">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Global Latency</span>
                       <span className="text-[9px] font-black text-green-400 uppercase tracking-widest flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-green-400" /> Optimal
                       </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                       <h4 className="text-4xl font-black text-white tracking-tighter">124</h4>
                       <span className="text-[10px] font-black text-white/40 uppercase">ms</span>
                    </div>
                 </div>

                 <div className="p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Database Sync</span>
                       <span className="text-[9px] font-black text-primary uppercase tracking-widest">v2.4.0-stable</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: "98%" }}
                         className="h-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                       />
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-white/30 uppercase tracking-widest">
                       <span>Master Node</span>
                       <span>98.2% Consistently</span>
                    </div>
                 </div>

                 <div className="pt-4 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                       <RiDatabase2Line className="text-primary mx-auto mb-2" size={20} />
                       <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Storage</p>
                       <p className="text-xs font-black text-white mt-1">1.2 TB</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                       <RiHistoryLine className="text-primary mx-auto mb-2" size={20} />
                       <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Uptime</p>
                       <p className="text-xs font-black text-white mt-1">99.9%</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Registry */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div>
              <h3 className="text-xs font-black text-secondary uppercase tracking-[0.2em]">SaaS Registry</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1">Connected organization nodes.</p>
            </div>
            <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Global Directory</button>
          </div>
          <div className="overflow-x-auto no-scrollbar px-1">
            <table className="w-full text-sm">
              <thead className="bg-white text-[10px] uppercase text-gray-300 tracking-[0.15em] font-black">
                <tr>
                  <th className="px-5 py-4 text-left">Organization</th>
                  <th className="px-5 py-4 text-left">Tier</th>
                  <th className="px-5 py-4 text-center">Users</th>
                  <th className="px-5 py-4 text-center">Growth</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {orgs.map((org) => (
                  <tr key={org.name} className="hover:bg-gray-50/80 transition-all group">
                    <td className="px-5 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-secondary font-black text-[10px] group-hover:bg-primary group-hover:text-white transition-all">
                             {org.name.charAt(0)}
                          </div>
                          <span className="font-black text-secondary text-xs uppercase tracking-tight">{org.name}</span>
                       </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        org.plan === 'Enterprise' ? 'bg-primary/5 text-primary border-primary/10' :
                        org.plan === 'Pro' ? 'bg-secondary/5 text-secondary border-secondary/10' : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-gray-600 font-black text-xs">{org.users}</td>
                    <td className="px-5 py-4 text-center">
                       <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">{org.growth}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        org.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                        org.status === 'Trial' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        <span className={`w-1 h-1 rounded-full mr-2 ${org.status === 'Active' ? 'bg-green-500' : org.status === 'Trial' ? 'bg-blue-500' : 'bg-red-500'}`} />
                        {org.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="text-[10px] font-black text-primary hover:bg-primary/5 px-4 py-1.5 rounded-lg border border-primary/10 transition-all uppercase tracking-widest">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Activity Stream */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <RiHistoryLine size={120} className="-rotate-12" />
          </div>
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between relative z-10 bg-gray-50/30">
            <div>
              <h3 className="text-xs font-black text-secondary uppercase tracking-[0.2em]">Activity Stream</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1">Live audit logs.</p>
            </div>
          </div>
          <div className="flex-1 p-5 space-y-4 relative z-10">
            {auditEvents.map((event) => (
              <div key={event.id} className="flex gap-4 group cursor-default">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-inner transition-all group-hover:scale-110 ${
                  event.type === 'Auth' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  event.type === 'Billing' ? 'bg-green-50 text-green-600 border-green-100' :
                  event.type === 'Data' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                  <RiHistoryLine size={18} />
                </div>
                <div className="flex-1 min-w-0 border-b border-gray-50 pb-3 group-last:border-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{event.type}</span>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{event.time}</span>
                  </div>
                  <p className="text-xs font-black text-secondary uppercase tracking-tight truncate">{event.desc}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                     <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{event.org}</span>
                     <div className="w-1 h-1 rounded-full bg-gray-100" />
                     <span className={`text-[8px] font-black uppercase tracking-widest ${
                        event.severity === 'high' ? 'text-red-500' : 'text-gray-400'
                     }`}>{event.severity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 pt-0">
             <button className="w-full py-2.5 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] rounded-xl hover:bg-secondary hover:text-white transition-all border border-gray-100">Audit Registry</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminDashboard;
