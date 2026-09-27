import { AlertTriangle } from "lucide-react";
import { isTargetAfterVisaExpiry, formatUkDate } from "../../utils/visaExpiry";

/**
 * Phase 2 UAT 3.2: non-blocking warning shown under a target submission date
 * (new-case forms) or on a case page when the target date is after the
 * client's current visa expiry. Renders nothing otherwise.
 */
export default function TargetDateVisaWarning({ targetDate, visaExpiry, className = "" }) {
  if (!isTargetAfterVisaExpiry(targetDate, visaExpiry)) return null;
  return (
    <div
      role="alert"
      className={`mt-1.5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 ${className}`}
    >
      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
      <span>
        Target date ({formatUkDate(targetDate)}) is after the client's visa expiry (
        {formatUkDate(visaExpiry)}). In-country applications usually have to be made
        before current leave expires.
      </span>
    </div>
  );
}
