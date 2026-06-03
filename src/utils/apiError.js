/**
 * Extract the most useful human-readable message from an Axios/API error.
 *
 * Backend validation failures look like:
 *   { status: "error", message: "Validation failed",
 *     errors: [{ field: "body.mobile", message: "Invalid phone number format" }] }
 *
 * The top-level `message` is generic ("Validation failed"); the real detail is
 * in `errors[]`. This helper prefers the specific field-level message(s) so
 * toasts show "Invalid phone number format" instead of just "Validation failed".
 *
 * @param {unknown} error    Axios error (or anything)
 * @param {string} [fallback] Message to use when nothing else is available
 * @returns {string}
 */
export function getApiError(error, fallback = "Something went wrong") {
  const d = error?.response?.data;

  // 1) Specific field-level validation detail(s), when present.
  const fieldErrors = d?.errors;
  if (Array.isArray(fieldErrors) && fieldErrors.length) {
    const messages = fieldErrors
      .map((e) => (typeof e === "string" ? e : e?.message))
      .filter(Boolean);
    if (messages.length) return messages.join(", ");
  }

  // 2) Top-level message (string or array form).
  const m = d?.message;
  if (typeof m === "string" && m.trim()) return m;
  if (Array.isArray(m) && m.length) return m[0];

  // 3) Axios/network error message, else the caller's fallback.
  return error?.message || fallback;
}

export default getApiError;
