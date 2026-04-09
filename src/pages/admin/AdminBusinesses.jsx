import { useState, useMemo } from "react";
import { FiEye, FiEdit2, FiTrash2, FiSearch, FiPlus, FiDownload, FiX, FiFolder } from "react-icons/fi";
import { motion } from "framer-motion";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";

const INITIAL_BUSINESSES = [
  {
    id: 1,
    companyName: "TechNova Ltd",
    initials: "TN",
    tradingName: "TechNova",
    companiesHouseNumber: "08472931",
    sponsorLicenceNumber: "ABC123456",
    licenceStatus: "Active",
    licenceExpiry: "2027-03-15",
    licenceExpiryDisplay: "15 Mar 2027",
    sector: "Technology & IT",
    address: "1 Canary Wharf",
    city: "London",
    postcode: "E14 5AB",
    country: "United Kingdom",
    contactName: "Helen Wright",
    contactEmail: "compliance@technova.co.uk",
    contactPhone: "+44 20 7000 1001",
    annualCosAllocation: 50,
    activeCases: 12,
    sponsoredWorkers: 28,
    riskLevel: "Low",
    riskPct: 20,
    outstanding: "£12,400",
    outstandingNum: 12400,
    notes: "Tier 2 sponsor in good standing.",
    avatarBg: "bg-blue-500",
  },
  {
    id: 2,
    companyName: "GlobalHire Inc",
    initials: "GH",
    tradingName: "GlobalHire",
    companiesHouseNumber: "09211402",
    sponsorLicenceNumber: "DEF789012",
    licenceStatus: "Active",
    licenceExpiry: "2026-07-08",
    licenceExpiryDisplay: "08 Jul 2026",
    sector: "Recruitment & HR",
    address: "45 Broad Street",
    city: "Birmingham",
    postcode: "B1 2HQ",
    country: "United Kingdom",
    contactName: "Marcus Bell",
    contactEmail: "sponsor@globalhire.co.uk",
    contactPhone: "+44 121 555 0200",
    annualCosAllocation: 30,
    activeCases: 8,
    sponsoredWorkers: 14,
    riskLevel: "Medium",
    riskPct: 55,
    outstanding: "£8,200",
    outstandingNum: 8200,
    notes: "Monitor COS usage quarterly.",
    avatarBg: "bg-yellow-500",
  },
  {
    id: 3,
    companyName: "Apex Consulting",
    initials: "AC",
    tradingName: "Apex",
    companiesHouseNumber: "11833456",
    sponsorLicenceNumber: "GHI345678",
    licenceStatus: "Expiring",
    licenceExpiry: "2026-04-22",
    licenceExpiryDisplay: "22 Apr 2026",
    sector: "Management Consulting",
    address: "Unit 4 Spinningfields",
    city: "Manchester",
    postcode: "M3 3EB",
    country: "United Kingdom",
    contactName: "Rachel Stone",
    contactEmail: "licence@apexconsulting.co.uk",
    contactPhone: "+44 161 555 0300",
    annualCosAllocation: 15,
    activeCases: 3,
    sponsoredWorkers: 5,
    riskLevel: "High",
    riskPct: 78,
    outstanding: "£5,800",
    outstandingNum: 5800,
    notes: "Licence renewal application in progress.",
    avatarBg: "bg-red-500",
  },
];

const KPI_STATS = [
  { label: "Licensed Sponsors", value: 3,   bg: "bg-blue-50",   color: "text-blue-600"   },
  { label: "Active Licences",   value: 2,   bg: "bg-green-50",  color: "text-green-600"  },
  { label: "Expiring Soon",     value: 1,   bg: "bg-yellow-50", color: "text-yellow-600" },
  { label: "Total Outstanding", value: "£26.4k", bg: "bg-red-50", color: "text-red-500" },
];

const LICENCE_STATUS_OPTIONS = [
  { value: "Active",     label: "Active"     },
  { value: "Expiring",   label: "Expiring"   },
  { value: "Suspended",  label: "Suspended"  },
  { value: "Revoked",    label: "Revoked"    },
];

const RISK_LEVEL_OPTIONS = [
  { value: "Low",    label: "Low"    },
  { value: "Medium", label: "Medium" },
  { value: "High",   label: "High"   },
];

const SECTOR_OPTIONS = [
  { value: "Technology & IT",        label: "Technology & IT"        },
  { value: "Recruitment & HR",       label: "Recruitment & HR"       },
  { value: "Management Consulting",  label: "Management Consulting" },
  { value: "Financial Services",     label: "Financial Services"     },
  { value: "Healthcare",             label: "Healthcare"             },
  { value: "Education",              label: "Education"              },
  { value: "Manufacturing",          label: "Manufacturing"          },
  { value: "Other",                  label: "Other"                  },
];

const LICENCE_CHIPS = {
  Active:    "bg-green-100 text-green-700",
  Expiring:  "bg-yellow-100 text-yellow-700",
  Suspended: "bg-orange-100 text-orange-600",
  Revoked:   "bg-red-100 text-red-600",
};

const RISK_CHIPS = {
  Low:    "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High:   "bg-orange-100 text-orange-600",
  Critical: "bg-red-100 text-red-600",
};

const RISK_BAR = {
  Low:    "bg-green-500",
  Medium: "bg-yellow-500",
  High:   "bg-red-500",
};

const RISK_TEXT = {
  Low:    "text-green-600",
  Medium: "text-yellow-600",
  High:   "text-red-500",
};

const AVATAR_COLORS = [
  "bg-blue-500","bg-yellow-500","bg-red-500","bg-purple-500",
  "bg-green-500","bg-teal-500","bg-pink-500",
];

const expiryColor = (iso) => {
  if (!iso) return "text-gray-400";
  const days = (new Date(iso) - new Date()) / 86400000;
  if (days < 0)   return "text-red-500 font-bold";
  if (days < 90)  return "text-red-500";
  if (days < 180) return "text-yellow-600";
  return "text-green-600";
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
};

const EMPTY_FORM = {
  companyName: "",
  tradingName: "",
  companiesHouseNumber: "",
  sponsorLicenceNumber: "",
  licenceStatus: "Active",
  licenceExpiry: "",
  sector: "Technology & IT",
  address: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  annualCosAllocation: "",
  activeCases: "",
  sponsoredWorkers: "",
  riskLevel: "Low",
  riskPct: "20",
  outstanding: "",
  notes: "",
};

const REQUIRED = [
  "companyName",
  "sponsorLicenceNumber",
  "licenceExpiry",
  "contactEmail",
  "contactPhone",
];

const Sect = ({ label }) => (
  <div className="col-span-full mt-2 first:mt-0">
    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary pb-1.5 border-b border-primary/20">
      {label}
    </p>
  </div>
);

const AdminBusinesses = () => {
  const [businesses, setBusinesses]     = useState(INITIAL_BUSINESSES);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter]     = useState("All");
  const [modal, setModal]               = useState({ type: null, data: null });
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [errors, setErrors]             = useState({});
  const [detailTab, setDetailTab]       = useState("overview");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return businesses.filter((b) => {
      const matchSearch = !q || b.companyName.toLowerCase().includes(q) || b.tradingName.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || b.licenceStatus === statusFilter;
      const matchRisk   = riskFilter   === "All" || b.riskLevel === riskFilter;
      return matchSearch && matchStatus && matchRisk;
    });
  }, [businesses, search, statusFilter, riskFilter]);

  const openCreate = () => { setForm(EMPTY_FORM); setErrors({}); setModal({ type: "create", data: null }); };
  const openEdit   = (b) => {
    setForm({
      companyName: b.companyName,
      tradingName: b.tradingName,
      companiesHouseNumber: b.companiesHouseNumber,
      sponsorLicenceNumber: b.sponsorLicenceNumber,
      licenceStatus: b.licenceStatus,
      licenceExpiry: b.licenceExpiry,
      sector: b.sector,
      address: b.address,
      city: b.city,
      postcode: b.postcode,
      country: b.country,
      contactName: b.contactName,
      contactEmail: b.contactEmail,
      contactPhone: b.contactPhone,
      annualCosAllocation: String(b.annualCosAllocation),
      activeCases: String(b.activeCases),
      sponsoredWorkers: String(b.sponsoredWorkers),
      riskLevel: b.riskLevel,
      riskPct: String(b.riskPct),
      outstanding: b.outstanding.replace(/[£,]/g, "") ? String(b.outstandingNum) : "",
      notes: b.notes,
    });
    setErrors({});
    setModal({ type: "edit", data: b });
  };
  const openView   = (b) => setModal({ type: "view", data: b });
  const openDelete = (b) => setModal({ type: "delete", data: b });
  const closeModal = () => { setModal({ type: null, data: null }); setErrors({}); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    REQUIRED.forEach((f) => {
      if (!form[f]?.toString().trim()) errs[f] = "Required";
    });
    if (form.contactEmail && !/\S+@\S+\.\S+/.test(form.contactEmail)) errs.contactEmail = "Invalid email";
    return errs;
  };

  const parseOutstanding = (raw) => {
    const n = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
    if (Number.isNaN(n)) return { display: "£0", num: 0 };
    return { display: `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`, num: n };
  };

  const buildRecord = (id, initials, avatarBg) => {
    const { display, num } = parseOutstanding(form.outstanding);
    const riskPct = Math.min(100, Math.max(0, parseInt(form.riskPct, 10) || 0));
    return {
      id,
      companyName: form.companyName.trim(),
      initials,
      tradingName: form.tradingName.trim(),
      companiesHouseNumber: form.companiesHouseNumber.trim(),
      sponsorLicenceNumber: form.sponsorLicenceNumber.trim(),
      licenceStatus: form.licenceStatus,
      licenceExpiry: form.licenceExpiry,
      licenceExpiryDisplay: fmtDate(form.licenceExpiry),
      sector: form.sector,
      address: form.address.trim(),
      city: form.city.trim(),
      postcode: form.postcode.trim(),
      country: form.country.trim(),
      contactName: form.contactName.trim(),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      annualCosAllocation: parseInt(form.annualCosAllocation, 10) || 0,
      activeCases: parseInt(form.activeCases, 10) || 0,
      sponsoredWorkers: parseInt(form.sponsoredWorkers, 10) || 0,
      riskLevel: form.riskLevel,
      riskPct,
      outstanding: display,
      outstandingNum: num,
      notes: form.notes.trim(),
      avatarBg,
    };
  };

  const handleCreate = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const initials = form.companyName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    const avatarBg = AVATAR_COLORS[businesses.length % AVATAR_COLORS.length];
    setBusinesses((p) => [...p, buildRecord(Date.now(), initials, avatarBg)]);
    closeModal();
  };

  const handleUpdate = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const initials = form.companyName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    setBusinesses((p) =>
      p.map((b) =>
        b.id !== modal.data.id ? b : { ...buildRecord(b.id, initials, b.avatarBg), id: b.id }
      )
    );
    closeModal();
  };

  const handleDelete = () => {
    setBusinesses((p) => p.filter((b) => b.id !== modal.data.id));
    closeModal();
  };

  const isFormModal = modal.type === "create" || modal.type === "edit";

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tight">Sponsors / Businesses</h1>
          <p className="text-sm text-gray-500 mt-0.5">Licensed sponsors and their compliance status</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <FiDownload size={14} />
            Export
          </button>
          <Button onClick={openCreate} className="rounded-xl shadow-sm">
            <FiPlus size={14} />
            Add Sponsor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_STATS.map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} rounded-xl p-4 border border-gray-100`}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 flex-wrap items-start sm:items-center justify-between">
          <p className="text-sm font-black text-secondary">All Sponsors</p>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search company name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-gray-50 placeholder:text-gray-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 text-gray-600"
            >
              <option value="All">All Licence Status</option>
              {LICENCE_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 text-gray-600"
            >
              <option value="All">All Risk Levels</option>
              {RISK_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Company","Licence Status","Licence Expiry","Active Cases","Sponsored Workers","Risk Score","Outstanding","Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">No sponsors match your search.</td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${b.avatarBg}`}>{b.initials}</div>
                        <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">{b.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${LICENCE_CHIPS[b.licenceStatus] ?? "bg-gray-100 text-gray-500"}`}>{b.licenceStatus}</span>
                    </td>
                    <td className={`px-4 py-3.5 text-xs font-mono whitespace-nowrap ${expiryColor(b.licenceExpiry)}`}>{b.licenceExpiryDisplay}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-secondary whitespace-nowrap">{b.activeCases}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-secondary whitespace-nowrap">{b.sponsoredWorkers}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${RISK_BAR[b.riskLevel] ?? "bg-gray-400"}`} style={{ width: `${b.riskPct}%` }} />
                        </div>
                        <span className={`text-xs font-black ${RISK_TEXT[b.riskLevel] ?? "text-gray-500"}`}>{b.riskLevel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-mono font-bold text-red-500 whitespace-nowrap">{b.outstanding}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => openView(b)}   className="p-2 text-gray-400 hover:text-secondary hover:bg-blue-50 rounded-lg transition-colors" title="View"><FiEye size={14} /></button>
                        <button type="button" onClick={() => openEdit(b)}   className="p-2 text-gray-400 hover:text-secondary hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><FiEdit2 size={14} /></button>
                        <button type="button" onClick={() => openDelete(b)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            Showing <span className="font-bold text-secondary">{filtered.length}</span> of{" "}
            <span className="font-bold text-secondary">{businesses.length}</span> sponsors
          </p>
        </div>
      </div>

      <Modal
        open={isFormModal}
        onClose={closeModal}
        title={modal.type === "create" ? "Add Sponsor" : "Edit Sponsor"}
        maxWidthClass="max-w-2xl"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">Cancel</Button>
            <Button variant="primary" onClick={modal.type === "create" ? handleCreate : handleUpdate} className="rounded-xl">
              {modal.type === "create" ? "Create Sponsor" : "Update Sponsor"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
          <Sect label="Company" />
          <Input label="Legal Company Name" name="companyName" value={form.companyName} onChange={handleChange} placeholder="TechNova Ltd" required error={errors.companyName} />
          <Input label="Trading Name" name="tradingName" value={form.tradingName} onChange={handleChange} placeholder="TechNova" />
          <Input label="Companies House Number" name="companiesHouseNumber" value={form.companiesHouseNumber} onChange={handleChange} placeholder="08472931" />
          <Input label="Sector / Industry" name="sector" value={form.sector} onChange={handleChange} options={SECTOR_OPTIONS} />

          <Sect label="Sponsor Licence" />
          <Input label="Sponsor Licence Number" name="sponsorLicenceNumber" value={form.sponsorLicenceNumber} onChange={handleChange} placeholder="ABC123456" required error={errors.sponsorLicenceNumber} />
          <Input label="Licence Status" name="licenceStatus" value={form.licenceStatus} onChange={handleChange} options={LICENCE_STATUS_OPTIONS} />
          <Input label="Licence Expiry Date" name="licenceExpiry" type="date" value={form.licenceExpiry} onChange={handleChange} required error={errors.licenceExpiry} />

          <Sect label="Registered Address" />
          <div className="col-span-full">
            <Input label="Street Address" name="address" value={form.address} onChange={handleChange} placeholder="1 Canary Wharf" />
          </div>
          <Input label="City" name="city" value={form.city} onChange={handleChange} placeholder="London" />
          <Input label="Postcode" name="postcode" value={form.postcode} onChange={handleChange} placeholder="E14 5AB" />
          <div className="col-span-full">
            <Input label="Country" name="country" value={form.country} onChange={handleChange} placeholder="United Kingdom" />
          </div>

          <Sect label="Primary Contact" />
          <Input label="Contact Name" name="contactName" value={form.contactName} onChange={handleChange} placeholder="Helen Wright" />
          <Input label="Contact Email" name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="compliance@company.co.uk" required error={errors.contactEmail} />
          <Input label="Contact Phone" name="contactPhone" type="tel" value={form.contactPhone} onChange={handleChange} placeholder="+44 20 7000 0000" required error={errors.contactPhone} />

          <Sect label="Compliance & Metrics" />
          <Input label="Annual CoS Allocation" name="annualCosAllocation" value={form.annualCosAllocation} onChange={handleChange} placeholder="50" />
          <Input label="Active Cases" name="activeCases" value={form.activeCases} onChange={handleChange} placeholder="12" />
          <Input label="Sponsored Workers" name="sponsoredWorkers" value={form.sponsoredWorkers} onChange={handleChange} placeholder="28" />
          <Input label="Risk Level" name="riskLevel" value={form.riskLevel} onChange={handleChange} options={RISK_LEVEL_OPTIONS} />
          <Input label="Risk Score %" name="riskPct" value={form.riskPct} onChange={handleChange} placeholder="20" />
          <Input label="Outstanding Fees (£)" name="outstanding" value={form.outstanding} onChange={handleChange} placeholder="12400" />

          <Sect label="Notes" />
          <div className="col-span-full">
            <Input label="Internal Notes" name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Compliance notes, renewal deadlines…" />
          </div>
        </div>
      </Modal>

      <Modal
        open={modal.type === "view"}
        onClose={() => { closeModal(); setDetailTab("overview"); }}
        title={modal.data ? `Sponsor ${modal.data.companyName}` : ""}
        maxWidthClass="max-w-4xl"
        bodyClassName="p-0"
      >
        {modal.data && (() => {
          const b = modal.data;
          return (
            <>
              <div className="shrink-0 border-b border-gray-100 px-4 sm:px-6 py-4 bg-gray-50/80 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-black text-gray-900">
                    {b.companyName}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${LICENCE_CHIPS[b.licenceStatus] ?? "bg-gray-100 text-gray-500"}`}>
                      {b.licenceStatus}
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${RISK_CHIPS[b.riskLevel] ?? "bg-gray-100 text-gray-500"}`}>
                      {b.riskLevel} Risk
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(b)}
                  className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-secondary hover:bg-secondary/5"
                >
                  Edit sponsor
                </button>
              </div>

              <div className="shrink-0 flex gap-0 overflow-x-auto border-b border-gray-100 bg-gray-50/50 px-2 no-scrollbar">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "licence", label: "Sponsor Licence" },
                  { id: "contact", label: "Contact" },
                  { id: "metrics", label: "Metrics" },
                  { id: "documents", label: "Documents" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDetailTab(t.id)}
                    className={`shrink-0 border-b-2 px-3 sm:px-4 py-3 text-xs font-black transition-colors whitespace-nowrap ${detailTab === t.id
                        ? "border-secondary text-secondary"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
                {detailTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Company Information</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Legal Name</p>
                            <p className="text-sm font-bold text-gray-900">{b.companyName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Trading Name</p>
                            <p className="text-sm font-bold text-gray-900">{b.tradingName || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Companies House Number</p>
                            <p className="text-sm font-bold text-gray-900">{b.companiesHouseNumber || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Sector</p>
                            <p className="text-sm font-bold text-gray-900">{b.sector}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Address Information</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Street Address</p>
                            <p className="text-sm font-bold text-gray-900">{b.address || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">City</p>
                            <p className="text-sm font-bold text-gray-900">{b.city}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Postcode</p>
                            <p className="text-sm font-bold text-gray-900">{b.postcode}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Country</p>
                            <p className="text-sm font-bold text-gray-900">{b.country}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {b.notes && (
                      <div>
                        <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Notes</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">{b.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {detailTab === "licence" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Licence Number</p>
                        <p className="text-sm font-bold text-gray-900">{b.sponsorLicenceNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Status</p>
                        <p className="text-sm font-bold text-gray-900">{b.licenceStatus}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Expiry Date</p>
                        <p className="text-sm font-bold text-gray-900">{b.licenceExpiryDisplay}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Annual CoS Allocation</p>
                        <p className="text-sm font-bold text-gray-900">{b.annualCosAllocation}</p>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === "contact" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Contact Name</p>
                        <p className="text-sm font-bold text-gray-900">{b.contactName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-bold text-gray-900">{b.contactEmail}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Phone</p>
                        <p className="text-sm font-bold text-gray-900">{b.contactPhone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === "metrics" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Active Cases</p>
                        <p className="text-sm font-bold text-gray-900">{b.activeCases}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Sponsored Workers</p>
                        <p className="text-sm font-bold text-gray-900">{b.sponsoredWorkers}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Risk Level</p>
                        <p className="text-sm font-bold text-gray-900">{b.riskLevel} ({b.riskPct}%)</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Outstanding Balance</p>
                        <p className="text-sm font-bold text-gray-900">{b.outstanding}</p>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === "documents" && (
                  <div className="text-center py-8">
                    <FiFolder size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No documents uploaded yet</p>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </Modal>

      <Modal
        open={modal.type === "delete"}
        onClose={closeModal}
        title="Delete Sponsor"
        maxWidthClass="max-w-sm"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">Cancel</Button>
            <Button variant="danger" onClick={handleDelete} className="rounded-xl">Delete</Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <FiTrash2 size={16} className="text-red-600" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete <span className="font-black text-secondary">{modal.data?.companyName}</span>? Linked candidate records may lose sponsor association.
          </p>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminBusinesses;
