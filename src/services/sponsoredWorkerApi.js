import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeader = () => {
  const token = localStorage.getItem("epic_token");
  return { Authorization: `Bearer ${token}` };
};

export const addSponsoredWorker = async (workerData) => {
  return await axios.post(`${API_URL}/api/business/workers`, workerData, {
    headers: getAuthHeader(),
  });
};

export const getSponsoredWorkers = async () => {
  return await axios.get(`${API_URL}/api/business/workers`, {
    headers: getAuthHeader(),
  });
};

export const getSponsoredWorkerDetails = async (id) => {
  return await axios.get(`${API_URL}/api/business/workers/${id}`, {
    headers: getAuthHeader(),
  });
};
export const updateSponsoredWorker = async (id, workerData) => {
  return await axios.put(`${API_URL}/api/business/workers/${id}`, workerData, {
    headers: getAuthHeader(),
  });
};

export const deleteSponsoredWorker = async (id) => {
  return await axios.delete(`${API_URL}/api/business/workers/${id}`, {
    headers: getAuthHeader(),
  });
};

export const updateWorkerStatus = async (id, statusData) => {
  return await axios.patch(`${API_URL}/api/business/workers/${id}/status`, statusData, {
    headers: getAuthHeader(),
  });
};
