import axios from "axios";
import { getToken } from "../utils/storage";
import store from "../store";
import { logout } from "../store/slices/authSlice";
import { API_BASE_URL } from "../utils/constants";
import { getOrganisationSlugFromHost } from "../utils/organisationHost";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});



// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = getToken() || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const orgSlug = getOrganisationSlugFromHost();
  if (orgSlug) {
    config.headers["X-Organisation-Slug"] = orgSlug;
  }
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
