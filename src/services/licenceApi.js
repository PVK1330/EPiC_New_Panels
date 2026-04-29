import api from "./api";

// Sponsor / Business side
export const submitLicenceApplication = (data) => {
  // Use FormData if documents are present
  if (data.documents && data.documents.length > 0) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'documents') {
        data.documents.forEach(file => formData.append('documents', file));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post("/api/business/licence/apply", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
  return api.post("/api/business/licence/apply", data);
};

export const getMyLicenceApplications = () => api.get("/api/business/licence/my-applications");
export const getLicenceApplicationDetails = (id) => api.get(`/api/business/licence/details/${id}`);

export const updateLicenceApplication = async (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (key === 'documents' && Array.isArray(data[key])) {
            data[key].forEach(file => {
                if (file instanceof File) {
                    formData.append('documents', file);
                }
            });
        } else if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
        }
    });

    return await api.put(`/api/business/licence/update/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const deleteMyLicenceApplication = (id) => api.delete(`/api/business/licence/delete/${id}`);
export const getLicenceDocuments = () => api.get("/api/business/licence/documents");

// Admin side
export const getAllLicenceApplications = (params = {}) => api.get("/api/admin/licence/all", { params });
export const updateLicenceApplicationStatus = (id, data) => api.patch(`/api/admin/licence/update-status/${id}`, data);
export const getAdminLicenceApplicationDetails = (id) => api.get(`/api/admin/licence/details/${id}`);
export const requestLicenceInfo = (id, data) => api.patch(`/api/admin/licence/request-info/${id}`, data);
export const assignLicenceCaseworker = (id, data) => api.post(`/api/admin/licence/assign-caseworker/${id}`, data);
export const deleteLicenceApplicationByAdmin = (id) => api.delete(`/api/admin/licence/delete/${id}`);
