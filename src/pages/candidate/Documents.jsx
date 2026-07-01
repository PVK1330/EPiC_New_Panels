import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FileText, Upload, Download, Eye, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import Modal from "../../components/Modal";
import PageTitle from "../../components/common/PageTitle";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/Button";
import { getUserDocuments } from "../../services/documentApi";
import useDownloads from "../../hooks/useDownloads";
import { useToast } from "../../context/ToastContext";
import { formatDateLong, formatTime } from "../../utils/datetime";

const DocumentItem = ({ doc, onView, onDownload }) => {
  const isUploaded = doc.status === "uploaded" || doc.status === "approved" || doc.status === "under_review";
  
  const dateStr = formatDateLong(doc.uploadedAt || doc.created_at, { month: "short" });
  const timeStr = formatTime(doc.uploadedAt || doc.created_at);

  const statusLabel =
    doc.status === "uploaded" || doc.status === "under_review"
      ? "Pending Review"
      : doc.status?.replace("_", " ") || "Unknown";

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-secondary/25 mb-4">
      <div className="flex gap-4 items-start">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <FileText className="text-blue-600" size={20} />
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-900">{doc.userFileName || doc.documentName}</h3>
          <p className="text-xs font-bold text-gray-500 mt-0.5">
            {doc.documentType} • {dateStr} • {timeStr}
          </p>
          <span
            className={`inline-flex items-center mt-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border px-2.5 py-0.5 ${
              doc.status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
              doc.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
              doc.status === "under_review" || doc.status === "uploaded" ? "bg-amber-50 text-amber-700 border-amber-200" :
              "bg-gray-50 text-gray-500 border-gray-200"
            }`}
          >
            {statusLabel}
          </span>
          {doc.status === "rejected" && (doc.rejectionReason || doc.reviewNotes) && (
            <p className="text-xs font-bold text-red-700 mt-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
              <span className="font-black">Rejection reason: </span>
              {doc.rejectionReason || doc.reviewNotes}
            </p>
          )}
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
  const { downloadDocument } = useDownloads();

  const loadDocs = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
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
      await downloadDocument(doc.id, doc.userFileName || doc.documentName);
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
        <PageTitle
          className="mb-8"
          title="My Documents"
          subtitle="View and manage all your uploaded documents."
          actions={
            <>
              <Button variant="outline" onClick={loadDocs}>
                <RefreshCw size={18} />
                Refresh
              </Button>
              <Link
                to="/candidate/upload-documents"
                className="inline-flex items-center justify-center gap-2 bg-secondary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-secondary/90 transition-all shadow-sm shrink-0"
              >
                <Upload size={18} />
                Upload new
              </Link>
            </>
          }
        />

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
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <EmptyState
              icon={FileText}
              title="No documents found"
              subtitle="You haven't uploaded any documents yet."
              action={
                <Link
                  to="/candidate/upload-documents"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-sm font-black hover:bg-primary-dark transition-all"
                >
                  <Upload size={18} /> Go to Uploads
                </Link>
              }
            />
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
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 mb-4">
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
