import api from './api';

export const getGoogleAuthUrl = async () => {
  const response = await api.get('/api/google/auth-url');
  return response.data;
};

export const getGoogleStatus = async () => {
  const response = await api.get('/api/google/status');
  return response.data;
};

export const disconnectGoogle = async () => {
  const response = await api.post('/api/google/disconnect');
  return response.data;
};
