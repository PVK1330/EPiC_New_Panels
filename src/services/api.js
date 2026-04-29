import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

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
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
