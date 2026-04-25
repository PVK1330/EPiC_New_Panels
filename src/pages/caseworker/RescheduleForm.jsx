import { useState, useEffect } from "react";
import {
  CalendarClock,
  User,
  Mail,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
} from "lucide-react";
import api from "../../services/api";

const InputField = ({
  label,
  type = "text",
  icon: Icon,
  placeholder,
  required,
  value,
  onChange,
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
      {label} {required && <span className="text-primary">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
      />
      {Icon && (
        <Icon
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
        />
      )}
    </div>
  </div>
);

const RescheduleForm = () => {
  const [history, setHistory] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    caseId: "",
    fieldToReschedule: "",
    newDate: "",
    newTime: "",
    reason: "",
  });

  useEffect(() => {
    fetchRescheduleHistory();
    fetchCases();
  }, []);

  const fetchRescheduleHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/cases/reschedule");
      setHistory(response.data.data.history || []);
    } catch (error) {
      console.error("Error fetching reschedule history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const response = await api.get("/api/caseworker/cases");
      setCases(response.data.data.cases || []);
    } catch (error) {
      console.error("Error fetching cases:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data:", formData);

    if (!formData.caseId || !formData.fieldToReschedule || !formData.newDate || !formData.reason) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const fieldMap = {
        'targetSubmissionDate': 'targetSubmissionDate',
        'biometricsDate': 'biometricsDate',
        'submissionDate': 'submissionDate',
        'decisionDate': 'decisionDate',
      };

      const payload = {
        [fieldMap[formData.fieldToReschedule]]: formData.newDate,
        reason: formData.reason,
      };

      console.log("Payload:", payload);
      const response = await api.patch(`/api/cases/reschedule/${formData.caseId}`, payload);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setModalOpen(false);
        setFormData({
          caseId: "",
          fieldToReschedule: "",
          newDate: "",
          newTime: "",
          reason: "",
        });
        fetchRescheduleHistory();
      }, 2000);
    } catch (error) {
      console.error("Error submitting reschedule request:", error);
      alert(error.response?.data?.message || "Failed to submit reschedule request");
    }
  };

  const openModal = () => {
    setModalOpen(true);
    setSubmitted(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSubmitted(false);
    setFormData({
      caseId: "",
      fieldToReschedule: "",
      newDate: "",
      newTime: "",
      reason: "",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
            <CalendarClock className="text-primary" size={36} />
            Reschedule Requests
          </h1>
          <p className="text-primary font-bold text-sm mt-1">
            View and manage appointment reschedule requests
          </p>
        </div>
        <button
          onClick={openModal}
          className="bg-primary hover:opacity-90 text-white font-black text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          New Request
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Case ID
                </th>
                <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Candidate
                </th>
                <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Field Changed
                </th>
                <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Old Value
                </th>
                <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  New Value
                </th>
                <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Reason
                </th>
                <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Created By
                </th>
                <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm font-bold text-gray-500">
                    No reschedule history found
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-secondary">
                      {item.case?.caseId || `#${item.caseId}`}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {item.case?.candidate
                        ? `${item.case.candidate.first_name} ${item.case.candidate.last_name}`
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {item.fieldName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(item.oldValue) || item.oldValue || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(item.newValue) || item.newValue || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {item.reason || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {item.createdBy
                        ? `${item.createdBy.first_name} ${item.createdBy.last_name}`
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-secondary">
                  New Reschedule Request
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 size={56} className="text-green-500 mb-4" />
                  <h3 className="text-2xl font-black text-secondary mb-2">
                    Request Submitted!
                  </h3>
                  <p className="text-sm font-bold text-gray-400 mb-6 text-center">
                    Your rescheduling request has been sent. You'll receive a
                    confirmation shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Case Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Select Case <span className="text-primary">*</span>
                    </label>
                    <select
                      value={formData.caseId}
                      onChange={handleInputChange}
                      name="caseId"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                    >
                      <option value="">Select a case...</option>
                      {cases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.caseId} - {c.candidate?.first_name} {c.candidate?.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Field to Reschedule */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Appointment Type <span className="text-primary">*</span>
                    </label>
                    <select
                      value={formData.fieldToReschedule}
                      onChange={handleInputChange}
                      name="fieldToReschedule"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                    >
                      <option value="">Select appointment type...</option>
                      <option value="targetSubmissionDate">Target Submission Date</option>
                      <option value="biometricsDate">Biometrics Date</option>
                      <option value="submissionDate">Submission Date</option>
                      <option value="decisionDate">Decision Date</option>
                    </select>
                  </div>

                  {/* New Appointment Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        New Appointment Date <span className="text-primary">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.newDate}
                        onChange={handleInputChange}
                        name="newDate"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        New Appointment Time <span className="text-primary">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.newTime}
                        onChange={handleInputChange}
                        name="newTime"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                      />
                    </div>
                  </div>

                  {/* Reason Textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <MessageSquare size={12} className="text-gray-300" />
                      Reason for Rescheduling <span className="text-primary">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Briefly explain why you need to reschedule..."
                      value={formData.reason}
                      onChange={handleInputChange}
                      name="reason"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 active:scale-95 text-white font-black text-sm px-8 py-3 rounded-full transition-all shadow-lg shadow-green-500/20 flex items-center gap-2"
                    >
                      Submit Request
                      <ArrowRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="border border-gray-200 hover:border-gray-300 text-gray-500 font-black text-sm px-6 py-3 rounded-full transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescheduleForm;
