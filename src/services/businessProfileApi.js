import api from "./api";

/**
 * Get the current business user's profile
 */
export const getBusinessProfile = () => api.get("/api/business/account/profile");

/**
 * Update the business user's profile
 * @param {FormData|Object} data - Profile data (use FormData if uploading a file)
 */
export const updateBusinessProfile = (data) => {
  const config = data instanceof FormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
  return api.put("/api/business/account/profile", data, config);
};

/**
 * Update Key Personnel
 * @param {Object} data - Personnel data
 */
export const updateKeyPersonnel = (data) => api.put("/api/business/account/key-personnel", data);

/**
 * Change the business user's password
 * @param {Object} data - { current_password, new_password }
 */
export const changeBusinessPassword = (data) => api.post("/api/business/account/change-password", data);

export const getBusinessDashboard = () =>
  api.get("/api/business/dashboard");

export const getBusinessCases = (params = {}) =>
  api.get("/api/business/cases", { params });

export const getBusinessPayments = () =>
  api.get("/api/business/payments");

/**
 * Start a Stripe Checkout for a sponsor payable on the tenant's Stripe account.
 * @param {{ payableType: 'licence_fee'|'isc'|'case_fee', payableRef: string|number }} payload
 */
export const createSponsorPaymentCheckout = (payload) =>
  api.post("/api/business/payments/checkout", payload);

/** Verify + finalise a sponsor Checkout session after returning from Stripe. */
export const verifySponsorPayment = (sessionId) =>
  api.get(`/api/business/payments/verify-session/${sessionId}`);

