import api from "./api.js";

// Get RBAC overview
export const getRbacOverview = () =>
  api.get(`/api/admin/rbac/overview`);

// Get RBAC matrix
export const getRbacMatrix = () =>
  api.get(`/api/admin/rbac/matrix`);

// Get users with roles and permissions
export const getUsersWithRolesAndPermissions = (params = {}) =>
  api.get(`/api/admin/rbac/users`, { params });

// Get permission audit
export const getPermissionAudit = (permissionId) =>
  api.get(`/api/admin/rbac/audit/${permissionId}`);

// Get orphan permissions
export const getOrphanPermissions = () =>
  api.get(`/api/admin/rbac/orphan-permissions`);

// Get roles without permissions
export const getRolesWithoutPermissions = () =>
  api.get(`/api/admin/rbac/roles-without-permissions`);

// Bulk assign permissions
export const bulkAssignPermissions = (data) =>
  api.post(`/api/admin/rbac/bulk-assign`, data);

// Update a user's role
export const updateUserRole = (userId, roleId) =>
  api.patch(`/api/admin/roles/users/${userId}/role`, { roleId });
