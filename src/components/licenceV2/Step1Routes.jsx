import { useState, useEffect } from "react";
import { Briefcase, GraduationCap, TrendingUp, Globe, Users, Loader2 } from "lucide-react";
import { getLicenceV2FeePreview } from "../../services/licenceApi";

const ROUTES = [
  { code: "SkilledWorker", label: "Skilled Worker", icon: Briefcase, desc: "Sponsor overseas nationals for skilled roles (RQF 3+)." },
  { code: "Student", label: "Student", icon: GraduationCap, desc: "Sponsor international students at your institution." },
  { code: "ScaleUp", label: "Scale-up", icon: TrendingUp, desc: "Sponsor high-skilled workers to help your business scale." },
  { code: "GBM", label: "Global Business Mobility", icon: Globe, desc: "Sponsor overseas nationals temporarily for business needs." },
  { code: "GAE", label: "Government Authorised Exchange", icon: Users, desc: "Sponsor participants in approved government exchange schemes." },
];

function fmt(n) {
  return typeof n === "number" ? `£${n.toLocaleString("en-GB")}` : "—";
}

export default function Step1Routes({ data, onChange, onNext, saving }) {
  const [fee, setFee] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);

  const routes = data.routes || [];
  const sponsorSize = data.sponsorSize || "";

  useEffect(() => {
    if (!routes.length) { setFee(null); return; }
    setFeeLoading(true);
    getLicenceV2FeePreview({ routes, sponsorSize: sponsorSize || null })
      .then((r) => setFee(r.data.data))
      .catch(() => setFee(null))
      .finally(() => setFeeLoading(false));
  }, [routes.join(","), sponsorSize]);

  const toggleRoute = (code) => {
    const next = routes.includes(code) ? routes.filter((r) => r !== code) : [...routes, code];
    onChange({ routes: next });
  };

  const canContinue = routes.length > 0 && !!sponsorSize;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-secondary mb-1">Licence Routes</h2>
        <p className="text-sm font-bold text-gray-400">Select every immigration route you intend to use. You can add more later.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROUTES.map(({ code, label, icon: Icon, desc }) => {
          const active = routes.includes(code);
          return (
            <button
              key={code}
              type="button"
              onClick={() => toggleRoute(code)}
              className={`text-left p-5 rounded-2xl border-2 transition-all ${
                active ? "border-primary bg-primary/5" : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${active ? "bg-primary/10 text-primary" : "bg-gray-50 text-gray-400"}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className={`text-sm font-black ${active ? "text-primary" : "text-secondary"}`}>{label}</p>
                  <p className="text-xs font-bold text-gray-400 mt-0.5">{desc}</p>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  active ? "border-primary bg-primary" : "border-gray-200"
                }`}>
                  {active && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Sponsor Size *</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { val: "small", label: "Small / Charity", desc: "Under 50 employees or a registered charity." },
            { val: "large", label: "Medium / Large", desc: "50 or more employees." },
          ].map(({ val, label, desc }) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange({ sponsorSize: val })}
              className={`text-left p-4 rounded-2xl border-2 transition-all ${
                sponsorSize === val ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <p className={`text-sm font-black ${sponsorSize === val ? "text-primary" : "text-secondary"}`}>{label}</p>
              <p className="text-xs font-bold text-gray-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Fee Preview */}
      {(feeLoading || fee) && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Estimated Fee</p>
          {feeLoading ? (
            <div className="flex items-center gap-2 text-gray-400"><Loader2 size={16} className="animate-spin" /><span className="text-sm font-bold">Calculating…</span></div>
          ) : fee ? (
            <div className="space-y-2">
              {(fee.lineItems || []).map((item) => (
                <div key={item.key} className="flex justify-between text-sm font-bold text-secondary">
                  <span>{item.label}</span>
                  <span>{fmt(item.amount)}</span>
                </div>
              ))}
              {fee.immigrationSkillsChargeEstimate > 0 && (
                <div className="flex justify-between text-sm font-bold text-gray-400">
                  <span>ISC estimate (informational)</span>
                  <span>{fmt(fee.immigrationSkillsChargeEstimate)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-100 flex justify-between font-black text-secondary">
                <span>Application Fee Total</span>
                <span className="text-primary">{fmt(fee.applicationFeeTotal)}</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => canContinue && onNext({ routes, sponsorSize })}
          disabled={!canContinue || saving}
          className="bg-primary text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}
