import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice";
import { normalizeAuthUser, getDashboardRouteForUser } from "../../utils/authResponse";
import { apiClient } from "../../services/axios.instance";

/**
 * Receives a single-use impersonation ticket from the query (?ticket=...).
 * Sends it to POST /api/auth/handoff, which redeems the ticket, mints the JWT
 * server-side and sets the httpOnly cookie, then returns the user for Redux.
 * No JWT is ever read from the URL or browser storage here.
 */
export default function AuthHandoffPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const ticket = searchParams.get("ticket");
  const next = searchParams.get("next");
  // Lazy initializer avoids a synchronous setState inside the effect.
  const [error, setError] = useState(
    ticket ? null : "Missing handoff ticket. Try Login as again from superadmin.",
  );

  useEffect(() => {
    if (!ticket) return;

    // Redeem the ticket; the backend sets the httpOnly cookie and returns the user.
    apiClient.post("/api/auth/handoff", { ticket })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        const normalized = normalizeAuthUser(data?.user);
        if (!normalized) {
          setError("Could not complete sign-in handoff.");
          return;
        }
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
  }, [ticket, next, dispatch, navigate]);

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

