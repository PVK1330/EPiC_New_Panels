import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  X,
} from "lucide-react";

const ApplyLicence = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Company Information
    companyName: "",
    tradingName: "",
    registrationNumber: "",
    industry: "",
    registeredAddress: "",
    tradingAddress: "",
    companyType: "",
    numberOfEmployees: "",
    annualTurnover: "",
    
    // Contact Information
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    
    // Licence Details
    licenceType: "",
    cosAllocation: "",
    proposedStartDate: "",
    reasonForLicence: "",
    
    // Financial Information
    fundingSource: "",
    estimatedAnnualCost: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const steps = [
    { id: 1, title: "Company Information", icon: Building2 },
    { id: 2, title: "Contact Details", icon: User },
    { id: 3, title: "Licence Details", icon: FileText },
    { id: 4, title: "Financial Information", icon: DollarSign },
    { id: 5, title: "Upload Documents", icon: Upload },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    alert("Licence application submitted successfully!");
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Apply for Sponsor Licence
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Complete the application form to apply for a UK sponsor licence.
        </p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep === step.id
                      ? "bg-primary text-white"
                      : currentStep > step.id
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                </div>
                <p
                  className={`text-[10px] font-black mt-2 text-center ${
                    currentStep === step.id ? "text-primary" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded ${
                    currentStep > step.id ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Form Content */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Step 1: Company Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-secondary flex items-center gap-2">
              <Building2 size={24} className="text-primary" />
              Company Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Trading Name</label>
                <input
                  type="text"
                  name="tradingName"
                  value={formData.tradingName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Enter trading name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Enter registration number"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Industry *</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Company Type *</label>
                <select
                  name="companyType"
                  value={formData.companyType}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                >
                  <option value="">Select company type</option>
                  <option value="limited">Limited Company</option>
                  <option value="partnership">Partnership</option>
                  <option value="sole-trader">Sole Trader</option>
                  <option value="llp">Limited Liability Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Number of Employees *</label>
                <input
                  type="number"
                  name="numberOfEmployees"
                  value={formData.numberOfEmployees}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Enter number of employees"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-2">Registered Address *</label>
                <input
                  type="text"
                  name="registeredAddress"
                  value={formData.registeredAddress}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Enter registered address"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-2">Trading Address</label>
                <input
                  type="text"
                  name="tradingAddress"
                  value={formData.tradingAddress}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Enter trading address"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Annual Turnover *</label>
                <input
                  type="number"
                  name="annualTurnover"
                  value={formData.annualTurnover}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Enter annual turnover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contact Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-secondary flex items-center gap-2">
              <User size={24} className="text-primary" />
              Contact Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Contact Name *</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Enter contact name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Contact Email *</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Enter contact email"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Contact Phone *</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Enter contact phone"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Licence Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-secondary flex items-center gap-2">
              <FileText size={24} className="text-primary" />
              Licence Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Licence Type *</label>
                <select
                  name="licenceType"
                  value={formData.licenceType}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                >
                  <option value="">Select licence type</option>
                  <option value="worker">Worker Sponsor Licence</option>
                  <option value="temporary-worker">Temporary Worker Sponsor Licence</option>
                  <option value="international-sport">International Sportsperson</option>
                  <option value="creative">Creative Worker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">CoS Allocation *</label>
                <select
                  name="cosAllocation"
                  value={formData.cosAllocation}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                >
                  <option value="">Select CoS allocation</option>
                  <option value="small">Small (1-5 CoS)</option>
                  <option value="medium">Medium (6-20 CoS)</option>
                  <option value="large">Large (21-50 CoS)</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Proposed Start Date *</label>
                <input
                  type="date"
                  name="proposedStartDate"
                  value={formData.proposedStartDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-2">Reason for Licence *</label>
                <textarea
                  name="reasonForLicence"
                  value={formData.reasonForLicence}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Explain why you need a sponsor licence"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Financial Information */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-secondary flex items-center gap-2">
              <DollarSign size={24} className="text-primary" />
              Financial Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Funding Source *</label>
                <select
                  name="fundingSource"
                  value={formData.fundingSource}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                >
                  <option value="">Select funding source</option>
                  <option value="company">Company Funds</option>
                  <option value="investment">Investment</option>
                  <option value="loan">Bank Loan</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Estimated Annual Cost *</label>
                <input
                  type="number"
                  name="estimatedAnnualCost"
                  value={formData.estimatedAnnualCost}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Enter estimated annual cost"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Upload Documents */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-secondary flex items-center gap-2">
              <Upload size={24} className="text-primary" />
              Upload Documents
            </h2>

            <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-sm font-black text-secondary mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs font-bold text-gray-500 mb-4">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-primary-dark cursor-pointer"
                >
                  <Upload size={16} />
                  Select Files
                </label>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500">Uploaded Files:</p>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-gray-500" />
                      <span className="text-sm font-bold text-secondary">{file.name}</span>
                      <span className="text-xs font-bold text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="p-1 hover:bg-red-100 rounded transition"
                    >
                      <X size={16} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-amber-800 mb-1">Required Documents</p>
                  <ul className="text-xs font-bold text-amber-700 space-y-1">
                    <li>• Certificate of Incorporation</li>
                    <li>• Articles of Association</li>
                    <li>• Latest Annual Accounts</li>
                    <li>• Business Plan</li>
                    <li>• Organisational Chart</li>
                    <li>• Key Personnel Details</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-black text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-primary-dark"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-primary-dark"
            >
              Submit Application
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ApplyLicence;
