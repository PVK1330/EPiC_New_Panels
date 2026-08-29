// Emails of deleted/reclaimed accounts are tombstoned server-side as
// `<local>+deleted<userId>.<timestamp>@<domain>` so the address is free for
// reuse while the row is kept for audit. Parse that back for display.
const EMAIL_TOMBSTONE_RE = /^(.*)\+deleted(\d+)\.(\d+)@([^@]+)$/;

export function parseDeletedEmail(email) {
  const value = String(email || "");
  const match = EMAIL_TOMBSTONE_RE.exec(value);
  if (!match) return { deleted: false, email: value, originalEmail: value };
  return { deleted: true, email: value, originalEmail: `${match[1]}@${match[4]}` };
}

export function isInactiveUser(user) {
  return String(user?.status || "").toLowerCase() === "inactive";
}

/** Row classes for admin list tables: muted when the account is inactive. */
export function userRowClass(user) {
  return isInactiveUser(user)
    ? "bg-gray-50/60 opacity-60 hover:opacity-100 transition-opacity"
    : "hover:bg-gray-50/70 transition-colors";
}
