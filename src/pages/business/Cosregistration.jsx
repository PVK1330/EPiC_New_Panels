import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, FileText, Hash, Calendar, Save } from "lucide-react";

const CosRegistrationForm = () => {
  const [formData, setFormData] = useState({
    visaType: "",
    applicantName: "",
    passportNumber: "",
    cosNumber: "",
    issueDate: "",
    expiryDate: "",
    allocated: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg"
    >
      <h2 className="text-2xl font-semibold mb-6 text-blue-600">
        COS Registration Form
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Visa Type */}
        <div>
          <label className="text-sm font-semibold text-slate-700 ">
            Visa Type
          </label>
          <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2">
            <FileText className="w-4 h-4 text-gray-400 mr-2" />
            <select
              name="visaType"
              value={formData.visaType}
              onChange={handleChange}
              className="w-full outline-none "
              required
            >
              <option value="">Select Visa Type</option>
              <option>Skilled Worker Visa</option>
              <option>Student Visa</option>
              <option>Health Care Visa</option>
            </select>
          </div>
        </div>

        {/* Applicant Name */}
        <div>
          <label className="text-sm font-semibold text-slate-700">
            Applicant Name
          </label>
          <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2">
            <User className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              name="applicantName"
              value={formData.applicantName}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full outline-none"
              required
            />
          </div>
        </div>

        {/* Passport Number */}
        <div>
          <label className="text-sm font-semibold text-slate-700">
            Passport Number
          </label>
          <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2">
            <Hash className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              name="passportNumber"
              value={formData.passportNumber}
              onChange={handleChange}
              placeholder="Enter passport number"
              className="w-full outline-none"
              required
            />
          </div>
        </div>

        {/* COS Number */}
        <div>
          <label className="text-sm font-semibold text-slate-700">
            COS Number
          </label>
          <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2">
            <Hash className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              name="cosNumber"
              value={formData.cosNumber}
              onChange={handleChange}
              placeholder="Enter COS number"
              className="w-full outline-none"
              required
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Issue Date
            </label>
            <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className="w-full outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Expiry Date
            </label>
            <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Allocation */}
        <div>
          <label className="text-sm font-semibold text-slate-700">
            Allocated COS
          </label>
          <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2">
            <Hash className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="number"
              name="allocated"
              value={formData.allocated}
              onChange={handleChange}
              placeholder="Enter allocated number"
              className="w-full outline-none"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-red-800 text-white px-6 py-3 rounded-lg transition"
        >
          <Save className="w-4 h-4" />
          Submit COS
        </button>
      </form>
    </motion.div>
  );
};

export default CosRegistrationForm;