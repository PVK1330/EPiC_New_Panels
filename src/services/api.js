import axios from "axios";
import store from "../store";
import { logout } from "../store/slices/authSlice";
import { API_BASE_URL } from "../utils/constants";
import { getOrganisationSlugFromHost } from "../utils/organisationHost";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Attach organisation slug header and fallback Authorization token
api.interceptors.request.use((config) => {
  const orgSlug = getOrganisationSlugFromHost();
  if (orgSlug) {
    config.headers["X-Organisation-Slug"] = orgSlug;
  }
  const token = store.getState()?.auth?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      store.dispatch(logout());
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
