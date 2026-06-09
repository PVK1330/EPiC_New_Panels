import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { logout as logoutAction } from "../../store/slices/authSlice";
import { logoutUser } from "../../services/auth.service";
import {
  getMySubscription,
  createSubscriptionCheckout,
  verifySubscriptionSession,
} from "../../services/orgBillingApi";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", INR: "₹" };

function formatPrice(amount, currency) {
  const code = String(currency || "GBP").toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] || `${code} `;
  const value = Number(amount || 0).toFixed(2);
  return `${symbol}${value}`;
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function AdminSubscription() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [paying, setPaying] = useState(false);
  const [activated, setActivated] = useState(false);
  const [data, setData] = useState(null); // { organisation, subscription, expired }
  const [error, setError] = useState("");

  const loadSubscription = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMySubscription();
      setData(res);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load your subscription details.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // On return from Stripe, verify the session and activate. Otherwise just load.
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (payment === "success" && sessionId) {
      setVerifying(true);
      verifySubscriptionSession(sessionId)
        .then((res) => {
          if (res?.paid) {
            setActivated(true);
            toast.success("Subscription activated. Welcome back!");
            setTimeout(() => navigate("/admin/dashboard"), 1800);
          } else {
            toast.error("Payment is still processing. Please try again shortly.");
            loadSubscription();
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message ||
              "We couldn't confirm your payment. Please contact support.",
          );
          loadSubscription();
        })
        .finally(() => {
          setVerifying(false);
          // Clear the query params so a refresh doesn't re-verify.
          setSearchParams({}, { replace: true });
        });
      return;
    }

    if (payment === "cancelled") {
      toast("Payment cancelled.", { icon: "ℹ️" });
      setSearchParams({}, { replace: true });
    }

    loadSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await createSubscriptionCheckout();
      if (res?.url) {
        window.location.href = res.url;
        return;
      }
      if (res?.activated) {
        setActivated(true);
        toast.success("Subscription activated.");
        setTimeout(() => navigate("/admin/dashboard"), 1500);
        return;
      }
      toast.error("Could not start checkout. Please try again.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Could not start checkout. Please try again.",
      );
    } finally {
      setPaying(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      /* ignore */
    }
    dispatch(logoutAction());
    navigate("/login");
  };

  const plan = data?.subscription?.plan;
  const orgName = data?.organisation?.name;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        {verifying ? (
          <div className="flex flex-col items-center text-center py-10">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Confirming your payment…</p>
          </div>
        ) : activated ? (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl mb-4">
              ✓
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Subscription activated
            </h1>
            <p className="text-gray-600">Redirecting you to your dashboard…</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto mb-4">
                !
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Subscription {data?.expired ? "expired" : "renewal"}
              </h1>
              <p className="text-gray-600 mt-2">
                {orgName ? <span className="font-medium">{orgName}</span> : "Your organisation"}
                's subscription is no longer active. Renew below to restore access
                for your whole team.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 text-red-700 p-4 text-sm text-center">
                {error}
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 mb-6">
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-500">Plan</span>
                    <span className="font-medium text-gray-900">
                      {plan?.name || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-500">Billing</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {plan?.billing_cycle || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-500">Amount due</span>
                    <span className="font-semibold text-gray-900">
                      {plan ? formatPrice(plan.price, plan.currency) : "—"}
                    </span>
                  </div>
                  {data?.subscription?.current_period_end && (
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-gray-500">Previous period ended</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(data.subscription.current_period_end)}
                      </span>
                    </div>
                  )}
                </div>

                {plan ? (
                  <button
                    onClick={handlePay}
                    disabled={paying}
                    className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {paying
                      ? "Starting checkout…"
                      : `Pay ${formatPrice(plan.price, plan.currency)} & activate`}
                  </button>
                ) : (
                  <div className="rounded-lg bg-amber-50 text-amber-700 p-4 text-sm text-center">
                    No plan is assigned to your organisation. Please contact
                    support to activate your subscription.
                  </div>
                )}

                <p className="text-xs text-gray-400 text-center mt-4">
                  Secure payment processed by Stripe. You can also contact your
                  platform administrator to activate the subscription for you.
                </p>
              </>
            )}

            <div className="text-center mt-6">
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
