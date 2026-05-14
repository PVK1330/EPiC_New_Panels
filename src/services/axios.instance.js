import api from './api';

// Deprecated standalone instance: re-exporting the centralized `api` instance
// to ensure uniform interceptor configuration and centralized token management.
export const apiClient = api;

