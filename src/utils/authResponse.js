import { ROLE_NAMES, ROLE_ROUTES } from "./constants";

/**
 * Normalizes login / verify-OTP / 2FA API bodies from EPiC_API.
 * Supports both `{ user, token }` and `{ status, message, data: { user, token } }`.
 */
export function getAuthUserAndToken(apiBody) {
  if (!apiBody) return { user: null, token: null };
  if (apiBody.user && apiBody.token) {
    return { user: normalizeAuthUser(apiBody.user), token: apiBody.token };
  }
  const inner = apiBody.data;
  if (inner?.user && inner?.token) {
    return { user: normalizeAuthUser(inner.user), token: inner.token };
  }
  return { user: null, token: null };
}

/**
 * Ensures `role` string exists for routing (ProtectedRoute uses user.role).
 */
export function normalizeAuthUser(user) {
  if (!user) return null;
  const roleId = Number(user.role_id);
  const role =
    user.role ||
    user.role_name ||
    (Number.isNaN(roleId) ? null : ROLE_NAMES[roleId]) ||
    "candidate";

  return {
    ...user,
    role_id: Number.isNaN(roleId) ? user.role_id : roleId,
    role: String(role).toLowerCase(),
    organisation_id: user.organisation_id ?? null,
  };
}

/** Dashboard path for a user (never returns /undefined/dashboard). */
export function getDashboardRouteForUser(user) {
  const normalized = normalizeAuthUser(user);
  if (!normalized) return "/login";
  if (ROLE_ROUTES[normalized.role_id]) {
    return ROLE_ROUTES[normalized.role_id];
  }
  return `/${normalized.role}/dashboard`;
}
