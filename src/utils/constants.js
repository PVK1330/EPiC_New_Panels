import isEmail from "validator/lib/isEmail";

const CONFIGURED_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL;

if (!CONFIGURED_API_BASE_URL && import.meta.env.PROD) {
  throw new Error(
    "VITE_API_BASE_URL (or VITE_API_URL) must be set for production builds",
  );
}

// Empty string → axios uses relative paths (/api/...) → Vite proxy forwards them.
export const API_BASE_URL = CONFIGURED_API_BASE_URL ?? "";

export const ROLE_NAMES = {
  1: "candidate",
  2: "caseworker",
  3: "admin",
  4: "business",
  5: "superadmin",
  6: "support_agent",
  7: "billing_manager",
  8: "compliance_officer",
};

export const ROLE_ROUTES = {
  1: "/candidate/dashboard",
  2: "/caseworker/dashboard",
  3: "/admin/dashboard",
  4: "/business/dashboard",
  5: "/superadmin/dashboard",
  6: "/superadmin/dashboard",
  7: "/superadmin/dashboard",
  8: "/superadmin/dashboard",
};

export const DOCUMENT_TYPE_OPTIONS = [
  "General",
  "Upload Documents",
  "Client Care Letter",
  "Decision Letter",
  "Approval Notice",
  "Visa Copy",
  "BRP Information",
  "Passport",
  "Visa",
  "Right to Work",
  "English Certificate",
  "Certificate of Sponsorship",
  "Job Offer Letter",
  "Bank Statement",
  "Employment Contract",
  "Academic Certificate",
  "Utility Bill",
  "BRP Card",
  "National ID",
  "Sponsor Documents",
  "Other",
];

// ─── Validation Rules ────────────────────────────────────────────────────────

/** Mobile number: 7–15 digits, no spaces or special characters */
export const MOBILE_VALIDATION = {
  pattern: /^\d{7,15}$/,
  minLength: 7,
  maxLength: 15,
  message: "Mobile number must be between 7 and 15 digits (numbers only)",
};

/** Country code: optional leading +, then 1–4 digits (e.g. +44, +91, +1) */
export const COUNTRY_CODE_VALIDATION = {
  pattern: /^\+?\d{1,4}$/,
  message: "Invalid country code (e.g. +44, +91, +1)",
};

/** Email format (kept for backward-compat with consumers reading `.pattern`). */
export const EMAIL_VALIDATION = {
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  message: "Please enter a valid email address",
};

/**
 * BUG-034: robust email validation via validator.js (RFC-aware) instead of the
 * permissive regex above. Prefer this in new/validated code paths.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidEmail(value) {
  return isEmail(String(value || "").trim());
}

/**
 * Password policy — mirrors the backend strongPasswordSchema
 * (common.validation.js): 12+ chars with upper, lower, digit and special.
 */
export const PASSWORD_VALIDATION = {
  minLength: 12,
  message:
    "Password must be at least 12 characters and include uppercase, lowercase, a number and a special character",
};

/**
 * Validate a password against the app's strong policy (kept in lock-step with
 * the backend strongPasswordSchema). Returns null when valid, else the first
 * user-facing message — so a weak password is caught client-side with the same
 * wording the server would return.
 * @param {string} password
 * @returns {string|null}
 */
export function validatePasswordStrength(password) {
  const value = String(password || "");
  if (value.length < 12) return "Password must be at least 12 characters";
  if (!/[a-z]/.test(value)) return "Password must contain a lowercase letter";
  if (!/[A-Z]/.test(value)) return "Password must contain an uppercase letter";
  if (!/[0-9]/.test(value)) return "Password must contain a number";
  if (!/[^A-Za-z0-9]/.test(value)) return "Password must contain a special character";
  return null;
}

export const DOB_VALIDATION = {
  minAgeYears: 16,
  message: {
    required: "Date of birth is required",
    invalid: "Please enter a valid date of birth",
    future: "Date of birth cannot be today or a future date",
    tooYoung: "You must be at least 16 years old to register",
  },
};

export function validateDateOfBirth(value) {
  if (!value) return DOB_VALIDATION.message.required;

  const dob = new Date(value);
  if (isNaN(dob.getTime())) return DOB_VALIDATION.message.invalid;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dob >= today) return DOB_VALIDATION.message.future;

  const minAgeDate = new Date(today);
  minAgeDate.setFullYear(minAgeDate.getFullYear() - DOB_VALIDATION.minAgeYears);
  if (dob > minAgeDate) return DOB_VALIDATION.message.tooYoung;

  return null;
}

export function validateMobile(value) {
  if (!value || !String(value).trim()) return "Mobile number is required";
  const cleaned = String(value).trim().replace(/\s+/g, "");
  if (!MOBILE_VALIDATION.pattern.test(cleaned))
    return MOBILE_VALIDATION.message;
  return null;
}

export function getMaxDobDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

export function getMinDobDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 120);
  return d.toISOString().split("T")[0];
}
