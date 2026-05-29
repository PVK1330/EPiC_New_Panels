import api from './api';

export const getGlobalTimeline = async (params) => {
  const response = await api.get('/api/timeline/global', { params });
  return response.data;
};

export const getCaseTimeline = async (caseId, params) => {
  const response = await api.get(`/api/timeline/case/${caseId}`, { params });
  return response.data;
};

export const getCandidateTimeline = async (candidateId, params) => {
  const response = await api.get(`/api/timeline/candidate/${candidateId}`, { params });
  return response.data;
};

export const getSponsorTimeline = async (sponsorId, params) => {
  const response = await api.get(`/api/timeline/sponsor/${sponsorId}`, { params });
  return response.data;
};
