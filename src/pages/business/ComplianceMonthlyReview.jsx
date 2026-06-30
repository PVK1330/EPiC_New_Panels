/**
 * ComplianceMonthlyReview — Section N
 *
 * Business (sponsor) portal page for viewing and generating monthly compliance
 * review reports.
 *
 * Features:
 *   - List of past monthly reports with key metrics at a glance
 *   - Expandable card to display all five sections inline
 *   - "Generate Now" button for on-demand reports
 *   - Pagination support
 */

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileX2,
  TrendingDown,
  TrendingUp,
  Minus,
  Zap,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
  listMonthlyReviews,
  getMonthlyReview,
  generateMonthlyReview,
} from "../../services/monthlyComplianceReviewApi";

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatMonth(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("en-GB", { month: "long", year: "numeric" });
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RiskBadge({ level }) {
  const cls =
    level === "high"
      ? "bg-red-100 text-red-700"
      : level === "medium"
      ? "bg-amber-100 text-amber-700"
      : "bg-green-100 text-green-700";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-black uppercase ${cls}`}>
      {level || "N/A"}
    </span>
  );
}

function RiskMovementIcon({ direction }) {
  if (direction === "improved") return <TrendingDown className="text-green-600" size={16} />;
  if (direction === "worse") return <TrendingUp className="text-red-500" size={16} />;
  return <Minus className="text-gray-400" size={16} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Five-section expanded view
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeading({ children }) {
  return (
    <h3 className="text-sm font-black text-secondary mb-3 flex items-center gap-1.5 border-b border-gray-100 pb-2">
      {children}
    </h3>
  );
}

function StatRow({ label, value, valueClass = "text-gray-800" }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 font-semibold">{label}</span>
      <span className={`text-xs font-black ${valueClass}`}>{value ?? "—"}</span>
    </div>
  );
}

function ComplianceSummarySection({ summary }) {
  if (!summary) return null;
  return (
    <div>
      <SectionHeading>
        <BarChart3 size={14} className="text-primary" /> 1. Compliance Summary
      </SectionHeading>
      <div className="space-y-0">
        <StatRow label="Total Workers" value={summary.totalWorkers} />
        <StatRow
          label="High Risk"
          value={summary.highRiskCount}
          valueClass={summary.highRiskCount > 0 ? "text-red-600" : "text-gray-800"}
        />
        <StatRow
          label="Medium Risk"
          value={summary.mediumRiskCount}
          valueClass={summary.mediumRiskCount > 0 ? "text-amber-600" : "text-gray-800"}
        />
        <StatRow label="Low Risk" value={summary.lowRiskCount} valueClass="text-green-600" />
        <StatRow
          label="Compliance Score"
          value={summary.complianceScore != null ? `${summary.complianceScore}%` : "N/A"}
          valueClass={
            summary.complianceScore >= 80
              ? "text-green-600"
              : summary.complianceScore >= 60
              ? "text-amber-600"
              : "text-red-600"
          }
        />
        <StatRow label="Risk Level" value={<RiskBadge level={(summary.riskLevel || "").toLowerCase()} />} />
        <StatRow label="Licence Status" value={summary.licenceStatus} />
        <StatRow label="Licence Expiry" value={formatDate(summary.licenceExpiryDate)} />
      </div>
    </div>
  );
}

function WorkersExpiringSection({ workers }) {
  if (!workers) return null;
  return (
    <div>
      <SectionHeading>
        <Clock size={14} className="text-amber-500" /> 2. Workers Expiring in 90 Days ({workers.length})
      </SectionHeading>
      {workers.length === 0 ? (
        <p className="text-xs text-green-600 font-semibold py-2">
          No workers expiring within 90 days.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[420px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-black uppercase text-[10px]">
                <th className="px-3 py-2">Worker</th>
                <th className="px-3 py-2">Visa Type</th>
                <th className="px-3 py-2">Expiry</th>
                <th className="px-3 py-2">Days Left</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-3 py-2 font-semibold text-gray-800">{w.candidateName || "—"}</td>
                  <td className="px-3 py-2 text-gray-600">{w.visaType || "—"}</td>
                  <td className="px-3 py-2 text-gray-600">{formatDate(w.visaEndDate)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`font-black ${
                        w.urgency === "high" ? "text-red-600" : "text-amber-600"
                      }`}
                    >
                      {w.daysRemaining != null ? `${w.daysRemaining}d` : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReportingHistorySection({ history }) {
  if (!history) return null;
  return (
    <div>
      <SectionHeading>
        <CheckCircle2 size={14} className="text-blue-500" /> 3. Reporting History
      </SectionHeading>
      <div className="space-y-0">
        <StatRow label="Total Actions" value={history.total} />
        <StatRow label="Submitted / Re-submitted" value={history.submitted} />
        <StatRow label="Under Review" value={history.underReview} />
        <StatRow label="Approved" value={history.approved} valueClass="text-green-600" />
        <StatRow label="Rejected" value={history.rejected} valueClass="text-red-600" />
        <StatRow label="Information Requested" value={history.informationRequested} valueClass="text-amber-600" />
      </div>
    </div>
  );
}

function MissingDocumentsSection({ documents }) {
  if (!documents) return null;
  return (
    <div>
      <SectionHeading>
        <FileX2 size={14} className="text-red-500" /> 4. Missing / Expired Documents ({documents.length})
      </SectionHeading>
      {documents.length === 0 ? (
        <p className="text-xs text-green-600 font-semibold py-2">
          No missing or expired documents.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[360px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-black uppercase text-[10px]">
                <th className="px-3 py-2">Document Type</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-3 py-2 font-semibold text-gray-800">{d.documentType || "—"}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        d.status === "rejected"
                          ? "bg-red-100 text-red-600"
                          : d.status === "expired"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{formatDate(d.expiryDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RiskMovementSection({ movement }) {
  if (!movement) return null;
  const { currentRiskScore, previousRiskScore, delta, direction, previousReportMonth } = movement;
  return (
    <div>
      <SectionHeading>
        <RiskMovementIcon direction={direction} /> 5. Risk Movement
      </SectionHeading>
      <div className="space-y-0">
        <StatRow
          label="Current Risk Score"
          value={currentRiskScore != null ? currentRiskScore : "N/A"}
          valueClass={
            currentRiskScore <= 20
              ? "text-green-600"
              : currentRiskScore <= 50
              ? "text-amber-600"
              : "text-red-600"
          }
        />
        <StatRow
          label="Previous Risk Score"
          value={previousRiskScore != null ? previousRiskScore : "No prior report"}
        />
        <StatRow
          label="Change"
          value={delta != null ? (delta > 0 ? `+${delta}` : `${delta}`) : "N/A"}
          valueClass={
            direction === "improved"
              ? "text-green-600"
              : direction === "worse"
              ? "text-red-600"
              : "text-gray-500"
          }
        />
        <StatRow
          label="Trend"
          value={
            direction === "improved"
              ? "Improved"
              : direction === "worse"
              ? "Worsened"
              : "Unchanged"
          }
          valueClass={
            direction === "improved"
              ? "text-green-600"
              : direction === "worse"
              ? "text-red-600"
              : "text-gray-500"
          }
        />
        <StatRow
          label="Compared to"
          value={previousReportMonth ? formatMonth(previousReportMonth) : "N/A"}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Review card (list item + expandable detail)
// ─────────────────────────────────────────────────────────────────────────────

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    if (detail) {
      setExpanded(true);
      return;
    }
    try {
      setLoading(true);
      const res = await getMonthlyReview(review.id);
      setDetail(res?.data?.data);
      setExpanded(true);
    } catch (err) {
      showToast({ message: "Failed to load report detail", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const payload = detail?.payload || {};
  const direction = payload.riskMovement?.direction;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Summary row — always visible */}
      <button
        onClick={handleExpand}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50/60 transition-colors"
        aria-expanded={expanded}
      >
        {/* Month */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary">
          <Calendar size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-black text-secondary text-sm">
            {formatMonth(review.reportMonth)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Generated {review.generatedBy === "manual" ? "manually" : "automatically"} ·{" "}
            {formatDate(review.created_at)}
          </p>
        </div>

        {/* Key metrics strip */}
        <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Workers</p>
            <p className="text-sm font-black text-gray-800">{review.totalWorkers ?? 0}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">High Risk</p>
            <p className={`text-sm font-black ${review.highRiskCount > 0 ? "text-red-600" : "text-gray-400"}`}>
              {review.highRiskCount ?? 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Expiring</p>
            <p className={`text-sm font-black ${review.workersExpiringIn90Days > 0 ? "text-amber-600" : "text-gray-400"}`}>
              {review.workersExpiringIn90Days ?? 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Missing Docs</p>
            <p className={`text-sm font-black ${review.missingDocumentCount > 0 ? "text-red-600" : "text-green-600"}`}>
              {review.missingDocumentCount ?? 0}
            </p>
          </div>
          <div className="text-center flex flex-col items-center">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Trend</p>
            <RiskMovementIcon direction={review.riskScoreDelta != null
              ? review.riskScoreDelta < 0 ? "improved" : review.riskScoreDelta > 0 ? "worse" : "unchanged"
              : null}
            />
          </div>
        </div>

        <div className="flex-shrink-0 text-gray-300 ml-2">
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : expanded ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </div>
      </button>

      {/* Expanded five-section detail */}
      {expanded && detail && (
        <div className="border-t border-gray-100 px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-8">
          <ComplianceSummarySection summary={payload.complianceSummary} />
          <ReportingHistorySection history={payload.reportingHistory} />
          <WorkersExpiringSection workers={payload.workersExpiring} />
          <MissingDocumentsSection documents={payload.missingDocuments} />
          <div className="md:col-span-2">
            <RiskMovementSection movement={payload.riskMovement} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function ComplianceMonthlyReview() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = useCallback(
    async (p = 1) => {
      try {
        setLoading(true);
        const res = await listMonthlyReviews({ page: p, limit: PAGE_SIZE });
        const data = res?.data?.data;
        setReviews(data?.reviews || []);
        setTotalPages(data?.pagination?.totalPages || 1);
      } catch (err) {
        showToast({ message: "Failed to load monthly reviews", variant: "danger" });
        setReviews([]);
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    fetchReviews(page);
  }, [page, fetchReviews]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await generateMonthlyReview();
      showToast({ message: "Monthly compliance review generated successfully", variant: "success" });
      setPage(1);
      await fetchReviews(1);
    } catch (err) {
      showToast({
        message: err?.response?.data?.message || "Failed to generate review",
        variant: "danger",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
            <BarChart3 className="text-primary" size={26} />
            Monthly Compliance Review
          </h1>
          <p className="text-primary font-bold text-sm mt-0.5">
            Section N — Automated monthly report covering compliance posture, expiring visas,
            missing documents, and risk trend.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-black shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 flex-shrink-0"
        >
          {generating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Zap size={15} />
          )}
          Generate Now
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
        <AlertTriangle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 font-semibold leading-relaxed">
          Monthly compliance reviews are generated automatically on the 1st of each month at 08:00 and
          emailed to your team. Use "Generate Now" to create an on-demand report for the current month.
        </p>
      </div>

      {/* Review list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-8 py-12 text-center">
          <BarChart3 className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-500 font-black text-base">No monthly reviews yet</p>
          <p className="text-gray-400 text-sm mt-1">
            The first automatic report will be generated on the 1st of next month.
            You can also generate one now using the button above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-black rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs font-black rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
