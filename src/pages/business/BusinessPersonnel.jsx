import React, { useState, useMemo, useEffect } from 'react';
import { User, Plus, Users, Briefcase, Trash2, Eye, Pencil, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from "../../components/Modal";
import { getBusinessProfile, updateKeyPersonnel } from "../../services/businessProfileApi";
import { useToast } from "../../context/ToastContext";

const BusinessPersonnel = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [authorisingOfficer, setAuthorisingOfficer] = useState({
    name: '',
    phone: '',
    email: '',
    jobTitle: ''
  });

  const [keyContact, setKeyContact] = useState({
    name: '',
    phone: '',
    email: '',
    department: ''
  });

  const [level1Users, setLevel1Users] = useState([]);

  const [hrManager, setHrManager] = useState({
    name: '',
    phone: '',
    email: '',
    jobTitle: ''
  });

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const res = await getBusinessProfile();
      if (res.data.status === "success") {
        const p = res.data.data.profile || {};

        setAuthorisingOfficer({
          name: p.authorisingName || "",
          phone: p.authorisingPhone || "",
          email: p.authorisingEmail || "",
          jobTitle: p.authorisingJobTitle || ""
        });

        setKeyContact({
          name: p.keyContactName || "",
          phone: p.keyContactPhone || "",
          email: p.keyContactEmail || "",
          department: p.keyContactDepartment || ""
        });

        setHrManager({
          name: p.hrName || "",
          phone: p.hrPhone || "",
          email: p.hrEmail || "",
          jobTitle: p.hrJobTitle || ""
        });

        // Parse Level 1 Users
        let l1 = p.level1Users || [];
        if (typeof l1 === 'string') {
          try { l1 = JSON.parse(l1); } catch (e) { l1 = []; }
        }
        setLevel1Users(Array.isArray(l1) ? l1 : []);
      }
    } catch (err) {
      showToast({ message: "Failed to load personnel data", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPersonnel();
  }, []);

  const [personModal, setPersonModal] = useState({ open: false, mode: "view", target: null });
  const [personDraft, setPersonDraft] = useState({ name: "", phone: "", email: "", jobTitle: "", department: "" });

  const [userModal, setUserModal] = useState({ open: false, mode: "add", index: null });
  const [userDraft, setUserDraft] = useState({ name: "", phone: "", email: "", jobTitle: "", department: "" });

  const openPersonModal = (target, mode) => {
    const base =
      target === "authorisingOfficer"
        ? { ...authorisingOfficer }
        : target === "keyContact"
          ? { ...keyContact, jobTitle: "" }
          : target === "hrManager"
            ? { ...hrManager, department: "" }
            : { name: "", phone: "", email: "", jobTitle: "", department: "" };
    setPersonDraft({
      name: base.name ?? "",
      phone: base.phone ?? "",
      email: base.email ?? "",
      jobTitle: base.jobTitle ?? "",
      department: base.department ?? "",
    });
    setPersonModal({ open: true, mode, target });
  };

  const closePersonModal = () => setPersonModal({ open: false, mode: "view", target: null });

  const savePersonDraft = async () => {
    if (!personDraft.name?.trim() || !personDraft.email?.trim() || !personDraft.phone?.trim()) {
      showToast({ message: "Please fill in all required fields (name, phone, email)", variant: "warning" });
      return;
    }

    let updatedAuthorising = { ...authorisingOfficer };
    let updatedKeyContact = { ...keyContact };
    let updatedHrManager = { ...hrManager };

    if (personModal.target === "authorisingOfficer") {
      updatedAuthorising = { ...updatedAuthorising, ...personDraft };
      setAuthorisingOfficer(updatedAuthorising);
    } else if (personModal.target === "keyContact") {
      updatedKeyContact = {
        ...updatedKeyContact,
        name: personDraft.name,
        phone: personDraft.phone,
        email: personDraft.email,
        department: personDraft.department,
      };
      setKeyContact(updatedKeyContact);
    } else if (personModal.target === "hrManager") {
      updatedHrManager = {
        ...updatedHrManager,
        name: personDraft.name,
        phone: personDraft.phone,
        email: personDraft.email,
        jobTitle: personDraft.jobTitle,
      };
      setHrManager(updatedHrManager);
    }

    closePersonModal();

    // Auto-save to backend
    await persistChanges({
      authorisingOfficer: updatedAuthorising,
      keyContact: updatedKeyContact,
      hrManager: updatedHrManager,
      level1Users
    });
  };

  const openAdd = () => {
    setUserDraft({ name: "", phone: "", email: "", jobTitle: "", department: "" });
    setUserModal({ open: true, mode: "add", index: null });
  };

  const openView = (index) => {
    setUserDraft({ ...level1Users[index] });
    setUserModal({ open: true, mode: "view", index });
  };

  const openEdit = (index) => {
    setUserDraft({ ...level1Users[index] });
    setUserModal({ open: true, mode: "edit", index });
  };

  const closeUserModal = () => {
    setUserModal({ open: false, mode: "add", index: null });
  };

  const removeLevel1User = async (index) => {
    const updated = level1Users.filter((_, i) => i !== index);
    setLevel1Users(updated);

    await persistChanges({
      authorisingOfficer,
      keyContact,
      hrManager,
      level1Users: updated
    });
  };

  const saveUserDraft = async () => {
    if (!userDraft.name?.trim() || !userDraft.email?.trim() || !userDraft.phone?.trim()) {
      showToast({ message: "Please fill in all required fields", variant: "warning" });
      return;
    }

    let updatedUsers = [...level1Users];
    if (userModal.mode === "add") {
      updatedUsers = [...updatedUsers, { ...userDraft }];
    } else if (userModal.mode === "edit" && typeof userModal.index === "number") {
      updatedUsers = updatedUsers.map((u, i) => (i === userModal.index ? { ...userDraft } : u));
    }

    setLevel1Users(updatedUsers);
    closeUserModal();

    await persistChanges({
      authorisingOfficer,
      keyContact,
      hrManager,
      level1Users: updatedUsers
    });
  };

  const persistChanges = async (data) => {
    try {
      setSaving(true);
      const payload = {
        authorisingName: data.authorisingOfficer.name,
        authorisingPhone: data.authorisingOfficer.phone,
        authorisingEmail: data.authorisingOfficer.email,
        authorisingJobTitle: data.authorisingOfficer.jobTitle,
        keyContactName: data.keyContact.name,
        keyContactPhone: data.keyContact.phone,
        keyContactEmail: data.keyContact.email,
        keyContactDepartment: data.keyContact.department,
        hrName: data.hrManager.name,
        hrPhone: data.hrManager.phone,
        hrEmail: data.hrManager.email,
        hrJobTitle: data.hrManager.jobTitle,
        level1Users: data.level1Users
      };

      const res = await updateKeyPersonnel(payload);
      if (res.data.status === "success") {
        showToast({ message: "Changes saved successfully!", variant: "success" });
      }
    } catch (err) {
      showToast({ message: "Failed to save changes", variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const filteredLevel1Users = useMemo(() => level1Users, [level1Users]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-bold text-gray-500">Loading personnel data...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5 pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={cardVariants} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
            <Users className="text-primary shrink-0" size={26} />
            Key Personnel
          </h1>
          <p className="text-primary font-bold text-sm mt-0.5">
            Manage your company's key personnel for UKVI sponsor licence compliance.
          </p>
        </div>
        {saving && (
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
            <Loader2 size={14} className="animate-spin" /> Saving…
          </span>
        )}
      </motion.div>

      {/* Guidance */}
      <motion.div variants={cardVariants} className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
        <p className="text-sm font-medium text-gray-600">
          These are the people responsible for managing your sponsor licence. Keep their details up to date —
          <span className="font-bold text-secondary"> your changes are saved automatically</span> each time you edit a section.
        </p>
      </motion.div>

      {/* Form Container */}
      <motion.div
        className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative"
        variants={cardVariants}
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="p-5">
          <h2 className="text-sm font-black text-secondary flex items-center gap-2 mb-4">
            <User size={15} className="text-primary" />
            Key Personnel Details
          </h2>

          <div className="space-y-4">
            {/* Authorising Officer Section */}
            <motion.div
              className="border-b border-gray-200 pb-4"
              variants={cardVariants}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Authorising Officer</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openPersonModal("authorisingOfficer", "view")}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
                    title="View"
                    aria-label="View"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openPersonModal("authorisingOfficer", "edit")}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
                    title="Edit"
                    aria-label="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Name</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Phone</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Email</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Job Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-sm font-black text-secondary whitespace-nowrap">{authorisingOfficer.name || "—"}</td>
                      <td className="px-3 py-2 text-sm font-bold text-gray-700 whitespace-nowrap">{authorisingOfficer.phone || "—"}</td>
                      <td className="px-3 py-2 text-sm font-bold text-gray-700 whitespace-nowrap">{authorisingOfficer.email || "—"}</td>
                      <td className="px-3 py-2 text-sm font-bold text-gray-700 whitespace-nowrap">{authorisingOfficer.jobTitle || "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Key Contact Section */}
            <motion.div
              className="border-b border-gray-200 pb-4"
              variants={cardVariants}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Key Contact</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openPersonModal("keyContact", "view")}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
                    title="View"
                    aria-label="View"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openPersonModal("keyContact", "edit")}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
                    title="Edit"
                    aria-label="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Name</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Phone</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Email</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-sm font-black text-secondary whitespace-nowrap">{keyContact.name || "—"}</td>
                      <td className="px-3 py-2 text-sm font-bold text-gray-700 whitespace-nowrap">{keyContact.phone || "—"}</td>
                      <td className="px-3 py-2 text-sm font-bold text-gray-700 whitespace-nowrap">{keyContact.email || "—"}</td>
                      <td className="px-3 py-2 text-sm font-bold text-gray-700 whitespace-nowrap">{keyContact.department || "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* HR Manager Section */}
            <motion.div
              className="border-b border-gray-200 pb-4"
              variants={cardVariants}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Briefcase size={12} className="text-primary" />
                  HR Manager
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openPersonModal("hrManager", "view")}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
                    title="View"
                    aria-label="View"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openPersonModal("hrManager", "edit")}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
                    title="Edit"
                    aria-label="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Name</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Phone</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Email</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Job Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-sm font-black text-secondary whitespace-nowrap">{hrManager.name || "—"}</td>
                      <td className="px-3 py-2 text-sm font-bold text-gray-700 whitespace-nowrap">{hrManager.phone || "—"}</td>
                      <td className="px-3 py-2 text-sm font-bold text-gray-700 whitespace-nowrap">{hrManager.email || "—"}</td>
                      <td className="px-3 py-2 text-sm font-bold text-gray-700 whitespace-nowrap">{hrManager.jobTitle || "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Level 1 Users Section */}
            <motion.div variants={cardVariants}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Users size={12} className="text-primary" />
                  Level 1 Users (SMS Access)
                </span>
                <button
                  type="button"
                  onClick={openAdd}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white hover:bg-primary-dark transition shadow-sm"
                >
                  <Plus size={13} />
                  Add User
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Name</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Phone</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Email</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Job Title</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Department</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLevel1Users.map((u, index) => (
                      <tr key={`${u.email}-${index}`} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 text-sm font-black text-secondary whitespace-nowrap">{u.name || "—"}</td>
                        <td className="px-3 py-2 text-sm font-bold text-gray-700 whitespace-nowrap">{u.phone || "—"}</td>
                        <td className="px-3 py-2 text-sm font-bold text-gray-700 whitespace-nowrap">{u.email || "—"}</td>
                        <td className="px-3 py-2 text-sm font-bold text-gray-700 whitespace-nowrap">{u.jobTitle || "—"}</td>
                        <td className="px-3 py-2 text-sm font-bold text-gray-700 whitespace-nowrap">{u.department || "—"}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openView(index)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
                              title="View"
                              aria-label="View"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(index)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
                              title="Edit"
                              aria-label="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeLevel1User(index)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                              title="Delete"
                              aria-label="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredLevel1Users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-sm font-bold text-gray-500">
                          No users yet. Click "Add User".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <Modal
        open={userModal.open}
        onClose={closeUserModal}
        title={
          userModal.mode === "view"
            ? "View Level 1 User"
            : userModal.mode === "edit"
              ? "Edit Level 1 User"
              : "Add Level 1 User"
        }
        maxWidthClass="max-w-3xl"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeUserModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-black text-gray-700 hover:bg-gray-50 transition"
            >
              Close
            </button>
            {userModal.mode !== "view" && (
              <button
                type="button"
                onClick={saveUserDraft}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white hover:bg-primary-dark transition shadow-sm"
              >
                Save
              </button>
            )}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">Name *</label>
            <input
              value={userDraft.name}
              disabled={userModal.mode === "view"}
              onChange={(e) => setUserDraft((p) => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 disabled:opacity-70"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">Phone *</label>
            <input
              value={userDraft.phone}
              disabled={userModal.mode === "view"}
              onChange={(e) => setUserDraft((p) => ({ ...p, phone: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 disabled:opacity-70"
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">Email *</label>
            <input
              value={userDraft.email}
              disabled={userModal.mode === "view"}
              onChange={(e) => setUserDraft((p) => ({ ...p, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 disabled:opacity-70"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">Job Title</label>
            <input
              value={userDraft.jobTitle}
              disabled={userModal.mode === "view"}
              onChange={(e) => setUserDraft((p) => ({ ...p, jobTitle: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 disabled:opacity-70"
              placeholder="Enter job title"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">Department</label>
            <input
              value={userDraft.department}
              disabled={userModal.mode === "view"}
              onChange={(e) => setUserDraft((p) => ({ ...p, department: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 disabled:opacity-70"
              placeholder="Enter department"
            />
          </div>
        </div>
        {userModal.mode !== "view" && (
          <p className="mt-3 text-[11px] font-bold text-gray-500">
            Required: Name, Phone, Email
          </p>
        )}
      </Modal>

      <Modal
        open={personModal.open}
        onClose={closePersonModal}
        title={
          personModal.target === "authorisingOfficer"
            ? personModal.mode === "edit"
              ? "Edit Authorising Officer"
              : "View Authorising Officer"
            : personModal.target === "keyContact"
              ? personModal.mode === "edit"
                ? "Edit Key Contact"
                : "View Key Contact"
              : personModal.target === "hrManager"
                ? personModal.mode === "edit"
                  ? "Edit HR Manager"
                  : "View HR Manager"
                : "Details"
        }
        maxWidthClass="max-w-3xl"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closePersonModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-black text-gray-700 hover:bg-gray-50 transition"
            >
              Close
            </button>
            {personModal.mode === "edit" && (
              <button
                type="button"
                onClick={savePersonDraft}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white hover:bg-primary-dark transition shadow-sm"
              >
                Save
              </button>
            )}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">Name *</label>
            <input
              value={personDraft.name}
              disabled={personModal.mode !== "edit"}
              onChange={(e) => setPersonDraft((p) => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 disabled:opacity-70"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">Phone *</label>
            <input
              value={personDraft.phone}
              disabled={personModal.mode !== "edit"}
              onChange={(e) => setPersonDraft((p) => ({ ...p, phone: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 disabled:opacity-70"
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">Email *</label>
            <input
              value={personDraft.email}
              disabled={personModal.mode !== "edit"}
              onChange={(e) => setPersonDraft((p) => ({ ...p, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 disabled:opacity-70"
              placeholder="Enter email address"
            />
          </div>
          {personModal.target === "keyContact" ? (
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">Department</label>
              <input
                value={personDraft.department}
                disabled={personModal.mode !== "edit"}
                onChange={(e) => setPersonDraft((p) => ({ ...p, department: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 disabled:opacity-70"
                placeholder="Enter department"
              />
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">Job Title</label>
              <input
                value={personDraft.jobTitle}
                disabled={personModal.mode !== "edit"}
                onChange={(e) => setPersonDraft((p) => ({ ...p, jobTitle: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 disabled:opacity-70"
                placeholder="Enter job title"
              />
            </div>
          )}
        </div>
      </Modal>
    </motion.div>
  );
};

export default BusinessPersonnel;
