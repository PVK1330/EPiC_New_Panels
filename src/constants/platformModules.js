/** Mirrors EPIC_API platform modules — used if /team/modules is unavailable. */
export const PLATFORM_MODULES_FALLBACK = [
  { id: "dashboard", label: "Dashboard", description: "Business intelligence and KPIs" },
  { id: "organisations", label: "Organisations", description: "Tenant and user management" },
  { id: "plans", label: "Subscription Plans", description: "Pricing and tier configuration" },
  { id: "payments", label: "Financial Hub", description: "Stripe and revenue tracking" },
  { id: "billing", label: "Invoicing", description: "Invoices and usage credits" },
  { id: "audit-logs", label: "Audit Logs", description: "System and security events" },
  { id: "team", label: "Team Management", description: "Admin roles and permissions" },
  { id: "settings", label: "System Settings", description: "Global platform configuration" },
];

export const PLATFORM_MODULE_COUNT = PLATFORM_MODULES_FALLBACK.length;

export function formatPlatformRoleName(name, roleId) {
  if (roleId === 5 || name === "superadmin") return "Super Admin";
  if (!name) return "—";
  return String(name)
    .replace(/^platform_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
