import { API_BASE_URL } from "./constants";

/** Resolve relative upload paths from the API to a full URL. */
export function resolveAssetUrl(url) {
  if (!url) return null;
  if (String(url).startsWith("http")) return url;
  const base = API_BASE_URL.replace(/\/$/, "");
  return `${base}/${String(url).replace(/^\//, "")}`;
}
