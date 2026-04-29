export const TAB_IDS = {
  overview:    "overview",
  matrix:      "matrix",
  roles:       "roles",
  permissions: "permissions",
  userRoles:   "userRoles",
};

export const TABS = [
  { id: TAB_IDS.overview,    label: "RBAC Overview",    icon: "chart" },
  { id: TAB_IDS.matrix,      label: "Permission Matrix", icon: "grid" },
  { id: TAB_IDS.roles,       label: "Role Management",  icon: "shield" },
  { id: TAB_IDS.permissions, label: "Permissions",      icon: "lock" },
  { id: TAB_IDS.userRoles,   label: "User Roles",       icon: "users" },
];

export const CASE_VISIBILITY_OPTIONS = [
  { value: "own",  label: "Own Cases" },
  { value: "team", label: "Team Cases" },
  { value: "all",  label: "All Cases" },
];

export const CREATE_ROLE_INHERIT_OPTIONS = [
  { value: "",           label: "No inheritance (blank role)" },
  { value: "admin",      label: "Admin" },
  { value: "caseworker", label: "Caseworker" },
  { value: "client",     label: "Client" },
  { value: "sponsor",    label: "Sponsor" },
];

export const MODULE_ACTION_OPTIONS = [
  { value: "read",   label: "Read" },
  { value: "write",  label: "Write" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "manage", label: "Manage" },
  { value: "export", label: "Export" },
  { value: "approve","label": "Approve" },
];

export const DEFAULT_MODULES = [
  "Dashboard",
  "Cases",
  "Documents",
  "Finance",
  "Reports",
  "Users",
  "Settings",
  "Audit",
  "Escalations",
  "Notifications",
  "Permissions",
];
