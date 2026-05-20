/**
 * platformSettingsApi.js
 * Frontend service functions for the three platform settings groups.
 * All calls go to /api/superadmin/settings/* and require a superadmin JWT.
 */

import api from "./api";

// ---------------------------------------------------------------------------
// GROUP 1 — Identity
// ---------------------------------------------------------------------------

/** GET /api/superadmin/settings/identity */
export const getIdentitySettings = () =>
  api.get("/api/superadmin/settings/identity");

/**
 * PATCH /api/superadmin/settings/identity
 * @param {Object} data - Partial object with any of:
 *   platform_name, support_email, default_locale, timezone,
 *   maintenance_mode, signups_enabled, analytics_enabled
 */
export const updateIdentitySettings = (data) =>
  api.patch("/api/superadmin/settings/identity", data);

// ---------------------------------------------------------------------------
// GROUP 2 — Connectivity
// ---------------------------------------------------------------------------

/**
 * GET /api/superadmin/settings/connectivity
 * @param {boolean} reveal - Pass true to receive unmasked secrets (superadmin only).
 */
export const getConnectivitySettings = (reveal = false) =>
  api.get("/api/superadmin/settings/connectivity", {
    params: reveal ? { reveal: "true" } : {},
  });

/**
 * PATCH /api/superadmin/settings/connectivity
 * @param {Object} data - Shape: { smtp?: { host, username, password, port, encryption }, s3?: { ... } }
 */
export const updateConnectivitySettings = (data) =>
  api.patch("/api/superadmin/settings/connectivity", data);

/** POST /api/superadmin/settings/connectivity/smtp/test */
export const testSmtpConnection = () =>
  api.post("/api/superadmin/settings/connectivity/smtp/test");

// ---------------------------------------------------------------------------
// GROUP 3 — Security
// ---------------------------------------------------------------------------

/** GET /api/superadmin/settings/security */
export const getSecuritySettings = () =>
  api.get("/api/superadmin/settings/security");

/**
 * PATCH /api/superadmin/settings/security
 * @param {Object} data - Partial object with any of:
 *   mfa_enforced, ip_whitelist_enabled, session_persistence,
 *   inactivity_timeout_minutes
 */
export const updateSecuritySettings = (data) =>
  api.patch("/api/superadmin/settings/security", data);

// ---------------------------------------------------------------------------
// Brand asset uploads
// ---------------------------------------------------------------------------

/**
 * POST /api/superadmin/settings/identity/logo
 * @param {File} file - Image file (PNG/JPG/WEBP/SVG, max 2 MB)
 */
export const uploadPlatformLogo = (file) => {
  const form = new FormData();
  form.append("logo", file);
  return api.post("/api/superadmin/settings/identity/logo", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * POST /api/superadmin/settings/identity/favicon
 * @param {File} file - Image file (PNG/ICO/SVG, max 2 MB)
 */
export const uploadPlatformFavicon = (file) => {
  const form = new FormData();
  form.append("favicon", file);
  return api.post("/api/superadmin/settings/identity/favicon", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
