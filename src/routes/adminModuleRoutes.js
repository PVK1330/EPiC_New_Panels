/**
 * Path-prefix → module key for /admin routes, mirroring AdminSidebar's
 * navSections. Sidebar filtering only hides links — a user can still type the
 * URL — so RequireAdminModule uses this map to enforce the SAME plan-based scope
 * at the route level: a plan that excludes a module genuinely cannot reach it.
 *
 * Keep in sync with components/admin/AdminSidebar.jsx navSections.
 */
const ADMIN_ROUTE_MODULES = [
  { prefix: "/admin/caseworkers", moduleKey: "admin.caseworkers" },
  { prefix: "/admin/candidates", moduleKey: "admin.candidates" },
  { prefix: "/admin/businesses", moduleKey: "admin.businesses" },
  { prefix: "/admin/enquiries", moduleKey: "admin.enquiries" },
  { prefix: "/admin/ccl-fee-approvals", moduleKey: "admin.cases" },
  { prefix: "/admin/cases", moduleKey: "admin.cases" },
  { prefix: "/admin/case-detail", moduleKey: "admin.cases" },
  { prefix: "/admin/case-process", moduleKey: "admin.cases" },
  { prefix: "/admin/pipeline", moduleKey: "admin.pipeline" },
  { prefix: "/admin/calendar", moduleKey: "admin.calendar" },
  { prefix: "/admin/escalations", moduleKey: "admin.escalations" },
  { prefix: "/admin/licence-requests", moduleKey: "admin.licence-requests" },
  { prefix: "/admin/cos-requests", moduleKey: "admin.licence-requests" },
  { prefix: "/admin/compliance-review", moduleKey: "admin.licence-requests" },
  { prefix: "/admin/workload", moduleKey: "admin.workload" },
  { prefix: "/admin/finance", moduleKey: "admin.finance" },
  { prefix: "/admin/reports", moduleKey: "admin.reports" },
  { prefix: "/admin/messages", moduleKey: "admin.messages" },
  { prefix: "/admin/audit-logs", moduleKey: "admin.audit-logs" },
  // URL-only pages (not in the sidebar) that are still real, plan-excludable
  // modules — gate them too so the plan scope holds for direct navigation.
  { prefix: "/admin/documents", moduleKey: "admin.documents" },
  { prefix: "/admin/assign", moduleKey: "admin.assign" },
  { prefix: "/admin/departments", moduleKey: "admin.departments" },
  { prefix: "/admin/permissions", moduleKey: "admin.permissions" },
];

/**
 * Paths that must NEVER be gated: the redirect target plus core admin
 * self-service. Prevents redirect loops and ensures an admin can always reach
 * their dashboard, settings, and the subscription/pay page.
 */
const ALWAYS_ALLOWED = ["/admin/dashboard", "/admin/settings", "/admin/subscription"];

/** Resolve the module key a given /admin pathname is gated by, or null if ungated. */
export function adminModuleForPath(pathname) {
  if (
    ALWAYS_ALLOWED.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return null;
  }
  // Longest matching prefix wins (so /admin/cases vs /admin/case-detail resolve
  // independently and detail routes inherit their parent module).
  let match = null;
  for (const entry of ADMIN_ROUTE_MODULES) {
    if (pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`)) {
      if (!match || entry.prefix.length > match.prefix.length) match = entry;
    }
  }
  return match ? match.moduleKey : null;
}
