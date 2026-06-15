import { apiClient } from "./axios.instance";

// Normalises an axios/network error into a thrown Error with a human-readable
// message. It intentionally THROWS (every caller invokes it from a catch block
// and relies on propagation) — see BUG-025/BUG-029. The added guard prevents a
// crash when `error` is null/undefined or a non-object (BUG-029).
const extractError = (error, fallback) => {
  if (!error || typeof error !== "object") {
    throw new Error(fallback || "An unknown error occurred");
  }
  const d = error.response?.data;
  if (typeof d?.message === "string" && d.message.trim()) {
    throw new Error(d.message);
  }
  if (typeof d?.error === "string" && d.error.trim()) {
    throw new Error(d.error);
  }
  if (typeof error.message === "string" && error.message.trim()) {
    throw new Error(error.message);
  }
  throw new Error(fallback || "An unknown error occurred");
};

export const registerUser = async (data) => {
  try {
    const response = await apiClient.post("/api/auth/register", data);
    return response.data;
  } catch (error) {
    extractError(error, "Registration failed");
  }
};

export const verifyOtp = async (data) => {
  try {
    const response = await apiClient.post("/api/auth/verify-otp", data);
    return response.data;
  } catch (error) {
    extractError(error, "OTP verification failed");
  }
};

export const resendOtp = async (email, organisationId) => {
  try {
    const payload = { email };
    if (organisationId) payload.organisation_id = organisationId;
    const response = await apiClient.post("/api/auth/resend-otp", payload);
    return response.data;
  } catch (error) {
    extractError(error, "Failed to resend OTP");
  }
};

export const loginUser = async (data) => {
  try {
    const response = await apiClient.post("/api/auth/login", data);
    return response.data;
  } catch (error) {
    extractError(error, "Login failed");
  }
};

export const verifyTwoFactor = async (data) => {
  try {
    const response = await apiClient.post("/api/auth/2fa/verify", data);
    return response.data;
  } catch (error) {
    extractError(error, "2FA verification failed");
  }
};

export const setup2FA = async () => {
  try {
    const response = await apiClient.post("/api/auth/2fa/setup");
    return response.data;
  } catch (error) {
    extractError(error, "2FA setup failed");
  }
};

export const verifySetup2FA = async (data) => {
  try {
    const response = await apiClient.post("/api/auth/2fa/verify-setup", data);
    return response.data;
  } catch (error) {
    extractError(error, "2FA setup verification failed");
  }
};

export const disable2FA = async (data) => {
  try {
    const response = await apiClient.post("/api/auth/2fa/disable", data);
    return response.data;
  } catch (error) {
    extractError(error, "Failed to disable 2FA");
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post("/api/auth/forgot-password", {
      email,
    });
    return response.data;
  } catch (error) {
    extractError(error, "Failed to send reset OTP");
  }
};

export const verifyResetOtp = async (data) => {
  try {
    const response = await apiClient.post("/api/auth/verify-reset-otp", data);
    return response.data;
  } catch (error) {
    extractError(error, "OTP verification failed");
  }
};

export const setNewPassword = async (data) => {
  try {
    const response = await apiClient.post("/api/auth/set-password", data);
    return response.data;
  } catch (error) {
    extractError(error, "Failed to set new password");
  }
};

export const logoutUser = async () => {
  try {
    const response = await apiClient.post("/api/auth/logout");
    return response.data;
  } catch (error) {
    extractError(error, "Logout failed");
  }
};

export const resendOtpUser = async (email) => {
  try {
    const response = await apiClient.post("/api/auth/resendOtpUser", { email });
    return response.data;
  } catch (error) {
    extractError(error, "Failed to resend OTP");
  }
};

export const verifyOtpUser = async (data) => {
  try {
    const response = await apiClient.post("/api/auth/verifyOtpUser", data);
    return response.data;
  } catch (error) {
    extractError(error, "OTP verification failed");
  }
};
