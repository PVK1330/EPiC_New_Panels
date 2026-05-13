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
   RiTimeLine,
   RiCheckLine,
   RiErrorWarningLine,
   RiArrowDownSLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/Input';

const SuperadminFrontend = () => {
   const [activeTab, setActiveTab] = useState('Announcements');
   const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

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
      <div className="space-y-5 pb-6">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-xl font-bold text-secondary uppercase tracking-tight">Portal Content</h1>
               <p className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">Manage announcements, landing pages, and support content.</p>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="secondary" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-5 py-2 bg-white border-gray-100 shadow-sm">
                  <RiExternalLinkLine size={16} /> View Portal
               </Button>
               <Button
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-6 py-2 shadow-sm"
               >
                  <RiAddLine size={18} /> New Announcement
               </Button>
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg border border-gray-100 w-fit">
            {['Announcements', 'Landing Pages', 'FAQ', 'Theme'].map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === tab
                        ? 'bg-secondary text-white shadow-sm'
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
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -5 }}
               className="min-h-[450px]"
            >
               {activeTab === 'Announcements' && (
                  <div className="space-y-3">
                     {announcements.map((item) => (
                        <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-xl border border-gray-100 group hover:border-primary/20 transition-all gap-4">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                 <RiMegaphoneLine size={18} />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-secondary uppercase tracking-tight group-hover:text-primary transition-colors">{item.title}</p>
                                 <div className="flex items-center gap-2.5 mt-0.5">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{item.date}</span>
                                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${item.priority === 'High' ? 'text-red-500' : 'text-amber-500'
                                       }`}>{item.priority}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center justify-between md:justify-end gap-6">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${item.status === 'Published' ? 'bg-green-50 text-green-600 border-green-100' :
                                    item.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                 }`}>
                                 {item.status}
                              </span>
                              <div className="flex items-center gap-1 transition-all">
                                 <button className="p-1.5 text-gray-500 hover:text-secondary rounded-lg"><RiImageEditLine size={16} /></button>
                                 <button className="p-1.5 text-gray-500 hover:text-red-500 rounded-lg"><RiMore2Line size={16} /></button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {activeTab === 'Landing Pages' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center group cursor-pointer hover:border-primary/20 transition-all min-h-[250px]">
                        <RiAddLine size={24} className="text-gray-300 group-hover:text-primary mb-2" />
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-primary">New Section</p>
                     </div>

                     <div className="bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all flex flex-col">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                           <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest">Main Landing</h4>
                           <RiLayoutGridLine className="text-primary" size={16} />
                        </div>
                        <div className="flex-1 bg-gray-50/30 p-4">
                           <div className="w-full aspect-video bg-white rounded-lg shadow-sm border border-gray-100 p-2 flex flex-col gap-1">
                              <div className="h-1.5 w-1/3 bg-gray-100 rounded" />
                              <div className="h-1 w-full bg-gray-50 rounded" />
                              <div className="h-1 w-full bg-gray-50 rounded" />
                              <div className="mt-auto h-3 w-full bg-primary/5 rounded" />
                           </div>
                        </div>
                        <div className="p-4 flex items-center justify-between border-t border-gray-50">
                           <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">v1.2.0</span>
                           <button className="text-[9px] font-bold text-primary uppercase tracking-widest hover:underline">Edit</button>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'FAQ' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {faq.map((item) => (
                        <div key={item.id} className="p-5 bg-white rounded-xl border border-gray-100 group hover:border-primary/20 transition-all">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-white">
                                 <RiQuestionAnswerLine size={18} />
                              </div>
                              <div>
                                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{item.category}</p>
                                 <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded text-[8px] font-bold uppercase tracking-widest">{item.status}</span>
                              </div>
                           </div>
                           <p className="text-xs font-bold text-secondary uppercase tracking-tight group-hover:text-primary transition-colors">{item.question}</p>
                           <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end">
                              <button className="text-[9px] font-bold text-gray-400 hover:text-secondary uppercase tracking-widest">Manage</button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {activeTab === 'Theme' && (
                  <div className="space-y-6">
                     <div className="p-8 bg-white rounded-xl border border-gray-100 shadow-sm text-center group">
                        <RiPaletteLine size={32} className="text-primary mx-auto mb-4" />
                        <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Theme Configuration</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-2 max-w-sm mx-auto">
                           Customize portal CSS architecture and global visual overrides.
                        </p>
                        <Button className="mt-6 px-10 py-2 text-[9px] font-bold uppercase tracking-widest shadow-sm">Open Editor</Button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-secondary rounded-xl border border-secondary shadow-sm">
                           <div className="flex items-center gap-3 mb-3">
                              <RiNotificationBadgeLine className="text-primary" size={18} />
                              <p className="text-[10px] font-bold text-white uppercase tracking-widest">Theme Injection</p>
                           </div>
                           <p className="text-[9px] text-white/50 font-bold uppercase leading-relaxed">Overwrite core variables with custom CSS blocks.</p>
                        </div>
                        <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
                           <div className="flex items-center gap-3 mb-3">
                              <RiEyeLine className="text-primary" size={18} />
                              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Visibility</p>
                           </div>
                           <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed">Toggle high-level visibility for landing page sections.</p>
                        </div>
                     </div>
                  </div>
               )}
            </motion.div>
         </AnimatePresence>

         <Modal
            isOpen={isBroadcastModalOpen}
            onClose={() => setIsBroadcastModalOpen(false)}
            title="New Announcement"
            subtitle="Publish a notification to the platform."
            maxWidth="max-w-md"
            footer={
               <div className="flex justify-end gap-2 w-full">
                  <Button variant="secondary" onClick={() => setIsBroadcastModalOpen(false)} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
                  <Button onClick={() => setIsBroadcastModalOpen(false)} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">Publish</Button>
               </div>
            }
         >
            <div className="space-y-4 py-1">
               <Input label="Title" placeholder="Critical Update" />
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Priority</label>
                     <select className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none appearance-none">
                        <option>High Priority</option>
                        <option>Medium Priority</option>
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Audience</label>
                     <select className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none appearance-none">
                        <option>All Organizations</option>
                        <option>Enterprise Only</option>
                     </select>
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Message</label>
                  <textarea rows={4} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-secondary outline-none" placeholder="Write message..." />
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default SuperadminFrontend;
