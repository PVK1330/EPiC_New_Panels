import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RiCalendarLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiArrowRightLine,
  RiAlertLine,
  RiBankCardLine,
} from 'react-icons/ri';
import { getMySubscription } from '../../../services/orgBillingApi';

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€', INR: '₹' };

function formatPrice(amount, currency) {
  const code = String(currency || 'GBP').toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] || `${code} `;
  return `${symbol}${Number(amount || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

function getDaysRemaining(endDate) {
  if (!endDate) return null;
  const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

const STATUS_CONFIG = {
  trial:     { label: 'Free Trial', color: 'bg-blue-100 text-blue-700 border-blue-200'   },
  active:    { label: 'Active',     color: 'bg-green-100 text-green-700 border-green-200' },
  expired:   { label: 'Expired',   color: 'bg-red-100 text-red-700 border-red-200'       },
  past_due:  { label: 'Past Due',  color: 'bg-amber-100 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600 border-gray-200'    },
};

export default function BillingSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [data, setData]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getMySubscription();
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled)
          setError(err?.response?.data?.message || err?.message || 'Could not load subscription details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-red-600 text-sm font-medium">
        {error}
      </div>
    );
  }

  const sub       = data?.subscription;
  const plan      = sub?.plan;
  const charge    = data?.charge;
  const currency  = charge?.currency || plan?.currency || 'GBP';
  const status    = sub?.status || 'expired';
  const daysLeft  = getDaysRemaining(sub?.current_period_end);
  const isExpired = data?.expired || status === 'expired' || (daysLeft !== null && daysLeft <= 0);
  const isTrial   = status === 'trial';
  const isActive  = status === 'active';
  const isUrgent  = !isExpired && daysLeft !== null && daysLeft <= 7;
  const isCritical = !isExpired && daysLeft !== null && daysLeft <= 3;
  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.expired;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* ── Plan Status Card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isTrial ? 'bg-blue-50' : isExpired ? 'bg-red-50' : 'bg-green-50'
            }`}>
              {isTrial   ? <RiTimeLine     size={22} className="text-blue-600"  />
               : isExpired ? <RiAlertLine  size={22} className="text-red-600"   />
               : <RiShieldCheckLine         size={22} className="text-green-600" />}
            </div>
            <div>
              <h3 className="text-base font-black text-secondary">{plan?.name || 'No Plan Assigned'}</h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {plan?.billing_cycle
                  ? `Billed ${plan.billing_cycle}`
                  : 'Platform subscription'}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Three metric boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5">Plan Price</p>
            <p className="text-xl font-black text-secondary">
              {plan ? formatPrice(plan.price, currency) : '—'}
              {plan?.billing_cycle && (
                <span className="text-xs font-medium text-gray-400 ml-1">
                  /{plan.billing_cycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              )}
            </p>
          </div>

          <div className={`rounded-xl p-4 border ${
            isCritical ? 'bg-red-50 border-red-100'
            : isUrgent  ? 'bg-amber-50 border-amber-100'
            : 'bg-gray-50 border-gray-100'
          }`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${
              isCritical ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-gray-400'
            }`}>
              {isExpired ? 'Status' : isTrial ? 'Trial Ends In' : 'Renews In'}
            </p>
            <p className={`text-xl font-black ${
              isCritical ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-secondary'
            }`}>
              {isExpired
                ? 'Expired'
                : daysLeft === null
                  ? '—'
                  : daysLeft <= 0
                    ? 'Today'
                    : `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5">
              {isTrial ? 'Trial Expires' : isExpired ? 'Expired On' : 'Next Renewal'}
            </p>
            <p className="text-sm font-bold text-secondary flex items-center gap-1.5">
              <RiCalendarLine size={14} className="text-gray-400 flex-shrink-0" />
              {formatDate(sub?.current_period_end)}
            </p>
          </div>
        </div>

        {/* Days-remaining progress bar */}
        {!isExpired && daysLeft !== null && daysLeft > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {isTrial ? 'Trial Period' : 'Subscription Period'}
              </span>
              <span className={`text-[10px] font-black ${
                isCritical ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-gray-400'
              }`}>
                {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isCritical ? 'bg-red-500' : isUrgent ? 'bg-amber-400' : isTrial ? 'bg-blue-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(4, (daysLeft / 30) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Billing Breakdown ────────────────────────────────────────────── */}
      {charge && plan && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center border border-primary/10 text-primary">
              <RiBankCardLine size={16} />
            </div>
            <h4 className="text-sm font-black text-secondary uppercase tracking-tight">Billing Breakdown</h4>
          </div>

          <div className="divide-y divide-gray-50 rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex justify-between px-4 py-3">
              <span className="text-sm text-gray-500">Subscription ({plan.name})</span>
              <span className="text-sm font-semibold text-secondary">
                {formatPrice(charge.planPrice, currency)}
              </span>
            </div>
            {Number(charge.platformFee) > 0 && (
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-gray-500">
                  Platform fee{charge.platformFeePercent ? ` (${charge.platformFeePercent}%)` : ''}
                </span>
                <span className="text-sm font-semibold text-secondary">
                  {formatPrice(charge.platformFee, currency)}
                </span>
              </div>
            )}
            {Number(charge.taxAmount) > 0 && (
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-gray-500">
                  VAT{charge.taxRatePercent ? ` (${charge.taxRatePercent}%)` : ''}
                  {charge.taxId ? ` · ${charge.taxId}` : ''}
                </span>
                <span className="text-sm font-semibold text-secondary">
                  {formatPrice(charge.taxAmount, currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between px-4 py-3.5 bg-gray-50">
              <span className="text-sm font-black text-secondary">Total Due</span>
              <span className="text-sm font-black text-secondary">
                {formatPrice(charge.total, currency)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Action Banner ────────────────────────────────────────────────── */}
      {(isExpired || isUrgent || isTrial) && (
        <div className={`rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
          isExpired   ? 'bg-red-50 border-red-100'
          : isCritical ? 'bg-amber-50 border-amber-100'
          : 'bg-blue-50 border-blue-100'
        }`}>
          <div>
            <p className={`text-sm font-black mb-1 ${
              isExpired ? 'text-red-700' : isCritical ? 'text-amber-700' : 'text-blue-700'
            }`}>
              {isExpired
                ? 'Subscription Expired'
                : isCritical
                  ? 'Expiring Very Soon!'
                  : isTrial
                    ? `Trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                    : `Renewing in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
            </p>
            <p className={`text-xs font-medium ${
              isExpired ? 'text-red-500' : isCritical ? 'text-amber-500' : 'text-blue-500'
            }`}>
              {isExpired
                ? 'Renew your plan to restore full access for your team.'
                : isTrial
                  ? 'Go to the billing page to select and pay for a plan before your trial ends.'
                  : 'Go to the billing page to renew your subscription early.'}
            </p>
          </div>
          <Link
            to="/admin/subscription"
            className={`flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm ${
              isExpired   ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
              : isCritical ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
              : 'bg-primary hover:opacity-90 text-white shadow-primary/20'
            }`}
          >
            {isExpired ? 'Renew Now' : 'Manage Billing'}
            <RiArrowRightLine size={14} />
          </Link>
        </div>
      )}

      {isActive && !isUrgent && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RiShieldCheckLine size={22} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-black text-green-700">Subscription Active</p>
              <p className="text-xs text-green-500 font-medium mt-0.5">
                Your team has full access to all platform features.
              </p>
            </div>
          </div>
          <Link
            to="/admin/subscription"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-green-200 rounded-xl text-xs font-black text-green-700 uppercase tracking-widest hover:shadow-md transition-all"
          >
            View Billing <RiArrowRightLine size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
