export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

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
  "Data Capture Sheet",
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

/** Email format */
export const EMAIL_VALIDATION = {
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  message: "Please enter a valid email address",
};

/** Password: minimum 8 characters */
export const PASSWORD_VALIDATION = {
  minLength: 8,
  message: "Password must be at least 8 characters",
};

/**
 * Date of birth validation helpers.
 *
 * Usage:
 *   const error = validateDateOfBirth(value);
 *   if (error) setFieldError("date_of_birth", error);
 */
export const DOB_VALIDATION = {
  minAgeYears: 16,
  message: {
    required: "Date of birth is required",
    invalid: "Please enter a valid date of birth",
    future: "Date of birth cannot be today or a future date",
    tooYoung: "You must be at least 16 years old to register",
  },
};

/**
 * Returns an error string if the date of birth is invalid, otherwise null.
 * @param {string|Date} value
 * @returns {string|null}
 */
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

/**
 * Returns an error string if the mobile number is invalid, otherwise null.
 * Strips leading/trailing whitespace before checking.
 * @param {string} value
 * @returns {string|null}
 */
export function validateMobile(value) {
  if (!value || !String(value).trim()) return "Mobile number is required";
  const cleaned = String(value).trim().replace(/\s+/g, "");
  if (!MOBILE_VALIDATION.pattern.test(cleaned)) return MOBILE_VALIDATION.message;
  return null;
}

/**
 * Returns the maximum selectable date for a date-of-birth input
 * (yesterday's date, so today is never selectable).
 * @returns {string} ISO date string "YYYY-MM-DD"
 */
export function getMaxDobDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

/**
 * Returns the minimum selectable date for a date-of-birth input
 * (120 years ago — a reasonable upper bound for human age).
 * @returns {string} ISO date string "YYYY-MM-DD"
 */
export function getMinDobDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 120);
  return d.toISOString().split("T")[0];
}
