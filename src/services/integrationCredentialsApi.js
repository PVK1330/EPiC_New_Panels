import api from './api';

// Per-tenant Google & Microsoft OAuth credentials (admin only).
// Backend: /api/settings/integrations/credentials

export const getIntegrationCredentials = async () => {
  const response = await api.get('/api/settings/integrations/credentials');
  return response.data;
};

export const updateIntegrationCredentials = async (payload) => {
  // payload: { google?: {...}, microsoft?: {...} }
  const response = await api.put('/api/settings/integrations/credentials', payload);
  return response.data;
};
