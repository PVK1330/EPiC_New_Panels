import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiLayoutTopLine,
  RiMegaphoneLine,
  RiQuestionAnswerLine,
  RiImageEditLine,
  RiExternalLinkLine,
  RiAddLine,
  RiMore2Line,
  RiEyeLine,
  RiPaletteLine,
  RiLayoutGridLine,
  RiNotificationBadgeLine,
} from 'react-icons/ri';
import Button from '../../components/Button';

const SuperadminFrontend = () => {
  const [activeTab, setActiveTab] = useState('Announcements');

  const announcements = [
    { id: 1, title: 'Critical System Maintenance', status: 'Published', date: '08 May 2026', priority: 'High', type: 'System' },
    { id: 2, title: 'New UK HPI Visa Route', status: 'Scheduled', date: '12 May 2026', priority: 'Medium', type: 'Update' },
    { id: 3, title: 'Global Compliance Policy Update', status: 'Draft', date: '15 May 2026', priority: 'Low', type: 'Legal' },
  ];

  const faq = [
    { id: 1, question: 'How to authorize multi-node MFA?', category: 'Security', status: 'Live' },
    { id: 2, question: 'Global API rate limits explained', category: 'Infrastructure', status: 'Live' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-secondary uppercase tracking-widest">Content Engine</h1>
          <p className="text-[10px] text-gray-400 mt-1 font-black uppercase tracking-wider">Synchronize global platform announcements and public landing pages.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="secondary" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-white border-gray-100 shadow-sm hover:shadow-md transition-all">
              <RiExternalLinkLine size={16} /> Public Preview
           </Button>
           <Button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest px-8 py-2.5 shadow-lg shadow-primary/20">
              <RiAddLine size={18} /> New Broadcast
           </Button>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-gray-50/80 rounded-2xl border border-gray-100 w-fit">
        {['Announcements', 'Landing Pages', 'FAQ', 'Styles'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab
                ? 'bg-white text-primary shadow-lg shadow-primary/5 border border-gray-100'
                : 'text-gray-400 hover:text-secondary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="min-h-[500px]"
        >
          {activeTab === 'Announcements' && (
            <div className="space-y-4">
               {announcements.map((item) => (
                 <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 group hover:shadow-xl hover:border-primary/20 transition-all gap-6">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 text-primary shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
                          <RiMegaphoneLine size={24} />
                       </div>
                       <div>
                          <p className="text-xs font-black text-secondary uppercase tracking-tight mb-1 group-hover:text-primary transition-colors">{item.title}</p>
                          <div className="flex items-center gap-3">
                             <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{item.date}</span>
                             <div className="w-1 h-1 rounded-full bg-gray-200" />
                             <span className={`text-[9px] font-black uppercase tracking-widest ${
                                item.priority === 'High' ? 'text-red-500' : 'text-amber-500'
                             }`}>{item.priority} Priority</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6">
                       <div className="flex flex-col items-end">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${
                            item.status === 'Published' ? 'bg-green-50 text-green-600 border-green-100' :
                            item.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                          }`}>
                            {item.status}
                          </span>
                       </div>
                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-2 text-gray-400 hover:text-secondary hover:bg-gray-50 rounded-lg"><RiImageEditLine size={18} /></button>
                          <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><RiMore2Line size={18} /></button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'Landing Pages' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="p-8 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center group cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all min-h-[320px]">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-gray-100 text-gray-300 group-hover:text-primary group-hover:shadow-xl transition-all mb-4">
                     <RiAddLine size={32} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary">Deploy New Section</p>
               </div>
               
               {/* Homepage Mockup */}
               <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all flex flex-col">
                  <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                     <div>
                        <h4 className="text-[11px] font-black text-secondary uppercase tracking-widest">Main Landing</h4>
                        <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Status: Operational</p>
                     </div>
                     <RiLayoutGridLine className="text-primary" size={20} />
                  </div>
                  <div className="flex-1 bg-gray-50/50 p-6 flex items-center justify-center relative overflow-hidden">
                     <RiLayoutTopLine className="text-gray-100 absolute inset-0 -rotate-12 scale-150 transform translate-x-12 translate-y-12" size={200} />
                     <div className="relative z-10 w-full aspect-video bg-white rounded-xl shadow-sm border border-gray-100 p-2 overflow-hidden flex flex-col gap-1.5">
                        <div className="h-2 w-1/3 bg-gray-100 rounded" />
                        <div className="h-1 w-full bg-gray-50 rounded" />
                        <div className="h-1 w-full bg-gray-50 rounded" />
                        <div className="h-1 w-2/3 bg-gray-50 rounded" />
                        <div className="mt-auto h-4 w-full bg-primary/10 rounded" />
                     </div>
                  </div>
                  <div className="p-6 flex items-center justify-between bg-gray-50/30">
                     <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">v1.2.0-stable</span>
                     <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline">Edit Canvas</button>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'FAQ' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {faq.map((item) => (
                 <div key={item.id} className="p-6 bg-white rounded-2xl border border-gray-100 group hover:shadow-lg transition-all">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-secondary/20">
                          <RiQuestionAnswerLine size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.category}</p>
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded text-[8px] font-black uppercase tracking-widest">{item.status}</span>
                       </div>
                    </div>
                    <p className="text-xs font-black text-secondary uppercase tracking-tight leading-relaxed group-hover:text-primary transition-colors">{item.question}</p>
                    <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                       <button className="text-[9px] font-black text-gray-400 hover:text-secondary uppercase tracking-widest">Manage Registry</button>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'Styles' && (
             <div className="space-y-8">
                <div className="p-12 bg-white rounded-[2rem] border border-gray-100 shadow-sm text-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="relative z-10">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-inner group-hover:scale-110 transition-transform">
                         <RiPaletteLine size={36} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-black text-secondary uppercase tracking-widest">Global Style Weaver</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-3 max-w-sm mx-auto leading-relaxed">
                         Customize the platform's root CSS architecture, typography nodes, and global theme overrides.
                      </p>
                      <Button className="mt-8 px-12 py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20">Initialize Style Editor</Button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-6 bg-secondary rounded-2xl border border-secondary shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                         <RiNotificationBadgeLine className="text-primary" size={20} />
                         <p className="text-[10px] font-black text-white uppercase tracking-widest">Theme Injection</p>
                      </div>
                      <p className="text-[9px] text-white/50 font-bold uppercase leading-relaxed">Overwrite core variables with custom CSS blocks for specialized branding requirements.</p>
                   </div>
                   <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                         <RiEyeLine className="text-primary" size={20} />
                         <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Visibility Controls</p>
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed">Toggle high-level visibility for landing page sections across global nodes.</p>
                   </div>
                </div>
             </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SuperadminFrontend;
