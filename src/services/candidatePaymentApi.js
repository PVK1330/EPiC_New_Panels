import api from "./api";

const unwrap = (res) => res.data?.data ?? res.data;

export const createCaseCheckoutSession = () =>
  api.post("/api/candidate/payments/create-checkout-session").then(unwrap);

export const verifyCheckoutSession = (sessionId) =>
  api.get(`/api/candidate/payments/verify-session/${encodeURIComponent(sessionId)}`).then(unwrap);

export const getBankTransferDetails = () =>
  api.get("/api/candidate/payments/bank-transfer").then(unwrap);

export const notifyBankTransfer = (payload = {}) =>
  api.post("/api/candidate/payments/bank-transfer/notify", payload).then(unwrap);
