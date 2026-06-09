const RAW_PLATFORM_DOMAIN = (
  import.meta.env.VITE_PLATFORM_DOMAIN || "localhost"
).toLowerCase();

const FRONTEND_PORT =
  import.meta.env.VITE_FRONTEND_PORT ||
  (typeof window !== "undefined" && window.location.port) ||
  "5173";

/**
 * Tenant hosts are {slug}.elitepic.co.uk — not {slug}.cms.elitepic.co.uk.
 */
export function normalizePlatformDomain(domain) {
  const d = String(domain || "").toLowerCase().trim();
  if (!d) return "localhost";
  if (d.startsWith("cms.")) return d.slice(4);
  return d;
}

export function getPlatformDomain() {
  const fromEnv = normalizePlatformDomain(RAW_PLATFORM_DOMAIN);
  if (fromEnv !== "localhost" && fromEnv !== "127.0.0.1") {
    return fromEnv;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host === "cms.elitepic.co.uk" || host.endsWith(".elitepic.co.uk")) {
      return "elitepic.co.uk";
    }
  }

  return fromEnv;
}

function buildPortSuffix() {
  if (typeof window !== "undefined") {
    const p = window.location.port;
    if (!p || p === "80" || p === "443") return "";
    return `:${p}`;
  }
  if (FRONTEND_PORT && FRONTEND_PORT !== "80" && FRONTEND_PORT !== "443") {
    return `:${FRONTEND_PORT}`;
  }
  return "";
}

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
  const port = buildPortSuffix();
  if (!slug) return `*.${getPlatformDomain()}`;
  return `${slug}.${getPlatformDomain()}${port}`;
}

/**
 * Tenant slug from browser host (e.g. acme.localhost → acme).
 */
export function getOrganisationSlugFromHost(
  hostname = typeof window !== "undefined" ? window.location.hostname : "",
) {
  const host = String(hostname).toLowerCase();
  const platform = getPlatformDomain();

  if (host === platform || host === "127.0.0.1" || host === "cms.elitepic.co.uk") {
    return null;
  }

  const suffix = `.${platform}`;
  if (host.endsWith(suffix)) {
    const slug = host.slice(0, -suffix.length);
    if (slug && !slug.includes(".")) {
      return slug;
    }
  }

  const cmsSuffix = `.cms.${platform}`;
  if (host.endsWith(cmsSuffix)) {
    const slug = host.slice(0, -cmsSuffix.length);
    if (slug && !slug.includes(".")) {
      return slug;
    }
  }

  return null;
}

/** Full tenant origin, e.g. https://acme.elitepic.co.uk */
export function buildTenantOrigin(slug) {
  const protocol =
    typeof window !== "undefined" ? window.location.protocol : "https:";
  const port = buildPortSuffix();
  return `${protocol}//${slug}.${getPlatformDomain()}${port}`;
}

/**
 * Cross-subdomain login handoff (superadmin "Login as" → tenant admin).
 *
 * Only an opaque single-use ticket travels in the URL — never a JWT. The tenant
 * subdomain redeems the ticket at POST /api/auth/handoff, where the JWT is
 * minted server-side and set as an HttpOnly cookie.
 */
export function buildTenantHandoffUrl(slug, { ticket, nextPath = "/admin/dashboard" }) {
  const origin = buildTenantOrigin(slug);
  const params = new URLSearchParams({ ticket });
  if (nextPath) params.set("next", nextPath);
  return `${origin}/auth/handoff?${params.toString()}`;
}
