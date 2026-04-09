export const TAB_IDS = {
  matrix: "matrix",
  roles: "roles",
  visibility: "visibility",
  segregation: "segregation",
};

export const TABS = [
  { id: TAB_IDS.matrix, label: "Module Matrix" },
  { id: TAB_IDS.roles, label: "Role Assignment" },
  { id: TAB_IDS.visibility, label: "Visibility Controls" },
  { id: TAB_IDS.segregation, label: "Int / Ext Segregation" },
];

export const MODULE_MATRIX_ROWS = [
  {
    module: "Dashboard",
    superAdmin: "full",
    admin: "full",
    caseworker: "full",
    client: "limited",
    sponsor: "limited",
    read: true,
    write: false,
    approve: false,
    delete: false,
  },
  {
    module: "Case Management",
    superAdmin: "full",
    admin: "full",
    caseworker: "full",
    client: "none",
    sponsor: "none",
    read: true,
    write: true,
    approve: true,
    delete: false,
  },
  {
    module: "Finance",
    superAdmin: "full",
    admin: "full",
    caseworker: "none",
    client: "none",
    sponsor: "none",
    read: true,
    write: false,
    approve: true,
    delete: false,
  },
  {
    module: "User Management",
    superAdmin: "full",
    admin: "limited",
    caseworker: "none",
    client: "none",
    sponsor: "none",
    read: true,
    write: true,
    approve: false,
    delete: true,
  },
  {
    module: "Reports",
    superAdmin: "full",
    admin: "full",
    caseworker: "limited",
    client: "none",
    sponsor: "none",
    read: true,
    write: false,
    approve: false,
    delete: false,
  },
  {
    module: "Documents",
    superAdmin: "full",
    admin: "full",
    caseworker: "full",
    client: "limited",
    sponsor: "limited",
    read: true,
    write: true,
    approve: true,
    delete: false,
  },
  {
    module: "Audit Logs",
    superAdmin: "full",
    admin: "limited",
    caseworker: "none",
    client: "none",
    sponsor: "none",
    read: true,
    write: false,
    approve: false,
    delete: false,
  },
  {
    module: "Settings",
    superAdmin: "full",
    admin: "none",
    caseworker: "none",
    client: "none",
    sponsor: "none",
    read: true,
    write: true,
    approve: false,
    delete: true,
  },
];

export const ASSIGNMENT_USERS = [
  { value: "u1", label: "Alice Patel — Caseworker" },
  { value: "u2", label: "Marcus Green — Caseworker" },
  { value: "u3", label: "Mohamed Rashid — Admin" },
];

export const ASSIGNMENT_ROLES = [
  { value: "Super Admin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
  { value: "Caseworker", label: "Caseworker" },
  { value: "Client", label: "Client" },
  { value: "Sponsor", label: "Sponsor" },
];

export const ACCESS_SCOPE_OPTIONS = [
  { value: "own", label: "Own Cases Only" },
  { value: "team", label: "Team Cases" },
  { value: "all", label: "All Cases" },
];

export const MODULE_OPTIONS_MULTI = [
  { value: "cases", label: "Cases" },
  { value: "documents", label: "Documents" },
  { value: "finance", label: "Finance" },
  { value: "reports", label: "Reports" },
];

export const CASE_VISIBILITY_OPTIONS = [
  { value: "own", label: "Own Cases" },
  { value: "team", label: "Team Cases" },
  { value: "all", label: "All Cases" },
];

export const CREATE_ROLE_INHERIT_OPTIONS = [
  { value: "", label: "No inheritance (blank role)" },
  { value: "super_admin", label: "Super Admin (full)" },
  { value: "admin", label: "Admin" },
  { value: "caseworker", label: "Caseworker" },
  { value: "client", label: "Client" },
  { value: "sponsor", label: "Sponsor" },
];
