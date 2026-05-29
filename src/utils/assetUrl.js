import { API_BASE_URL } from "./constants";

/** Resolve relative upload paths from the API to a full URL. */
export function resolveAssetUrl(url) {
  if (!url) return null;
  const value = String(url).trim();
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const base = API_BASE_URL.replace(/\/$/, "");
  return `${base}/${value.replace(/^\//, "")}`;
}

/** Organisation logo from API payload (camelCase or snake_case). */
export function resolveOrganisationLogoUrl(organisation) {
  if (!organisation) return null;
  return resolveAssetUrl(organisation.logoUrl || organisation.logo_url);
}
