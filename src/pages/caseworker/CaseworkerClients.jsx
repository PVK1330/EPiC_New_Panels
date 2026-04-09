import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

const CandidateCard = ({ initials, name, sub, status, track, code, accent = "secondary" }) => {
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
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:-translate-y-0.5 transition will-change-transform cursor-pointer">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-black mb-3 ${accentMap[accent] ?? accentMap.secondary}`}>
        {initials}
      </div>
      <div className="text-base font-black text-secondary mb-1">{name}</div>
      <div className="text-sm text-gray-500 mb-3">{sub}</div>
      <div className="flex flex-wrap gap-2 items-center">
        {statusPill}
        <Badge variant="blue">{track}</Badge>
        <span className="text-[11px] font-mono text-gray-400">{code}</span>
      </div>
    </div>
  );
};

const SponsorCard = ({ code, name, sub, meta, badge = "Compliant", badgeVariant = "green" }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition cursor-pointer">
    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mb-3 font-mono font-black text-secondary">
      {code}
    </div>
    <div className="text-base font-black text-secondary mb-1">{name}</div>
    <div className="text-sm text-gray-500">{sub}</div>
    <div className="mt-3 text-xs text-gray-500">{meta}</div>
    <div className="mt-2">
      <Badge variant={badgeVariant}>{badge}</Badge>
    </div>
  </div>
);

const CaseworkerClients = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(() => {
    return location.pathname.includes("/people/sponsors") ? "sponsors" : "candidates";
  }, [location.pathname]);

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
          <CandidateCard initials="AR" name="Ahmed Al-Rashid" sub="Saudi Arabia · Engineer" status="Active" track="Tier 2" code="#C-2401" accent="secondary" />
          <CandidateCard initials="PS" name="Priya Sharma" sub="India · Software Developer" status="Due Soon" track="Skilled" code="#C-2398" accent="purple" />
          <CandidateCard initials="CM" name="Carlos Mendes" sub="Brazil · Project Manager" status="Overdue" track="Intra-Co" code="#C-2391" accent="primary" />
          <CandidateCard initials="MC" name="Mei Lin Chen" sub="China · Data Analyst" status="On Track" track="Graduate" code="#C-2389" accent="teal" />
          <CandidateCard initials="IP" name="Ivan Petrov" sub="Russia · Environmental Eng." status="On Track" track="Tier 2" code="#C-2385" accent="amber" />
          <CandidateCard initials="FA" name="Fatima Al-Zahra" sub="Morocco · Nurse" status="Due Soon" track="H&C" code="#C-2380" accent="secondary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SponsorCard code="TC" name="TechCorp Ltd" sub="Technology · London" meta="1 active worker · Tier 2 sponsor" badge="Compliant" badgeVariant="green" />
          <SponsorCard code="NG" name="Nexus Group" sub="Finance · Manchester" meta="1 active worker · Skilled sponsor" badge="Compliant" badgeVariant="green" />
          <SponsorCard code="BR" name="BuildRight Inc" sub="Construction · Birmingham" meta="1 active worker · Intra-Co" badge="Review Due" badgeVariant="yellow" />
          <SponsorCard code="GF" name="Global Finance" sub="Banking · London" meta="1 active worker · Graduate" badge="Compliant" badgeVariant="green" />
          <SponsorCard code="MG" name="MediCare Group" sub="Healthcare · Leeds" meta="1 active worker · H&C Worker" badge="Compliant" badgeVariant="green" />
          <SponsorCard code="ET" name="EnviroTech" sub="Environment · Bristol" meta="1 active worker · Tier 2" badge="Compliant" badgeVariant="green" />
        </div>
      )}
    </div>
  );
};

export default CaseworkerClients;

