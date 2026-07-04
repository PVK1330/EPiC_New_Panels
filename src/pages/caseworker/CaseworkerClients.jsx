import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, X, FileText, Briefcase, Phone, Mail, Calendar, MapPin, User, Building, Check, AlertCircle, Clock, Download, Loader2 } from "lucide-react";
import api from "../../services/api";
import { getCaseworkerCases, getCaseworkerCaseDetails, downloadDocument } from "../../services/caseApi";
import { formatDate, formatDateTime } from "../../utils/datetime";

const TABS = [
  // { id: "candidates", label: "Candidate Profiles", path: "/caseworker/people/candidates" },
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

const CASE_ACCENTS = ["secondary", "primary", "purple", "teal", "amber"];

const getCandidateStatus = (cases = []) => {
  const statuses = cases.map((c) => c.status || "");
  if (statuses.includes("Overdue")) return "Overdue";
  if (statuses.some((s) => ["Pending", "In Progress", "Under Review", "Drafting"].includes(s))) {
    return "Active";
  }
  if (statuses.some((s) => ["Submitted", "Decision"].includes(s))) return "Due Soon";
  return "On Track";
};

const buildAssignedCandidates = (cases = []) => {
  const grouped = new Map();
  cases.forEach((item) => {
    const candidate = item?.candidate;
    if (!candidate?.id) return;
    if (!grouped.has(candidate.id)) {
      grouped.set(candidate.id, { candidate, cases: [] });
    }
    grouped.get(candidate.id).cases.push(item);
  });

  return Array.from(grouped.values()).map(({ candidate, cases: candidateCases }, idx) => {
    const name = `${candidate.first_name || ""} ${candidate.last_name || ""}`.trim() || "Unknown Candidate";
    const initials = `${(candidate.first_name || "").charAt(0)}${(candidate.last_name || "").charAt(0)}`
      .toUpperCase() || "C";
    const latestCase = [...candidateCases].sort(
      (a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0),
    )[0];
    const track = latestCase?.visaType?.name || "Visa Case";
    const code = latestCase?.caseId ? `#${latestCase.caseId}` : `#C-${candidate.id}`;
    const sub = `${latestCase?.nationality || "Candidate"}${latestCase?.jobTitle ? ` · ${latestCase.jobTitle}` : ""}`;

    return {
      id: candidate.id,
      initials,
      name,
      sub,
      status: getCandidateStatus(candidateCases),
      track,
      code,
      accent: CASE_ACCENTS[idx % CASE_ACCENTS.length],
      email: candidate.email || "",
      phone: latestCase?.candidate?.mobile || "",
      location: latestCase?.nationality || "N/A",
      primaryCase: latestCase,
      cases: candidateCases,
    };
  });
};

const CaseworkerClients = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewModal, setViewModal] = useState({ type: null, data: null });
  const [candidateActiveTab, setCandidateActiveTab] = useState("overview");
  const [sponsorActiveTab, setSponsorActiveTab] = useState("overview");
  const [sponsors, setSponsors] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  // Full case detail (documents / timeline / communications) for the open candidate.
  const [candidateDetails, setCandidateDetails] = useState(null);
  // Direct message thread (Messages module) with the open candidate, merged into
  // the Communications tab alongside logged case communications and notes.
  const [candidateMessages, setCandidateMessages] = useState([]);
  const [loadingCandidateDetails, setLoadingCandidateDetails] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState(null);

  const activeTab = useMemo(() => {
    return location.pathname.includes("/people/sponsors") ? "sponsors" : "candidates";
  }, [location.pathname]);

  const openViewModal = (type, data) => {
    setViewModal({ type, data });
    // Reset tabs when opening modal
    if (type === 'candidate') {
      setCandidateActiveTab("overview");
      fetchCandidateDetails(data);
    } else if (type === 'sponsor') {
      setSponsorActiveTab("overview");
    }
  };

  const closeViewModal = () => {
    setViewModal({ type: null, data: null });
    setSelectedSponsor(null);
    setCandidateDetails(null);
    setCandidateMessages([]);
  };

  // Pull the full case record (documents, timeline, communications, notes) for
  // the selected candidate's primary case, plus the direct message thread with
  // the candidate, so the modal tabs show real data. Each source is best-effort:
  // a failure in one must not blank the other.
  const fetchCandidateDetails = async (candidate) => {
    const caseRef = candidate?.primaryCase?.caseId || candidate?.primaryCase?.id;
    try {
      setLoadingCandidateDetails(true);
      setCandidateDetails(null);
      setCandidateMessages([]);
      const [detailsRes, messagesRes] = await Promise.allSettled([
        caseRef ? getCaseworkerCaseDetails(caseRef) : Promise.resolve(null),
        candidate?.id ? api.get(`/api/messages/${candidate.id}`) : Promise.resolve(null),
      ]);
      if (detailsRes.status === "fulfilled") {
        setCandidateDetails(detailsRes.value?.data?.data || null);
      } else {
        console.error("Error fetching candidate case details:", detailsRes.reason);
      }
      if (messagesRes.status === "fulfilled") {
        setCandidateMessages(messagesRes.value?.data?.data?.messages || []);
      } else {
        console.error("Error fetching candidate messages:", messagesRes.reason);
      }
    } finally {
      setLoadingCandidateDetails(false);
    }
  };

  const handleDocumentDownload = async (doc) => {
    if (!doc?.id) return;
    try {
      setDownloadingDocId(doc.id);
      const response = await downloadDocument(doc.id);
      const blob = new Blob([response.data], {
        type: doc.mimeType || response.headers?.["content-type"] || "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.userFileName || doc.documentName || `document-${doc.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
    } finally {
      setDownloadingDocId(null);
    }
  };

  // Map a document status enum to a small pill style + label.
  const docStatusPill = (status) => {
    switch (status) {
      case "approved":
        return { label: "Approved", className: "bg-green-100 text-green-700" };
      case "rejected":
        return { label: "Rejected", className: "bg-red-100 text-red-700" };
      case "under_review":
        return { label: "Under Review", className: "bg-amber-100 text-amber-700" };
      case "uploaded":
        return { label: "Uploaded", className: "bg-blue-100 text-blue-700" };
      case "missing":
        return { label: "Missing", className: "bg-gray-100 text-gray-600" };
      default:
        return { label: status || "—", className: "bg-gray-100 text-gray-600" };
    }
  };

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/caseworker/sponsors");
        setSponsors(response.data.data.sponsors || []);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  useEffect(() => {
    const fetchAssignedCandidates = async () => {
      try {
        setLoadingCandidates(true);
        const response = await getCaseworkerCases({ page: 1, limit: 200 });
        const assignedCases = response?.data?.data?.cases || [];
        setCandidates(buildAssignedCandidates(assignedCases));
      } catch (error) {
        console.error("Error fetching assigned candidates:", error);
        setCandidates([]);
      } finally {
        setLoadingCandidates(false);
      }
    };

    if (activeTab === "candidates") {
      fetchAssignedCandidates();
    }
  }, [activeTab]);

  const handleSponsorView = async (sponsor) => {
    try {
      const response = await api.get(`/api/caseworker/sponsors/${sponsor.id}`);
      setSelectedSponsor(response.data.data);
      openViewModal('sponsor', {
        code: (sponsor.sponsorProfile?.companyName || sponsor.first_name + ' ' + sponsor.last_name).substring(0, 2).toUpperCase(),
        name: sponsor.sponsorProfile?.companyName || `${sponsor.first_name} ${sponsor.last_name}`,
        sub: sponsor.sponsorProfile?.industrySector || 'Business',
        meta: `${sponsor.activeCases || 0} active worker${sponsor.activeCases !== 1 ? 's' : ''} · ${sponsor.sponsorProfile?.licenceStatus || 'Active'}`,
        badge: sponsor.sponsorProfile?.licenceStatus === 'Active' ? 'Compliant' : sponsor.sponsorProfile?.licenceStatus || 'Review',
        badgeVariant: sponsor.sponsorProfile?.licenceStatus === 'Active' ? 'green' : 'yellow'
      });
    } catch (error) {
      console.error("Error fetching sponsor details:", error);
    }
  };

  const getSponsorCode = (sponsor) => {
    const name = sponsor.sponsorProfile?.companyName || `${sponsor.first_name} ${sponsor.last_name}`;
    return name.substring(0, 2).toUpperCase();
  };

  const getSponsorName = (sponsor) => {
    return sponsor.sponsorProfile?.companyName || `${sponsor.first_name} ${sponsor.last_name}`;
  };

  const getSponsorSub = (sponsor) => {
    const industry = sponsor.sponsorProfile?.industrySector || 'Business';
    const city = sponsor.sponsorProfile?.city || '';
    return city ? `${industry} · ${city}` : industry;
  };

  const getSponsorMeta = (sponsor) => {
    const activeCases = sponsor.activeCases || 0;
    const sponsoredWorkers = sponsor.sponsoredWorkers || 0;
    return `${activeCases} active worker${activeCases !== 1 ? 's' : ''} · ${sponsoredWorkers} sponsored`;
  };

  const getComplianceBadge = (sponsor) => {
    const licenceStatus = sponsor.sponsorProfile?.licenceStatus;
    if (licenceStatus === 'Active') return { badge: 'Compliant', variant: 'green' };
    if (licenceStatus === 'Expired') return { badge: 'Expired', variant: 'red' };
    if (licenceStatus === 'Pending') return { badge: 'Pending', variant: 'yellow' };
    return { badge: 'Review', variant: 'yellow' };
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
          {loadingCandidates ? (
            <div className="col-span-full text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="col-span-full text-center py-8 text-sm font-bold text-gray-500">
              No assigned candidates found
            </div>
          ) : (
            candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                initials={candidate.initials}
                name={candidate.name}
                sub={candidate.sub}
                status={candidate.status}
                track={candidate.track}
                code={candidate.code}
                accent={candidate.accent}
                onView={() => openViewModal("candidate", candidate)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : sponsors.length === 0 ? (
            <div className="col-span-full text-center py-8 text-sm font-bold text-gray-500">
              No sponsors found
            </div>
          ) : (
            sponsors.map((sponsor) => {
              const { badge, variant } = getComplianceBadge(sponsor);
              return (
                <SponsorCard
                  key={sponsor.id}
                  code={getSponsorCode(sponsor)}
                  name={getSponsorName(sponsor)}
                  sub={getSponsorSub(sponsor)}
                  meta={getSponsorMeta(sponsor)}
                  badge={badge}
                  badgeVariant={variant}
                  onView={() => handleSponsorView(sponsor)}
                />
              );
            })
          )}
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
                            <p className="text-sm font-bold text-gray-900">{candidateDetails?.candidate?.email || viewModal.data.email || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-bold text-gray-900">{candidateDetails?.candidate?.mobile || viewModal.data.phone || "N/A"}</p>
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
                            <p className="text-sm font-bold text-gray-900">
                              {viewModal.data.primaryCase?.created_at
                                ? formatDate(viewModal.data.primaryCase.created_at)
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Expected Decision</p>
                            <p className="text-sm font-bold text-gray-900">
                              {viewModal.data.primaryCase?.targetSubmissionDate
                                ? formatDate(viewModal.data.primaryCase.targetSubmissionDate)
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {candidateActiveTab === "documents" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-secondary uppercase tracking-wide">Documents</h4>
                  {loadingCandidateDetails ? (
                    <div className="flex items-center justify-center py-10 text-gray-400">
                      <Loader2 size={20} className="animate-spin" />
                    </div>
                  ) : (candidateDetails?.documents?.list?.length || 0) === 0 ? (
                    <div className="text-sm text-gray-500 py-8 text-center">No documents uploaded for this case.</div>
                  ) : (
                    <div className="space-y-3">
                      {candidateDetails.documents.list.map((doc) => {
                        const pill = docStatusPill(doc.status);
                        const isUploaded = doc.status && doc.status !== "missing";
                        return (
                          <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3 min-w-0">
                              {doc.status === "approved" ? (
                                <Check size={16} className="text-green-500 flex-shrink-0" />
                              ) : doc.status === "rejected" ? (
                                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                              ) : doc.status === "missing" ? (
                                <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
                              ) : (
                                <FileText size={16} className="text-gray-400 flex-shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {doc.userFileName || doc.documentName || doc.documentType || "Document"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {doc.documentType ? `${doc.documentType} · ` : ""}
                                  {doc.uploadedAt ? `Uploaded ${formatDate(doc.uploadedAt)}` : "Not uploaded"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${pill.className}`}>
                                {pill.label}
                              </span>
                              {isUploaded && (
                                <button
                                  onClick={() => handleDocumentDownload(doc)}
                                  disabled={downloadingDocId === doc.id}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                                >
                                  {downloadingDocId === doc.id ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <Download size={12} />
                                  )}
                                  Download
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {candidateActiveTab === "timeline" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-secondary uppercase tracking-wide">Case Timeline</h4>
                  {loadingCandidateDetails ? (
                    <div className="flex items-center justify-center py-10 text-gray-400">
                      <Loader2 size={20} className="animate-spin" />
                    </div>
                  ) : (candidateDetails?.timeline?.length || 0) === 0 ? (
                    <div className="text-sm text-gray-500 py-8 text-center">No timeline activity recorded yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {candidateDetails.timeline.map((event) => {
                        const performer = event.performer
                          ? `${event.performer.first_name || ""} ${event.performer.last_name || ""}`.trim()
                          : event.isSystemAction
                            ? "System"
                            : "";
                        const title = (event.actionType || "update")
                          .replace(/_/g, " ")
                          .replace(/^./, (c) => c.toUpperCase());
                        return (
                          <div key={event.id} className="flex gap-3">
                            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5 ${event.isSystemAction ? "bg-blue-500" : "bg-green-500"}`}>
                              <Clock size={12} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900">{title}</p>
                              {event.description && (
                                <p className="text-sm text-gray-600">{event.description}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-0.5">
                                {event.actionDate ? formatDateTime(event.actionDate) : ""}
                                {performer ? ` · ${performer}` : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {candidateActiveTab === "communications" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-secondary uppercase tracking-wide">Communication History</h4>
                  {loadingCandidateDetails ? (
                    <div className="flex items-center justify-center py-10 text-gray-400">
                      <Loader2 size={20} className="animate-spin" />
                    </div>
                  ) : (() => {
                    // Merge logged communications, case notes and the direct message
                    // thread into one date-sorted history so the tab is useful even
                    // when only one source exists.
                    const comms = (candidateDetails?.communications || []).map((c) => ({
                      id: `comm-${c.id}`,
                      date: c.sentDate || c.created_at,
                      channel: (c.messageType || "note").replace(/_/g, " "),
                      title: c.subject || (c.direction === "inbound" ? "Inbound message" : "Outbound message"),
                      body: c.message,
                    }));
                    const notes = (candidateDetails?.notes || []).map((n) => ({
                      id: `note-${n.id}`,
                      date: n.created_at,
                      channel: "note",
                      title: n.title || (n.author ? `Note by ${n.author.first_name || ""} ${n.author.last_name || ""}`.trim() : "Case note"),
                      body: n.content,
                    }));
                    const messages = (candidateMessages || []).map((m) => {
                      const inbound = m.senderId === viewModal.data.id;
                      const senderName = `${m.sender?.first_name || ""} ${m.sender?.last_name || ""}`.trim();
                      let body = m.content;
                      if (m.messageType === "file") {
                        // File messages store JSON metadata in content.
                        try {
                          const meta = JSON.parse(m.content);
                          body = [meta?.content, meta?.originalName ? `Attachment: ${meta.originalName}` : "Attachment"]
                            .filter(Boolean)
                            .join(" · ");
                        } catch {
                          body = "Attachment";
                        }
                      }
                      return {
                        id: `msg-${m.id}`,
                        date: m.createdAt || m.created_at,
                        channel: "message",
                        title: inbound
                          ? `Message from ${senderName || viewModal.data.name}`
                          : `Message to ${viewModal.data.name}${senderName ? ` from ${senderName}` : ""}`,
                        body,
                      };
                    });
                    const history = [...comms, ...notes, ...messages].sort(
                      (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
                    );

                    if (history.length === 0) {
                      return <div className="text-sm text-gray-500 py-8 text-center">No communications, messages or notes recorded yet.</div>;
                    }

                    const channelClass = (channel) => {
                      const c = channel.toLowerCase();
                      if (c.includes("email")) return "bg-blue-100 text-blue-700";
                      if (c.includes("phone")) return "bg-green-100 text-green-700";
                      if (c.includes("sms")) return "bg-purple-100 text-purple-700";
                      if (c === "message") return "bg-teal-50 text-teal-700";
                      return "bg-gray-100 text-gray-700";
                    };

                    return (
                      <div className="space-y-4">
                        {history.map((item) => (
                          <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2 gap-2">
                              <span className="text-xs text-gray-500">{item.date ? formatDateTime(item.date) : ""}</span>
                              <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${channelClass(item.channel)}`}>
                                {item.channel}
                              </span>
                            </div>
                            {item.title && <p className="text-sm font-bold text-gray-900 mb-1">{item.title}</p>}
                            {item.body && <p className="text-xs text-gray-600 whitespace-pre-wrap">{item.body}</p>}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
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
                            <p className="text-sm font-bold text-gray-900">{selectedSponsor?.sponsor?.sponsorProfile?.companyName || viewModal.data.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="text-sm font-bold text-gray-900">{selectedSponsor?.sponsor?.sponsorProfile?.registeredAddress || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-bold text-gray-900">{selectedSponsor?.sponsor?.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-bold text-gray-900">{selectedSponsor?.sponsor?.country_code && selectedSponsor?.sponsor?.mobile ? `${selectedSponsor.sponsor.country_code} ${selectedSponsor.sponsor.mobile}` : 'N/A'}</p>
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
                            <p className="text-sm font-bold text-gray-900">{selectedSponsor?.sponsor?.sponsorProfile?.sponsorLicenceNumber || viewModal.data.code}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">License Type</p>
                            <p className="text-sm font-bold text-gray-900">{selectedSponsor?.sponsor?.sponsorProfile?.industrySector || viewModal.data.meta}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">License Expiry</p>
                            <p className="text-sm font-bold text-gray-900">{selectedSponsor?.sponsor?.sponsorProfile?.licenceExpiryDate ? formatDate(selectedSponsor.sponsor.sponsorProfile.licenceExpiryDate) : 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check size={16} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Compliance Status</p>
                            <p className="text-sm font-bold text-gray-900">{selectedSponsor?.sponsor?.sponsorProfile?.licenceStatus || viewModal.data.badge}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Workers */}
                  <div>
                    <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Active Sponsored Workers ({selectedSponsor?.stats?.activeCases || 0})</h4>
                    <div className="space-y-2">
                      {selectedSponsor?.activeCases && selectedSponsor.activeCases.length > 0 ? (
                        selectedSponsor.activeCases.map((activeCase) => (
                          <div key={activeCase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium">{activeCase.candidate ? `${activeCase.candidate.first_name} ${activeCase.candidate.last_name}` : 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{activeCase.visaType?.name || 'Unknown Visa Type'}</p>
                            </div>
                            <span className="text-xs text-green-600 font-medium">Active</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 py-4">No active workers</div>
                      )}
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
                        <h5 className="text-sm font-bold text-gray-900">Sponsor License</h5>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          selectedSponsor?.sponsor?.sponsorProfile?.licenceStatus === 'Active' ? 'bg-green-100 text-green-700' :
                          selectedSponsor?.sponsor?.sponsorProfile?.licenceStatus === 'Expired' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {selectedSponsor?.sponsor?.sponsorProfile?.licenceStatus || 'Unknown'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">License Number</p>
                          <p className="font-bold text-gray-900">{selectedSponsor?.sponsor?.sponsorProfile?.sponsorLicenceNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Issue Date</p>
                          <p className="font-bold text-gray-900">{selectedSponsor?.sponsor?.sponsorProfile?.licenceIssueDate ? formatDate(selectedSponsor.sponsor.sponsorProfile.licenceIssueDate) : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Expiry Date</p>
                          <p className="font-bold text-gray-900">{selectedSponsor?.sponsor?.sponsorProfile?.licenceExpiryDate ? formatDate(selectedSponsor.sponsor.sponsorProfile.licenceExpiryDate) : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">COS Allocation</p>
                          <p className="font-bold text-gray-900">{selectedSponsor?.sponsor?.sponsorProfile?.cosAllocation || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sponsorActiveTab === "workers" && (
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Sponsored Workers ({selectedSponsor?.stats?.sponsoredWorkers || 0})</h4>
                  <div className="space-y-3">
                    {selectedSponsor?.activeCases && selectedSponsor.activeCases.length > 0 ? (
                      selectedSponsor.activeCases.map((activeCase) => (
                        <div key={activeCase.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{activeCase.candidate ? `${activeCase.candidate.first_name} ${activeCase.candidate.last_name}` : 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{activeCase.visaType?.name || 'Unknown Visa Type'}</p>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-gray-500">Start Date</p>
                          <p className="font-bold text-gray-900">{activeCase.created_at ? formatDate(activeCase.created_at) : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <p className="font-bold text-gray-900">{activeCase.status || 'Active'}</p>
                        </div>
                      </div>
                    </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 py-4">No sponsored workers</div>
                    )}
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

