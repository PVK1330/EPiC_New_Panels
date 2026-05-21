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
  const isPlatformStaff = user.organisation_id == null || user.organisation_id === "";
  const roleName =
    user.role_name ||
    user.role ||
    (Number.isNaN(roleId) ? null : ROLE_NAMES[roleId]) ||
    "candidate";
  const panelRole = isPlatformStaff ? "superadmin" : String(roleName).toLowerCase();

  return {
    ...user,
    role_id: Number.isNaN(roleId) ? user.role_id : roleId,
    role_name: String(roleName).toLowerCase(),
    role: panelRole,
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
  const isPlatformStaff =
    normalized.organisation_id == null || normalized.organisation_id === "";
  if (isPlatformStaff) {
    return ROLE_ROUTES[normalized.role_id] || "/superadmin/dashboard";
  }
  if (ROLE_ROUTES[normalized.role_id]) {
    return ROLE_ROUTES[normalized.role_id];
  }
  return `/${normalized.role_name || normalized.role}/dashboard`;
}

/** Role string for Redux after login — preserves API-normalized platform panel role. */
export function resolveLoginRole(userData) {
  return userData?.role || ROLE_NAMES[userData?.role_id] || "candidate";
}

/** Profile dropdown routes by role (role_id preferred, then role string). */
export function getProfileMenuPaths(user) {
  const roleId = Number(user?.role_id);
  if (!Number.isNaN(roleId)) {
    switch (roleId) {
      case 1:
        return {
          profile: "/candidate/account?tab=profile",
          settings: "/candidate/account",
        };
      case 2:
        return {
          profile: "/caseworker/my-account",
          settings: "/caseworker/my-account",
        };
      case 3:
        return { profile: "/admin/settings", settings: "/admin/settings" };
      case 4:
        return {
          profile: "/business/profile",
          settings: "/business/account",
        };
      case 5:
      case 6:
      case 7:
      case 8:
        return {
          profile: "/superadmin/profile",
          settings: "/superadmin/settings",
        };
      default:
        break;
    }
  }

  const role = String(user?.role || "").toLowerCase();
  switch (role) {
    case "candidate":
      return {
        profile: "/candidate/account?tab=profile",
        settings: "/candidate/account",
      };
    case "caseworker":
      return {
        profile: "/caseworker/my-account",
        settings: "/caseworker/my-account",
      };
    case "admin":
      return { profile: "/admin/settings", settings: "/admin/settings" };
    case "business":
      return {
        profile: "/business/profile",
        settings: "/business/account",
      };
    case "superadmin":
    case "support_agent":
    case "billing_manager":
    case "compliance_officer":
      return {
        profile: "/superadmin/profile",
        settings: "/superadmin/settings",
      };
    default:
      return null;
  }
}
