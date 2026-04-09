import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Stepper from "../../components/stepper"
import {
  LayoutDashboard,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  RefreshCw,
  Upload,
  Hash,
  AlertCircle,
  X,
} from 'lucide-react';

const LicenceProcess = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'replace'
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentIndex, setDocumentIndex] = useState(null);

  const [applicationData, setApplicationData] = useState({
    licenceNumber: 'LIC-2024-0987',
    applicationType: 'Sponsor Licence Renewal',
    requestDate: '2025-01-15',
    licenceDuration: '12 months',
    requestedAllocation: '',
    reason: '',
    contactEmail: '',
    contactPhone: '',
  });

  const [documents, setDocuments] = useState([
    { name: 'Business Registration Certificate', status: 'uploaded' },
    { name: 'Financial Statements', status: 'uploaded' },
    { name: 'Compliance Report', status: 'uploaded' },
    { name: 'Identification Documents', status: 'uploaded' },
    { name: 'HR Policy Document', status: 'pending' },
  ]);

  const handleViewDocument = (docName) => {
    const doc = documents.find(d => d.name === docName);
    setSelectedDocument(doc);
    setDocumentIndex(documents.indexOf(doc));
    setModalMode('view');
    setShowModal(true);
  };

  const handleUploadDocument = (index) => {
    const updatedDocs = [...documents];
    updatedDocs[index].status = 'uploaded';
    setDocuments(updatedDocs);
    console.log('Document uploaded:', updatedDocs[index].name);
  };

  const handleReplaceDocument = (index) => {
    setSelectedDocument(documents[index]);
    setDocumentIndex(index);
    setModalMode('replace');
    setShowModal(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="space-y-10 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Licence Process
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Track your licence application progress and manage required documents.
        </p>
      </motion.div>

      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Stepper></Stepper>
      </motion.div>

      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
          <FileText size={24} className="text-primary" />
          Application Details
        </h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2">Licence Number</label>
            <input
              type="text"
              value={applicationData.licenceNumber}
              readOnly
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2">Application Type</label>
            <select
              value={applicationData.applicationType}
              onChange={(e) => setApplicationData({ ...applicationData, applicationType: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
            >
              <option>Sponsor Licence Renewal</option>
              <option>Allocation Increase</option>
              <option>Licence Type Change</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2">Request Date</label>
            <input
              type="text"
              value={applicationData.requestDate}
              readOnly
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2">Licence Duration</label>
            <input
              type="text"
              value={applicationData.licenceDuration}
              readOnly
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2">Requested CoS Allocation *</label>
            <input
              type="number"
              value={applicationData.requestedAllocation}
              onChange={(e) => setApplicationData({ ...applicationData, requestedAllocation: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="Enter requested allocation"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2">Reason for Renewal *</label>
            <textarea
              value={applicationData.reason}
              onChange={(e) => setApplicationData({ ...applicationData, reason: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 resize-none"
              placeholder="Explain why you need to renew your licence"
              rows={1}
            />
          </div>
        </form>
      </motion.div>

      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
          <FileText size={24} className="text-primary" />
          Contact Information
        </h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2">Contact Email *</label>
            <input
              type="email"
              value={applicationData.contactEmail}
              onChange={(e) => setApplicationData({ ...applicationData, contactEmail: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="contact@company.com"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2">Contact Phone *</label>
            <input
              type="tel"
              value={applicationData.contactPhone}
              onChange={(e) => setApplicationData({ ...applicationData, contactPhone: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="+44 20 1234 5678"
            />
          </div>
        </form>
      </motion.div>

      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
          <FileText size={24} className="text-primary" />
          Required Documents
        </h2>
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                {doc.status === 'uploaded' ? (
                  <CheckCircle size={20} className="text-emerald-600" />
                ) : (
                  <Upload size={20} className="text-amber-600" />
                )}
                <div>
                  <p className="text-sm font-black text-secondary">{doc.name}</p>
                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black ${
                    doc.status === 'uploaded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {doc.status === 'uploaded' ? 'Uploaded' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {doc.status === 'uploaded' ? (
                  <button 
                    onClick={() => handleViewDocument(doc.name)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-black text-white transition hover:bg-primary-dark"
                  >
                    <Eye size={14} />
                    View
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUploadDocument(index)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-black text-white transition hover:bg-primary-dark"
                  >
                    <Upload size={14} />
                    Upload
                  </button>
                )}
                <button 
                  onClick={() => handleReplaceDocument(index)}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-xs font-black text-gray-700 transition hover:bg-gray-300"
                >
                  <RefreshCw size={14} />
                  Replace
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="flex gap-4"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <button
          onClick={() => console.log('Submitting application:', applicationData)}
          className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition"
        >
          Submit Application
        </button>
        <button
          className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl px-6 py-3 transition"
        >
          Cancel
        </button>
      </motion.div>

      {/* Document View/Replace Modal */}
      {showModal && selectedDocument && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-secondary">
                  {modalMode === 'view' ? 'View Document' : 'Replace Document'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <X size={24} />
                </button>
              </div>
              
              {modalMode === 'view' ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                    <FileText size={32} className="text-primary" />
                    <div>
                      <p className="text-sm font-black text-secondary">{selectedDocument.name}</p>
                      <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black ${
                        selectedDocument.status === 'uploaded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {selectedDocument.status === 'uploaded' ? 'Uploaded' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 text-center">
                    <FileText size={48} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-600">Document preview would appear here</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">File: {selectedDocument.name}.pdf</p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-sm font-black text-secondary mb-2">Current Document</p>
                    <p className="text-xs font-bold text-gray-600">{selectedDocument.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2">Upload New Document *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition cursor-pointer">
                      <Upload size={40} className="text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs font-bold text-gray-500 mt-1">PDF, DOC, DOCX up to 10MB</p>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => {
                        console.log('Document replaced:', selectedDocument.name);
                        setShowModal(false);
                      }}
                      className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition"
                    >
                      Replace Document
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl px-6 py-3 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LicenceProcess;