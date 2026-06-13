import { useEffect, useState } from "react";
import { getBusinessDashboard } from "../services/businessProfileApi";

/**
 * Shared sponsor-licence access state for the Business portal.
 *
 * Reads the licence gate fields exposed by GET /api/business/dashboard
 * (licenceStatus, licenceActive, canRequestCos, canSponsorWorkers, licenceNumber)
 * — the same state the backend enforces via requireActiveSponsorLicence().
 *
 * Design notes:
 *  - Module-level cache + pub/sub so every consumer shares ONE fetch.
 *  - Fail-OPEN: if the fetch fails we leave `ready = false`, so the UI does not
 *    gate on uncertain data (the backend still enforces, and the 403 interceptor
 *    surfaces a friendly message). Gating only happens on confirmed state.
 *  - Refetches when a `licence:refresh` window event fires (dispatched by the
 *    axios 403 interceptor and after activation-related actions).
 */
const DEFAULT = {
  ready: false,            // true only after a successful load
  licenceStatus: null,    // Pending | Under Review | Information Requested | Rejected | Active | Suspended | Expired
  licenceActive: false,
  canRequestCos: false,
  canSponsorWorkers: false,
  licenceNumber: null,
};

let cache = { ...DEFAULT };
let inflight = null;
const listeners = new Set();

const emit = () => listeners.forEach((fn) => fn(cache));

function load(force = false) {
  if (cache.ready && !force) return Promise.resolve(cache);
  if (inflight) return inflight;

  inflight = getBusinessDashboard()
    .then((res) => {
      const d = res?.data?.data || {};
      const active = d.licenceActive ?? d.licenceStatus === "Active";
      cache = {
        ready: true,
        licenceStatus: d.licenceStatus ?? null,
        licenceActive: active,
        canRequestCos: d.canRequestCos ?? active,
        canSponsorWorkers: d.canSponsorWorkers ?? active,
        licenceNumber: d.licenceNumber ?? null,
      };
    })
    .catch(() => {
      // Fail open — don't gate on an unknown state. Backend still enforces.
      cache = { ...DEFAULT, ready: false };
    })
    .finally(() => {
      inflight = null;
      emit();
    });

  return inflight;
}

/** Force a refresh of the shared licence state (e.g. after activation). */
export function refreshSponsorLicence() {
  return load(true);
}

export default function useSponsorLicence() {
  const [state, setState] = useState(cache);

  useEffect(() => {
    listeners.add(setState);
    load(); // fetch once if not already loaded

    const onRefresh = () => load(true);
    window.addEventListener("licence:refresh", onRefresh);

    return () => {
      listeners.delete(setState);
      window.removeEventListener("licence:refresh", onRefresh);
    };
  }, []);

  return { ...state, refresh: () => load(true) };
}
