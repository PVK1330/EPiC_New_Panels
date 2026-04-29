import { motion } from "framer-motion";
import { FiCreditCard, FiDollarSign, FiShield, FiSave, FiRefreshCw, FiCheckCircle } from "react-icons/fi";
import Button from "../../Button";
import Input from "../../Input";

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const CURRENCY_OPTIONS = [
  { value: "GBP", label: "GBP (£)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "USD", label: "USD ($)" },
];

function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
        on ? "bg-primary" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function PaymentSettings({ 
  config, 
  onConfigChange, 
  onToggle,
  onSave, 
  saving, 
  loading, 
  error 
}) {
  return (
    <motion.div {...panelMotion} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-semibold flex items-center gap-3">
          <div className="p-1 bg-red-100 rounded-lg">!</div>
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Loading Configuration...</p>
        </div>
      ) : (
        <>
          {/* General Config */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full">
              <div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <FiDollarSign size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-secondary">Currency & Invoicing</h3>
                  <p className="text-xs text-gray-500">Standard defaults for billing</p>
                </div>
              </div>
              <div className="p-4 space-y-6">
                <Input 
                  label="Default Payment Currency" 
                  name="currency" 
                  value={config.currency} 
                  onChange={(e) => onConfigChange('currency', e.target.value)} 
                  options={CURRENCY_OPTIONS} 
                />
                <Input 
                  label="Invoice Prefix" 
                  name="invoice_prefix" 
                  value={config.invoice_prefix} 
                  onChange={(e) => onConfigChange('invoice_prefix', e.target.value)} 
                  placeholder="e.g. INV-"
                />
                
                <div className="pt-2">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Offline Payment Methods</p>
                  <div className="space-y-3">
                    {[
                      { id: "pay_bank", label: "Bank Transfer", desc: "Allow wire and local transfers" },
                      { id: "pay_card", label: "Direct Card Payment", desc: "Process cards via office terminal" },
                      { id: "pay_cheque", label: "Cheque Deposit", desc: "Manual cheque processing" },
                    ].map((method) => (
                      <div 
                        key={method.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          config[method.id] ? "bg-primary/5 border-primary/20" : "bg-gray-50/50 border-gray-100"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-secondary">{method.label}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{method.desc}</p>
                        </div>
                        <Toggle on={config[method.id]} onToggle={() => onToggle(method.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Gateway Config */}
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full">
              <div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                  <FiShield size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-secondary">Online Gateway</h3>
                  <p className="text-xs text-gray-500">Connect secure payment processors</p>
                </div>
              </div>
              <div className="p-4 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Active Online Gateway</label>
                  <select
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                    value={config.active_gateway}
                    onChange={(e) => onConfigChange('active_gateway', e.target.value)}
                  >
                    <option value="stripe">Stripe (Recommended)</option>
                    <option value="paypal">PayPal</option>
                    <option value="razorpay">Razorpay</option>
                  </select>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                  {config.active_gateway === "stripe" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 text-indigo-600 mb-2">
                        <FiCheckCircle /> <span className="text-[10px] font-black uppercase tracking-widest">Stripe is Active</span>
                      </div>
                      <Input label="Stripe Public Key" name="stripe_public_key" value={config.stripe_public_key} onChange={(e) => onConfigChange('stripe_public_key', e.target.value)} placeholder="pk_test_..." />
                      <Input label="Stripe Secret Key" name="stripe_secret_key" type="password" value={config.stripe_secret_key} onChange={(e) => onConfigChange('stripe_secret_key', e.target.value)} placeholder="sk_test_..." />
                    </div>
                  )}

                  {config.active_gateway === "paypal" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <FiCheckCircle /> <span className="text-[10px] font-black uppercase tracking-widest">PayPal is Active</span>
                      </div>
                      <Input label="PayPal Client ID" name="paypal_client_id" value={config.paypal_client_id} onChange={(e) => onConfigChange('paypal_client_id', e.target.value)} placeholder="AfH..." />
                      <Input label="PayPal Secret" name="paypal_secret" type="password" value={config.paypal_secret} onChange={(e) => onConfigChange('paypal_secret', e.target.value)} placeholder="ELa..." />
                    </div>
                  )}

                  {config.active_gateway === "razorpay" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <FiCheckCircle /> <span className="text-[10px] font-black uppercase tracking-widest">Razorpay is Active</span>
                      </div>
                      <Input label="Razorpay Key ID" name="razorpay_key_id" value={config.razorpay_key_id} onChange={(e) => onConfigChange('razorpay_key_id', e.target.value)} placeholder="rzp_test_..." />
                      <Input label="Razorpay Key Secret" name="razorpay_key_secret" type="password" value={config.razorpay_key_secret} onChange={(e) => onConfigChange('razorpay_key_secret', e.target.value)} placeholder="..." />
                    </div>
                  )}
                </div>
                
                <p className="text-[10px] text-gray-400 italic text-center">
                  Make sure to use test keys before going live to production.
                </p>
              </div>
            </section>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={onSave} 
              disabled={saving}
              className="rounded-2xl px-10 py-3.5 flex items-center gap-2 shadow-xl shadow-primary/20"
            >
              {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
              {saving ? "Updating Gateway..." : "Save Payment Configuration"}
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}
