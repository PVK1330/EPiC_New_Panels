import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  LayoutDashboard,
  MapPin,
  User,
  Building2,
  Pencil,
  Eye,
  Trash2,
  FileCheck,
  CreditCard,
  Folder,
  ArrowRight
} from "lucide-react";
import Modal from "../../components/Modal";
import BusinessRegistration from "./BusinessRegistration";
import {
  getBusinessProfile,
  updateBusinessProfile,
  updateKeyPersonnel,
} from "../../services/businessProfileApi";
import { useToast } from "../../context/ToastContext";


const BusinessProfile = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [registrationOpen, setRegistrationOpen] = useState(false);

  // Modal states for individual sections
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [keyPersonModalOpen, setKeyPersonModalOpen] = useState(false);
  const [ownershipModalOpen, setOwnershipModalOpen] = useState(false);
  const [hrModalOpen, setHrModalOpen] = useState(false);
  const [billingModalOpen, setBillingModalOpen] = useState(false);

  // Draft states for editing
  const [addressDraft, setAddressDraft] = useState({});
  const [keyPersonDraft, setKeyPersonDraft] = useState({});
  const [ownershipDraft, setOwnershipDraft] = useState({});
  const [hrDraft, setHrDraft] = useState({});
  const [billingDraft, setBillingDraft] = useState({});

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getBusinessProfile();
      if (res.data.status === "success") {
        const profile = res.data.data.profile;

        // Safety parse JSON fields if they come back as strings
        const jsonFields = ['level1Users', 'shareholders', 'directors'];
        jsonFields.forEach(field => {
          if (profile && typeof profile[field] === 'string') {
            try {
              profile[field] = JSON.parse(profile[field]);
            } catch (e) {
              profile[field] = [];
            }
          }
        });

        setUserData(res.data.data.user);
        setRegistrationData(profile);
      }
    } catch (err) {
      showToast({ message: "Failed to load business profile", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const hasRegistration = useMemo(
    () => Boolean(registrationData && registrationData.companyName),
    [registrationData],
  );

  const saveRegistration = async (data) => {
    try {
      setLoading(true);

      // Check if data has any files
      const hasFiles = Object.values(data).some(val => val instanceof File);
      let payload = data;

      if (hasFiles) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
          if (data[key] === null || data[key] === undefined) return;

          if (Array.isArray(data[key]) || (typeof data[key] === 'object' && !(data[key] instanceof File))) {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        });
        payload = formData;
      }

      const res = await updateBusinessProfile(payload);
      if (res.data.status === "success") {
        showToast({ message: "Profile updated successfully!", variant: "success" });
        setRegistrationData(res.data.data.profile);
        setRegistrationOpen(false);
      }
    } catch (err) {
      showToast({ message: err.response?.data?.message || "Update failed", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  // Address handlers
  const openAddressModal = () => {
    setAddressDraft({
      registeredAddress: registrationData?.registeredAddress || "",
      tradingAddress: registrationData?.tradingAddress || "",
      city: registrationData?.city || "",
      state: registrationData?.state || "",
      country: registrationData?.country || "",
      postalCode: registrationData?.postalCode || "",
    });
    setAddressModalOpen(true);
  };

  const saveAddress = async () => {
    try {
      setLoading(true);
      const res = await updateBusinessProfile(addressDraft);
      if (res.data.status === "success") {
        showToast({ message: "Address updated successfully!", variant: "success" });
        setRegistrationData(res.data.data.profile);
        setAddressModalOpen(false);
      }
    } catch (err) {
      showToast({ message: "Address update failed", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  // Key Person handlers
  const openKeyPersonModal = () => {
    setKeyPersonDraft({
      authorisingName: registrationData?.authorisingName || "",
      authorisingPhone: registrationData?.authorisingPhone || "",
      authorisingEmail: registrationData?.authorisingEmail || "",
      authorisingJobTitle: registrationData?.authorisingJobTitle || "",
      keyContactName: registrationData?.keyContactName || "",
      keyContactPhone: registrationData?.keyContactPhone || "",
      keyContactEmail: registrationData?.keyContactEmail || "",
      keyContactDepartment: registrationData?.keyContactDepartment || "",
      level1Users: registrationData?.level1Users || [],
    });
    setKeyPersonModalOpen(true);
  };

  const saveKeyPerson = async () => {
    try {
      setLoading(true);
      // Ensure level1Users is always an array
      const payload = {
        ...keyPersonDraft,
        level1Users: keyPersonDraft.level1Users || []
      };

      const res = await updateKeyPersonnel(payload);
      if (res.data.status === "success") {
        showToast({ message: "Key Personnel updated successfully!", variant: "success" });
        // After successful update, fetch the full profile to refresh UI
        await fetchProfile();
        setKeyPersonModalOpen(false);
      }
    } catch (err) {
      showToast({ message: "Key Personnel update failed", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  // Ownership handlers
  const openOwnershipModal = () => {
    setOwnershipDraft({
      ownershipType: registrationData?.ownershipType || "",
      shareholders: registrationData?.shareholders || [],
      directors: registrationData?.directors || [],
    });
    setOwnershipModalOpen(true);
  };

  const saveOwnership = async () => {
    try {
      setLoading(true);
      const res = await updateBusinessProfile(ownershipDraft);
      if (res.data.status === "success") {
        showToast({ message: "Ownership updated successfully!", variant: "success" });
        setRegistrationData(res.data.data.profile);
        setOwnershipModalOpen(false);
      }
    } catch (err) {
      showToast({ message: "Ownership update failed", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  // HR & Licence handlers
  const openHrModal = () => {
    setHrDraft({
      hrName: registrationData?.hrName || "",
      hrPhone: registrationData?.hrPhone || "",
      hrEmail: registrationData?.hrEmail || "",
      licenceIssueDate: registrationData?.licenceIssueDate || "",
      licenceExpiryDate: registrationData?.licenceExpiryDate || "",
      cosAllocation: registrationData?.cosAllocation || "",
      licenceStatus: registrationData?.licenceStatus || "",
    });
    setHrModalOpen(true);
  };

  const saveHr = async () => {
    try {
      setLoading(true);
      const res = await updateBusinessProfile(hrDraft);
      if (res.data.status === "success") {
        showToast({ message: "HR & Licence updated successfully!", variant: "success" });
        setRegistrationData(res.data.data.profile);
        setHrModalOpen(false);
      }
    } catch (err) {
      showToast({ message: "Update failed", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  // Billing handlers
  const openBillingModal = () => {
    setBillingDraft({
      billingName: registrationData?.billingName || "",
      billingPhone: registrationData?.billingPhone || "",
      billingEmail: registrationData?.billingEmail || "",
      outstandingBalance: registrationData?.outstandingBalance || "",
      paymentTerms: registrationData?.paymentTerms || "",
    });
    setBillingModalOpen(true);
  };

  const saveBilling = async () => {
    try {
      setLoading(true);
      const res = await updateBusinessProfile(billingDraft);
      if (res.data.status === "success") {
        showToast({ message: "Billing updated successfully!", variant: "success" });
        setRegistrationData(res.data.data.profile);
        setBillingModalOpen(false);
      }
    } catch (err) {
      showToast({ message: "Update failed", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  // Ownership Helpers
  const addShareholder = () => {
    setOwnershipDraft(prev => ({
      ...prev,
      shareholders: [...(prev.shareholders || []), { name: "", percentage: "" }]
    }));
  };

  const updateShareholder = (idx, field, val) => {
    const updated = [...(ownershipDraft.shareholders || [])];
    updated[idx][field] = val;
    setOwnershipDraft(prev => ({ ...prev, shareholders: updated }));
  };

  const removeShareholder = (idx) => {
    setOwnershipDraft(prev => ({
      ...prev,
      shareholders: prev.shareholders.filter((_, i) => i !== idx)
    }));
  };

  const addDirector = () => {
    setOwnershipDraft(prev => ({
      ...prev,
      directors: [...(prev.directors || []), { name: "", position: "" }]
    }));
  };

  const updateDirector = (idx, field, val) => {
    const updated = [...(ownershipDraft.directors || [])];
    updated[idx][field] = val;
    setOwnershipDraft(prev => ({ ...prev, directors: updated }));
  };

  const removeDirector = (idx) => {
    setOwnershipDraft(prev => ({
      ...prev,
      directors: prev.directors.filter((_, i) => i !== idx)
    }));
  };

  const Field = ({ label, value }) => (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/40 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-black text-secondary break-words">{value || "—"}</p>
    </div>
  );


  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Business Profile
        </h1>
        <p className="text-primary font-bold text-sm mt-1">Manage your company information.</p>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm overflow-hidden relative"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
              {userData?.profile_pic ? (
                <img
                  src={userData.profile_pic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-gray-300" />
              )}
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-secondary">
              {userData?.first_name} {userData?.last_name || ""}
            </h2>
            <p className="text-sm font-bold text-gray-500 mt-1">{userData?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                {userData?.role_name || "Business User"}
              </span>
              <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider">
                Account Active
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Company Information Section */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
            <FileText size={24} className="text-primary" />
            Company Information
          </h2>

          <button
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark"
            type="button"
            onClick={() => setRegistrationOpen(true)}
          >
            {hasRegistration ? "Edit Business Registration" : "Add Business Registration"}
          </button>
        </div>

        {hasRegistration ? (
          <div className="space-y-6">
            {/* Company Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Company Name" value={registrationData?.companyName} />
              <Field label="Trading Name" value={registrationData?.tradingName} />
              <Field label="Company Registration Number" value={registrationData?.registrationNumber} />
              <Field label="Sponsor Licence Number" value={registrationData?.sponsorLicenceNumber} />
              <Field label="Licence Rating" value={registrationData?.licenceRating} />
              <Field label="Industry Sector" value={registrationData?.industrySector} />
              <Field label="Year Established" value={registrationData?.yearEstablished} />
              <Field label="Website" value={registrationData?.website} />
            </div>

            {/* Address Section with Edit Button */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-secondary flex items-center gap-2">
                  <MapPin size={20} className="text-primary" />
                  Address Information
                </h3>
                <button
                  type="button"
                  onClick={openAddressModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-black text-white transition hover:bg-primary-dark"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Registered Address" value={registrationData?.registeredAddress} />
                <Field label="Trading Address" value={registrationData?.tradingAddress} />
                <Field label="City" value={registrationData?.city} />
                <Field label="State / Region" value={registrationData?.state} />
                <Field label="Country" value={registrationData?.country} />
                <Field label="Postal Code" value={registrationData?.postalCode} />
              </div>
            </div>

            {/* Key Person Section with Edit Button */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-secondary flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  Key Personnel
                </h3>
                <button
                  type="button"
                  onClick={openKeyPersonModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-black text-white transition hover:bg-primary-dark"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Authorising Officer Name" value={registrationData?.authorisingName} />
                <Field label="Authorising Officer Phone" value={registrationData?.authorisingPhone} />
                <Field label="Authorising Officer Email" value={registrationData?.authorisingEmail} />
                <Field label="Authorising Officer Job Title" value={registrationData?.authorisingJobTitle} />
                <Field label="Key Contact Name" value={registrationData?.keyContactName} />
                <Field label="Key Contact Phone" value={registrationData?.keyContactPhone} />
                <Field label="Key Contact Email" value={registrationData?.keyContactEmail} />
                <Field label="Key Contact Department" value={registrationData?.keyContactDepartment} />
              </div>

              {(registrationData?.level1Users || []).length > 0 && (
                <div className="mt-4 p-4 rounded-2xl border border-gray-200 bg-gray-50/40">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-3">Level 1 Users</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(registrationData.level1Users).map((u, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-black text-secondary">{u.name}</p>
                        <p className="text-[10px] font-bold text-gray-500 mt-1">{u.email}</p>
                        <p className="text-[10px] font-bold text-gray-500">{u.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ownership Section with Edit Button */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-secondary flex items-center gap-2">
                  <Building2 size={20} className="text-primary" />
                  Ownership Structure
                </h3>
                <button
                  type="button"
                  onClick={openOwnershipModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-black text-white transition hover:bg-primary-dark"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Ownership Type" value={registrationData?.ownershipType} />
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/40 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-3">Shareholders</p>
                  {(registrationData?.shareholders || []).map((s, idx) => (
                    <div key={idx} className="mb-2 last:mb-0">
                      <p className="text-sm font-black text-secondary">{s.name}</p>
                      <p className="text-xs font-bold text-gray-600">{s.percentage}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50/40 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-3">Directors</p>
                  {(registrationData?.directors || []).map((d, idx) => (
                    <div key={idx} className="mb-2 last:mb-0">
                      <p className="text-sm font-black text-secondary">{d.name}</p>
                      <p className="text-xs font-bold text-gray-600">{d.position}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* HR & Licence Info */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-secondary flex items-center gap-2">
                  <FileCheck size={20} className="text-primary" />
                  HR & Licence Information
                </h3>
                <button
                  type="button"
                  onClick={openHrModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-black text-white transition hover:bg-primary-dark"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="HR Manager Name" value={registrationData?.hrName} />
                <Field label="HR Manager Phone" value={registrationData?.hrPhone} />
                <Field label="HR Manager Email" value={registrationData?.hrEmail} />
                <Field label="HR Manager Job Title" value={registrationData?.hrJobTitle} />
                <Field label="Licence Issue Date" value={registrationData?.licenceIssueDate} />
                <Field label="Licence Expiry Date" value={registrationData?.licenceExpiryDate} />
                <Field label="CoS Allocation" value={registrationData?.cosAllocation} />
                <Field label="Licence Status" value={registrationData?.licenceStatus} />
              </div>
            </div>

            {/* Billing Info */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-secondary flex items-center gap-2">
                  <CreditCard size={20} className="text-primary" />
                  Billing Information
                </h3>
                <button
                  type="button"
                  onClick={openBillingModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-black text-white transition hover:bg-primary-dark"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Billing Name" value={registrationData?.billingName} />
                <Field label="Billing Email" value={registrationData?.billingEmail} />
                <Field label="Billing Phone" value={registrationData?.billingPhone} />
                <Field label="Outstanding Balance" value={registrationData?.outstandingBalance} />
                <Field label="Payment Terms" value={registrationData?.paymentTerms} />
              </div>
            </div>

            {/* Documents Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-black text-secondary mb-4 flex items-center gap-2">
                <Folder size={20} className="text-primary" />
                Business Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Sponsor Licence Approval', field: 'sponsorLetter' },
                  { label: 'Insurance Certificate', field: 'insuranceCertificate' },
                  { label: 'HR Policies', field: 'hrPolicies' },
                  { label: 'Organisational Chart', field: 'organisationalChart' },
                  { label: 'Recruitment Process', field: 'recruitmentDocs' },
                ].map((doc) => (
                  <div key={doc.field} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white shadow-sm">
                        <FileText size={18} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-secondary truncate">{doc.label}</p>
                        <p className="text-[10px] font-bold text-gray-500 mt-0.5">
                          {registrationData?.[doc.field] ? 'Uploaded' : 'Not Uploaded'}
                        </p>
                      </div>
                    </div>
                    {registrationData?.[doc.field] && (
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${registrationData[doc.field]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition flex-shrink-0"
                      >
                        <ArrowRight size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Level 1 Users */}
            <div className="border-t border-gray-200 pt-6">
              <div className="rounded-2xl border border-gray-200 bg-gray-50/40 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                  Level 1 Users
                </p>
                <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 bg-white">
                  <table className="min-w-full text-left divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Name</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Phone</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(registrationData?.level1Users ?? []).map((u, idx) => (
                        <tr key={`${u.email ?? "u"}-${idx}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-black text-secondary whitespace-nowrap">{u?.name || "—"}</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-700 whitespace-nowrap">{u?.phone || "—"}</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-700 whitespace-nowrap">{u?.email || "—"}</td>
                        </tr>
                      ))}
                      {(registrationData?.level1Users ?? []).length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-sm font-bold text-gray-500">
                            No Level 1 users added.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-gray-50/40 p-6 text-center">
            <p className="text-sm font-black text-secondary">No business registration saved yet.</p>
            <p className="mt-1 text-xs font-bold text-gray-500">
              Click "Add Business Registration" to fill the form and it will show here.
            </p>
          </div>
        )}
      </motion.div>

      {/* Address Edit Modal */}
      <Modal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Edit Address Information"
        maxWidthClass="max-w-2xl"
        footer={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAddressModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-black text-xs hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveAddress}
              className="px-4 py-2 rounded-xl bg-primary text-white font-black text-xs hover:bg-primary-dark transition"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2 block">Registered Address</label>
            <input
              value={addressDraft.registeredAddress}
              onChange={(e) => setAddressDraft({ ...addressDraft, registeredAddress: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="Enter registered address"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2 block">Trading Address</label>
            <input
              value={addressDraft.tradingAddress}
              onChange={(e) => setAddressDraft({ ...addressDraft, tradingAddress: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="Enter trading address"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2 block">City</label>
            <input
              value={addressDraft.city}
              onChange={(e) => setAddressDraft({ ...addressDraft, city: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2 block">State / Region</label>
            <input
              value={addressDraft.state}
              onChange={(e) => setAddressDraft({ ...addressDraft, state: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="Enter state/region"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2 block">Country</label>
            <input
              value={addressDraft.country}
              onChange={(e) => setAddressDraft({ ...addressDraft, country: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="Enter country"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2 block">Postal Code</label>
            <input
              value={addressDraft.postalCode}
              onChange={(e) => setAddressDraft({ ...addressDraft, postalCode: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="Enter postal code"
            />
          </div>
        </div>
      </Modal>

      {/* Key Person Edit Modal */}
      <Modal
        open={keyPersonModalOpen}
        onClose={() => setKeyPersonModalOpen(false)}
        title="Edit Key Personnel"
        maxWidthClass="max-w-2xl"
        footer={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setKeyPersonModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-black text-xs hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveKeyPerson}
              className="px-4 py-2 rounded-xl bg-primary text-white font-black text-xs hover:bg-primary-dark transition"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-4 p-6">
          <h4 className="text-sm font-black text-secondary">Authorising Officer</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Name</label>
              <input
                value={keyPersonDraft.authorisingName || ""}
                onChange={(e) => setKeyPersonDraft({ ...keyPersonDraft, authorisingName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Phone</label>
              <input
                value={keyPersonDraft.authorisingPhone || ""}
                onChange={(e) => setKeyPersonDraft({ ...keyPersonDraft, authorisingPhone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter phone"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Email</label>
              <input
                value={keyPersonDraft.authorisingEmail || ""}
                onChange={(e) => setKeyPersonDraft({ ...keyPersonDraft, authorisingEmail: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter email"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-gray-700 mb-2 block">Job Title</label>
              <input
                value={keyPersonDraft.authorisingJobTitle || ""}
                onChange={(e) => setKeyPersonDraft({ ...keyPersonDraft, authorisingJobTitle: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter job title"
              />
            </div>
          </div>
          <h4 className="text-sm font-black text-secondary mt-4">Key Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Name</label>
              <input
                value={keyPersonDraft.keyContactName || ""}
                onChange={(e) => setKeyPersonDraft({ ...keyPersonDraft, keyContactName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Phone</label>
              <input
                value={keyPersonDraft.keyContactPhone || ""}
                onChange={(e) => setKeyPersonDraft({ ...keyPersonDraft, keyContactPhone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter phone"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Email</label>
              <input
                value={keyPersonDraft.keyContactEmail || ""}
                onChange={(e) => setKeyPersonDraft({ ...keyPersonDraft, keyContactEmail: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter email"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-gray-700 mb-2 block">Department</label>
              <input
                value={keyPersonDraft.keyContactDepartment || ""}
                onChange={(e) => setKeyPersonDraft({ ...keyPersonDraft, keyContactDepartment: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter department"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-secondary">Level 1 Users</h4>
              <button
                type="button"
                onClick={() => {
                  const current = keyPersonDraft.level1Users || [];
                  setKeyPersonDraft({ ...keyPersonDraft, level1Users: [...current, { name: '', phone: '', email: '' }] });
                }}
                className="text-xs font-bold text-primary hover:underline"
              >
                + Add User
              </button>
            </div>
            <div className="space-y-4">
              {(keyPersonDraft.level1Users || []).map((user, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <input
                      placeholder="Name"
                      value={user.name || ""}
                      onChange={(e) => {
                        const newList = [...keyPersonDraft.level1Users];
                        newList[idx].name = e.target.value;
                        setKeyPersonDraft({ ...keyPersonDraft, level1Users: newList });
                      }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-white"
                    />
                    <input
                      placeholder="Phone"
                      value={user.phone || ""}
                      onChange={(e) => {
                        const newList = [...keyPersonDraft.level1Users];
                        newList[idx].phone = e.target.value;
                        setKeyPersonDraft({ ...keyPersonDraft, level1Users: newList });
                      }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-white"
                    />
                    <input
                      placeholder="Email"
                      value={user.email || ""}
                      onChange={(e) => {
                        const newList = [...keyPersonDraft.level1Users];
                        newList[idx].email = e.target.value;
                        setKeyPersonDraft({ ...keyPersonDraft, level1Users: newList });
                      }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newList = keyPersonDraft.level1Users.filter((_, i) => i !== idx);
                      setKeyPersonDraft({ ...keyPersonDraft, level1Users: newList });
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Ownership Edit Modal */}
      <Modal
        open={ownershipModalOpen}
        onClose={() => setOwnershipModalOpen(false)}
        title="Edit Ownership Structure"
        maxWidthClass="max-w-3xl"
        footer={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOwnershipModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-black text-xs hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveOwnership}
              className="px-4 py-2 rounded-xl bg-primary text-white font-black text-xs hover:bg-primary-dark transition"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-6 max-h-[60vh] overflow-y-auto p-6 pr-2 custom-scrollbar">
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2 block">Ownership Type</label>
            <input
              value={ownershipDraft.ownershipType || ""}
              onChange={(e) => setOwnershipDraft({ ...ownershipDraft, ownershipType: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="Enter ownership type (e.g. Private Limited)"
            />
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-secondary">Shareholders</h4>
              <button
                type="button"
                onClick={addShareholder}
                className="text-xs font-bold text-primary hover:underline"
              >
                + Add Shareholder
              </button>
            </div>
            <div className="space-y-3">
              {(ownershipDraft.shareholders || []).map((s, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      placeholder="Name"
                      value={s.name}
                      onChange={(e) => updateShareholder(idx, "name", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-secondary bg-white focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                    <input
                      placeholder="Percentage (e.g. 40%)"
                      value={s.percentage}
                      onChange={(e) => updateShareholder(idx, "percentage", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-secondary bg-white focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeShareholder(idx)}
                    className="text-red-400 hover:text-red-600 transition p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {(ownershipDraft.shareholders || []).length === 0 && (
                <p className="text-[10px] text-gray-400 italic text-center py-2">No shareholders added.</p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-secondary">Directors</h4>
              <button
                type="button"
                onClick={addDirector}
                className="text-xs font-bold text-primary hover:underline"
              >
                + Add Director
              </button>
            </div>
            <div className="space-y-3">
              {(ownershipDraft.directors || []).map((d, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      placeholder="Name"
                      value={d.name}
                      onChange={(e) => updateDirector(idx, "name", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-secondary bg-white focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                    <input
                      placeholder="Position"
                      value={d.position}
                      onChange={(e) => updateDirector(idx, "position", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-secondary bg-white focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDirector(idx)}
                    className="text-red-400 hover:text-red-600 transition p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {(ownershipDraft.directors || []).length === 0 && (
                <p className="text-[10px] text-gray-400 italic text-center py-2">No directors added.</p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Main Registration Modal */}
      <Modal
        open={registrationOpen}
        onClose={() => setRegistrationOpen(false)}
        title="Add Business Registration"
        maxWidthClass="max-w-6xl"
      >
        <BusinessRegistration embedded initialForm={registrationData} onSubmit={saveRegistration} />
      </Modal>
      {/* HR & Licence Edit Modal */}
      <Modal
        open={hrModalOpen}
        onClose={() => setHrModalOpen(false)}
        title="Edit HR & Licence Information"
        maxWidthClass="max-w-2xl"
        footer={
          <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
            <button
              onClick={() => setHrModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-secondary font-black text-xs hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={saveHr}
              className="px-4 py-2 rounded-xl bg-primary text-white font-black text-xs hover:bg-primary-dark transition"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">HR Manager Name</label>
              <input
                value={hrDraft.hrName || ""}
                onChange={(e) => setHrDraft({ ...hrDraft, hrName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">HR Manager Phone</label>
              <input
                value={hrDraft.hrPhone || ""}
                onChange={(e) => setHrDraft({ ...hrDraft, hrPhone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-700 mb-2 block">HR Manager Email</label>
              <input
                value={hrDraft.hrEmail || ""}
                onChange={(e) => setHrDraft({ ...hrDraft, hrEmail: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Licence Issue Date</label>
              <input
                type="date"
                value={hrDraft.licenceIssueDate || ""}
                onChange={(e) => setHrDraft({ ...hrDraft, licenceIssueDate: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-gray-50/40"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Licence Expiry Date</label>
              <input
                type="date"
                value={hrDraft.licenceExpiryDate || ""}
                onChange={(e) => setHrDraft({ ...hrDraft, licenceExpiryDate: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-gray-50/40"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">CoS Allocation</label>
              <input
                value={hrDraft.cosAllocation || ""}
                onChange={(e) => setHrDraft({ ...hrDraft, cosAllocation: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Licence Status</label>
              <select
                value={hrDraft.licenceStatus || ""}
                onChange={(e) => setHrDraft({ ...hrDraft, licenceStatus: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-gray-50/40"
              >
                <option value="">Select status</option>
                <option>Active</option>
                <option>Suspended</option>
                <option>Expired</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Billing Edit Modal */}
      <Modal
        open={billingModalOpen}
        onClose={() => setBillingModalOpen(false)}
        title="Edit Billing Information"
        maxWidthClass="max-w-2xl"
        footer={
          <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
            <button
              onClick={() => setBillingModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-secondary font-black text-xs hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={saveBilling}
              className="px-4 py-2 rounded-xl bg-primary text-white font-black text-xs hover:bg-primary-dark transition"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Billing Contact Name</label>
              <input
                value={billingDraft.billingName || ""}
                onChange={(e) => setBillingDraft({ ...billingDraft, billingName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-gray-50/40"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Billing Phone</label>
              <input
                value={billingDraft.billingPhone || ""}
                onChange={(e) => setBillingDraft({ ...billingDraft, billingPhone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-gray-50/40"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-700 mb-2 block">Billing Email</label>
              <input
                value={billingDraft.billingEmail || ""}
                onChange={(e) => setBillingDraft({ ...billingDraft, billingEmail: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-gray-50/40"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Outstanding Balance</label>
              <input
                value={billingDraft.outstandingBalance || ""}
                onChange={(e) => setBillingDraft({ ...billingDraft, outstandingBalance: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-gray-50/40"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Payment Terms</label>
              <select
                value={billingDraft.paymentTerms || ""}
                onChange={(e) => setBillingDraft({ ...billingDraft, paymentTerms: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-gray-50/40"
              >
                <option value="">Select terms</option>
                <option>Net 30</option>
                <option>Net 60</option>
                <option>Due on receipt</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BusinessProfile;