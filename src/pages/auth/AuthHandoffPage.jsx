import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice";
import { normalizeAuthUser, getDashboardRouteForUser } from "../../utils/authResponse";
import { apiClient } from "../../services/axios.instance";

/**
 * Receives impersonation / cross-domain session from query (?session=base64).
 * Sends the token to POST /api/auth/handoff which verifies and sets the httpOnly cookie,
 * then returns user data for Redux state.
 */
export default function AuthHandoffPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  useEffect(() => {
    const raw = searchParams.get("session");
    if (!raw) {
      setError("Missing session. Try Login as again from superadmin.");
      return;
    }
    let token, user, next;
    try {
      const decoded = JSON.parse(atob(decodeURIComponent(raw)));
      token = decoded?.token;
      user = decoded?.user;
      next = decoded?.next;
    } catch {
      setError("Invalid session payload.");
      return;
    }
    if (!token || !user) {
      setError("Invalid session payload.");
      return;
    }

    // Call handoff endpoint to set httpOnly cookie
    apiClient.post("/api/auth/handoff", { token })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        const normalized = normalizeAuthUser(data?.user ?? user);
        dispatch(setCredentials({
          user: normalized,
          allowedModules: data?.allowedModules ?? [],
        }));
        const target = next || getDashboardRouteForUser(normalized);
        navigate(target, { replace: true });
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Could not complete sign-in handoff.");
      });
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      {error ? (
        <>
          <p className="text-red-600 font-semibold text-sm mb-4">{error}</p>
          <a href="/login" className="text-primary font-bold text-sm">
            Go to login
          </a>
        </>
      ) : (
        <p className="text-gray-500 font-medium text-sm">Signing you in…</p>
      )}
    </div>
  );
}

