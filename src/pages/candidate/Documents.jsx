import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FileText, Upload, Download, Eye, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import Modal from "../../components/Modal";
import { getUserDocuments, downloadDocument, triggerDownload } from "../../services/documentApi";
import { useToast } from "../../context/ToastContext";

const DocumentItem = ({ doc, onView, onDownload }) => {
  const isUploaded = doc.status === "uploaded" || doc.status === "approved" || doc.status === "under_review";
  
  const dDate = new Date(doc.uploadedAt || doc.created_at);
  const dateStr = dDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = dDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const statusLabel =
    doc.status === "uploaded" || doc.status === "under_review"
      ? "Pending Review"
      : doc.status?.replace("_", " ") || "Unknown";

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md mb-4">
      <div className="flex gap-4 items-start">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <FileText className="text-blue-600" size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{doc.userFileName || doc.documentName}</h3>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5">
            {doc.documentType} • {dateStr} • {timeStr}
          </p>
          <p
            className={`text-[11px] font-black mt-1 uppercase tracking-wider ${
              doc.status === "approved" ? "text-emerald-500" :
              doc.status === "rejected" ? "text-red-500" :
              doc.status === "under_review" || doc.status === "uploaded" ? "text-amber-500" :
              "text-gray-500"
            }`}
          >
            {statusLabel}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isUploaded ? (
          <>
            <button
              type="button"
              onClick={() => onView(doc)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Eye size={14} /> View
            </button>
            <button
              type="button"
              onClick={() => onDownload(doc)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Download size={14} /> Download
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

const Documents = () => {
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id || user?.userId;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [viewDoc, setViewDoc] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const { showToast } = useToast();

  const loadDocs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getUserDocuments(userId);
      setDocuments(res.data?.data?.documents || []);
    } catch (err) {
      setError("Failed to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const handleDownload = async (doc) => {
    setDownloading(true);
    try {
      const res = await downloadDocument(doc.id);
      triggerDownload(res.data, doc.userFileName || doc.documentName);
      showToast({ message: "Document download started.", variant: "success" });
    } catch {
      showToast({ message: "Failed to download document.", variant: "danger" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <section>
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-secondary tracking-tight">
              My Documents
            </h1>
            <p className="text-gray-500 font-bold text-sm mt-1">
              View and manage all your uploaded documents.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
             <button
              type="button"
              onClick={loadDocs}
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-3 rounded-xl text-sm font-black hover:bg-gray-50 transition-all shadow-sm shrink-0"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <Link
              to="/candidate/upload-documents"
              className="inline-flex items-center justify-center gap-2 bg-secondary text-white px-5 py-3 rounded-xl text-sm font-black hover:bg-secondary-dark transition-all shadow-sm shrink-0"
            >
              <Upload size={18} />
              Upload new
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-secondary" size={32} />
            <p className="text-sm font-bold text-gray-400">Loading your documents...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="mx-auto text-red-400 mb-3" size={32} />
            <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
            <button onClick={loadDocs} className="bg-white border border-red-200 text-red-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-50">
              Try Again
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center">
            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-black text-gray-700 mb-1">No documents found</h3>
            <p className="text-sm font-bold text-gray-400 mb-6">You haven't uploaded any documents yet.</p>
            <Link to="/candidate/upload-documents" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-primary-dark">
              <Upload size={18} /> Go to Uploads
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <DocumentItem
                key={doc.id}
                doc={doc}
                onView={setViewDoc}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </section>

      {/* Document View Modal */}
      <Modal
        open={Boolean(viewDoc)}
        onClose={() => setViewDoc(null)}
        title={viewDoc?.userFileName || viewDoc?.documentName || "Document Detail"}
        titleId="view-doc-title"
        maxWidthClass="max-w-md"
        bodyClassName="p-5"
      >
        {viewDoc && (
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1">Type</p>
                  <p className="font-black text-gray-800">{viewDoc.documentType}</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1">Size</p>
                  <p className="font-black text-gray-800">
                    {viewDoc.fileSize ? `${(viewDoc.fileSize / 1024 / 1024).toFixed(2)} MB` : "—"}
                  </p>
                </div>
              </div>
              
              {viewDoc.reviewNotes && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 mb-4">
                  <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Review notes</p>
                  <p className="text-xs font-bold text-amber-800">{viewDoc.reviewNotes}</p>
                </div>
              )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewDoc(null)}
                className="flex-1 py-3 rounded-xl text-sm font-black text-gray-600 border-2 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => { handleDownload(viewDoc); setViewDoc(null); }}
                disabled={downloading}
                className="flex-1 py-3 rounded-xl text-sm font-black text-white bg-primary hover:bg-primary-dark transition-colors inline-flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Documents;
