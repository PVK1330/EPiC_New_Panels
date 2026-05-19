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
export function isPlatformStaffUser(user) {
  if (!user) return false;
  return user.organisation_id == null || user.organisation_id === "";
}

export function normalizeAuthUser(user) {
  if (!user) return null;
  const roleId = Number(user.role_id);
  const roleName =
    user.role_name ||
    user.role ||
    (Number.isNaN(roleId) ? null : ROLE_NAMES[roleId]) ||
    "candidate";
  const platformStaff = isPlatformStaffUser(user);
  const panelRole = platformStaff ? "superadmin" : String(roleName).toLowerCase();

  return {
    ...user,
    role_id: Number.isNaN(roleId) ? user.role_id : roleId,
    role_name: String(roleName).toLowerCase(),
    role: panelRole,
    is_platform_staff: platformStaff,
    organisation_id: user.organisation_id ?? null,
  };
}

/** Password-reset OTP verify response: `{ reset_token }` or nested under `data`. */
export function getPasswordResetToken(apiBody) {
  if (!apiBody) return null;
  if (apiBody.reset_token) return apiBody.reset_token;
  return apiBody.data?.reset_token ?? null;
}

/** Dashboard path for a user (never returns /undefined/dashboard). */
export function getDashboardRouteForUser(user) {
  const normalized = normalizeAuthUser(user);
  if (!normalized) return "/login";
  if (normalized.is_platform_staff) {
    return "/superadmin/dashboard";
  }
  if (ROLE_ROUTES[normalized.role_id]) {
    return ROLE_ROUTES[normalized.role_id];
  }
  return `/${normalized.role_name || normalized.role}/dashboard`;
}
