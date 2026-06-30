import { useState, useEffect } from "react";
import { Save, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import {
  getIntegrationCredentials,
  updateIntegrationCredentials,
} from "../../../services/integrationCredentialsApi";

const SECRET_PLACEHOLDER = "Leave blank to keep existing secret";

const emptyGoogle = { client_id: "", client_secret: "", redirect_uri: "" };
const emptyMicrosoft = {
  client_id: "",
  client_secret: "",
  redirect_uri: "",
  tenant_id: "common",
  authority: "",
};

/**
 * Admin form for per-tenant Google & Microsoft OAuth credentials.
 * Each organisation supplies its own API keys; secrets are write-only
 * (masked on read) and the backend keeps the existing secret when the
 * field is left blank.
 */
export default function IntegrationCredentials() {
  const [google, setGoogle] = useState(emptyGoogle);
  const [microsoft, setMicrosoft] = useState(emptyMicrosoft);
  const [meta, setMeta] = useState({ google: {}, microsoft: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getIntegrationCredentials();
      const data = res?.data || {};
      setMeta({ google: data.google || {}, microsoft: data.microsoft || {} });
      setGoogle({
        client_id: data.google?.client_id || "",
        client_secret: "",
        redirect_uri: data.google?.redirect_uri || "",
      });
      setMicrosoft({
        client_id: data.microsoft?.client_id || "",
        client_secret: "",
        redirect_uri: data.microsoft?.redirect_uri || "",
        tenant_id: data.microsoft?.tenant_id || "common",
        authority: data.microsoft?.authority || "",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to load integration credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await updateIntegrationCredentials({ google, microsoft });
      const data = res?.data || {};
      setMeta({ google: data.google || {}, microsoft: data.microsoft || {} });
      // Clear secret inputs after a successful save (they are write-only).
      setGoogle((g) => ({ ...g, client_secret: "" }));
      setMicrosoft((m) => ({ ...m, client_secret: "" }));
      setMessage({ type: "success", text: "Integration credentials saved." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Could not save credentials.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-400 py-6">Loading credentials…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <KeyRound size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Your own API keys</p>
          <p className="text-blue-700/80 mt-1">
            Each organisation uses its own Google / Microsoft credentials. Create
            an OAuth app in the provider console, then paste the values below.
            Secrets are encrypted and never shown again after saving.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {message.text}
        </div>
      )}

      {/* Google */}
      <ProviderCard
        title="Google (Calendar & Meet)"
        configured={meta.google?.configured}
        hasSecret={meta.google?.has_client_secret}
      >
        <Field
          label="Client ID"
          value={google.client_id}
          onChange={(v) => setGoogle((g) => ({ ...g, client_id: v }))}
          placeholder="xxxxxxxx.apps.googleusercontent.com"
        />
        <Field
          label="Client Secret"
          type="password"
          value={google.client_secret}
          onChange={(v) => setGoogle((g) => ({ ...g, client_secret: v }))}
          placeholder={meta.google?.has_client_secret ? SECRET_PLACEHOLDER : "GOCSPX-…"}
        />
        <Field
          label="Redirect URI"
          value={google.redirect_uri}
          onChange={(v) => setGoogle((g) => ({ ...g, redirect_uri: v }))}
          placeholder="https://your-api/api/google/callback"
        />
      </ProviderCard>

      {/* Microsoft */}
      <ProviderCard
        title="Microsoft (Outlook & Teams)"
        configured={meta.microsoft?.configured}
        hasSecret={meta.microsoft?.has_client_secret}
      >
        <Field
          label="Client ID (Application ID)"
          value={microsoft.client_id}
          onChange={(v) => setMicrosoft((m) => ({ ...m, client_id: v }))}
          placeholder="00000000-0000-0000-0000-000000000000"
        />
        <Field
          label="Client Secret"
          type="password"
          value={microsoft.client_secret}
          onChange={(v) => setMicrosoft((m) => ({ ...m, client_secret: v }))}
          placeholder={meta.microsoft?.has_client_secret ? SECRET_PLACEHOLDER : "Secret value"}
        />
        <Field
          label="Redirect URI"
          value={microsoft.redirect_uri}
          onChange={(v) => setMicrosoft((m) => ({ ...m, redirect_uri: v }))}
          placeholder="https://your-app/auth/microsoft/callback"
        />
        <Field
          label="Directory (Tenant) ID"
          value={microsoft.tenant_id}
          onChange={(v) => setMicrosoft((m) => ({ ...m, tenant_id: v }))}
          placeholder="common (or your tenant GUID)"
        />
      </ProviderCard>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Saving…" : "Save credentials"}
        </button>
      </div>
    </div>
  );
}

function ProviderCard({ title, configured, hasSecret, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold text-secondary">{title}</h4>
        <span
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
            configured
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {configured ? (
            <>
              <CheckCircle2 size={12} /> Configured
            </>
          ) : (
            "Not configured"
          )}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
      {hasSecret && (
        <p className="text-xs text-gray-400">
          A secret is already saved. Leave the secret field blank to keep it.
        </p>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all"
      />
    </div>
  );
}
