import { useState } from "react";
import { Upload, CheckCircle2, Clock, AlertCircle, Loader2, FileText, Eye } from "lucide-react";
import { uploadLicenceV2AppendixDocument, previewLicenceV2AppendixDocument } from "../../services/licenceApi";

function statusBadge(doc) {
  if (doc.filePath) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
        <CheckCircle2 size={11} /> Uploaded
      </span>
    );
  }
  if (doc.required) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
        <AlertCircle size={11} /> Required
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
      <Clock size={11} /> Optional
    </span>
  );
}

export default function Step4AppendixDocuments({ appId, data, onRefresh, onNext, onBack, saving }) {
  const docs = data.appendixDocuments || [];
  const [uploading, setUploading] = useState(null); // docId while uploading
  const [viewing, setViewing] = useState(null);     // docId while loading preview

  const handleUpload = async (doc, file) => {
    if (!file) return;
    setUploading(doc.id);
    try {
      await uploadLicenceV2AppendixDocument(appId, doc.id, file);
      onRefresh();
    } catch {
      // error surfaced via toast in parent
    } finally {
      setUploading(null);
    }
  };

  const handleView = async (doc) => {
    if (!doc.filePath) return;
    setViewing(doc.id);
    try {
      const res = await previewLicenceV2AppendixDocument(appId, doc.id);
      const mimeType = res.headers?.["content-type"] || "application/octet-stream";
      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(url), 30000);
    } catch {
      // silently ignore — sponsor can still replace the file
    } finally {
      setViewing(null);
    }
  };

  const requiredUploaded = docs.filter((d) => d.required && !d.filePath).length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-secondary mb-1">Appendix A Documents</h2>
        <p className="text-sm font-bold text-gray-400">
          Upload the required supporting documents. The list is generated from your selected routes.
        </p>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-bold">No documents required yet. Go back and select your routes first.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-secondary truncate">{doc.documentName}</p>
                <div className="mt-1">{statusBadge(doc)}</div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {uploading === doc.id ? (
                  <Loader2 size={20} className="animate-spin text-primary" />
                ) : doc.filePath ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleView(doc)}
                      disabled={viewing === doc.id}
                      title="Preview document"
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                    >
                      {viewing === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                    </button>
                    <label className="cursor-pointer text-xs font-black text-primary hover:underline">
                      Replace
                      <input type="file" className="hidden" onChange={(e) => handleUpload(doc, e.target.files[0])} />
                    </label>
                  </>
                ) : (
                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-black px-3 py-2 rounded-xl hover:bg-primary/20 transition-all">
                    <Upload size={13} /> Upload
                    <input type="file" className="hidden" onChange={(e) => handleUpload(doc, e.target.files[0])} />
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!requiredUploaded && docs.length > 0 && (
        <p className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          Some required documents are missing. You can continue now and upload them before submitting.
        </p>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="bg-gray-100 text-secondary font-black px-6 py-3 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all">
          Back
        </button>
        <button
          onClick={() => onNext({})}
          disabled={saving}
          className="bg-primary text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-40 flex items-center gap-2"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}
