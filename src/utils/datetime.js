/**
 * Org-wide date/time formatting.
 *
 * Every date/time shown in any panel should go through these helpers so it
 * renders in the organisation's selected timezone + date format (chosen by the
 * admin in Settings, delivered via /api/auth/me → orgSettings Redux slice).
 *
 * These are plain functions (not hooks) so they can be used anywhere — inside
 * loops, table cells, .map() callbacks, etc. They read the current org settings
 * from the Redux store at call time. When the admin changes the timezone, a
 * page reload (or the admin panel's own re-render after save) picks it up.
 */
import store from "../store";

// Legacy values previously stored as display labels → real IANA identifiers.
const LEGACY_TZ_TO_IANA = {
  "UTC-05:00 Eastern Time": "America/New_York",
  "UTC-06:00 Central Time": "America/Chicago",
  "UTC-07:00 Mountain Time": "America/Denver",
  "UTC-08:00 Pacific Time": "America/Los_Angeles",
};

/** Selectable timezones (IANA value + friendly label) for the settings UI. */
export const TIMEZONE_OPTIONS = [
  { value: "Europe/London", label: "(GMT+00:00) London, Dublin" },
  { value: "UTC", label: "(GMT+00:00) UTC" },
  { value: "Europe/Paris", label: "(GMT+01:00) Paris, Berlin, Madrid" },
  { value: "Europe/Athens", label: "(GMT+02:00) Athens, Cairo, Istanbul" },
  { value: "Europe/Moscow", label: "(GMT+03:00) Moscow" },
  { value: "Asia/Dubai", label: "(GMT+04:00) Dubai" },
  { value: "Asia/Karachi", label: "(GMT+05:00) Karachi, Tashkent" },
  { value: "Asia/Kolkata", label: "(GMT+05:30) India (Mumbai, Delhi)" },
  { value: "Asia/Dhaka", label: "(GMT+06:00) Dhaka" },
  { value: "Asia/Bangkok", label: "(GMT+07:00) Bangkok, Jakarta" },
  { value: "Asia/Singapore", label: "(GMT+08:00) Singapore, Beijing" },
  { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo, Seoul" },
  { value: "Australia/Sydney", label: "(GMT+10:00) Sydney" },
  { value: "Pacific/Auckland", label: "(GMT+12:00) Auckland" },
  { value: "America/Sao_Paulo", label: "(GMT-03:00) São Paulo" },
  { value: "America/New_York", label: "(GMT-05:00) Eastern Time (US)" },
  { value: "America/Chicago", label: "(GMT-06:00) Central Time (US)" },
  { value: "America/Denver", label: "(GMT-07:00) Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "(GMT-08:00) Pacific Time (US)" },
];

/** Selectable date formats for the settings UI. */
export const DATE_FORMAT_OPTIONS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

const DEFAULT_TZ = "Europe/London";
const DEFAULT_FMT = "DD/MM/YYYY";

function resolveTimeZone(tz) {
  if (!tz) return DEFAULT_TZ;
  return LEGACY_TZ_TO_IANA[tz] || tz;
}

/** Current org timezone + date format from the store (with safe fallbacks). */
function getSettings() {
  try {
    const s = store.getState()?.orgSettings;
    return {
      timeZone: resolveTimeZone(s?.timezone),
      dateFormat: s?.date_format || DEFAULT_FMT,
    };
  } catch {
    return { timeZone: DEFAULT_TZ, dateFormat: DEFAULT_FMT };
  }
}

/** The org's active IANA timezone — for callers needing raw Intl/options. */
export function getOrgTimeZone() {
  return getSettings().timeZone;
}

/** Coerce any input (Date | ISO string | epoch | null) to a valid Date or null. */
function toDate(value) {
  if (value === null || value === undefined || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Y/M/D/H/M/S parts of `date` as seen in `timeZone`. */
function zonedParts(date, timeZone) {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const out = {};
  for (const p of dtf.formatToParts(date)) out[p.type] = p.value;
  if (out.hour === "24") out.hour = "00"; // some engines emit 24 for midnight
  return out;
}

function applyDateFormat(parts, fmt) {
  const { year, month, day } = parts;
  switch (fmt) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD/MM/YYYY":
    default:
      return `${day}/${month}/${year}`;
  }
}

/**
 * Date only, in the org timezone + numeric date format. e.g. "30/05/2026".
 */
export function formatDate(value, { fallback = "" } = {}) {
  const d = toDate(value);
  if (!d) return fallback;
  const { timeZone, dateFormat } = getSettings();
  return applyDateFormat(zonedParts(d, timeZone), dateFormat);
}

/**
 * Time only, in the org timezone. e.g. "02:05 PM" (or 24h with hour12:false).
 */
export function formatTime(value, { fallback = "", seconds = false, hour12 = true } = {}) {
  const d = toDate(value);
  if (!d) return fallback;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: getSettings().timeZone,
    hour: "2-digit",
    minute: "2-digit",
    ...(seconds ? { second: "2-digit" } : {}),
    hour12,
  }).format(d);
}

/**
 * Date + time, in the org timezone + format. e.g. "30/05/2026, 02:05 PM".
 */
export function formatDateTime(value, { fallback = "", seconds = false, hour12 = true } = {}) {
  const d = toDate(value);
  if (!d) return fallback;
  return `${formatDate(d)}, ${formatTime(d, { seconds, hour12 })}`;
}

/**
 * Date with a named month, in the org timezone. e.g. "30 May 2026".
 * Use where a friendlier style is wanted instead of the numeric format.
 */
export function formatDateLong(value, { fallback = "", month = "short" } = {}) {
  const d = toDate(value);
  if (!d) return fallback;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: getSettings().timeZone,
    day: "numeric",
    month,
    year: "numeric",
  }).format(d);
}

/**
 * Escape hatch: format with arbitrary Intl options but force the org timezone.
 * Mirrors `date.toLocaleString(locale, options)` while honouring the org tz.
 */
export function formatWithOptions(value, options = {}, locale = "en-GB", { fallback = "" } = {}) {
  const d = toDate(value);
  if (!d) return fallback;
  return new Intl.DateTimeFormat(locale, { timeZone: getSettings().timeZone, ...options }).format(d);
}
