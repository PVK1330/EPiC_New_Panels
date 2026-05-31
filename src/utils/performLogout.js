import { logoutUser } from "../services/auth.service";
import { logout } from "../store/slices/authSlice";

/**
 * Centralised logout.
 *
 * Auth uses httpOnly cookies, so clearing Redux state alone does NOT log the
 * user out — the session cookie survives and /api/auth/me silently restores
 * the session on the next page load. The backend call is what actually ends
 * the session and clears the cookies. We always reset local state and redirect
 * afterwards, even if the network call fails.
 *
 * @param {Function} dispatch - redux dispatch
 * @param {Function} [navigate] - react-router navigate; falls back to a hard redirect
 */
export const performLogout = async (dispatch, navigate) => {
  try {
    await logoutUser();
  } catch {
    // Ignore — local state is cleared regardless so the user is logged out client-side.
  }
  dispatch(logout());
  if (typeof navigate === "function") {
    navigate("/login");
  } else {
    window.location.href = "/login";
  }
};
