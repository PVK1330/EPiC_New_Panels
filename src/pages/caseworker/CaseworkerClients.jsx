import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, X, FileText, Briefcase, Phone, Mail, Calendar, MapPin, User, Building, Check, AlertCircle, Clock } from "lucide-react";

const TABS = [
  { id: "candidates", label: "Candidate Profiles", path: "/caseworker/people/candidates" },
  { id: "sponsors", label: "Sponsor Profiles", path: "/caseworker/people/sponsors" },
];

const Badge = ({ variant = "blue", children }) => {
  const styles = {
    green: "bg-green-50 text-green-700",
    yellow: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-secondary/10 text-secondary",
    teal: "bg-teal-50 text-teal-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[variant] ?? styles.blue}`}>
      {children}
    </span>
  );
};

const CandidateCard = ({ initials, name, sub, status, track, code, accent = "secondary", onView }) => {
  const accentMap = {
    secondary: "bg-secondary/10 text-secondary",
    primary: "bg-primary/10 text-primary",
    purple: "bg-purple-100 text-purple-700",
    teal: "bg-teal-100 text-teal-700",
    amber: "bg-amber-100 text-amber-700",
  };

  const statusPill =
    status === "Active" || status === "On Track"
      ? <Badge variant="green">{status}</Badge>
      : status === "Due Soon"
        ? <Badge variant="yellow">{status}</Badge>
        : <Badge variant="red">{status}</Badge>;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:-translate-y-0.5 transition will-change-transform">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-black mb-3 ${accentMap[accent] ?? accentMap.secondary}`}>
        {initials}
      </div>
      <div className="text-base font-black text-secondary mb-1">{name}</div>
      <div className="text-sm text-gray-500 mb-3">{sub}</div>
      <div className="flex flex-wrap gap-2 items-center mb-3">
        {statusPill}
        <Badge variant="blue">{track}</Badge>
        <span className="text-[11px] font-mono text-gray-400">{code}</span>
      </div>
      <button
        onClick={() => onView && onView({ initials, name, sub, status, track, code, accent })}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-black bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors"
      >
        <Eye size={14} />
        View Details
      </button>
    </div>
  );
};

const SponsorCard = ({ code, name, sub, meta, badge = "Compliant", badgeVariant = "green", onView }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition">
    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mb-3 font-mono font-black text-secondary">
      {code}
    </div>
    <div className="text-base font-black text-secondary mb-1">{name}</div>
    <div className="text-sm text-gray-500 mb-3">{sub}</div>
    <div className="text-xs text-gray-500 mb-3">{meta}</div>
    <div className="mb-3">
      <Badge variant={badgeVariant}>{badge}</Badge>
    </div>
    <button
      onClick={() => onView && onView({ code, name, sub, meta, badge, badgeVariant })}
      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-black bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors"
    >
      <Eye size={14} />
      View Details
    </button>
  </div>
);

const CaseworkerClients = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewModal, setViewModal] = useState({ type: null, data: null });
  const [candidateActiveTab, setCandidateActiveTab] = useState("overview");
  const [sponsorActiveTab, setSponsorActiveTab] = useState("overview");

  const activeTab = useMemo(() => {
    return location.pathname.includes("/people/sponsors") ? "sponsors" : "candidates";
  }, [location.pathname]);

  const openViewModal = (type, data) => {
    setViewModal({ type, data });
    // Reset tabs when opening modal
    if (type === 'candidate') {
      setCandidateActiveTab("overview");
    } else if (type === 'sponsor') {
      setSponsorActiveTab("overview");
    }
  };

  const closeViewModal = () => {
    setViewModal({ type: null, data: null });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-secondary">Clients</h1>
        <p className="text-gray-500 mt-2">Manage candidate and sponsor profiles</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate(t.path)}
              className={`px-4 py-2 text-sm font-bold -mb-px border-b-2 transition-colors ${
                isActive
                  ? "text-secondary border-secondary"
                  : "text-gray-500 border-transparent hover:text-secondary"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "candidates" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CandidateCard initials="AR" name="Ahmed Al-Rashid" sub="Saudi Arabia · Engineer" status="Active" track="Tier 2" code="#C-2401" accent="secondary" onView={(data) => openViewModal('candidate', data)} />
          <CandidateCard initials="PS" name="Priya Sharma" sub="India · Software Developer" status="Due Soon" track="Skilled" code="#C-2398" accent="purple" onView={(data) => openViewModal('candidate', data)} />
          <CandidateCard initials="CM" name="Carlos Mendes" sub="Brazil · Project Manager" status="Overdue" track="Intra-Co" code="#C-2391" accent="primary" onView={(data) => openViewModal('candidate', data)} />
          <CandidateCard initials="MC" name="Mei Lin Chen" sub="China · Data Analyst" status="On Track" track="Graduate" code="#C-2389" accent="teal" onView={(data) => openViewModal('candidate', data)} />
          <CandidateCard initials="IP" name="Ivan Petrov" sub="Russia · Environmental Eng." status="On Track" track="Tier 2" code="#C-2385" accent="amber" onView={(data) => openViewModal('candidate', data)} />
          <CandidateCard initials="FA" name="Fatima Al-Zahra" sub="Morocco · Nurse" status="Due Soon" track="H&C" code="#C-2380" accent="secondary" onView={(data) => openViewModal('candidate', data)} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SponsorCard code="TC" name="TechCorp Ltd" sub="Technology · London" meta="1 active worker · Tier 2 sponsor" badge="Compliant" badgeVariant="green" onView={(data) => openViewModal('sponsor', data)} />
          <SponsorCard code="NG" name="Nexus Group" sub="Finance · Manchester" meta="1 active worker · Skilled sponsor" badge="Compliant" badgeVariant="green" onView={(data) => openViewModal('sponsor', data)} />
          <SponsorCard code="BR" name="BuildRight Inc" sub="Construction · Birmingham" meta="1 active worker · Intra-Co" badge="Review Due" badgeVariant="yellow" onView={(data) => openViewModal('sponsor', data)} />
          <SponsorCard code="GF" name="Global Finance" sub="Banking · London" meta="1 active worker · Graduate" badge="Compliant" badgeVariant="green" onView={(data) => openViewModal('sponsor', data)} />
          <SponsorCard code="MG" name="MediCare Group" sub="Healthcare · Leeds" meta="1 active worker · H&C Worker" badge="Compliant" badgeVariant="green" onView={(data) => openViewModal('sponsor', data)} />
          <SponsorCard code="ET" name="EnviroTech" sub="Environment · Bristol" meta="1 active worker · Tier 2" badge="Compliant" badgeVariant="green" onView={(data) => openViewModal('sponsor', data)} />
        </div>
      )}

      {/* Candidate View Modal */}
      {viewModal.type === 'candidate' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-secondary">Candidate Profile</h2>
                <button
                  onClick={closeViewModal}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Header Section */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-lg font-black ${
                  viewModal.data.accent === 'secondary' ? 'bg-secondary' :
                  viewModal.data.accent === 'primary' ? 'bg-primary' :
                  viewModal.data.accent === 'purple' ? 'bg-purple-500' :
                  viewModal.data.accent === 'teal' ? 'bg-teal-500' :
                  viewModal.data.accent === 'amber' ? 'bg-amber-500' :
                  'bg-secondary'
                }`}>
                  {viewModal.data.initials}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-secondary">{viewModal.data.name}</h3>
                  <p className="text-sm text-gray-600">{viewModal.data.sub}</p>
                  <p className="text-xs text-gray-500 mt-1">{viewModal.data.code}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-black ${
                    viewModal.data.status === 'Active' || viewModal.data.status === 'On Track' ? 'bg-green-100 text-green-700' :
                    viewModal.data.status === 'Due Soon' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {viewModal.data.status}
                  </span>
                  <span className="px-3 py-1.5 rounded-full text-xs font-black bg-blue-100 text-blue-700">
                    {viewModal.data.track}
                  </span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-1">
                  {['overview', 'documents', 'timeline', 'communications'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setCandidateActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium capitalize rounded-t-lg transition-colors ${
                        candidateActiveTab === tab
                          ? "text-secondary border-b-2 border-secondary"
                          : "text-gray-500 hover:text-secondary"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {candidateActiveTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Personal Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Full Name</p>
                            <p className="text-sm font-bold text-gray-900">{viewModal.data.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-bold text-gray-900">candidate@example.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-bold text-gray-900">+44 20 7123 4567</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="text-sm font-bold text-gray-900">{viewModal.data.sub}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Case Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Briefcase size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Case ID</p>
                            <p className="text-sm font-bold text-gray-900">{viewModal.data.code}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Visa Type</p>
                            <p className="text-sm font-bold text-gray-900">{viewModal.data.track}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Application Date</p>
                            <p className="text-sm font-bold text-gray-900">15 March 2024</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Expected Decision</p>
                            <p className="text-sm font-bold text-gray-900">30 April 2024</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {candidateActiveTab === "documents" && (
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Required Documents</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Check size={16} className="text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Passport Copy</p>
                          <p className="text-xs text-gray-500">Uploaded on 15 March 2024</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                        View
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Check size={16} className="text-green-500" />
                        <div>
                          <p className="text-sm font-medium">English Language Certificate</p>
                          <p className="text-xs text-gray-500">Uploaded on 18 March 2024</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                        View
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertCircle size={16} className="text-amber-500" />
                        <div>
                          <p className="text-sm font-medium">Bank Statements</p>
                          <p className="text-xs text-gray-500">Pending upload</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-xs text-amber-600 font-medium">Pending</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Check size={16} className="text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Academic Transcripts</p>
                          <p className="text-xs text-gray-500">Uploaded on 20 March 2024</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {candidateActiveTab === "timeline" && (
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Case Timeline</h4>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-white text-[10px] font-black">
                        â
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Application Submitted</p>
                        <p className="text-xs text-gray-500">15 March 2024 · Application processed and submitted to UKVI</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-white text-[10px] font-black">
                        â
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Documents Verified</p>
                        <p className="text-xs text-gray-500">18 March 2024 · All required documents verified and approved</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white text-[10px] font-black">
                        â
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Under Review</p>
                        <p className="text-xs text-gray-500">22 March 2024 · Currently under review by UKVI</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {candidateActiveTab === "communications" && (
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Communication History</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">15 March 2024</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Email</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 mb-1">Application Confirmation</p>
                      <p className="text-xs text-gray-600">Your visa application has been successfully submitted. We'll notify you of any updates.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">18 March 2024</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Phone</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 mb-1">Document Follow-up</p>
                      <p className="text-xs text-gray-600">Called to confirm receipt of additional documents.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sponsor View Modal */}
      {viewModal.type === 'sponsor' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-secondary">Sponsor Profile</h2>
                <button
                  onClick={closeViewModal}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Header Section */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-lg font-black text-secondary">
                  {viewModal.data.code}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-secondary">{viewModal.data.name}</h3>
                  <p className="text-sm text-gray-600">{viewModal.data.sub}</p>
                  <p className="text-xs text-gray-500 mt-1">{viewModal.data.meta}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-black ${
                    viewModal.data.badgeVariant === 'green' ? 'bg-green-100 text-green-700' :
                    viewModal.data.badgeVariant === 'yellow' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {viewModal.data.badge}
                  </span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-1">
                  {['overview', 'licenses', 'workers', 'compliance'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSponsorActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium capitalize rounded-t-lg transition-colors ${
                        sponsorActiveTab === tab
                          ? "text-secondary border-b-2 border-secondary"
                          : "text-gray-500 hover:text-secondary"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {sponsorActiveTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Company Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Building size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Company Name</p>
                            <p className="text-sm font-bold text-gray-900">{viewModal.data.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="text-sm font-bold text-gray-900">123 Business Street, London, UK</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-bold text-gray-900">hr@company.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-bold text-gray-900">+44 20 7123 4567</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Sponsorship Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Briefcase size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Sponsor Code</p>
                            <p className="text-sm font-bold text-gray-900">{viewModal.data.code}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">License Type</p>
                            <p className="text-sm font-bold text-gray-900">{viewModal.data.meta}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">License Expiry</p>
                            <p className="text-sm font-bold text-gray-900">15 December 2024</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Compliance Status</p>
                            <p className="text-sm font-bold text-gray-900">{viewModal.data.badge}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Workers */}
                  <div>
                    <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Active Sponsored Workers</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Ahmed Al-Rashid</p>
                          <p className="text-xs text-gray-500">Software Engineer · Tier 2</p>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Priya Sharma</p>
                          <p className="text-xs text-gray-500">Data Analyst · Skilled Worker</p>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sponsorActiveTab === "licenses" && (
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">License Information</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-bold text-gray-900">Tier 2 General Sponsor License</h5>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">License Number</p>
                          <p className="font-bold text-gray-900">SRT-2024-1234</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Issue Date</p>
                          <p className="font-bold text-gray-900">15 December 2023</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Expiry Date</p>
                          <p className="font-bold text-gray-900">14 December 2024</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Allocation</p>
                          <p className="font-bold text-gray-900">5/10 used</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                          View License
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sponsorActiveTab === "workers" && (
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Sponsored Workers</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Ahmed Al-Rashid</p>
                          <p className="text-xs text-gray-500">Software Engineer · Tier 2</p>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-gray-500">Start Date</p>
                          <p className="font-bold text-gray-900">15 Jan 2024</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Certificate</p>
                          <p className="font-bold text-gray-900">COS-12345</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Priya Sharma</p>
                          <p className="text-xs text-gray-500">Data Analyst · Skilled Worker</p>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-gray-500">Start Date</p>
                          <p className="font-bold text-gray-900">20 Feb 2024</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Certificate</p>
                          <p className="font-bold text-gray-900">COS-12346</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sponsorActiveTab === "compliance" && (
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Compliance Status</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-bold text-gray-900">Annual Compliance Review</h5>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Compliant</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">Last reviewed on 15 March 2024</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Check size={14} className="text-green-500" />
                          <span className="text-xs text-gray-700">License fees paid</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check size={14} className="text-green-500" />
                          <span className="text-xs text-gray-700">Worker records updated</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check size={14} className="text-green-500" />
                          <span className="text-xs text-gray-700">Duties maintained</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                          View Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseworkerClients;

