import { RiBankCardLine, RiShieldCheckLine, RiSaveLine, RiEyeLine, RiEyeOffLine, RiTimeLine, RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';

const KeyStatusBadge = ({ isSet, typedValue }) => {
  if (typedValue) return null; // user is actively typing a new value — hide badge
  return isSet ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
      <RiCheckLine size={10} /> Saved
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
      <RiErrorWarningLine size={10} /> Not set
    </span>
  );
};

const CommerceTab = ({
  stripeLoading,
  stripeConfig,
  setStripeConfig,
  stripeStatus,
  secretKeySet,
  webhookSecretSet,
  showSecretKey,
  setShowSecretKey,
  showWebhookSecret,
  setShowWebhookSecret,
  stripeSaving,
  handleSaveStripe,
}) => {
  if (stripeLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10 text-primary">
              <RiBankCardLine size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-secondary uppercase tracking-tight">Payments (Stripe)</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gateway integration</p>
            </div>
          </div>
          {stripeStatus && (
            <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${
              stripeStatus === 'Connected'
                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                : 'bg-gray-100 text-gray-400 border-gray-200'
            }`}>
              {stripeStatus}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Publishable Key</label>
            <input
              type="text"
              placeholder="pk_live_..."
              value={stripeConfig.publishable_key}
              onChange={(e) => setStripeConfig((p) => ({ ...p, publishable_key: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-mono text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 ml-1">
              <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Secret Key</label>
              <KeyStatusBadge isSet={secretKeySet} typedValue={stripeConfig.secret_key} />
            </div>
            <div className="relative">
              <input
                type={showSecretKey ? 'text' : 'password'}
                placeholder={secretKeySet && !stripeConfig.secret_key ? 'Leave blank to keep existing key' : 'sk_live_...'}
                value={stripeConfig.secret_key}
                onChange={(e) => setStripeConfig((p) => ({ ...p, secret_key: e.target.value }))}
                className="w-full px-4 py-2.5 pr-11 bg-gray-50 border border-gray-100 rounded-xl text-sm font-mono text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors"
              >
                {showSecretKey ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
              </button>
            </div>
            {secretKeySet && !stripeConfig.secret_key && (
              <p className="text-[10px] text-green-600 font-semibold ml-1">
                ✓ Secret key is saved — type a new value only if you want to replace it.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 ml-1">
              <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Webhook Secret</label>
              <KeyStatusBadge isSet={webhookSecretSet} typedValue={stripeConfig.webhook_secret} />
            </div>
            <div className="relative">
              <input
                type={showWebhookSecret ? 'text' : 'password'}
                placeholder={webhookSecretSet && !stripeConfig.webhook_secret ? 'Leave blank to keep existing secret' : 'whsec_...'}
                value={stripeConfig.webhook_secret}
                onChange={(e) => setStripeConfig((p) => ({ ...p, webhook_secret: e.target.value }))}
                className="w-full px-4 py-2.5 pr-11 bg-gray-50 border border-gray-100 rounded-xl text-sm font-mono text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors"
              >
                {showWebhookSecret ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
              </button>
            </div>
            {webhookSecretSet && !stripeConfig.webhook_secret && (
              <p className="text-[10px] text-green-600 font-semibold ml-1">
                ✓ Webhook secret is saved — type a new value only if you want to replace it.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Default Currency</label>
            <select
              value={stripeConfig.currency}
              onChange={(e) => setStripeConfig((p) => ({ ...p, currency: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none"
            >
              <option value="GBP">GBP (£) — British Pound</option>
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR () — Euro</option>
              <option value="CAD">CAD ($) — Canadian Dollar</option>
              <option value="AUD">AUD ($) — Australian Dollar</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Platform Fee (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="0"
              value={stripeConfig.platform_fee}
              onChange={(e) => setStripeConfig((p) => ({ ...p, platform_fee: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <p className="text-[10px] text-gray-400 ml-1">Percentage charged on top of subscription price</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="text-xs font-black text-secondary uppercase tracking-widest">Taxation</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Default Rate (%)"
              type="number"
              value={stripeConfig.tax_rate || ''}
              onChange={(e) => setStripeConfig((p) => ({ ...p, tax_rate: e.target.value }))}
            />
            <Input
              label="Tax ID"
              value={stripeConfig.tax_id || ''}
              onChange={(e) => setStripeConfig((p) => ({ ...p, tax_id: e.target.value }))}
            />
          </div>
        </div>
        <div className="p-5 bg-secondary text-white rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-center">
          <RiShieldCheckLine size={60} className="absolute -bottom-4 -right-4 opacity-10" />
          <p className="text-lg font-black tracking-tight mb-2 text-white">Financial Compliance</p>
          <p className="text-[10px] font-medium opacity-70 leading-relaxed text-white">
            Automatic invoicing and tax records are enabled across all subscriptions.
          </p>
        </div>
      </div>

      {/* ── Free Trial Settings ───────────────────────────────────────────── */}
      <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10 text-primary">
            <RiTimeLine size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-secondary uppercase tracking-tight">Free Trial</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">New organisation onboarding</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="text-sm font-bold text-secondary">Enable Free Trial</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              When enabled, new organisations get a trial period before payment is required.
              When disabled, admins are redirected to billing immediately on first login.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStripeConfig((p) => ({ ...p, free_trial_enabled: !p.free_trial_enabled }))}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ml-4 ${
              stripeConfig.free_trial_enabled ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                stripeConfig.free_trial_enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {stripeConfig.free_trial_enabled && (
          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Trial Duration (days)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={stripeConfig.free_trial_days ?? 14}
              onChange={(e) => setStripeConfig((p) => ({ ...p, free_trial_days: e.target.value }))}
              className="w-48 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <p className="text-[10px] text-gray-400 ml-1">
              Number of days new organisations can access the platform before payment is required.
            </p>
          </div>
        )}

        {!stripeConfig.free_trial_enabled && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-[11px] text-amber-700 font-bold">
              Trial disabled — new organisation admins will be redirected to the billing page and must select a plan and pay before accessing the platform.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSaveStripe}
          disabled={stripeSaving}
          className="px-8 py-2.5 text-sm font-black shadow-lg shadow-primary/20"
        >
          <RiSaveLine size={16} className="inline mr-2" />
          {stripeSaving ? 'Saving...' : 'Save Payment Settings'}
        </Button>
      </div>
    </div>
  );
};

export default CommerceTab;