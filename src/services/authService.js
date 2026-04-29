import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      console.log("🔐 Attempting login with email:", email);
      console.log("📍 API Base URL:", import.meta.env.VITE_API_URL ?? '/api');
      
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      console.log("✅ Login response received:", response);
      console.log("📦 Response data:", response.data);
      
      return response.data;
    } catch (error) {
      console.error("❌ Login API error:", error);
      console.error("Error message:", error.message);
      console.error("Error response status:", error.response?.status);
      console.error("Error response data:", error.response?.data);
      console.error("Full error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw error;
    }
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyResetOTP: async (email, otp) => {
    const response = await api.post('/auth/verify-reset-otp', { email, otp });
    return response.data;
  },

  setPassword: async (email, newPassword) => {
    const response = await api.post('/auth/set-password', { email, newPassword });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export default authService;
