import React, { useState } from 'react';
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

  const filteredOrgs = activeTab === 'All' ? orgs : orgs.filter(org => org.status === activeTab);

  const handleCreateOrg = (data) => {
    console.log('Creating Org:', data);
    setIsCreateModalOpen(false);
    // In a real app, you'd call an API and then update state
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
  };

  const handleEditOrg = (data) => {
    console.log('Editing Org:', data);
    setOrgs(orgs.map(org => org.id === selectedOrg.id ? { ...org, ...data } : org));
    setIsEditModalOpen(false);
  };

  const handleDeleteOrg = () => {
    console.log('Deleting Org:', selectedOrg.id);
    setOrgs(orgs.filter(org => org.id !== selectedOrg.id));
    setIsDeleteModalOpen(false);
  };

  const handleLoginAs = (org) => {
    console.log('Impersonating:', org.name);
    // Logic to redirect or set token for the org
    alert(`Impersonating ${org.name}. Redirecting to organization dashboard...`);
  };

  return (
    <div className="space-y-6">
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
        subtitle="Modify organization details and plan."
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={() => handleEditOrg(selectedOrg)}>Save Changes</Button>
          </div>
        }
      >
        <div className="space-y-4">
           <Input 
            label="Organization Name" 
            value={selectedOrg?.name || ''} 
            onChange={(e) => setSelectedOrg({ ...selectedOrg, name: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Subscription Plan</label>
            <select 
              value={selectedOrg?.plan?.toLowerCase() || 'starter'} 
              onChange={(e) => setSelectedOrg({ ...selectedOrg, plan: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1) })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary focus:ring-2 focus:ring-primary/10 outline-none appearance-none"
            >
              <option value="starter">Starter</option>
              <option value="pro">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Status</label>
            <select 
              value={selectedOrg?.status || 'Active'} 
              onChange={(e) => setSelectedOrg({ ...selectedOrg, status: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary focus:ring-2 focus:ring-primary/10 outline-none appearance-none"
            >
              <option>Active</option>
              <option>Trial</option>
              <option>Suspended</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Organization"
        subtitle="This action is permanent and will delete all organization data."
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-600 border-red-600" onClick={handleDeleteOrg}>Delete Permanently</Button>
          </div>
        }
      >
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-4">
           <RiErrorWarningLine className="text-red-500 shrink-0" size={24} />
           <p className="text-xs text-red-800 font-medium leading-relaxed">
              Are you sure you want to delete <span className="font-bold">{selectedOrg?.name}</span>? This will immediately terminate all access and delete all associated data across the platform.
           </p>
        </div>
      </Modal>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight uppercase tracking-wider">Organizations</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">Manage and monitor all client organizations on the platform.</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={18} /> New Organization
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-gray-50 p-1 rounded-lg w-fit border border-gray-100 no-scrollbar overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
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
              placeholder="Search organizations..."
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-gray-400"
            />
          </div>
          <button className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 rounded-lg transition-all shadow-sm">
            <RiFilter3Line size={18} />
          </button>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4 text-left">Organization</th>
                <th className="px-6 py-4 text-left">Plan</th>
                <th className="px-6 py-4 text-center">Users</th>
                <th className="px-6 py-4 text-center">Cases</th>
                <th className="px-6 py-4 text-center">Storage</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-black text-base group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-secondary leading-tight">{org.name}</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-tight">
                          {org.slug}.epic-crm.com • {org.country}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                      org.plan === 'Enterprise' ? 'bg-primary/10 text-primary border border-primary/20' :
                      org.plan === 'Pro' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gray-600">{org.users}</td>
                  <td className="px-6 py-4 text-center font-bold text-gray-600">{org.cases}</td>
                  <td className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-tighter">{org.storage}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                      org.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' :
                      org.status === 'Trial' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      <span className={`w-1 h-1 rounded-full mr-1.5 ${
                        org.status === 'Active' ? 'bg-green-500' :
                        org.status === 'Trial' ? 'bg-blue-500' : 'bg-red-500'
                      }`} />
                      {org.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        title="Login As" 
                        onClick={() => handleLoginAs(org)}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      >
                        <RiLoginBoxLine size={18} />
                      </button>
                      <button 
                        title="Edit" 
                        onClick={() => { setSelectedOrg(org); setIsEditModalOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-secondary hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <RiEditLine size={18} />
                      </button>
                      <button 
                        title="Delete" 
                        onClick={() => { setSelectedOrg(org); setIsDeleteModalOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <RiDeleteBin6Line size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredOrgs.length} results</p>
          <div className="flex gap-2">
            <button disabled className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-300 transition-all">Previous</button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminOrganisations;
