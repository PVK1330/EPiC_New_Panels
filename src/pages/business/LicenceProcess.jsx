import React from 'react';
import { motion } from 'framer-motion';
import Stepper from "../../components/stepper"

import {
  LayoutDashboard,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  RefreshCw,
} from 'lucide-react';

const LicenceProcess = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };



  const applicationDetails = {
    name: 'Elitepic Solutions Ltd.',
    applicationType: 'Sponsor Licence Renewal',
    requestDate: '2025-01-15',
    licenceDuration: '12 months',
  };

  const uploadedDocuments = [
    { name: 'Business Registration Certificate', status: 'uploaded' },
    { name: 'Financial Statements', status: 'uploaded' },
    { name: 'Compliance Report', status: 'uploaded' },
    { name: 'Identification Documents', status: 'uploaded' },
  ];
 
  return (
    <div className="space-y-10 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-blue-600" size={36} />
          Licence Process
        </h1>
        <p className="text-slate-600 font-medium text-sm mt-1">
          Track your licence application progress and manage required documents.
        </p>
      </motion.div>

      <motion.div
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Stepper></Stepper>
      </motion.div>

      <motion.div
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-bold text-blue-600 mb-6">Application Details</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Name</label>
            <input
              type="text"
              value={applicationDetails.name}
              readOnly
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Application Type</label>
            <input
              type="text"
              value={applicationDetails.applicationType}
              readOnly
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Request Date</label>
            <input
              type="text"
              value={applicationDetails.requestDate}
              readOnly
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Licence Duration</label>
            <input
              type="text"
              value={applicationDetails.licenceDuration}
              readOnly
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </form>
      </motion.div>

      <motion.div
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-bold text-blue-600 mb-6">Uploaded Documents</h2>
        <div className="space-y-4">
          {uploadedDocuments.map((doc, index) => (
            <div key={index} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-slate-600" />
                <div>
                  <p className="font-semibold text-slate-900">{doc.name}</p>
                  <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {doc.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-900">
                  <Eye size={16} />
                  View
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-900">
                  <RefreshCw size={16} />
                  Replace
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LicenceProcess;