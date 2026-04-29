import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ShieldCheck,
  Briefcase,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { submitLicenceApplication } from "../../services/licenceApi";
import { useToast } from "../../context/ToastContext";

const ApplyLicence = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
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
    reason: "",
    
    // Financial Information
    fundingSource: "",
    estimatedAnnualCost: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    },
  };

  const steps = [
    { id: 1, title: "Company", icon: Building2 },
    { id: 2, title: "Contact", icon: User },
    { id: 3, title: "Licence", icon: FileText },
    { id: 4, title: "Financial", icon: DollarSign },
    { id: 5, title: "Documents", icon: Upload },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        documents: uploadedFiles,
        type: 'New' // Explicitly setting type as it's a new application
      };
      
      const res = await submitLicenceApplication(payload);
      if (res.data.status === "success") {
        showToast({ message: "Licence application submitted successfully!", variant: "success" });
        navigate("/business/licence");
      }
    } catch (err) {
      showToast({ 
        message: err.response?.data?.message || "Failed to submit application", 
        variant: "danger" 
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-secondary bg-gray-50/30 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all placeholder:text-gray-300 placeholder:font-bold";
  const labelClasses = "block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1";

  return (
    <div className="space-y-10 pb-12 overflow-x-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl shadow-sm border border-primary/10">
            <ShieldCheck className="text-primary" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-secondary tracking-tight">
              Sponsor Licence Application
            </h1>
            <p className="text-gray-500 font-bold text-sm mt-1">
              Begin your journey to global talent acquisition.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-8 relative z-10">
        
        {/* Sidebar Progress */}
        <div className="lg:col-span-1 space-y-4">
          <motion.div 
            className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-8"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Application Progress</h3>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <button 
                  key={step.id} 
                  onClick={() => !loading && setCurrentStep(step.id)}
                  className="flex items-start gap-4 group w-full text-left transition-all hover:translate-x-1"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 border-2 ${
                        currentStep === step.id
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110"
                          : currentStep > step.id
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-gray-300 border-gray-100"
                      }`}
                    >
                      {currentStep > step.id ? <CheckCircle2 size={16} /> : <step.icon size={16} />}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-0.5 h-10 mt-1 transition-colors duration-500 ${
                        currentStep > step.id ? "bg-emerald-500" : "bg-gray-100"
                      }`} />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className={`text-xs font-black transition-colors ${
                      currentStep === step.id ? "text-secondary" : "text-gray-300"
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Go to Step {step.id}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Main Form Area */}
        <div className="lg:col-span-3 space-y-8">
          <motion.div
            className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm min-h-[500px] flex flex-col"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            key={currentStep} // Re-animate on step change
          >
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step 1: Company Information */}
                  {currentStep === 1 && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/5 rounded-xl">
                          <Building2 size={24} className="text-primary" />
                        </div>
                        <h2 className="text-2xl font-black text-secondary">Company Identity</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className={labelClasses}>Company Legal Name *</label>
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            className={inputClasses}
                            placeholder="Elite Immigration Services Ltd"
                          />
                        </div>

                        <div>
                          <label className={labelClasses}>Registration Number *</label>
                          <input
                            type="text"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleInputChange}
                            className={inputClasses}
                            placeholder="CRN-12345678"
                          />
                        </div>

                        <div>
                          <label className={labelClasses}>Industry Sector *</label>
                          <select
                            name="industry"
                            value={formData.industry}
                            onChange={handleInputChange}
                            className={inputClasses}
                          >
                            <option value="">Select industry</option>
                            <option value="technology">Technology</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="finance">Finance</option>
                            <option value="education">Education</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className={labelClasses}>Registered Office Address *</label>
                          <div className="relative">
                            <MapPin size={18} className="absolute left-5 top-4 text-gray-300" />
                            <input
                              type="text"
                              name="registeredAddress"
                              value={formData.registeredAddress}
                              onChange={handleInputChange}
                              className={`${inputClasses} pl-12`}
                              placeholder="123 Corporate Way, London, UK"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Contact Details */}
                  {currentStep === 2 && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/5 rounded-xl">
                          <User size={24} className="text-secondary" />
                        </div>
                        <h2 className="text-2xl font-black text-secondary">Authorised Personnel</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className={labelClasses}>Full Name of Authorising Officer *</label>
                          <input
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleInputChange}
                            className={inputClasses}
                            placeholder="John Sebastian Doe"
                          />
                        </div>

                        <div>
                          <label className={labelClasses}>Direct Business Email *</label>
                          <div className="relative">
                            <Mail size={18} className="absolute left-5 top-4 text-gray-300" />
                            <input
                              type="email"
                              name="contactEmail"
                              value={formData.contactEmail}
                              onChange={handleInputChange}
                              className={`${inputClasses} pl-12`}
                              placeholder="john.doe@company.com"
                            />
                          </div>
                        </div>

                        <div>
                          <label className={labelClasses}>Contact Phone Number *</label>
                          <div className="relative">
                            <Phone size={18} className="absolute left-5 top-4 text-gray-300" />
                            <input
                              type="tel"
                              name="contactPhone"
                              value={formData.contactPhone}
                              onChange={handleInputChange}
                              className={`${inputClasses} pl-12`}
                              placeholder="+44 7700 900000"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Licence Details */}
                  {currentStep === 3 && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/5 rounded-xl">
                          <FileText size={24} className="text-primary" />
                        </div>
                        <h2 className="text-2xl font-black text-secondary">Licence Strategy</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClasses}>Requested Licence Type *</label>
                          <select
                            name="licenceType"
                            value={formData.licenceType}
                            onChange={handleInputChange}
                            className={inputClasses}
                          >
                            <option value="">Select type</option>
                            <option value="Skilled Worker">Skilled Worker</option>
                            <option value="Temporary Worker">Temporary Worker</option>
                            <option value="Global Business Mobility">Global Business Mobility</option>
                          </select>
                        </div>

                        <div>
                          <label className={labelClasses}>Estimated CoS Allocation *</label>
                          <select
                            name="cosAllocation"
                            value={formData.cosAllocation}
                            onChange={handleInputChange}
                            className={inputClasses}
                          >
                            <option value="">Select allocation</option>
                            <option value="Small (1-5)">Small (1-5)</option>
                            <option value="Medium (6-20)">Medium (6-20)</option>
                            <option value="Large (21+)">Large (21+)</option>
                          </select>
                        </div>

                        <div>
                          <label className={labelClasses}>Proposed Start Date</label>
                          <div className="relative">
                            <Calendar size={18} className="absolute left-5 top-4 text-gray-300" />
                            <input
                              type="date"
                              name="proposedStartDate"
                              value={formData.proposedStartDate}
                              onChange={handleInputChange}
                              className={`${inputClasses} pl-12`}
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className={labelClasses}>Business Justification *</label>
                          <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            rows={5}
                            className={`${inputClasses} resize-none`}
                            placeholder="Briefly describe the business need for sponsoring international workers..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Financial Information */}
                  {currentStep === 4 && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                          <DollarSign size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-secondary">Financial Stability</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClasses}>Primary Funding Source *</label>
                          <select
                            name="fundingSource"
                            value={formData.fundingSource}
                            onChange={handleInputChange}
                            className={inputClasses}
                          >
                            <option value="">Select source</option>
                            <option value="Operational Profit">Operational Profit</option>
                            <option value="Venture Capital">Venture Capital</option>
                            <option value="Government Grant">Government Grant</option>
                          </select>
                        </div>

                        <div>
                          <label className={labelClasses}>Est. Annual Sponsorship Budget (£) *</label>
                          <div className="relative">
                            <DollarSign size={18} className="absolute left-5 top-4 text-gray-300" />
                            <input
                              type="number"
                              name="estimatedAnnualCost"
                              value={formData.estimatedAnnualCost}
                              onChange={handleInputChange}
                              className={`${inputClasses} pl-12`}
                              placeholder="50,000"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Upload Documents */}
                  {currentStep === 5 && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/5 rounded-xl">
                          <Upload size={24} className="text-primary" />
                        </div>
                        <h2 className="text-2xl font-black text-secondary">Supporting Evidence</h2>
                      </div>

                      <div className="p-10 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 group hover:border-primary/30 transition-colors">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Upload size={32} className="text-primary" />
                          </div>
                          <p className="text-lg font-black text-secondary mb-2">
                            Drop your evidence files here
                          </p>
                          <p className="text-xs font-bold text-gray-400 mb-8 max-w-[250px] mx-auto">
                            Upload Certificate of Incorporation, Business Plan, and Bank Statements.
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
                            className="inline-flex items-center gap-3 rounded-2xl bg-secondary px-8 py-4 text-sm font-black text-white transition hover:bg-secondary-dark cursor-pointer shadow-lg active:scale-95"
                          >
                            <Upload size={18} />
                            Select Files
                          </label>
                        </div>
                      </div>

                      <AnimatePresence>
                        {uploadedFiles.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-3"
                          >
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Attachments ({uploadedFiles.length})</p>
                            {uploadedFiles.map((file, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-primary/10 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="p-2 bg-gray-50 rounded-xl">
                                    <FileText size={18} className="text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-secondary truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveFile(index)}
                                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <X size={18} />
                                </button>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-10 border-t border-gray-50 mt-12">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1 || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-100 px-8 py-4 text-sm font-black text-gray-500 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
                Back
              </button>

              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-3 rounded-2xl bg-secondary px-8 py-4 text-sm font-black text-white transition hover:bg-secondary-dark shadow-md active:scale-95"
                >
                  Continue
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center gap-3 rounded-2xl bg-primary px-10 py-4 text-sm font-black text-white transition hover:bg-primary-dark shadow-xl shadow-primary/20 disabled:opacity-70 active:scale-95"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Application
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLicence;
