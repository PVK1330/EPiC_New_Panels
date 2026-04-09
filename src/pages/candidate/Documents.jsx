import { useState, useRef, useEffect } from "react";
import { FileText, Upload, Plus, ImageIcon } from "lucide-react";
import Modal from "../../components/Modal";

const formatNow = () => {
  const d = new Date();
  return {
    date: d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const DocumentItem = ({ title, date, time, status }) => {
  const isUploaded = status === "Uploaded";

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md mb-4">
      <div className="flex gap-4 items-start">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <FileText className="text-blue-600" size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5">
            {date} • {time}
          </p>
          <p
            className={`text-[11px] font-black mt-1 uppercase tracking-wider ${
              isUploaded ? "text-green-500" : "text-red-500"
            }`}
          >
            {status}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isUploaded ? (
          <>
            <button
              type="button"
              className="bg-primary text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-2"
            >
              View
            </button>
            <button
              type="button"
              className="bg-primary text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-2"
            >
              Replace Document
            </button>
          </>
        ) : (
          <button
            type="button"
            className="bg-primary text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-2"
          >
            Upload Document
          </button>
        )}
      </div>
    </div>
  );
};

const initialDocuments = [
  {
    id: "1",
    title: "Passport Copy",
    date: "2 Mar 2026",
    time: "10:30 AM",
    status: "Uploaded",
  },
  {
    id: "2",
    title: "Curriculam VISA Copy",
    date: "2 Mar 2026",
    time: "11:30 AM",
    status: "Uploaded",
  },
  {
    id: "3",
    title: "PanCard Copy",
    date: "2 Mar 2026",
    time: "11:30 AM",
    status: "Uploaded",
  },
  {
    id: "4",
    title: "Bank Statement",
    date: "2 Mar 2026",
    time: "11:30 AM",
    status: "Missing",
  },
  {
    id: "5",
    title: "Degree Certificate",
    date: "2 Mar 2026",
    time: "11:30 AM",
    status: "Missing",
  },
  {
    id: "6",
    title: "Address Proof",
    date: "2 Mar 2026",
    time: "11:30 AM",
    status: "Missing",
  },
];

const Documents = () => {
  const [documents, setDocuments] = useState(initialDocuments);
  const [modalOpen, setModalOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const resetModal = () => {
    setDocName("");
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeModal = () => {
    setModalOpen(false);
    resetModal();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      e.target.value = "";
      return;
    }
    setImageFile(file);
  };

  const handleAddDocument = (e) => {
    e.preventDefault();
    const name = docName.trim();
    if (!name) return;

    const { date, time } = formatNow();
    const hasImage = Boolean(imageFile);

    setDocuments((prev) => [
      {
        id: crypto.randomUUID(),
        title: name,
        date,
        time,
        status: hasImage ? "Uploaded" : "Missing",
      },
      ...prev,
    ]);
    closeModal();
  };

  return (
    <div className="space-y-10 pb-10">
      <section>
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-secondary tracking-tight">
              Documents
            </h1>
            <p className="text-gray-500 font-bold text-sm mt-1">
              Manage and upload your application documents.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-secondary text-white px-5 py-3 rounded-xl text-sm font-black hover:bg-secondary-dark transition-all shadow-sm shrink-0"
          >
            <Plus size={20} strokeWidth={2.5} />
            Add new document
          </button>
        </div>

        <h2 className="text-xl font-black text-secondary mb-6 tracking-tight">
          Your Documents
        </h2>
        <div className="space-y-2">
          {documents.map((doc) => (
            <DocumentItem
              key={doc.id}
              title={doc.title}
              date={doc.date}
              time={doc.time}
              status={doc.status}
            />
          ))}
        </div>
      </section>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Add new document"
        titleId="add-doc-title"
        maxWidthClass="max-w-md"
        bodyClassName="p-4 sm:p-6"
      >
        <form onSubmit={handleAddDocument} className="space-y-5">
          <div>
            <label
              htmlFor="document-name"
              className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2"
            >
              Document name
            </label>
            <input
              id="document-name"
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Employment letter"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-shadow"
              required
            />
          </div>

          <div>
            <span className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
              Image upload
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="document-image"
            />
            <label
              htmlFor="document-image"
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 cursor-pointer hover:border-secondary/40 hover:bg-secondary/5 transition-colors"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-40 rounded-lg object-contain border border-gray-100"
                />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-secondary">
                    <ImageIcon size={24} />
                  </div>
                  <span className="text-sm font-bold text-gray-600 text-center">
                    Click to choose an image
                  </span>
                  <span className="text-[11px] font-bold text-gray-400">
                    PNG, JPG, WEBP up to your browser limit
                  </span>
                </>
              )}
            </label>
            {imageFile && (
              <p className="mt-2 text-xs font-bold text-gray-500 truncate">
                {imageFile.name}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-3 rounded-xl text-sm font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl text-sm font-black text-white bg-primary hover:bg-primary-dark transition-colors inline-flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              Save document
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Documents;
