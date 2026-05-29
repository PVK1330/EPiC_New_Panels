import api from './api';

export const getAuditLogs = async (params) => {
  const response = await api.get('/api/audit-logs', { params });
  return response.data;
};

export const exportAuditLogs = async (params) => {
  const response = await api.get('/api/audit-logs/export', { 
    params,
    responseType: 'blob' 
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('href');
  link.href = url;
  
  // Extract filename from header or fallback
  let filename = 'Audit_Export.xlsx';
  const disposition = response.headers['content-disposition'];
  if (disposition && disposition.includes('filename=')) {
    filename = disposition.split('filename=')[1].replace(/"/g, '');
  }
  
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
  
  return true;
};
