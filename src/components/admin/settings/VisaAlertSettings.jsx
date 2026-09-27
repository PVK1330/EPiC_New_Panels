import { useEffect, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import Button from "../../Button";
import { getVisaAlertSettings, updateVisaAlertSettings } from "../../../services/settingsService";
import { useToast } from "../../../context/ToastContext";
import { getApiError } from "../../../utils/apiError";

/**
 * Phase 2 UAT 3.1 — "Please confirm how far ahead alerts are raised."
 * Per-firm setting: raise a visa expiry alert this many days before a
 * client's visa expires (dashboard "Visa Alerts" + client list counter).
 */
export default function VisaAlertSettings() {
  const { showToast } = useToast();
  const [days, setDays] = useState("");
  const [limits, setLimits] = useState({ min: 1, max: 365, defaultDays: 90 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getVisaAlertSettings()
      .then((res) => {
        if (!active) return;
        const d = res.data?.data || {};
        setDays(String(d.visaExpiryAlertDays ?? d.defaultDays ?? 90));
        setLimits({ min: d.min ?? 1, max: d.max ?? 365, defaultDays: d.defaultDays ?? 90 });
      })
      .catch((e) => active && setError(getApiError(e, "Could not load visa alert settings")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const save = async () => {
    const n = Number(days);
    if (!Number.isInteger(n) || n < limits.min || n > limits.max) {
      setError(`Enter a whole number of days between ${limits.min} and ${limits.max}.`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await updateVisaAlertSettings({ visaExpiryAlertDays: n });
      showToast({ message: res.data?.message || "Visa alert window saved", variant: "success" });
    } catch (e) {
      const msg = getApiError(e, "Could not save visa alert settings");
      setError(msg);
      showToast({ message: msg, variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      <div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
        <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
          <FiAlertTriangle size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-secondary">Visa expiry alerts</h3>
          <p className="text-xs text-gray-500">
            How far ahead the dashboard and client list warn that a client's current visa is expiring.
            ILR and other in-country applications usually have to be made before current leave expires.
          </p>
        </div>
      </div>
      <div className="p-4 flex flex-wrap items-end gap-3">
        <label className="text-sm text-gray-700">
          <span className="block text-xs font-bold text-gray-500 mb-1">Raise an alert this many days before expiry</span>
          <input
            type="number"
            min={limits.min}
            max={limits.max}
            step={1}
            value={days}
            disabled={loading}
            onChange={(e) => {
              setDays(e.target.value);
              if (error) setError("");
            }}
            className="w-32 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
          />
        </label>
        <Button onClick={save} disabled={loading || saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <p className="text-xs text-gray-400 w-full">
          Default {limits.defaultDays} days. Allowed {limits.min}–{limits.max}.
        </p>
        {error && <p className="text-xs text-red-500 w-full">{error}</p>}
      </div>
    </section>
  );
}
