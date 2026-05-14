import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiSearchLine,
  RiFilter3Line,
  RiMore2Line,
  RiBuilding2Line,
  RiShieldCheckLine,
  RiErrorWarningLine,
  RiExchangeLine,
  RiEditLine,
  RiDeleteBin6Line,
  RiLoginBoxLine,
  RiAddLine,
} from 'react-icons/ri';
import { Plus } from 'lucide-react';
import CreateOrganizationModal from '../../components/superadmin/CreateOrganizationModal';
import Button from '../../components/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/Input';

const SuperadminOrganisations = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [orgs, setOrgs] = useState([
    { id: 1, name: 'Elite Visa Solutions', slug: 'elite-visa', plan: 'Enterprise', users: 45, cases: 1240, storage: '4.2 GB', status: 'Active', country: 'United Kingdom' },
    { id: 2, name: 'Global Migrate Pro', slug: 'global-migrate', plan: 'Pro', users: 12, cases: 450, storage: '1.1 GB', status: 'Active', country: 'Canada' },
    { id: 3, name: 'London Legal Partners', slug: 'london-legal', plan: 'Starter', users: 4, cases: 85, storage: '250 MB', status: 'Trial', country: 'United Kingdom' },
    { id: 4, name: 'Bridge UK Immigration', slug: 'bridge-uk', plan: 'Enterprise', users: 38, cases: 980, storage: '3.8 GB', status: 'Suspended', country: 'United Kingdom' },
    { id: 5, name: 'Westminster Agency', slug: 'westminster', plan: 'Pro', users: 15, cases: 310, storage: '800 MB', status: 'Active', country: 'United Kingdom' },
    { id: 6, name: 'Dubai Visa Experts', slug: 'dubai-visa', plan: 'Pro', users: 8, cases: 210, storage: '450 MB', status: 'Active', country: 'UAE' },
    { id: 7, name: 'Sydney Migrate', slug: 'sydney-migrate', plan: 'Starter', users: 2, cases: 45, storage: '120 MB', status: 'Trial', country: 'Australia' },
  ]);

  const tabs = ['All', 'Active', 'Trial', 'Suspended'];

  const filteredOrgs = orgs.filter(org => {
    const matchesTab = activeTab === 'All' || org.status === activeTab;
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         org.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.country.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateOrg = (data) => {
    const newOrg = {
      id: orgs.length + 1,
      name: data.name,
      slug: data.slug,
      plan: data.plan.charAt(0).toUpperCase() + data.plan.slice(1),
      users: 0,
      cases: 0,
      storage: '0 MB',
      status: 'Trial',
      country: data.country
    };
    setOrgs([...orgs, newOrg]);
    setIsCreateModalOpen(false);
  };

  const handleEditOrg = (data) => {
    setOrgs(orgs.map(org => org.id === selectedOrg.id ? { ...org, ...data } : org));
    setIsEditModalOpen(false);
  };

  const handleDeleteOrg = () => {
    setOrgs(orgs.filter(org => org.id !== selectedOrg.id));
    setIsDeleteModalOpen(false);
  };

  const handleLoginAs = (org) => {
    alert(`Impersonating ${org.name}. Redirecting to organization dashboard...`);
  };

  return (
    <div className="space-y-5 pb-6">
      <CreateOrganizationModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreateOrg}
      />

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Organization"
        subtitle="Update organization details."
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
            <Button onClick={() => handleEditOrg(selectedOrg)} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">Save Changes</Button>
          </div>
        }
      >
        <div className="space-y-4 py-1">
           <Input 
            label="Name" 
            value={selectedOrg?.name || ''} 
            onChange={(e) => setSelectedOrg({ ...selectedOrg, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Plan</label>
              <select 
                value={selectedOrg?.plan?.toLowerCase() || 'starter'} 
                onChange={(e) => setSelectedOrg({ ...selectedOrg, plan: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none appearance-none"
              >
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
              <select 
                value={selectedOrg?.status || 'Active'} 
                onChange={(e) => setSelectedOrg({ ...selectedOrg, status: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none appearance-none"
              >
                <option>Active</option>
                <option>Trial</option>
                <option>Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Organization"
        subtitle="This action cannot be undone."
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-600 border-red-600 px-6 py-2 text-[10px] font-bold uppercase tracking-widest" onClick={handleDeleteOrg}>Delete</Button>
          </div>
        }
      >
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3">
           <RiErrorWarningLine className="text-red-500 shrink-0" size={20} />
           <p className="text-[10px] text-red-800 font-bold uppercase leading-tight">
              Delete {selectedOrg?.name}? All data will be permanently removed.
           </p>
        </div>
      </Modal>

      {/* Modern Header with Gradient Background */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-secondary via-primary to-blue-600 rounded-2xl p-8 text-white shadow-lg border border-white/10 overflow-hidden relative"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl font-black text-white mb-2">Organizations</h1>
             <p className="text-sm text-white/80 font-medium">Manage all client organizations and their statuses.</p>
          </div>
          <div className="flex items-center gap-3">
             <motion.div
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
             >
               
             </motion.div>
             <motion.div
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
             >
               <Button 
               variant="secondary"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3 text-[11px] font-black uppercase tracking-widest bg-white/20 border border-white/30 text-white hover:bg-white/30 shadow-lg backdrop-blur-sm"
               >
                  <RiAddLine size={18} /> Create Organization
               </Button>
             </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Filters & Search */}
      <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-gray-50 p-1 rounded-lg w-fit border border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'bg-white text-primary shadow-sm border border-gray-100'
                  : 'text-gray-400 hover:text-secondary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-secondary w-full md:w-48 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-300 uppercase"
            />
          </div>
          <button className="p-1.5 bg-white border border-gray-100 text-gray-400 hover:text-secondary rounded-lg transition-all shadow-sm">
            <RiFilter3Line size={16} />
          </button>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 text-[9px] uppercase text-gray-400 tracking-widest font-bold border-b border-gray-50">
              <tr>
                <th className="px-5 py-3 text-left">Organization</th>
                <th className="px-5 py-3 text-left">Tier</th>
                <th className="px-5 py-3 text-center">Users</th>
                <th className="px-5 py-3 text-center">Cases</th>
                <th className="px-5 py-3 text-center">Storage</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-gray-50 border border-gray-100 rounded flex items-center justify-center text-gray-400 font-black text-[9px] group-hover:bg-primary group-hover:text-white transition-all">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-secondary text-xs">{org.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{org.country}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                      org.plan === 'Enterprise' ? 'bg-primary/5 text-primary border-primary/10' :
                      org.plan === 'Pro' ? 'bg-secondary/5 text-secondary border-secondary/10' : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center font-bold text-secondary text-xs">{org.users}</td>
                  <td className="px-5 py-3 text-center font-bold text-secondary text-xs">{org.cases}</td>
                  <td className="px-5 py-3 text-center text-[9px] font-bold text-gray-300 uppercase">{org.storage}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      org.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                      org.status === 'Trial' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleLoginAs(org)}
                        title="Impersonate"
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      >
                        <RiLoginBoxLine size={17} />
                      </button>
                      <button 
                        onClick={() => { setSelectedOrg({ ...org }); setIsEditModalOpen(true); }}
                        title="Edit"
                        className="p-1.5 text-gray-500 hover:text-secondary hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <RiEditLine size={17} />
                      </button>
                      <button 
                        onClick={() => { setSelectedOrg(org); setIsDeleteModalOpen(true); }}
                        title="Delete"
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <RiDeleteBin6Line size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{filteredOrgs.length} results</p>
          <div className="flex gap-2">
            <button disabled className="px-3 py-1 rounded-lg text-[9px] font-bold uppercase bg-white border border-gray-200 text-gray-300">Prev</button>
            <button className="px-3 py-1 rounded-lg text-[9px] font-bold uppercase bg-white border border-gray-200 text-secondary hover:bg-gray-50 transition-all shadow-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminOrganisations;
