import api from "./api.js";

// Create a permission
export const createPermission = (data) => 
  api.post("/api/admin/permissions", data);

// Get all permissions
export const getAllPermissions = (params = {}) => 
  api.get("/api/admin/permissions", { params });

// Get permission by ID
export const getPermissionById = (id) => 
  api.get(`/api/admin/permissions/${id}`);

// Update a permission
export const updatePermission = (id, data) => 
  api.put(`/api/admin/permissions/${id}`, data);

// Delete a permission
export const deletePermission = (id) => 
  api.delete(`/api/admin/permissions/${id}`);

// Check user permission (utility endpoint if needed)
export const checkUserPermission = (permission) => 
  api.get(`/api/admin/permissions/check`, { params: { permission } });
