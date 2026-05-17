import api from './api';

export const getCaseTimeline = (caseId) => api.get(`/api/case-details/${caseId}/timeline`);
export const addTimelineEntry = (data) => api.post('/api/case-details/timeline', data);
export const updateTimelineEntry = (id, data) => api.put(`/api/case-details/timeline/${id}`, data);
export const deleteTimelineEntry = (id) => api.delete(`/api/case-details/timeline/${id}`);
