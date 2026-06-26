import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiFileText } from "react-icons/fi";
import Button from "../../Button";
import { useToast } from "../../../context/ToastContext";
import {
  listCclTemplates,
  createCclTemplate,
  updateCclTemplate,
  deleteCclTemplate,
  previewCclTemplate,
  getVisaTypesDropdown,
} from "../../../services/cclApi";
// Lazy: pulls in react-quill (heavy rich-text editor) — only load when editing a template.
const CclTemplateEditor = lazy(() => import("./CclTemplateEditor"));

const apiError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

export default function CclTemplateSettings() {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [visaTypes, setVisaTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "add" | template object
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tplRes, vtRes] = await Promise.all([
        listCclTemplates(),
        getVisaTypesDropdown().catch(() => ({ data: { data: [] } })),
      ]);
      setTemplates(tplRes.data?.data?.templates || []);
      const vt = vtRes.data?.data?.visaTypes || vtRes.data?.data || [];
      setVisaTypes(Array.isArray(vt) ? vt : []);
    } catch (err) {
      showToast({ variant: "danger", message: apiError(err, "Failed to load CCL templates") });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const visaName = (id) => visaTypes.find((v) => Number(v.id) === Number(id))?.name;

  const handleSave = async (data) => {
    setSaving(true);
    setFormError("");
    try {
      if (editing === "add") {
        await createCclTemplate(data);
        showToast({ message: "CCL template created" });
      } else {
        await updateCclTemplate(editing.id, data);
        showToast({ message: "CCL template updated" });
      }
      setEditing(null);
      await load();
    } catch (err) {
      setFormError(apiError(err, "Could not save template"));
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async (data) => {
    setPreviewing(true);
    try {
      const res = await previewCclTemplate({ bodyHtml: data.bodyHtml });
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      showToast({ variant: "danger", message: apiError(err, "Preview failed") });
    } finally {
      setPreviewing(false);
    }
  };

  const handleDelete = async (tpl) => {
    if (!window.confirm(`Delete the CCL template "${tpl.name}"? This cannot be undone.`)) return;
    try {
      await deleteCclTemplate(tpl.id);
      showToast({ message: "Template deleted" });
      await load();
    } catch (err) {
      showToast({ variant: "danger", message: apiError(err, "Delete failed") });
    }
  };

  if (editing) {
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <CclTemplateEditor
          mode={editing === "add" ? "add" : "edit"}
          initialData={editing === "add" ? null : editing}
          visaTypes={visaTypes}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setFormError(""); }}
          onPreview={handlePreview}
          error={formError}
          saving={saving}
          previewing={previewing}
        />
      </Suspense>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-secondary tracking-tight">Client Care Letter Templates</h3>
          <p className="text-xs text-gray-500 font-medium">
            Dynamic CCLs — your wording with tags filled per candidate. A visa-specific template overrides the org default.
          </p>
        </div>
        <Button
          onClick={() => { setEditing("add"); setFormError(""); }}
          className="rounded-xl px-5 py-2.5 bg-primary border-none shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <FiPlus /> New template
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400 text-sm font-bold">Loading…</div>
      ) : templates.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl">
          <FiFileText className="mx-auto text-gray-300" size={32} />
          <p className="mt-3 text-sm font-bold text-gray-500">No CCL templates yet</p>
          <p className="text-xs text-gray-400">Create one — until then, issued CCLs use the built-in fallback letter.</p>
        </div>
      ) : (
        <div className="overflow-auto max-h-[68vh] border border-gray-100 rounded-3xl">
          <table className="w-full min-w-0 text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="text-left text-[11px] font-black text-gray-400 uppercase tracking-wider bg-gray-50">
                <th className="px-5 py-3">Sr No</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Applies to</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {templates.map((tpl, index) => (
                <tr key={tpl.id} className="hover:bg-gray-50/40">
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-black text-gray-500 tabular-nums">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-secondary">{tpl.name}</td>
                  <td className="px-5 py-3.5 text-gray-600 font-medium">
                    {tpl.visaTypeId
                      ? tpl.visaType?.name || visaName(tpl.visaTypeId) || `Visa #${tpl.visaTypeId}`
                      : <span className="text-gray-400">Organisation default</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                        tpl.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {tpl.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditing(tpl); setFormError(""); }}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(tpl)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
