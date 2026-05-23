import { useRef } from "react";
import { motion } from "framer-motion";
import { FiImage, FiSave, FiRefreshCw } from "react-icons/fi";
import Button from "../../Button";
import { resolveAssetUrl } from "../../../utils/assetUrl";

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
  loading,
  error,
}) {
  const fileRef = useRef(null);
  const previewUrl = logoFile
    ? URL.createObjectURL(logoFile)
    : resolveAssetUrl(organisation?.logoUrl);

  return (
    <motion.div {...panelMotion} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
          <div className="p-2 bg-violet-500/10 rounded-xl text-violet-600">
            <FiImage size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-secondary">Organisation branding</h3>
            <p className="text-xs text-gray-500">
              Logo appears on the right side of the app header for your organisation
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : (
            <>
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
                    PNG, JPG, WEBP, or SVG. Max 2 MB. Recommended wide logo on transparent background.
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
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
                  {saving ? (
                    <FiRefreshCw className="animate-spin" />
                  ) : (
                    <FiSave />
                  )}
                  {saving ? "Uploading…" : "Upload organisation logo"}
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </motion.div>
  );
}
