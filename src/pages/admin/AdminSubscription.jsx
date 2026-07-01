import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  RiShieldCheckLine,
  RiCalendarLine,
  RiBankCardLine,
  RiDownloadLine,
  RiArrowLeftLine,
  RiTimeLine,
} from "react-icons/ri";
import api from "../../services/api";
import { logout as logoutAction, setCredentials } from "../../store/slices/authSlice";
import { setOrgSettings } from "../../store/slices/orgSettingsSlice";
import { normalizeAuthUser } from "../../utils/authResponse";
import { logoutUser } from "../../services/auth.service";
import {
  getMySubscription,
  createSubscriptionCheckout,
  verifySubscriptionSession,
  getMyInvoices,
  downloadMyInvoice,
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

function getDaysRemaining(endDate) {
  if (!endDate) return null;
  return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
}

// ── Active / Already-Paid View ───────────────────────────────────────────────

function ActiveSubscriptionView({ data, invoices, downloadingId, onDownload }) {
  const sub = data?.subscription;
  const plan = sub?.plan;
  const charge = data?.charge;
  const currency = charge?.currency || plan?.currency || "GBP";
  const daysLeft = getDaysRemaining(sub?.current_period_end);
  const isTrial = sub?.status === "trial";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Back link */}
        <Link
          to="/admin/settings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <RiArrowLeftLine size={15} />
          Back to Settings
        </Link>

        {/* Status banner */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isTrial ? "bg-blue-50" : "bg-green-50"}`}>
                {isTrial
                  ? <RiTimeLine size={22} className="text-blue-600" />
                  : <RiShieldCheckLine size={22} className="text-green-600" />}
              </div>
              <div>
                <h1 className="text-lg font-black text-gray-900">
                  {plan?.name || "Subscription"}
                </h1>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {plan?.billing_cycle ? `Billed ${plan.billing_cycle}` : "Platform subscription"}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              isTrial
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isTrial ? "bg-blue-500" : "bg-green-500"}`} />
              {isTrial ? "Free Trial" : "Active · Paid"}
            </span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5">Plan Price</p>
              <p className="text-xl font-black text-gray-900">
                {plan ? formatPrice(plan.price, currency) : "—"}
                {plan?.billing_cycle && (
                  <span className="text-xs font-medium text-gray-400 ml-1">
                    /{plan.billing_cycle === "monthly" ? "mo" : "yr"}
                  </span>
                )}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5">
                {isTrial ? "Trial Ends In" : "Renews In"}
              </p>
              <p className={`text-xl font-black ${
                daysLeft !== null && daysLeft <= 3
                  ? "text-red-600"
                  : daysLeft !== null && daysLeft <= 7
                    ? "text-amber-600"
                    : "text-gray-900"
              }`}>
                {daysLeft === null ? "—" : daysLeft <= 0 ? "Today" : `${daysLeft}d`}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5">
                {isTrial ? "Trial Expires" : "Next Renewal"}
              </p>
              <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <RiCalendarLine size={13} className="text-gray-400 flex-shrink-0" />
                {formatDate(sub?.current_period_end)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {daysLeft !== null && daysLeft > 0 && (
            <div className="mt-5">
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {isTrial ? "Trial Period" : "Subscription Period"}
                </span>
                <span className={`text-[10px] font-black ${
                  daysLeft <= 3 ? "text-red-500" : daysLeft <= 7 ? "text-amber-500" : "text-gray-400"
                }`}>
                  {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    daysLeft <= 3 ? "bg-red-500" : daysLeft <= 7 ? "bg-amber-400" : isTrial ? "bg-blue-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(4, (daysLeft / 30) * 100))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Billing Breakdown */}
        {charge && plan && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center border border-primary/10 text-primary">
                <RiBankCardLine size={16} />
              </div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Billing Breakdown</h4>
            </div>

            <div className="divide-y divide-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-gray-500">Subscription ({plan.name})</span>
                <span className="text-sm font-semibold text-gray-900">{formatPrice(charge.planPrice, currency)}</span>
              </div>
              {Number(charge.platformFee) > 0 && (
                <div className="flex justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">
                    Platform fee{charge.platformFeePercent ? ` (${charge.platformFeePercent}%)` : ""}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(charge.platformFee, currency)}</span>
                </div>
              )}
              {Number(charge.taxAmount) > 0 && (
                <div className="flex justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">
                    VAT{charge.taxRatePercent ? ` (${charge.taxRatePercent}%)` : ""}
                    {charge.taxId ? ` · ${charge.taxId}` : ""}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(charge.taxAmount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-3.5 bg-gray-50">
                <span className="text-sm font-black text-gray-900">Total</span>
                <span className="text-sm font-black text-gray-900">{formatPrice(charge.total, currency)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Invoice History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-4">Invoice History</h4>
          {invoices.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No invoices yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {invoices.map((inv) => {
                const sym = CURRENCY_SYMBOLS[String(inv.currency || "GBP").toUpperCase()] || "";
                const total = `${sym}${Number(inv.total ?? inv.amount ?? 0).toFixed(2)}`;
                const planName = inv.subscription?.plan?.name || "Subscription";
                const date = inv.paid_at || inv.createdAt;
                const statusColour =
                  inv.status === "paid"    ? "bg-green-100 text-green-700"  :
                  inv.status === "overdue" ? "bg-red-100 text-red-700"      :
                  inv.status === "pending" ? "bg-amber-100 text-amber-700"  :
                  "bg-gray-100 text-gray-600";
                return (
                  <div key={inv.id} className="flex items-center justify-between py-3.5 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {inv.invoice_number || `INV-${inv.id}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {planName} · {date ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold text-gray-900">{total}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest capitalize ${statusColour}`}>
                        {inv.status}
                      </span>
                      <button
                        onClick={() => onDownload(inv.id, inv.invoice_number)}
                        disabled={downloadingId === inv.id}
                        title="Download PDF"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:opacity-70 disabled:opacity-40 font-semibold transition-opacity"
                      >
                        <RiDownloadLine size={14} />
                        {downloadingId === inv.id ? "…" : "PDF"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminSubscription() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [paying, setPaying] = useState(false);
  const [activated, setActivated] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  const refreshSession = useCallback(async () => {
    try {
      const res = await api.get("/api/auth/me");
      const me = res.data?.data ?? res.data;
      if (me?.user) {
        dispatch(
          setCredentials({
            user: normalizeAuthUser(me.user),
            token: "httpOnly",
            allowedModules: me.allowedModules ?? [],
          }),
        );
        if (me.user.organisation) dispatch(setOrgSettings(me.user.organisation));
      }
    } catch {
      /* non-fatal */
    }
  }, [dispatch]);

  const loadSubscription = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [subRes, invRes] = await Promise.allSettled([
        getMySubscription(),
        getMyInvoices(),
      ]);
      if (subRes.status === "fulfilled") setData(subRes.value);
      else setError(subRes.reason?.response?.data?.message || subRes.reason?.message || "Could not load subscription details.");
      if (invRes.status === "fulfilled") setInvoices(invRes.value?.invoices ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownloadInvoice = async (id, invoiceNumber) => {
    setDownloadingId(id);
    try {
      const res = await downloadMyInvoice(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${invoiceNumber || id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download invoice. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (payment === "success" && sessionId) {
      setVerifying(true);
      verifySubscriptionSession(sessionId)
        .then(async (res) => {
          if (res?.paid) {
            setActivated(true);
            toast.success("Subscription activated. Welcome back!");
            await refreshSession();
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
        await refreshSession();
        setTimeout(() => navigate("/admin/dashboard"), 1500);
        return;
      }
      toast.error("Could not start checkout. Please try again.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Could not start checkout. Please try again.",
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

  // ── Verifying / post-payment activated screens ──────────────────────────
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center text-center py-10">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Confirming your payment…</p>
        </div>
      </div>
    );
  }

  if (activated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center text-center py-8">
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl mb-4">
            ✓
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Subscription activated</h1>
          <p className="text-gray-600">Redirecting you to your dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Already Paid / Active ────────────────────────────────────────────────
  const subStatus = data?.subscription?.status;
  const orgStatus = data?.organisation?.status;
  const isAlreadyActive =
    !data?.expired &&
    (subStatus === "active" || subStatus === "trial") &&
    (orgStatus === "active" || orgStatus === "trial");

  if (isAlreadyActive) {
    return (
      <ActiveSubscriptionView
        data={data}
        invoices={invoices}
        downloadingId={downloadingId}
        onDownload={handleDownloadInvoice}
      />
    );
  }

  // ── Expired / Renewal page ───────────────────────────────────────────────
  const plan = data?.subscription?.plan;
  const orgName = data?.organisation?.name;
  const charge = data?.charge;
  const currency = charge?.currency || plan?.currency || "GBP";
  const totalDue = charge ? Number(charge.total) : Number(plan?.price || 0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
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
              's subscription is no longer active. Renew below to restore access for your whole team.
            </p>
          </div>

          {error ? (
            <div className="rounded-lg bg-red-50 text-red-700 p-4 text-sm text-center">{error}</div>
          ) : (
            <>
              <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 mb-6">
                <div className="flex justify-between px-4 py-3">
                  <span className="text-gray-500">Plan</span>
                  <span className="font-medium text-gray-900">{plan?.name || "—"}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-gray-500">Billing</span>
                  <span className="font-medium text-gray-900 capitalize">{plan?.billing_cycle || "—"}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-gray-500">Subscription</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(charge ? charge.planPrice : plan?.price, currency)}
                  </span>
                </div>
                {charge && Number(charge.platformFee) > 0 && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-500">
                      Platform fee{charge.platformFeePercent ? ` (${charge.platformFeePercent}%)` : ""}
                    </span>
                    <span className="font-medium text-gray-900">{formatPrice(charge.platformFee, currency)}</span>
                  </div>
                )}
                {charge && Number(charge.taxAmount) > 0 && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-500">
                      VAT{charge.taxRatePercent ? ` (${charge.taxRatePercent}%)` : ""}
                      {charge.taxId ? ` · ${charge.taxId}` : ""}
                    </span>
                    <span className="font-medium text-gray-900">{formatPrice(charge.taxAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-3 bg-gray-50">
                  <span className="font-semibold text-gray-700">Total due</span>
                  <span className="font-bold text-gray-900">
                    {plan ? formatPrice(totalDue, currency) : "—"}
                  </span>
                </div>
                {data?.subscription?.current_period_end && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-500">Previous period ended</span>
                    <span className="font-medium text-gray-900">{formatDate(data.subscription.current_period_end)}</span>
                  </div>
                )}
              </div>

              {plan ? (
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {paying ? "Starting checkout…" : `Pay ${formatPrice(totalDue, currency)} & activate`}
                </button>
              ) : (
                <div className="rounded-lg bg-amber-50 text-amber-700 p-4 text-sm text-center">
                  No plan is assigned to your organisation. Please contact support to activate your subscription.
                </div>
              )}

              <p className="text-xs text-gray-400 text-center mt-4">
                Secure payment processed by Stripe. You can also contact your platform administrator to activate the subscription for you.
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
      </div>

      {/* Invoice history for expired orgs */}
      {invoices.length > 0 && (
        <div className="w-full max-w-lg mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Invoice history</h2>
          <div className="divide-y divide-gray-100">
            {invoices.map((inv) => {
              const sym = CURRENCY_SYMBOLS[String(inv.currency || "GBP").toUpperCase()] || "";
              const total = `${sym}${Number(inv.total ?? inv.amount ?? 0).toFixed(2)}`;
              const planName = inv.subscription?.plan?.name || "Subscription";
              const date = inv.paid_at || inv.createdAt;
              const statusColour =
                inv.status === "paid"    ? "bg-green-100 text-green-700"  :
                inv.status === "overdue" ? "bg-red-100 text-red-700"      :
                inv.status === "pending" ? "bg-amber-100 text-amber-700"  :
                "bg-gray-100 text-gray-600";
              return (
                <div key={inv.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {inv.invoice_number || `INV-${inv.id}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {planName} · {date ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-gray-900">{total}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColour}`}>
                      {inv.status}
                    </span>
                    <button
                      onClick={() => handleDownloadInvoice(inv.id, inv.invoice_number)}
                      disabled={downloadingId === inv.id}
                      className="text-xs text-primary underline hover:opacity-75 disabled:opacity-50"
                    >
                      {downloadingId === inv.id ? "…" : "PDF"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
