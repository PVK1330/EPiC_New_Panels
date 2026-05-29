import api from './api';

export const getAuditLogs = async (params) => {
  const response = await api.get('/api/audit-logs', { params });
  return response.data;
};

export const exportAuditLogs = async (params) => {
  const response = await api.get('/api/audit-logs/export', {
    params,
    responseType: 'blob',
  });

  let filename = `Audit_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
  const disposition = response.headers?.['content-disposition'];
  if (disposition && disposition.includes('filename=')) {
    filename = disposition.split('filename=')[1].replace(/"/g, '').trim();
  }

  const blob = new Blob([response.data], {
    type: response.headers?.['content-type'] ||
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);

  return true;
};
