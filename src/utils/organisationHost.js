const PLATFORM_DOMAIN = (
  import.meta.env.VITE_PLATFORM_DOMAIN || "localhost"
).toLowerCase();

const FRONTEND_PORT =
  import.meta.env.VITE_FRONTEND_PORT ||
  (typeof window !== "undefined" && window.location.port) ||
  "5173";

/** Build URL-safe org slug from name or manual input. */
export function slugifyOrganisation(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

export function isValidOrganisationSlug(slug) {
  return /^[a-z][a-z0-9-]{1,89}$/.test(slug) && !slug.includes("--");
}

export function getOrganisationSubdomainLabel(slug) {
  if (!slug) return `*.${PLATFORM_DOMAIN}`;
  return `${slug}.${PLATFORM_DOMAIN}:${FRONTEND_PORT}`;
}

/**
 * Tenant slug from browser host (e.g. acme.localhost → acme).
 */
export function getOrganisationSlugFromHost(
  hostname = typeof window !== "undefined" ? window.location.hostname : "",
) {
  const host = String(hostname).toLowerCase();
  const platform = PLATFORM_DOMAIN;

  if (host === platform || host === "127.0.0.1") {
    return null;
  }

  const suffix = `.${platform}`;
  if (host.endsWith(suffix)) {
    const slug = host.slice(0, -suffix.length);
    if (slug && !slug.includes(".")) {
      return slug;
    }
  }

  return null;
}

/** Full tenant origin, e.g. http://acme.localhost:5173 */
export function buildTenantOrigin(slug) {
  const protocol =
    typeof window !== "undefined" ? window.location.protocol : "http:";
  const port = FRONTEND_PORT ? `:${FRONTEND_PORT}` : "";
  return `${protocol}//${slug}.${PLATFORM_DOMAIN}${port}`;
}

/**
 * Cross-subdomain login handoff (superadmin "Login as" → tenant admin).
 * Passes session via query; AuthHandoff page stores credentials on tenant host.
 */
export function buildTenantHandoffUrl(slug, { token, user, nextPath = "/admin/dashboard" }) {
  const origin = buildTenantOrigin(slug);
  const payload = btoa(
    JSON.stringify({
      token,
      user,
      next: nextPath,
    }),
  );
  return `${origin}/auth/handoff?session=${encodeURIComponent(payload)}`;
}
