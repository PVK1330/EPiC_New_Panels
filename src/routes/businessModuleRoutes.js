/**
 * Path-prefix → module key for /business routes, mirroring BusinessSidebar's
 * navSections. Sidebar filtering only HIDES links — a user can still type the
 * URL — so RequireBusinessModule enforces the SAME plan-based scope at the route
 * level (frontend-guards-1). Keep in sync with components/business/BusinessSidebar.jsx.
 */
const BUSINESS_ROUTE_MODULES = [
  { prefix: "/business/profile", moduleKey: "business.profile" },
  { prefix: "/business/personnel", moduleKey: "business.profile" },
  { prefix: "/business/licence-documents", moduleKey: "business.licence" },
  { prefix: "/business/licence-process", moduleKey: "business.licence" },
  { prefix: "/business/licence", moduleKey: "business.licence" },
  { prefix: "/business/cosallocation", moduleKey: "business.licence" },
  { prefix: "/business/workers", moduleKey: "business.workers" },
  { prefix: "/business/employee-records", moduleKey: "business.workers" },
  { prefix: "/business/compliance-documents", moduleKey: "business.compliance" },
  { prefix: "/business/compliance-review", moduleKey: "business.compliance" },
  { prefix: "/business/monthly-compliance-review", moduleKey: "business.compliance" },
  { prefix: "/business/compliance", moduleKey: "business.compliance" },
  { prefix: "/business/reporting-obligations", moduleKey: "business.reporting-obligations" },
  { prefix: "/business/linked-entities", moduleKey: "business.compliance" },
  { prefix: "/business/right-to-work", moduleKey: "business.compliance" },
  { prefix: "/business/audit-log", moduleKey: "business.compliance" },
  { prefix: "/business/invoices", moduleKey: "business.payment" },
  { prefix: "/business/messages", moduleKey: "business.messages" },
  { prefix: "/business/calendar", moduleKey: "business.calendar" },
];

/**
 * Never gated: the redirect target, core self-service, and the PAYMENT page — a
 * business must always be able to reach its payment/settings pages regardless of
 * plan modules (otherwise it could be locked out of paying).
 */
const ALWAYS_ALLOWED = [
  "/business/dashboard",
  "/business/notifications",
  "/business/settings",
  "/business/payment",
  "/business/reports",
];

/** Resolve the module key a given /business pathname is gated by, or null. */
export function businessModuleForPath(pathname) {
  if (ALWAYS_ALLOWED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  let match = null;
  for (const entry of BUSINESS_ROUTE_MODULES) {
    if (pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`)) {
      if (!match || entry.prefix.length > match.prefix.length) match = entry;
    }
  }
  return match ? match.moduleKey : null;
}
