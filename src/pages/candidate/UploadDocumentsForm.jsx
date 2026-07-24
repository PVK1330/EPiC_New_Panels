import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useCandidate from "../../hooks/useCandidate";
import { ClipboardList, Loader2, Save, Send } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
  getDataCaptureForm,
  saveDataCaptureDraft,
  submitDataCapture,
} from "../../services/workflowApi";
import Button from "../../components/Button";

function apiErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "Something went wrong";
}

const UploadDocumentsForm = () => {
  const { showToast } = useToast();
  const { myApplication, getMyApplication } = useCandidate();
  const cclStatus = myApplication?._relatedData?.cclRecord?.status;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState([]);
  const [responses, setResponses] = useState({});
  const [status, setStatus] = useState("draft");
  const [caseRef, setCaseRef] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDataCaptureForm();
      const data = res.data?.data;
      setFields(data?.template?.fields || []);
      setResponses(data?.submission?.responses || {});
      setStatus(data?.submission?.status || "draft");
      setCaseRef(data?.case?.caseId || "");
    } catch (e) {
      showToast({ variant: "danger", message: apiErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
    getMyApplication();
  }, [load, getMyApplication]);

  const onChange = (key, value) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveDataCaptureDraft(responses);
      showToast({ message: "Draft saved." });
    } catch (e) {
      showToast({ variant: "danger", message: apiErrorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    const missing = fields.filter((f) => f.required && !String(responses[f.key] || "").trim());
    if (missing.length) {
      showToast({
        variant: "danger",
        message: `Please complete: ${missing.map((f) => f.label).join(", ")}`,
      });
      return;
    }
    setSaving(true);
    try {
      await submitDataCapture(responses);
      setStatus("submitted");
      showToast({ message: "Upload Documents submitted to your caseworker." });
    } catch (e) {
      showToast({ variant: "danger", message: apiErrorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-secondary" />
        <p className="text-sm font-bold text-gray-500">Loading form…</p>
      </div>
    );
  }

  const readOnly = status === "submitted" || status === "approved";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <header>
        <h1 className="text-3xl font-black text-secondary tracking-tight flex items-center gap-2">
          <ClipboardList className="text-primary" />
          Upload Documents
        </h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Case {caseRef || "—"} · Complete your details for your visa application.
        </p>
        {status === "submitted" && (
          <p className="mt-2 text-xs font-black uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
            Submitted — awaiting caseworker review
          </p>
        )}
        {status === "approved" && (
          <p className="mt-2 text-xs font-black uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 inline-block">
            Approved
          </p>
        )}
        {status === "rejected" && (
          <p className="mt-2 text-xs font-black uppercase tracking-wide text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 inline-block">
            Please update and resubmit
          </p>
        )}
      </header>

      {cclStatus === "issued" && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm font-bold text-blue-950">
            Your Client Care Letter has been issued. Please upload the signed copy.
          </p>
          <Link
            to="/candidate/upload-documents?documentType=Client%20Care%20Letter&documentName=Signed%20Client%20Care%20Letter"
            className="shrink-0 rounded-lg bg-secondary px-4 py-2 text-xs font-black text-white"
          >
            Upload signed CCL
          </Link>
        </div>
      )}

      {!fields.length ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
          <p className="text-sm font-bold text-gray-500">
            Your caseworker has not sent a Upload Documents yet.
          </p>
          <Link to="/candidate/dashboard" className="text-sm font-black text-secondary mt-4 inline-block">
            Back to dashboard
          </Link>
        </div>
      ) : (
        <form
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {fields.map((field) => (
            <label key={field.key} className="block">
              <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                {field.label}
                {field.required ? " *" : ""}
              </span>
              {field.type === "textarea" ? (
                <textarea
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold"
                  rows={3}
                  disabled={readOnly}
                  value={responses[field.key] || ""}
                  onChange={(e) => onChange(field.key, e.target.value)}
                />
              ) : (
                <input
                  type={field.type === "date" ? "date" : field.type === "email" ? "email" : "text"}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold"
                  disabled={readOnly}
                  value={responses[field.key] || ""}
                  onChange={(e) => onChange(field.key, e.target.value)}
                />
              )}
            </label>
          ))}

          {!readOnly && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" disabled={saving} onClick={handleSave}>
                <Save size={16} className="mr-1.5" />
                Save draft
              </Button>
              <Button type="submit" disabled={saving}>
                <Send size={16} className="mr-1.5" />
                {saving ? "Submitting…" : "Submit to caseworker"}
              </Button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default UploadDocumentsForm;
