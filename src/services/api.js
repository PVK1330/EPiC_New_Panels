import axios from "axios";
import { getToken } from "../utils/storage";
import store from "../store";
import { logout } from "../store/slices/authSlice";
import { API_BASE_URL } from "../utils/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

<<<<<<< HEAD
console.log("🌐 API Instance created with baseURL:", api.defaults.baseURL);

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log("🔐 Token attached to request");
  }
  console.log("📤 Making request to:", config.baseURL + config.url);
  return config
})
=======
// Attach token from storage on every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
>>>>>>> 48aee01c18e1def51f2c3d6688e1237b6bc89d06

// Global error handling
api.interceptors.response.use(
  (response) => {
    console.log("📥 Response received:", response.status, response.statusText);
    return response;
  },
  (error) => {
    console.error("❌ API Response error:", error.response?.status, error.response?.statusText);
    console.error("Error data:", error.response?.data);
    
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
