import api from "./api";

const unwrap = (res) => res.data?.data ?? res.data;

export const createCaseCheckoutSession = () =>
  api.post("/api/candidate/payments/create-checkout-session").then(unwrap);

export const verifyCheckoutSession = (sessionId) =>
  api.get(`/api/candidate/payments/verify-session/${encodeURIComponent(sessionId)}`).then(unwrap);
