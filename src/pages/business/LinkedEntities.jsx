/**
 * Section K — Multi-Company Handling: Linked Entities Page
 *
 * Displays:
 *  - A consolidated group-level risk dashboard (stats bar).
 *  - A list of all entities in the company group with per-entity risk/worker stats.
 *  - A "Link New Entity" button that opens a search modal to find and link a subsidiary.
 *  - Unlink button for each subsidiary (only the parent can unlink).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  AlertTriangle,
  ShieldCheck,
  Link2,
  Unlink,
  Search,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  getLinkedEntities,
  linkSubsidiary,
  unlinkSubsidiary,
  getConsolidatedDashboard,
  searchSponsorProfiles,
} from "../../services/licenceApi";

// ── Helpers ─────────────────────────────────────────────────────────────────

const RISK_COLORS = {
  High: "text-red-600 bg-red-100",
  Medium: "text-amber-600 bg-amber-100",
  Low: "text-emerald-600 bg-emerald-100",
};

const LICENCE_COLORS = {
  Active: "text-emerald-700 bg-emerald-100",
  Suspended: "text-amber-700 bg-amber-100",
  Expired: "text-red-700 bg-red-100",
  Pending: "text-slate-600 bg-slate-100",
};

const Badge = ({ label, colorClass }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
    {label}
  </span>
);

const StatCard = ({ icon: Icon, label, value, bgClass, iconClass }) => (
  <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
    <div className={`rounded-xl p-3 ${bgClass}`}>
      <Icon size={22} className={iconClass} />
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

// ── Link Modal ───────────────────────────────────────────────────────────────

function LinkEntityModal({ onClose, onLinked }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState(null); // profileId being linked
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = useCallback(async (term) => {
    if (!term || term.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    setError("");
    try {
      const res = await searchSponsorProfiles(term.trim());
      setResults(res.data?.data ?? []);
    } catch (e) {
      setError(e.response?.data?.message || "Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 350);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const handleLink = async (profile, relationshipType = "subsidiary") => {
    setLinking(profile.id);
    setError("");
    setSuccess("");
    try {
      await linkSubsidiary({ childSponsorProfileId: profile.id, relationshipType });
      setSuccess(`${profile.companyName} has been linked successfully.`);
      setResults([]);
      setQuery("");
      onLinked();
    } catch (e) {
      setError(e.response?.data?.message || "Linking failed. Please try again.");
    } finally {
      setLinking(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-slate-800 mb-1">Link a New Entity</h2>
        <p className="text-sm text-slate-500 mb-5">
          Search for another company by name or registration number and link it as a subsidiary or related entity.
        </p>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Company name or registration number…"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
          />
          {searching && (
            <Loader2 size={16} className="absolute right-3 top-3 text-primary animate-spin" />
          )}
        </div>

        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle size={14} /> {error}
          </p>
        )}
        {success && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle size={14} /> {success}
          </p>
        )}

        {results.length > 0 && (
          <ul className="mt-4 divide-y divide-slate-100 max-h-64 overflow-y-auto rounded-xl border border-slate-100">
            {results.map((profile) => (
              <li key={profile.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{profile.companyName}</p>
                  {profile.tradingName && profile.tradingName !== profile.companyName && (
                    <p className="text-xs text-slate-400 truncate">t/a {profile.tradingName}</p>
                  )}
                  <p className="text-xs text-slate-500">Reg: {profile.registrationNumber || "—"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    label={profile.licenceStatus ?? "Unknown"}
                    colorClass={LICENCE_COLORS[profile.licenceStatus] ?? "text-slate-600 bg-slate-100"}
                  />
                  <button
                    onClick={() => handleLink(profile, "subsidiary")}
                    disabled={linking === profile.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {linking === profile.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Link2 size={12} />
                    )}
                    Link
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!searching && query.trim().length >= 2 && results.length === 0 && !success && (
          <p className="mt-4 text-center text-sm text-slate-400">No matching sponsors found.</p>
        )}
      </motion.div>
    </div>
  );
}

// ── Entity Card ──────────────────────────────────────────────────────────────

function EntityCard({ entity, isOwnProfile, onUnlink }) {
  const [unlinking, setUnlinking] = useState(false);

  const handleUnlink = async () => {
    if (!entity.linkId) return;
    if (!window.confirm(`Remove ${entity.companyName} from your company group?`)) return;
    setUnlinking(true);
    try {
      await unlinkSubsidiary(entity.linkId);
      onUnlink();
    } catch {
      // error handled by parent reload
    } finally {
      setUnlinking(false);
    }
  };

  const roleLabel = entity.role === "parent" ? "Parent Company" : entity.role === "linked" ? "Linked Entity" : "Subsidiary";
  const riskColorClass = RISK_COLORS[entity.riskLevel] ?? "text-slate-600 bg-slate-100";
  const licenceColorClass = LICENCE_COLORS[entity.licenceStatus] ?? "text-slate-600 bg-slate-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="rounded-xl bg-primary/10 p-2.5 shrink-0">
            <Building2 size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm truncate">{entity.companyName}</h3>
            {entity.tradingName && entity.tradingName !== entity.companyName && (
              <p className="text-xs text-slate-400 truncate">t/a {entity.tradingName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge label={roleLabel} colorClass={entity.role === "parent" ? "text-primary bg-primary/10" : "text-slate-600 bg-slate-100"} />
          {isOwnProfile && entity.role !== "parent" && entity.linkId && (
            <button
              onClick={handleUnlink}
              disabled={unlinking}
              title="Unlink this entity"
              className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {unlinking ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={14} />}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-xl font-bold text-slate-800">{entity.sponsoredWorkers ?? 0}</p>
          <p className="text-xs text-slate-500 mt-0.5">Workers</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-xl font-bold text-slate-800">{entity.activeCases ?? 0}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active Cases</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Licence:</span>
          <Badge label={entity.licenceStatus ?? "Unknown"} colorClass={licenceColorClass} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Risk:</span>
          <Badge label={entity.riskLevel ?? "Low"} colorClass={riskColorClass} />
        </div>
      </div>

      {(entity.expiring30 > 0 || entity.expiring90 > 0) && (
        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 flex items-center gap-2 text-xs text-amber-700">
          <AlertTriangle size={13} />
          {entity.expiring30 > 0
            ? `${entity.expiring30} visa${entity.expiring30 > 1 ? "s" : ""} expiring within 30 days`
            : `${entity.expiring90} visa${entity.expiring90 > 1 ? "s" : ""} expiring within 90 days`}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Compliance score</span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                entity.complianceScore >= 80 ? "bg-emerald-500" : entity.complianceScore >= 50 ? "bg-amber-400" : "bg-red-500"
              }`}
              style={{ width: `${entity.complianceScore ?? 80}%` }}
            />
          </div>
          <span className="font-semibold text-slate-700">{entity.complianceScore ?? 80}%</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function LinkedEntities() {
  const [entities, setEntities] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [entRes, dashRes] = await Promise.all([
        getLinkedEntities(),
        getConsolidatedDashboard(),
      ]);
      setEntities(entRes.data?.data ?? []);
      setDashboard(dashRes.data?.data ?? null);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load linked entities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Determine if the calling user is the parent (they own the parent profile).
  // We use the fact that the parent entity has role === 'parent'.
  const isParent = useMemo(() => entities.some((e) => e.role === "parent"), [entities]);

  const stats = useMemo(() => {
    if (!dashboard?.summary) return [];
    const s = dashboard.summary;
    return [
      {
        icon: Building2,
        label: "Entities in Group",
        value: s.totalEntities ?? entities.length,
        bgClass: "bg-primary/10",
        iconClass: "text-primary",
      },
      {
        icon: Users,
        label: "Total Workers",
        value: s.totalWorkers ?? 0,
        bgClass: "bg-blue-100",
        iconClass: "text-blue-600",
      },
      {
        icon: AlertTriangle,
        label: "Visas Expiring (30d)",
        value: s.totalExpiring30 ?? 0,
        bgClass: "bg-amber-100",
        iconClass: "text-amber-600",
      },
      {
        icon: ShieldCheck,
        label: "Group Compliance",
        value: `${s.groupComplianceScore ?? 80}%`,
        bgClass: s.groupComplianceScore >= 80 ? "bg-emerald-100" : s.groupComplianceScore >= 50 ? "bg-amber-100" : "bg-red-100",
        iconClass: s.groupComplianceScore >= 80 ? "text-emerald-600" : s.groupComplianceScore >= 50 ? "text-amber-600" : "text-red-600",
      },
    ];
  }, [dashboard, entities.length]);

  const overallRisk = dashboard?.summary?.overallRiskLevel ?? "Low";

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 size={26} className="text-primary" />
            Linked Entities
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Section K — Multi-Company Handling: manage your company group and consolidated risk.
          </p>
        </div>

        {isParent && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Link2 size={16} />
            Link New Entity
          </button>
        )}
      </div>

      {/* Overall risk alert */}
      {!loading && dashboard && overallRisk === "High" && (
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} />
          <span>
            <strong>Group risk is High.</strong> One or more entities require immediate compliance attention.
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Stats */}
      {!loading && stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm">Loading company group…</p>
        </div>
      )}

      {/* Empty state — no linked entities yet */}
      {!loading && entities.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
          <div className="rounded-2xl bg-slate-100 p-6">
            <Building2 size={40} className="text-slate-300" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-slate-600">No linked entities yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Your account has no parent or subsidiary companies configured.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Link2 size={16} />
            Link Your First Entity
          </button>
        </div>
      )}

      {/* Entity grid */}
      {!loading && entities.length > 0 && (
        <>
          {/* Info banner for child accounts */}
          {!isParent && (
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
              <Info size={15} />
              <span>You are viewing this group as a subsidiary. Only the parent company can add or remove entities.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {entities.map((entity) => (
              <EntityCard
                key={entity.profileId}
                entity={entity}
                isOwnProfile={isParent}
                onUnlink={loadData}
              />
            ))}
          </div>
        </>
      )}

      {/* Link modal */}
      <AnimatePresence>
        {showModal && (
          <LinkEntityModal
            onClose={() => setShowModal(false)}
            onLinked={() => {
              setShowModal(false);
              loadData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
