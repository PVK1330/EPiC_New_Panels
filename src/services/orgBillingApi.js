import api from "./api";

const unwrap = (res) => res.data?.data ?? res.data;

/** Current org subscription + status (for the renewal page). */
export const getMySubscription = () =>
  api.get("/api/billing/subscription").then(unwrap);

/**
 * Create a Stripe Checkout session to pay & reactivate.
 * Returns { url, session_id } for paid plans, or { activated: true } for free plans.
 */
export const createSubscriptionCheckout = () =>
  api.post("/api/billing/checkout").then(unwrap);

/** Verify the checkout session after redirect and activate the subscription. */
export const verifySubscriptionSession = (sessionId) =>
  api
    .post(`/api/billing/verify-session/${encodeURIComponent(sessionId)}`)
    .then(unwrap);
