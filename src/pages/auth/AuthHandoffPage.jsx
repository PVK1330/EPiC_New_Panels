import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice";
import { normalizeAuthUser, getDashboardRouteForUser } from "../../utils/authResponse";

/**
 * Receives impersonation / cross-domain session from query (?session=base64).
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
    try {
      const decoded = JSON.parse(atob(decodeURIComponent(raw)));
      const { token, user, next } = decoded || {};
      if (!token || !user) {
        setError("Invalid session payload.");
        return;
      }
      const normalized = normalizeAuthUser(user);
      dispatch(setCredentials({ token, user: normalized }));
      const target = next || getDashboardRouteForUser(normalized);
      navigate(target, { replace: true });
    } catch {
      setError("Could not complete sign-in handoff.");
    }
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

