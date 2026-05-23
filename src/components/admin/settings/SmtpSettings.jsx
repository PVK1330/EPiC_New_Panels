import { motion } from "framer-motion";
import { FiMail, FiSave, FiSend, FiServer } from "react-icons/fi";
import Button from "../../Button";
import Input from "../../Input";

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

function Toggle({ on, onToggle, label }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <span className="text-sm font-semibold text-secondary">{label}</span>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
          on ? "bg-primary" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

export default function SmtpSettings({
  form,
  meta,
  onChange,
  onToggleEnabled,
  onSave,
  onTest,
  saving,
  testing,
  loading,
  error,
}) {
  const activeLabel =
    meta?.activeSource === "organisation"
      ? "Using your organisation SMTP"
      : meta?.activeSource === "platform"
        ? "Using platform (superadmin) SMTP"
        : "No SMTP configured";

  return (
    <motion.div {...panelMotion} className="space-y-6">
      {error && (
        <motion.div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-semibold">
          {error}
        </motion.div>
      )}

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100">
          <motion.div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4" />
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Loading SMTP…</p>
        </div>
      ) : (
        <>
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/80 flex items-start gap-3">
            <FiServer className="text-primary mt-0.5 shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-secondary">{activeLabel}</p>
              <p className="text-xs text-gray-500 mt-1">
                {form.enabled
                  ? "Outgoing mail uses the credentials below."
                  : meta?.platformConfigured
                    ? "Outgoing mail uses the platform SMTP configured by the superadmin (.env)."
                    : "Configure organisation SMTP below, or ask the platform admin to set EMAIL_USER / EMAIL_PASS."}
              </p>
            </div>
          </div>

          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <motion.div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
                <FiMail size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-secondary">Organisation SMTP</h3>
                <p className="text-xs text-gray-500">Optional — leave off to use platform mail</p>
              </div>
            </motion.div>

            <div className="p-4 space-y-5">
              <Toggle
                label="Use custom SMTP for this organisation"
                on={form.enabled}
                onToggle={onToggleEnabled}
              />

              {form.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <Input
                    label="SMTP host (optional for Gmail)"
                    value={form.host}
                    onChange={(e) => onChange("host", e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                  <Input
                    label="Port"
                    value={form.port}
                    onChange={(e) => onChange("port", e.target.value)}
                    placeholder="587"
                  />
                  <Input
                    label="Service (if no host)"
                    value={form.service}
                    onChange={(e) => onChange("service", e.target.value)}
                    placeholder="gmail"
                  />
                  <Input
                    label="From address"
                    value={form.from}
                    onChange={(e) => onChange("from", e.target.value)}
                    placeholder="noreply@yourfirm.com"
                  />
                  <Input
                    label="SMTP username"
                    value={form.user}
                    onChange={(e) => onChange("user", e.target.value)}
                    placeholder="you@company.com"
                  />
                  <Input
                    label="SMTP password"
                    type="password"
                    value={form.password}
                    onChange={(e) => onChange("password", e.target.value)}
                    placeholder={form.hasPassword ? "•••••••• (leave blank to keep)" : "App password"}
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.secure}
                      onChange={(e) => onChange("secure", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Use SSL/TLS (port 465)
                  </label>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="button" onClick={onSave} disabled={saving}>
                  <FiSave className="inline mr-2" />
                  {saving ? "Saving…" : "Save SMTP"}
                </Button>
                <Button type="button" variant="outline" onClick={onTest} disabled={testing}>
                  <FiSend className="inline mr-2" />
                  {testing ? "Sending…" : "Send test email"}
                </Button>
              </div>
            </div>
          </section>
        </>
      )}
    </motion.div>
  );
}
