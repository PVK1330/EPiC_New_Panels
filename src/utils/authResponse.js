/**
 * Normalizes login / verify-OTP / 2FA API bodies from EPiC_API.
 * Supports both `{ user, token }` and `{ status, message, data: { user, token } }`.
 */
export function getAuthUserAndToken(apiBody) {
  if (!apiBody) return { user: null, token: null };
  if (apiBody.user && apiBody.token) {
    return { user: apiBody.user, token: apiBody.token };
  }
  const inner = apiBody.data;
  if (inner?.user && inner?.token) {
    return { user: inner.user, token: inner.token };
  }
  return { user: null, token: null };
}
