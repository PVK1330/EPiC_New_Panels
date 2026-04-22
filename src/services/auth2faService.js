import api from "./api";

export const setup2fa = () => api.post("/api/auth/2fa/setup");

export const verify2faSetup = (data) => api.post("/api/auth/2fa/verify-setup", data);

export const disable2fa = (data) => api.post("/api/auth/2fa/disable", data);
