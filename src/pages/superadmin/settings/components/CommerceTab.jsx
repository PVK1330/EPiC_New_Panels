import { RiBankCardLine, RiShieldCheckLine, RiSaveLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';

const CommerceTab = ({
  stripeLoading,
  stripeConfig,
  setStripeConfig,
  stripeStatus,
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
            <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">
              Secret Key {stripeStatus === 'Connected' && <span className="text-gray-400 font-normal normal-case">(leave blank to keep existing)</span>}
            </label>
            <div className="relative">
              <input
                type={showSecretKey ? 'text' : 'password'}
                placeholder={stripeStatus === 'Connected' ? '••••••••••••••••' : 'sk_live_...'}
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
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">
              Webhook Secret {stripeStatus === 'Connected' && <span className="text-gray-400 font-normal normal-case">(leave blank to keep existing)</span>}
            </label>
            <div className="relative">
              <input
                type={showWebhookSecret ? 'text' : 'password'}
                placeholder={stripeStatus === 'Connected' ? '••••••••••••••••' : 'whsec_...'}
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