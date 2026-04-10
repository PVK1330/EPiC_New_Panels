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
} from "lucide-react";
import Modal from "../../components/Modal";
import BusinessRegistration from "./BusinessRegistration";

const STORAGE_KEY = "businessRegistration";
const MOCK_REGISTRATION = {
  companyName: "TechNova Ltd",
  tradingName: "TechNova",
  registrationNumber: "08472931",
  sponsorLicenceNumber: "ABC123456",
  licenceRating: "Gold",
  industrySector: "Information Technology",
  yearEstablished: "2016",
  website: "https://www.technova.example",

  registeredAddress: "1 Canary Wharf",
  tradingAddress: "45 Broad Street",
  city: "London",
  state: "Greater London",
  country: "United Kingdom",
  postalCode: "E14 5AB",

  authorisingName: "Helen Wright",
  authorisingPhone: "+44 20 7000 1001",
  authorisingEmail: "helen.wright@technova.example",

  keyContactName: "Marcus Bell",
  keyContactPhone: "+44 121 555 0200",
  keyContactEmail: "marcus.bell@technova.example",

  level1Users: [
    { name: "Michael Brown", phone: "+44 20 7456 1234", email: "michael.brown@technova.example" },
    { name: "Emma Davis", phone: "+44 20 7234 5678", email: "emma.davis@technova.example" },
  ],

  hrName: "David Wilson",
  hrEmail: "david.wilson@technova.example",
  hrPhone: "+44 20 7890 1234",
  licenceIssueDate: "2024-04-01",
  licenceExpiryDate: "2028-04-01",
  cosAllocation: "50",
  licenceStatus: "Active",

  billingName: "Finance Team",
  billingEmail: "finance@technova.example",
  billingPhone: "+44 20 7000 1099",
  outstandingBalance: "£12,400",
  paymentTerms: "Net 30",

  // Ownership
  ownershipType: "Private Limited Company",
  shareholders: [
    { name: "John Smith", percentage: "45%" },
    { name: "Sarah Johnson", percentage: "30%" },
    { name: "Other Investors", percentage: "25%" },
  ],
  directors: [
    { name: "John Smith", position: "Chairman" },
    { name: "Sarah Johnson", position: "CEO" },
  ],
};

const BusinessProfile = () => {
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  
  // Modal states for individual sections
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [keyPersonModalOpen, setKeyPersonModalOpen] = useState(false);
  const [ownershipModalOpen, setOwnershipModalOpen] = useState(false);
  
  // Draft states for editing
  const [addressDraft, setAddressDraft] = useState({});
  const [keyPersonDraft, setKeyPersonDraft] = useState({});
  const [ownershipDraft, setOwnershipDraft] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setRegistrationData(MOCK_REGISTRATION);
        return;
      }
      setRegistrationData(JSON.parse(raw) || MOCK_REGISTRATION);
    } catch {
      setRegistrationData(MOCK_REGISTRATION);
    }
  }, []);

  const hasRegistration = useMemo(
    () => Boolean(registrationData && Object.keys(registrationData).length > 0),
    [registrationData],
  );

  const saveRegistration = (data) => {
    setRegistrationData(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
    setRegistrationOpen(false);
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

  const saveAddress = () => {
    setRegistrationData((prev) => ({ ...prev, ...addressDraft }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...registrationData, ...addressDraft }));
    } catch {
      // ignore
    }
    setAddressModalOpen(false);
  };

  // Key Person handlers
  const openKeyPersonModal = () => {
    setKeyPersonDraft({
      authorisingName: registrationData?.authorisingName || "",
      authorisingPhone: registrationData?.authorisingPhone || "",
      authorisingEmail: registrationData?.authorisingEmail || "",
      keyContactName: registrationData?.keyContactName || "",
      keyContactPhone: registrationData?.keyContactPhone || "",
      keyContactEmail: registrationData?.keyContactEmail || "",
    });
    setKeyPersonModalOpen(true);
  };

  const saveKeyPerson = () => {
    setRegistrationData((prev) => ({ ...prev, ...keyPersonDraft }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...registrationData, ...keyPersonDraft }));
    } catch {
      // ignore
    }
    setKeyPersonModalOpen(false);
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

  const saveOwnership = () => {
    setRegistrationData((prev) => ({ ...prev, ...ownershipDraft }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...registrationData, ...ownershipDraft }));
    } catch {
      // ignore
    }
    setOwnershipModalOpen(false);
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
                <Field label="Key Contact Name" value={registrationData?.keyContactName} />
                <Field label="Key Contact Phone" value={registrationData?.keyContactPhone} />
                <Field label="Key Contact Email" value={registrationData?.keyContactEmail} />
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="HR Manager Name" value={registrationData?.hrName} />
                <Field label="HR Manager Phone" value={registrationData?.hrPhone} />
                <Field label="HR Manager Email" value={registrationData?.hrEmail} />
                <Field label="Licence Issue Date" value={registrationData?.licenceIssueDate} />
                <Field label="Licence Expiry Date" value={registrationData?.licenceExpiryDate} />
                <Field label="CoS Allocation" value={registrationData?.cosAllocation} />
                <Field label="Licence Status" value={registrationData?.licenceStatus} />
              </div>
            </div>

            {/* Billing Info */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Billing Name" value={registrationData?.billingName} />
                <Field label="Billing Email" value={registrationData?.billingEmail} />
                <Field label="Billing Phone" value={registrationData?.billingPhone} />
                <Field label="Outstanding Balance" value={registrationData?.outstandingBalance} />
                <Field label="Payment Terms" value={registrationData?.paymentTerms} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="space-y-4">
          <h4 className="text-sm font-black text-secondary">Authorising Officer</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Name</label>
              <input
                value={keyPersonDraft.authorisingName}
                onChange={(e) => setKeyPersonDraft({ ...keyPersonDraft, authorisingName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Phone</label>
              <input
                value={keyPersonDraft.authorisingPhone}
                onChange={(e) => setKeyPersonDraft({ ...keyPersonDraft, authorisingPhone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter phone"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Email</label>
              <input
                value={keyPersonDraft.authorisingEmail}
                onChange={(e) => setKeyPersonDraft({ ...keyPersonDraft, authorisingEmail: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter email"
              />
            </div>
          </div>
          <h4 className="text-sm font-black text-secondary mt-4">Key Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Name</label>
              <input
                value={keyPersonDraft.keyContactName}
                onChange={(e) => setKeyPersonDraft({ ...keyPersonDraft, keyContactName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Phone</label>
              <input
                value={keyPersonDraft.keyContactPhone}
                onChange={(e) => setKeyPersonDraft({ ...keyPersonDraft, keyContactPhone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter phone"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Email</label>
              <input
                value={keyPersonDraft.keyContactEmail}
                onChange={(e) => setKeyPersonDraft({ ...keyPersonDraft, keyContactEmail: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter email"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Ownership Edit Modal */}
      <Modal
        open={ownershipModalOpen}
        onClose={() => setOwnershipModalOpen(false)}
        title="Edit Ownership Structure"
        maxWidthClass="max-w-2xl"
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
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2 block">Ownership Type</label>
            <input
              value={ownershipDraft.ownershipType}
              onChange={(e) => setOwnershipDraft({ ...ownershipDraft, ownershipType: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="Enter ownership type"
            />
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
    </div>
  );
};

export default BusinessProfile;