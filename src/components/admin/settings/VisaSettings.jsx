import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiLayers, FiPlus, FiEdit2, FiTrash2, FiFileText, FiUpload } from "react-icons/fi";
import Button from "../../Button";

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export default function VisaSettings({
  visaTypes,
  petitionTypes,
  loading,
  onAddVisa,
  onEditVisa,
  onDeleteVisa,
  onUploadCclTemplate,
  onDeleteCclTemplate,
  onAddPetition,
  onEditPetition,
  onDeletePetition,
  error,
}) {
  const fileInputRef = useRef(null);
  const [pendingVisaId, setPendingVisaId] = useState(null);
  const [uploadingVisaId, setUploadingVisaId] = useState(null);

  const triggerUpload = (visaId) => {
    setPendingVisaId(visaId);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    const visaId = pendingVisaId;
    e.target.value = "";
    setPendingVisaId(null);
    if (!file || !visaId || !onUploadCclTemplate) return;
    setUploadingVisaId(visaId);
    try {
      await onUploadCclTemplate(visaId, file);
    } finally {
      setUploadingVisaId(null);
    }
  };

  const templateName = (visa) =>
    visa.ccl_template_name || visa.cclTemplateName || null;

  return (
    <motion.div {...panelMotion} className="space-y-8">
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFileSelected}
      />

      {error && (
        <motion.div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-semibold flex items-center gap-3">
          <div className="p-1 bg-red-100 rounded-lg">!</div>
          {error}
        </motion.div>
      )}

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <FiLayers size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary">Visa Types</h3>
              <p className="text-xs text-gray-500">
                Configure visa categories and optional custom Client Care Letter templates (.docx / .pdf, max 5MB)
              </p>
            </div>
          </div>
          <Button onClick={onAddVisa} className="rounded-xl px-4 py-2 text-xs flex items-center gap-2">
            <FiPlus /> Add Visa Type
          </Button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="py-12 flex justify-center">
              <motion.div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : visaTypes.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400 italic">No visa types configured.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {visaTypes.map((visa) => {
                const hasTemplate = Boolean(templateName(visa));
                const isUploading = uploadingVisaId === visa.id;
                return (
                  <div
                    key={visa.id}
                    className="group p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-primary/20 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-white rounded-xl text-gray-400 group-hover:text-primary transition-colors shrink-0">
                          <FiLayers size={16} />
                        </div>
                        <span className="text-sm font-bold text-secondary truncate">{visa.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditVisa(visa.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit name"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteVisa(visa.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete visa type"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
                      <FiFileText className="text-gray-400 shrink-0" size={14} />
                      {hasTemplate ? (
                        <>
                          <span className="font-bold text-secondary truncate max-w-[200px] sm:max-w-md">
                            {templateName(visa)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteCclTemplate?.(visa.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove custom CCL template"
                          >
                            <FiTrash2 size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => triggerUpload(visa.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            <FiUpload size={12} />
                            {isUploading ? "Replacing…" : "Replace"}
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-gray-500">No custom template</span>
                          <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => triggerUpload(visa.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
                          >
                            <FiUpload size={12} />
                            {isUploading ? "Uploading…" : "Upload"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <motion.div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
              <FiFileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary">Petition Types</h3>
              <p className="text-xs text-gray-500">Manage petition categories for case filing</p>
            </div>
          </motion.div>
          <Button
            onClick={onAddPetition}
            variant="secondary"
            className="rounded-xl px-4 py-2 text-xs flex items-center gap-2"
          >
            <FiPlus /> Add Petition Type
          </Button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : petitionTypes.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400 italic">No petition types configured.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {petitionTypes.map((pet) => (
                <div
                  key={pet.id}
                  className="group p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-500/20 hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-white rounded-xl text-gray-400 group-hover:text-indigo-500 transition-colors">
                      <FiFileText size={16} />
                    </div>
                    <span className="text-sm font-bold text-secondary truncate">{pet.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onEditPetition(pet.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePetition(pet.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
