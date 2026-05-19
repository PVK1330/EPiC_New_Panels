import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiSearchLine,
  RiFilter3Line,
  RiErrorWarningLine,
  RiEditLine,
  RiDeleteBin6Line,
  RiLoginBoxLine,
  RiAddLine,
  RiEyeLine,
} from 'react-icons/ri';
import CreateOrganizationModal from '../../components/superadmin/CreateOrganizationModal';
import Button from '../../components/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/Input';
import TableActionButton from '../../components/common/TableActionButton';
import {
  fetchOrganisations,
  fetchOrganisationById,
  createOrganisation,
  updateOrganisation,
  deleteOrganisation,
  createOrganisationAdmin,
  impersonateOrganisation,
} from '../../services/superadminOrganisation.service';
import { getOrganisationSubdomainLabel } from '../../utils/organisationHost';
import { getAuthUserAndToken, getDashboardRouteForUser } from '../../utils/authResponse';
import { getToken, getUser, saveImpersonatorSession } from '../../utils/storage';
import { buildTenantHandoffUrl } from '../../utils/organisationHost';

const capitalize = (s) =>
  s && typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const mapApiOrgToRow = (o) => ({
  id: o.id,
  name: o.name,
  slug: o.slug,
  plan: capitalize(o.plan?.name || o.plan || 'Starter'),
  users: Array.isArray(o.users) ? o.users.length : 0,
  cases: 0,
  storage: '—',
  status: capitalize(o.status || 'trial'),
  country: o.country || '—',
  primaryEmail: o.primaryEmail,
  _raw: o,
});

const SuperadminOrganisations = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [actionLoading, setActionLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewOrg, setViewOrg] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOrganisations();
      const list = res.data?.data?.organisations ?? res.data?.organisations ?? [];
      setOrgs(Array.isArray(list) ? list.map(mapApiOrgToRow) : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Failed to load organisations');
      setOrgs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  const tabs = ['All', 'Active', 'Trial', 'Suspended'];

  const filteredOrgs = orgs.filter(org => {
    const tab = activeTab.toLowerCase();
    const st = (org.status || '').toLowerCase();
    const matchesTab = activeTab === 'All' || st === tab.toLowerCase();
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         org.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(org.country).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateOrg = async (data) => {
    if (!data.adminFirstName?.trim() || !data.adminLastName?.trim()) {
      throw new Error('Administrator first and last name are required');
    }
    const orgRes = await createOrganisation({
      name: data.name.trim(),
      slug: data.slug?.trim() || undefined,
      primaryEmail: data.primaryEmail.trim(),
      country: data.country?.trim() || null,
      plan: data.plan || 'starter',
      status: 'trial',
    });
    const created = orgRes.data?.data?.organisation ?? orgRes.data?.organisation;
    if (!created?.id) {
      throw new Error(orgRes.data?.message || 'Organisation create failed');
    }
    const adminRes = await createOrganisationAdmin(created.id, {
      email: data.adminEmail.trim().toLowerCase(),
      first_name: data.adminFirstName.trim(),
      last_name: data.adminLastName.trim(),
      country_code: (data.adminCountryCode || '+44').trim(),
      mobile: String(data.adminMobile || '').replace(/\s/g, '') || '0000000001',
    });
    const inner = adminRes.data?.data ?? adminRes.data;
    const welcome = inner?.welcome_email;
    const tempPw = inner?.temporary_password;
    if (welcome?.sent) {
      toast.success(`Organisation created. Login details emailed to ${data.adminEmail.trim().toLowerCase()}`);
    } else if (tempPw) {
      toast.success(`Organisation created. Email not configured — admin password: ${tempPw}`, { duration: 14000 });
    } else {
      toast.success('Organisation and admin created');
    }
    await loadOrgs();
  };

  const handleEditOrg = async () => {
    if (!selectedOrg?.id) return;
    try {
      await updateOrganisation(selectedOrg.id, {
        name: selectedOrg.name?.trim(),
        plan: (selectedOrg.plan || 'starter').toLowerCase(),
        status: (selectedOrg.status || 'active').toLowerCase(),
      });
      toast.success('Organisation updated');
      await loadOrgs();
      setIsEditModalOpen(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Update failed');
    }
  };

  const handleDeleteOrg = async () => {
    if (!selectedOrg?.id) return;
    setActionLoading(true);
    try {
      await deleteOrganisation(selectedOrg.id);
      toast.success('Organisation permanently deleted');
      await loadOrgs();
      setIsDeleteModalOpen(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openView = async (org) => {
    setIsViewModalOpen(true);
    setViewLoading(true);
    setViewOrg(null);
    try {
      const res = await fetchOrganisationById(org.id);
      const detail = res.data?.data?.organisation ?? res.data?.organisation;
      setViewOrg(detail || org._raw || org);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Failed to load details');
      setViewOrg(org._raw || org);
    } finally {
      setViewLoading(false);
    }
  };

  const handleLoginAs = async (org) => {
    setActionLoading(true);
    try {
      const res = await impersonateOrganisation(org.id);
      const inner = res.data?.data ?? res.data;
      const { user, token } = getAuthUserAndToken(res.data);
      if (!token || !user) throw new Error(res.data?.message || 'Impersonation failed');
      const slug = inner?.organisation?.slug || org.slug;
      const superToken = getToken();
      const superUser = getUser();
      if (superToken && superUser) saveImpersonatorSession(superToken, superUser);
      window.location.href = buildTenantHandoffUrl(slug, {
        token,
        user,
        nextPath: getDashboardRouteForUser(user),
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Login as failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      <CreateOrganizationModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreateOrg}
      />

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="View organisation"
        subtitle={viewOrg?.name || 'Details'}
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            {viewOrg && (
              <Button onClick={() => { setIsViewModalOpen(false); handleLoginAs(mapApiOrgToRow(viewOrg)); }}>
                <RiLoginBoxLine className="inline mr-1" size={16} />
                Login as
              </Button>
            )}
          </div>
        }
      >
        {viewLoading ? (
          <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>
        ) : viewOrg ? (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Name</dt>
              <dd className="font-bold text-secondary text-right">{viewOrg.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Slug</dt>
              <dd className="font-mono text-xs text-secondary">{viewOrg.slug}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Email</dt>
              <dd className="font-medium text-secondary">{viewOrg.primaryEmail}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Country</dt>
              <dd className="font-medium text-secondary">{viewOrg.country || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Plan</dt>
              <dd className="font-medium text-secondary">{viewOrg.plan?.name || viewOrg.plan || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Status</dt>
              <dd className="font-medium text-secondary capitalize">{viewOrg.status}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Subdomain</dt>
              <dd className="font-mono text-xs text-primary">{getOrganisationSubdomainLabel(viewOrg.slug)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Users</dt>
              <dd className="font-medium text-secondary">{viewOrg.users?.length ?? 0}</dd>
            </div>
          </dl>
        ) : null}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Organisation"
        subtitle="Update organisation details."
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
            <Button onClick={handleEditOrg} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">Save Changes</Button>
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
        title="Delete Organisation"
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
        className="bg-gray-100 rounded-2xl p-8  shadow-lg border border-white/10 overflow-hidden relative"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl font-black text-red-800 mb-2">Organisations</h1>
             <p className="text-sm text-gray-500 font-medium">Manage all client organisations and their statuses.</p>
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
               
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3 text-[11px] font-black uppercase tracking-widest bg-blue-950 border border-white/30 text-gray-500shadow-lg backdrop-blur-sm"
               >
                  <RiAddLine size={18} /> Create Organisation
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
              placeholder="Search organisations..."
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

      {/* Organisations Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 text-[9px] uppercase text-gray-400 tracking-widest font-bold border-b border-gray-50">
              <tr>
                <th className="px-5 py-3 text-left">Organisation</th>
                <th className="px-5 py-3 text-left">Tier</th>
                <th className="px-5 py-3 text-center">Users</th>
                <th className="px-5 py-3 text-center">Cases</th>
                <th className="px-5 py-3 text-center">Storage</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Loading organisations…
                  </td>
                </tr>
              ) : filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                      No organisations yet
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="text-[10px] font-bold uppercase tracking-widest">
                      <RiAddLine size={16} /> Create your first organisation
                    </Button>
                  </td>
                </tr>
              ) : (
              filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50/50 transition-colors group/row">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-gray-50 border border-gray-100 rounded flex items-center justify-center text-gray-400 font-black text-[9px] group-hover/row:bg-primary group-hover/row:text-white transition-all">
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
                    <div className="flex items-center justify-end gap-0.5">
                      <TableActionButton label="View" onClick={() => openView(org)}>
                        <RiEyeLine size={17} />
                      </TableActionButton>
                      <TableActionButton
                        label="Login as"
                        onClick={() => handleLoginAs(org)}
                        disabled={actionLoading}
                      >
                        <RiLoginBoxLine size={17} />
                      </TableActionButton>
                      <TableActionButton
                        label="Edit"
                        variant="edit"
                        onClick={() => {
                          setSelectedOrg({ ...org });
                          setIsEditModalOpen(true);
                        }}
                      >
                        <RiEditLine size={17} />
                      </TableActionButton>
                      <TableActionButton
                        label="Delete"
                        variant="danger"
                        onClick={() => {
                          setSelectedOrg(org);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <RiDeleteBin6Line size={17} />
                      </TableActionButton>
                    </div>
                  </td>
                </tr>
              ))
              )}
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
