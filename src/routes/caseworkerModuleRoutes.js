/**
 * Path-prefix → module key for /caseworker routes, mirroring caseworkerNavSections.
 * Sidebar filtering only HIDES links — a user can still type the URL — so
 * RequireCaseworkerModule uses this map to enforce the SAME plan-based scope at
 * the route level (frontend-guards-1 / frontend-guards-7: CaseworkerFinance was
 * reachable by direct URL with no plan gate). Keep in sync with
 * components/caseworkerNavSections.js.
 */
const CASEWORKER_ROUTE_MODULES = [
  { prefix: "/caseworker/cases", moduleKey: "caseworker.cases" },
  { prefix: "/caseworker/ccl-templates", moduleKey: "caseworker.cases" },
  { prefix: "/caseworker/case-detail", moduleKey: "caseworker.cases" },
  { prefix: "/caseworker/tasks", moduleKey: "caseworker.tasks" },
  { prefix: "/caseworker/calendar", moduleKey: "caseworker.calendar" },
  { prefix: "/caseworker/reschedule-form", moduleKey: "caseworker.calendar" },
  { prefix: "/caseworker/people", moduleKey: "caseworker.people" },
  { prefix: "/caseworker/licence-reviews", moduleKey: "caseworker.licence-reviews" },
  { prefix: "/caseworker/cos-requests", moduleKey: "caseworker.licence-reviews" },
  { prefix: "/caseworker/compliance-review", moduleKey: "caseworker.licence-reviews" },
  { prefix: "/caseworker/documents", moduleKey: "caseworker.documents" },
  { prefix: "/caseworker/pipeline", moduleKey: "caseworker.pipeline" },
  { prefix: "/caseworker/finance", moduleKey: "caseworker.finance" },
  { prefix: "/caseworker/performance", moduleKey: "caseworker.performance" },
  { prefix: "/caseworker/messages", moduleKey: "caseworker.messages" },
];

/**
 * Never gated: the redirect target plus core self-service, so a caseworker can
 * always reach their dashboard, notifications and account (and no redirect loop).
 */
const ALWAYS_ALLOWED = [
  "/caseworker/dashboard",
  "/caseworker/notifications",
  "/caseworker/my-account",
];

/** Resolve the module key a given /caseworker pathname is gated by, or null. */
export function caseworkerModuleForPath(pathname) {
  if (ALWAYS_ALLOWED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  let match = null;
  for (const entry of CASEWORKER_ROUTE_MODULES) {
    if (pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`)) {
      if (!match || entry.prefix.length > match.prefix.length) match = entry;
    }
  }
  return match ? match.moduleKey : null;
}
