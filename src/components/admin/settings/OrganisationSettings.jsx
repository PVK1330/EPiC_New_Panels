import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiImage, FiSave, FiRefreshCw, FiCopy, FiCheck, FiUserPlus } from "react-icons/fi";
import Button from "../../Button";
import { resolveOrganisationLogoUrl, resolveAssetUrl } from "../../../utils/assetUrl";

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export default function OrganisationSettings({
  organisation,
  logoFile,
  onLogoFileChange,
  onSave,
  saving,
  faviconFile,
  onFaviconFileChange,
  onFaviconSave,
  savingFavicon,
  loading,
  error,
}) {
  const fileRef = useRef(null);
  const faviconRef = useRef(null);
  const [copiedField, setCopiedField] = useState("");

  const copyValue = async (field, value) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    } catch {
      /* clipboard unavailable (http/permissions) — value stays selectable */
    }
  };
  const previewUrl = logoFile
    ? URL.createObjectURL(logoFile)
    : resolveOrganisationLogoUrl(organisation);
  const faviconPreviewUrl = faviconFile
    ? URL.createObjectURL(faviconFile)
    : resolveAssetUrl(organisation?.faviconUrl ?? organisation?.favicon_url);

  return (
    <motion.div {...panelMotion} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* BUG-001: candidates must enter this ID/code to self-register, but it
          was not visible anywhere in the app for admins to share. */}
      {!loading && organisation && (
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
              <FiUserPlus size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary">Candidate self-registration</h3>
              <p className="text-xs text-gray-500">
                Share either value below with candidates — they enter it in the
                "Organisation ID or code" field when creating their portal account
              </p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { field: "id", label: "Organisation ID", value: organisation?.id },
              { field: "slug", label: "Organisation code", value: organisation?.slug },
            ]
              .filter((item) => item.value !== null && item.value !== undefined && item.value !== "")
              .map((item) => (
                <div
                  key={item.field}
                  className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      {item.label}
                    </p>
                    <p className="text-sm font-bold text-secondary truncate select-all">
                      {item.value}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyValue(item.field, item.value)}
                    className="shrink-0 p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-primary hover:border-primary/50 transition-colors"
                    title={`Copy ${item.label.toLowerCase()}`}
                  >
                    {copiedField === item.field ? (
                      <FiCheck size={16} className="text-emerald-600" />
                    ) : (
                      <FiCopy size={16} />
                    )}
                  </button>
                </div>
              ))}
          </div>
        </section>
      )}

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
          <div className="p-2 bg-violet-500/10 rounded-xl text-violet-600">
            <FiImage size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-secondary">Organisation branding</h3>
            <p className="text-xs text-gray-500">
              Logo and favicon for your organisation — changes apply immediately across the app
            </p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {/* ── Logo ── */}
              <div className="space-y-4">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">App Logo</p>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-40 h-20 rounded-2xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Organisation logo"
                        className="max-h-16 max-w-[140px] object-contain"
                      />
                    ) : (
                      <span className="text-xs font-bold text-gray-400">No logo yet</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-bold text-secondary">
                      {organisation?.name || "Your organisation"}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG or WEBP · max 2 MB · wide logo on transparent background recommended
                    </p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onLogoFileChange(f);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileRef.current?.click()}
                    >
                      Choose file
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={onSave}
                    disabled={saving || !logoFile}
                    className="rounded-2xl px-8 flex items-center gap-2"
                  >
                    {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                    {saving ? "Uploading…" : "Upload logo"}
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* ── Favicon ── */}
              <div className="space-y-4">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Favicon</p>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {faviconPreviewUrl ? (
                      <img
                        src={faviconPreviewUrl}
                        alt="Organisation favicon"
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <span className="text-xs font-bold text-gray-400 text-center leading-tight px-1">No favicon</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-gray-500">
                      Shown in the browser tab when users access your organisation's portal.
                      <br />PNG, ICO or WEBP · max 512 KB · square image recommended (e.g. 32×32 or 64×64)
                    </p>
                    <input
                      ref={faviconRef}
                      type="file"
                      accept="image/png,image/x-icon,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onFaviconFileChange(f);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => faviconRef.current?.click()}
                    >
                      Choose file
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={onFaviconSave}
                    disabled={savingFavicon || !faviconFile}
                    className="rounded-2xl px-8 flex items-center gap-2"
                  >
                    {savingFavicon ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                    {savingFavicon ? "Uploading…" : "Upload favicon"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </motion.div>
  );
}
