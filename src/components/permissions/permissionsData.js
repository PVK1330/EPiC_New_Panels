export const TAB_IDS = {
  roles: 'roles',
  users: 'users',
};

export const TABS = [
  { id: 'roles',  label: 'Roles & Permissions', icon: 'shield' },
  { id: 'users',  label: 'Users & Roles',        icon: 'users'  },
];

export const CASE_VISIBILITY_OPTIONS = [
  { value: "own",  label: "Own Cases" },
  { value: "team", label: "Team Cases" },
  { value: "all",  label: "All Cases" },
];

export const MODULE_ACTION_OPTIONS = [
  { value: "view",   label: "View" },
  { value: "create", label: "Create" },
  { value: "edit",   label: "Edit" },
  { value: "delete", label: "Delete" },
  { value: "manage", label: "Manage" },
  { value: "export", label: "Export" },
];

export const DEFAULT_MODULES = [
  { name: "Dashboard", icon: "RiDashboardLine" },
  { name: "Cases", icon: "RiFolderLine" },
  { name: "Contacts", icon: "RiUserLine" },
  { name: "Finance", icon: "RiMoneyDollarCircleLine" },
  { name: "Reports", icon: "RiLineChartLine" },
  { name: "Infrastructure", icon: "RiShieldLine" },
  { name: "Security", icon: "RiLockLine" },
  { name: "Audit Log", icon: "RiFileListLine" },
];
