import { useState } from "react";
import { motion } from "framer-motion";
import { FiFileText, FiEye, FiUpload } from "react-icons/fi";
import Modal from "../Modal";
import Input from "../Input";
import Button from "../Button";

const CaseDetailDocuments = ({ documents }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!name.trim()) {
      setErr("Document name is required");
      return;
    }
    setOpen(false);
    setName("");
    setErr("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-sm font-black text-secondary">Case Documents</h3>
        <Button type="button" onClick={() => setOpen(true)} className="rounded-xl text-sm shrink-0">
          <FiUpload size={14} />
          Upload Document
        </Button>
      </div>
      <div className="divide-y divide-gray-50">
        {documents.map((d) => (
          <div key={d.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 hover:bg-gray-50/80 transition-colors">
            <div className="p-2 rounded-xl bg-gray-100 text-secondary shrink-0 self-start">
              <FiFileText size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-secondary">{d.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{d.meta}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${d.statusClass}`}>{d.status}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                className="p-2 rounded-lg text-gray-400 hover:text-secondary hover:bg-blue-50 transition-colors"
                title="View"
              >
                <FiEye size={15} />
              </button>
              {d.actions === "review" && (
                <Button type="button" variant="primary" className="rounded-lg text-xs py-1.5 px-3">
                  Approve
                </Button>
              )}
              {(d.status === "Missing" || d.status === "Pending") && (
                <Button type="button" variant="ghost" className="rounded-lg text-xs py-1.5 px-3">
                  Request
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => { setOpen(false); setErr(""); setName(""); }}
        title="Upload Document"
        maxWidthClass="max-w-md"
        bodyClassName="px-5 py-5"
        footer={
          <>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={submit} className="rounded-xl">
              Upload
            </Button>
          </>
        }
      >
        <Input
          label="Document name"
          name="docName"
          value={name}
          onChange={(e) => { setName(e.target.value); setErr(""); }}
          placeholder="e.g. Bank statements"
          required
          error={err}
        />
      </Modal>
    </motion.div>
  );
};

export default CaseDetailDocuments;
