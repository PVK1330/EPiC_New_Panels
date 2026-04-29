import api from "./api.js";

// Get all roles
export const getAllRoles = (params = {}) => 
  api.get(`/api/admin/roles`, { params });

// Get role by ID
export const getRoleById = (id) => 
  api.get(`/api/admin/roles/${id}`);

// Get role permissions
export const getRolePermissions = (id) => 
  api.get(`/api/admin/roles/${id}/permissions`);

// Get role with permissions
export const getRoleWithPermissions = (id) => 
  api.get(`/api/admin/roles/${id}/with-permissions`);

// Create role
export const createRole = (data) => 
  api.post(`/api/admin/roles`, data);

// Update role
export const updateRole = (id, data) => 
  api.put(`/api/admin/roles/${id}`, data);

// Delete role
export const deleteRole = (id) => 
  api.delete(`/api/admin/roles/${id}`);

// Assign permissions to role
export const assignPermissionsToRole = (id, data) => 
  api.post(`/api/admin/roles/${id}/permissions`, data);

// Remove permission from role
export const removePermissionFromRole = (roleId, permissionId) => 
  api.delete(`/api/admin/roles/${roleId}/permissions/${permissionId}`);

// Clone role permissions
export const cloneRolePermissions = (data) => 
  api.post(`/api/admin/roles/clone-permissions`, data);
