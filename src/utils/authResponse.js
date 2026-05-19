import { ROLE_NAMES, ROLE_ROUTES } from "./constants";

export function getAuthUserAndToken(apiBody) {
  if (!apiBody) return { user: null, token: null, allowedModules: [] };
  if (apiBody.user && apiBody.token) {
    return {
      user: normalizeAuthUser(apiBody.user),
      token: apiBody.token,
      allowedModules: apiBody.allowedModules ?? [],
    };
  }
  const inner = apiBody.data;
  if (inner?.user && inner?.token) {
    return {
      user: normalizeAuthUser(inner.user),
      token: inner.token,
      allowedModules: inner.allowedModules ?? [],
    };
  }
  return { user: null, token: null, allowedModules: [] };
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

export function getPasswordResetToken(apiBody) {
  if (!apiBody) return null;
  if (apiBody.reset_token) return apiBody.reset_token;
  return apiBody.data?.reset_token ?? null;
}

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
