import api from "./api";

// Get Dashboard Statistics
export const getDashboardStats = () => api.get("/api/dashboard/stats");

// Get Recent Cases
export const getRecentCases = (params = {}) => api.get("/api/dashboard/recent-cases", { params });

// Get Recent Tasks
export const getRecentTasks = (params = {}) => api.get("/api/dashboard/recent-tasks", { params });

// Get Recent Activities
export const getRecentActivities = (params = {}) => api.get("/api/dashboard/recent-activities", { params });

// Get Quick Actions
export const getQuickActions = () => api.get("/api/dashboard/quick-actions");
