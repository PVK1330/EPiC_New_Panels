import api from './api';

// Microsoft OAuth (backend: /api/microsoft)
export const getMicrosoftAuthUrl = async () => {
  const response = await api.get('/api/microsoft/auth-url');
  return response.data;
};

export const getMicrosoftStatus = async () => {
  const response = await api.get('/api/microsoft/status');
  return response.data;
};

export const refreshMicrosoftToken = async () => {
  const response = await api.post('/api/microsoft/refresh-token');
  return response.data;
};

export const disconnectMicrosoft = async () => {
  const response = await api.post('/api/microsoft/disconnect');
  return response.data;
};

// Teams Meetings (backend: /api/teams-meetings)
export const createTeamsMeeting = async (meetingData) => {
  const response = await api.post('/api/teams-meetings', meetingData);
  return response.data;
};

export const syncTeamsMeetings = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await api.post('/api/teams-meetings/sync', null, { params });
  return response.data;
};

export const getTeamsMeetings = async (params = {}) => {
  const response = await api.get('/api/teams-meetings', { params });
  return response.data;
};

export const getTeamsMeetingById = async (id) => {
  const response = await api.get(`/api/teams-meetings/${id}`);
  return response.data;
};

export const updateTeamsMeeting = async (id, meetingData) => {
  const response = await api.put(`/api/teams-meetings/${id}`, meetingData);
  return response.data;
};

export const cancelTeamsMeeting = async (id) => {
  const response = await api.delete(`/api/teams-meetings/${id}`);
  return response.data;
};

export const getUpcomingMeetings = async (days = 30) => {
  const response = await api.get('/api/teams-meetings/upcoming', {
    params: { days },
  });
  return response.data;
};
