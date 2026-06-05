import { useState, useEffect, useCallback, useRef } from "react";
import { FiSave, FiEye, FiSend, FiRefreshCw, FiInfo, FiUpload } from "react-icons/fi";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Button from "../Button";
import { useToast } from "../../context/ToastContext";
import {
  getCaseCcl,
  saveCaseCclDraft,
  previewCaseCcl,
  issueCaseCcl,
  importCaseCclDraft,
} from "../../services/cclApi";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "color"],
    ["clean"],
  ],
};

const apiError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

export default function CaseDetailCcl({ caseId }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState("");
  const [meta, setMeta] = useState({ source: "none", hasTemplate: false, ccl: null });
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const load = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    try {
      const res = await getCaseCcl(caseId);
      const d = res.data?.data || {};
      setHtml(d.html || "");
      setMeta({ source: d.source || "none", hasTemplate: !!d.hasTemplate, ccl: d.ccl || null });
    } catch (err) {
      showToast({ variant: "danger", message: apiError(err, "Failed to load Client Care Letter") });
    } finally {
      setLoading(false);
    }
  }, [caseId, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await saveCaseCclDraft(caseId, html);
      showToast({ message: "Draft saved" });
      setMeta((m) => ({ ...m, source: "draft" }));
    } catch (err) {
      showToast({ variant: "danger", message: apiError(err, "Could not save draft") });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    setPreviewing(true);
    try {
      const res = await previewCaseCcl(caseId);
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      showToast({ variant: "danger", message: apiError(err, "Preview failed") });
    } finally {
      setPreviewing(false);
    }
  };

  const handleIssue = async () => {
    if (!window.confirm("Issue the Client Care Letter from the current content? This generates the PDF the candidate will receive.")) return;
    setIssuing(true);
    try {
      // Persist the latest edits first so the issued PDF matches what's on screen.
      await saveCaseCclDraft(caseId, html);
      await issueCaseCcl(caseId);
      showToast({ message: "Client Care Letter issued" });
      await load();
    } catch (err) {
      showToast({ variant: "danger", message: apiError(err, "Could not issue the letter") });
    } finally {
      setIssuing(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      showToast({ variant: "danger", message: "Please upload a .docx file (PDFs can't be edited)." });
      return;
    }
    setImporting(true);
    try {
      const res = await importCaseCclDraft(caseId, file);
      setHtml(res.data?.data?.html || "");
      setMeta((m) => ({ ...m, source: "draft" }));
      showToast({ message: "Letter imported — review and edit, then issue." });
    } catch (err) {
      showToast({ variant: "danger", message: apiError(err, "Could not import the document") });
    } finally {
      setImporting(false);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm("Discard your edits and regenerate from the org template?")) return;
    setSaving(true);
    try {
      await saveCaseCclDraft(caseId, ""); // clear the draft
      await load(); // reloads -> falls back to template
      showToast({ message: "Regenerated from template" });
    } catch (err) {
      showToast({ variant: "danger", message: apiError(err, "Could not regenerate") });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm font-bold text-gray-400">Loading Client Care Letter…</div>;
  }

  const issued = !!meta.ccl?.issuedDocumentId;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-secondary tracking-tight">Client Care Letter</h3>
          <p className="text-xs text-gray-500 font-medium">
            Edit the letter for this candidate, preview it, then issue. Tags were filled from the case automatically.
          </p>
        </div>
        <span
          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
            issued ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}
        >
          {issued ? "Issued" : meta.ccl?.status || "Not issued"}
        </span>
      </div>

      {!meta.hasTemplate && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-xs font-bold flex items-center gap-3">
          <FiInfo className="shrink-0" />
          No CCL template is set for this visa type yet. You can write the letter below, or create a reusable template in Settings → CCL Templates.
        </div>
      )}

      <div className="quill-container rounded-2xl border border-gray-100 overflow-hidden">
        <ReactQuill
          theme="snow"
          value={html}
          onChange={setHtml}
          modules={QUILL_MODULES}
          placeholder="Write the Client Care Letter for this candidate…"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          onClick={handleSaveDraft}
          disabled={saving}
          className="rounded-xl px-5 py-2.5 bg-primary border-none flex items-center gap-2"
        >
          <FiSave /> {saving ? "Saving…" : "Save draft"}
        </Button>
        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={previewing}
          className="rounded-xl px-5 py-2.5 flex items-center gap-2"
        >
          <FiEye /> {previewing ? "Rendering…" : "Preview PDF"}
        </Button>
        <Button
          variant="outline"
          onClick={handleRegenerate}
          disabled={saving}
          className="rounded-xl px-5 py-2.5 flex items-center gap-2"
        >
          <FiRefreshCw /> Regenerate from template
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          className="hidden"
          onChange={handleImport}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="rounded-xl px-5 py-2.5 flex items-center gap-2"
        >
          <FiUpload /> {importing ? "Importing…" : "Upload .docx"}
        </Button>
        <Button
          onClick={handleIssue}
          disabled={issuing}
          className="rounded-xl px-6 py-2.5 bg-emerald-600 border-none text-white flex items-center gap-2 ml-auto"
        >
          <FiSend /> {issuing ? "Issuing…" : issued ? "Re-issue letter" : "Issue letter"}
        </Button>
      </div>
    </div>
  );
}
