import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiLayoutTopLine,
  RiMegaphoneLine,
  RiQuestionAnswerLine,
  RiImageEditLine,
  RiExternalLinkLine,
  RiAddLine,
  RiMore2Line,
  RiEyeLine,
} from 'react-icons/ri';
import Button from '../../components/Button';

const SuperadminFrontend = () => {
  const [activeTab, setActiveTab] = useState('Announcements');

  const announcements = [
    { id: 1, title: 'System Maintenance: May 15', status: 'Published', date: '2026-05-08', priority: 'High' },
    { id: 2, title: 'New Visa Category Added: HPI', status: 'Scheduled', date: '2026-05-10', priority: 'Medium' },
    { id: 3, title: 'Easter Holiday Support Hours', status: 'Expired', date: '2026-04-12', priority: 'Low' },
  ];

  const faq = [
    { id: 1, question: 'How to reset MFA?', category: 'Security', status: 'Active' },
    { id: 2, question: 'Billing cycles explained', category: 'Commerce', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight uppercase tracking-wider">Frontend Management</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">Manage public landing pages, announcements, and platform content.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" className="flex items-center gap-2">
              <RiExternalLinkLine size={16} /> Preview Site
           </Button>
           <Button className="flex items-center gap-2">
              <RiAddLine size={18} /> New Entry
           </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-4 overflow-x-auto no-scrollbar">
           {['Announcements', 'Landing Pages', 'FAQ', 'Banners'].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                 activeTab === tab
                   ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                   : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
               }`}
             >
               {tab}
             </button>
           ))}
        </div>

        <div className="p-6">
          {activeTab === 'Announcements' && (
            <div className="space-y-4">
               {announcements.map((item) => (
                 <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100 text-primary shadow-sm">
                          <RiMegaphoneLine size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-secondary uppercase tracking-tight">{item.title}</p>
                          <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">{item.date} • {item.priority} Priority</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                         item.status === 'Published' ? 'bg-green-50 text-green-600 border border-green-100' :
                         item.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-200 text-gray-500 border border-gray-300'
                       }`}>
                         {item.status}
                       </span>
                       <button className="p-1.5 text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                          <RiMore2Line size={18} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'Landing Pages' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center group cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-gray-400 group-hover:text-primary transition-colors mb-4">
                     <RiLayoutTopLine size={24} />
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">Create New Section</p>
               </div>
               
               <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                     <h4 className="text-sm font-black text-secondary uppercase tracking-tight">Main Homepage</h4>
                     <RiEyeLine className="text-gray-400" size={18} />
                  </div>
                  <div className="h-32 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
                     <RiImageEditLine className="text-gray-200" size={32} />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last edited: 2h ago</span>
                     <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Edit Layout</button>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'FAQ' && (
            <div className="space-y-4">
               {faq.map((item) => (
                 <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100 text-secondary shadow-sm">
                          <RiQuestionAnswerLine size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-secondary uppercase tracking-tight">{item.question}</p>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-gray-100 mt-1 inline-block">
                             Category: {item.category}
                          </span>
                       </div>
                    </div>
                    <Button variant="secondary" className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest">Edit</Button>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Visual Editor Placeholder */}
      <div className="p-12 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <RiLayoutTopLine size={32} className="text-gray-300" />
         </div>
         <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Global CSS & Styling</h3>
         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-2 max-w-xs mx-auto">Customize the platform's root CSS variables and global theme overrides.</p>
         <Button variant="secondary" className="mt-6 px-8 text-[10px] font-black uppercase tracking-widest">Open Style Editor</Button>
      </div>
    </div>
  );
};

export default SuperadminFrontend;
