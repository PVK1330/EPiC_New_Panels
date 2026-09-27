/**
 * Phase 2 UAT 3.2 — warn when a case's target submission date falls after the
 * client's current visa expiry (in-country applications, e.g. ILR, usually have
 * to be made before current leave expires). Mirrors the backend check in
 * services/visaExpiry.service.js. Calendar dates only.
 */
const toDateOnly = (value) => {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

export const isTargetAfterVisaExpiry = (targetDate, visaExpiry) => {
  const target = toDateOnly(targetDate);
  const expiry = toDateOnly(visaExpiry);
  return Boolean(target && expiry && target > expiry);
};

export const formatUkDate = (value) => {
  const iso = toDateOnly(value);
  if (!iso) return "";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};
