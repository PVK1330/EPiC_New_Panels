import React from "react";
import { ShieldAlert } from "lucide-react";
import LicenceStatusBadge from "./LicenceStatusBadge";

/** Exact warning copy required for blocked sponsorship actions. */
export const LICENCE_INACTIVE_WARNING =
  "Your Sponsorship Licence is not active. Approval is required before sponsorship actions can be performed.";

/**
 * Warning banner shown on Business pages when the sponsor licence is not Active.
 * Render it conditionally (e.g. when `ready && !licenceActive`).
 */
export default function LicenceGateBanner({ status, className = "" }) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 ${className}`}
    >
      <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={20} />
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-black text-amber-800">
            Sponsorship Licence Not Active
          </p>
          {status && <LicenceStatusBadge status={status} />}
        </div>
        <p className="text-xs font-bold text-amber-700 mt-1">
          {LICENCE_INACTIVE_WARNING}
        </p>
      </div>
    </div>
  );
}
