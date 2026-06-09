import { useState, useRef, useEffect } from "react";
import { FiType, FiLayout, FiInfo, FiSave, FiX, FiFileText, FiEye } from "react-icons/fi";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Button from "../../Button";
import Input from "../../Input";
import { getCclTags } from "../../../services/cclApi";

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

export default function CclTemplateEditor({
  initialData,
  mode,
  visaTypes = [],
  onSave,
  onCancel,
  onPreview,
  error,
  saving,
  previewing,
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    visaTypeId: initialData?.visaTypeId ?? "",
    bodyHtml: initialData?.bodyHtml || "",
    isActive: initialData?.isActive !== false,
  });
  const [tagGroups, setTagGroups] = useState({});
  const quillRef = useRef(null);

  useEffect(() => {
    let active = true;
    getCclTags()
      .then((res) => {
        if (active) setTagGroups(res.data?.data?.groups || {});
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const insertTag = (token) => {
    const editor = quillRef.current?.getEditor?.();
    if (!editor) {
      setFormData((f) => ({ ...f, bodyHtml: `${f.bodyHtml}${token}` }));
      return;
    }
    const range = editor.getSelection();
    const index = range ? range.index : editor.getLength() - 1;
    editor.insertText(index, token);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      visaTypeId: formData.visaTypeId === "" ? null : Number(formData.visaTypeId),
      bodyHtml: formData.bodyHtml,
      isActive: formData.isActive,
    });
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
            <FiFileText size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-secondary tracking-tight">
              {mode === "add" ? "Create CCL Template" : "Edit CCL Template"}
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Authored once per org — tags are filled in per candidate at issue time.
            </p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
          <FiX size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-bold flex items-center gap-3">
                <FiInfo className="shrink-0" /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Template name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Skilled Worker CCL"
                className="font-bold"
                description="Internal name for this template"
              />
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                  Applies to visa type
                </label>
                <select
                  value={formData.visaTypeId}
                  onChange={(e) => setFormData({ ...formData, visaTypeId: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700"
                >
                  <option value="">Organisation default (all visa types)</option>
                  {visaTypes.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 font-medium mt-1">
                  A visa-specific template overrides the org default.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-gray-600">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Active (used when issuing CCLs for this visa slot)
            </label>

            <div className="flex-1 flex flex-col min-h-[400px]">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <FiLayout size={14} /> Letter content
              </label>
              <div className="flex-1 flex flex-col quill-container">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={formData.bodyHtml}
                  onChange={(content) => setFormData({ ...formData, bodyHtml: content })}
                  modules={QUILL_MODULES}
                  className="flex-1 h-full rounded-3xl overflow-hidden flex flex-col"
                  placeholder="Write the Client Care Letter. Insert tags from the right to personalise per candidate."
                />
              </div>
            </div>
          </div>

          {/* Tag palette */}
          <div className="w-full lg:w-80 bg-gray-50/50 border-l border-gray-100 p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FiType size={14} /> Dynamic tags
            </h4>
            {Object.entries(tagGroups).map(([group, tags]) => (
              <div key={group}>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">{group}</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {tags.map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      onClick={() => insertTag(t.token)}
                      title={`Insert ${t.token}`}
                      className="group flex flex-col items-start p-2.5 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow transition-all text-left"
                    >
                      <code className="text-[11px] font-black text-primary">{t.token}</code>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-auto p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-[10px] text-primary/70 leading-relaxed font-medium">
                Click a tag to insert it at the cursor. Use <strong>Preview</strong> to see the letter rendered with sample data and your org logo.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl px-6 py-2.5">
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onPreview(formData)}
            disabled={previewing}
            className="rounded-xl px-6 py-2.5 flex items-center gap-2"
          >
            <FiEye /> {previewing ? "Rendering..." : "Preview"}
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="rounded-xl px-8 py-2.5 bg-primary hover:bg-primary/90 border-none shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            {saving ? "Saving..." : <><FiSave /> Save Template</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
