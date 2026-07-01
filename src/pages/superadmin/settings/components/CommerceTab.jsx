import {
  RiBankCardLine,
  RiSaveLine,
  RiEyeLine,
  RiEyeOffLine,
  RiTimeLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiPercentLine,
} from 'react-icons/ri';
import Button from '../../../../components/Button';

// ── Small building blocks ───────────────────────────────────────────────────

const Section = ({ icon, title, description, action, children }) => {
  const Icon = icon;
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon size={18} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
      {action}
    </header>
    <div className="p-6 space-y-5">{children}</div>
  </section>
  );
};

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    {children}
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

const baseInput =
  'w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all placeholder:text-slate-400';

const SecretField = ({ label, value, onChange, isSet, show, onToggleShow, savedPlaceholder, placeholder }) => (
  <Field
    label={
      <span className="inline-flex items-center gap-2">
        {label}
        {!value && (
          isSet ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
              <RiCheckLine size={10} /> Saved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md">
              <RiErrorWarningLine size={10} /> Not set
            </span>
          )
        )}
      </span>
    }
    hint={isSet && !value ? 'Saved — leave blank to keep it, or type a new value to replace.' : undefined}
  >
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        placeholder={isSet && !value ? savedPlaceholder : placeholder}
        value={value}
        onChange={onChange}
        className={`${baseInput} pr-10 font-mono`}
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
      </button>
    </div>
  </Field>
);

// ── Main ─────────────────────────────────────────────────────────────────────

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
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const set = (key) => (e) => setStripeConfig((p) => ({ ...p, [key]: e.target.value }));
  const isConnected = stripeStatus === 'Connected';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ── Stripe connection ─────────────────────────────────────────────── */}
      <Section
        icon={RiBankCardLine}
        title="Stripe Connection"
        description="API credentials for processing subscription payments"
        action={
          stripeStatus && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              {stripeStatus}
            </span>
          )
        }
      >
        <Field label="Publishable Key" hint="Safe to expose — used by the client to initialise checkout.">
          <input
            type="text"
            placeholder="pk_live_…"
            value={stripeConfig.publishable_key}
            onChange={set('publishable_key')}
            className={`${baseInput} font-mono`}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SecretField
            label="Secret Key"
            value={stripeConfig.secret_key}
            onChange={set('secret_key')}
            isSet={secretKeySet}
            show={showSecretKey}
            onToggleShow={() => setShowSecretKey((v) => !v)}
            placeholder="sk_live_…"
            savedPlaceholder="Leave blank to keep existing key"
          />
          <SecretField
            label="Webhook Secret"
            value={stripeConfig.webhook_secret}
            onChange={set('webhook_secret')}
            isSet={webhookSecretSet}
            show={showWebhookSecret}
            onToggleShow={() => setShowWebhookSecret((v) => !v)}
            placeholder="whsec_…"
            savedPlaceholder="Leave blank to keep existing secret"
          />
        </div>
      </Section>

      {/* ── Billing preferences ───────────────────────────────────────────── */}
      <Section
        icon={RiPercentLine}
        title="Billing Preferences"
        description="Currency, fees and tax applied to every subscription"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Default Currency">
            <select
              value={stripeConfig.currency}
              onChange={set('currency')}
              className={`${baseInput} appearance-none`}
            >
              <option value="GBP">GBP (£) — British Pound</option>
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="CAD">CAD ($) — Canadian Dollar</option>
              <option value="AUD">AUD ($) — Australian Dollar</option>
            </select>
          </Field>

          <Field label="Platform Fee (%)" hint="Charged on top of the subscription price.">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="0"
              value={stripeConfig.platform_fee}
              onChange={set('platform_fee')}
              className={baseInput}
            />
          </Field>

          <Field label="Default Tax Rate (%)" hint="Applied to invoices where tax is collected.">
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={stripeConfig.tax_rate || ''}
              onChange={set('tax_rate')}
              className={baseInput}
            />
          </Field>

          <Field label="Tax ID" hint="Your VAT / tax registration number shown on invoices.">
            <input
              type="text"
              placeholder="e.g. GB123456789"
              value={stripeConfig.tax_id || ''}
              onChange={set('tax_id')}
              className={baseInput}
            />
          </Field>
        </div>
      </Section>

      {/* ── Free trial ────────────────────────────────────────────────────── */}
      <Section
        icon={RiTimeLine}
        title="Free Trial"
        description="What new organisations get before payment is required"
        action={
          <button
            type="button"
            onClick={() => setStripeConfig((p) => ({ ...p, free_trial_enabled: !p.free_trial_enabled }))}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
              stripeConfig.free_trial_enabled ? 'bg-primary' : 'bg-slate-200'
            }`}
            aria-pressed={stripeConfig.free_trial_enabled}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                stripeConfig.free_trial_enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        }
      >
        {stripeConfig.free_trial_enabled ? (
          <Field
            label="Trial Duration (days)"
            hint="How long new organisations can use the platform before they must pay."
          >
            <input
              type="number"
              min="1"
              max="365"
              value={stripeConfig.free_trial_days ?? 14}
              onChange={set('free_trial_days')}
              className={`${baseInput} max-w-[12rem]`}
            />
          </Field>
        ) : (
          <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
            <RiErrorWarningLine className="text-amber-500 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-amber-700 leading-relaxed">
              Trial disabled — new organisation admins are redirected to billing on first login
              and must select a plan and pay before accessing the platform.
            </p>
          </div>
        )}
      </Section>

      {/* ── Save ──────────────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-1">
        <Button
          onClick={handleSaveStripe}
          disabled={stripeSaving}
          className="px-8 py-2.5 text-sm font-semibold shadow-lg shadow-primary/20"
        >
          <RiSaveLine size={16} className="inline mr-2" />
          {stripeSaving ? 'Saving…' : 'Save Payment Settings'}
        </Button>
      </div>
    </div>
  );
};

export default CommerceTab;
