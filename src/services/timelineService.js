import api from './api';

export const getCaseTimeline = (caseId) => api.get(`/api/cases/${caseId}/timeline`);
export const addTimelineEntry = (data) => api.post('/api/timeline', data);
export const updateTimelineEntry = (id, data) => api.put(`/api/timeline/${id}`, data);
export const deleteTimelineEntry = (id) => api.delete(`/api/timeline/${id}`);
